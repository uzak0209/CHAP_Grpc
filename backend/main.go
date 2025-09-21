package main

import (
	"log"
	"sync"

	"CHAP_Grpc/backend/handler"
	"CHAP_Grpc/backend/infra/db"
	"CHAP_Grpc/backend/middleware"
)

func main() {
	log.Print("Starting application.")
	log.Println("Initializing database...")
	db.InitDB()
	log.Println("Database initialized successfully")

	var wg sync.WaitGroup
	wg.Add(2)

	// gRPCサーバーを起動 (50051)
	go func() {
		defer wg.Done()
		log.Println("Starting gRPC server on :50051...")
		if err := handler.StartServer(); err != nil {
			log.Fatalf("failed to start gRPC server: %v", err)
		}
	}()

	// gRPC-Gatewayサーバーを起動 (8081)
	go func() {
		defer wg.Done()
		log.Println("Starting gRPC-Gateway server on :8081...")
		if err := middleware.StartGateway("localhost:50051", ":8081"); err != nil {
			log.Fatalf("failed to start gRPC-Gateway: %v", err)
		}
	}()

	wg.Wait()
}
