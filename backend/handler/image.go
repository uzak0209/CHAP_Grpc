package handler

import (
	"context"
	"fmt"
	"os"
	"time"

	pd "github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ImageServer struct {
	pd.UnimplementedImageServiceServer
}

func NewImageServer() *ImageServer {
	return &ImageServer{}
}

// UploadImage: R2 にアップロードするための一時的なURL（Bearer Token 方式）
func (s *ImageServer) UploadImage(ctx context.Context, req *pd.UploadImageRequest) (*pd.UploadImageResponse, error) {
	bucket := os.Getenv("R2_BUCKET_NAME")
	r2Token := os.Getenv("R2_API_TOKEN") // 新規作成した R2 API Token

	if bucket == "" || r2Token == "" {
		return nil, status.Error(codes.Internal, "R2_BUCKET_NAME or R2_API_TOKEN not configured")
	}

	key := fmt.Sprintf("uploads/%d_%s", time.Now().Unix(), req.Filename)

	// R2 エンドポイント URL
	accountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	if accountID == "" {
		return nil, status.Error(codes.Internal, "CLOUDFLARE_ACCOUNT_ID not configured")
	}

	// Bearer Token 用 URL (PUT するフロント側が Authorization ヘッダにセットして使う)
	uploadURL := fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", accountID, bucket, key)

	// ここでフロントには「uploadURL + Bearer Token」を渡す想定
	return &pd.UploadImageResponse{
		ImageUrl: uploadURL,
	}, nil
}
