package handler

import (
	"context"
	"log"
	"time"

	"CHAP_Grpc/backend/api/pd"
	"CHAP_Grpc/backend/infra/model"
	"CHAP_Grpc/backend/infra/repository"
	"CHAP_Grpc/backend/utils"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type CommentServer struct {
	pd.UnimplementedCommentServiceServer
	commentRepo repository.CommentRepository
}

func NewCommentServer(commentRepo repository.CommentRepository) *CommentServer {
	return &CommentServer{
		commentRepo: commentRepo,
	}
}

func (s *CommentServer) CreateComment(ctx context.Context, req *pd.CreateCommentRequest) (*pd.StandardResponse, error) {
	log.Printf("CreateComment called with thread_id: %s", req.GetThreadId())

	// バリデーション
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "request is nil")
	}
	if req.GetThreadId() == "" {
		return &pd.StandardResponse{
			Success: false,
			Message: "thread_id is required",
		}, nil
	}
	if req.GetContent() == "" {
		return &pd.StandardResponse{
			Success: false,
			Message: "content is required",
		}, nil
	}

	// JWTからユーザーIDを取得
	userID, err := utils.ExtractUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// ThreadIDをUUIDにパース
	threadID, err := uuid.Parse(req.GetThreadId())
	if err != nil {
		return &pd.StandardResponse{
			Success: false,
			Message: "invalid thread_id format",
		}, nil
	}

	// UserIDをUUIDにパース
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return &pd.StandardResponse{
			Success: false,
			Message: "invalid user_id format",
		}, nil
	}

	// コメント作成
	comment := &model.CommentDBModel{
		ID:        uuid.New(),
		ThreadID:  threadID,
		UserID:    userUUID,
		Content:   req.GetContent(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		log.Printf("Failed to create comment: %v", err)
		return &pd.StandardResponse{
			Success: false,
			Message: "failed to create comment",
		}, nil
	}

	return &pd.StandardResponse{
		Success: true,
		Message: "comment created successfully",
	}, nil
}

func (s *CommentServer) GetCommentsByThreadID(ctx context.Context, req *pd.GetCommentsByThreadIDRequest) (*pd.GetCommentsByThreadIDResponse, error) {
	log.Printf("GetCommentsByThreadID called with thread_id: %s", req.GetThreadId())

	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "request is nil")
	}
	if req.GetThreadId() == "" {
		return nil, status.Error(codes.InvalidArgument, "thread_id is required")
	}

	// コメント取得
	comments, err := s.commentRepo.GetByThreadID(ctx, req.GetThreadId())
	if err != nil {
		log.Printf("Failed to get comments: %v", err)
		return nil, status.Error(codes.Internal, "failed to get comments")
	}

	// レスポンス作成
	responseComments := make([]*pd.Comment, len(comments))
	for i, comment := range comments {
		responseComments[i] = &pd.Comment{
			Id:        comment.ID.String(),
			ThreadId:  comment.ThreadID.String(),
			UserId:    comment.UserID.String(),
			Content:   comment.Content,
			CreatedAt: comment.CreatedAt.Format(time.RFC3339),
			UpdatedAt: comment.UpdatedAt.Format(time.RFC3339),
		}
	}

	return &pd.GetCommentsByThreadIDResponse{
		Comments: responseComments,
	}, nil
}
