# backend/Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Go modulesファイルをコピーして依存関係をダウンロード
COPY go.mod go.sum ./
RUN go mod download

# ソースコードを明示的にコピー
COPY *.go ./
COPY handler/ ./handler/
COPY infra/ ./infra/
COPY utils/ ./utils/
COPY api/ ./api/
COPY middleware/ ./middleware/
COPY .env ./

# デバッグ: コピーされたファイルを確認
RUN echo "=== Files in /app ==="
RUN ls -la /app
RUN echo "=== Go files in /app ==="
RUN find /app -name "*.go" -type f
RUN echo "=== Directory structure ==="
RUN find /app -type d

# アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 本番用の軽量イメージ
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# ポートを公開
EXPOSE 50051

# アプリケーションを実行
CMD ["./main"]