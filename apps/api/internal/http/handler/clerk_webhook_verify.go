package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
)

// verifySvixSignature implements Clerk's Svix-based webhook signing
// scheme (https://clerk.com/docs/webhooks/sync-data — Clerk webhooks are
// signed the same way Svix signs them), without pulling in the full Svix
// management SDK for what is just an HMAC check.
func verifySvixSignature(secret, svixID, svixTimestamp, svixSignature string, body []byte) error {
	secretBytes, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
	if err != nil {
		return fmt.Errorf("decode webhook secret: %w", err)
	}

	signedContent := fmt.Sprintf("%s.%s.%s", svixID, svixTimestamp, body)
	mac := hmac.New(sha256.New, secretBytes)
	mac.Write([]byte(signedContent))
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	for part := range strings.FieldsSeq(svixSignature) {
		version, sig, ok := strings.Cut(part, ",")
		if !ok || version != "v1" {
			continue
		}
		if hmac.Equal([]byte(sig), []byte(expected)) {
			return nil
		}
	}
	return errors.New("signature mismatch")
}
