# FreelanceForge Implementation Plan

## Overview

This implementation plan converts the FreelanceForge design into a series of discrete coding tasks optimized for a 7-day development sprint. Each task builds incrementally on previous work, following test-driven development principles where appropriate. The plan prioritizes core functionality (P0 features) while maintaining code quality and proper integration patterns.

Tasks are organized to enable parallel development of backend (Substrate) and frontend (React) components, with clear integration points and dependencies marked throughout.

## Implementation Tasks

- [x] 1. Initialize project structure and development environment

  - Create Substrate node project from minimal template (`polkadot-sdk-minimal-template`)
  - Install and configure psvm (Polkadot SDK Version Manager) for dependency management
  - Update all Polkadot SDK dependencies to version 1.17.0 using `psvm -v "1.17.0"` (corrected from 1.7.0 - using unified SDK versioning)
  - Initialize React application with Vite and TypeScript configuration
  - Set up package.json with all required dependencies: @polkadot/api@11.3.1 (compatible with SDK 1.17.0), @polkadot/extension-dapp@0.47.x, @tanstack/react-query@5.51.x, @mui/material@5.16.x, qrcode.react@3.1.x
  - Configure development environment with Docker Compose for local Substrate node
  - Create basic project directory structure: substrate-node/, frontend/, docs/
  - Create comprehensive setup documentation (SETUP_GUIDE.md and PSVM_GUIDE.md)
  - _Requirements: All requirements (foundational setup)_
  - _Dependencies: None (starting task)_
  - _Completed: Task 1 complete with psvm-managed dependencies_

- [x] 2. Implement core Substrate pallet for credential NFTs

  - Create `pallet-freelance-credentials` with basic pallet structure and Config trait
  - Implement storage maps: `Credentials<T>` for credential data and `OwnerCredentials<T>` for ownership tracking
  - Define credential metadata structure with BoundedVec<u8, ConstU32<4096>> for JSON storage (stores only metadata, not full documents)
  - Implement credential ID generation using Blake2_128 hashing algorithm for content-addressable storage and duplicate detection
  - Implement `mint_credential` extrinsic with metadata validation and duplicate prevention
  - **Add soulbound enforcement**: Implement non-transferability by removing/disabling any transfer functionality (credentials are permanently bound to minting account)
  - Implement `update_credential` extrinsic to modify visibility (public/private) and add proof_hash after minting
  - Implement `delete_credential` extrinsic to allow users to remove incorrect credentials
  - Add error types: `CredentialAlreadyExists`, `MetadataTooLarge`, `TooManyCredentials`, `CredentialNotFound`, `NotCredentialOwner`
  - Emit events: `CredentialMinted`, `CredentialUpdated`, `CredentialDeleted` with credential_id and owner information
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7 (soulbound enforcement)_
  - _Dependencies: Task 1 (project structure must be initialized)_

- [x] 3. Add comprehensive unit tests for Substrate pallet

  - Write test for successful credential minting with valid metadata
  - Test duplicate credential prevention using same metadata hash
  - Test metadata size validation with 4KB boundary conditions
  - Test maximum credential limit (500 per user) with boundary testing
  - Test concurrent minting by different users to verify isolation
  - **Test soulbound enforcement**: Verify credentials cannot be transferred between accounts
  - Test update_credential functionality for visibility changes and proof_hash addition
  - Test delete_credential with ownership verification
  - Test error cases: unauthorized updates/deletes, updating non-existent credentials
  - Achieve >80% code coverage using `cargo tarpaulin`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_
  - _Dependencies: Task 2 (pallet implementation must be complete)_

- [x] 4. Integrate pallet into Substrate runtime and deploy locally

  - Add pallet to runtime configuration in `runtime/src/lib.rs`
  - Configure pallet parameters and implement Config trait for Runtime
  - Update `construct_runtime!` macro to include FreelanceCredentials pallet
  - Build and test local Substrate node with `cargo build --release`
  - Verify pallet functionality using Polkadot.js Apps UI for manual testing
  - _Requirements: 1.1, 1.5, 1.6_
  - _Dependencies: Task 2 (pallet must be implemented), Task 3 (tests should pass)_

