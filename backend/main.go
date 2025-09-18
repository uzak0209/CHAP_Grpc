package main

import (
	"log"

	"CHAP_Grpc/backend/handler"
	"CHAP_Grpc/backend/infra/db"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: Could not load .env file")
	}

	log.Println("Initializing database...")
	db.InitDB()
	log.Println("Database initialized successfully")

	log.Println("Starting gRPC server...")
	if err := handler.StartServer(); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
