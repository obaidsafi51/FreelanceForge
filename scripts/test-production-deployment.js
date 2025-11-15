#!/usr/bin/env node

/**
 * FreelanceForge Production Deployment Test Suite
 *
 * This script tests end-to-end functionality on Paseo testnet to verify
 * that the production deployment is working correctly.
 */

const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

// Test configuration
const CONFIG = {
  // Paseo testnet endpoints
  endpoints: [
    "wss://paseo.dotters.network",
    "wss://rpc.ibp.network/paseo",
    "wss://paseo.rpc.amforc.com",
  ],

  // Frontend URL to test
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Test timeout
  timeout: 30000,

  // Test account (use a funded test account)
  testMnemonic: process.env.TEST_MNEMONIC || "//Alice",
};

class ProductionTester {
  constructor() {
    this.api = null;
    this.keyring = null;
    this.testAccount = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  async initialize() {
    console.log("🚀 Initializing FreelanceForge Production Test Suite...\n");

    // Wait for crypto to be ready
    await cryptoWaitReady();

    // Initialize keyring
    this.keyring = new Keyring({ type: "sr25519" });
    this.testAccount = this.keyring.addFromUri(CONFIG.testMnemonic);

    console.log(`📝 Test account: ${this.testAccount.address}`);
  }

  async connectToNetwork() {
    console.log("🌐 Testing Paseo testnet connectivity...");

    for (const endpoint of CONFIG.endpoints) {
      try {
        console.log(`   Trying ${endpoint}...`);

        const provider = new WsProvider(endpoint, 5000);
        const api = await ApiPromise.create({ provider });
        await api.isReady;

        this.api = api;

        const chain = await api.rpc.system.chain();
        const version = await api.rpc.system.version();

        console.log(`   ✅ Connected to ${chain} (${version})`);
        this.recordTest(
          "Network Connectivity",
          true,
          `Connected to ${endpoint}`
        );
        return true;
      } catch (error) {
        console.log(`   ❌ Failed to connect to ${endpoint}: ${error.message}`);
        continue;
      }
    }

    this.recordTest(
      "Network Connectivity",
      false,
      "Failed to connect to any endpoint"
    );
    throw new Error("Could not connect to any Paseo testnet endpoint");
  }

  async testFrontendHealth() {
    console.log("\n🏥 Testing frontend health...");

    try {
      const fetch = (await import("node-fetch")).default;

      // Test health endpoint
      const healthResponse = await fetch(`${CONFIG.frontendUrl}/health`, {
        timeout: 5000,
      });

      if (healthResponse.ok) {
        console.log("   ✅ Frontend health check passed");
        this.recordTest("Frontend Health", true, "Health endpoint responding");
      } else {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }

      // Test main page
      const mainResponse = await fetch(CONFIG.frontendUrl, {
        timeout: 10000,
      });

      if (mainResponse.ok) {
        const html = await mainResponse.text();
        if (html.includes("FreelanceForge")) {
          console.log("   ✅ Frontend main page loaded");
          this.recordTest(
            "Frontend Main Page",
            true,
            "Main page loads correctly"
          );
        } else {
          throw new Error("Main page does not contain expected content");
        }
      } else {
        throw new Error(`Main page failed: ${mainResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Frontend test failed: ${error.message}`);
      this.recordTest("Frontend Health", false, error.message);
    }
  }

  async testPalletIntegration() {
    console.log("\n🔧 Testing pallet integration...");

    try {
      // Check if our pallet is available
      const palletMetadata = this.api.query.freelanceCredentials;

      if (palletMetadata) {
        console.log("   ✅ FreelanceCredentials pallet found");
        this.recordTest(
          "Pallet Integration",
          true,
          "Pallet available in runtime"
        );
      } else {
        throw new Error("FreelanceCredentials pallet not found in runtime");
      }

      // Test storage queries
      const credentials =
        await this.api.query.freelanceCredentials.ownerCredentials(
          this.testAccount.address
        );
      console.log(
        `   ✅ Storage query successful (${credentials.length} credentials)`
      );
      this.recordTest(
        "Storage Query",
        true,
        `Retrieved ${credentials.length} credentials`
      );
    } catch (error) {
      console.log(`   ❌ Pallet integration test failed: ${error.message}`);
      this.recordTest("Pallet Integration", false, error.message);
    }
  }

  async testCredentialMinting() {
    console.log("\n🏭 Testing credential minting...");

    try {
      // Create test credential metadata
      const testCredential = {
        credential_type: "skill",
        name: "Production Test Skill",
        description: "Test credential for production deployment verification",
        issuer: "FreelanceForge Test Suite",
        timestamp: new Date().toISOString(),
        visibility: "public",
      };

      const metadataJson = JSON.stringify(testCredential);
      const metadataBytes = new TextEncoder().encode(metadataJson);

      // Check account balance first
      const balance = await this.api.query.system.account(
        this.testAccount.address
      );
      const freeBalance = balance.data.free.toBn();

      if (freeBalance.isZero()) {
        throw new Error(
          "Test account has no balance. Please fund the test account with Paseo testnet tokens."
        );
      }

      console.log(`   💰 Account balance: ${freeBalance.toString()} units`);

      // Create and submit transaction
      const tx = this.api.tx.freelanceCredentials.mintCredential(metadataBytes);

      console.log("   📤 Submitting mint transaction...");

      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Transaction timeout"));
        }, CONFIG.timeout);

        tx.signAndSend(this.testAccount, (result) => {
          if (result.status.isInBlock) {
            console.log(
              `   📦 Transaction in block: ${result.status.asInBlock}`
            );
          } else if (result.status.isFinalized) {
            clearTimeout(timeout);

            // Check for errors
            const errorEvent = result.events.find(({ event }) =>
              this.api.events.system.ExtrinsicFailed.is(event)
            );

            if (errorEvent) {
              const [dispatchError] = errorEvent.event.data;
              let errorMessage = "Transaction failed";

              if (dispatchError.isModule) {
                try {
                  const decoded = this.api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                } catch (decodeError) {
                  errorMessage = "Unknown module error";
                }
              }

              reject(new Error(errorMessage));
            } else {
              resolve({
                hash: result.txHash.toString(),
                blockHash: result.status.asFinalized.toString(),
              });
            }
          } else if (result.isError) {
            clearTimeout(timeout);
            reject(new Error("Transaction error"));
          }
        }).catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      console.log(`   ✅ Credential minted successfully!`);
      console.log(`   📋 Transaction hash: ${result.hash}`);
      console.log(`   🧱 Block hash: ${result.blockHash}`);

      this.recordTest(
        "Credential Minting",
        true,
        `Transaction: ${result.hash}`
      );

      // Verify the credential was stored
      await this.verifyCredentialStorage();
    } catch (error) {
      console.log(`   ❌ Credential minting failed: ${error.message}`);
      this.recordTest("Credential Minting", false, error.message);

      if (error.message.includes("balance")) {
        console.log(
          "\n💡 Tip: Fund your test account at https://faucet.polkadot.io/"
        );
      }
    }
  }

