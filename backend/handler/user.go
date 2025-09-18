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

func (s *UserServer) EditUser(ctx context.Context, req *pd.EditUserRequest) (*pd.StandardResponse, error) {
	log.Println("EditUser called")
	// TODO: 実際のユーザー編集処理を実装
	return &pd.StandardResponse{}, nil
}

func (s *UserServer) DeleteUser(ctx context.Context, req *pd.DeleteUserRequest) (*pd.StandardResponse, error) {
	log.Println("DeleteUser called")
	// TODO: 実際のユーザー削除処理を実装
	return &pd.StandardResponse{}, nil
}

func (s *UserServer) CreateUser(ctx context.Context, req *pd.CreateUserRequest) (*pd.StandardResponse, error) {
	log.Println("CreateUser called")
	// TODO: 実際のユーザー作成処理を実装
	return &pd.StandardResponse{}, nil
}

func (s *UserServer) FollowUser(ctx context.Context, req *pd.FollowUserRequest) (*pd.StandardResponse, error) {
	log.Println("FollowUser called")
	// TODO: 実際のユーザーフォロー処理を実装
	return &pd.StandardResponse{}, nil
}
func (s *UserServer) UnfollowUser(ctx context.Context, req *pd.UnfollowUserRequest) (*pd.StandardResponse, error) {
	log.Println("UnfollowUser called")
	// TODO: 実際のユーザーアンフォロー処理を実装
	return &pd.StandardResponse{}, nil
}
