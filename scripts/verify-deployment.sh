#!/bin/bash

# FreelanceForge Deployment Verification Script
# This script verifies that the production deployment is ready

set -e

echo "🚀 FreelanceForge Deployment Verification"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
SUBSTRATE_RPC=${SUBSTRATE_RPC:-"http://localhost:9933"}
SUBSTRATE_WS=${SUBSTRATE_WS:-"ws://localhost:9944"}

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check if a service is running
check_service() {
    local service_name="$1"
    local url="$2"
    
    echo -n "Checking $service_name... "
    
    if curl -s --max-time 5 "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ NOT ACCESSIBLE${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo ""
echo "📋 Pre-deployment Checklist"
echo "----------------------------"

# Check if Docker is running
run_test "Docker daemon" "docker info"

# Check if Docker Compose is available
run_test "Docker Compose" "docker-compose --version"

# Check if production environment file exists
run_test "Production environment file" "test -f ../frontend/.env.production"

# Check if production build exists
run_test "Production build artifacts" "test -d ../frontend/dist"

echo ""
echo "🔧 Service Health Checks"
echo "------------------------"

# Check frontend health
check_service "Frontend service" "$FRONTEND_URL/health"

# Check Substrate RPC
check_service "Substrate RPC" "$SUBSTRATE_RPC/health"

echo ""
echo "🌐 Network Connectivity Tests"
echo "-----------------------------"

# Test Paseo testnet connectivity
run_test "Paseo testnet (primary)" "curl -s --max-time 5 -H 'Content-Type: application/json' -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"system_chain\", \"params\":[]}' https://paseo.dotters.network"

run_test "Paseo testnet (fallback 1)" "curl -s --max-time 5 -H 'Content-Type: application/json' -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"system_chain\", \"params\":[]}' https://rpc.ibp.network/paseo"

run_test "Paseo testnet (fallback 2)" "curl -s --max-time 5 -H 'Content-Type: application/json' -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"system_chain\", \"params\":[]}' https://paseo.rpc.amforc.com"

echo ""
echo "📊 Performance Tests"
echo "-------------------"

# Test frontend response time
FRONTEND_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$FRONTEND_URL" 2>/dev/null || echo "999")
if (( $(echo "$FRONTEND_RESPONSE_TIME < 2.0" | bc -l) )); then
    echo -e "Frontend response time: ${GREEN}${FRONTEND_RESPONSE_TIME}s ✓${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Frontend response time: ${RED}${FRONTEND_RESPONSE_TIME}s ✗ (>2s)${NC}"
    ((TESTS_FAILED++))
fi

# Test RPC response time
RPC_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' "$SUBSTRATE_RPC" 2>/dev/null || echo "999")
if (( $(echo "$RPC_RESPONSE_TIME < 1.0" | bc -l) )); then
    echo -e "RPC response time: ${GREEN}${RPC_RESPONSE_TIME}s ✓${NC}"
    ((TESTS_PASSED++))
else
    echo -e "RPC response time: ${RED}${RPC_RESPONSE_TIME}s ✗ (>1s)${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔒 Security Checks"
echo "-----------------"

# Check if debug mode is disabled in production
if grep -q "VITE_DEBUG=false" ../frontend/.env.production 2>/dev/null; then
    echo -e "Debug mode: ${GREEN}✓ DISABLED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Debug mode: ${YELLOW}⚠ NOT PROPERLY CONFIGURED${NC}"
    ((TESTS_FAILED++))
fi

# Check if log level is set to error in production
if grep -q "VITE_LOG_LEVEL=error" ../frontend/.env.production 2>/dev/null; then
    echo -e "Log level: ${GREEN}✓ ERROR${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Log level: ${YELLOW}⚠ NOT SET TO ERROR${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "📦 Container Status"
echo "------------------"

# Check if production containers are running
if docker-compose -f ../docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "Production containers: ${GREEN}✓ RUNNING${NC}"
    ((TESTS_PASSED++))
    
    # Show container status
    echo ""
    docker-compose -f ../docker-compose.prod.yml ps
else
    echo -e "Production containers: ${RED}✗ NOT RUNNING${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "📈 Results Summary"
echo "=================="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All checks passed! Deployment is ready for production.${NC}"
    echo ""
    echo "🔗 Access URLs:"
    echo "   Frontend: $FRONTEND_URL"
    echo "   Substrate RPC: $SUBSTRATE_RPC"
    echo "   Substrate WebSocket: $SUBSTRATE_WS"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Run end-to-end tests: npm run test:production"
    echo "   2. Set up monitoring: docker-compose -f monitoring/docker-compose.monitoring.yml up -d"
    echo "   3. Configure SSL certificates for production domain"
    echo "   4. Set up backup procedures"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some checks failed. Please review and fix issues before production deployment.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "   - Ensure all services are running: docker-compose -f docker-compose.prod.yml up -d"
    echo "   - Check environment configuration: cat frontend/.env.production"
    echo "   - Verify network connectivity: ping paseo.dotters.network"
    echo "   - Check logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi