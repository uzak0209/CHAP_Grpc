package db

import (
	"CHAP_Grpc/backend/infra/model"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DB_DSN")
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	Migrate(&model.CommentDBModel{}, &model.ThreadDBModel{}, &model.PostDBModel{}, &model.EventDBModel{}, &model.UserDBModel{}, &model.AuthDBModel{}, &model.PostLike{}, &model.ThreadLike{}, &model.EventLike{})
}

func Migrate(models ...interface{}) {
	if err := DB.AutoMigrate(models...); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
}