- [x] 5. Create React application foundation with wallet integration

  - Set up React Router with routes for Dashboard, Mint, Export, and Public Portfolio pages
  - Implement wallet connection component using @polkadot/extension-dapp
  - Create wallet context provider for managing connection state and account selection
  - Add error handling for wallet detection, connection failures, and account access
  - Implement automatic wallet reconnection on page refresh with session persistence
  - Style wallet connection UI using Material-UI components with responsive design
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - _Dependencies: Task 1 (React project structure must be initialized)_

- [x] 6. Implement Polkadot.js API integration layer

  - Create API utility class with connection management and endpoint fallback logic
  - Configure RPC endpoints: Use `ws://127.0.0.1:9944` for local development only, `wss://paseo.dotters.network` (primary) and fallback endpoints for production
  - **Network strategy**: Remove dynamic network switching to avoid state synchronization issues; use environment variables to target single network (local dev vs Paseo production)
  - Add `mintCredential` function with transaction signing and error handling
  - Add `updateCredential` function for visibility changes and proof_hash updates
  - Add `deleteCredential` function with ownership verification
  - Implement `getCredentials` function to query user's credential NFTs from chain
  - Add transaction retry logic with exponential backoff for failed operations
  - **Generate TypeScript types from Substrate metadata** using `@polkadot/typegen` to ensure type safety between frontend and pallet
  - Create type definitions for credential metadata matching pallet schema (including visibility, proof_hash fields)
  - _Requirements: 1.1, 1.5, 1.6, 3.4, 7.2, 7.3_
  - _Dependencies: Task 4 (local Substrate node must be running), Task 5 (wallet integration must be ready)_

- [x] 7. Set up TanStack Query for state management and caching

  - Configure QueryClient with appropriate cache settings (60s stale time, 5min cache time)
  - Create `useCredentials` hook for fetching and caching user credential data
  - Implement `useMintCredential` mutation hook with optimistic updates and cache invalidation
  - Add loading states and error handling for all query operations
  - Implement background refetching and cache invalidation strategies
  - Test query performance and caching behavior with mock data
  - _Requirements: 2.1, 2.6, 8.4, 8.7_
  - _Dependencies: Task 5 (React foundation), Task 6 (API integration layer)_

- [x] 8. Build credential minting interface and form validation

  - Create credential minting form with fields for name, description, type, issuer, rating
  - Implement form validation using Yup schema with proper error messages
  - Add credential type selection (skill, review, payment, certification) with appropriate icons
  - **Implement file upload for proof documents** with size validation (≤5MB for upload, but only SHA256 hash stored on-chain as proof_hash)
  - **Storage clarification**: Full documents are NOT stored on-chain due to 4KB metadata limit; only the document hash (proof_hash) is stored for verification
  - **Note**: The 5MB limit applies to uploaded files for hashing; the actual on-chain storage contains only 32-byte hash + credential metadata (well under 4KB)
  - Optional: Implement off-chain storage integration (IPFS/Arweave) for future enhancement to store full documents
  - Create preview component showing credential data before minting transaction
  - Add transaction signing flow with clear transaction details display
  - Add visibility toggle (public/private) in minting form with default to "public"
  - _Requirements: 1.1, 1.2, 1.7, 5.1 (file upload for hashing), 7.1, 7.6, 9.7 (visibility)_
  - _Dependencies: Task 6 (API integration), Task 7 (TanStack Query setup)_

- [x] 9. Develop dashboard with credential timeline display

  - Create credential timeline component with chronological card-based layout
  - Implement credential cards showing icon, name, issuer, date, rating with hover effects
  - Add color-coding by credential type (skills: blue, reviews: green, payments: orange, certifications: purple)
  - Implement sorting functionality by date, type, and rating with UI controls
  - Add filtering capabilities with dropdown selectors and search functionality
  - Create responsive design supporting mobile breakpoints (320px, 768px, 1024px)
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.7_
  - _Dependencies: Task 7 (TanStack Query for data fetching), Task 6 (API integration for credential queries)_

