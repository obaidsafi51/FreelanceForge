# FreelanceForge Requirements Document

## Introduction

FreelanceForge is a decentralized application (dApp) built on the Polkadot blockchain that aggregates freelance credentials (skills, client reviews, payment histories) into portable, verifiable NFT-based digital identities. The system addresses the critical problem of credential fragmentation across multiple platforms in the $1.2 trillion gig economy, enabling freelancers to own and control their professional reputation data.

The MVP targets the Polkadot Cloud Hackathon's "User-Centric Apps" and "Polkadot Tinkerers" themes, emphasizing user sovereignty, verification integrity, and cross-chain interoperability through a 7-day emergency sprint development cycle.

## Requirements

### Requirement 1: NFT Credential Minting System

**User Story:** As a freelancer, I want to mint NFT credentials for my skills, reviews, certifications, and payment history, so that I can create verifiable, tamper-proof digital representations of my professional achievements.

#### Acceptance Criteria

1. WHEN a user submits credential data (name, description, type, issuer, rating) THEN the system SHALL create an NFT with immutable metadata stored on-chain
2. WHEN a user attempts to mint a credential THEN the system SHALL validate metadata size is ≤4KB and reject larger submissions
3. WHEN a user mints their 500th credential THEN the system SHALL accept it, but reject the 501st with "TooManyCredentials" error
4. WHEN a user attempts to mint a duplicate credential (same metadata hash) THEN the system SHALL reject it with "CredentialAlreadyExists" error
5. WHEN an NFT is successfully minted THEN the system SHALL emit a CredentialMinted event with credential_id and owner
6. WHEN a credential is minted THEN the transaction cost SHALL be <0.01 DOT on Paseo testnet
7. WHEN a credential NFT is created THEN it SHALL be soulbound (non-transferable) by default

### Requirement 2: Portfolio Dashboard Interface

**User Story:** As a freelancer, I want to view all my credential NFTs in a chronological timeline dashboard with trust score visualization, so that I can manage my professional portfolio and understand my reputation strength.

#### Acceptance Criteria

1. WHEN a user connects their wallet THEN the system SHALL display all owned credential NFTs in a timeline format within 2 seconds
2. WHEN credentials are displayed THEN each credential card SHALL show icon, name, issuer, date, and rating (if applicable)
3. WHEN the dashboard loads THEN the system SHALL calculate and display the user's trust score (0-100) with tier badge (Bronze/Silver/Gold/Platinum)
4. WHEN a user hovers over a credential card THEN the system SHALL reveal the full description
5. WHEN credentials are loaded THEN the system SHALL provide sorting/filtering options by date, type, and rating
6. WHEN the trust score is displayed THEN the system SHALL show a breakdown chart indicating contribution by category (reviews 60%, skills 30%, payments 10%)
7. WHEN the dashboard is accessed on mobile devices THEN the system SHALL maintain responsive design across breakpoints (320px, 768px, 1024px)

### Requirement 3: Wallet Integration and Authentication

**User Story:** As a user, I want to securely connect my Polkadot-compatible wallet to authenticate and sign transactions, so that I can interact with the blockchain without compromising my private keys.

#### Acceptance Criteria

1. WHEN a user clicks "Connect Wallet" THEN the system SHALL detect and connect to Polkadot.js browser extension
2. WHEN no wallet extension is detected THEN the system SHALL display "Please install Polkadot.js extension" with installation link
3. WHEN wallet connection is successful THEN the system SHALL store the wallet address in session state (not persistent storage)
4. WHEN a user signs a transaction THEN the system SHALL display transaction details before requiring signature approval
5. WHEN a user disconnects their wallet THEN the system SHALL clear all sensitive state data
6. WHEN querying credentials THEN the system SHALL filter results by the connected wallet address
7. WHEN wallet connection fails THEN the system SHALL provide clear error messages and suggested solutions

### Requirement 4: Trust Score Calculation Algorithm

**User Story:** As a freelancer, I want an automated trust score calculated from my credentials, so that I can demonstrate my credibility to potential clients with a standardized metric.

#### Acceptance Criteria

1. WHEN credentials are loaded THEN the system SHALL calculate trust score using formula: (0.60 × Review Score) + (0.30 × Skill Score) + (0.10 × Payment Score)
2. WHEN calculating review score THEN the system SHALL use: (Average rating / 5) × 100 × 0.6
3. WHEN calculating skill score THEN the system SHALL use: (Number of verified skills × 5) + (Certification bonus) with max 100 points
4. WHEN calculating payment score THEN the system SHALL use: MIN(100, (Total payment volume / $1000) × 10) × Recency factor
5. WHEN trust score is calculated THEN the system SHALL assign tier: Bronze (0-25), Silver (26-50), Gold (51-75), Platinum (76-100)
6. WHEN new credentials are added THEN the system SHALL update trust score in real-time
7. WHEN trust score is displayed THEN the system SHALL show breakdown of contributing factors

### Requirement 5: Mock Data Import System

**User Story:** As a freelancer, I want to import my existing credentials from Web2 platforms via JSON upload or manual entry, so that I can quickly populate my portfolio without starting from scratch.

#### Acceptance Criteria

