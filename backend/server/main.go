package main

import (
	"log"

	"CHAP_Grpc/backend/handler"
)

func main() {
	log.Println("Starting gRPC server...")
	if err := handler.StartServer(); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
