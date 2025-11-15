#!/bin/bash

# FreelanceForge Setup Verification Script
# This script verifies that all components are properly installed and configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_success "$test_name"
    else
        print_error "$test_name"
    fi
}

echo "🔍 FreelanceForge Setup Verification"
echo "===================================="
echo ""

# Check system requirements
print_status "Checking system requirements..."
echo ""

# Check Rust installation
if command -v rustc >/dev/null 2>&1; then
    RUST_VERSION=$(rustc --version)
    print_success "Rust installed: $RUST_VERSION"
    
    # Check wasm32 target
    if rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        print_success "wasm32-unknown-unknown target installed"
    else
        print_error "wasm32-unknown-unknown target not installed"
    fi
else
    print_error "Rust not found"
fi

# Check Node.js installation
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js version too old: $NODE_VERSION (requires v18+)"
    fi
else
    print_error "Node.js not found"
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: v$NPM_VERSION"
else
    print_error "npm not found"
fi

# Check Cargo
if command -v cargo >/dev/null 2>&1; then
    CARGO_VERSION=$(cargo --version)
    print_success "Cargo installed: $CARGO_VERSION"
else
    print_error "Cargo not found"
fi

# Check psvm
if command -v psvm >/dev/null 2>&1; then
    print_success "psvm (Polkadot SDK Version Manager) installed"
else
    print_warning "psvm not found (optional but recommended)"
fi

echo ""
print_status "Checking project structure..."
echo ""

# Check project directories
run_test "substrate-node directory exists" "[ -d 'substrate-node' ]"
run_test "frontend directory exists" "[ -d 'frontend' ]"
run_test "docs directory exists" "[ -d 'docs' ]"

# Check important files
run_test "substrate-node Cargo.toml exists" "[ -f 'substrate-node/Cargo.toml' ]"
run_test "frontend package.json exists" "[ -f 'frontend/package.json' ]"
run_test "setup script exists" "[ -f 'setup-and-run.sh' ]"
run_test "setup script is executable" "[ -x 'setup-and-run.sh' ]"

echo ""
print_status "Checking build artifacts..."
echo ""

# Check if Substrate node is built
if [ -f "substrate-node/target/release/minimal-template-node" ]; then
    print_success "Substrate node binary exists"
    
    # Test if binary works
    if substrate-node/target/release/minimal-template-node --version >/dev/null 2>&1; then
        print_success "Substrate node binary is functional"
    else
        print_error "Substrate node binary is not functional"
    fi
else
    print_warning "Substrate node not built (run './setup-and-run.sh setup' to build)"
fi

# Check if frontend dependencies are installed
if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
else
    print_warning "Frontend dependencies not installed (run './setup-and-run.sh setup' to install)"
fi

# Check frontend environment file
if [ -f "frontend/.env.local" ]; then
    print_success "Frontend environment file exists"
else
    print_warning "Frontend environment file missing (will be created on first run)"
fi

echo ""
print_status "Checking system resources..."
echo ""

# Check available memory
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
elif [[ "$OSTYPE" == "darwin"* ]]; then
    MEMORY_BYTES=$(sysctl -n hw.memsize)
    MEMORY_GB=$((MEMORY_BYTES / 1024 / 1024 / 1024))
fi

if [ "$MEMORY_GB" -ge 4 ]; then
    print_success "System memory: ${MEMORY_GB}GB (sufficient)"
else
    print_warning "System memory: ${MEMORY_GB}GB (minimum 4GB recommended)"
fi

# Check available disk space
DISK_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -ge 10 ]; then
    print_success "Available disk space: ${DISK_SPACE}GB (sufficient)"
else
    print_warning "Available disk space: ${DISK_SPACE}GB (minimum 10GB recommended)"
fi

echo ""
print_status "Testing network connectivity..."
echo ""

# Test internet connectivity
if curl -s --max-time 5 https://github.com >/dev/null; then
    print_success "Internet connectivity working"
else
    print_error "Internet connectivity issues"
fi

# Test if ports are available
if ! lsof -i :9944 >/dev/null 2>&1; then
    print_success "Port 9944 (Substrate WebSocket) available"
else
    print_warning "Port 9944 is in use"
fi

if ! lsof -i :9933 >/dev/null 2>&1; then
    print_success "Port 9933 (Substrate RPC) available"
else
    print_warning "Port 9933 is in use"
fi

if ! lsof -i :5173 >/dev/null 2>&1; then
    print_success "Port 5173 (Frontend) available"
else
    print_warning "Port 5173 is in use"
fi

echo ""
echo "📊 Verification Summary"
echo "======================"
echo ""
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All critical checks passed! ✨"
    echo ""
    echo "🚀 Ready to run FreelanceForge!"
    echo ""
    echo "Next steps:"
    echo "1. Start the application: ./setup-and-run.sh run"
    echo "2. Install Polkadot.js browser extension"
    echo "3. Visit http://localhost:5173"
    echo ""
else
    print_error "Some checks failed. Please address the issues above."
    echo ""
    echo "🔧 Common fixes:"
    echo "• Run setup: ./setup-and-run.sh setup"
    echo "• Install missing dependencies manually"
    echo "• Check system requirements"
    echo ""
    exit 1
fi