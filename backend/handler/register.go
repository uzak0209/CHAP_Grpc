package handler

import (
	"log"
	"net"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/repository"
	"github.com/uzak0209/CHAP_Grpc/backend/middleware"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

// RegisterAllServicesは全サービスをgRPCサーバーに登録します
func RegisterAllServices(grpcServer *grpc.Server) {
	// Initialize repositories (use constructors when available)
	userRepoPtr := repository.NewUserRepository()
	postRepo := repository.PostRepository{}
	commentRepo := repository.NewCommentRepository()
	threadRepo := repository.ThreadRepository{}
	eventRepo := repository.EventRepository{}

	// Auth service (constructor handles repos internally)
	authHandler := NewAuthServer()
	pd.RegisterAuthServiceServer(grpcServer, authHandler)
	log.Println("AuthService registered")

	// User service
	userHandler := NewUserServer()
	pd.RegisterUserServiceServer(grpcServer, userHandler)
	log.Println("UserService registered")

	// Post service
	postHandler := NewPostServer(postRepo, *userRepoPtr)
	pd.RegisterPostServiceServer(grpcServer, postHandler)
	log.Println("PostService registered")

	// Comment service
	commentHandler := NewCommentServer(commentRepo)
	pd.RegisterCommentServiceServer(grpcServer, commentHandler)
	log.Println("CommentService registered")

	// Thread service
	threadHandler := NewThreadServer(threadRepo, commentRepo, *userRepoPtr)
	pd.RegisterThreadServiceServer(grpcServer, threadHandler)
	log.Println("ThreadService registered")

	// Event service
	eventHandler := NewEventServer(eventRepo, *userRepoPtr)
	pd.RegisterEventServiceServer(grpcServer, eventHandler)
	log.Println("EventService registered")
}

// StartServerはgRPCサーバーを起動します
func StartServer() error {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		return err
	}

	// 認証ミドルウェアを追加
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(middleware.AuthInterceptor),
	)
	RegisterAllServices(grpcServer)

	// リフレクションを有効にする
	reflection.Register(grpcServer)

	log.Println("gRPC server listening on :50051")
	return grpcServer.Serve(lis)
}
