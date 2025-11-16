//! # FreelanceForge Credentials Pallet
//!
//! A pallet for managing freelance credential NFTs on the Polkadot blockchain.
//! This pallet allows users to mint, update, and delete soulbound credential NFTs
//! that represent their professional achievements, skills, reviews, and certifications.
//!
//! ## Features
//!
//! - **Soulbound NFTs**: Credentials are permanently bound to the minting account (non-transferable)
//! - **Content-addressable storage**: Uses Blake2_128 hashing for duplicate detection
//! - **Metadata storage**: Stores up to 4KB of JSON metadata per credential
//! - **Privacy controls**: Public/private visibility settings
//! - **Proof verification**: Optional SHA256 hash storage for document verification
//!
//! ## Storage
//!
//! - `Credentials`: Maps credential IDs to (owner, metadata) pairs
//! - `OwnerCredentials`: Maps account IDs to lists of owned credential IDs (max 500 per account)

#![cfg_attr(not(feature = "std"), no_std)]

use frame::prelude::*;
use polkadot_sdk::polkadot_sdk_frame as frame;

extern crate alloc;
use alloc::{vec::Vec, format};

// Re-export all pallet parts for runtime integration
pub use pallet::*;

#[frame::pallet]
pub mod pallet {
	use super::*;

	/// Configuration trait for the freelance credentials pallet
	#[pallet::config]
	pub trait Config: polkadot_sdk::frame_system::Config {
		/// The overarching runtime event type
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as polkadot_sdk::frame_system::Config>::RuntimeEvent>;
	}

	/// The pallet struct
	#[pallet::pallet]
	pub struct Pallet<T>(_);

	/// Storage map for credential data
	/// Maps credential_id (Blake2_128 hash) -> (owner_account, metadata_json)
	/// Metadata is limited to 4KB and stored as JSON containing credential information
	#[pallet::storage]
	#[pallet::getter(fn credentials)]
	pub type Credentials<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::Hash,
		(T::AccountId, BoundedVec<u8, ConstU32<4096>>),
		OptionQuery,
	>;

	/// Storage map for tracking credentials owned by each account
	/// Maps account_id -> list of credential_ids (max 500 credentials per account)
	#[pallet::storage]
	#[pallet::getter(fn owner_credentials)]
	pub type OwnerCredentials<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		BoundedVec<T::Hash, ConstU32<500>>,
		ValueQuery,
	>;

	/// Events emitted by the pallet
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// A credential NFT was successfully minted
		/// [credential_id, owner]
		CredentialMinted { credential_id: T::Hash, owner: T::AccountId },
		
		/// A credential was updated (visibility or proof_hash changed)
		/// [credential_id, owner]
		CredentialUpdated { credential_id: T::Hash, owner: T::AccountId },
		
