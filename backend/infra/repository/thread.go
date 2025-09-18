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
	return db.DB.WithContext(ctx).Save(thread).Error
}

func (r *ThreadRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.ThreadDBModel{}, "id = ?", id).Error
}
