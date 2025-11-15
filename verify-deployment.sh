#!/bin/bash

# FreelanceForge Deployment Verification Script
# Quick health check for judges

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 FreelanceForge Deployment Verification${NC}"
echo "========================================"

TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo ""
echo -e "${BLUE}🐳 Docker Services${NC}"
echo "-------------------"

# Check if containers are running
run_test "Substrate container running" "docker-compose ps | grep substrate-node | grep Up"
run_test "Frontend container running" "docker-compose ps | grep frontend | grep Up"

echo ""
echo -e "${BLUE}🌐 Service Endpoints${NC}"
echo "--------------------"

# Check service endpoints
run_test "Frontend accessible" "curl -s http://localhost:3000 | grep -q 'FreelanceForge'"
run_test "Substrate RPC accessible" "curl -s -H 'Content-Type: application/json' -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"system_chain\"}' http://localhost:9933 | grep -q 'result'"
run_test "Substrate WebSocket accessible" "timeout 5 bash -c '</dev/tcp/localhost/9944'"

echo ""
echo -e "${BLUE}🔧 Custom Pallet Integration${NC}"
echo "-----------------------------"

# Check custom pallet
run_test "Custom pallet available" "curl -s -H 'Content-Type: application/json' -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"state_getMetadata\"}' http://localhost:9933 | grep -q 'freelanceCredentials'"

echo ""
echo -e "${BLUE}⚡ Performance Tests${NC}"
echo "-------------------"

# Performance tests
FRONTEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000 2>/dev/null || echo "999")
if (( $(echo "$FRONTEND_TIME < 5.0" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "Frontend response time: ${GREEN}${FRONTEND_TIME}s ✅${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Frontend response time: ${RED}${FRONTEND_TIME}s ❌${NC}"
    ((TESTS_FAILED++))
fi

RPC_TIME=$(curl -o /dev/null -s -w '%{time_total}' -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain"}' http://localhost:9933 2>/dev/null || echo "999")
if (( $(echo "$RPC_TIME < 2.0" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "RPC response time: ${GREEN}${RPC_TIME}s ✅${NC}"
    ((TESTS_PASSED++))
else
    echo -e "RPC response time: ${RED}${RPC_TIME}s ❌${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}📊 Results Summary${NC}"
echo "=================="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! FreelanceForge is ready for evaluation.${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Substrate RPC: ${GREEN}http://localhost:9933${NC}"
    echo -e "   Substrate WebSocket: ${GREEN}ws://localhost:9944${NC}"
    echo ""
    echo -e "${BLUE}🧪 Next Steps:${NC}"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Install Polkadot.js browser extension"
    echo "   3. Connect wallet and test credential minting"
    echo "   4. Explore dashboard and trust score features"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Troubleshooting:${NC}"
    echo ""
    echo -e "${BLUE}🔧 Common fixes:${NC}"
    echo "   • Check Docker is running: docker info"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Restart services: docker-compose restart"
    echo "   • Clean restart: docker-compose down && ./deploy-local.sh"
    echo ""
    echo -e "${BLUE}📋 Service Status:${NC}"
    docker-compose ps
    exit 1
fi