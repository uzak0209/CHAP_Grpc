package handler

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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

// UploadImage: R2 にアップロードする署名付き URL を返す
func (s *ImageServer) UploadImage(ctx context.Context, req *pd.UploadImageRequest) (*pd.UploadImageResponse, error) {
	bucket := os.Getenv("R2_BUCKET_NAME")
	r2AccessKey := os.Getenv("R2_ACCESS_KEY")
	r2SecretKey := os.Getenv("R2_SECRET_KEY")
	accountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")

	if bucket == "" || r2AccessKey == "" || r2SecretKey == "" || accountID == "" {
		return nil, status.Error(codes.Internal, "R2 credentials not configured")
	}

	key := fmt.Sprintf("uploads/%d_%s", time.Now().Unix(), req.Filename)
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	// AWS SDK 設定 (R2 は S3 互換)
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(r2AccessKey, r2SecretKey, "")),
		config.WithEndpointResolver(aws.EndpointResolverFunc(
			func(service, region string) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:           endpoint,
					SigningRegion: "auto",
				}, nil
			},
		)),
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load aws config: %v", err)
	}

	client := s3.NewFromConfig(cfg)
	presigner := s3.NewPresignClient(client)

	// 署名付き URL 発行 (PUT)
	presigned, err := presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, func(po *s3.PresignOptions) {
		po.Expires = 15 * time.Minute
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to presign URL: %v", err)
	}

	return &pd.UploadImageResponse{
		ImageUrl: presigned.URL, // ← フロントはこの URL に直接 PUT する
	}, nil
}
