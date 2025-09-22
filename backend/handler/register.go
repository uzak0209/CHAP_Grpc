package handler

import (
	"log"
	"net"

	"CHAP_Grpc/backend/api/pd"
	"CHAP_Grpc/backend/middleware"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

// RegisterAllServicesは全サービスをgRPCサーバーに登録します
func RegisterAllServices(grpcServer *grpc.Server) {
	// Auth service
	authHandler := NewAuthServer()
	pd.RegisterAuthServiceServer(grpcServer, authHandler)
	log.Println("AuthService registered")

	// User service
	userHandler := NewUserServer()
	pd.RegisterUserServiceServer(grpcServer, userHandler)
	log.Println("UserService registered")

	// Post service
	postHandler := &PostServer{}
	pd.RegisterPostServiceServer(grpcServer, postHandler)
	log.Println("PostService registered")

	// Comment service
	commentHandler := &CommentServer{}
	pd.RegisterCommentServiceServer(grpcServer, commentHandler)
	log.Println("CommentService registered")

	// Thread service
	threadHandler := &ThreadServer{}
	pd.RegisterThreadServiceServer(grpcServer, threadHandler)
	log.Println("ThreadService registered")
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
