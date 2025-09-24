package middleware

import (
	"context"
	"log"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
)

func StartGateway(grpcEndpoint string, gatewayAddr string) error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	log.Printf("Connecting to gRPC server at %s", grpcEndpoint)

	// gRPCサーバーへの接続
	conn, err := grpc.DialContext(
		ctx,
		grpcEndpoint,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err != nil {
		log.Printf("Failed to connect to gRPC server: %v", err)
		return err
	}
	defer conn.Close()

	log.Println("Connected to gRPC server successfully")

	// gRPC-Gatewayのマルチプレクサーを作成
	mux := runtime.NewServeMux()

	// 全サービスのハンドラーを登録
	if err := pd.RegisterAuthServiceHandler(ctx, mux, conn); err != nil {
		log.Printf("Failed to register AuthService: %v", err)
		return err
	}
	if err := pd.RegisterUserServiceHandler(ctx, mux, conn); err != nil {
		log.Printf("Failed to register UserService: %v", err)
		return err
	}
	if err := pd.RegisterPostServiceHandler(ctx, mux, conn); err != nil {
		log.Printf("Failed to register PostService: %v", err)
		return err
	}
	if err := pd.RegisterCommentServiceHandler(ctx, mux, conn); err != nil {
		log.Printf("Failed to register CommentService: %v", err)
		return err
	}
	if err := pd.RegisterThreadServiceHandler(ctx, mux, conn); err != nil {
		log.Printf("Failed to register ThreadService: %v", err)
		return err
	}

	log.Printf("gRPC-Gateway server starting on %s", gatewayAddr)

	// HTTPサーバーを開始
	return http.ListenAndServe(gatewayAddr, allowCORS(mux))
}
func allowCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}
