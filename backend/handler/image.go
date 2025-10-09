package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	pd "github.com/uzak0209/CHAP_Grpc/backend/api/pd"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type directUploadResponse struct {
	Result struct {
		UploadURL string `json:"uploadURL"`
		ID        string `json:"id"`
	} `json:"result"`
	Success bool `json:"success"`
}

func NewImageServer() *ImageServer {
	return &ImageServer{}
}

type ImageServer struct {
	pd.UnimplementedImageServiceServer
}

// UploadImageはCloudflare ImagesのアップロードURLを取得するハンドラーです
func (s *ImageServer) UploadImage(ctx context.Context, req *pd.UploadImageRequest) (*pd.UploadImageResponse, error) {
	accountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	apiToken := os.Getenv("CLOUDFLARE_API_TOKEN")

	if accountID == "" || apiToken == "" {
		return nil, status.Error(codes.Internal, "cloudflare credentials not configured")
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/images/v2/direct_upload", accountID)

	// create request with context so it respects deadlines/cancellations
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create request: %v", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+apiToken)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, status.Errorf(codes.Unavailable, "failed to call cloudflare: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// try to read body for debugging
		var bodyBuf map[string]any
		_ = json.NewDecoder(resp.Body).Decode(&bodyBuf)
		return nil, status.Errorf(codes.Unavailable, "cloudflare returned status %d: %v", resp.StatusCode, bodyBuf)
	}

	var data directUploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode cloudflare response: %v", err)
	}

	if !data.Success {
		return nil, status.Error(codes.Internal, "cloudflare did not succeed")
	}

	// Return the upload URL in the proto response
	return &pd.UploadImageResponse{
		ImageUrl: data.Result.UploadURL,
	}, nil
}
