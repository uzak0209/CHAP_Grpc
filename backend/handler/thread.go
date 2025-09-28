package handler

import (
	"context"
	"log"
	"time"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/repository"
	"github.com/uzak0209/CHAP_Grpc/backend/utils"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ThreadServerはThreadサービスの実装です。
type ThreadServer struct {
	pd.UnimplementedThreadServiceServer
	threadRepo  repository.ThreadRepository
	commentRepo repository.CommentRepository
	userRepo    repository.UserRepository // Add user repository
}

func NewThreadServer(threadRepo repository.ThreadRepository, commentRepo repository.CommentRepository, userRepo repository.UserRepository) *ThreadServer {
	return &ThreadServer{threadRepo: threadRepo, commentRepo: commentRepo, userRepo: userRepo}
}

// 例: CreateThreadメソッドの実装
func (s *ThreadServer) CreateThread(ctx context.Context, req *pd.CreateThreadRequest) (*pd.StandardResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "request is nil")
	}

	userID, err := utils.ExtractUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user ID format")
	}

	// Fetch username and image from user repository
	user, err := s.userRepo.GetByID(ctx, parsedUserID.String()) // Convert UUID to string
	if err != nil {
		log.Printf("Failed to fetch user details: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to fetch user details"}, nil
	}

	thread := &model.ThreadDBModel{
		ID:          uuid.New(),
		UserID:      parsedUserID,
		UserName:    user.Name,  // Corrected field name
		UserImage:   user.Image, // Add user image
		Content:     req.GetContent(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ContentType: req.GetContentType(),
		Lat:         req.GetLat(),
		Lng:         req.GetLng(),
	}

	if err := s.threadRepo.Create(ctx, thread); err != nil {
		log.Printf("Failed to create thread: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to create thread"}, nil
	}

	return &pd.StandardResponse{Success: true, Message: "thread created successfully"}, nil
}

// 例: GetThreadsメソッドの実装
func (s *ThreadServer) GetThreads(ctx context.Context, req *pd.GetThreadsRequest) (*pd.GetThreadsResponse, error) {
	log.Println("GetThreads called")

	threads, err := s.threadRepo.GetThreads(ctx, req.Lat, req.Lng)
	if err != nil {
		log.Printf("Failed to get threads: %v", err)
		return nil, status.Error(codes.Internal, "failed to get threads")
	}

	responseThreads := make([]*pd.Thread, len(threads))
	for i, thread := range threads {
		responseThreads[i] = &pd.Thread{
			Id:          thread.ID.String(),
			UserId:      thread.UserID.String(),
			UserImage:   thread.UserImage,
			LikeCount:   thread.LikeCount,
			UserName:    thread.UserName,
			Content:     thread.Content,
			CreatedAt:   thread.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   thread.UpdatedAt.Format(time.RFC3339),
			Lat:         thread.Lat,
			Lng:         thread.Lng,
			ContentType: thread.ContentType,
		}
	}

	return &pd.GetThreadsResponse{
		Threads: responseThreads,
	}, nil
}

// 他のメソッドも同様に追加
func (s *ThreadServer) GetThreadsByID(ctx context.Context, req *pd.GetThreadByIDRequest) (*pd.GetThreadByIDResponse, error) {
	if req == nil || req.ThreadId == "" {
		return nil, status.Error(codes.InvalidArgument, "thread id is required")
	}
	log.Print("GetThreadByID called with ThreadId: ", req.ThreadId)
	thread, err := s.threadRepo.GetByID(ctx, req.ThreadId)
	if err != nil {
		log.Printf("Failed to get thread: %v", err)
		return nil, status.Error(codes.NotFound, "thread not found")
	}
	comments, err := s.commentRepo.GetByThreadID(ctx, req.ThreadId)
	if err != nil {
		log.Printf("Failed to get comments: %v", err)
		return nil, status.Error(codes.Internal, "failed to get comments")
	}
	responseComments := make([]*pd.Comment, len(comments))
	for i, comment := range comments {
		responseComments[i] = &pd.Comment{
			Id:        comment.ID.String(),
			UserId:    comment.UserID.String(),
			Content:   comment.Content,
			CreatedAt: comment.CreatedAt.Format(time.RFC3339),
			UpdatedAt: comment.UpdatedAt.Format(time.RFC3339),
		}
	}

	return &pd.GetThreadByIDResponse{
		Thread: &pd.Thread{
			Id:        thread.ID.String(),
			UserId:    thread.UserID.String(),
			Content:   thread.Content,
			CreatedAt: thread.CreatedAt.Format(time.RFC3339),
			UpdatedAt: thread.UpdatedAt.Format(time.RFC3339),
		},
		Comment: responseComments,
	}, nil
}
