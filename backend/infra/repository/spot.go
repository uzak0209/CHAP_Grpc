package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/db"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
)

type SpotRepository struct{}

func (r *SpotRepository) Create(ctx context.Context, spot *model.SpotDBModel) error {
	return db.DB.WithContext(ctx).Create(spot).Error
}

func (r *SpotRepository) Update(ctx context.Context, spot *model.SpotDBModel) error {
	return db.DB.WithContext(ctx).Save(spot).Error
}

func (r *SpotRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.SpotDBModel{}, "id = ?", id).Error
}

func (r *SpotRepository) GetSpots(ctx context.Context, userID uuid.UUID) ([]*model.SpotDBModel, error) {
	var spots []*model.SpotDBModel
	err := db.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&spots).Error
	return spots, err
}
