const { ApiPromise, WsProvider } = require("@polkadot/api");

async function debugCredentials() {
  console.log("Connecting to substrate node...");

  const provider = new WsProvider("ws://localhost:9944");
  const api = await ApiPromise.create({ provider });

  await api.isReady;
  console.log("Connected to blockchain");

  // The account address we've been using
  const accountAddress = "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV";

  try {
    // Check if the pallet exists
    console.log("Available pallets:", Object.keys(api.query));

    if (!api.query.freelanceCredentials) {
      console.error("FreelanceCredentials pallet not found!");
      process.exit(1);
    }

    console.log("FreelanceCredentials pallet found");

    // Query owner credentials
    console.log(`\nQuerying credentials for account: ${accountAddress}`);
    const ownerCredentials =
      await api.query.freelanceCredentials.ownerCredentials(accountAddress);

    console.log("Raw owner credentials result:", ownerCredentials.toString());
    console.log("Is empty?", ownerCredentials.isEmpty);

    if (!ownerCredentials.isEmpty) {
      const credentialIds = ownerCredentials.toJSON();
      console.log("Credential IDs:", credentialIds);

      // Query each credential
      for (const credentialId of credentialIds) {
        console.log(`\nQuerying credential: ${credentialId}`);
        const credentialData = await api.query.freelanceCredentials.credentials(
          credentialId
        );

        if (!credentialData.isEmpty) {
          const [owner, metadataBytes] = credentialData.toJSON();
          console.log("Owner:", owner);
          console.log("Metadata bytes length:", metadataBytes.length);

          // Decode metadata
          try {
            let uint8Array;

            if (Array.isArray(metadataBytes)) {
              uint8Array = new Uint8Array(metadataBytes);
            } else if (
              typeof metadataBytes === "string" &&
              metadataBytes.startsWith("0x")
            ) {
              // Convert hex string to bytes
              const hexString = metadataBytes.slice(2);
              const bytes = [];
              for (let i = 0; i < hexString.length; i += 2) {
                bytes.push(parseInt(hexString.substr(i, 2), 16));
              }
              uint8Array = new Uint8Array(bytes);
            } else {
              console.error("Unknown metadata format:", typeof metadataBytes);
              continue;
            }

            const metadataJson = new TextDecoder().decode(uint8Array);
            const metadata = JSON.parse(metadataJson);
            console.log("Metadata:", metadata);
          } catch (error) {
            console.error("Failed to decode metadata:", error);
          }
        } else {
          console.log("Credential data is empty");
        }
      }
    } else {
      console.log("No credentials found for this account");
    }

    // Also check recent events
    console.log("\nChecking recent events...");
    const latestHeader = await api.rpc.chain.getHeader();
    const blockNumber = latestHeader.number.toNumber();

    // Check last 10 blocks for credential events
    for (let i = Math.max(1, blockNumber - 10); i <= blockNumber; i++) {
      const blockHash = await api.rpc.chain.getBlockHash(i);
      const events = await api.query.system.events.at(blockHash);

      const credentialEvents = events.filter(
        ({ event }) => event.section === "freelanceCredentials"
      );

      if (credentialEvents.length > 0) {
        console.log(
          `Block ${i} credential events:`,
          credentialEvents.map(({ event }) => ({
            method: event.method,
            data: event.data.toJSON(),
          }))
        );
      }
    }
  } catch (error) {
    console.error("Error querying credentials:", error);
  }

  await api.disconnect();
}

debugCredentials().catch(console.error);
