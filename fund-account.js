const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

async function fundAccount() {
  await cryptoWaitReady();

  try {
    console.log("Connecting to local node...");
    const provider = new WsProvider("ws://localhost:9944");
    const api = await ApiPromise.create({ provider });

    console.log("Connected successfully!");

    // Create keyring for dev accounts
    const keyring = new Keyring({ type: "sr25519" });

    // Add Alice (has initial funds in dev mode)
    const alice = keyring.addFromUri("//Alice");
    console.log("Alice address:", alice.address);

    // Get your account address from the command line argument
    const targetAddress = process.argv[2];
    if (!targetAddress) {
      console.log("Usage: node fund-account.js <your-account-address>");
      console.log(
        "Example: node fund-account.js 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      );
      process.exit(1);
    }

    console.log("Target address:", targetAddress);

    // Check Alice's balance
    const aliceInfo = await api.query.system.account(alice.address);
    console.log("Alice balance:", aliceInfo.data.free.toHuman());

    // Check target balance before
    const targetInfoBefore = await api.query.system.account(targetAddress);
    console.log("Target balance before:", targetInfoBefore.data.free.toHuman());

    // Transfer 1000 units from Alice to target account
    const amount = 1000n * 1000000000000n; // 1000 units with 12 decimals

    console.log("Transferring funds...");
    const transfer = api.tx.balances.transferAllowDeath(targetAddress, amount);

    await new Promise((resolve, reject) => {
      transfer.signAndSend(alice, (result) => {
        console.log("Transfer status:", result.status.type);

        if (result.status.isInBlock) {
          console.log(
            "Transfer included in block:",
            result.status.asInBlock.toString()
          );
        } else if (result.status.isFinalized) {
          console.log(
            "Transfer finalized:",
            result.status.asFinalized.toString()
          );
          resolve(true);
        } else if (result.isError) {
          reject(new Error("Transfer failed"));
        }
      });
    });

    // Wait a moment for the balance to update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check target balance after with retry
    let attempts = 0;
    let targetBalance = 0n;
    while (attempts < 5) {
      const targetInfoAfter = await api.query.system.account(targetAddress);
      targetBalance = targetInfoAfter.data.free.toBigInt();
      console.log(
        `Target balance after (attempt ${attempts + 1}):`,
        targetInfoAfter.data.free.toHuman()
      );

      if (targetBalance > 0n) {
        break;
      }

      attempts++;
      if (attempts < 5) {
        console.log("Balance still 0, waiting 1 second...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (targetBalance > 0n) {
      console.log("✅ Account funded successfully!");
    } else {
      console.log(
        "⚠️ Transfer completed but balance still shows 0. This might be a timing issue."
      );
    }

    await api.disconnect();
  } catch (error) {
    console.error("❌ Failed to fund account:", error);
    process.exit(1);
  }
}

fundAccount();
