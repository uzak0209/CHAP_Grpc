package middleware

import (
	"CHAP_Grpc/backend/utils"
	"context"
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AuthInterceptor はJWT認証を行うgRPCインターセプター
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	// 認証が不要なメソッドのリスト
	publicMethods := map[string]bool{
		"/chap.auth.v1.AuthService/SignIn":          true,
		"/chap.auth.v1.AuthService/SignUp":          true,
		"/grpc.reflection.v1.ServerReflection":      true,
		"/grpc.reflection.v1alpha.ServerReflection": true,
	}

	// パブリックメソッドの場合は認証をスキップ
	if publicMethods[info.FullMethod] {
		return handler(ctx, req)
	}

	// JWTトークンからユーザーIDを抽出
	userID, err := utils.ExtractUserIDFromContext(ctx)
	if err != nil {
		log.Printf("Authentication failed for %s: %v", info.FullMethod, err)
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// コンテキストにユーザーIDを設定
	ctx = context.WithValue(ctx, "user_id", userID)

	// 次のハンドラーを呼び出し
	return handler(ctx, req)
}

// GetUserIDFromContext はコンテキストからユーザーIDを取得
func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value("user_id").(string)
	return userID, ok
}
