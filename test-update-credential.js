const { ApiPromise, WsProvider } = require("@polkadot/api");

async function testUpdateCredential() {
  console.log("Connecting to substrate node...");

  const provider = new WsProvider("ws://localhost:9944");
  const api = await ApiPromise.create({ provider });

  await api.isReady;
  console.log("Connected to blockchain");

  try {
    // Check if the updateCredential function exists
    console.log("Checking available freelanceCredentials functions:");
    console.log(Object.keys(api.tx.freelanceCredentials));

    // Check the function signature
    if (api.tx.freelanceCredentials.updateCredential) {
      console.log("updateCredential function exists");
      console.log(
        "Function meta:",
        api.tx.freelanceCredentials.updateCredential.meta.toJSON()
      );
    } else {
      console.log("updateCredential function does NOT exist");
    }

    // Also check the runtime metadata
    console.log(
      "\nRuntime version:",
      (await api.rpc.state.getRuntimeVersion()).toJSON()
    );
  } catch (error) {
    console.error("Error:", error);
  }

  await api.disconnect();
}

testUpdateCredential().catch(console.error);
