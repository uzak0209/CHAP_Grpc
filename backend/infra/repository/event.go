package repository

import (
	"context"

	"github.com/uzak0209/CHAP_Grpc/backend/infra/db"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
)

type EventRepository struct{}

func (r *EventRepository) Create(ctx context.Context, event *model.EventDBModel) error {
	return db.DB.WithContext(ctx).Create(event).Error
}

func (r *EventRepository) GetByID(ctx context.Context, id string) (*model.EventDBModel, error) {
	var event model.EventDBModel
	err := db.DB.WithContext(ctx).First(&event, "id = ?", id).Error
	return &event, err
}

func (r *EventRepository) Update(ctx context.Context, event *model.EventDBModel) error {
	return db.DB.WithContext(ctx).Save(event).Error
}

func (r *EventRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.EventDBModel{}, "id = ?", id).Error
}
func (r *EventRepository) GetEvents(ctx context.Context, lat, lng float64) ([]*model.EventDBModel, error) {
	var events []*model.EventDBModel
	err := db.DB.WithContext(ctx).
		Where("content_type = ? OR content_type IS NULL OR content_type = ?", "event", "event").
		Or("content_type = ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
			"communication", lat-0.1, lat+0.1, lng-0.1, lng+0.1).
		Order("created_at DESC").
		Find(&events).Error
	return events, err
}
