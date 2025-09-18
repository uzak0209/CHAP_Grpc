package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
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
