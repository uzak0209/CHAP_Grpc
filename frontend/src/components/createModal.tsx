"use client";

import {
  useState,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Hash, Calendar } from "lucide-react";
import { Category, CATEGORY_OPTIONS, ContentType } from "@/types/types";
import type { Coordinate } from "@/types/types";
import { useLocation, useLocationStore } from "@/store/useLocation";
import { useCreateSpot } from "@/hooks/use-spot";
import { useCreateEvent } from "@/hooks/use-event";
import { useCreateThreads } from "@/hooks/use-thread";
import { postServiceCreatePost } from "@/api/post";
import { eventServiceCreateEvent } from "@/api/event";
import { threadServiceCreateThread } from "@/api/thread";
import type { V1CreateCommentRequest } from "@/api/comment.schemas.ts";
import type { V1CreatePostRequest } from "@/api/post.schemas.ts";
import type { V1CreateEventRequest } from "@/api/event.schemas.ts";
import type { V1CreateThreadRequest } from "@/api/thread.schemas.ts";
import { useCreatePost } from "@/hooks/use-post";
import { uploadImage, useGetUploadUrl } from "@/hooks/use-image";
interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
}

export function CreateModal({
  isOpen,
  onClose,
  contentType,
}: CreateModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [eventDate, setEventDate] = useState(""); // イベント開始日の状態
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  // React Query mutations (call hooks at top level)
  const createPostMutation = useCreatePost();
  const createEventMutation = useCreateEvent();
  const createThreadMutation = useCreateThreads();
  const createSpotMutation = useCreateSpot();
  const getUploadURLMutation = useGetUploadUrl();

  // モーダルが開くたびにフォームをリセットする
  useEffect(() => {
    if (isOpen) {
      setContent("");
      setCategory("");
      setTags([]);
      setTagInput("");
      setEventDate("");
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
    }
  }, [isOpen]);

  // 現在時刻を取得してdatetime-local形式にフォーマット
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    // タイムゾーンオフセットを考慮
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 16);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // eventの場合は開始日も必須
    if (contentType === "event" && !eventDate) {
      alert("イベント開始日を入力してください");
      return;
    }

    setLoading(true);
    try {
      const effectiveCategory: Category =
        (category as Category) || "entertainment";
      const allTags = [
        effectiveCategory,
        ...tags.filter((t) => t !== effectiveCategory),
      ];

      // 画像が選択されていればR2にアップロードする
      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        try {
          // プレサインドURL取得
          const upLoadUrl = await getUploadURLMutation.mutateAsync({
            filename: imageFile.name,
          });
          console.log("Obtained upload URL:", upLoadUrl);

          if (typeof upLoadUrl.imageUrl === "string" && upLoadUrl.imageUrl) {
            // 画像を直接PUT（FormDataは使わない）
            const uploadResponse = await fetch(upLoadUrl.imageUrl, {
              method: "PUT",
              headers: {
                "Content-Type": imageFile.type || "image/jpeg",
              },
              body: imageFile, // ファイル直接、FormDataではない
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Image upload failed with status ${uploadResponse.status}`
              );
            }

            console.log("Image successfully uploaded");
            // アップロード後の画像URLを構築（通常はプレサインドURLからクエリパラメータを除いたもの）
            const uploadedUrl = new URL(upLoadUrl.imageUrl);
            uploadedImageUrl = `${uploadedUrl.protocol}//${uploadedUrl.host}${uploadedUrl.pathname}`;
          } else {
            throw new Error("Upload URL is invalid or undefined.");
          }
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("画像のアップロードに失敗しました。もう一度お試しください。");
          setLoading(false);
          return;
        }
      }

      interface BaseData {
        content: string;
        category: Category;
        coordinate: Coordinate | undefined;
        image: string;
      }

      const baseData: BaseData = {
        content,
        category: effectiveCategory,
        coordinate: currentLocation.isSome()
          ? (currentLocation.unwrap() as Coordinate)
          : undefined,
        image: uploadedImageUrl || "",
      };

      // small jitter for privacy/non-disaster posts: shift coordinates by up to ~50 meters
      const jitterCoordinate = (c: Coordinate, maxMeters = 50): Coordinate => {
        // 1 deg latitude ~= 111320 meters
        const metersToDegLat = (m: number) => m / 3112;
        const metersToDegLng = (m: number, lat: number) =>
          m / (3112 * Math.cos((lat * Math.PI) / 180));

        const rand = () => (Math.random() - 0.5) * 2; // -1 .. 1
        const latOffset = metersToDegLat(rand() * maxMeters);
        const lngOffset = metersToDegLng(rand() * maxMeters, c.lat);

        return { lat: c.lat + latOffset, lng: c.lng + lngOffset } as Coordinate;
      };

      const effectiveCoordinate: Coordinate | undefined = baseData.coordinate
        ? effectiveCategory !== "disaster"
          ? jitterCoordinate(baseData.coordinate)
          : baseData.coordinate
        : undefined;

      switch (contentType) {
        case "thread": {
          // build payload for thread creation
          const payload = {
            content: baseData.content,
            image: baseData.image,
            lat: effectiveCoordinate?.lat,
            lng: effectiveCoordinate?.lng,
            contentType: category,
          } as V1CreateThreadRequest;

          await createThreadMutation.mutateAsync(payload);
          break;
        }
        case "post": {
          const payload = {
            content: baseData.content,
            image: baseData.image,
            lat: effectiveCoordinate?.lat,
            lng: effectiveCoordinate?.lng,
            contentType: category,
          } as V1CreatePostRequest;

          await createPostMutation.mutateAsync(payload);
          break;
        }
        case "event": {
          // datetime-local形式の文字列をDateオブジェクトに変換
          const eventDateTime = new Date(eventDate);
          const payload = {
            content: baseData.content,
            image: baseData.image,
            lat: effectiveCoordinate?.lat,
            lng: effectiveCoordinate?.lng,
            eventDate: eventDateTime.toISOString(),
            contentType: category,
          } as V1CreateEventRequest;

          await createEventMutation.mutateAsync(payload);
          break;
        }
        case "spot": {
          // For spot, use the viewCenter (always-updated map center) if available, otherwise fall back to currentLocation
          const viewCenter = useLocationStore.getState().viewCenter;
          const coord =
            viewCenter && viewCenter.isSome && viewCenter.isSome()
              ? viewCenter.unwrap()
              : baseData.coordinate;

          const payload = {
            title: content.slice(0, 64),
            description: content,
            image: baseData.image, // 一貫してbaseData.imageを使用
            lat: coord?.lat,
            lng: coord?.lng,
          } as V1CreatePostRequest & { title?: string };

          // call spot create mutation
          await createSpotMutation.mutateAsync(payload as any);
          break;
        }
      }

      // POST成功後の追加処理：必要に応じてここに再取得ロジックを追加してください

      // フォームをリセット
      setContent("");
      setCategory("");
      setTags([]);
      setTagInput("");
      setEventDate("");

      onClose();
    } catch (error) {
      console.error("Content submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>新しい{contentType}を作成</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Textarea
              id="content"
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              className="min-h-[100px] resize-none"
              maxLength={280}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/280
            </div>
          </div>

          {/* イベント開始日入力（eventの場合のみ表示） */}
          {contentType === "event" && (
            <div>
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                イベント開始日時 *
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEventDate(e.target.value)
                }
                min={getCurrentDateTimeLocal()} // 現在時刻以降のみ選択可能
                step="60" // 1分単位で選択可能
                className="mt-1"
                placeholder="日時を選択してください"
              />
              {eventDate && (
                <div className="text-sm text-gray-500 mt-1">
                  選択された日時: {new Date(eventDate).toLocaleString("ja-JP")}
                </div>
              )}
            </div>
          )}

          {/* 画像選択 */}
          <div>
            <Label htmlFor="image">画像 (任意)</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files && e.target.files[0];
                if (f) {
                  setImageFile(f);
                  const url = URL.createObjectURL(f);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(url);
                }
              }}
              className="mt-1"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="preview" className="max-h-40" />
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setImageFile(null);
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                    }}
                  >
                    削除
                  </Button>
                </div>
              </div>
            )}
          </div>

          {contentType !== "spot" && (
            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={category}
                onValueChange={(value: Category) => setCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="なし" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg shadow-black/10 backdrop-blur-none">
                  {/* categoryOptions がプロジェクト内に定義されていない場合は簡易的に候補を表示 */}
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-blue-600 focus:text-white hover:bg-blue-50 aria-selected:bg-blue-600 aria-selected:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !content.trim() ||
                loading ||
                (contentType === "event" && !eventDate) ||
                (category == "" && contentType !== "spot")
              }
              className="flex-1"
            >
              {loading ? "作成中..." : `${contentType}作成`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
