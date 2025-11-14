// Generated TypeScript types for FreelanceForge Substrate pallet
// This file contains type definitions that match the Substrate pallet schema

import type { Codec } from '@polkadot/types/types';
import type { Vec, Option } from '@polkadot/types';
import type { AccountId32, H256 } from '@polkadot/types/interfaces';
import type { Observable } from 'rxjs';
import type { 
  AugmentedQuery, 
  AugmentedSubmittable, 
  AugmentedEvent, 
  AugmentedError,
  SubmittableExtrinsic 
} from '@polkadot/api-base/types';

// Pallet-specific types
export interface PalletFreelanceCredentialsCredential extends Codec {
  readonly owner: AccountId32;
  readonly metadata: Vec<u8>;
}

export interface PalletFreelanceCredentialsError extends Codec {
  readonly isCredentialAlreadyExists: boolean;
  readonly isMetadataTooLarge: boolean;
  readonly isTooManyCredentials: boolean;
  readonly isCredentialNotFound: boolean;
  readonly isNotCredentialOwner: boolean;
}

export interface PalletFreelanceCredentialsEvent extends Codec {
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

// Storage types
export interface FreelanceCredentialsStorage {
  credentials: (credentialId: H256) => Option<PalletFreelanceCredentialsCredential>;
  ownerCredentials: (owner: AccountId32) => Vec<H256>;
}

// Extrinsic call types
export interface FreelanceCredentialsCall extends Codec {
  readonly isMintCredential: boolean;
  readonly asMintCredential: {
    readonly metadataJson: Vec<u8>;
  };
  readonly isUpdateCredential: boolean;
  readonly asUpdateCredential: {
    readonly credentialId: H256;
    readonly visibility: Option<Vec<u8>>;
    readonly proofHash: Option<H256>;
  };
  readonly isDeleteCredential: boolean;
  readonly asDeleteCredential: {
    readonly credentialId: H256;
  };
}

// Runtime API augmentation
declare module '@polkadot/api-base/types/storage' {
  interface AugmentedQueries<ApiType> {
    freelanceCredentials: {
      credentials: AugmentedQuery<
        ApiType,
        (arg: H256 | string | Uint8Array) => Observable<Option<PalletFreelanceCredentialsCredential>>,
        [H256]
      >;
      ownerCredentials: AugmentedQuery<
        ApiType,
        (arg: AccountId32 | string | Uint8Array) => Observable<Vec<H256>>,
        [AccountId32]
      >;
    };
  }
}

declare module '@polkadot/api-base/types/submittable' {
  interface AugmentedSubmittables<ApiType> {
    freelanceCredentials: {
      mintCredential: AugmentedSubmittable<
        (metadataJson: Vec<u8> | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Vec<u8>]
      >;
      updateCredential: AugmentedSubmittable<
        (
          credentialId: H256 | string | Uint8Array,
          visibility: Option<Vec<u8>> | null | Uint8Array | Vec<u8> | string,
          proofHash: Option<H256> | null | Uint8Array | H256 | string
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Option<Vec<u8>>, Option<H256>]
      >;
      deleteCredential: AugmentedSubmittable<
        (credentialId: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
    };
  }
}

declare module '@polkadot/api-base/types/events' {
  interface AugmentedEvents<ApiType> {
    freelanceCredentials: {
      CredentialMinted: AugmentedEvent<
        ApiType,
        [credentialId: H256, owner: AccountId32],
        { credentialId: H256; owner: AccountId32 }
      >;
      CredentialUpdated: AugmentedEvent<
        ApiType,
        [credentialId: H256, owner: AccountId32],
        { credentialId: H256; owner: AccountId32 }
      >;
      CredentialDeleted: AugmentedEvent<
        ApiType,
        [credentialId: H256, owner: AccountId32],
        { credentialId: H256; owner: AccountId32 }
      >;
    };
  }
}

declare module '@polkadot/api-base/types/errors' {
  interface AugmentedErrors<ApiType> {
    freelanceCredentials: {
      CredentialAlreadyExists: AugmentedError<ApiType>;
      MetadataTooLarge: AugmentedError<ApiType>;
      TooManyCredentials: AugmentedError<ApiType>;
      CredentialNotFound: AugmentedError<ApiType>;
      NotCredentialOwner: AugmentedError<ApiType>;
    };
  }
}

// Re-export common types for convenience
export type { AccountId32, H256, Vec, Option };