package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"

	"gorm.io/gorm"
)

type AuthRepository interface {
	CreateAuth(auth *model.AuthDBModel) error
	GetAuthByEmail(email string) (*model.AuthDBModel, error)
	UpdateAuth(auth *model.AuthDBModel) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository() AuthRepository {
	return &authRepository{
		db: db.DB,
	}
}

func (r *authRepository) CreateAuth(auth *model.AuthDBModel) error {
	return r.db.Create(auth).Error
}

func (r *authRepository) GetAuthByEmail(email string) (*model.AuthDBModel, error) {
	var auth model.AuthDBModel
	if err := r.db.Where("email = ?", email).First(&auth).Error; err != nil {
		return nil, err
	}
	return &auth, nil
}

func (r *authRepository) UpdateAuth(auth *model.AuthDBModel) error {
	return r.db.Save(auth).Error
}
