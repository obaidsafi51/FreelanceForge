# FreelanceForge

A decentralized application (dApp) built on the Polkadot blockchain that aggregates freelance credentials into portable, verifiable NFT-based digital identities.

## 🚀 Quick Start

### 🏆 For Judges & Quick Evaluation (One Command!)

**Prerequisites**: Only [Docker](https://docs.docker.com/get-docker/) required

```bash
# Clone and deploy in 30 seconds
git clone <repository-url>
cd freelanceforge
./deploy-local.sh
```

✅ **That's it!** Access at `http://localhost:3000`

📋 **Verify everything works**: `./verify-deployment.sh`

📖 **Detailed judge instructions**: See `README_JUDGES.md`

### 🛠️ Development Setup

**Prerequisites**:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
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
   sudo apt-get install -y pkg-config libssl-dev
   ```

3. **Install psvm (Polkadot SDK Version Manager)**

   ```bash
   cargo install psvm
   ```

4. **Verify Polkadot SDK version**

   ```bash
   cd substrate-node
   psvm -v "1.7.0"  # Already configured to use SDK 1.7.0
   cd ..
   ```

5. **Install dependencies**

   ```bash
   npm run setup
   ```

6. **Start development environment**

   ```bash
   npm run dev
   ```

   This will start:

   - Substrate node on `ws://localhost:9944`
   - React frontend on `http://localhost:3000`

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
├── docker-compose.yml     # Development environment
└── package.json          # Root project scripts
```

## 🛠️ Available Scripts

- `npm run dev` - Start full development environment with Docker
- `npm run build` - Build both frontend and substrate node
- `npm run test` - Run all tests
- `npm run clean` - Clean Docker containers and images

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**

```
REACT_APP_WS_PROVIDER=ws://localhost:9944
REACT_APP_NETWORK=local
```

### Network Endpoints

- **Local Development**: `ws://localhost:9944`
- **Paseo Testnet**: `wss://paseo.dotters.network`

## 📚 Documentation

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
