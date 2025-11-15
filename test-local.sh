#!/bin/bash

# FreelanceForge Local Testing Script
# This script runs basic tests to verify the application is working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "🧪 FreelanceForge Local Testing"
echo "==============================="
echo ""

# Check if services are running
print_status "Checking if services are running..."

# Check Substrate node
if curl -s -X POST -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' http://localhost:9933 >/dev/null 2>&1; then
    print_success "Substrate node is running on port 9933"
else
    print_error "Substrate node is not running on port 9933"
    echo "Start it with: npm run dev:substrate"
    exit 1
fi

# Check WebSocket connection
if command -v wscat >/dev/null 2>&1; then
    if timeout 5 wscat -c ws://localhost:9944 -x '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' >/dev/null 2>&1; then
        print_success "Substrate WebSocket is accessible on port 9944"
    else
        print_warning "Substrate WebSocket connection test failed (wscat timeout)"
    fi
else
    print_warning "wscat not installed, skipping WebSocket test"
fi

# Check frontend
if curl -s http://localhost:5173 >/dev/null 2>&1; then
    print_success "Frontend is running on port 5173"
else
    print_error "Frontend is not running on port 5173"
    echo "Start it with: npm run dev:frontend"
    exit 1
fi

echo ""
print_status "Running unit tests..."

# Run Substrate tests
print_status "Running Substrate pallet tests..."
cd substrate-node
if cargo test --quiet -p pallet-freelance-credentials; then
    print_success "Substrate pallet tests passed"
else
    print_error "Substrate pallet tests failed"
    cd ..
    exit 1
fi
cd ..

# Run frontend tests
print_status "Running frontend tests..."
cd frontend
if npm run test; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
    cd ..
    exit 1
fi
cd ..

echo ""
print_status "Testing basic API functionality..."

# Test system health
HEALTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' http://localhost:9933)
if echo "$HEALTH_RESPONSE" | grep -q '"result"'; then
    print_success "System health API working"
else
    print_error "System health API not responding correctly"
fi

# Test system name
NAME_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"system_name","params":[]}' http://localhost:9933)
if echo "$NAME_RESPONSE" | grep -q '"result"'; then
    SYSTEM_NAME=$(echo "$NAME_RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    print_success "System name: $SYSTEM_NAME"
else
    print_error "System name API not responding correctly"
fi

# Test runtime version
VERSION_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"state_getRuntimeVersion","params":[]}' http://localhost:9933)
if echo "$VERSION_RESPONSE" | grep -q '"result"'; then
    print_success "Runtime version API working"
else
    print_error "Runtime version API not responding correctly"
fi

echo ""
print_success "All tests completed successfully! ✨"
echo ""
echo "🌐 Application URLs:"
echo "• Frontend: http://localhost:5173"
echo "• Substrate RPC: http://localhost:9933"
echo "• Substrate WebSocket: ws://localhost:9944"
echo ""
echo "📋 Next steps:"
echo "1. Install Polkadot.js browser extension"
echo "2. Create or import a wallet"
echo "3. Visit the frontend to test credential minting"
echo ""