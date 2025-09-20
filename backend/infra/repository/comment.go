package repository

import (
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/infra/model"
	"context"
)

type CommentRepository interface {
	Create(ctx context.Context, comment *model.CommentDBModel) error
	GetByThreadID(ctx context.Context, threadID string) ([]*model.CommentDBModel, error)
	GetByID(ctx context.Context, id string) (*model.CommentDBModel, error)
	Update(ctx context.Context, comment *model.CommentDBModel) error
	Delete(ctx context.Context, id string) error
}

// 具体的な構造体型を追加
type commentRepository struct{}

// コンストラクタ関数
func NewCommentRepository() CommentRepository {
	return &commentRepository{}
}

// 構造体型にメソッドを実装
func (r *commentRepository) Create(ctx context.Context, comment *model.CommentDBModel) error {
	return db.DB.WithContext(ctx).Create(comment).Error
}

func (r *commentRepository) GetByThreadID(ctx context.Context, threadID string) ([]*model.CommentDBModel, error) {
	var comments []*model.CommentDBModel
	err := db.DB.WithContext(ctx).
		Where("thread_id = ?", threadID).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}

func (r *commentRepository) GetByID(ctx context.Context, id string) (*model.CommentDBModel, error) {
	var comment model.CommentDBModel
	err := db.DB.WithContext(ctx).First(&comment, "id = ?", id).Error
	return &comment, err
}

func (r *commentRepository) Update(ctx context.Context, comment *model.CommentDBModel) error {
	return db.DB.WithContext(ctx).Save(comment).Error
}

func (r *commentRepository) Delete(ctx context.Context, id string) error {
	return db.DB.WithContext(ctx).Delete(&model.CommentDBModel{}, "id = ?", id).Error
}
