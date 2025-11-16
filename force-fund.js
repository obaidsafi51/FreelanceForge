const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

async function forceFund() {
  await cryptoWaitReady();

  console.log("Connecting to substrate node...");
  const provider = new WsProvider("ws://localhost:9944");
  const api = await ApiPromise.create({ provider });

  await api.isReady;
  console.log("Connected to blockchain");

  // Create keyring for dev accounts
  const keyring = new Keyring({ type: "sr25519" });

  // Add Alice (has initial funds in dev mode)
  const alice = keyring.addFromUri("//Alice");
  console.log("Alice address:", alice.address);

  // Target account to fund
  const targetAddress = "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV";
  console.log("Target address:", targetAddress);

  // Check current balance
  const accountInfo = await api.query.system.account(targetAddress);
  console.log("Current balance:", accountInfo.data.free.toHuman());

  // Force set balance using sudo
  const amount = 1000n * 1000000000000n; // 1000 units with 12 decimals

  console.log("Force setting balance...");
  const forceTransfer = api.tx.balances.forceSetBalance(targetAddress, amount);
  const sudoCall = api.tx.sudo.sudo(forceTransfer);

  await new Promise((resolve, reject) => {
    sudoCall.signAndSend(alice, (result) => {
      console.log("Transaction status:", result.status.type);

      if (result.status.isInBlock) {
        console.log(
          "Transaction included in block:",
          result.status.asInBlock.toString()
        );
      } else if (result.status.isFinalized) {
        console.log(
          "Transaction finalized:",
          result.status.asFinalized.toString()
        );
        resolve(true);
      } else if (result.isError) {
        reject(new Error("Transaction failed"));
      }
    });
  });

  // Check balance after
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const newAccountInfo = await api.query.system.account(targetAddress);
  console.log("New balance:", newAccountInfo.data.free.toHuman());

  if (newAccountInfo.data.free.toBigInt() > 0n) {
    console.log("✅ Account funded successfully!");
  } else {
    console.log("❌ Failed to fund account");
  }

  await api.disconnect();
}

forceFund().catch(console.error);
