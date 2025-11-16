// Auto-generated TypeScript definitions for FreelanceForge
// Generated at: 2025-11-14T14:29:44.134Z

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
    readonly newMetadata: Bytes;
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
export interface FreelanceForgeApi {
  tx: {
    freelanceCredentials: {
      mintCredential: (metadataJson: Bytes | string | Uint8Array) => any;
      updateCredential: (
        credentialId: H256 | string,
        newMetadata: Bytes | string | Uint8Array
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

export { FreelanceForgeApi as default };
