package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
)

type ThreadRepository struct{}

func (r *ThreadRepository) Create(ctx context.Context, thread *model.ThreadDBModel) error {
	return db.DB.WithContext(ctx).Create(thread).Error
}

func (r *ThreadRepository) GetByID(ctx context.Context, id string) (*model.ThreadDBModel, error) {
	var thread model.ThreadDBModel
	err := db.DB.WithContext(ctx).First(&thread, "id = ?", id).Error
	return &thread, err
}

func (r *ThreadRepository) Update(ctx context.Context, thread *model.ThreadDBModel) error {

	return db.DB.WithContext(ctx).Model(thread).Select("content", "updated_at").Updates(thread).Error
}

func (r *ThreadRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.ThreadDBModel{}, "id = ?", id).Error
}
func (r *ThreadRepository) GetThreads(ctx context.Context, lat, lng float64) ([]*model.ThreadDBModel, error) {
	var threads []*model.ThreadDBModel
	err := db.DB.WithContext(ctx).
		Where("content_type = ? OR content_type IS NULL OR content_type = ?", "event", "event").
		Or("content_type = ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
			"communication", lat-0.1, lat+0.1, lng-0.1, lng+0.1).
		Order("created_at DESC").
		Find(&threads).Error
	return threads, err
}
