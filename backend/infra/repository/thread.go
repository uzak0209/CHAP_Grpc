package repository

import (
	"context"

	"github.com/uzak0209/CHAP_Grpc/backend/infra/db"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
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
		// include empty string as a valid content_type value
		Where("content_type = ? OR content_type = ?", "disaster", "entertainment").
		Or("content_type = ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
			"community", lat-0.1, lat+0.1, lng-0.1, lng+0.1).
		Order("created_at DESC").
		Find(&threads).Error
	return threads, err
}
