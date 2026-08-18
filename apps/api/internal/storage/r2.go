// Package storage wraps Cloudflare R2 (S3-compatible) for the gallery
// upload flow — see docs/Architecture.md §11: the backend never proxies
// file bytes, it only issues short-lived presigned upload URLs.
package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const presignedUploadTTL = 5 * time.Minute

type R2Client struct {
	presign    *s3.PresignClient
	client     *s3.Client
	bucketName string
	publicURL  string
}

type Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	S3Endpoint      string
	PublicURL       string
}

func NewR2Client(cfg Config) *R2Client {
	client := s3.New(s3.Options{
		Region:       "auto",
		BaseEndpoint: aws.String(cfg.S3Endpoint),
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
	})
	return &R2Client{
		presign:    s3.NewPresignClient(client),
		client:     client,
		bucketName: cfg.BucketName,
		publicURL:  cfg.PublicURL,
	}
}

// PresignUpload returns a short-lived URL the client can PUT the file to
// directly, plus the object key to persist after a successful upload.
func (c *R2Client) PresignUpload(ctx context.Context, objectKey, contentType string) (string, error) {
	req, err := c.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(c.bucketName),
		Key:         aws.String(objectKey),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(presignedUploadTTL))
	if err != nil {
		return "", fmt.Errorf("presign upload url: %w", err)
	}
	return req.URL, nil
}

// PublicURL builds the public-facing URL for an already-uploaded object.
func (c *R2Client) PublicURL(objectKey string) string {
	return fmt.Sprintf("%s/%s", c.publicURL, objectKey)
}

func (c *R2Client) Delete(ctx context.Context, objectKey string) error {
	_, err := c.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("delete object: %w", err)
	}
	return nil
}
