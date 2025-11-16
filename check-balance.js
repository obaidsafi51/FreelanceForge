const { ApiPromise, WsProvider } = require("@polkadot/api");

async function checkBalance() {
  console.log("Connecting to substrate node...");
  const provider = new WsProvider("ws://localhost:9944");
  const api = await ApiPromise.create({ provider });

  await api.isReady;
  console.log("Connected to blockchain");

  const accountAddress = "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV";

  const accountInfo = await api.query.system.account(accountAddress);
  console.log("Account address:", accountAddress);
  console.log("Balance:", accountInfo.data.free.toHuman());
  console.log("Balance (raw):", accountInfo.data.free.toString());

  await api.disconnect();
}

checkBalance().catch(console.error);
