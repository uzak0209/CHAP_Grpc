package model

import "github.com/google/uuid"

type CommentLikeDBModel struct {
	ID        uuid.UUID      `gorm:"primaryKey;type:varchar(36)"`
	CommentID uuid.UUID      `gorm:"type:varchar(36);index;not null;"`
	Comment   CommentDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID    uuid.UUID      `gorm:"type:varchar(36);index;not null;"`
	User      UserDBModel    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
