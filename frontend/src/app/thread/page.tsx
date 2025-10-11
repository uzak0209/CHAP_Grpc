"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// FloatingActionButton not used in this page
import { MessageCircle, Users, Heart } from "lucide-react";

import { useGetThreads } from "@/hooks/use-thread";
import { useLocationStore, captureCurrentLocation } from "@/store/useLocation";
import type { V1Thread } from "@/api/thread.schemas.ts/v1Thread";
import "../../api/axios";
// スレッドカードコンポーネント
const ThreadCard = ({ thread }: { thread: V1Thread }) => {
  const router = useRouter();

  return (
    <Card className="w-full transition-all hover:shadow-md hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{thread.content}</CardTitle>
        <CardDescription className="flex items-center text-sm text-gray-500 pt-2">
          <Users className="w-4 h-4 mr-2" />
          <span>作成者: {thread.userName ?? thread.userId ?? 'unknown'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-3 text-gray-600" />
          <div>
            <p className="font-semibold">作成日時</p>
            <p>{new Date(thread.createdAt ?? '').toLocaleString()}</p>
          </div>
        </div>
        {/* tags not available on V1Thread */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span className="text-sm text-gray-500">{thread.likeCount ?? 0} </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/thread/${thread.id}`)}
          >
            詳細を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ThreadsPage() {
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const router = useRouter();

  const currentLocation = useLocationStore((s) => s.currentLocation);
  const locationParams = currentLocation && currentLocation.isSome && currentLocation.isSome()
    ? { lat: currentLocation.unwrap().lat, lng: currentLocation.unwrap().lng }
    : undefined;

  useEffect(() => {
    // currentLocation が未設定なら位置情報取得をトリガーする
    const hasLoc = currentLocation && currentLocation.isSome && currentLocation.isSome();
    if (!hasLoc) {
      captureCurrentLocation().catch(() => {
        /* ignore errors here; UI will show appropriate message if needed */
      });
    }
  }, [currentLocation]);

  const threadsQuery = useGetThreads(locationParams);

  const threads = threadsQuery.data?.threads ?? [];
  const loading = threadsQuery.isLoading;
  const fetchError = threadsQuery.isError ? threadsQuery.error : undefined;

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      if (sortBy === 'time') {
      return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
      }
      // TODO: distance sort
      return 0;
    });
  }, [threads, sortBy]);

  const renderContent = () => {
    if (!locationParams) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Skeleton className="w-12 h-12 rounded-full" />
            <p className="mt-4 text-lg text-gray-600">位置情報を取得しています...</p>
          </div>
        );
      }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Skeleton className="w-12 h-12 rounded-full" />
          <p className="mt-4 text-lg text-gray-600">近くのスレッドを探しています...</p>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">スレッドの読み込みに失敗しました</p>
          <Button onClick={() => threadsQuery.refetch()}>再試行</Button>
        </div>
      );
    }

    if (sortedThreads.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">近くで開始されているスレッドはありません。</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedThreads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">近くのスレッド</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/threads/create')}>スレッドを作成</Button>
            <Select onValueChange={(value: 'time' | 'distance') => setSortBy(value)} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">新着順</SelectItem>
                <SelectItem value="distance">距離順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        
        <main>
          {renderContent()}
        </main>
      </div>
  );
}
