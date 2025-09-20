// filepath: /home/kazuk/CHAP_Grpc/Makefile
.PHONY: help dev dev-down dev-logs prod prod-down clean generate

help:
	@echo "Available commands:"
	@echo "  dev        - Start development environment with hot reload"
	@echo "  dev-down   - Stop development environment"
	@echo "  dev-logs   - Show development logs"
	@echo "  prod       - Start production environment"
	@echo "  prod-down  - Stop production environment"
	@echo "  clean      - Clean up containers and volumes"
	@echo "  generate   - Generate protobuf files"

# Development with hot reload
dev:
	@echo "Starting development environment with hot reload..."
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	@echo "Stopping development environment..."
	docker compose -f docker-compose.yml down

dev-logs:
	@echo "Showing development logs..."
	docker compose -f docker-compose.yml logs -f grpc-server

# Production
prod:
	@echo "Starting production environment..."
	docker compose up -d --build

prod-down:
	@echo "Stopping production environment..."
	docker compose down

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker compose -f docker-compose.dev.yml down -v
	docker compose down -v
	docker system prune -f

# Generate protobuf files (if needed)
generate:
	@echo "Generating protobuf files..."
	cd backend && protoc --proto_path=api/proto \
		--go_out=api/pd --go_opt=paths=source_relative \
		--go-grpc_out=api/pd --go-grpc_opt=paths=source_relative \
		api/proto/*.proto