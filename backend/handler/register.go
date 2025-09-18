package handler

import (
	"log"
	"net"

	"CHAP_Grpc/backend/api/pd"

	"google.golang.org/grpc"
)

// RegisterAllServicesは全サービスをgRPCサーバーに登録します
func RegisterAllServices(grpcServer *grpc.Server) {
	// Auth service
	authHandler := &AuthServer{}
	pd.RegisterAuthServiceServer(grpcServer, authHandler)
	log.Println("AuthService registered")

	// User service
	userHandler := &UserServer{}
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

	grpcServer := grpc.NewServer()
	RegisterAllServices(grpcServer)

	log.Println("gRPC server listening on :50051")
	return grpcServer.Serve(lis)
}
