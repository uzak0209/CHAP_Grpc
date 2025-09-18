package model

import "github.com/google/uuid"

type UserFollower struct {
	ID         uuid.UUID   `gorm:"primaryKey;type:varchar(36)"`
	UserID     uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	User       UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	FollowerID uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	Follower   UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:FollowerID"`
}
