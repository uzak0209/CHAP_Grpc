package handler

import (
	"context"
	"log"

	"CHAP_Grpc/backend/api/pd"
)

// CommentServerはCommentサービスの実装です。
type CommentServer struct {
	pd.UnimplementedCommentServiceServer
}

// 例: CreateCommentメソッドの実装
func (s *CommentServer) CreateComment(ctx context.Context, req *pd.CreateCommentRequest) (*pd.StandardResponse, error) {
	log.Println("CreateComment called")
	// TODO: 実際のコメント作成処理を実装
	return &pd.StandardResponse{}, nil
}

// 例: GetCommentsメソッドの実装
func (s *CommentServer) GetComments(ctx context.Context, req *pd.GetCommentsByThreadIDRequest) (*pd.GetCommentsByThreadIDResponse, error) {
	log.Println("GetComments called")
	// TODO: 実際のコメント取得処理を実装
	return &pd.GetCommentsByThreadIDResponse{}, nil
}

// 他のメソッドも同様に追加
