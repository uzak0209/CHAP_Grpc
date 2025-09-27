import { postServiceCreatePost, postServiceGetPosts } from "@/api/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostServiceGetPostsParams } from "@/api/post.schemas.ts/postServiceGetPostsParams";
import type { V1GetPostsResponse } from "@/api/post.schemas.ts/v1GetPostsResponse";
import type { V1CreatePostRequest } from "@/api/post.schemas.ts/v1CreatePostRequest";

export function useGetPosts(params?: PostServiceGetPostsParams) {
  return useQuery<V1GetPostsResponse | undefined>({
    queryKey: ["posts", params ?? null],
    queryFn: async () => {
      const response = await postServiceGetPosts(params);
      return response.data;
    },
    enabled: !!params,
    staleTime: 1000 * 30, // キャッシュの有効期限を30秒に設定
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再フェッチを無効化
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: V1CreatePostRequest) => {
      const response = await postServiceCreatePost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
