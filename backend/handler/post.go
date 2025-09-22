package handler

import (
	"context"
	"log"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
)

// PostServerはPostサービスの実装です。
type PostServer struct {
	pd.UnimplementedPostServiceServer
}

// 例: CreatePostメソッドの実装
func (s *PostServer) CreatePost(ctx context.Context, req *pd.CreatePostRequest) (*pd.StandardResponse, error) {
	log.Println("CreatePost called")
	// TODO: 実際の投稿作成処理を実装
	return &pd.StandardResponse{}, nil
}

// 例: GetPostメソッドの実装
func (s *PostServer) GetPosts(ctx context.Context, req *pd.GetPostsRequest) (*pd.GetPostsResponse, error) {
	log.Println("GetPosts called")
	// TODO: 実際の投稿取得処理を実装
	return &pd.GetPostsResponse{}, nil
}

// 他のメソッドも同様に追加
