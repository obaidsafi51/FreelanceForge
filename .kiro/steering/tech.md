# FreelanceForge Technical Stack

## Architecture Overview

FreelanceForge is built as a full-stack Web3 application with a custom Substrate blockchain backend and React frontend, designed for the Polkadot ecosystem.

## Backend Stack

### Blockchain Layer

- **Substrate Framework**: Polkadot SDK v1.17.0 (managed via psvm)
- **Custom Pallet**: `pallet-freelance-credentials` for NFT credential management
- **Runtime**: Minimal template runtime with integrated custom pallet
- **Consensus**: Development mode (--dev) for local testing
- **Storage**: On-chain storage maps with BoundedVec for metadata (4KB limit)

### Key Dependencies

- `polkadot-sdk = "2503.0.1"` (unified SDK versioning)
- `codec = "3.7.4"` (SCALE encoding/decoding)
- `scale-info = "2.11.6"` (type information)
- `frame` (Substrate runtime framework)

## Frontend Stack

### Core Framework

- **React 19.2.0**: Latest stable version with concurrent features
- **TypeScript 5.9.3**: Type safety and developer experience
- **Vite 7.2.2**: Fast build tool and dev server
- **React Router 7.9.5**: Client-side routing

### Web3 Integration

- **@polkadot/api 11.3.1**: Blockchain interaction and RPC calls
- **@polkadot/extension-dapp 0.47.6**: Wallet integration (Polkadot.js, Talisman)
- **@polkadot/typegen**: Generate TypeScript types from Substrate metadata

### State Management & UI

- **@tanstack/react-query 5.51.23**: Server state management and caching
- **@mui/material 5.16.7**: Material Design component library
- **@emotion/react & @emotion/styled**: CSS-in-JS styling
- **qrcode.react 3.1.0**: QR code generation for portfolio sharing

## Development Tools

### Package Management

- **psvm (Polkadot SDK Version Manager)**: Manage Substrate dependencies
- **npm**: Frontend package management
- **Cargo**: Rust package management

### Build System

- **Cargo**: Rust compilation with release optimization
- **Vite**: Frontend bundling with TypeScript compilation
- **Docker Compose**: Containerized development environment

### Testing

- **Cargo test**: Substrate pallet unit tests with >80% coverage
- **React Testing Library**: Frontend component testing
- **@polkadot/api mock**: Blockchain interaction testing

## Common Commands

### Development Setup

```bash
# Install psvm and set SDK version
cargo install psvm
cd substrate-node && psvm -v "1.17.0"

# Install all dependencies
npm run setup

# Start full development environment
npm run dev
```

### Backend Development

```bash
# Build Substrate node
npm run build:substrate
# or: cd substrate-node && cargo build --release

# Run local development node
npm run dev:substrate
# or: cd substrate-node && cargo run -- --dev --ws-external --rpc-cors all

# Run pallet tests
npm run test:substrate
# or: cd substrate-node && cargo test
```

### Frontend Development

```bash
# Install frontend dependencies
npm run install:frontend
# or: cd frontend && npm install

# Start React development server
npm run dev:frontend
# or: cd frontend && npm run dev

# Build production frontend
npm run build:frontend
# or: cd frontend && npm run build

# Run frontend tests
npm run test:frontend
# or: cd frontend && npm run test
```

### Docker Operations

```bash
# Start containerized environment
docker-compose up --build

# Clean Docker resources
npm run clean
# or: docker-compose down -v && docker system prune -f
```

## Network Configuration

### Local Development

- **WebSocket**: `ws://localhost:9944`
- **HTTP RPC**: `http://localhost:9933`
- **P2P**: `localhost:30333`

### Paseo Testnet

- **Primary RPC**: `wss://paseo.dotters.network`
- **Explorer**: `https://paseo.subscan.io`
- **Faucet**: Available through Polkadot.js Apps

## Performance Targets

- **Transaction Confirmation**: <3 seconds on Paseo testnet
- **Dashboard Load Time**: <2 seconds
- **Credential Query**: <1 second response time
- **Concurrent Users**: Support 100+ simultaneous connections
- **Cache Strategy**: 60s stale time, 5min cache retention

## Security Considerations

- **Soulbound NFTs**: No transfer functionality implemented
- **Input Validation**: 4KB metadata limit, JSON schema validation
- **Rate Limiting**: Client-side throttling (10/min, 100/hour)
- **Privacy Controls**: Public/private visibility settings
- **Wallet Security**: No private key handling, signature-based auth only
