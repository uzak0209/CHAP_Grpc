package handler

import (
	"context"
	"log"

	"CHAP_Grpc/backend/api/pd"
)

// ThreadServerはThreadサービスの実装です。
type ThreadServer struct {
	pd.UnimplementedThreadServiceServer
}

// 例: CreateThreadメソッドの実装
func (s *ThreadServer) CreateThread(ctx context.Context, req *pd.CreateThreadRequest) (*pd.StandardResponse, error) {
	log.Println("CreateThread called")
	// TODO: 実際のスレッド作成処理を実装
	return &pd.StandardResponse{}, nil
}

// 例: GetThreadsメソッドの実装
func (s *ThreadServer) GetThreads(ctx context.Context, req *pd.GetThreadsRequest) (*pd.GetThreadsResponse, error) {
	log.Println("GetThreads called")
	// TODO: 実際のスレッド取得処理を実装
	return &pd.GetThreadsResponse{}, nil
}

// 他のメソッドも同様に追加
