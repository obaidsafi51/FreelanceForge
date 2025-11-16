// Simple test to check what address format the wallet is using
const { web3Accounts, web3Enable } = require("@polkadot/extension-dapp");

async function testWalletAddress() {
  try {
    console.log("Enabling web3...");
    const extensions = await web3Enable("FreelanceForge");

    if (extensions.length === 0) {
      console.log("No wallet extension found");
      return;
    }

    console.log("Getting accounts...");
    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      console.log("No accounts found");
      return;
    }

    console.log("Found accounts:");
    accounts.forEach((account, index) => {
      console.log(`Account ${index}:`);
      console.log(`  Address: ${account.address}`);
      console.log(`  Name: ${account.meta.name}`);
      console.log(`  Source: ${account.meta.source}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

testWalletAddress();
