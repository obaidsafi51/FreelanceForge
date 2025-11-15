# FreelanceForge Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup (5-15 minutes)

```bash
git clone <repository-url>
cd freelanceforge
./setup-and-run.sh setup
```

This will automatically:

- Install system dependencies (Rust, Node.js, build tools)
- Install psvm (Polkadot SDK Version Manager)
- Build the Substrate node (~10-15 minutes)
- Install frontend dependencies
- Configure environment files

### Step 2: Start the Application

```bash
./setup-and-run.sh run
```

This starts both:

- Substrate blockchain node on `ws://localhost:9944` (WebSocket) and `http://localhost:9933` (RPC)
- React frontend on `http://localhost:5173`

### Step 3: Setup Wallet & Test

1. **Install Polkadot.js Extension**

   - Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/)

2. **Create or Import Account**

   - Open the extension
   - Create a new account or import existing one
   - Save your seed phrase securely

3. **Visit the Application**
   - Go to `http://localhost:5173`
   - Connect your wallet
   - Start minting credentials!

## 🧪 Verify Everything Works

```bash
# Check setup
./verify-setup.sh

# Test running application (run this after starting the app)
./test-local.sh
```

## 🛠️ Development Commands

```bash
# Start just the Substrate node
npm run dev:substrate

# Start just the frontend
npm run dev:frontend

# Run tests
npm run test

# Clean build artifacts
npm run clean

# Get help
npm run help
```

## 🔧 Troubleshooting

### Common Issues

**Build fails with "linker error":**

```bash
# Install build dependencies
sudo apt-get install build-essential pkg-config libssl-dev
```

**"Permission denied" errors:**

```bash
chmod +x setup-and-run.sh verify-setup.sh test-local.sh
```

**Port already in use:**

```bash
# Check what's using the ports
lsof -i :9944  # Substrate WebSocket
lsof -i :9933  # Substrate RPC
lsof -i :5173  # Frontend

# Kill processes if needed
sudo kill -9 <PID>
```

**Frontend won't connect to Substrate:**

- Make sure Substrate node is running first
- Check `frontend/.env.local` has correct WebSocket URL
- Verify firewall isn't blocking ports

### Getting Help

1. **Check logs**: Look at terminal output for error messages
2. **Verify setup**: Run `./verify-setup.sh`
3. **Clean rebuild**: Run `npm run clean` then `npm run setup`
4. **Check documentation**: See `docs/` folder for detailed guides

## 📚 What's Next?

Once you have FreelanceForge running:

1. **Explore the Features**

   - Mint different types of credentials (skills, reviews, payments, certifications)
   - View your trust score calculation
   - Export your portfolio as JSON
   - Share your public portfolio

2. **Test with Mock Data**

   - Use the import feature to load sample credentials
   - Test the batch minting functionality

3. **Customize and Extend**
   - Modify the trust score algorithm
   - Add new credential types
   - Integrate with external platforms

## 🎯 Key Features to Test

- ✅ **Credential Minting**: Create soulbound NFT credentials
- ✅ **Trust Score**: Automated calculation from your credentials
- ✅ **Dashboard**: Timeline view of all your credentials
- ✅ **Export**: Download your portfolio as JSON
- ✅ **Sharing**: Generate public portfolio links and QR codes
- ✅ **Privacy**: Control which credentials are public/private

---

**Happy building with FreelanceForge!** 🚀
