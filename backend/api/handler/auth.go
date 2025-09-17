package handler

import (
	pd "CHAP_Grpc/backend/api/pd"
	context "context"
	"log"
)

// AuthServerはAuthサービスの実装です。
type AuthServer struct {
	pd.UnimplementedAuthServiceServer
}

// 例: Loginメソッドの実装
func (s *AuthServer) Login(ctx context.Context, req *pd.SignInRequest) (*pd.SignInResponse, error) {
	log.Println("Login called")
	// TODO: 実際の認証処理を実装
	return &pd.SignInResponse{Success: true}, nil
}

func (s *AuthServer) SignUp(ctx context.Context, req *pd.SignUpRequest) (*pd.SignInResponse, error) {
	log.Println("SignUp called")
	// TODO: 実際のユーザー登録処理を実装
	return &pd.SignInResponse{Success: true}, nil
}