1. WHEN a user uploads a JSON file THEN the system SHALL validate file size is ≤5MB and reject larger files
2. WHEN JSON data is uploaded THEN the system SHALL parse platform-specific formats (Upwork, LinkedIn, Stripe) and transform to credential schema
3. WHEN parsed data is previewed THEN the system SHALL display all credentials before batch minting
4. WHEN user confirms batch import THEN the system SHALL mint all credentials as individual NFTs with progress indicator
5. WHEN manual entry is selected THEN the system SHALL provide form fields for credential name, type, rating, date, issuer
6. WHEN import fails THEN the system SHALL display specific error messages and allow retry
7. WHEN import is successful THEN the system SHALL update dashboard with new credentials and recalculated trust score

### Requirement 6: Portfolio Export and Sharing

**User Story:** As a freelancer, I want to export my portfolio as JSON and share it via QR code or link, so that I can apply to jobs and allow recruiters to verify my credentials.

#### Acceptance Criteria

1. WHEN a user clicks "Export Portfolio" THEN the system SHALL generate JSON file with all credential metadata and trust score breakdown
2. WHEN JSON export is generated THEN the system SHALL include blockchain verification links and export timestamp
3. WHEN a user requests portfolio sharing THEN the system SHALL generate a public link with wallet address parameter
4. WHEN a public portfolio link is accessed THEN the system SHALL display read-only view of credentials without requiring wallet connection
5. WHEN sharing is requested THEN the system SHALL generate QR code encoding the portfolio URL
6. WHEN export is complete THEN the system SHALL automatically download the file with naming format: freelanceforge-portfolio-{wallet}.json
7. WHEN portfolio is shared THEN the system SHALL maintain user privacy by only showing public visibility credentials

### Requirement 7: Error Handling and User Experience

**User Story:** As a user, I want clear error messages and graceful failure handling, so that I can understand and resolve issues without technical expertise.

#### Acceptance Criteria

1. WHEN wallet connection fails THEN the system SHALL display user-friendly error message explaining the problem and suggested solutions
2. WHEN transaction fails due to insufficient balance THEN the system SHALL show "Insufficient balance. Get testnet tokens" with faucet link
3. WHEN network connection is lost THEN the system SHALL attempt to reconnect with backup RPC endpoints automatically
4. WHEN user cancels a transaction THEN the system SHALL show "Transaction canceled" without charging fees
5. WHEN system encounters unknown errors THEN the system SHALL log technical details while showing generic user message
6. WHEN loading operations occur THEN the system SHALL display appropriate loading states (spinners, skeleton screens)
7. WHEN operations complete successfully THEN the system SHALL provide confirmation feedback to the user

### Requirement 8: Performance and Scalability

**User Story:** As a user, I want fast, responsive interactions with the application, so that I can efficiently manage my portfolio without delays.

#### Acceptance Criteria

1. WHEN dashboard loads THEN the system SHALL complete initial render in <2 seconds on standard broadband
2. WHEN querying credentials THEN the system SHALL return results in <1 second accounting for RPC latency
3. WHEN displaying up to 100 credentials THEN the system SHALL maintain smooth scrolling and interaction performance
4. WHEN data is fetched THEN the system SHALL implement caching with 60-second stale time to reduce redundant queries
5. WHEN multiple users access simultaneously THEN the system SHALL support 100+ concurrent users without degradation
6. WHEN transactions are submitted THEN the system SHALL confirm within 3 seconds on Paseo testnet
7. WHEN export operations run THEN the system SHALL complete JSON generation in <5 seconds

### Requirement 9: Security and Data Protection

**User Story:** As a user, I want my private keys and sensitive data protected, so that I can use the application without security risks.

#### Acceptance Criteria

1. WHEN handling authentication THEN the system SHALL never store or log private keys
2. WHEN processing transactions THEN the system SHALL require explicit user approval via wallet signature
3. WHEN storing data THEN the system SHALL only store public credential metadata on-chain
4. WHEN validating inputs THEN the system SHALL sanitize all user-provided data to prevent XSS attacks
5. WHEN displaying transaction details THEN the system SHALL show function call and estimated gas before signing
6. WHEN session ends THEN the system SHALL clear all sensitive state data from memory
7. WHEN credentials are marked private THEN the system SHALL exclude them from public portfolio sharing

### Requirement 10: Cross-Chain Compatibility (Future Enhancement)

**User Story:** As a freelancer, I want to transfer my credentials to other parachains, so that I can use my portfolio across different Web3 platforms and DAOs.

#### Acceptance Criteria

1. WHEN XCM is implemented THEN the system SHALL enable credential metadata transfer between Polkadot parachains
2. WHEN cross-chain transfer is initiated THEN the system SHALL display destination options (Astar, Moonbeam)
3. WHEN XCM message is sent THEN the system SHALL provide transaction hash confirmation on both source and destination chains
4. WHEN transfer completes THEN the system SHALL verify metadata is retrievable on destination chain
5. WHEN cross-chain operation fails THEN the system SHALL provide rollback mechanism and error explanation
6. WHEN XCM transfer occurs THEN the system SHALL complete round-trip in <10 seconds
7. WHEN credentials are transferred THEN the system SHALL maintain data integrity and verification links
