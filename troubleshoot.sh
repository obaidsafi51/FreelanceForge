#!/bin/bash

# FreelanceForge Troubleshooting Script
# This script helps diagnose and fix common issues

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

print_fix() {
    echo -e "${GREEN}[FIX]${NC} $1"
}

echo "🔧 FreelanceForge Troubleshooting"
echo "================================="
echo ""

# Function to check and fix common issues
check_and_fix_permissions() {
    print_status "Checking file permissions..."
    
    if [ ! -x "setup-and-run.sh" ]; then
        print_warning "setup-and-run.sh is not executable"
        chmod +x setup-and-run.sh
        print_fix "Made setup-and-run.sh executable"
    fi
    
    if [ ! -x "verify-setup.sh" ]; then
        print_warning "verify-setup.sh is not executable"
        chmod +x verify-setup.sh
        print_fix "Made verify-setup.sh executable"
    fi
    
    if [ ! -x "test-local.sh" ]; then
        print_warning "test-local.sh is not executable"
        chmod +x test-local.sh
        print_fix "Made test-local.sh executable"
    fi
    
    print_success "File permissions checked"
}

check_ports() {
    print_status "Checking port availability..."
    
    # Check port 9944 (Substrate WebSocket)
    if lsof -i :9944 >/dev/null 2>&1; then
        print_warning "Port 9944 is in use"
        echo "Process using port 9944:"
        lsof -i :9944
        echo ""
        print_fix "To kill the process: sudo kill -9 \$(lsof -t -i:9944)"
    else
        print_success "Port 9944 is available"
    fi
    
    # Check port 9933 (Substrate RPC)
    if lsof -i :9933 >/dev/null 2>&1; then
        print_warning "Port 9933 is in use"
        echo "Process using port 9933:"
        lsof -i :9933
        echo ""
        print_fix "To kill the process: sudo kill -9 \$(lsof -t -i:9933)"
    else
        print_success "Port 9933 is available"
    fi
    
    # Check port 5173 (Frontend)
    if lsof -i :5173 >/dev/null 2>&1; then
        print_warning "Port 5173 is in use"
        echo "Process using port 5173:"
        lsof -i :5173
        echo ""
        print_fix "To kill the process: sudo kill -9 \$(lsof -t -i:5173)"
    else
        print_success "Port 5173 is available"
    fi
}

check_build_issues() {
    print_status "Checking for build issues..."
    
    # Check if Rust is properly installed
    if ! command -v rustc >/dev/null 2>&1; then
        print_error "Rust is not installed"
        print_fix "Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        return
    fi
    
    # Check if wasm32 target is installed
    if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        print_warning "wasm32-unknown-unknown target not installed"
        rustup target add wasm32-unknown-unknown
        print_fix "Added wasm32-unknown-unknown target"
    fi
    
    # Check if Node.js is properly installed
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        print_fix "Install Node.js 18+: https://nodejs.org/"
        return
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version is too old: v$(node --version)"
        print_fix "Install Node.js 18+: https://nodejs.org/"
        return
    fi
    
    print_success "Build dependencies are properly installed"
}

clean_and_rebuild() {
    print_status "Cleaning build artifacts..."
    
    # Clean Substrate build
    if [ -d "substrate-node/target" ]; then
        print_status "Cleaning Substrate target directory..."
        cd substrate-node
        cargo clean
        cd ..
        print_success "Cleaned Substrate build artifacts"
    fi
    
    # Clean frontend build
    if [ -d "frontend/node_modules" ]; then
        print_status "Cleaning frontend node_modules..."
        rm -rf frontend/node_modules
        print_success "Cleaned frontend dependencies"
    fi
    
    if [ -d "frontend/dist" ]; then
        print_status "Cleaning frontend dist..."
        rm -rf frontend/dist
        print_success "Cleaned frontend build"
    fi
    
    print_status "Rebuilding project..."
    ./setup-and-run.sh setup
}

check_system_resources() {
    print_status "Checking system resources..."
    
    # Check memory
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        MEMORY_BYTES=$(sysctl -n hw.memsize)
        MEMORY_GB=$((MEMORY_BYTES / 1024 / 1024 / 1024))
    fi
    
    if [ "$MEMORY_GB" -lt 4 ]; then
        print_warning "Low memory: ${MEMORY_GB}GB (4GB+ recommended)"
        print_fix "Consider closing other applications or adding more RAM"
    else
        print_success "Memory: ${MEMORY_GB}GB"
    fi
    
    # Check disk space
    DISK_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -lt 5 ]; then
        print_warning "Low disk space: ${DISK_SPACE}GB"
        print_fix "Free up disk space or clean build artifacts with: npm run clean"
    else
        print_success "Disk space: ${DISK_SPACE}GB available"
    fi
}

show_logs() {
    print_status "Recent error logs..."
    
    # Check for Rust compilation errors
    if [ -f "substrate-node/target/release/build/*/out/build.log" ]; then
        print_status "Recent Substrate build logs:"
        tail -20 substrate-node/target/release/build/*/out/build.log 2>/dev/null || true
    fi
    
    # Check for npm errors
    if [ -f "frontend/npm-debug.log" ]; then
        print_status "Recent npm error logs:"
        tail -20 frontend/npm-debug.log
    fi
}

# Main troubleshooting menu
case "${1:-all}" in
    "permissions")
        check_and_fix_permissions
        ;;
    "ports")
        check_ports
        ;;
    "build")
        check_build_issues
        ;;
    "clean")
        clean_and_rebuild
        ;;
    "resources")
        check_system_resources
        ;;
    "logs")
        show_logs
        ;;
    "all")
        check_and_fix_permissions
        echo ""
        check_ports
        echo ""
        check_build_issues
        echo ""
        check_system_resources
        echo ""
        ;;
    "help"|"-h"|"--help")
        echo "FreelanceForge Troubleshooting Script"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  all         Run all checks (default)"
        echo "  permissions Check and fix file permissions"
        echo "  ports       Check port availability"
        echo "  build       Check build dependencies"
        echo "  clean       Clean and rebuild everything"
        echo "  resources   Check system resources"
        echo "  logs        Show recent error logs"
        echo "  help        Show this help message"
        echo ""
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use '$0 help' for available options"
        exit 1
        ;;
esac

echo ""
print_status "Troubleshooting complete!"
echo ""
echo "🔧 Common fixes:"
echo "• Clean rebuild: $0 clean"
echo "• Check setup: ./verify-setup.sh"
echo "• Kill processes: sudo kill -9 \$(lsof -t -i:9944,9933,5173)"
echo "• Update dependencies: ./setup-and-run.sh setup"
echo ""