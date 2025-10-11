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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type SpotServer struct {
	pd.UnimplementedSpotServiceServer
	spotRepo repository.SpotRepository
	userRepo repository.UserRepository
}

func NewSpotServer(spotRepo repository.SpotRepository, userRepo repository.UserRepository) *SpotServer {
	return &SpotServer{spotRepo: spotRepo, userRepo: userRepo}
}

func (s *SpotServer) CreateSpot(ctx context.Context, req *pd.CreateSpotRequest) (*pd.StandardResponse, error) {
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

	spot := &model.SpotDBModel{
		ID:          uuid.New(),
		UserID:      parsedUserID,
		Title:       req.GetTitle(),
		Description: req.GetDescription(),
		Lat:         req.GetLat(),
		Lng:         req.GetLng(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.spotRepo.Create(ctx, spot); err != nil {
		log.Printf("Failed to create spot: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to create spot"}, nil
	}

	return &pd.StandardResponse{Success: true, Message: "spot created successfully"}, nil
}
func (s *SpotServer) GetSpots(ctx context.Context, req *pd.Empty) (*pd.GetSpotsResponse, error) {
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
	spots, err := s.spotRepo.GetSpots(ctx, parsedUserID)
	if err != nil {
		log.Printf("Failed to get spots: %v", err)
		return nil, status.Error(codes.Internal, "failed to get spots")
	}

	var pbSpots []*pd.Spot
	for _, spot := range spots {
		pbSpots = append(pbSpots, &pd.Spot{
			Id:          spot.ID.String(),
			Title:       spot.Title,
			Description: spot.Description,
			Lat:         spot.Lat,
			Lng:         spot.Lng,
			CreatedAt:   spot.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   spot.UpdatedAt.Format(time.RFC3339),
		})
	}

	return &pd.GetSpotsResponse{
		Spots: pbSpots,
	}, nil
}
func (s *SpotServer) EditSpot(ctx context.Context, req *pd.EditSpotRequest) (*pd.StandardResponse, error) {
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

	spotID, err := uuid.Parse(req.GetId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid spot ID format")
	}

	spot := &model.SpotDBModel{
		ID:          spotID,
		UserID:      parsedUserID,
		Title:       req.GetTitle(),
		Description: req.GetDescription(),
		Lat:         req.GetLat(),
		Lng:         req.GetLng(),
		UpdatedAt:   time.Now(),
	}

	if err := s.spotRepo.Update(ctx, spot); err != nil {
		log.Printf("Failed to update spot: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to update spot"}, nil
	}

	return &pd.StandardResponse{Success: true, Message: "spot updated successfully"}, nil
}

func (s *SpotServer) DeleteSpot(ctx context.Context, req *pd.DeleteSpotRequest) (*pd.StandardResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "request is nil")
	}

	// Optional: Verify that the spot belongs to the user before deletion
	err := s.spotRepo.Delete(ctx, req.SpotId)
	if err != nil {
		log.Printf("Failed to get spots for verification: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to verify spot ownership"}, nil
	}

	return nil, status.Errorf(codes.Unimplemented, "method DeleteSpot not implemented")
}
