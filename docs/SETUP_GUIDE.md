# FreelanceForge Setup Guide

## Project Structure

The FreelanceForge project consists of three main components:

```
FreelanceForge/
├── substrate-node/         # Polkadot Substrate blockchain node
├── frontend/               # React + TypeScript frontend application
├── docs/                   # Documentation
└── setup-and-run.sh        # Local development script
```

## Quick Setup (Recommended)

The easiest way to get started is using the automated setup script:

```bash
git clone <repository-url>
cd freelanceforge
./setup-and-run.sh setup
```

This script will automatically install all dependencies and build the project.

## Manual Setup

If you prefer to install dependencies manually:

### Required Software

- **Rust** (latest stable): For building the Substrate node

  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup default stable
  rustup update
  rustup target add wasm32-unknown-unknown
  ```

- **Node.js** (v18 or later) and **npm**: For the frontend

  ```bash
  # Using nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```

- **System Dependencies**: Build tools and libraries

  ```bash
  # Ubuntu/Debian
  sudo apt-get update
  sudo apt-get install -y build-essential pkg-config libssl-dev protobuf-compiler clang cmake

  # macOS (using Homebrew)
  brew install pkg-config openssl protobuf cmake
  ```

- **psvm** (Polkadot SDK Version Manager): For managing Substrate dependencies

  ```bash
  # Install system dependencies first
  sudo apt-get install -y pkg-config libssl-dev

  # Install psvm
  cargo install psvm
  ```

### Optional but Recommended

- **Polkadot.js Browser Extension**: For wallet functionality
  - Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/
  - Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

## Initial Setup

### 1. Clone and Setup Project Structure

The project structure has been initialized with:

- Substrate node from the minimal template
- React frontend with Vite and TypeScript
- Docker configuration for local development

### 2. Setup Substrate Node

```bash
cd substrate-node

# Verify psvm installation
psvm -l  # List available Polkadot SDK versions

# Update to Polkadot SDK version 1.7.0 (already done in template)
psvm -v "1.7.0"

# Check compatibility without updating
psvm -v "1.7.0" -c

# Build the node (takes 15-30 minutes on first build)
cargo build --release

# Run the development node
cargo run --release -- --dev --ws-external --rpc-cors all
```

The node will be available at:

- WebSocket: `ws://localhost:9944`
- HTTP RPC: `http://localhost:9933`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 4. Using Docker Compose (Recommended for Development)

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

## Frontend Dependencies

The frontend includes the following key dependencies (as specified in Task 1):

### Core Dependencies

- **@polkadot/api**: `^11.3.1` - Polkadot.js API for blockchain interaction
- **@polkadot/extension-dapp**: `^0.47.6` - Wallet integration
- **@tanstack/react-query**: `^5.51.23` - State management and caching
- **@mui/material**: `^5.16.7` - Material-UI components
- **qrcode.react**: `^3.1.0` - QR code generation for portfolio sharing
- **react**: `^19.2.0` - React library
- **react-dom**: `^19.2.0` - React DOM renderer
- **react-router-dom**: `^7.9.5` - Client-side routing

### Development Dependencies

- **vite**: `^7.2.2` - Build tool and dev server
- **typescript**: `~5.9.3` - TypeScript compiler
- **@vitejs/plugin-react**: `^5.1.0` - Vite React plugin
- **eslint**: `^9.39.1` - Code linting

## Polkadot SDK Version Management with psvm

### What is psvm?

psvm (Polkadot SDK Version Manager) is the recommended tool for managing Polkadot SDK dependencies. It automatically updates all related crates to compatible versions.

### Key Commands

```bash
# List all available Polkadot SDK versions
psvm -l

# Update to a specific version
psvm -v "1.7.0"

# Check compatibility without making changes
psvm -v "1.7.0" -c

# View current version
psvm --version
```

### How It Works

psvm fetches the `Plan.toml` file from the Polkadot SDK release branch and generates a mapping of all crates to their correct versions. This ensures:

- All dependencies are synchronized
- Version compatibility across the entire SDK
- No manual version management required

### Advantages Over Manual Updates

- ✅ Automatic version synchronization
- ✅ Prevents version conflicts
- ✅ Ensures compatibility
- ✅ Saves time and reduces errors
- ✅ Works with Cargo workspaces

## Development Workflow

### Starting Development

1. **Terminal 1 - Substrate Node:**

   ```bash
   cd substrate-node
   cargo run --release -- --dev --ws-external --rpc-cors all
   ```

2. **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Browser:**
   - Open `http://localhost:5173`
   - Install Polkadot.js extension if not already installed
   - Create or import a test account

### Using Docker Compose

```bash
# Start everything at once
docker-compose up --build

# The services will be available at:
# - Frontend: http://localhost:3000
# - Substrate WebSocket: ws://localhost:9944
# - Substrate HTTP RPC: http://localhost:9933
```

## Testing

### Substrate Node Tests

```bash
cd substrate-node
cargo test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Integration Tests

```bash
# From project root
npm test
```

## Building for Production

### Substrate Node

```bash
cd substrate-node
cargo build --release
# Binary will be at: target/release/minimal-template-node
```

### Frontend

```bash
cd frontend
npm run build
# Output will be in: dist/
```

### Docker Images

```bash
# Build production images
docker-compose build

# Push to registry (configure in docker-compose.yml)
docker-compose push
```

## Troubleshooting

### Substrate Build Issues

**Problem**: OpenSSL linking errors

```bash
# Solution: Install development libraries
sudo apt-get install -y pkg-config libssl-dev
```

**Problem**: wasm32 target not found

```bash
# Solution: Add the wasm32 target
rustup target add wasm32-unknown-unknown
```

**Problem**: Cargo cache issues

```bash
# Solution: Clean and rebuild
cargo clean
cargo build --release
```

### Frontend Issues

**Problem**: Node modules issues

```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Port already in use

```bash
# Solution: Change port in vite.config.ts or kill process
lsof -ti:5173 | xargs kill -9
```

### Docker Issues

**Problem**: Permission denied

```bash
# Solution: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Problem**: Container won't start

```bash
# Solution: Check logs and clean up
docker-compose logs
docker-compose down -v
docker system prune -f
```

## Environment Variables

### Frontend (.env)

Create a `.env` file in the `frontend/` directory:

```env
VITE_WS_PROVIDER=ws://localhost:9944
VITE_NETWORK=local
VITE_APP_NAME=FreelanceForge
```

### Substrate Node

Environment variables are configured in `docker-compose.yml`:

```yaml
environment:
  - RUST_LOG=debug
```

## Next Steps

After completing the setup:

1. **Task 2**: Implement the core Substrate pallet for credential NFTs
2. **Task 3**: Add comprehensive unit tests
3. **Task 4**: Integrate pallet into runtime and deploy locally
4. **Task 5**: Create React application foundation with wallet integration

See `tasks.md` for the complete implementation plan.

## Additional Resources

- [Polkadot SDK Documentation](https://docs.substrate.io/)
- [Polkadot.js API Documentation](https://polkadot.js.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Material-UI Documentation](https://mui.com/)
- [psvm GitHub Repository](https://github.com/paritytech/psvm)

## Support

For issues or questions:

- Check the documentation in `docs/`
- Review the implementation plan in `tasks.md`
- Refer to the Product Requirements Document in `PRD.md`
