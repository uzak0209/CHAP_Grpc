package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
)

type PostRepository struct{}

func (r *PostRepository) Create(ctx context.Context, post *model.PostDBModel) error {
	return db.DB.WithContext(ctx).Create(post).Error
}

func (r *PostRepository) GetByID(ctx context.Context, id string) (*model.PostDBModel, error) {
	var post model.PostDBModel
	err := db.DB.WithContext(ctx).First(&post, "id = ?", id).Error
	return &post, err
}

func (r *PostRepository) Update(ctx context.Context, post *model.PostDBModel) error {
	return db.DB.WithContext(ctx).Save(post).Error
}

func (r *PostRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.PostDBModel{}, "id = ?", id).Error
}
func (r *PostRepository) GetPosts(ctx context.Context, lat, lng float64) ([]*model.PostDBModel, error) {
	var posts []*model.PostDBModel
	err := db.DB.WithContext(ctx).
		Where("content_type = ? OR content_type IS NULL OR content_type = ?", "event", "event").
		Or("content_type = ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
			"communication", lat-0.1, lat+0.1, lng-0.1, lng+0.1).
		Order("created_at DESC").
		Find(&posts).Error
	return posts, err
}
