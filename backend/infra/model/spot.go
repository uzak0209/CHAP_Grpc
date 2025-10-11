package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SpotDBModel struct {
	ID          uuid.UUID      `gorm:"primaryKey;type:varchar(36)"`
	Title       string         `gorm:"type:varchar(255);not null"`
	Lat         float64        `gorm:"type:decimal(10,8);not null"`
	Lng         float64        `gorm:"type:decimal(11,8);not null"`
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime"`
	Valid       bool           `gorm:"default:true"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	UserID      uuid.UUID      `gorm:"type:varchar(36);not null;index;"`
	User        UserDBModel    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Description string         `gorm:"type:text"`
}
