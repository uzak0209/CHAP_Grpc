import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventServiceCreateEvent, eventServiceGetEvents } from "@/api/event";
import type { V1GetEventsRequest } from "@/api/event.schemas.ts";
import type { V1GetEventsResponse } from "@/api/event.schemas.ts/v1GetEventsResponse";
import type { V1CreateEventRequest } from "@/api/event.schemas.ts";

export function useGetEvents(params: V1GetEventsRequest) {
  return useQuery<V1GetEventsResponse | undefined>({
    queryKey: ["events", params ?? null],
    queryFn: async () => {
      const response = await eventServiceGetEvents(params);
      return response.data;
    },
    enabled: !!params,
    staleTime: 1000 * 30, // キャッシュの有効期限を30秒に設定
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再フェッチを無効化
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: V1CreateEventRequest) => {
      const response = await eventServiceCreateEvent(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}