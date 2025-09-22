package repository

import (
	"context"

	"github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/db"
	"github.com/uzak0209/CHAP_Grpc/backend/infra/model"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) Create(ctx context.Context, user *model.UserDBModel) error {
	return db.DB.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.UserDBModel, error) {
	var user model.UserDBModel
	err := db.DB.WithContext(ctx).First(&user, "id = ?", id).Error
	return &user, err
}

func (r *UserRepository) Update(ctx context.Context, user *model.UserDBModel) error {
	return db.DB.WithContext(ctx).Model(user).Select("name", "description", "image").Updates(user).Error
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.UserDBModel{}, "id = ?", id).Error
}

func (r *UserRepository) CalcFollowRelations(ctx context.Context, res *pd.GetUserByIDResponse) error {
	var followers []model.UserFollowerDBModel
	if err := db.DB.WithContext(ctx).Where("following_id = ?", res.User.Id).Find(&followers).Error; err != nil {
		return err
	}
	for _, f := range followers {
		res.User.Followers = append(res.User.Followers, f.FollowerID.String())
	}

	var followings []model.UserFollowingDBModel
	if err := db.DB.WithContext(ctx).Where("follower_id = ?", res.User.Id).Find(&followings).Error; err != nil {
		return err
	}
	for _, f := range followings {
		res.User.Followings = append(res.User.Followings, f.FollowingID.String())
	}
	return nil
}
