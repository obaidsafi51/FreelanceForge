# 🚀 FreelanceForge - One-Command Deployment

## For Judges & Quick Evaluation

### Prerequisites

- **Docker** (with Docker Compose)
- **8GB RAM** minimum
- **10GB free disk space**

### Deploy in 30 seconds:

```bash
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge
./deploy-local.sh
```

### Verify deployment:

```bash
./verify-deployment.sh
```

### Access the application:

- **Frontend**: http://localhost:3000
- **Substrate RPC**: http://localhost:9933
- **Substrate WebSocket**: ws://localhost:9944

## What You Get

✅ **Complete FreelanceForge stack**:

- Custom Substrate node with `pallet-freelance-credentials`
- React frontend with Web3 wallet integration
- Soulbound NFT credential minting
- Trust score calculation
- Portfolio dashboard and export features

✅ **Ready for testing**:

- Install Polkadot.js browser extension
- Connect wallet and mint credentials
- Test all features immediately

## Troubleshooting

If anything goes wrong:

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean restart
docker-compose down && ./deploy-local.sh
```

## For Detailed Instructions

See `README_JUDGES.md` for comprehensive testing guide.

---

**Total deployment time**: ~5-10 minutes
**Ready for evaluation**: ✅
