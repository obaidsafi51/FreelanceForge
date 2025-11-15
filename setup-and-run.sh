#!/bin/bash

# FreelanceForge Local Development Setup and Run Script
# This script installs all dependencies and runs the project locally

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_success "Operating System: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_success "Operating System: macOS"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    # Check available memory (minimum 4GB recommended)
    if [[ "$OS" == "linux" ]]; then
        MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    elif [[ "$OS" == "macos" ]]; then
        MEMORY_BYTES=$(sysctl -n hw.memsize)
        MEMORY_GB=$((MEMORY_BYTES / 1024 / 1024 / 1024))
    fi
    
    if [ "$MEMORY_GB" -lt 4 ]; then
        print_warning "System has ${MEMORY_GB}GB RAM. Minimum 4GB recommended for optimal performance."
    else
        print_success "System memory: ${MEMORY_GB}GB"
    fi
    
    # Check available disk space (minimum 10GB)
    DISK_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -lt 10 ]; then
        print_warning "Available disk space: ${DISK_SPACE}GB. Minimum 10GB recommended."
    else
        print_success "Available disk space: ${DISK_SPACE}GB"
    fi
}

# Function to install system dependencies
install_system_dependencies() {
    print_status "Installing system dependencies..."
    
    if [[ "$OS" == "linux" ]]; then
        # Detect Linux distribution
        if command_exists apt-get; then
            print_status "Detected Debian/Ubuntu system"
            sudo apt-get update
            sudo apt-get install -y \
                curl \
                git \
                build-essential \
                pkg-config \
                libssl-dev \
                protobuf-compiler \
                clang \
                cmake \
                libudev-dev
        elif command_exists yum; then
            print_status "Detected RHEL/CentOS/Fedora system"
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y \
                curl \
                git \
                pkg-config \
                openssl-devel \
                protobuf-compiler \
                clang \
                cmake \
                systemd-devel
        elif command_exists pacman; then
            print_status "Detected Arch Linux system"
            sudo pacman -Syu --noconfirm \
                curl \
                git \
                base-devel \
                pkg-config \
                openssl \
                protobuf \
                clang \
                cmake \
                systemd
        else
            print_error "Unsupported Linux distribution. Please install dependencies manually:"
            print_error "- curl, git, build-essential, pkg-config, libssl-dev, protobuf-compiler, clang, cmake"
            exit 1
        fi
    elif [[ "$OS" == "macos" ]]; then
        print_status "Detected macOS system"
        if ! command_exists brew; then
            print_status "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        brew install \
            curl \
            git \
            pkg-config \
            openssl \
            protobuf \
            cmake
    fi
    
    print_success "System dependencies installed"
}

# Function to install Rust
install_rust() {
    if command_exists rustc; then
        RUST_VERSION=$(rustc --version | awk '{print $2}')
        print_success "Rust already installed: $RUST_VERSION"
    else
        print_status "Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
        print_success "Rust installed successfully"
    fi
    
    # Add wasm32 target for Substrate
    print_status "Adding wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
    
    # Update Rust to latest stable
    print_status "Updating Rust to latest stable..."
    rustup update stable
    rustup default stable
    
    print_success "Rust setup complete"
}

# Function to install Node.js
install_nodejs() {
    if command_exists node; then
        NODE_VERSION=$(node --version)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js already installed: $NODE_VERSION"
        else
            print_warning "Node.js version $NODE_VERSION is too old. Installing Node.js 18..."
            install_nodejs_fresh
        fi
    else
        print_status "Installing Node.js..."
        install_nodejs_fresh
    fi
}

install_nodejs_fresh() {
    if [[ "$OS" == "linux" ]]; then
        # Install Node.js 18 LTS using NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == "macos" ]]; then
        brew install node@18
        brew link node@18 --force
    fi
    print_success "Node.js installed successfully"
}

# Function to install psvm (Polkadot SDK Version Manager)
install_psvm() {
    if command_exists psvm; then
        print_success "psvm already installed"
    else
        print_status "Installing psvm (Polkadot SDK Version Manager)..."
        cargo install psvm
        print_success "psvm installed successfully"
    fi
}

