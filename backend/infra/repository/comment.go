package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
)

type CommentRepository struct{}

func (r *CommentRepository) Create(ctx context.Context, comment *model.CommentDBModel) error {
	return db.DB.WithContext(ctx).Create(comment).Error
}

func (r *CommentRepository) GetByID(ctx context.Context, id string) (*model.CommentDBModel, error) {
	var comment model.CommentDBModel
	err := db.DB.WithContext(ctx).First(&comment, "id = ?", id).Error
	return &comment, err
}

func (r *CommentRepository) Update(ctx context.Context, comment *model.CommentDBModel) error {
	return db.DB.WithContext(ctx).Save(comment).Error
}

func (r *CommentRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.CommentDBModel{}, "id = ?", id).Error
}
