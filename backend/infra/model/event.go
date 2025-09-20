package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventDBModel struct {
	ID          uuid.UUID      `gorm:"primaryKey;type:varchar(36)"`
	UserName    string         `gorm:"type:varchar(255);not null"`
	UserID      uuid.UUID      `gorm:"type:varchar(36);not null;index;"`
	User        UserDBModel    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	UserImage   string         `gorm:"type:text"`
	Content     string         `gorm:"type:text;not null"`
	Image       string         `gorm:"type:text"`
	LikeCount   int32          `gorm:"default:0"`
	Lat         float64        `gorm:"type:decimal(10,8)"`
	Lng         float64        `gorm:"type:decimal(11,8)"`
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	EventDate   time.Time      `gorm:"type:timestamp;not null"`
	ContentType string         `gorm:"type:varchar(50)"`
	Title       string         `gorm:"type:varchar(255);not null"`
	Valid       bool           `gorm:"default:true"`
}
