package utils

import (
	"context"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/grpc/metadata"
)

const (
	ONEWEEK = 168 // 7 days * 24 hours
)

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// getJWTSecret は環境変数からJWTシークレットを取得し、[]byteで返す
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// デフォルト値（本番環境では必ず環境変数を設定すること）
		secret = "default-jwt-secret-change-in-production"
	}
	return []byte(secret)
}

var jwtSecret = getJWTSecret()

func ExtractUserIDFromContext(ctx context.Context) (string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", errors.New("metadata not found")
	}

	authHeaders := md.Get("authorization")
	if len(authHeaders) == 0 {
		return "", errors.New("authorization header not found")
	}

	tokenString := strings.TrimPrefix(authHeaders[0], "Bearer ")
	if tokenString == authHeaders[0] {
		return "", errors.New("bearer token not found")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims.UserID, nil
	}

	return "", errors.New("invalid token")
}

func GenerateJWT(userID string) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ONEWEEK * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)

}
