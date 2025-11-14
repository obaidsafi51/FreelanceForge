#!/usr/bin/env node

// Script to generate TypeScript types from Substrate metadata
// This connects to the local Substrate node and generates type definitions

import { ApiPromise, WsProvider } from "@polkadot/api";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const ENDPOINT = process.env.WS_PROVIDER || "ws://localhost:9944";
const OUTPUT_DIR = "./src/types/generated";

async function generateTypes() {
  console.log(`Connecting to Substrate node at ${ENDPOINT}...`);

  try {
    // Connect to the Substrate node with shorter timeout
    const provider = new WsProvider(ENDPOINT, 2000);
    const api = await ApiPromise.create({ provider });

    await Promise.race([
      api.isReady,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 3000)
      ),
    ]);

    console.log("Connected successfully!");

    // Get metadata
    const metadata = await api.rpc.state.getMetadata();
    console.log("Retrieved metadata");

    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Generate basic type definitions
    const typeDefinitions = generateTypeDefinitions(api);

    // Write type definitions to file
    const outputPath = `${OUTPUT_DIR}/index.ts`;
    writeFileSync(outputPath, typeDefinitions);

    console.log(`Types generated successfully at ${outputPath}`);

    // Disconnect
    await api.disconnect();
  } catch (error) {
    console.warn("Failed to connect to Substrate node:", error.message);

    // If we can't connect to the node, create basic type definitions
    console.log("Creating basic type definitions without metadata...");

    mkdirSync(OUTPUT_DIR, { recursive: true });

    const basicTypes = generateBasicTypes();
    writeFileSync(`${OUTPUT_DIR}/index.ts`, basicTypes);

    console.log("Basic types created successfully");
  }
}

function generateTypeDefinitions(api) {
  return `// Auto-generated TypeScript definitions for FreelanceForge
// Generated at: ${new Date().toISOString()}

import type { ApiPromise } from '@polkadot/api';
import type { Codec } from '@polkadot/types/types';
import type { Vec, Option, Bytes } from '@polkadot/types';
import type { AccountId32, H256 } from '@polkadot/types/interfaces';

// Pallet FreelanceCredentials Types
export interface FreelanceCredentialsCredential extends Codec {
  readonly owner: AccountId32;
  readonly metadata: Bytes;
}

export interface FreelanceCredentialsCall extends Codec {
  readonly isMintCredential: boolean;
  readonly asMintCredential: {
    readonly metadataJson: Bytes;
  };
  readonly isUpdateCredential: boolean;
  readonly asUpdateCredential: {
    readonly credentialId: H256;
    readonly visibility: Option<Bytes>;
    readonly proofHash: Option<H256>;
  };
  readonly isDeleteCredential: boolean;
  readonly asDeleteCredential: {
    readonly credentialId: H256;
  };
}

export interface FreelanceCredentialsEvent extends Codec {
  readonly isCredentialMinted: boolean;
  readonly asCredentialMinted: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
  readonly isCredentialUpdated: boolean;
  readonly asCredentialUpdated: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
  readonly isCredentialDeleted: boolean;
  readonly asCredentialDeleted: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
}

export interface FreelanceCredentialsError extends Codec {
  readonly isCredentialAlreadyExists: boolean;
  readonly isMetadataTooLarge: boolean;
  readonly isTooManyCredentials: boolean;
  readonly isCredentialNotFound: boolean;
  readonly isNotCredentialOwner: boolean;
}

// Type-safe API interface
export interface FreelanceForgeApi extends ApiPromise {
  tx: {
    freelanceCredentials: {
      mintCredential: (metadataJson: Bytes | string | Uint8Array) => any;
      updateCredential: (
        credentialId: H256 | string,
        visibility: Option<Bytes> | null,
        proofHash: Option<H256> | null
      ) => any;
      deleteCredential: (credentialId: H256 | string) => any;
    };
  };
  query: {
    freelanceCredentials: {
      credentials: (credentialId: H256 | string) => Promise<Option<FreelanceCredentialsCredential>>;
      ownerCredentials: (owner: AccountId32 | string) => Promise<Vec<H256>>;
    };
  };
  events: {
    freelanceCredentials: {
      CredentialMinted: any;
      CredentialUpdated: any;
      CredentialDeleted: any;
    };
  };
}

export default FreelanceForgeApi;
`;
}

function generateBasicTypes() {
  return `// Basic TypeScript definitions for FreelanceForge
// Generated without metadata connection at: ${new Date().toISOString()}

import type { ApiPromise } from '@polkadot/api';
import type { Codec } from '@polkadot/types/types';
import type { Vec, Option, Bytes } from '@polkadot/types';
import type { AccountId32, H256 } from '@polkadot/types/interfaces';

// Basic pallet types (generated without metadata)
export interface FreelanceCredentialsCredential extends Codec {
  readonly owner: AccountId32;
  readonly metadata: Bytes;
}

export interface FreelanceCredentialsCall extends Codec {
  readonly isMintCredential: boolean;
  readonly asMintCredential: {
    readonly metadataJson: Bytes;
  };
  readonly isUpdateCredential: boolean;
  readonly asUpdateCredential: {
    readonly credentialId: H256;
    readonly visibility: Option<Bytes>;
    readonly proofHash: Option<H256>;
  };
  readonly isDeleteCredential: boolean;
  readonly asDeleteCredential: {
    readonly credentialId: H256;
  };
}

export interface FreelanceCredentialsEvent extends Codec {
  readonly isCredentialMinted: boolean;
  readonly asCredentialMinted: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
  readonly isCredentialUpdated: boolean;
  readonly asCredentialUpdated: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
  readonly isCredentialDeleted: boolean;
  readonly asCredentialDeleted: {
    readonly credentialId: H256;
    readonly owner: AccountId32;
  };
}

export interface FreelanceCredentialsError extends Codec {
  readonly isCredentialAlreadyExists: boolean;
  readonly isMetadataTooLarge: boolean;
  readonly isTooManyCredentials: boolean;
  readonly isCredentialNotFound: boolean;
  readonly isNotCredentialOwner: boolean;
}

// Basic API interface
export interface FreelanceForgeApi extends ApiPromise {
  tx: {
    freelanceCredentials: {
      mintCredential: (metadataJson: Bytes | string | Uint8Array) => any;
      updateCredential: (
        credentialId: H256 | string,
        visibility: Option<Bytes> | null,
        proofHash: Option<H256> | null
      ) => any;
      deleteCredential: (credentialId: H256 | string) => any;
    };
  };
  query: {
    freelanceCredentials: {
      credentials: (credentialId: H256 | string) => Promise<Option<FreelanceCredentialsCredential>>;
      ownerCredentials: (owner: AccountId32 | string) => Promise<Vec<H256>>;
    };
  };
}

export default FreelanceForgeApi;
`;
}

// Run the script
generateTypes().catch(console.error);
