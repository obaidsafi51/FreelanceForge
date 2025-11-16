# FreelanceForge

A decentralized application (dApp) built on the Polkadot blockchain that aggregates freelance credentials into portable, verifiable NFT-based digital identities.

## 🚀 Quick Start

### 🏛️ For Judges (Recommended)

**⚡ 5-Minute Setup - Complete setup with wallet funding in one command:**

```bash
# Clone the repository
git clone <repository-url>
cd freelanceforge

# Run complete judge setup (installs everything + funds wallet)
./setup-and-run.sh judge
```

This will:

- ✅ Install all dependencies
- ✅ Build the project
- ✅ Start both services
- ✅ Fund your wallet with test tokens
- ✅ Open the application ready for testing

📖 **Quick Guide**: [JUDGE_QUICKSTART.md](JUDGE_QUICKSTART.md) | **Detailed Guide**: [JUDGE_SETUP.md](JUDGE_SETUP.md)

### 🔧 For Developers

**Prerequisites**: Linux or macOS system with internet connection

```bash
# Clone and setup everything
git clone <repository-url>
cd freelanceforge
./setup-and-run.sh setup
```

**Then start the application:**

```bash
./setup-and-run.sh run
```

✅ **That's it!** Access at `http://localhost:5173`

📖 **For detailed instructions**: See [QUICKSTART.md](QUICKSTART.md)

The setup script will automatically install:

- System dependencies (build tools, SSL libraries, etc.)
- Rust with wasm32 target
- Node.js 18+
- psvm (Polkadot SDK Version Manager)
- All project dependencies

### 🛠️ Manual Development Setup

If you prefer to install dependencies manually:

**Prerequisites**:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (latest stable with wasm32 target)
- [psvm](https://github.com/paritytech/psvm) - Polkadot SDK Version Manager (`cargo install psvm`)
- System dependencies: `pkg-config`, `libssl-dev` (Ubuntu/Debian) or `openssl-devel` (Fedora)
- [Polkadot.js Extension](https://polkadot.js.org/extension/) for wallet integration

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd freelanceforge
   ```

2. **Install system dependencies (Ubuntu/Debian)**

   ```bash
   sudo apt-get update
   sudo apt-get install -y pkg-config libssl-dev build-essential clang cmake protobuf-compiler
   ```

3. **Install Rust and wasm32 target**

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   rustup target add wasm32-unknown-unknown
   ```

4. **Install psvm (Polkadot SDK Version Manager)**

   ```bash
   cargo install psvm
   ```

5. **Setup Polkadot SDK version**

   ```bash
   cd substrate-node
   psvm -v "1.17.0"
   cd ..
   ```

6. **Install dependencies and build**

   ```bash
   npm run setup
   ```

7. **Start development environment**

   ```bash
   npm run dev
   ```

   This will start:

   - Substrate node on `ws://localhost:9944` (WebSocket) and `http://localhost:9933` (RPC)
   - React frontend on `http://localhost:5173`

### Alternative: Manual Development

**Start Substrate node:**

```bash
npm run dev:substrate
```

**Start React frontend:**

```bash
npm run dev:frontend
```

## 🏗️ Project Structure

```
freelanceforge/
├── substrate-node/          # Substrate blockchain node
│   ├── node/               # Node implementation
│   ├── runtime/            # Runtime logic
│   ├── pallets/            # Custom pallets
│   └── Dockerfile          # Container configuration
├── frontend/               # React.js frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── Dockerfile         # Container configuration
│   └── package.json       # Dependencies and scripts
├── docs/                  # Documentation
├── setup-and-run.sh      # Local development script
└── package.json          # Root project scripts
```

## 🛠️ Available Scripts

- `npm run setup` - Install all dependencies and build the project
- `npm run dev` - Start full development environment (Substrate + Frontend)
- `npm run start` - Alias for `npm run dev`
- `npm run judge` - **Complete judge setup (setup + run + fund wallet)**
- `npm run fund` - Fund a wallet address with test tokens
- `npm run build` - Build both frontend and substrate node

- `npm run clean` - Clean build artifacts
- `npm run help` - Show available commands

### Direct Script Usage

- `./setup-and-run.sh setup` - Complete setup from scratch
- `./setup-and-run.sh run` - Start the application
- `./setup-and-run.sh judge` - **Judge setup (recommended for evaluation)**
- `./setup-and-run.sh fund <address>` - Fund specific wallet address

- `./setup-and-run.sh clean` - Clean build artifacts
- `./setup-and-run.sh help` - Show help

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**

```
REACT_APP_WS_PROVIDER=ws://localhost:9944
REACT_APP_NETWORK=local
```

### Network Endpoints

- **Local Development**:
  - WebSocket: `ws://localhost:9944`
  - RPC: `http://localhost:9933`
  - Frontend: `http://localhost:5173`
- **Paseo Testnet**: `wss://paseo.dotters.network` (for production deployment)

## 📚 Documentation

- **[Judge Setup Guide](JUDGE_SETUP.md)** - **Complete setup guide for judges/evaluators**
- [Setup Guide](docs/SETUP_GUIDE.md) - Comprehensive setup and development guide
- [psvm Guide](docs/PSVM_GUIDE.md) - Polkadot SDK Version Manager documentation
- [Development Setup](docs/development-setup.md) - Additional development resources
- [Implementation Tasks](/.kiro/specs/freelanceforge/tasks.md) - Detailed task breakdown

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [GitHub Issues](https://github.com/freelanceforge/freelanceforge/issues)
- [Documentation](docs/)
- [Discord Community](#)

---

Built with ❤️ for the Polkadot ecosystem