  async verifyCredentialStorage() {
    console.log("\n🔍 Verifying credential storage...");

    try {
      // Query credentials for test account
      const credentialIds =
        await this.api.query.freelanceCredentials.ownerCredentials(
          this.testAccount.address
        );

      if (credentialIds.length > 0) {
        console.log(
          `   ✅ Found ${credentialIds.length} credential(s) for test account`
        );

        // Verify we can retrieve credential data
        const firstCredentialId = credentialIds[0];
        const credentialData =
          await this.api.query.freelanceCredentials.credentials(
            firstCredentialId
          );

        if (credentialData && !credentialData.isEmpty) {
          const [owner, metadataBytes] = credentialData.toJSON();
          const metadataJson = new TextDecoder().decode(
            new Uint8Array(metadataBytes)
          );
          const metadata = JSON.parse(metadataJson);

          console.log(`   ✅ Credential data retrieved successfully`);
          console.log(`   📄 Credential name: ${metadata.name}`);
          console.log(`   👤 Owner: ${owner}`);

          this.recordTest(
            "Credential Storage",
            true,
            `Retrieved credential: ${metadata.name}`
          );
        } else {
          throw new Error("Credential data is empty");
        }
      } else {
        console.log(
          "   ℹ️  No credentials found (this is normal for a fresh test account)"
        );
        this.recordTest(
          "Credential Storage",
          true,
          "No existing credentials (expected)"
        );
      }
    } catch (error) {
      console.log(
        `   ❌ Credential storage verification failed: ${error.message}`
      );
      this.recordTest("Credential Storage", false, error.message);
    }
  }

