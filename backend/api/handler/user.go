package handler

import (
	"context"
	"log"

	"CHAP_Grpc/backend/api/pd"
)

// UserServerはUserサービスの実装です。
type UserServer struct {
	pd.UnimplementedUserServiceServer
}

// 例: GetUserメソッドの実装
func (s *UserServer) GetUser(ctx context.Context, req *pd.GetUserByIDRequest) (*pd.GetUserByIDResponse, error) {
	log.Println("GetUser called")
	// TODO: 実際のユーザー取得処理を実装
	return &pd.GetUserByIDResponse{}, nil
}

// 他のメソッドも同様に追加
