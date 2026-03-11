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

func requiredEnv(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", fmt.Errorf("%s is not configured", key)
	}
	return value, nil
}

// UploadImage: Cloudflare R2 にアップロードする署名付き URL を返す
func (s *ImageServer) UploadImage(ctx context.Context, req *pd.UploadImageRequest) (*pd.UploadImageResponse, error) {
	bucket, err := requiredEnv("R2_BUCKET_NAME")
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	accessKey, err := requiredEnv("R2_ACCESS_KEY")
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	secretKey, err := requiredEnv("R2_SECRET_KEY")
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	accountID, err := requiredEnv("CLOUDFLARE_ACCOUNT_ID")
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	key := fmt.Sprintf("uploads/%d_%s", time.Now().Unix(), req.Filename)

	// AWS SDK 設定 (Cloudflare R2 は S3 互換)
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
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
		ImageUrl: presigned.URL,
	}, nil
}
