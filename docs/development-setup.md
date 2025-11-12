# Development Setup Guide

This guide will help you set up the FreelanceForge development environment on your local machine.

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+), macOS (10.15+), or Windows (WSL2)
- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: At least 10GB free space
- **Internet**: Stable connection for downloading dependencies

### Required Software

1. **Rust Toolchain** (1.70.0 or later)

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   rustup default stable
   rustup update
   rustup target add wasm32-unknown-unknown
   ```

2. **Node.js** (18.0.0 or later)

   ```bash
   # Using Node Version Manager (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

3. **Docker & Docker Compose**

   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   sudo usermod -aG docker $USER

   # macOS (using Homebrew)
   brew install docker docker-compose
   ```

4. **Protocol Buffers Compiler**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install protobuf-compiler

   # macOS
   brew install protobuf
   ```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm run install:frontend

# Build substrate node (this may take 10-15 minutes on first run)
npm run build:substrate
```

### 3. Start Development Environment

```bash
# Option 1: Using Docker Compose (recommended)
npm run dev

# Option 2: Manual startup
# Terminal 1: Start Substrate node
npm run dev:substrate

# Terminal 2: Start frontend
npm run dev:frontend
```

### 4. Verify Setup

1. **Substrate Node**: Visit [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer)
2. **Frontend**: Open [http://localhost:3000](http://localhost:3000)
3. **Wallet**: Install [Polkadot.js Extension](https://polkadot.js.org/extension/)

## Development Workflow

### File Structure

```
freelanceforge/
├── substrate-node/          # Substrate blockchain node
│   ├── pallets/            # Custom pallets
│   ├── runtime/            # Runtime configuration
│   └── node/               # Node implementation
├── frontend/               # React frontend application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── docs/                   # Documentation
└── docker-compose.yml      # Development environment
```

### Available Scripts

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start full development environment     |
| `npm run dev:frontend`  | Start only frontend development server |
| `npm run dev:substrate` | Start only Substrate node              |
| `npm run build`         | Build both frontend and substrate      |
| `npm run test`          | Run all tests                          |
| `npm run clean`         | Clean Docker containers and images     |

### Hot Reloading

- **Frontend**: Automatic reload on file changes
- **Substrate**: Manual restart required after pallet changes

## Troubleshooting

### Common Issues

#### 1. Rust Compilation Errors

```bash
# Update Rust toolchain
rustup update stable
rustup target add wasm32-unknown-unknown

# Clear cargo cache
cargo clean
```

#### 2. Node.js Version Issues

```bash
# Check Node version
node --version  # Should be 18.0.0+

# Switch Node version
nvm use 18
```

#### 3. Docker Permission Issues

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

#### 4. Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :9944  # Substrate WebSocket
sudo lsof -i :3000  # Frontend

# Kill processes if needed
sudo kill -9 <PID>
```

#### 5. Protobuf Compiler Missing

```bash
# Ubuntu/Debian
sudo apt-get install protobuf-compiler

# macOS
brew install protobuf

# Verify installation
protoc --version
```

### Performance Optimization

#### 1. Substrate Build Optimization

```bash
# Use release mode for faster runtime
cargo build --release

# Parallel compilation
export CARGO_BUILD_JOBS=4
```

#### 2. Frontend Development

```bash
# Enable fast refresh
export FAST_REFRESH=true

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## IDE Setup

### VS Code (Recommended)

Install these extensions:

1. **Rust Analyzer** - Rust language support
2. **ES7+ React/Redux/React-Native snippets** - React snippets
3. **Prettier** - Code formatting
4. **GitLens** - Git integration
5. **Thunder Client** - API testing

### Configuration

Create `.vscode/settings.json`:

```json
{
  "rust-analyzer.cargo.features": "all",
  "rust-analyzer.checkOnSave.command": "clippy",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Testing Setup

### Unit Tests

```bash
# Substrate pallet tests
cd substrate-node
cargo test

# Frontend tests
cd frontend
npm test
```

### Integration Tests

```bash
# Full integration test suite
npm run test:integration
```

### Manual Testing

1. **Wallet Connection**: Test with Polkadot.js extension
2. **Transaction Signing**: Verify transaction details display
3. **Error Handling**: Test network disconnection scenarios
4. **Performance**: Test with 100+ credentials

## Environment Variables

### Frontend (.env.local)

```bash
REACT_APP_WS_PROVIDER=ws://localhost:9944
REACT_APP_NETWORK=local
REACT_APP_EXPLORER_URL=https://polkadot.js.org/apps
```

### Substrate (optional)

```bash
RUST_LOG=debug
RUST_BACKTRACE=1
```

## Next Steps

1. Read the [API Documentation](api-reference.md)
2. Check out the [Testing Guide](testing.md)
3. Review [Security Guidelines](security.md)
4. Join our [Discord community](#) for support

## Getting Help

- **Documentation**: Check this guide and other docs in `/docs`
- **Issues**: Search [GitHub Issues](https://github.com/freelanceforge/freelanceforge/issues)
- **Community**: Join our [Discord server](#)
- **Support**: Create a [new issue](https://github.com/freelanceforge/freelanceforge/issues/new)

---

Last updated: November 2024
