'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, ChevronRight, Heart, MessageCircle, MapPin } from 'lucide-react';
import "../../../api/axios"

import { threadServiceGetThreadsByID } from "@/api/thread";
import { useCommentServiceGetCommentsByThreadID, useCommentServiceCreateComment } from "@/api/comment";
import type { V1Thread } from "@/api/thread.schemas.ts/v1Thread";
import type { V1GetCommentsByThreadIDResponse } from "@/api/comment.schemas.ts/v1GetCommentsByThreadIDResponse";
import type { V1CreateCommentRequest } from '@/api/comment.schemas.ts';



const ThreadResponse = ({
  number,
  content,
  userName,
  createdTime,
  isOP = false,
}: {
  number: number;
  content: string;
  userName: string;
  createdTime: string;
  isOP?: boolean;
}) => (
  <div className="border-b border-gray-200 py-3 hover:bg-gray-50">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <span
          className={`inline-block px-2 py-1 text-xs font-mono rounded ${
            isOP ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {number}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="font-mono">{isOP ? "★" + userName : userName}</span>
          <span>{new Date(createdTime).toLocaleString("ja-JP")}</span>
          {isOP && <span className="text-red-600 font-bold">[スレ主]</span>}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  </div>
);

const ThreadHeader = ({ thread, replyCount }: { thread: V1Thread; replyCount: number }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <h1 className="text-lg font-bold text-blue-900 mb-2">{thread.content}</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        <span>レス数: {replyCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-3 h-3" />
        <span>{thread.likeCount ?? 0}</span>
      </div>
    </div>
  </div>
);

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params?.id as string;

  // use orval hooks
  const commentsQuery = useCommentServiceGetCommentsByThreadID(threadId);
  const createCommentMutation = useCommentServiceCreateComment();

  const [newResponse, setNewResponse] = useState("");
  const [posting, setPosting] = useState(false);

  const [thread, setThread] = useState<V1Thread | undefined>(undefined);
  // commentsQuery.data is an AxiosResponse<V1GetCommentsByThreadIDResponse>
  const replies = (commentsQuery.data && (commentsQuery.data as any).data?.comments) as any[] | undefined;
  // debug: log raw response when replies are missing
  if (!replies) {
    // eslint-disable-next-line no-console
    console.debug('commentsQuery raw:', commentsQuery.data);
  }

  const handlePostResponse = async () => {
    if (!newResponse.trim()) return;
    setPosting(true);
    try {
      await createCommentMutation.mutateAsync({
        data: {
          content: newResponse,
          threadId,
          valid: true,
          likeCount: 0,
        } as V1CreateCommentRequest,
      });
      // refetch comments
      await commentsQuery.refetch();
      setNewResponse("");

    } catch (error) {
      console.error("Failed to post response:", error);
      alert("レスの投稿に失敗しました: " + String(error));
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    let mounted = true;


    (async () => {

      try {
        const res = await threadServiceGetThreadsByID(threadId);
        if (!mounted) return;
        setThread((res.data as any).thread as V1Thread);
      } catch (err) {
        console.error("Failed to fetch thread by id:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [threadId]);

  if (!thread) {
    return (

        <div className="p-4 max-w-4xl mx-auto">
          <div className="text-center text-gray-500 mt-8">
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </div>
        </div>
 
    );
  }

  return (

      <div className="p-4 max-w-4xl mx-auto">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <ThreadHeader thread={thread} replyCount={(replies ?? []).length} />

        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-sm font-bold text-gray-700">レス一覧 ({(replies ?? []).length + 1}件)</h2>
            </div>
            <div className="divide-y">
              <ThreadResponse number={1} content={thread.content ?? ""} userName={thread.userName ?? ""} createdTime={thread.createdAt ?? new Date().toISOString()} isOP={true} />
              {(replies ?? []).map((reply: any, index: number) => (
                <ThreadResponse key={reply.id} number={index + 2} content={reply.content} userName={reply.userName} createdTime={reply.createdAt} />
              ))}
              {(replies ?? []).length === 0 && (
                <div className="p-4 text-center text-gray-500">まだレスがありません。最初のレスを投稿してみましょう！</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-4">レスを書く</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">内容 *</label>
                <Textarea value={newResponse} onChange={(e) => setNewResponse(e.target.value)} placeholder="レスを入力してください..." className="min-h-24" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePostResponse} disabled={!newResponse.trim() || posting} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {posting ? "投稿中..." : "投稿する"}
                </Button>
                <Button variant="outline" onClick={() => { setNewResponse(""); }}>クリア</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

  );
}
                