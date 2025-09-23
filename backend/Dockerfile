FROM golang:1.25-alpine

# Install git and useful tools
RUN apk add --no-cache git inotify-tools

WORKDIR /app

# Install air for hot reloading
RUN go install github.com/cosmtrek/air@v1.49.0

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Make sure tmp directory exists with correct permissions
RUN mkdir -p tmp && chmod 755 tmp

# Set environment variable for air debugging
ENV AIR_DEBUG=1

EXPOSE 50051

# Use air with debug flag
CMD ["sh", "-c", "echo 'Air config:' && cat .air.toml && echo 'Starting air...' && air -c .air.toml -d"]