import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { V1GetThreadsRequest} from "@/api/thread.schemas.ts";
import type { V1GetThreadsResponse } from "@/api/thread.schemas.ts/v1GetThreadsResponse";
import { threadServiceCreateThread, threadServiceGetThreads } from "@/api/thread";
import type { V1CreateThreadRequest } from "@/api/thread.schemas.ts";

export function useGetThreads(params: V1GetThreadsRequest) {
  return useQuery<V1GetThreadsResponse | undefined>({
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
    mutationFn: async (data?: V1CreateThreadRequest) => {
      const response = await threadServiceCreateThread(data as any);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
