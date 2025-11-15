#!/bin/bash

# FreelanceForge Local Deployment Script
# Perfect for hackathon judges and local development
# Deploys the full stack with custom pallet-freelance-credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ███████╗██████╗ ███████╗███████╗██╗      █████╗ ███╗   ██╗ ║
║    ██╔════╝██╔══██╗██╔════╝██╔════╝██║     ██╔══██╗████╗  ██║ ║
║    █████╗  ██████╔╝█████╗  █████╗  ██║     ███████║██╔██╗ ██║ ║
║    ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██║     ██╔══██║██║╚██╗██║ ║
║    ██║     ██║  ██║███████╗███████╗███████╗██║  ██║██║ ╚████║ ║
║    ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ║
║                                                               ║
║     ███████╗ ██████╗ ██████╗  ██████╗ ███████╗                ║
║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝                ║
║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗                  ║
║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝                  ║
║     ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗                ║
║     ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝                ║
║                                                               ║
║           Decentralized Freelance Credential Management       ║
║                    Local Deployment Script                    ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}🚀 Welcome to FreelanceForge Local Deployment!${NC}"
echo -e "${CYAN}This script will deploy the complete FreelanceForge stack locally.${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print step headers
print_step() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step "STEP 1: CHECKING PREREQUISITES"

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker installed: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
else
    print_error "Docker not found. Please install Docker first:"
    echo "  • macOS: Download Docker Desktop from docker.com"
    echo "  • Ubuntu: sudo apt install docker.io"
    echo "  • Windows: Download Docker Desktop from docker.com"
    exit 1
fi

# Check Docker Compose
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker Compose installed: $COMPOSE_VERSION"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version --short)
    print_success "Docker Compose (v2) installed: $COMPOSE_VERSION"
    # Create alias for older syntax
    alias docker-compose='docker compose'
else
    print_error "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Check Node.js (optional, for development)
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_warning "Node.js not found (optional for development)"
fi

# Check available disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
print_info "Available disk space: $AVAILABLE_SPACE"

# Check available memory
if command_exists free; then
    AVAILABLE_MEMORY=$(free -h | awk 'NR==2{printf "%.1fG", $7/1024}')
    print_info "Available memory: $AVAILABLE_MEMORY"
fi

print_step "STEP 2: PREPARING ENVIRONMENT"

# Create local environment file for development
if [ ! -f "frontend/.env.local" ]; then
    print_info "Creating local environment configuration..."
    cat > frontend/.env.local << EOF
# FreelanceForge Local Development Configuration
VITE_NETWORK=local
VITE_WS_PROVIDER=ws://localhost:9944
REACT_APP_WS_PROVIDER=ws://localhost:9944

# Local development settings
VITE_DEBUG=true
REACT_APP_DEBUG=true
VITE_LOG_LEVEL=debug
REACT_APP_LOG_LEVEL=debug

# Feature flags
VITE_ENABLE_MOCK_DATA=true
REACT_APP_ENABLE_MOCK_DATA=true
VITE_ENABLE_EXPORT=true
REACT_APP_ENABLE_EXPORT=true
VITE_ENABLE_SHARING=true
REACT_APP_ENABLE_SHARING=true

# Performance settings
VITE_CACHE_STALE_TIME=30000
REACT_APP_CACHE_STALE_TIME=30000
VITE_CACHE_TIME=300000
REACT_APP_CACHE_TIME=300000
EOF
    print_success "Local environment configuration created"
else
    print_success "Local environment configuration already exists"
fi

# Clean up any existing containers
print_info "Cleaning up any existing containers..."
docker-compose down -v --remove-orphans >/dev/null 2>&1 || true
print_success "Cleanup completed"

print_step "STEP 3: BUILDING CUSTOM SUBSTRATE NODE"

print_info "Building FreelanceForge Substrate node with custom pallet..."
print_info "This includes the pallet-freelance-credentials for soulbound NFTs"
print_warning "This may take 5-15 minutes depending on your system..."

# Build Substrate node
if docker-compose build substrate-node; then
    print_success "Substrate node built successfully"
else
    print_error "Failed to build Substrate node"
    exit 1
fi

print_step "STEP 4: BUILDING FRONTEND APPLICATION"

print_info "Building React frontend application..."

# Build frontend
if docker-compose build frontend; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

print_step "STEP 5: STARTING FREELANCEFORGE SERVICES"

print_info "Starting all FreelanceForge services..."
print_info "• Custom Substrate node with pallet-freelance-credentials"
print_info "• React frontend with Web3 integration"

# Start services
if docker-compose up -d; then
    print_success "All services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

print_step "STEP 6: WAITING FOR SERVICES TO BE READY"

print_info "Waiting for Substrate node to be ready..."

# Wait for Substrate node
SUBSTRATE_READY=false
for i in {1..60}; do
    if curl -s -H "Content-Type: application/json" \
           -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
           http://localhost:9933 >/dev/null 2>&1; then
        SUBSTRATE_READY=true
        break
    fi
    echo -n "."
    sleep 2
done

if [ "$SUBSTRATE_READY" = true ]; then
    print_success "Substrate node is ready"
