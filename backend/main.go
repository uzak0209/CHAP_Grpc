package main

import (
	"log"

	"CHAP_Grpc/backend/handler"
	"CHAP_Grpc/backend/infra/db"
)

func main() {
	log.Println("Initializing database...")
	db.InitDB()
	log.Println("Database initialized successfully")

	log.Println("Starting gRPC server...")
	if err := handler.StartServer(); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
