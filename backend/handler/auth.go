package handler

import (
	context "context"
	"log"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/repository"
	"github.com/uzak0209/CHAP_Grpc/backend/utils"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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
func (s *AuthServer) SignIn(ctx context.Context, req *pd.SignInRequest) (*pd.AuthResponse, error) {
	log.Println("Login called")

	// リポジトリからユーザー情報を取得
	auth, err := s.authRepo.GetAuthByEmail(req.Email)
	if err != nil {
		// avoid leaking whether the user exists; return unauthenticated for invalid credentials
		log.Printf("SignIn - lookup error: %v", err)
		return nil, status.Error(codes.Unauthenticated, "invalid credentials")
	}

	// パスワード検証（実際はハッシュ化されたパスワードとの比較）
	if auth.Password != req.Password {
		log.Println("SignIn - invalid password")
		return nil, status.Error(codes.Unauthenticated, "invalid credentials")
	}

	// JWT トークンを生成
	token, err := utils.GenerateJWT(auth.UserID.String())
	if err != nil {
		log.Printf("SignIn - JWT generation error: %v", err)
		return nil, status.Error(codes.Internal, "failed to generate token")
	}

	return &pd.AuthResponse{
		Success: true,
		Token:   token,
	}, nil
}

func (s *AuthServer) SignUp(ctx context.Context, req *pd.SignUpRequest) (*pd.AuthResponse, error) {
	log.Println("SignUp called")

	// まず新しいユーザーを作成
	user := &model.UserDBModel{
		ID:    uuid.New(), // UUIDを生成
		Name:  req.Name,   // Emailをnameとして使用（必要に応じて変更）
		Valid: true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		log.Printf("SignUp - CreateUser error: %v", err)
		return nil, status.Error(codes.Internal, "failed to create user")
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
		return nil, status.Error(codes.Internal, "failed to create auth record")
	}

	// JWT トークンを生成
	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		log.Printf("SignUp - JWT generation error: %v", err)
		return nil, status.Error(codes.Internal, "failed to generate token")
	}

	return &pd.AuthResponse{
		Success: true,
		Token:   token,
	}, nil
}
