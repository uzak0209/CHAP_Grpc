package handler

import (
	pd "CHAP_Grpc/backend/api/pd"
	"CHAP_Grpc/backend/infra/model"
	"CHAP_Grpc/backend/infra/repository"
	context "context"
	"log"

	"github.com/google/uuid"
)

// AuthServerはAuthサービスの実装です。
type AuthServer struct {
	pd.UnimplementedAuthServiceServer
	authRepo repository.AuthRepository
	userRepo repository.UserRepository
}

func NewAuthServer() *AuthServer {
	return &AuthServer{
		authRepo: repository.NewAuthRepository(),
		userRepo: *repository.NewUserRepository(),
	}
}

// 例: Loginメソッドの実装
func (s *AuthServer) Login(ctx context.Context, req *pd.SignInRequest) (*pd.SignInResponse, error) {
	log.Println("Login called")

	// リポジトリからユーザー情報を取得
	auth, err := s.authRepo.GetAuthByEmail(req.Email)
	if err != nil {
		log.Printf("Login error: %v", err)
		return &pd.SignInResponse{Success: false}, nil
	}

	// パスワード検証（実際はハッシュ化されたパスワードとの比較）
	if auth.Password != req.Password {
		log.Println("Invalid password")
		return &pd.SignInResponse{Success: false}, nil
	}

	return &pd.SignInResponse{Success: true}, nil
}

func (s *AuthServer) SignUp(ctx context.Context, req *pd.SignUpRequest) (*pd.SignInResponse, error) {
	log.Println("SignUp called")

	// まず新しいユーザーを作成
	user := &model.UserDBModel{
		ID:    uuid.New(), // UUIDを生成
		Name:  req.Email,  // Emailをnameとして使用（必要に応じて変更）
		Valid: true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		log.Printf("SignUp - CreateUser error: %v", err)
		return &pd.SignInResponse{Success: false}, nil
	}

	// 次に認証情報を作成
	auth := &model.AuthDBModel{
		UserID:   user.ID, // 作成されたユーザーのIDを使用
		Email:    req.Email,
		Password: req.Password, // 実際はハッシュ化が必要
		Valid:    true,
	}

	if err := s.authRepo.CreateAuth(auth); err != nil {
		log.Printf("SignUp - CreateAuth error: %v", err)
		return &pd.SignInResponse{Success: false}, nil
	}

	return &pd.SignInResponse{Success: true}, nil
}
