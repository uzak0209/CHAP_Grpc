package model

import "github.com/google/uuid"

type AuthDBModel struct {
	UserID   uuid.UUID   `gorm:"primaryKey;type:varchar(36)"`
	User     UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	Email    string      `gorm:"type:varchar(255);unique;not null"`
	Password string      `gorm:"type:varchar(255);not null"`
	Valid    bool        `gorm:"default:true"`
}
