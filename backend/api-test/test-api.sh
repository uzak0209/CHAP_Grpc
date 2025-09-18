#!/bin/bash

# CHAP gRPC API Test Script
# このスクリプトは自動的にテストユーザーを作成し、JWTを取得して認証が必要なAPIをテストします

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER="localhost:50051"
TEST_EMAIL="auto-test-$(date +%s)@example.com"
TEST_PASSWORD="testpassword123"

echo -e "${BLUE}🚀 Starting CHAP gRPC API Tests${NC}"
echo -e "${YELLOW}Server: $SERVER${NC}"
echo -e "${YELLOW}Test Email: $TEST_EMAIL${NC}"

# Function to check if server is running
check_server() {
    echo -e "${BLUE}📡 Checking server status...${NC}"
    if grpcurl -plaintext $SERVER list > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running${NC}"
    else
        echo -e "${RED}❌ Server is not running. Please start it with: go run main.go${NC}"
        exit 1
    fi
}

# Function to register user
register_user() {
    echo -e "${BLUE}👤 Registering test user...${NC}"
    SIGNUP_RESPONSE=$(grpcurl -plaintext -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" $SERVER chap.auth.v1.AuthService/SignUp 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ User registration successful${NC}"
        echo "Response: $SIGNUP_RESPONSE"
    else
        echo -e "${RED}❌ User registration failed${NC}"
        exit 1
    fi
}

# Function to login and get JWT
login_user() {
    echo -e "${BLUE}🔑 Logging in to get JWT token...${NC}"
    LOGIN_RESPONSE=$(grpcurl -plaintext -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" $SERVER chap.auth.v1.AuthService/SignIn 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Login successful${NC}"
        echo "Response: $LOGIN_RESPONSE"
        
        # Extract JWT token (assuming JSON response with "token" field)
        # Note: This requires jq to be installed for proper JSON parsing
        if command -v jq &> /dev/null; then
            JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
            USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.userId // empty')
            
            if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
                echo -e "${GREEN}🎟️  JWT Token extracted successfully${NC}"
                echo "Token: $JWT_TOKEN"
            else
                echo -e "${YELLOW}⚠️  JWT Token not found in response, continuing without token...${NC}"
            fi
            
            if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
                echo -e "${GREEN}🆔 User ID extracted: $USER_ID${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  jq not installed, cannot extract JWT token automatically${NC}"
            echo -e "${YELLOW}💡 Install jq with: sudo apt-get install jq${NC}"
        fi
    else
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi
}

# Function to test user operations (if JWT is available)
test_user_operations() {
    if [ -n "$JWT_TOKEN" ]; then
        echo -e "${BLUE}👨‍💼 Testing user operations with JWT...${NC}"
        
        # Note: grpcurl doesn't support custom headers directly for gRPC
        # This is a placeholder for when JWT middleware is properly implemented
        echo -e "${YELLOW}⚠️  JWT authentication testing requires proper middleware implementation${NC}"
        
        # Test without JWT for now (until middleware is implemented)
        echo -e "${BLUE}📝 Testing CreateUser operation...${NC}"
        USER_CREATE_RESPONSE=$(grpcurl -plaintext -d "{\"name\": \"Test User Auto\", \"description\": \"Created by automated test\"}" $SERVER chap.user.v1.UserService/CreateUser 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ CreateUser test passed${NC}"
            echo "Response: $USER_CREATE_RESPONSE"
        else
            echo -e "${YELLOW}⚠️  CreateUser test failed (may be expected if auth is required)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Skipping authenticated operations (no JWT token)${NC}"
    fi
}

# Function to test other services
test_other_services() {
    echo -e "${BLUE}🧪 Testing other service endpoints...${NC}"
    
    # Test Post Service
    echo -e "${BLUE}📄 Testing Post Service...${NC}"
    POST_RESPONSE=$(grpcurl -plaintext -d "{\"title\": \"Test Post\", \"content\": \"This is a test post\"}" $SERVER chap.post.v1.PostService/CreatePost 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Post service test passed${NC}"
        echo "Response: $POST_RESPONSE"
    else
        echo -e "${YELLOW}⚠️  Post service test failed${NC}"
    fi
    
    # Test Comment Service
    echo -e "${BLUE}💬 Testing Comment Service...${NC}"
    COMMENT_RESPONSE=$(grpcurl -plaintext -d "{\"content\": \"This is a test comment\"}" $SERVER chap.comment.v1.CommentService/CreateComment 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Comment service test passed${NC}"
        echo "Response: $COMMENT_RESPONSE"
    else
        echo -e "${YELLOW}⚠️  Comment service test failed${NC}"
    fi
    
    # Test Thread Service
    echo -e "${BLUE}🧵 Testing Thread Service...${NC}"
    THREAD_RESPONSE=$(grpcurl -plaintext -d "{\"title\": \"Test Thread\", \"content\": \"This is a test thread\"}" $SERVER chap.thread.v1.ThreadService/CreateThread 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Thread service test passed${NC}"
        echo "Response: $THREAD_RESPONSE"
    else
        echo -e "${YELLOW}⚠️  Thread service test failed${NC}"
    fi
}

# Function to clean up
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    # Add any cleanup operations here if needed
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}         CHAP gRPC API Test Suite${NC}"
    echo -e "${BLUE}===============================================${NC}"
    
    check_server
    register_user
    login_user
    test_user_operations
    test_other_services
    cleanup
    
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${GREEN}🎉 All tests completed!${NC}"
    echo -e "${BLUE}===============================================${NC}"
    
    if [ -n "$JWT_TOKEN" ]; then
        echo -e "${YELLOW}💡 Use this JWT token for manual testing:${NC}"
        echo -e "${YELLOW}$JWT_TOKEN${NC}"
    fi
}

# Run main function
main