# Function to setup Substrate node
setup_substrate() {
    print_status "Setting up Substrate node..."
    
    cd substrate-node
    
    # Set Polkadot SDK version using psvm
    print_status "Setting Polkadot SDK version to 1.17.0..."
    psvm -v "1.17.0" || {
        print_warning "psvm failed, continuing with existing Cargo.toml configuration"
    }
    
    # Build the Substrate node
    print_status "Building Substrate node (this may take 15-30 minutes)..."
    cargo build --release -p minimal-template-node
    
    cd ..
    print_success "Substrate node setup complete"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install npm dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cp .env.example .env.local
        print_success "Created .env.local file from .env.example"
    else
        print_success ".env.local already exists"
    fi
    
    cd ..
    print_success "Frontend setup complete"
}

# Function to run the application
run_application() {
    print_status "Starting FreelanceForge application..."
    
    # Create a function to handle cleanup
    cleanup() {
        print_status "Shutting down services..."
        if [ ! -z "$SUBSTRATE_PID" ]; then
            kill $SUBSTRATE_PID 2>/dev/null || true
        fi
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Start Substrate node in background
    print_status "Starting Substrate node..."
    cd substrate-node
    cargo run --release -p minimal-template-node -- --dev --rpc-external &
    SUBSTRATE_PID=$!
    cd ..
    
    # Wait a bit for Substrate to start
    sleep 10
    
    # Check if Substrate is running
    if ! kill -0 $SUBSTRATE_PID 2>/dev/null; then
        print_error "Substrate node failed to start"
        exit 1
    fi
    
    print_success "Substrate node started (PID: $SUBSTRATE_PID)"
    print_status "Substrate WebSocket: ws://localhost:9944"
    print_status "Substrate RPC: http://localhost:9933"
    
    # Start frontend in background
    print_status "Starting frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a bit for frontend to start
    sleep 5
    
    # Check if frontend is running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend failed to start"
        cleanup
        exit 1
    fi
    
    print_success "Frontend started (PID: $FRONTEND_PID)"
    print_status "Frontend URL: http://localhost:5173"
    
    echo ""
    echo "🚀 FreelanceForge is now running!"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🔗 Substrate WebSocket: ws://localhost:9944"
    echo "🌐 Substrate RPC: http://localhost:9933"
    echo ""
    echo "📋 Next steps:"
    echo "1. Install Polkadot.js browser extension: https://polkadot.js.org/extension/"
    echo "2. Create or import a wallet account"
    echo "3. Visit http://localhost:5173 to use FreelanceForge"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop the services
    wait
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Test Substrate pallet
    print_status "Running Substrate pallet tests..."
    cd substrate-node
    cargo test
    cd ..
    
    # Test frontend
    print_status "Running frontend tests..."
    cd frontend
    npm run test
    cd ..
    
    print_success "All tests completed"
}

# Function to show help
show_help() {
    echo "FreelanceForge Local Development Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup     Install all dependencies and build the project"
    echo "  run       Start the application (requires setup to be completed first)"
    echo "  test      Run all tests"
    echo "  clean     Clean build artifacts"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # First time setup"
    echo "  $0 run       # Start the application"
    echo "  $0 test      # Run tests"
    echo ""
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    
    # Clean Substrate build
    if [ -d "substrate-node/target" ]; then
        print_status "Cleaning Substrate build artifacts..."
        cd substrate-node
        cargo clean
        cd ..
    fi
    
    # Clean frontend build
    if [ -d "frontend/dist" ]; then
        print_status "Cleaning frontend build artifacts..."
        rm -rf frontend/dist
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Cleaning frontend node_modules..."
        rm -rf frontend/node_modules
    fi
    
    print_success "Build artifacts cleaned"
}

# Main script logic
main() {
    echo "🚀 FreelanceForge Local Development Setup"
    echo "========================================"
    echo ""
    
    case "${1:-setup}" in
        "setup")
            check_system_requirements
            install_system_dependencies
            install_rust
            install_nodejs
            install_psvm
            setup_substrate
            setup_frontend
            echo ""
            print_success "Setup completed successfully!"
            echo ""
            print_status "To start the application, run: $0 run"
            ;;
        "run")
            if [ ! -f "substrate-node/target/release/minimal-template-node" ]; then
                print_error "Substrate node not built. Please run '$0 setup' first."
                exit 1
            fi
            if [ ! -d "frontend/node_modules" ]; then
                print_error "Frontend dependencies not installed. Please run '$0 setup' first."
                exit 1
            fi
            run_application
            ;;
        "test")
            run_tests
            ;;
        "clean")
            clean_build
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"