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
	if dsn == "" {
		log.Fatal("DB_DSN environment variable is not set")
	}
	log.Printf("Connecting to database...")
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false, // Disable prepared statements for pooler compatibility
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	log.Println("Database connection successful")

	// Use IfNotExists option for AutoMigrate
	log.Println("Starting database migration...")
	if err := DB.AutoMigrate(
		&model.UserDBModel{},
		&model.AuthDBModel{},
		&model.PostDBModel{},
		&model.CommentDBModel{},
		&model.ThreadDBModel{},
		&model.EventDBModel{},
		&model.PostLikeDBModel{},
		&model.ThreadLikeDBModel{},
		&model.EventLikeDBModel{},
	); err != nil {
		log.Printf("Migration warning: %v", err)
		log.Println("Continuing with server startup...")
	} else {
		log.Println("Database migration completed successfully")
	}
}
