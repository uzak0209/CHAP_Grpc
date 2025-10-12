import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authServiceSignIn,authServiceSignUp } from "@/api/auth";

export function useSignIn() {   
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { email: string; password: string }) => {
            const response = await authServiceSignIn(params);
            return response.data;
        },
        onSuccess: (data) => {
            // サインイン成功後にユーザーデータをキャッシュする
            queryClient.setQueryData(['/api/v1/users/me'], data);
        },
    });
}

export function useSignUp() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { email: string; password: string; name: string }) => {
            const response = await authServiceSignUp(params);
            return response.data;
        },
        onSuccess: (data) => {
            // サインアップ成功後にユーザーデータをキャッシュする
            queryClient.setQueryData(['/api/v1/users/me'], data);
        },
    });
}