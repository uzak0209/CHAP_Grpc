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

// EventServer は Event サービスの実装です。
type EventServer struct {
	pd.UnimplementedEventServiceServer
	eventRepo repository.EventRepository
	userRepo  repository.UserRepository
}

func NewEventServer(eventRepo repository.EventRepository, userRepo repository.UserRepository) *EventServer {
	return &EventServer{eventRepo: eventRepo, userRepo: userRepo}
}

// CreateEvent メソッド
func (s *EventServer) CreateEvent(ctx context.Context, req *pd.CreateEventRequest) (*pd.StandardResponse, error) {
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

	event := &model.EventDBModel{
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
		EventDate:   time.Now(),
		Title:       req.GetContent(),
	}

	if err := s.eventRepo.Create(ctx, event); err != nil {
		log.Printf("Failed to create event: %v", err)
		return &pd.StandardResponse{Success: false, Message: "failed to create event"}, nil
	}

	return &pd.StandardResponse{Success: true, Message: "event created successfully"}, nil
}

// GetEvents メソッド
func (s *EventServer) GetEvents(ctx context.Context, req *pd.GetEventsRequest) (*pd.GetEventsResponse, error) {
	log.Println("GetEvents called")

	events, err := s.eventRepo.GetEvents(ctx, req.Lat, req.Lng)
	if err != nil {
		log.Printf("Failed to get events: %v", err)
		return nil, status.Error(codes.Internal, "failed to get events")
	}

	responseEvents := make([]*pd.Event, len(events))
	for i, e := range events {
		responseEvents[i] = &pd.Event{
			Id:          e.ID.String(),
			UserName:    e.UserName,
			UserId:      e.UserID.String(),
			UserImage:   e.UserImage,
			Content:     e.Content,
			Image:       e.Image,
			LikeCount:   e.LikeCount,
			CreatedAt:   e.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   e.UpdatedAt.Format(time.RFC3339),
			Lat:         e.Lat,
			Lng:         e.Lng,
			EventDate:   e.EventDate.Format(time.RFC3339),
			ContentType: e.ContentType,
		}
	}

	return &pd.GetEventsResponse{Events: responseEvents}, nil
}
