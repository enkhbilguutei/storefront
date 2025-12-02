#!/bin/bash

# Auth Flow E2E Test Script
# Tests the complete authentication flow with Medusa backend

set -e

MEDUSA_URL="${NEXT_PUBLIC_MEDUSA_BACKEND_URL:-http://localhost:9000}"
PUBLISHABLE_KEY="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-pk_1effd78f7e04b64a25395b8190158a4400b8498e930cd8f174d09ea03d9ca07c}"

# Generate unique test email
TEST_EMAIL="e2e-test-$(date +%s)@example.com"
TEST_PASSWORD="password123"
TEST_FIRST_NAME="E2E"
TEST_LAST_NAME="Test"

echo "🧪 Auth Flow E2E Test"
echo "===================="
echo "Backend URL: $MEDUSA_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Check if backend is running
echo "1️⃣ Checking backend health..."
HEALTH=$(curl -s "$MEDUSA_URL/health" 2>/dev/null || echo "failed")
if [[ "$HEALTH" == "OK" ]] || [[ "$HEALTH" == *"ok"* ]]; then
  echo "   ✅ Backend is healthy"
else
  echo "   ❌ Backend is not responding (got: $HEALTH)"
  exit 1
fi
echo ""

# Test Registration
echo "2️⃣ Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$MEDUSA_URL/auth/customer/emailpass/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

REGISTER_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$REGISTER_TOKEN" ]]; then
  echo "   ✅ Registration successful"
  echo "   Token received: ${REGISTER_TOKEN:0:50}..."
else
  echo "   ❌ Registration failed"
  echo "   Response: $REGISTER_RESPONSE"
  exit 1
fi
echo ""

# Test Customer Profile Creation
echo "3️⃣ Creating customer profile..."
CUSTOMER_RESPONSE=$(curl -s -X POST "$MEDUSA_URL/store/customers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGISTER_TOKEN" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -d "{\"email\":\"$TEST_EMAIL\",\"first_name\":\"$TEST_FIRST_NAME\",\"last_name\":\"$TEST_LAST_NAME\"}")

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | grep -o '"id":"cus_[^"]*"' | cut -d'"' -f4)

if [[ -n "$CUSTOMER_ID" ]]; then
  echo "   ✅ Customer profile created"
  echo "   Customer ID: $CUSTOMER_ID"
else
  echo "   ❌ Customer profile creation failed"
  echo "   Response: $CUSTOMER_RESPONSE"
  exit 1
fi
echo ""

# Test that registration token cannot access /store/customers/me (expected behavior)
echo "4️⃣ Verifying registration token limitations..."
ME_WITH_REG_TOKEN=$(curl -s "$MEDUSA_URL/store/customers/me" \
  -H "Authorization: Bearer $REGISTER_TOKEN" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY")

if [[ "$ME_WITH_REG_TOKEN" == *"Unauthorized"* ]]; then
  echo "   ✅ Correctly rejected registration token for /me endpoint"
else
  echo "   ⚠️ Unexpected: Registration token was accepted for /me endpoint"
fi
echo ""

# Test Login
echo "5️⃣ Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$MEDUSA_URL/auth/customer/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$LOGIN_TOKEN" ]]; then
  echo "   ✅ Login successful"
  echo "   Token received: ${LOGIN_TOKEN:0:50}..."
else
  echo "   ❌ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test Profile Retrieval with Login Token
echo "6️⃣ Fetching customer profile with login token..."
PROFILE_RESPONSE=$(curl -s "$MEDUSA_URL/store/customers/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY")

PROFILE_EMAIL=$(echo "$PROFILE_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
PROFILE_FIRST_NAME=$(echo "$PROFILE_RESPONSE" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
PROFILE_LAST_NAME=$(echo "$PROFILE_RESPONSE" | grep -o '"last_name":"[^"]*"' | cut -d'"' -f4)

if [[ "$PROFILE_EMAIL" == "$TEST_EMAIL" ]]; then
  echo "   ✅ Profile retrieved successfully"
  echo "   Email: $PROFILE_EMAIL"
  echo "   Name: $PROFILE_FIRST_NAME $PROFILE_LAST_NAME"
else
  echo "   ❌ Profile retrieval failed"
  echo "   Response: $PROFILE_RESPONSE"
  exit 1
fi
echo ""

# Test Missing Publishable Key
echo "7️⃣ Testing missing publishable key..."
NO_KEY_RESPONSE=$(curl -s "$MEDUSA_URL/store/customers/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

if [[ "$NO_KEY_RESPONSE" == *"Publishable API key required"* ]]; then
  echo "   ✅ Correctly rejected request without publishable key"
else
  echo "   ⚠️ Unexpected response: $NO_KEY_RESPONSE"
fi
echo ""

# Test Wrong Password
echo "8️⃣ Testing wrong password..."
WRONG_PW_RESPONSE=$(curl -s -X POST "$MEDUSA_URL/auth/customer/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}")

if [[ "$WRONG_PW_RESPONSE" == *"Invalid"* ]] || [[ "$WRONG_PW_RESPONSE" != *"token"* ]]; then
  echo "   ✅ Correctly rejected wrong password"
else
  echo "   ❌ Wrong password was accepted"
  exit 1
fi
echo ""

echo "===================="
echo "🎉 All tests passed!"
echo "===================="
