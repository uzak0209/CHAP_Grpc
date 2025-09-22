package model

import "github.com/google/uuid"

type UserFollowingDBModel struct {
	ID          uuid.UUID   `gorm:"primaryKey;type:varchar(36)"`
	UserID      uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	User        UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	FollowingID uuid.UUID   `gorm:"type:varchar(36);index;not null"`
	Following   UserDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:FollowingID"`
}
