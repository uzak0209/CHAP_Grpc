package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentDBModel struct {
	ID              uuid.UUID      `gorm:"primaryKey;type:varchar(36)"`
	ThreadID        uuid.UUID      `gorm:"type:varchar(36);not null;"`
	Thread          ThreadDBModel  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserName        string         `gorm:"type:varchar(255);not null"`
	UserID          uuid.UUID      `gorm:"type:varchar(36);not null;"`
	User            UserDBModel    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserImage       string         `gorm:"type:text"`
	Content         string         `gorm:"type:text;not null"`
	Image           string         `gorm:"type:text"`
	ParentCommentID *uuid.UUID     `gorm:"type:varchar(36);index"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	DeletedAt       gorm.DeletedAt `gorm:"index"`
	Valid           bool           `gorm:"default:true"`
}
