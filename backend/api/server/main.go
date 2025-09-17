package main

import (
	"log"
	"net"

	"google.golang.org/grpc"
	// 生成されたprotoのパッケージをインポート（例）
	// "CHAP_Grpc/backend/api/generated/auth"
)

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()

	// ここで各サービスを登録
	// 例: auth.RegisterAuthServiceServer(grpcServer, &authServer{})

	log.Println("gRPC server listening on :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

// サービスの実装例
// type authServer struct {
// 	auth.UnimplementedAuthServiceServer
// }
