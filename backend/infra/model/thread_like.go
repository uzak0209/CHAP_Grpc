package model

import "github.com/google/uuid"

type ThreadLikeDBModel struct {
	ID       uuid.UUID     `gorm:"primaryKey;type:varchar(36)"`
	ThreadID uuid.UUID     `gorm:"type:varchar(36);index;not null"`
	Thread   ThreadDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID   uuid.UUID     `gorm:"type:varchar(36);index;not null"`
	User     UserDBModel   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
