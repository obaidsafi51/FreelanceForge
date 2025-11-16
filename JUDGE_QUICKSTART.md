# 🏛️ FreelanceForge Judge Quickstart

**For judges who want to get up and running in under 5 minutes.**

## ⚡ Super Quick Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd freelanceforge

# 2. Run the judge setup (this does everything!)
./setup-and-run.sh judge
```

**That's it!** The script will:

- ✅ Install all dependencies automatically
- ✅ Build the project (takes 15-30 minutes first time)
- ✅ Start the blockchain and frontend
- ✅ Ask for your wallet address
- ✅ Fund your wallet with test tokens
- ✅ Open the application ready for testing

## 📱 Get Your Wallet Address

While the build is running, get your wallet ready:

1. **Install Polkadot.js Extension**: https://polkadot.js.org/extension/
2. **Create Account**: Click "+" → "Create new account"
3. **Copy Address**: It looks like `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`

## 🎯 What to Test

Once running at **http://localhost:5173**:

### Core Features (5 minutes)

1. **Connect Wallet** - Use Polkadot.js extension
2. **Create Credential** - Add a skill or work experience
3. **View Dashboard** - See your credentials and trust score
4. **Export Portfolio** - Download JSON or generate QR code

### Advanced Features (10 minutes)

1. **Import Mock Data** - Test with sample freelancer data
2. **Filter Credentials** - Use timeline filters
3. **Share Portfolio** - Test public portfolio links
4. **Trust Score** - Verify calculation accuracy

## 🚨 If Something Goes Wrong

**Build fails?**

```bash
# Clean and try again
./setup-and-run.sh clean
./setup-and-run.sh judge
```

**Can't connect wallet?**

- Make sure Polkadot.js extension is installed
- Refresh the page
- Check browser console for errors

**Funding fails?**

```bash
# Manual funding
node fund-account.js YOUR_WALLET_ADDRESS
```

**Need help?**

- Check [JUDGE_SETUP.md](JUDGE_SETUP.md) for detailed troubleshooting
- Look at terminal output for specific error messages

## 📊 Expected Performance

- **Setup Time**: 20-40 minutes (first time only)
- **Startup**: 30-60 seconds
- **Transaction Speed**: 2-6 seconds
- **Dashboard Load**: <2 seconds

## ✅ Success Criteria

The application is working correctly if you can:

- ✅ Connect your wallet and see funded balance
- ✅ Create and mint credential NFTs
- ✅ View credentials in the dashboard
- ✅ Export portfolio data
- ✅ Calculate trust scores

## 📞 Quick Support

**Common Issues:**

- Port conflicts: Kill processes on 9944, 9933, 5173
- Memory issues: Ensure 4GB+ RAM available
- Build timeout: Let it run, first build takes time

**Contact:** Check GitHub issues or documentation for detailed help.

---

**Ready to evaluate FreelanceForge? Run `./setup-and-run.sh judge` and you'll be testing in minutes!** 🚀
