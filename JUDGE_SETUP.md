# FreelanceForge Judge Setup Guide

Welcome judges! This guide will help you quickly set up and run FreelanceForge for evaluation.

## 🚀 Quick Start (Recommended for Judges)

For the fastest setup experience, use our automated judge setup:

```bash
# Make the script executable
chmod +x setup-and-run.sh

# Run the complete judge setup
./setup-and-run.sh judge
```

**OR using npm:**

```bash
npm run judge
```

This single command will:

1. ✅ Install all system dependencies
2. ✅ Build the Substrate blockchain node
3. ✅ Set up the React frontend
4. ✅ Start both services
5. ✅ Fund your wallet with test tokens
6. ✅ Open the application ready for testing

## 📋 What You'll Need

### System Requirements

- **OS**: Linux or macOS
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 10GB free space
- **Internet**: Required for initial setup

### Browser Extension

- **Polkadot.js Extension**: [Install here](https://polkadot.js.org/extension/)

## 🔧 Step-by-Step Process

### 1. Get Your Wallet Address

Before running the judge setup, you'll need a Polkadot wallet address:

1. Install the [Polkadot.js browser extension](https://polkadot.js.org/extension/)
2. Create a new account or import an existing one
3. Copy your account address (it starts with '5' and is 48 characters long)
   - Example: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`

### 2. Run Judge Setup

```bash
./setup-and-run.sh judge
```

The script will:

- Check your system and install dependencies
- Build the project (this takes 15-30 minutes on first run)
- Prompt you for your wallet address
- Start the blockchain node and frontend
- Automatically fund your wallet with 1000 test tokens

### 3. Access the Application

Once setup is complete, you'll see:

```
🚀 FreelanceForge is now running!

📱 Frontend: http://localhost:5173
🔗 Substrate WebSocket: ws://localhost:9944
🌐 Substrate RPC: http://localhost:9933

💰 Your wallet has been funded with test tokens!
```

Visit **http://localhost:5173** to start testing FreelanceForge.

## 🧪 Testing Features

### Core Functionality to Test

1. **Wallet Connection**

   - Connect your Polkadot.js wallet
   - Verify your funded balance appears

2. **Credential Minting**

   - Create skill credentials
   - Add work experience entries
   - Upload certifications
   - Record payment history

3. **Portfolio Dashboard**

   - View your credential timeline
   - Check trust score calculation
   - Filter credentials by type

4. **Export & Sharing**

   - Export portfolio as JSON
   - Generate QR code for sharing
   - Test public portfolio links

5. **Mock Data Import**
   - Import sample freelancer data
   - Verify data appears correctly

### Sample Test Data

The application includes mock data you can import to quickly test features:

```json
{
  "skills": ["JavaScript", "React", "Blockchain"],
  "experience": [
    {
      "title": "Frontend Developer",
      "company": "Tech Startup",
      "duration": "6 months",
      "rating": 4.8
    }
  ],
  "certifications": ["AWS Certified", "Polkadot Developer"],
  "payments": [
    {
      "amount": 5000,
      "currency": "USD",
      "date": "2024-01-15",
      "verified": true
    }
  ]
}
```

## 🛠️ Alternative Setup Methods

### Manual Setup (if automated setup fails)

```bash
# 1. Install dependencies
./setup-and-run.sh setup

# 2. Start services
./setup-and-run.sh run

# 3. In another terminal, fund your wallet
./setup-and-run.sh fund YOUR_WALLET_ADDRESS
```

### Individual Commands

```bash
# Build only
npm run build

# Start frontend only
npm run dev:frontend

# Start blockchain only
npm run dev:substrate



# Clean build artifacts
npm run clean
```

## 🔍 Troubleshooting

### Common Issues

**1. "Substrate node failed to start"**

```bash
# Check if port 9944 is in use
lsof -i :9944

# Kill any existing processes
pkill -f minimal-template-node

# Try again
./setup-and-run.sh judge
```

**2. "Frontend failed to start"**

```bash
# Check if port 5173 is in use
lsof -i :5173

# Clean and reinstall
npm run clean
cd frontend && rm -rf node_modules && npm install
cd .. && ./setup-and-run.sh judge
```

**3. "Wallet funding failed"**

```bash
# Try manual funding
node fund-account.js YOUR_WALLET_ADDRESS

# Or force funding
node force-fund.js
```

**4. Build takes too long**

- First build can take 15-30 minutes
- Subsequent builds are much faster
- Ensure you have at least 4GB RAM available

### Getting Help

If you encounter issues:

1. Check the terminal output for specific error messages
2. Ensure all system requirements are met
3. Try the manual setup method
4. Contact the development team with error logs

## 📊 Performance Expectations

- **Initial Setup**: 15-30 minutes (first time only)
- **Startup Time**: 30-60 seconds
- **Transaction Speed**: 2-6 seconds
- **Dashboard Load**: <2 seconds
- **Memory Usage**: ~2GB during operation

## 🎯 Evaluation Criteria

When testing FreelanceForge, please consider:

### Functionality

- ✅ All core features work as expected
- ✅ Wallet integration is smooth
- ✅ Transactions complete successfully
- ✅ Data persists correctly

### User Experience

- ✅ Interface is intuitive and responsive
- ✅ Loading times are acceptable
- ✅ Error messages are helpful
- ✅ Navigation is clear

### Technical Implementation

- ✅ Blockchain integration works properly
- ✅ NFT credentials are created correctly
- ✅ Trust score calculation is accurate
- ✅ Export functionality works

### Innovation

- ✅ Solves real freelancer problems
- ✅ Leverages blockchain benefits effectively
- ✅ Provides value over existing solutions

## 📞 Support

For technical support during evaluation:

- Check the troubleshooting section above
- Review logs in the terminal output
- Ensure all prerequisites are installed

Thank you for evaluating FreelanceForge! 🚀
