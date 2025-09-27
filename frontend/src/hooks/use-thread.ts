import { postServiceCreatePost, postServiceGetPosts } from "@/api/post"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ThreadServiceGetThreadsParams} from "@/api/thread.schemas.ts";
import { threadServiceCreateThread, threadServiceGetThreads } from "@/api/thread";
import type { V1CreateCommentRequest } from "@/api/comment.schemas.ts";

export function useGetThreads(params?: ThreadServiceGetThreadsParams) {
  return useQuery({
    queryKey: ["threads", params ?? null], // params を queryKey に含める
    queryFn: async () => {
      const response = await threadServiceGetThreads(params); // params をリクエストに渡す
      return response.data;
    },
    enabled: !!params,
    staleTime: 1000 * 30, // キャッシュの有効期限を5分に設定
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再フェッチを無効化
  });
}

export function useCreateThreads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: V1CreateCommentRequest) => {
      const response = await threadServiceCreateThread(data as any);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
