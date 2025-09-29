import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotServiceCreateSpot } from '@/api/spot'
import type { V1CreateSpotRequest } from '@/api/spot.schemas.ts'

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
