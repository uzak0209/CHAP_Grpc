package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
)

type UserRepository struct{}

func (r *UserRepository) Create(ctx context.Context, user *model.UserDBModel) error {
	return db.DB.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.UserDBModel, error) {
	var user model.UserDBModel
	err := db.DB.WithContext(ctx).First(&user, "id = ?", id).Error
	return &user, err
}

func (r *UserRepository) Update(ctx context.Context, user *model.UserDBModel) error {
	return db.DB.WithContext(ctx).Save(user).Error
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.UserDBModel{}, "id = ?", id).Error
}
