# Makefile (Linux向け、コマンドはタブでインデント)
.PHONY: proto swagger generate clean tools dev

# Proto files generation
proto:
	protoc --proto_path=backend/api/proto \
		--go_out=paths=source_relative:backend/api/pd \
		--go-grpc_out=paths=source_relative:backend/api/pd \
		backend/api/proto/*.proto

# Swagger/OpenAPI generation
swagger:
	mkdir -p docs
	protoc --proto_path=backend/api/proto \
		--openapiv2_out=docs \
		--openapiv2_opt=logtostderr=true \
		--openapiv2_opt=json_names_for_fields=false \
		backend/api/proto/*.proto

# Generate both proto and swagger
generate: proto swagger

# Clean generated files
clean:
	rm -rf backend/api/pd/*.pb.go
	rm -rf docs/*.swagger.json

# Install required tools
tools:
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest

