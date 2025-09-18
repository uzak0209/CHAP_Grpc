package model

import "github.com/google/uuid"

type EventJoin struct {
	ID      uuid.UUID    `gorm:"primaryKey;type:varchar(36)"`
	EventID uuid.UUID    `gorm:"type:varchar(36);index;not null;"`
	Event   EventDBModel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID  uuid.UUID    `gorm:"type:varchar(36);index;not null;"`
	User    UserDBModel  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
