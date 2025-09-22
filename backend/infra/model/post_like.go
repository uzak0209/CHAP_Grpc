package model

import "github.com/google/uuid"

type PostLikeDBModel struct {
	ID     uuid.UUID   `gorm:"primaryKey;type:varchar(36)"`
	PostID uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	Post   PostDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	User   UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