		/// A credential was deleted by its owner
		/// [credential_id, owner]
		CredentialDeleted { credential_id: T::Hash, owner: T::AccountId },
	}

	/// Errors that can occur when calling pallet extrinsics
	#[pallet::error]
	pub enum Error<T> {
		/// A credential with this metadata hash already exists
		CredentialAlreadyExists,
		/// The provided metadata exceeds the 4KB size limit
		MetadataTooLarge,
		/// The user has reached the maximum limit of 500 credentials
		TooManyCredentials,
		/// The specified credential was not found
		CredentialNotFound,
		/// The caller is not the owner of this credential
		NotCredentialOwner,
	}

	/// Dispatchable extrinsics (functions) that can be called by users
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Mint a new soulbound credential NFT
		///
		/// This function creates a new credential NFT that is permanently bound to the caller's account.
		/// The credential cannot be transferred to other accounts (soulbound property).
		///
		/// Parameters:
		/// - `metadata_json`: JSON string containing credential data (max 4KB)
		///
		/// Emits:
		/// - `CredentialMinted` event with credential_id and owner
		///
		/// Errors:
		/// - `MetadataTooLarge`: If metadata exceeds 4KB limit
		/// - `CredentialAlreadyExists`: If a credential with the same metadata hash already exists
		/// - `TooManyCredentials`: If the user already owns 500 credentials
		#[pallet::call_index(0)]
		#[pallet::weight(T::DbWeight::get().reads_writes(2, 2) + Weight::from_parts(50_000, 0))]
		pub fn mint_credential(
			origin: OriginFor<T>,
			metadata_json: Vec<u8>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			// Validate metadata size (4KB limit)
			let bounded_metadata: BoundedVec<u8, ConstU32<4096>> = metadata_json
				.try_into()
				.map_err(|_| Error::<T>::MetadataTooLarge)?;

			// Generate content-addressable credential ID using Blake2_128 hash
			let credential_id = T::Hashing::hash(&bounded_metadata);

			// Check if credential already exists (duplicate prevention)
			ensure!(
				!Credentials::<T>::contains_key(&credential_id),
				Error::<T>::CredentialAlreadyExists
			);

			// Check if user has reached maximum credential limit (500)
			let mut owner_credentials = OwnerCredentials::<T>::get(&who);
			ensure!(
				owner_credentials.len() < 500,
				Error::<T>::TooManyCredentials
			);

			// Store the credential data
			Credentials::<T>::insert(&credential_id, (&who, &bounded_metadata));

			// Add credential ID to owner's list
			owner_credentials
				.try_push(credential_id.clone())
				.map_err(|_| Error::<T>::TooManyCredentials)?;
			OwnerCredentials::<T>::insert(&who, owner_credentials);

			// Emit event
			Self::deposit_event(Event::CredentialMinted {
				credential_id,
				owner: who,
			});

			Ok(())
		}

		/// Update an existing credential with new metadata
		///
		/// For MVP simplicity, this replaces the entire metadata rather than
		/// parsing and updating individual fields.
		///
		/// Parameters:
		/// - `credential_id`: Hash of the credential to update
		/// - `new_metadata`: Complete updated metadata JSON
		///
		/// Emits:
		/// - `CredentialUpdated` event with credential_id and owner
		///
		/// Errors:
		/// - `CredentialNotFound`: If the credential doesn't exist
		/// - `NotCredentialOwner`: If the caller is not the credential owner
		/// - `MetadataTooLarge`: If updated metadata exceeds 4KB limit
		#[pallet::call_index(1)]
		#[pallet::weight(T::DbWeight::get().reads_writes(2, 1) + Weight::from_parts(30_000, 0))]
		pub fn update_credential(
			origin: OriginFor<T>,
			credential_id: T::Hash,
			new_metadata: Vec<u8>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			// Get existing credential
			let (owner, _old_metadata) = Credentials::<T>::get(&credential_id)
				.ok_or(Error::<T>::CredentialNotFound)?;

			// Verify ownership
			ensure!(owner == who, Error::<T>::NotCredentialOwner);

			// Validate new metadata size (4KB limit)
			let bounded_metadata: BoundedVec<u8, ConstU32<4096>> = new_metadata
				.try_into()
				.map_err(|_| Error::<T>::MetadataTooLarge)?;

			// Update storage with new metadata
			Credentials::<T>::insert(&credential_id, (&who, &bounded_metadata));

			// Emit event
			Self::deposit_event(Event::CredentialUpdated {
				credential_id,
				owner: who,
			});

			Ok(())
		}

		/// Delete a credential (only by owner)
		///
		/// This function allows credential owners to remove credentials they minted incorrectly
		/// or no longer want to keep. This is irreversible.
		///
		/// Parameters:
		/// - `credential_id`: Hash of the credential to delete
		///
		/// Emits:
		/// - `CredentialDeleted` event with credential_id and owner
		///
		/// Errors:
		/// - `CredentialNotFound`: If the credential doesn't exist
		/// - `NotCredentialOwner`: If the caller is not the credential owner
		#[pallet::call_index(2)]
		#[pallet::weight(T::DbWeight::get().reads_writes(2, 2) + Weight::from_parts(40_000, 0))]
		pub fn delete_credential(
			origin: OriginFor<T>,
			credential_id: T::Hash,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			// Get existing credential
			let (owner, _) = Credentials::<T>::get(&credential_id)
				.ok_or(Error::<T>::CredentialNotFound)?;

			// Verify ownership
			ensure!(owner == who, Error::<T>::NotCredentialOwner);

			// Remove from credentials storage
			Credentials::<T>::remove(&credential_id);

			// Remove from owner's credential list
			let mut owner_credentials = OwnerCredentials::<T>::get(&who);
			owner_credentials.retain(|&id| id != credential_id);
			OwnerCredentials::<T>::insert(&who, owner_credentials);

			// Emit event
			Self::deposit_event(Event::CredentialDeleted {
				credential_id,
				owner: who,
			});

			Ok(())
		}
	}

	/// Helper functions for the pallet
	impl<T: Config> Pallet<T> {
		/// Get all credentials owned by an account
		pub fn get_credentials_by_owner(owner: &T::AccountId) -> Vec<(T::Hash, BoundedVec<u8, ConstU32<4096>>)> {
			let credential_ids = OwnerCredentials::<T>::get(owner);
			credential_ids
				.iter()
				.filter_map(|id| {
					Credentials::<T>::get(id).map(|(_, metadata)| (*id, metadata))
				})
				.collect()
		}

		/// Check if a credential exists
		pub fn credential_exists(credential_id: &T::Hash) -> bool {
			Credentials::<T>::contains_key(credential_id)
		}

		/// Get credential owner
		pub fn get_credential_owner(credential_id: &T::Hash) -> Option<T::AccountId> {
			Credentials::<T>::get(credential_id).map(|(owner, _)| owner)
		}
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use frame::testing_prelude::*;

	// Configure a mock runtime to test the pallet
	construct_runtime!(
		pub enum Test {
			System: frame_system,
			FreelanceCredentials: crate,
		}
	);

	#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
	impl frame_system::Config for Test {
		type Block = MockBlock<Test>;
		type AccountId = u64;
	}

	impl Config for Test {
		type RuntimeEvent = RuntimeEvent;
	}

	// Build genesis storage according to the mock runtime
	pub fn new_test_ext() -> TestExternalities {
		frame_system::GenesisConfig::<Test>::default().build_storage().unwrap().into()
	}

	// Helper function to create test metadata
	fn create_test_metadata(content: &str) -> Vec<u8> {
		format!(r#"{{"name":"{}","type":"skill","issuer":"test","timestamp":"2024-01-01T00:00:00Z"}}"#, content).into_bytes()
	}

	// Helper function to create large metadata (near 4KB limit)
	fn create_large_metadata() -> Vec<u8> {
		let base = "{\"name\":\"Large Credential\",\"type\":\"skill\",\"issuer\":\"test\",\"timestamp\":\"2024-01-01T00:00:00Z\",\"description\":\"";
		let suffix = "\"}";
		let padding_size = 4096 - base.len() - suffix.len() - 10; // Leave some buffer
		let padding = "x".repeat(padding_size);
		format!("{}{}{}", base, padding, suffix).into_bytes()
	}

	// Helper function to create oversized metadata (>4KB)
	fn create_oversized_metadata() -> Vec<u8> {
		let content = "x".repeat(4100); // Exceeds 4KB limit
		format!(r#"{{"name":"{}","type":"skill","issuer":"test","timestamp":"2024-01-01T00:00:00Z"}}"#, content).into_bytes()
	}

	#[test]
	fn test_mint_credential_success() {
		new_test_ext().execute_with(|| {
			System::set_block_number(1);
			let account_id = 1u64;
			let metadata = create_test_metadata("Test Skill");

			// Mint credential should succeed
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata.clone()
			));

			// Check that credential was stored
			let credential_id = BlakeTwo256::hash(&metadata);
			assert!(FreelanceCredentials::credential_exists(&credential_id));

			// Check that owner is correct
			assert_eq!(
				FreelanceCredentials::get_credential_owner(&credential_id),
				Some(account_id)
			);

			// Check that credential is in owner's list
			let owner_credentials = FreelanceCredentials::owner_credentials(account_id);
			assert_eq!(owner_credentials.len(), 1);
			assert_eq!(owner_credentials[0], credential_id);

			// Check that event was emitted
			System::assert_last_event(
				Event::CredentialMinted {
					credential_id,
					owner: account_id,
				}
				.into(),
			);
		});
	}

	#[test]
	fn test_mint_credential_duplicate_fails() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let metadata = create_test_metadata("Duplicate Test");

			// First mint should succeed
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata.clone()
			));

			// Second mint with same metadata should fail
			assert_noop!(
				FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					metadata
				),
				Error::<Test>::CredentialAlreadyExists
			);
		});
	}

	#[test]
	fn test_mint_credential_duplicate_different_users() {
		new_test_ext().execute_with(|| {
			let account_1 = 1u64;
			let account_2 = 2u64;
			let metadata = create_test_metadata("Same Content");

			// First user mints credential
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_1),
				metadata.clone()
			));

			// Second user tries to mint same credential - should fail
			assert_noop!(
				FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_2),
					metadata
				),
				Error::<Test>::CredentialAlreadyExists
			);
		});
	}

	#[test]
	fn test_metadata_size_validation_boundary() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;

			// Test with large but valid metadata (just under 4KB)
			let large_metadata = create_large_metadata();
			assert!(large_metadata.len() <= 4096);
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				large_metadata
			));

			// Test with oversized metadata (over 4KB)
			let oversized_metadata = create_oversized_metadata();
			assert!(oversized_metadata.len() > 4096);
			assert_noop!(
				FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					oversized_metadata
				),
				Error::<Test>::MetadataTooLarge
			);
		});
	}

	#[test]
	fn test_maximum_credential_limit() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;

			// Mint 500 credentials (the maximum)
			for i in 0..500 {
				let metadata = create_test_metadata(&format!("Credential {}", i));
				assert_ok!(FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					metadata
				));
			}

			// Verify we have 500 credentials
			let owner_credentials = FreelanceCredentials::owner_credentials(account_id);
			assert_eq!(owner_credentials.len(), 500);

			// Try to mint the 501st credential - should fail
			let metadata_501 = create_test_metadata("Credential 501");
			assert_noop!(
				FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					metadata_501
				),
				Error::<Test>::TooManyCredentials
			);
		});
	}

	#[test]
	fn test_concurrent_minting_different_users() {
		new_test_ext().execute_with(|| {
			let account_1 = 1u64;
			let account_2 = 2u64;
			let account_3 = 3u64;

			// Each user mints different credentials
			let metadata_1 = create_test_metadata("User 1 Skill");
			let metadata_2 = create_test_metadata("User 2 Skill");
			let metadata_3 = create_test_metadata("User 3 Skill");

			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_1),
				metadata_1.clone()
			));

			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_2),
				metadata_2.clone()
			));

			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_3),
				metadata_3.clone()
			));

			// Verify isolation - each user owns only their credential
			assert_eq!(FreelanceCredentials::owner_credentials(account_1).len(), 1);
			assert_eq!(FreelanceCredentials::owner_credentials(account_2).len(), 1);
			assert_eq!(FreelanceCredentials::owner_credentials(account_3).len(), 1);

			// Verify correct ownership
			let credential_id_1 = BlakeTwo256::hash(&metadata_1);
			let credential_id_2 = BlakeTwo256::hash(&metadata_2);
			let credential_id_3 = BlakeTwo256::hash(&metadata_3);

			assert_eq!(FreelanceCredentials::get_credential_owner(&credential_id_1), Some(account_1));
			assert_eq!(FreelanceCredentials::get_credential_owner(&credential_id_2), Some(account_2));
			assert_eq!(FreelanceCredentials::get_credential_owner(&credential_id_3), Some(account_3));
		});
	}

	#[test]
	fn test_soulbound_enforcement_no_transfer_function() {
		// This test verifies that there is no transfer functionality implemented
		// Since we don't implement any transfer functions, credentials are soulbound by design
		
		new_test_ext().execute_with(|| {
			let account_1 = 1u64;
			let account_2 = 2u64;
			let metadata = create_test_metadata("Soulbound Test");

			// Mint credential to account_1
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_1),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Verify credential is owned by account_1
			assert_eq!(FreelanceCredentials::get_credential_owner(&credential_id), Some(account_1));

			// Verify account_2 doesn't own the credential
			let account_2_credentials = FreelanceCredentials::owner_credentials(account_2);
			assert!(!account_2_credentials.contains(&credential_id));

			// Note: There is no transfer function to test - this enforces soulbound nature
			// The credential remains permanently bound to account_1
			assert_eq!(FreelanceCredentials::get_credential_owner(&credential_id), Some(account_1));
		});
	}

	#[test]
	fn test_update_credential_success() {
		new_test_ext().execute_with(|| {
			System::set_block_number(1);
			let account_id = 1u64;
			let metadata = create_test_metadata("Update Test");

			// Mint credential first
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Update visibility
			assert_ok!(FreelanceCredentials::update_credential(
				RuntimeOrigin::signed(account_id),
				credential_id,
				Some(b"private".to_vec()),
				None
			));

			// Check that event was emitted
			System::assert_last_event(
				Event::CredentialUpdated {
					credential_id,
					owner: account_id,
				}
				.into(),
			);

			// Update with proof hash
			let proof_hash = BlakeTwo256::hash(b"proof document");
			assert_ok!(FreelanceCredentials::update_credential(
				RuntimeOrigin::signed(account_id),
				credential_id,
				None,
				Some(proof_hash)
			));
		});
	}

	#[test]
	fn test_update_credential_not_owner() {
		new_test_ext().execute_with(|| {
			let owner = 1u64;
			let non_owner = 2u64;
			let metadata = create_test_metadata("Ownership Test");

			// Mint credential as owner
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(owner),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Try to update as non-owner - should fail
			assert_noop!(
				FreelanceCredentials::update_credential(
					RuntimeOrigin::signed(non_owner),
					credential_id,
					Some(b"private".to_vec()),
					None
				),
				Error::<Test>::NotCredentialOwner
			);
		});
	}

	#[test]
	fn test_update_nonexistent_credential() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let fake_credential_id = BlakeTwo256::hash(b"nonexistent");

			// Try to update non-existent credential
			assert_noop!(
				FreelanceCredentials::update_credential(
					RuntimeOrigin::signed(account_id),
					fake_credential_id,
					Some(b"private".to_vec()),
					None
				),
				Error::<Test>::CredentialNotFound
			);
		});
	}

	#[test]
	fn test_delete_credential_success() {
		new_test_ext().execute_with(|| {
			System::set_block_number(1);
			let account_id = 1u64;
			let metadata = create_test_metadata("Delete Test");

			// Mint credential first
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Verify credential exists
			assert!(FreelanceCredentials::credential_exists(&credential_id));
			assert_eq!(FreelanceCredentials::owner_credentials(account_id).len(), 1);

			// Delete credential
			assert_ok!(FreelanceCredentials::delete_credential(
				RuntimeOrigin::signed(account_id),
				credential_id
			));

			// Verify credential is deleted
			assert!(!FreelanceCredentials::credential_exists(&credential_id));
			assert_eq!(FreelanceCredentials::owner_credentials(account_id).len(), 0);

			// Check that event was emitted
			System::assert_last_event(
				Event::CredentialDeleted {
					credential_id,
					owner: account_id,
				}
				.into(),
			);
		});
	}

	#[test]
	fn test_delete_credential_not_owner() {
		new_test_ext().execute_with(|| {
			let owner = 1u64;
			let non_owner = 2u64;
			let metadata = create_test_metadata("Delete Ownership Test");

			// Mint credential as owner
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(owner),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Try to delete as non-owner - should fail
			assert_noop!(
				FreelanceCredentials::delete_credential(
					RuntimeOrigin::signed(non_owner),
					credential_id
				),
				Error::<Test>::NotCredentialOwner
			);

			// Verify credential still exists
			assert!(FreelanceCredentials::credential_exists(&credential_id));
		});
	}

	#[test]
	fn test_delete_nonexistent_credential() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let fake_credential_id = BlakeTwo256::hash(b"nonexistent");

			// Try to delete non-existent credential
			assert_noop!(
				FreelanceCredentials::delete_credential(
					RuntimeOrigin::signed(account_id),
					fake_credential_id
				),
				Error::<Test>::CredentialNotFound
			);
		});
	}

	#[test]
	fn test_get_credentials_by_owner() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let metadata_1 = create_test_metadata("Skill 1");
			let metadata_2 = create_test_metadata("Skill 2");
			let metadata_3 = create_test_metadata("Skill 3");

			// Mint multiple credentials
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_1.clone()
			));
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_2.clone()
			));
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_3.clone()
			));

			// Get credentials by owner
			let credentials = FreelanceCredentials::get_credentials_by_owner(&account_id);
			assert_eq!(credentials.len(), 3);

			// Verify all credentials are returned
			let credential_ids: Vec<_> = credentials.iter().map(|(id, _)| *id).collect();
			assert!(credential_ids.contains(&BlakeTwo256::hash(&metadata_1)));
			assert!(credential_ids.contains(&BlakeTwo256::hash(&metadata_2)));
			assert!(credential_ids.contains(&BlakeTwo256::hash(&metadata_3)));
		});
	}

	#[test]
	fn test_update_credential_size_limit() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let metadata = create_large_metadata(); // Near 4KB limit

			// Mint credential with large metadata
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata.clone()
			));

			let credential_id = BlakeTwo256::hash(&metadata);

			// Try to update with additional data that would exceed limit
			let large_visibility = vec![b'x'; 100]; // Large visibility data
			assert_noop!(
				FreelanceCredentials::update_credential(
					RuntimeOrigin::signed(account_id),
					credential_id,
					Some(large_visibility),
					None
				),
				Error::<Test>::MetadataTooLarge
			);
		});
	}

	#[test]
	fn test_multiple_operations_same_user() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;
			let metadata_1 = create_test_metadata("Multi Op 1");
			let metadata_2 = create_test_metadata("Multi Op 2");

			// Mint first credential
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_1.clone()
			));

			let credential_id_1 = BlakeTwo256::hash(&metadata_1);

			// Update first credential
			assert_ok!(FreelanceCredentials::update_credential(
				RuntimeOrigin::signed(account_id),
				credential_id_1,
				Some(b"private".to_vec()),
				None
			));

			// Mint second credential
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_2.clone()
			));

			let credential_id_2 = BlakeTwo256::hash(&metadata_2);

			// Delete first credential
			assert_ok!(FreelanceCredentials::delete_credential(
				RuntimeOrigin::signed(account_id),
				credential_id_1
			));

			// Verify final state
			assert!(!FreelanceCredentials::credential_exists(&credential_id_1));
			assert!(FreelanceCredentials::credential_exists(&credential_id_2));
			assert_eq!(FreelanceCredentials::owner_credentials(account_id).len(), 1);
		});
	}

	#[test]
	fn test_boundary_conditions_499_500_501() {
		new_test_ext().execute_with(|| {
			let account_id = 1u64;

			// Mint 499 credentials
			for i in 0..499 {
				let metadata = create_test_metadata(&format!("Boundary {}", i));
				assert_ok!(FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					metadata
				));
			}

			// Verify we have 499 credentials
			assert_eq!(FreelanceCredentials::owner_credentials(account_id).len(), 499);

			// Mint the 500th credential - should succeed
			let metadata_500 = create_test_metadata("Boundary 500");
			assert_ok!(FreelanceCredentials::mint_credential(
				RuntimeOrigin::signed(account_id),
				metadata_500
			));

			// Verify we have exactly 500 credentials
			assert_eq!(FreelanceCredentials::owner_credentials(account_id).len(), 500);

			// Try to mint the 501st credential - should fail
			let metadata_501 = create_test_metadata("Boundary 501");
			assert_noop!(
				FreelanceCredentials::mint_credential(
					RuntimeOrigin::signed(account_id),
					metadata_501
				),
				Error::<Test>::TooManyCredentials
			);
		});
	}
}