- [x] 10. Implement trust score calculation and visualization

  - Create trust score calculation algorithm using specified formula: (0.60 × Review Score) + (0.30 × Skill Score) + (0.10 × Payment Score)
  - Implement component calculations for review score: (Average rating / 5) × 100 × 0.6
  - Add skill score calculation: (Number of verified skills × 5) + (Certification bonus) with max 100 points, then × 0.3
  - **Create payment score calculation**: MIN(100, (Total payment volume / $1000) × 10) × Recency factor, then × 0.10 (corrected formula - weight applied to full payment score)
  - **Implement tier calculation logic**: Bronze (0-25), Silver (26-50), Gold (51-75), Platinum (76-100) using explicit boundary checks
  - Build trust score widget with circular progress indicator and tier badges
  - Add breakdown chart showing contribution by category with tooltips (Review: 60%, Skill: 30%, Payment: 10%)
  - _Requirements: 4.1, 4.2, 4.3, 4.4 (corrected formula), 4.5 (tier boundaries), 4.6, 2.3, 2.6_
  - _Dependencies: Task 2 (pallet defines credential structure), Task 6 (API to fetch credentials), Task 8 (credentials must be mintable), Task 9 (dashboard must display credentials for score calculation)_

- [x] 11. Create mock data import system for Web2 platforms

  - Implement JSON file upload component with drag-and-drop functionality and 5MB size limit (for import files, not individual credentials)
  - **Create data transformation functions** for platform-specific formats with credential type mapping:
    - **Upwork**: Job history → "review" credentials (use client rating), Skills → "skill" credentials, Earnings → "payment" credentials
    - **LinkedIn**: Skills/Endorsements → "skill" credentials, Recommendations → "review" credentials, Certifications → "certification" credentials
    - **Stripe**: Payment transactions → "payment" credentials (aggregate by client/project)
  - Build preview interface showing parsed credentials before batch minting
  - Add manual credential entry form as alternative to file upload
  - **Implement batch minting strategy**:
    - Use sequential transaction submission (not utility.batch) to avoid all-or-nothing failure
    - Display progress indicator showing N of M credentials minted
    - Calculate and display total estimated fees: (credential_count × 0.01 DOT) before confirmation
    - Implement partial failure recovery: continue minting remaining credentials if one fails, display error summary
    - Add pause/resume functionality for large batches (50+ credentials)
  - Add error handling for malformed JSON and unsupported file formats
  - _Requirements: 5.1, 5.2 (platform mapping), 5.3, 5.4 (batch strategy), 5.5, 5.6, 5.7_
  - _Dependencies: Task 8 (minting interface must be functional)_