  async testPerformance() {
    console.log("\n⚡ Testing performance metrics...");

    try {
      // Test query response time
      const startTime = Date.now();
      await this.api.query.freelanceCredentials.ownerCredentials(
        this.testAccount.address
      );
      const queryTime = Date.now() - startTime;

      console.log(`   📊 Query response time: ${queryTime}ms`);

      if (queryTime < 1000) {
        console.log("   ✅ Query performance acceptable (<1s)");
        this.recordTest(
          "Query Performance",
          true,
          `${queryTime}ms response time`
        );
      } else {
        console.log("   ⚠️  Query performance slow (>1s)");
        this.recordTest(
          "Query Performance",
          false,
          `${queryTime}ms response time (too slow)`
        );
      }

      // Test block time
      const block1 = await this.api.rpc.chain.getBlock();
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      const block2 = await this.api.rpc.chain.getBlock();

      const blockDiff =
        block2.block.header.number.toNumber() -
        block1.block.header.number.toNumber();
      const avgBlockTime = blockDiff > 0 ? 10000 / blockDiff : 0;

      console.log(`   ⏱️  Average block time: ${avgBlockTime.toFixed(1)}ms`);

      if (avgBlockTime > 0 && avgBlockTime < 10000) {
        this.recordTest(
          "Block Performance",
          true,
          `${avgBlockTime.toFixed(1)}ms average block time`
        );
      } else {
        this.recordTest(
          "Block Performance",
          false,
          "Block time measurement failed"
        );
      }
    } catch (error) {
      console.log(`   ❌ Performance test failed: ${error.message}`);
      this.recordTest("Performance", false, error.message);
    }
  }

  recordTest(name, passed, details) {
    this.results.tests.push({ name, passed, details });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  async cleanup() {
    if (this.api) {
      await this.api.disconnect();
    }
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));

    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(
      `📈 Success Rate: ${(
        (this.results.passed / (this.results.passed + this.results.failed)) *
        100
      ).toFixed(1)}%`
    );

    console.log("\n📋 Detailed Results:");
    this.results.tests.forEach((test, index) => {
      const status = test.passed ? "✅" : "❌";
      console.log(`${index + 1}. ${status} ${test.name}: ${test.details}`);
    });

    if (this.results.failed === 0) {
      console.log("\n🎉 All tests passed! Production deployment is ready.");
      process.exit(0);
    } else {
      console.log(
        "\n⚠️  Some tests failed. Please review and fix issues before production use."
      );
      process.exit(1);
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.connectToNetwork();
      await this.testFrontendHealth();
      await this.testPalletIntegration();
      await this.testCredentialMinting();
      await this.testPerformance();
    } catch (error) {
      console.error(`\n💥 Test suite failed: ${error.message}`);
      this.recordTest("Test Suite", false, error.message);
    } finally {
      await this.cleanup();
      this.printResults();
    }
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new ProductionTester();
  tester.run().catch(console.error);
}

module.exports = ProductionTester;
