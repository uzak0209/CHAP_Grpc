import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { spotServiceCreateSpot, spotServiceGetSpots } from '@/api/spot'
import type { V1CreateSpotRequest, V1GetSpotsResponse } from '@/api/spot.schemas.ts'

export function useCreateSpot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: V1CreateSpotRequest) => {
      const res = await spotServiceCreateSpot(data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] })
    },
  })
}

export function useGetSpots() {
  return useQuery<V1GetSpotsResponse>({
    queryKey: ["spots"], // params を queryKey に含める
    queryFn: async () => {
      const response = await spotServiceGetSpots({}); // params をリクエストに渡す
      return response.data;
    },
    staleTime: 1000 * 30, // キャッシュの有効期限を5分に設定
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再フェッチを無効化
  });
}