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

// PostServerはPostサービスの実装です。
type PostServer struct {
	pd.UnimplementedPostServiceServer
	postRepo repository.PostRepository
	userRepo repository.UserRepository
}

func NewPostServer(postRepo repository.PostRepository, userRepo repository.UserRepository) *PostServer {
	return &PostServer{postRepo: postRepo, userRepo: userRepo}
}

// CreatePost メソッド
func (s *PostServer) CreatePost(ctx context.Context, req *pd.CreatePostRequest) (*pd.StandardResponse, error) {
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

	// Fetch user info
	user, err := s.userRepo.GetByID(ctx, parsedUserID.String())
	if err != nil {
		log.Printf("Failed to fetch user details: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to fetch user details"}, nil
	}

	post := &model.PostDBModel{
		ID:          uuid.New(),
		UserID:      parsedUserID,
		UserName:    user.Name,
		UserImage:   user.Image,
		Content:     req.GetContent(),
		Image:       req.GetImage(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ContentType: req.GetContentType(),
		Lat:         req.GetLat(),
		Lng:         req.GetLng(),
	}

	if err := s.postRepo.Create(ctx, post); err != nil {
		log.Printf("Failed to create post: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to create post"}, nil
	}

	return &pd.StandardResponse{Success: true, Message: "post created successfully"}, nil
}

// GetPosts
func (s *PostServer) GetPosts(ctx context.Context, req *pd.GetPostsRequest) (*pd.GetPostsResponse, error) {
	log.Println("GetPosts called")

	posts, err := s.postRepo.GetPosts(ctx, req.Lat, req.Lng)
	if err != nil {
		log.Printf("Failed to get posts: %v", err)
		return nil, status.Error(codes.Internal, "failed to get posts")
	}

	responsePosts := make([]*pd.Post, len(posts))
	for i, p := range posts {
		responsePosts[i] = &pd.Post{
			Id:          p.ID.String(),
			UserName:    p.UserName,
			UserId:      p.UserID.String(),
			UserImage:   p.UserImage,
			Content:     p.Content,
			Image:       p.Image,
			LikeCount:   p.LikeCount,
			CreatedAt:   p.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   p.UpdatedAt.Format(time.RFC3339),
			Lat:         p.Lat,
			Lng:         p.Lng,
			ContentType: p.ContentType,
		}
	}

	return &pd.GetPostsResponse{Posts: responsePosts}, nil
}