- [x] 12. Build portfolio export functionality

  - Implement JSON export generation with complete credential metadata and trust score breakdown
  - **Add blockchain verification links**: Generate Subscan URLs for Paseo network (https://paseo.subscan.io/account/{wallet_address}) or local explorer links
  - Include explorer URLs for individual credentials using transaction hashes
  - Add export timestamp to exported data
  - Create automatic file download with naming format: freelanceforge-portfolio-{wallet}.json
  - Build export preview modal showing JSON structure before download
  - Add export success notification with file size and credential count information
  - Test export functionality with various credential combinations and edge cases
  - _Requirements: 6.1, 6.2 (blockchain verification URLs), 6.6_
  - _Dependencies: Task 9 (dashboard with credentials), Task 10 (trust score calculation)_

- [x] 13. Implement portfolio sharing and QR code generation

  - Create public portfolio link generation using wallet address as parameter
  - Build public portfolio view component displaying read-only credential timeline
  - Implement QR code generation for portfolio URLs using qrcode.react library
  - **Add privacy filtering implementation**: Query credentials and filter client-side to show only those with visibility: "public" before displaying
  - Ensure private credentials are excluded from: shared portfolio view, QR code links, export when shared publicly
  - Create shareable link copying functionality with clipboard API integration
  - Style public portfolio view with professional layout and verification indicators
  - Add visibility toggle UI in dashboard for users to change credential visibility post-mint
  - _Requirements: 6.3, 6.4, 6.5, 6.7 (privacy filtering), 9.7 (visibility enforcement)_
  - _Dependencies: Task 9 (dashboard components for reuse in public view), Task 10 (trust score for public display)_

- [x] 14. Add comprehensive error handling and user feedback

  - Implement error boundary components for graceful React error handling
  - Create user-friendly error messages for all wallet connection failure scenarios
  - Add specific error handling for insufficient balance with testnet faucet links
  - Implement network connection error handling with automatic RPC endpoint switching
  - Create loading states for all async operations using skeleton screens and spinners
  - Add success notifications for completed operations with appropriate feedback
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - _Dependencies: Task 6 (API integration), Task 7 (TanStack Query), Task 8 (minting interface)_

- [x] 15. Optimize performance and implement caching strategies

  - Implement lazy loading for credential timeline with infinite scroll or pagination
  - Add TanStack Query cache optimization with appropriate stale times and background refetching
  - Optimize credential card rendering with React.memo and useMemo for expensive calculations
  - Implement debounced search and filtering to prevent excessive re-renders
  - Add performance monitoring for dashboard load times and query response times
  - Test application performance with 100+ credentials and optimize bottlenecks
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - _Dependencies: Task 9 (dashboard implementation), Task 10 (trust score calculation)_

- [x] 16. Deploy to Paseo testnet and configure production environment

  - Deploy Substrate pallet to Paseo testnet using appropriate deployment tools
  - Configure frontend environment variables for Paseo RPC endpoints
  - Set up production build pipeline with optimized bundle size and caching
  - Test end-to-end functionality on Paseo testnet with real transactions
  - Configure error monitoring and logging for production environment
  - Create deployment documentation and environment setup instructions
  - _Requirements: 1.6, 8.6_
  - _Dependencies: Task 4 (local deployment working), Task 8 (minting functionality), Task 9 (dashboard functionality)_

- [x] 17. Implement security measures and input validation

  - Add comprehensive input sanitization for all user-provided data to prevent XSS attacks
  - Implement JSON schema validation for credential metadata using Zod or Ajv library with proper error messages
  - Add file upload security validation including type checking and content scanning
  - **Implement rate limiting for credential minting**: Client-side throttling to prevent spam (max 10 credentials per minute, 100 per hour)
  - Add warning messages when users approach rate limits or maximum credential count (500)
  - Display transaction details (function call, estimated gas, recipient) before signature to prevent blind signing
  - Add CORS configuration and security headers for production deployment
  - _Requirements: 9.1, 9.2, 9.3, 9.4 (schema validation), 9.5, 9.6, 9.7_
  - _Dependencies: Task 8 (minting interface), Task 11 (file upload functionality), Task 6 (transaction handling)_

- [ ] 18. Create comprehensive test suite and quality assurance

  - Write integration tests for complete user flows: wallet connection → credential minting → dashboard display
  - Add end-to-end tests for export functionality and portfolio sharing workflows
  - **Implement blockchain interaction layer testing**: Mock Polkadot.js API for testing transaction encoding/decoding, signature verification
  - Test API wrapper functions (mintCredential, updateCredential, deleteCredential, getCredentials) with mock substrate node
  - Verify type safety between generated TypeScript types and pallet responses
  - Implement cross-browser testing for Chrome, Firefox, and Safari compatibility
  - Create performance tests validating load times and responsiveness requirements
  - Add accessibility testing to ensure WCAG 2.1 AA compliance where possible
  - Test error scenarios and recovery mechanisms with comprehensive edge case coverage
  - Test visibility filtering logic and soulbound enforcement
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 1.7 (soulbound testing), 9.7 (privacy testing)_
  - _Dependencies: Task 6 (API integration), Task 8 (minting), Task 9 (dashboard), Task 12 (export), Task 13 (sharing)_

- [ ] 19. Polish user interface and responsive design

  - Implement responsive design across all breakpoints (320px, 768px, 1024px, 1440px)
  - Add smooth animations and transitions for credential timeline and trust score updates
  - Create consistent color scheme and typography following Material Design principles
  - Implement dark mode support with proper contrast ratios and accessibility considerations
  - Add keyboard navigation support for all interactive elements
  - Polish loading states, empty states, and error states with appropriate messaging
  - _Requirements: 2.7, 7.6_
  - _Dependencies: Task 9 (dashboard UI), Task 10 (trust score widget), Task 14 (error handling)_

- [ ] 20. Create documentation and demo preparation

  - Write comprehensive README with setup instructions, usage guide, and API documentation
  - Create user guide with screenshots and step-by-step instructions for all features
  - Document API endpoints and data schemas for future integrations
  - Prepare demo script highlighting key features and Polkadot integration benefits
  - Create sample mock data files for demonstration purposes
  - Record demo video showcasing complete user journey and technical capabilities
  - _Requirements: All requirements (documentation and demo)_
  - _Dependencies: Task 16 (deployment), Task 11 (mock data), Task 12 (export), Task 13 (sharing)_

- [ ] 21. Final integration testing and bug fixes
  - Perform complete end-to-end testing of all user workflows
  - Test wallet integration with multiple browser extensions and account configurations
  - Verify transaction costs remain under 0.01 DOT on Paseo testnet
  - Test application performance under load with multiple concurrent users
  - Fix any remaining bugs and polish rough edges in user experience
  - Validate all acceptance criteria are met and requirements are satisfied
  - _Requirements: All requirements (final validation)_
  - _Dependencies: All previous tasks (comprehensive testing of complete system)_

## Task Dependencies and Parallel Execution

**Parallel Development Tracks:**

- **Backend Track**: Tasks 1-4 (Substrate pallet development)
- **Frontend Track**: Tasks 5, 7 (React foundation and state management)
- **Integration Track**: Tasks 6, 8-15 (API integration and feature development)

**Critical Path:**

1. Tasks 1-2 (foundation) → Task 4 (pallet deployment) → Task 6 (API integration) → Tasks 8-15 (feature development) → Tasks 16-21 (deployment and polish)

**Daily Milestone Targets:**

- **Day 1-2**: Complete tasks 1-4 (Substrate foundation)
- **Day 3**: Complete tasks 5-7 (React foundation and API integration)
- **Day 4**: Complete tasks 8-11 (core UI features)
- **Day 5**: Complete tasks 12-15 (export, sharing, error handling)
- **Day 6**: Complete tasks 16-19 (deployment and polish)
- **Day 7**: Complete tasks 20-21 (documentation and final testing)

**⚠️ Timeline Realistic Assessment:**

The original 7-day timeline is **highly ambitious** and assumes:

- Zero critical bugs or dependency issues
- Expert-level proficiency in both Substrate/Rust and React/TypeScript
- No scope creep or requirement changes
- Uninterrupted development time

**Recommended Timeline Adjustments:**

For a more realistic timeline, consider:

1. **14-21 Day Timeline** (Recommended): Allows proper testing, debugging, and polish
2. **7-Day MVP with Reduced Scope**: Defer secondary features:
   - Task 11 (Mock data import) → Post-MVP
   - Task 14 (Advanced error handling) → Basic error handling only
   - Task 15 (Performance optimization) → Basic optimization only
   - Task 19 (Dark mode and advanced polish) → Post-MVP
   - Focus on core MVP: mint, dashboard, trust score, basic export, and share

**Core MVP Features (achievable in 7 days):**

- Credential minting with soulbound enforcement (Tasks 1-4, 6-8)
- Dashboard with trust score (Tasks 5, 7, 9-10)
- Basic export and sharing (Tasks 12-13)
- Essential security and testing (Tasks 17-18, simplified)
- Deployment to Paseo (Task 16)

This implementation plan provides a clear roadmap for building FreelanceForge within either the ambitious 7-day sprint timeline or a more realistic 14-21 day timeline while maintaining code quality and proper testing practices.