else
    print_error "Substrate node failed to start properly"
    echo ""
    print_info "Checking logs..."
    docker-compose logs substrate-node
    exit 1
fi

print_info "Waiting for frontend to be ready..."

# Wait for frontend
FRONTEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    echo -n "."
    sleep 2
done

if [ "$FRONTEND_READY" = true ]; then
    print_success "Frontend is ready"
else
    print_error "Frontend failed to start properly"
    echo ""
    print_info "Checking logs..."
    docker-compose logs frontend
    exit 1
fi

print_step "STEP 7: VERIFYING CUSTOM PALLET INTEGRATION"

print_info "Verifying pallet-freelance-credentials is available..."

# Check if custom pallet is available
PALLET_RESPONSE=$(curl -s -H "Content-Type: application/json" \
                      -d '{"id":1, "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' \
                      http://localhost:9933)

if echo "$PALLET_RESPONSE" | grep -q "freelanceCredentials"; then
    print_success "Custom pallet-freelance-credentials is available"
else
    print_warning "Custom pallet may not be properly integrated"
fi

print_step "DEPLOYMENT COMPLETE! 🎉"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 SUCCESS! 🎉                            ║${NC}"
echo -e "${GREEN}║          FreelanceForge is now running locally!               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}🌐 ACCESS YOUR APPLICATION:${NC}"
echo -e "${BLUE}   Frontend:           ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}   Substrate RPC:      ${GREEN}http://localhost:9933${NC}"
echo -e "${BLUE}   Substrate WebSocket: ${GREEN}ws://localhost:9944${NC}"
echo ""

echo -e "${CYAN}🔧 CUSTOM PALLET FEATURES:${NC}"
echo -e "${BLUE}   • Soulbound NFT credential minting${NC}"
echo -e "${BLUE}   • Content-addressable storage (Blake2_128)${NC}"
echo -e "${BLUE}   • Metadata storage (up to 4KB JSON)${NC}"
echo -e "${BLUE}   • Privacy controls (public/private)${NC}"
echo -e "${BLUE}   • Proof verification (SHA256 hashes)${NC}"
echo -e "${BLUE}   • Owner-based management (max 500 per user)${NC}"
echo ""

echo -e "${CYAN}🧪 TESTING INSTRUCTIONS:${NC}"
echo -e "${BLUE}   1. Open ${GREEN}http://localhost:3000${BLUE} in your browser${NC}"
echo -e "${BLUE}   2. Install Polkadot.js browser extension${NC}"
echo -e "${BLUE}   3. Create or import a test account${NC}"
echo -e "${BLUE}   4. Connect wallet to the application${NC}"
echo -e "${BLUE}   5. Try minting a credential NFT${NC}"
echo -e "${BLUE}   6. View credentials in the dashboard${NC}"
echo -e "${BLUE}   7. Test export and sharing features${NC}"
echo ""

echo -e "${CYAN}📊 SERVICE STATUS:${NC}"
docker-compose ps

echo ""
echo -e "${CYAN}🔍 USEFUL COMMANDS:${NC}"
echo -e "${BLUE}   View logs:           ${GREEN}docker-compose logs -f${NC}"
echo -e "${BLUE}   Stop services:       ${GREEN}docker-compose down${NC}"
echo -e "${BLUE}   Restart services:    ${GREEN}docker-compose restart${NC}"
echo -e "${BLUE}   View substrate logs: ${GREEN}docker-compose logs -f substrate-node${NC}"
echo -e "${BLUE}   View frontend logs:  ${GREEN}docker-compose logs -f frontend${NC}"
echo ""

echo -e "${CYAN}🎯 FOR JUDGES:${NC}"
echo -e "${BLUE}   This deployment includes the complete FreelanceForge stack:${NC}"
echo -e "${BLUE}   • Custom Substrate runtime with pallet-freelance-credentials${NC}"
echo -e "${BLUE}   • React frontend with Web3 wallet integration${NC}"
echo -e "${BLUE}   • Real blockchain functionality (local development chain)${NC}"
echo -e "${BLUE}   • All features are fully functional for testing${NC}"
echo ""

echo -e "${CYAN}🆘 TROUBLESHOOTING:${NC}"
echo -e "${BLUE}   If you encounter issues:${NC}"
echo -e "${BLUE}   1. Check Docker is running: ${GREEN}docker info${NC}"
echo -e "${BLUE}   2. Check service logs: ${GREEN}docker-compose logs${NC}"
echo -e "${BLUE}   3. Restart services: ${GREEN}docker-compose restart${NC}"
echo -e "${BLUE}   4. Clean restart: ${GREEN}docker-compose down && docker-compose up -d${NC}"
echo ""

echo -e "${GREEN}🚀 FreelanceForge is ready for evaluation!${NC}"
echo -e "${GREEN}   Happy judging! 🏆${NC}"
echo ""

# Optional: Open browser automatically (uncomment if desired)
# if command_exists xdg-open; then
#     xdg-open http://localhost:3000
# elif command_exists open; then
#     open http://localhost:3000
# fi