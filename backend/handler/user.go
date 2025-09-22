package handler

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/repository"
	"github.com/uzak0209/CHAP_Grpc/backend/utils"
)

// UserServerはUserサービスの実装です。
type UserServer struct {
	pd.UnimplementedUserServiceServer
	userRepo *repository.UserRepository
}

func NewUserServer() *UserServer {
	return &UserServer{
		userRepo: &repository.UserRepository{},
	}
}

// 例: GetUserメソッドの実装
func (s *UserServer) GetUser(ctx context.Context, req *pd.GetUserByIDRequest) (*pd.GetUserByIDResponse, error) {
	log.Println("GetUser called")

	user, err := s.userRepo.GetByID(ctx, req.UserId)
	if err != nil {
		log.Printf("GetUser error: %v", err)
		return &pd.GetUserByIDResponse{}, err
	}

	responseUser := pd.GetUserByIDResponse{
		User: &pd.User{
			Id:             user.ID.String(),
			Name:           user.Name,
			Description:    user.Description,
			Image:          user.Image,
			FollowerCount:  user.FollowerCount,
			FollowingCount: user.FollowingCount,
			CreatedAt:      user.CreatedAt.Format(time.RFC3339),
			UpdatedAt:      user.UpdatedAt.Format(time.RFC3339),
			Followers:      []string{},
			Followings:     []string{},
		},
	}
	s.userRepo.CalcFollowRelations(ctx, &responseUser)

	return &responseUser, nil
}

func (s *UserServer) EditUser(ctx context.Context, req *pd.EditUserRequest) (*pd.StandardResponse, error) {
	log.Println("EditUser called")

	// JWTからuserIDを取得
	userIDStr, err := utils.ExtractUserIDFromContext(ctx)
	if err != nil {
		log.Printf("Failed to extract userID from JWT: %v", err)
		return &pd.StandardResponse{Success: false}, err
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return &pd.StandardResponse{Success: false}, err
	}

	user := &model.UserDBModel{
		ID:          userID,
		Name:        req.Name,
		Description: req.Description, // protoではDescriptionフィールド
		Image:       req.Image,
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		log.Printf("EditUser error: %v", err)
		return &pd.StandardResponse{Success: false}, err
	}

	return &pd.StandardResponse{Success: true}, nil
}

func (s *UserServer) DeleteUser(ctx context.Context, req *pd.DeleteUserRequest) (*pd.StandardResponse, error) {
	log.Println("DeleteUser called")

	// JWTからuserIDを取得
	userID, err := utils.ExtractUserIDFromContext(ctx)
	if err != nil {
		log.Printf("Failed to extract userID from JWT: %v", err)
		return &pd.StandardResponse{Success: false}, err
	}

	if err := s.userRepo.Delete(ctx, userID); err != nil {
		log.Printf("DeleteUser error: %v", err)
		return &pd.StandardResponse{Success: false}, err
	}

	return &pd.StandardResponse{Success: true}, nil
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
