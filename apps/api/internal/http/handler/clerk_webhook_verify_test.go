package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testWebhookSecret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw"

func sign(t *testing.T, secret, svixID, svixTimestamp string, body []byte) string {
	t.Helper()
	secretBytes, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
	require.NoError(t, err)
	mac := hmac.New(sha256.New, secretBytes)
	mac.Write([]byte(svixID + "." + svixTimestamp + "." + string(body)))
	return "v1," + base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

func Test_VerifySvixSignature_AcceptsValidSignature(t *testing.T) {
	body := []byte(`{"type":"user.created"}`)
	svixID, svixTimestamp := "msg_123", "1700000000"
	sig := sign(t, testWebhookSecret, svixID, svixTimestamp, body)

	err := verifySvixSignature(testWebhookSecret, svixID, svixTimestamp, sig, body)

	assert.NoError(t, err)
}

func Test_VerifySvixSignature_RejectsInvalidSignature(t *testing.T) {
	body := []byte(`{"type":"user.created"}`)

	err := verifySvixSignature(testWebhookSecret, "msg_123", "1700000000", "v1,not-the-real-signature", body)

	assert.Error(t, err)
}
