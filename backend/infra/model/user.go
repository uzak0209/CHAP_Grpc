package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserDBModel struct {
	ID             uuid.UUID `gorm:"primaryKey;type:varchar(36)"`
	Name           string    `gorm:"type:varchar(255)"`
	Description    string    `gorm:"type:text"`
	Image          string    `gorm:"type:varchar(255)"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`
	FollowerCount  int32
	FollowingCount int32
	Valid          bool
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}
