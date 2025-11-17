# Product Requirements Document (PRD): FreelanceForge - Web3 Identity Portfolio for Freelancers

## 1. Document Overview

| **Attribute**       | **Details**                            |
| ------------------- | -------------------------------------- |
| **Product Name**    | FreelanceForge                         |
| **Version**         | 1.2 (MVP for Polkadot Cloud Hackathon) |
| **Date**            | October 27, 2025                       |
| **Author**          | [Your Name or Team Name]               |
| **Document Status** | Updated - Tech Stack Modernized        |
| **Last Updated**    | November 15, 2025                      |
| **Deadline**        | **November 18, 2025, 11:59 PM GMT+5**  |

### 1.1 Purpose

Define comprehensive requirements for a decentralized application (dApp) built on the Polkadot blockchain that aggregates freelance credentials (skills, client reviews, payment histories) into portable, verifiable NFT-based digital identities. The MVP specifically targets the Polkadot Cloud Hackathon's "User-Centric Apps" and "Polkadot Tinkerers" themes, emphasizing user sovereignty, verification integrity, and cross-chain interoperability.

### 1.2 Scope

**In-Scope for MVP**:

- Core NFT credential minting and storage via custom Substrate pallet
- Web-based portfolio dashboard with trust score visualization
- Wallet integration (Polkadot.js/Talisman)
- Basic Cross-Consensus Messaging (XCM) demonstration for portability
- Mock data aggregation (simulated Web2 platform imports)
- Export functionality (PDF/JSON resume formats)
- Deployment on Paseo testnet with public GitHub repository
- 3-minute demonstration video for submission

**Out-of-Scope for MVP**:

- Real-time Web2 API integrations (Upwork, Fiverr, LinkedIn OAuth)
- Advanced zero-knowledge proof (ZKP) implementations
- Mobile native applications (iOS/Android)
- Production-grade security audits
- Monetization features (freemium models)
- AI-enhanced trust scoring algorithms
- DAO governance mechanisms for dispute resolution

### 1.3 Stakeholders

- **Primary Users**: Freelancers (developers, designers, writers) aged 25-45 with basic Web3 knowledge
- **Secondary Users**: Recruiters, DAOs, Web3 project managers seeking verified talent
- **Tertiary Stakeholders**: Polkadot ecosystem developers, hackathon judges, future platform integrators
- **Development Team**: Backend (Substrate/Rust), Frontend (React.js), UX/UI Designer, Product Manager

## 2. Problem Statement

### 2.1 Market Context

The global gig economy is valued at over **$1.2 trillion** (Upwork Economic Impact Report, 2023), with **59 million freelancers in the United States alone**. This market is experiencing rapid growth, projected to constitute 50% of the U.S. workforce by 2027. However, the ecosystem remains fragmented across centralized platforms such as Upwork, Fiverr, Freelancer.com, Toptal, and LinkedIn ProFinder.

### 2.2 Critical Pain Points

**For Freelancers:**

1. **Credential Fragmentation**: Skills certifications, client reviews (5-star ratings), payment histories, and endorsements are siloed across multiple platforms. A developer might have:

   - 50+ five-star reviews on Upwork
   - React certification on Coursera
   - Payment history on Stripe/PayPal
   - DAO contribution records on Web3 platforms
   - GitHub commit history

   Yet none of these can be aggregated into a single, verifiable portfolio.

2. **Manual Verification Burden**: Freelancers resort to screenshots, PDF exports, or manual copy-paste of credentials, which are:

   - Time-consuming to compile (average 2-3 hours per application)
   - Easily fabricated or manipulated
   - Non-transferable across platforms
   - Subject to platform policy changes (e.g., profile deletions)

3. **Platform Lock-In**: Credentials are owned by platforms, not users. Account suspension or platform shutdown results in permanent loss of reputation data accumulated over years.

4. **Cross-Border Trust Deficit**: For international or Web3-native gigs (e.g., DAO smart contract development), lack of verifiable credentials leads to:
   - 30% higher rejection rates for freelancers without established platform presence
   - Longer negotiation periods (average 5-7 days vs. 1-2 days)
   - Lower initial contract values (20-40% below market rate)

**For Recruiters/Clients:** 5. **Verification Delays**: Manual verification of submitted credentials takes 2-5 business days on average, delaying project starts.

6. **Fraud Risk**: Self-reported skills and fabricated reviews are prevalent (estimated 15-25% of freelancer profiles contain inflated or false credentials).

7. **Multi-Platform Search Inefficiency**: Recruiters must search across 3-5 platforms to find suitable candidates, with no unified view.

### 2.3 Opportunity

Leverage **Polkadot's unique technical capabilities** (Substrate framework, XCM protocol, parachain interoperability) to create a decentralized, tamper-proof, portable solution that:

- Returns data ownership to users (59M+ US freelancers, 1.2B+ globally)
- Reduces verification time from days to seconds
- Enables seamless cross-platform and cross-chain credential portability
- Aligns with Web3 principles of user sovereignty and decentralization

### 2.4 Why Now?

- **Web3 Adoption**: 420 million crypto users globally (2023), creating demand for decentralized solutions
- **Polkadot Maturity**: Substrate 3.0 provides production-ready tools for custom blockchain logic
- **Regulatory Momentum**: EU's eIDAS 2.0 (2024) and emerging digital identity standards favor decentralized models
- **Gig Economy Growth**: Post-pandemic remote work normalization accelerates freelance market expansion

## 3. Product Goals and Objectives

### 3.1 Primary Goal

Deliver a user-centric decentralized application that aggregates freelance credentials into verifiable, portable NFT-based digital identities, leveraging Polkadot's unique architecture to demonstrate superiority over competing solutions.

### 3.2 Hackathon-Specific Objectives

| **Judging Criterion**                | **Our Approach**                                                                               | **Target Score** |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------- |
| **Polkadot Integration (Technical)** | Custom Substrate pallet for NFTs, XCM for cross-chain portability, deployment on Paseo testnet | 90-100%          |
| **Design (UX/UI)**                   | Intuitive dashboard with trust score visualization, mobile-responsive, accessibility-compliant | 85-95%           |
| **Impact (Real-World Value)**        | Addresses $1.2T gig economy fragmentation, 59M+ potential users, quantifiable time savings     | 90-100%          |
| **Creativity (Innovation)**          | Novel trust scoring algorithm, soulbound-like NFTs, gamification elements                      | 80-90%           |

### 3.3 Success Metrics

**Technical Performance:**

- Transaction confirmation time: <2 seconds on Paseo testnet
- NFT minting cost: <0.01 DOT (~$0.10 USD at current rates)
- Dashboard load time: <1.5 seconds on standard broadband
- Support for 100+ concurrent users in testing phase
- 99.9% uptime on testnet deployment

**User Experience:**

- Mock user satisfaction score: â‰¥80% (from 5-10 test users)
- Credential import to portfolio view: <3 minutes
- Trust score calculation: Real-time (<500ms)
- Export resume generation: <5 seconds

**Hackathon Outcomes:**

- Placement in Top 3 for "User-Centric Apps" track
- Win $500 Tinkerer Award or Community Vote prize
- Generate 50+ GitHub stars during/post-hackathon
- Receive partnership inquiries from 2+ Web3 projects

**Long-Term Vision (Post-MVP):**

- Onboard 10,000 users within 6 months
- Integrate with 3+ major gig platforms (Upwork, Fiverr, LinkedIn)
- Achieve 500+ daily active users
- Secure $100K+ in grant funding (e.g., Web3 Foundation, Polkadot Treasury)

### 3.4 Differentiation Strategy

1. **Polkadot-First Architecture**: Unlike Ethereum-based competitors (high gas fees) or Solana solutions (limited interoperability), leverage Polkadot's XCM for true cross-chain portability
2. **Gig Economy Focus**: Tailored trust scoring specifically for freelance work (vs. generic credential systems like Gitcoin Passport)
3. **User Sovereignty**: Non-custodial, user-owned NFTs with optional privacy layers (vs. centralized platform control)
4. **Cost Efficiency**: Sub-penny transaction costs enable mass adoption among global freelancers (including unbanked populations)

## 4. Target Audience and User Personas

### 4.1 Primary User Segment: Freelancers

**Demographics:**

- Age: 25-45 years
- Geographic distribution: Global, with focus on US, India, Eastern Europe, Southeast Asia
- Income: $30K-$150K annually from freelance work
- Technical proficiency: Intermediate to advanced (familiar with digital wallets, basic blockchain concepts)

**Psychographics:**

- Value autonomy and portfolio control
- Active on 2-3 gig platforms simultaneously
- Frustrated by platform fees (15-20% commission rates)
- Interested in Web3 opportunities (DAO contributions, crypto payments)

### 4.2 Detailed User Personas

#### **Persona 1: Alex Chen - Full-Stack Developer**

| **Attribute**    | **Details**                                                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Age**          | 30 years                                                                                                                                                                                                                                       |
| **Location**     | Austin, TX (remote work)                                                                                                                                                                                                                       |
| **Experience**   | 7 years in software development                                                                                                                                                                                                                |
| **Platforms**    | Upwork (Top Rated), GitHub (500+ contributions), Fiverr (Level 2 Seller)                                                                                                                                                                       |
| **Income**       | $95K/year from freelance contracts                                                                                                                                                                                                             |
| **Tech Stack**   | React, Node.js, Rust (learning), Solidity                                                                                                                                                                                                      |
| **Pain Points**  | - Maintains separate profiles on 4 platforms<br>- Spends 3 hours weekly updating portfolios<br>- Lost $15K contract due to delayed credential verification<br>- Wants to transition to DAO/Web3 projects but lacks verifiable Web3 credentials |
| **Goals**        | - Consolidate all credentials into one portable identity<br>- Reduce time spent on administrative tasks by 70%<br>- Access Web3 job opportunities with verified Web2 experience<br>- Maintain privacy over sensitive client information        |
| **Wallet Usage** | Uses Talisman wallet for Polkadot ecosystem interactions                                                                                                                                                                                       |
| **Quote**        | _"I have five years of five-star reviews, but every new client asks for screenshots. I need a better way to prove my expertise."_                                                                                                              |

#### **Persona 2: Priya Sharma - UI/UX Designer**

| **Attribute**      | **Details**                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Age**            | 28 years                                                                                                                                                                                                  |
| **Location**       | Bangalore, India                                                                                                                                                                                          |
| **Experience**     | 5 years in design, 2 years freelancing                                                                                                                                                                    |
| **Platforms**      | Behance, Dribbble, Upwork, Toptal (accepted)                                                                                                                                                              |
| **Income**         | $45K/year (â‚¹37L)                                                                                                                                                                                        |
| **Specialization** | Mobile app design, design systems, Web3 UI                                                                                                                                                                |
| **Pain Points**    | - Difficulty proving design impact (ROI metrics) to clients<br>- Toptal verification took 3 weeks<br>- Lost portfolio when Behance changed policies<br>- Cross-border payment delays (7-14 days)          |
| **Goals**          | - Instant verification for premium clients<br>- Showcase Figma certifications alongside client reviews<br>- Receive crypto payments for international work<br>- Build reputation in Web3 design community |
| **Wallet Usage**   | New to Web3, prefers user-friendly interfaces                                                                                                                                                             |
| **Quote**          | _"My portfolio is my currency. If platforms control it, I'm always one policy change away from starting over."_                                                                                           |

#### **Persona 3: Jamie Rodriguez - DAO Recruiter**

| **Attribute**     | **Details**                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Age**           | 35 years                                                                                                                                                                                                                      |
| **Location**      | Remote (nomadic)                                                                                                                                                                                                              |
| **Experience**    | 10 years in tech recruiting, 2 years in Web3                                                                                                                                                                                  |
| **Organization**  | Decentralized autonomous organization (50+ contributors)                                                                                                                                                                      |
| **Hiring Volume** | 10-15 contractors per quarter                                                                                                                                                                                                 |
| **Pain Points**   | - Spends 5-7 hours per candidate verifying credentials<br>- 20% of applicants provide fabricated reviews<br>- Difficulty finding talent with both Web2 and Web3 experience<br>- No standardized format for skill verification |
| **Goals**         | - Reduce time-to-hire from 21 days to 7 days<br>- Access tamper-proof credential verification<br>- Find talent with verified cross-platform reputation<br>- Integrate credential checks into DAO hiring workflows             |
| **Wallet Usage**  | Daily user of Polkadot.js and multi-chain wallets                                                                                                                                                                             |
| **Quote**         | _"I need to know if a candidate's Upwork reviews are real before paying a $10K smart contract bounty. Screenshots aren't enough."_                                                                                            |

### 4.3 Secondary User Segments

- **Platform Integrators**: Gig platforms seeking to offer "Login with FreelanceForge" features
- **Enterprise Clients**: Companies hiring multiple freelancers who need batch verification
- **Educational Institutions**: Universities/bootcamps issuing verifiable skill certifications

## 5. Key Features and Functionality

### 5.1 Feature Prioritization Matrix

| **Feature**               | **Priority**  | **Complexity** | **User Impact** | **MVP Status** |
| ------------------------- | ------------- | -------------- | --------------- | -------------- |
| NFT Credential Minting    | P0 (Critical) | Medium         | High            | âœ… Included   |
| Portfolio Dashboard       | P0 (Critical) | Medium         | High            | âœ… Included   |
| Trust Score Algorithm     | P0 (Critical) | High           | High            | âœ… Included   |
| Wallet Integration        | P0 (Critical) | Low            | High            | âœ… Included   |
| Mock Data Aggregation     | P0 (Critical) | Low            | Medium          | âœ… Included   |
| Export to PDF/JSON        | P1 (High)     | Low            | Medium          | âœ… Included   |
| QR Code/Link Sharing      | P1 (High)     | Low            | Medium          | âœ… Included   |
| Basic XCM Transfer        | P1 (High)     | High           | Medium          | âœ… Included   |
| Real Web2 API Integration | P2 (Medium)   | Very High      | High            | âŒ Post-MVP    |
| Zero-Knowledge Proofs     | P2 (Medium)   | Very High      | Medium          | âŒ Post-MVP    |
| Mobile Native App         | P2 (Medium)   | High           | Medium          | âŒ Post-MVP    |
| AI-Enhanced Scoring       | P3 (Low)      | Very High      | Low             | âŒ Future      |
| DAO Governance            | P3 (Low)      | High           | Low             | âŒ Future      |

### 5.2 Core Features (MVP Implementation)

#### **Feature 1: NFT Credential Minting**

**Description:**  
Users mint non-fungible tokens (NFTs) representing individual credentials such as skills, client reviews, payment receipts, or certifications. Each NFT is stored on-chain with immutable metadata.

**Technical Specifications:**

- **Implementation**: Custom Substrate pallet (`pallet-freelance-credentials`)
- **NFT Standard**: ERC-721-inspired structure adapted for Substrate
- **Metadata Schema**:
  ```json
  {
    "credential_id": "unique_hash",
    "type": "skill | review | payment | certification",
    "name": "Rust Expert",
    "description": "Intermediate Rust programming certification",
    "issuer": "Coursera / Self-attested / Platform",
    "issuer_wallet": "0x...",
    "timestamp": "2025-10-15T12:00:00Z",
    "proof_hash": "SHA256 of supporting document",
    "rating": 4.8,
    "visibility": "public | private"
  }
  ```
- **Storage**: On-chain storage maps (`Credentials<T>`, `OwnerCredentials<T>`)
- **Transaction Cost**: ~0.008-0.01 DOT per mint
- **Soulbound Feature**: NFTs are non-transferable by default (transfer function requires owner signature + flag)

**User Flow:**

1. User clicks "Add Credential" on dashboard
2. Selects credential type from dropdown (Skill/Review/Payment/Certification)
3. Fills form (name, description, issuer, optional proof upload)
4. Connects wallet and signs transaction (Polkadot.js extrinsic)
5. NFT minted with confirmation notification
6. NFT appears in portfolio timeline within 2-3 seconds

**Success Criteria:**

- 95% successful mints (5% allowance for user transaction cancellations)
- <3 second confirmation time on Paseo testnet
- Metadata correctly stored and retrievable via blockchain queries

---

#### **Feature 2: Portfolio Dashboard**

**Description:**  
Web-based interface displaying a chronological timeline of all credential NFTs, trust score visualization, and portfolio management tools.

**Technical Specifications:**

- **Frontend**: React.js with Material-UI components
- **State Management**: TanStack Query for server state, React Context for wallet state
- **Data Fetching**: Polkadot.js API with TanStack Query hooks for caching
- **Responsive Design**: Mobile-first approach (breakpoints: 320px, 768px, 1024px, 1440px)
- **Query Configuration**:
  - Stale time: 30 seconds for credentials
  - Cache time: 5 minutes
  - Background refetching enabled
  - Retry logic: 3 attempts with exponential backoff

**Dashboard Components:**

1. **Header Bar**:

   - Logo and product name
   - Wallet connection button (displays address when connected)
   - Trust score badge (animated circular progress indicator)

2. **Credential Timeline**:

   - Card-based layout for each NFT
   - Card displays: Icon (based on type), name, issuer, date, rating (if applicable)
   - Hover effect reveals full description
   - Color-coded by type (Skills: blue, Reviews: green, Payments: orange, Certifications: purple)
   - Sortable/filterable (by date, type, rating)

3. **Trust Score Widget**:

   - Large circular badge showing score (0-100 scale)
   - Breakdown chart (pie/donut) showing contribution by category
   - Gamification levels: Bronze (0-25), Silver (26-50), Gold (51-75), Platinum (76-100)
   - Tooltip explaining calculation methodology

4. **Action Panel**:
   - "Add Credential" button (primary CTA)
   - "Export Portfolio" button (downloads PDF/JSON)
   - "Share Portfolio" button (generates QR code + shareable link)
   - "Settings" (future: privacy controls)

**User Flow:**

1. User connects wallet (Talisman/Polkadot.js extension)
2. TanStack Query fetches all NFTs owned by connected wallet address (with caching)
3. Trust score calculated client-side from fetched data
4. Timeline rendered with smooth scroll animations
5. User can interact with cards, export, or add new credentials
6. Background refetching keeps data fresh without user intervention

**Success Criteria:**

- <1.5 second initial load time
- Responsive across desktop (Chrome, Firefox) and mobile browsers
- WCAG 2.1 AA accessibility compliance
- 85%+ user satisfaction in usability testing

---

#### **Feature 3: Trust Score Algorithm**

**Description:**  
Automated calculation of a 0-100 numerical score representing the credibility and quality of a freelancer's portfolio, computed from NFT metadata.

**Algorithm Design:**

**Formula:**

```
Trust Score = (0.60 Ã— Review Score) + (0.30 Ã— Skill Score) + (0.10 Ã— Payment Score)
```

**Component Calculations:**

1. **Review Score (60% weight)**:

   ```
   Review Score = (Sum of all review ratings / Number of reviews) Ã— 20
   ```

   - Example: 10 reviews averaging 4.5 stars â†’ (4.5 / 5) Ã— 100 = 90 â†’ 90 Ã— 0.6 = 54 points

2. **Skill Score (30% weight)**:

   ```
   Skill Score = (Number of verified skills Ã— 5) + (Certification bonus)
   ```

   - Max 100 points (capped at 20 skills)
   - Certification bonus: +10 points per verified certification (max 3)
   - Example: 12 skills + 2 certifications â†’ (12 Ã— 5) + 20 = 80 â†’ 80 Ã— 0.3 = 24 points

3. **Payment Score (10% weight)**:
   ```
   Payment Score = MIN(100, (Total payment volume / $1000) Ã— 10) Ã— Recency factor
   ```
   - Recency factor: 1.0 if payments within 6 months, 0.7 if within 1 year, 0.5 if older
   - Example: $8,500 earned in last 6 months â†’ (8500 / 1000) Ã— 10 Ã— 1.0 = 85 â†’ 85 Ã— 0.1 = 8.5 points

**Total Example:**
Alex has 10 reviews (avg 4.5â˜…), 12 skills, 2 certifications, $8,500 earned â†’ 54 + 24 + 8.5 = **86.5 Trust Score** (Gold tier)

**Technical Implementation:**

- Computed client-side in React for MVP (no gas costs)
- Future: On-chain calculation via Substrate pallet function for third-party verification
- Real-time updates when new credentials are minted

**Gamification Tiers:**

- ðŸ¥‰ Bronze (0-25): "Getting Started"
- ðŸ¥ˆ Silver (26-50): "Building Reputation"
- ðŸ¥‡ Gold (51-75): "Established Professional"
- ðŸ’Ž Platinum (76-100): "Elite Freelancer"

---

#### **Feature 4: Wallet Integration & On-Chain Verification**

**Description:**  
Secure authentication via Polkadot-compatible wallet extensions, enabling NFT ownership verification and transaction signing.

**Supported Wallets:**

- Polkadot.js Browser Extension (primary)
- Talisman Wallet (primary)
- SubWallet (secondary support)

**Integration Flow:**

1. User clicks "Connect Wallet" button
2. Application requests wallet access via Polkadot.js API
3. User selects account from wallet extension
4. Wallet address stored in React state (session-based, no backend)
5. All subsequent queries filtered by connected address

**On-Chain Verification:**

- **Query Credentials**: `api.query.freelanceCredentials.credentials(credential_id)`
- **Query Owner**: `api.query.freelanceCredentials.ownerCredentials(wallet_address)`
- **Verify Ownership**: Match credential_id owner field against connected wallet
- **Public Sharing**: Generate shareable links with wallet address as parameter (e.g., `freelanceforge.io/portfolio/0x1234...`)
- **QR Code**: Encode portfolio URL as QR code for offline sharing (conferences, business cards)

**Security Considerations:**

- No private keys handled by application (wallet-based signing only)
- No backend storage of wallet addresses (client-side only)
- Transaction signing requires explicit user approval via wallet
- Display transaction details before signing (function call, estimated gas)

---

#### **Feature 5: Mock Data Aggregation**

**Description:**  
For MVP demonstration purposes, simulate importing credentials from Web2 platforms (Upwork, Fiverr, LinkedIn) via JSON file upload or manual form entry.

**Mock Data Sources:**

1. **Upwork Reviews** (JSON format):

   ```json
   {
     "platform": "Upwork",
     "reviews": [
       {
         "client": "TechCorp",
         "rating": 5.0,
         "comment": "Excellent work",
         "date": "2025-09-10"
       },
       {
         "client": "StartupXYZ",
         "rating": 4.8,
         "comment": "Great communication",
         "date": "2025-08-15"
       }
     ]
   }
   ```

2. **LinkedIn Skills** (JSON format):

   ```json
   {
     "platform": "LinkedIn",
     "skills": ["React", "Node.js", "TypeScript"],
     "endorsements": 45
   }
   ```

3. **Stripe Payment History** (JSON format):
   ```json
   {
     "platform": "Stripe",
     "transactions": [
       { "amount": 2500, "currency": "USD", "date": "2025-10-01" },
       { "amount": 3200, "currency": "USD", "date": "2025-09-20" }
     ]
   }
   ```

**User Flow:**

1. User navigates to "Import Credentials" page
2. Selects platform from dropdown (Upwork/Fiverr/LinkedIn/Stripe/Custom)
3. Options:
   - **Upload JSON**: Drag-and-drop file (max 5MB)
   - **Manual Entry**: Fill form fields (credential name, rating, date, etc.)
4. Preview parsed data before minting
5. Click "Mint All" to batch-create NFTs
6. Progress indicator shows minting status for each credential

**Future Enhancement:**
Post-MVP, replace with OAuth flows to platforms like Upwork (using their API), Coursera, GitHub, etc.

---

#### **Feature 6: Export to PDF/JSON Resume**

**Description:**  
Generate downloadable portfolio formats for off-chain use (email applications, Web2 job boards, archival).

**Export Formats:**

1. **PDF Resume**:

   - Clean, professional layout (single-page or multi-page)
   - Sections: Header (name, wallet address, trust score), Skills, Reviews, Certifications, Payment History
   - Includes QR code linking to on-chain portfolio
   - Watermark: "Verified on Polkadot Blockchain"
   - Generated using jsPDF library

2. **JSON Format**:
   - Machine-readable export of all NFT metadata
   - Useful for API integrations or data portability
   - Schema matches NFT metadata structure
   - Example use: Import into future platforms or personal websites

**User Flow:**

1. User clicks "Export Portfolio" button on dashboard
2. Modal opens with format selection (PDF/JSON)
3. For PDF: Preview before download
4. Click "Download" â†’ File saved to local device
5. Success notification with share instructions

---

#### **Feature 7: Cross-Chain Portability (XCM Demo)**

**Description:**  
Demonstrate Polkadot's Cross-Consensus Messaging (XCM) by transferring NFT metadata between Paseo testnet and a mock parachain (simulated Astar or Moonbeam environment).

**Technical Approach:**

- **MVP Scope**: Basic XCM transfer of credential metadata (not full NFT transfer, which requires complex parachain setup)
- **Demo Flow**:
  1. User selects a credential from portfolio
  2. Clicks "Share to Parachain" button
  3. Modal shows destination options (e.g., "Astar DAO Portal")
  4. Transaction sends XCM message with metadata payload
  5. Confirmation shows transaction hash on both chains

**XCM Message Structure:**

```rust
// Simplified example
let message = Xcm(vec![
    WithdrawAsset(metadata_asset),
    BuyExecution { fees, weight_limit },
    DepositAsset { assets, beneficiary }
]);
```

**Success Criteria:**

- Successful XCM message sent from Paseo relay chain to mock parachain
- Metadata retrievable on destination chain
- Demo video clearly shows cross-chain portability value proposition

---

### 5.3 Non-Essential Features (Post-MVP Roadmap)

| **Feature**                   | **Timeline** | **Description**                                                                                      |
| ----------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| **Real Web2 API Integration** | 3 months     | OAuth flows for Upwork, Fiverr, LinkedIn, GitHub                                                     |
| **Zero-Knowledge Proofs**     | 6 months     | Hide sensitive credential details while proving validity (e.g., "earned >$10K" without exact amount) |
| **Mobile App**                | 6 months     | React Native app for iOS/Android with push notifications                                             |
| **AI Trust Scoring**          | 9 months     | Machine learning model for fraud detection and score optimization                                    |
| **DAO Governance**            | 12 months    | Community voting on disputed credentials or trust score parameters                                   |
| **Monetization**              | 12 months    | Freemium model: Basic free, premium exports/analytics for $5/month                                   |
| **Multi-Language Support**    | 12 months    | i18n for Spanish, Hindi, Mandarin, Portuguese                                                        |
| **AR Badge Previews**         | 18 months    | View NFT badges in augmented reality via mobile camera                                               |

## 6. User Stories

### 6.1 Freelancer Stories (Primary Users)

| **ID** | **As a...**                    | **I want to...**                             | **So that...**                                                   | **Acceptance Criteria**                                                                                                                   |
| ------ | ------------------------------ | -------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| US-01  | Freelance Developer            | Mint an NFT for my React certification       | I can add verifiable skills to my portfolio                      | - Certification NFT created with metadata<br>- Displays in dashboard within 3 seconds<br>- Transaction cost <0.01 DOT                     |
| US-02  | Freelance Designer             | Import my Upwork 5-star reviews              | I can consolidate my reputation from multiple platforms          | - JSON upload successful<br>- All reviews parsed and minted as NFTs<br>- Reviews reflected in trust score                                 |
| US-03  | Freelancer (any)               | View my trust score in real-time             | I can understand my portfolio's strength                         | - Score displays prominently on dashboard<br>- Updates immediately after adding credentials<br>- Breakdown shows contribution by category |
| US-04  | Freelancer (any)               | Export my portfolio as a PDF resume          | I can apply to Web2 jobs via email                               | - PDF generates within 5 seconds<br>- Includes QR code to on-chain portfolio<br>- Professional formatting (single/multi-page)             |
| US-05  | Web3 Freelancer                | Transfer my credentials to another parachain | I can use my portfolio in DAO hiring platforms                   | - XCM message sent successfully<br>- Metadata retrievable on destination chain<br>- Transaction confirmed on both chains                  |
| US-06  | Freelancer (privacy-conscious) | Share my portfolio via a public link         | Recruiters can verify my credentials without accessing my wallet | - Link generated with wallet address<br>- Link opens public portfolio view<br>- QR code also available for offline sharing                |
| US-07  | Freelancer (new user)          | See sample/mock credentials on first login   | I understand how the platform works before adding real data      | - Demo mode available with sample NFTs<br>- Clear "Switch to Real Mode" button<br>- Tutorial/tooltips guide through features              |

### 6.2 Recruiter Stories (Secondary Users)

| **ID** | **As a...**          | **I want to...**                             | **So that...**                                      | **Acceptance Criteria**                                                                                                               |
| ------ | -------------------- | -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| US-08  | DAO Recruiter        | Verify a candidate's Upwork reviews on-chain | I can trust their claimed credentials are authentic | - Enter wallet address or scan QR code<br>- View all credentials with on-chain proof<br>- See trust score and verification timestamps |
| US-09  | Enterprise Recruiter | Filter candidates by trust score range       | I can quickly shortlist qualified freelancers       | - Search/filter interface available<br>- Results show trust score prominently<br>- Can sort by score, date, or credential count       |
| US-10  | Hiring Manager       | Export candidate portfolio data              | I can share with my team for review                 | - Download JSON with all metadata<br>- Include link to on-chain verification<br>- Timestamp of export included                        |

### 6.3 Platform Integrator Stories (Tertiary Users)

| **ID** | **As a...**      | **I want to...**                      | **So that...**                                | **Acceptance Criteria**                                                                                    |
| ------ | ---------------- | ------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| US-11  | Gig Platform Dev | Integrate "Login with FreelanceForge" | Our users can import their portfolios         | - OAuth-like flow available (post-MVP)<br>- API documentation provided<br>- Webhook for credential updates |
| US-12  | DAO Developer    | Query trust scores via API            | Our smart contracts can make hiring decisions | - REST API endpoint available<br>- Returns JSON with score + breakdown<br>- Response time <500ms           |

### 6.4 Edge Case & Error Handling Stories

| **ID** | **As a...** | **I want to...**                                    | **So that...**                          | **Acceptance Criteria**                                                                                                                                       |
| ------ | ----------- | --------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-13  | User (any)  | See clear error messages if wallet connection fails | I know how to fix the issue             | - Error message explains problem (e.g., "No wallet detected")<br>- Suggests solutions (e.g., "Install Polkadot.js extension")<br>- Link to help documentation |
| US-14  | User (any)  | Cancel an NFT minting transaction mid-process       | I don't waste gas fees on mistakes      | - "Cancel" button available during signing<br>- No charge if canceled before confirmation<br>- Clear feedback that transaction was canceled                   |
| US-15  | User (any)  | Recover my portfolio if I lose wallet access        | I don't lose my credentials permanently | - Portfolio data stored on-chain (immutable)<br>- Can access via any device with wallet import<br>- Instructions provided for wallet recovery                 |

## 7. Technical Requirements

### 7.1 System Architecture

**Technology Stack:**

| **Component**          | **Technology**           | **Version** | **Purpose**                                                             |
| ---------------------- | ------------------------ | ----------- | ----------------------------------------------------------------------- |
| **Backend Runtime**    | Substrate (Rust)         | 3.0+        | Custom blockchain logic for NFT minting/storage                         |
| **Frontend Framework** | React.js                 | 18.2.0      | User interface and dashboard (stable production release)                |
| **State Management**   | TanStack Query           | 5.51+       | Server state and async data management with React 18 support            |
| **Blockchain API**     | @polkadot/api            | 11.3.1      | Connect frontend to Substrate node (current stable)                     |
| **Wallet Integration** | @polkadot/extension-dapp | 0.47.x      | Wallet connection and transaction signing (renamed from extension-dojo) |
| **Type Definitions**   | @polkadot/types          | 11.3.1      | Custom pallet type definitions                                          |
| **Keyring**            | @polkadot/keyring        | 12.6.2      | Wallet/account management                                               |
| **UI Components**      | Material-UI (MUI)        | 5.x         | Pre-built responsive components                                         |
| **PDF Export**         | jsPDF                    | 2.x         | Generate PDF resumes                                                    |
| **QR Code**            | qrcode.react             | 3.x         | Generate shareable QR codes                                             |
| **Deployment Network** | Paseo Testnet            | N/A         | Polkadot test network for MVP                                           |

**Data Storage**: On-chain Substrate storage maps (Credentials, OwnerCredentials)  
**Integrations**: Polkadot.js for wallet/NFT queries, TanStack Query for caching & state management, XCM for cross-chain transfers, Mock JSON for Web2 data

**Error Handling Matrix:**

| **Error Type**       | **Scenario**              | **User Message**                     | **Technical Action**                            |
| -------------------- | ------------------------- | ------------------------------------ | ----------------------------------------------- |
| RPC Connection       | Paseo node down           | "Network unavailable. Retrying..."   | Exponential backoff (3 attempts) + fallback RPC |
| Wallet Rejection     | User cancels transaction  | "Transaction cancelled by user"      | Return to form, preserve data                   |
| Insufficient Balance | Low DOT balance           | "Insufficient funds (need 0.01 DOT)" | Display faucet link                             |
| Invalid Metadata     | Malformed credential data | "Please check all required fields"   | Client-side validation                          |

**RPC Endpoint Fallback Strategy:**

```typescript
const RPC_ENDPOINTS = [
  "wss://paseo.dotters.network",
  "wss://paseo-rpc.polkadot.io",
  "ws://127.0.0.1:9944", // Local fallback
];
```

**CORS Configuration (Vite Dev Server):**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "ws://127.0.0.1:9944",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
```

### 7.2 Non-Functional Requirements

**Performance:**

- Page load time: <1.5 seconds | Query response: <500ms | Transaction cost: <0.01 DOT

**Security:**

- Wallet-based authentication (non-custodial) | Immutable NFTs | No PII storage on-chain | Input validation

**Scalability:**

- Polkadot parachains for horizontal scaling | Lazy loading (20 credentials/batch) | SCALE codec optimization | TanStack Query caching for reduced RPC calls

**Usability:**

- Mobile-responsive (breakpoints: 320px, 768px, 1024px, 1440px) | WCAG 2.1 AA accessibility | Browser support: Chrome 90+, Firefox 88+

**Dependencies:**

- Backend: Rust 1.70+, Cargo, Substrate CLI
- Frontend: Node.js 18+, React 18.2.0, @polkadot/api 11.3.1, @polkadot/extension-dapp 0.47.x, @polkadot/types 11.3.1, @polkadot/keyring 12.6.2, @tanstack/react-query 5.51+, @mui/material, jsPDF, qrcode.react

## 8. Design and UX Guidelines

## 7. Technical Requirements

### 7.1 System Architecture

- **Backend**: Polkadot SDK (Substrate in Rust) for custom NFT pallet and trust score logic.
- **Frontend**: React.js with Polkadot.js API for wallet integration and queries.
- **Deployment**: Paseo testnet (Polkadotâ€™s test network); local node for dev.
- **Data Storage**: On-chain Substrate storage maps (Credentials, Owners).
- **Integrations**:
  - Polkadot.js for wallet/NFT queries.
  - XCM for cross-chain metadata transfer.
  - Mock JSON for Web2 data (no real APIs in MVP).

### 7.2 Non-Functional Requirements

- **Performance**: <2s page load, <1s query response, support 100 concurrent users.
- **Security**: Wallet-based authentication, immutable NFTs, no PII storage.
- **Scalability**: Leverage Polkadot parachains for future growth, TanStack Query caching for optimized performance.
- **Usability**: Mobile-responsive, WCAG-compliant (high-contrast colors).
- **Compatibility**: Chrome/Firefox, Polkadot.js/Talisman wallets.
- **Dependencies**:
  - Rust/Cargo (backend).
  - Node.js, React 18.2.0, @polkadot/api 11.3.1, @polkadot/extension-dapp 0.47.x, @polkadot/types 11.3.1, @tanstack/react-query 5.51+, @polkadot/keyring 12.6.2, jsPDF (frontend).

## 8. Design and UX Guidelines

- **Style Guide**: Clean, modern UI (Material UI-inspired); blue/green palette (#0078D4, #00CC6A) for trust/tech vibe.
- **Wireframes** (Conceptual):
  - **Login Page**: Wallet connect button, minimal branding.
  - **Dashboard**: Timeline of NFT cards (skill/review/payment), trust score badge, export button.
  - **Mint Page**: Form (name, description), submit extrinsic.
- **User Flow**:
  1. Connect wallet â†’ Sign in.
  2. Mint/upload credential â†’ Save as NFT.
  3. View dashboard â†’ Export/share.
  4. Share link/QR with recruiter.
- **Accessibility**: Clear fonts (e.g., Roboto), high contrast, screen-reader support.

## 9. Development and Testing Plan

### 9.1 Development Phases

**Phase 1: Setup & Infrastructure**

- Init Substrate node template
- Setup React app with MUI
- Configure Paseo testnet connection
- Create GitHub repo with CI/CD
- Design system setup

**Deliverables:**

- Running local Substrate node
- React app scaffold
- GitHub repo with CI/CD

**Phase 2: Backend Development**

- Build pallet-freelance-credentials
- Implement mint_credential() extrinsic
- Setup storage maps
- Deploy to Paseo testnet
- Write Cargo unit tests

**Deliverables:**

- Functional NFT minting pallet
- Deployed on Paseo
- 80%+ test coverage

**Phase 3: Frontend Development**

- Dashboard component (timeline, cards)
- Trust score widget
- Wallet integration (Polkadot.js/Talisman)
- Export PDF/JSON functionality
- Responsive styling

**Deliverables:**

- Fully functional dashboard
- Working wallet connection
- Export features

**Phase 4: Integration & XCM**

- End-to-end testing (mint → view → export)
- Basic XCM implementation
- Mock data aggregation UI
- Bug fixes and optimization

**Deliverables:**

- E2E test suite passing
- XCM demo working
- Demo video drafted

**Phase 5: Polish & Submission**

- README documentation
- Code comments and cleanup
- Finalize demo video (editing)
- Devpost submission
- Social media posts

**Deliverables:**

- Public GitHub repo
- Polished demo video
- Devpost submission

### 9.2 Testing Strategy

**Unit Testing (Backend):**

```rust
// Example Cargo test for NFT minting
#[test]
fn test_mint_credential() {
    new_test_ext().execute_with(|| {
        let credential_data = CredentialData {
            credential_type: CredentialType::Skill,
            name: b"Rust Expert".to_vec(),
            // ... other fields
        };

        assert_ok!(FreelanceCredentials::mint_credential(
            Origin::signed(1),
            credential_data
        ));

        // Verify storage
        assert!(Credentials::<Test>::contains_key(credential_id));
    });
}
```

- **Coverage Target**: 80%+ for pallet functions
- **Tools**: Cargo test, cargo-tarpaulin for coverage reports

**Integration Testing (Frontend + Backend):**

- Test flow: Wallet connect â†’ Mint NFT â†’ Query from dashboard â†’ Export â†’ Share
- Use Polkadot.js Apps UI as secondary verification tool
- Mock wallet responses for automated testing

**Security Testing:**

- Input validation: Test XSS, SQL injection attempts (sanitize forms)
- Transaction replay attacks: Verify nonce incrementing
- Unauthorized access: Test credential visibility flags
- Wallet security: Ensure no private key exposure in client code

**Usability Testing:**

- Recruit 5 mock users (team members/friends with Web3 knowledge)
- Task scenarios:
  1. Connect wallet and mint first credential (target: <2 minutes)
  2. Import mock JSON data (target: <3 minutes)
  3. Export PDF resume (target: <1 minute)
  4. Share portfolio via QR code
- Collect feedback via survey (SUS score target: 80+)

**Performance Testing:**

- Load test: Simulate 100 concurrent users querying dashboard
- Stress test: Mint 500 credentials for single wallet, verify rendering
- Network test: Test on 3G connection speeds (mobile)

### 9.3 Development Tools & Environment

| **Category**        | **Tool**                                | **Purpose**                             |
| ------------------- | --------------------------------------- | --------------------------------------- |
| **IDE**             | VS Code                                 | Code editing with Rust Analyzer, ESLint |
| **Backend**         | Substrate CLI, Rustup, Cargo            | Substrate node development              |
| **Frontend**        | Create React App, npm                   | React development server                |
| **Version Control** | Git + GitHub                            | Code repository, PRs, issues            |
| **Testing**         | Cargo test, Jest, React Testing Library | Automated testing                       |
| **Debugging**       | Polkadot.js Apps, Browser DevTools      | Blockchain and frontend debugging       |
| **CI/CD**           | GitHub Actions                          | Automated testing on push               |
| **Documentation**   | Markdown, JSDoc                         | README, code comments                   |

## 10. Submission Requirements (Hackathon)

### 10.1 GitHub Repository

**Repository Structure:**

```
freelanceforge/
â”œâ”€â”€ substrate-node/
â”‚   â”œâ”€â”€ pallets/
â”‚   â”‚   â””â”€â”€ freelance-credentials/
â”‚   â”œâ”€â”€ runtime/
â”‚   â””â”€â”€ Cargo.toml
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ context/
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ README.md
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ PRD.md (this document)
â”‚   â”œâ”€â”€ ARCHITECTURE.md
â”‚   â””â”€â”€ USER_GUIDE.md
â”œâ”€â”€ demo/
â”‚   â”œâ”€â”€ screenshots/
â”‚   â””â”€â”€ demo-script.md
â”œâ”€â”€ README.md (main)
â”œâ”€â”€ LICENSE (MIT)
â””â”€â”€ .github/
    â””â”€â”€ workflows/ci.yml
```

**README.md Must Include:**

1. **Project Overview** (2-3 paragraphs):

   - "FreelanceForge unifies freelance credentials as verifiable NFTs on Polkadot..."
   - Problem statement + solution summary
   - Key features (NFT minting, trust score, XCM portability)

2. **Tech Stack**:

   - Substrate 3.0, React 18, Polkadot.js API
   - Deployed on Paseo testnet

3. **Setup Instructions**:

   ```bash
   # Backend
   cd substrate-node
   cargo build --release
   ./target/release/node-template --dev

   # Frontend
   cd frontend
   npm install
   npm start
   ```

4. **Usage Guide**:

   - Connect wallet (Talisman/Polkadot.js extension)
   - Mint credential: Navigate to "Add Credential", fill form, sign transaction
   - View dashboard: Credentials timeline auto-loads
   - Export: Click "Export" button, select PDF

5. **Polkadot Integration Highlights**:

   - Custom Substrate pallet for NFT logic
   - XCM for cross-chain credential sharing
   - Paseo testnet deployment

6. **Demo Links**:
   - Live demo: [URL if hosted]
   - Video: [YouTube link]
   - Devpost: [Submission link]

### 10.2 Demo Video Requirements

**Duration**: 3 minutes (strict Devpost requirement)

**Structure:**

1. **Introduction** (20 seconds):

   - "Hi, I'm [Name], presenting FreelanceForge..."
   - Problem: "$1.2T gig economy, fragmented credentials"
   - Solution: "Polkadot-based NFT portfolio"

2. **Live Demo** (2 minutes):

   - Screen recording with voiceover:
     a. Show landing page, click "Connect Wallet"
     b. Wallet connection flow (Talisman)
     c. Navigate to "Add Credential", mint a skill NFT (Rust Expert)
     d. Show transaction confirmation, credential appears in timeline
     e. Display trust score calculation (86/100, Gold tier)
     f. Export portfolio as PDF, show generated resume with QR code
     g. (Optional) Quick XCM transfer demo to mock parachain

3. **Polkadot Highlights** (30 seconds):

   - Explain custom Substrate pallet architecture
   - Show XCM cross-chain potential (diagram/animation)
   - Mention low transaction costs (<0.01 DOT)

4. **Impact & Future** (10 seconds):
   - "59M+ US freelancers can benefit..."
   - Future: Real platform integrations, ZKPs, mobile app

**Technical Production:**

- Tool: OBS Studio or Loom for screen recording
- Quality: 1080p HD, clear audio (use external mic)
- Captions: Auto-generate via YouTube for accessibility
- Upload: YouTube (public or unlisted), link in Devpost

### 10.3 Devpost Submission Checklist

- [ ] Project title: "FreelanceForge - Web3 Identity Portfolio for Freelancers"
- [ ] Tagline: "Unify your freelance credentials as portable, verifiable NFTs on Polkadot"
- [ ] Description (500-1000 words):
  - Repeat problem statement
  - Technical approach (Substrate, XCM, React)
  - User stories
  - Polkadot advantages over competitors
- [ ] Category: "User-Centric Apps" + "Polkadot Tinkerers"
- [ ] Tech Stack tags: Substrate, Polkadot, React, NFTs, XCM
- [ ] GitHub repo link (public)
- [ ] Demo video link (YouTube)
- [ ] Screenshots (4-6 images): Landing, Dashboard, Mint Form, Trust Score, PDF Export
- [ ] Team members (names, roles)
- [ ] Built With: Substrate, @polkadot/api, React, Material-UI, jsPDF

## 11. Risks and Mitigations

| **Risk**                          | **Impact**              | **Probability** | **Mitigation Strategy**                                                                              | **Contingency Plan**                                                              |
| --------------------------------- | ----------------------- | --------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **XCM implementation complexity** | High (demo requirement) | Medium          | - Use Polkadot Discord for support<br>- Follow official XCM tutorials<br>- Allocate 5 days (buffer)  | Fallback to local node XCM simulation<br>Demo with mocked parachain               |
| **Time constraints (22 days)**    | High (incomplete MVP)   | High            | - Daily standups (async)<br>- Prioritize P0 features<br>- Use Material UI for rapid styling          | Cut nice-to-have features (AR previews)<br>Focus on core: mint, dashboard, export |
| **Substrate learning curve**      | Medium (bugs/delays)    | Medium          | - Review Oct 21-24 workshop videos<br>- Use substrate-node-template<br>- Ask Polkadot Discord        | Simplify pallet logic<br>Use existing identity pallet as base                     |
| **Paseo testnet instability**     | Medium (demo failures)  | Low             | - Test early and often<br>- Monitor Paseo status page<br>- Keep local node as backup                 | Record demo video with local node<br>Note testnet limitations in README           |
| **Low community vote engagement** | Low (bonus prize)       | Medium          | - Share demo in Polkadot subreddit<br>- Post Twitter thread with video<br>- Engage Discord community | Focus on judges' scoring<br>Highlight technical merit                             |
| **Wallet compatibility issues**   | Medium (user friction)  | Low             | - Test with 3 wallets (Polkadot.js, Talisman, SubWallet)<br>- Provide clear setup instructions       | Recommend Talisman as primary<br>Detailed troubleshooting guide in README         |
| **Security vulnerabilities**      | High (reputation risk)  | Low             | - Input sanitization<br>- Basic security testing<br>- Disclaimer: "Testnet only, not audited"        | Disclose known limitations<br>Plan post-hackathon audit                           |

## 12. Competitive Analysis

| **Solution**         | **Blockchain**    | **Key Features**                                                            | **Strengths**                                                     | **Weaknesses**                                                                                | **FreelanceForge Advantage**                                                                                         |
| -------------------- | ----------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Braintrust**       | Ethereum          | - Gig matching marketplace<br>- BTRST token for governance<br>- Talent pool | - Established user base (500K+ users)<br>- Real Web2 integrations | - High gas fees ($2-5 per transaction)<br>- No portable NFT portfolio<br>- Ethereum-locked    | - Sub-penny transactions on Polkadot<br>- True cross-chain portability via XCM<br>- User-owned NFT credentials       |
| **Superteam**        | Solana            | - NFT badges for Web3 contributions<br>- Bounty platform                    | - Fast transactions<br>- Growing Solana ecosystem                 | - Solana-only (no cross-chain)<br>- Limited to crypto-native work<br>- No trust scoring       | - Polkadot XCM enables broader interoperability<br>- Aggregates Web2 + Web3 credentials<br>- Algorithmic trust score |
| **Gitcoin Passport** | Ethereum, Polygon | - Decentralized identity<br>- Sybil resistance stamps<br>- 20+ integrations | - Strong Web3 adoption<br>- Diverse credential types              | - Not freelancer-focused<br>- Generic scoring (no gig specialization)<br>- High Ethereum fees | - Tailored to gig economy (reviews, payments)<br>- Freelance-specific trust algorithm<br>- Lower costs on Polkadot   |
| **LinkedIn + Web3**  | N/A               | - Traditional professional network<br>- Endorsements/recommendations        | - 900M+ users<br>- Industry standard                              | - Centralized (Microsoft-owned)<br>- No blockchain verification<br>- Siloed data              | - Decentralized, user-owned<br>- Tamper-proof on-chain credentials<br>- Exportable across platforms                  |
| **Upwork Profiles**  | N/A (Web2)        | - Reviews, skills, earnings<br>- Talent matching                            | - Largest gig platform<br>- Built-in payment system               | - Platform lock-in<br>- 20% commission fees<br>- No portability                               | - Zero platform lock-in<br>- Portable across all platforms<br>- User controls data                                   |

**Unique Value Propositions:**

1. **Polkadot's Low Fees**: ~$0.01 vs. $2-5 on Ethereum â†’ accessible to global freelancers (including unbanked)
2. **XCM Interoperability**: Only solution enabling true cross-chain credential sharing (Polkadot â†” Astar â†” Moonbeam â†” future bridges)
3. **Substrate Customization**: Custom pallet logic for freelance-specific features (trust score, soulbound NFTs)
4. **Web2 + Web3 Aggregation**: Bridges traditional and crypto economies (unlike Superteam's Web3-only focus)

- **Devpost Submission**: Link repo, video, and description emphasizing Polkadot integration.

## 11. Risks and Mitigations

- **Risk**: XCM implementation delays.
  - **Mitigation**: Fallback to local node demo; use Polkadot Discord for support.
- **Risk**: Time constraints for polished UX.
  - **Mitigation**: Prioritize core features (mint, dashboard); use Material UI for quick styling.
- **Risk**: Low community vote engagement.
  - **Mitigation**: Share demo in Polkadot Discord/Reddit; highlight UX in video.
- **Risk**: Pallet bugs (e.g., storage issues).
  - **Mitigation**: Test early on Paseo; leverage Oct 21â€“24 workshops (YouTube).

## 12. Competitive Analysis

- **Braintrust (Ethereum)**: Gig matching, no unified NFT portfolio. FreelanceForge adds cross-platform portability.
- **Superteam (Solana)**: NFT badges, but Solana-locked. Polkadotâ€™s XCM enables broader interoperability.
- **Gitcoin Passport (Ethereum/Polygon)**: General credentials, not freelancer-focused. FreelanceForge tailors to gig economy with trust score.
- **Unique Edge**: Polkadotâ€™s low fees (~0.01 DOT vs. $2+ ETH), Substrate customization, XCM portability.

## 13. Future Roadmap

### 13.1 Short-Term (3 Months Post-Hackathon)

| **Feature**                    | **Description**                                  | **Business Value**                                      | **Technical Complexity**                   |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------ |
| **Real Web2 API Integrations** | OAuth flows for Upwork, Fiverr, LinkedIn, GitHub | Eliminates manual data entry, attracts mainstream users | High (OAuth, rate limits, API maintenance) |
| **Mobile App (React Native)**  | iOS/Android native app with push notifications   | 70% of freelancers use mobile-first                     | Medium (port React web to Native)          |
| **Enhanced Trust Score**       | Include time-based decay, weighted endorsements  | More accurate freelancer ranking                        | Medium (algorithm refinement)              |
| **Bulk Import Tool**           | CSV upload for migrating existing portfolios     | Speeds onboarding for power users                       | Low (CSV parsing)                          |

### 13.2 Medium-Term (6 Months)

| **Feature**                      | **Description**                                                                                 | **Business Value**                   | **Technical Complexity**                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| **Zero-Knowledge Proofs (ZKPs)** | Prove credential validity without revealing details (e.g., "earned >$10K" without exact amount) | Privacy for high-value freelancers   | Very High (zk-SNARKs/STARKs integration) |
| **DAO Governance**               | Community voting on disputed credentials, trust score parameters                                | Decentralized dispute resolution     | High (governance pallet, voting UI)      |
| **AI-Powered Matching**          | ML model suggesting freelancers to clients based on portfolio                                   | Revenue via premium matching service | High (ML model training, hosting)        |
| **Multi-Chain Bridges**          | Expand XCM to Ethereum, Solana via bridges                                                      | Access to 80% of Web3 job markets    | Very High (bridge security, liquidity)   |

### 13.3 Long-Term (12 Months)

| **Feature**                | **Description**                                                                                   | **Business Value**                                     | **Technical Complexity**                         |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **Freemium Monetization**  | Basic free, premium features ($5-10/month): advanced analytics, priority support, custom branding | Sustainable revenue model                              | Medium (payment integration, subscription logic) |
| **Enterprise B2B**         | White-label solution for gig platforms to integrate FreelanceForge                                | Major revenue stream, strategic partnerships           | High (multi-tenancy, SLAs)                       |
| **AR Badge Viewer**        | View NFT badges in augmented reality via mobile camera                                            | Viral marketing tool for conferences                   | Medium (AR.js or ARKit/ARCore)                   |
| **Social Features**        | Follow freelancers, endorsement requests, portfolio showcases                                     | Network effects, user retention                        | Medium (social graph data model)                 |
| **Multi-Language Support** | i18n for Spanish, Hindi, Mandarin, Portuguese, Arabic                                             | Access to global markets (1B+ non-English freelancers) | Medium (translation, RTL support)                |

### 13.4 Impact Projections

| **Metric**                | **6 Months**               | **12 Months**                             | **24 Months**                 |
| ------------------------- | -------------------------- | ----------------------------------------- | ----------------------------- |
| **Active Users**          | 10,000                     | 100,000                                   | 500,000                       |
| **Credentials Minted**    | 50,000                     | 1,000,000                                 | 10,000,000                    |
| **Platform Integrations** | 3 (Upwork, Fiverr, GitHub) | 10 (add LinkedIn, Toptal, Dribbble, etc.) | 25+                           |
| **Monthly Revenue**       | $0 (MVP)                   | $50K (freemium)                           | $500K (enterprise + freemium) |
| **DAOs/Platforms Using**  | 5 pilot partners           | 50                                        | 200                           |

## 14. Appendix

### 14.1 Technical References

- **Polkadot SDK Documentation**: [docs.substrate.io](https://docs.substrate.io) - Comprehensive Substrate development guides
- **Hackathon Resource Guide**: [github.com/polkadot-developers/hackathon-guide](https://github.com/polkadot-developers/hackathon-guide) - Starter templates, tutorials
- **Paseo Testnet**: [paseo.subscan.io](https://paseo.subscan.io) - Testnet explorer and RPC endpoints
- **XCM Documentation**: [wiki.polkadot.network/docs/learn-cross-consensus](https://wiki.polkadot.network/docs/learn-cross-consensus) - Cross-chain messaging protocols
- **Polkadot.js API Docs**: [polkadot.js.org/docs/api](https://polkadot.js.org/docs/api) - Frontend integration library
- **Material-UI Components**: [mui.com/components](https://mui.com/components/) - React UI framework
- **React 19 Documentation**: [react.dev](https://react.dev) - Official React documentation
- **TanStack Query Docs**: [tanstack.com/query/latest](https://tanstack.com/query/latest) - Data fetching and caching library
- **Substrate Workshop Videos (Oct 21-24, 2025)**: [YouTube playlist] - Hands-on tutorials from hackathon organizers

### 14.2 Market Research Sources

- **Upwork Economic Impact Report 2023**: [$1.2T gig economy valuation, 59M US freelancers]
- **Statista Gig Economy Forecast 2027**: [50% US workforce projection]
- **Web3 Adoption Statistics**: [420M crypto users globally, Chainalysis 2023]
- **Ethereum Gas Fee Analysis**: [Average $2-5 per transaction, Etherscan 2025 data]
- **Freelancer Pain Point Surveys**: [Internal research, N=50 freelancers]

### 14.3 Key Assumptions

1. **User Web3 Literacy**: Target users have basic familiarity with wallets (Metamask/Talisman) and can sign transactions
2. **Paseo Testnet Stability**: Testnet maintains 95%+ uptime during development and demo periods
3. **Platform API Availability (Post-MVP)**: Upwork, Fiverr, LinkedIn will maintain public APIs with reasonable rate limits
4. **Polkadot Community Support**: Active Discord community provides technical assistance within 24 hours
5. **Hackathon Timeline**: No major holidays or team emergencies during 22-day development period
6. **Regulatory Compliance**: NFT credentials classified as non-security tokens in major jurisdictions (US, EU)

### 14.4 Glossary

| **Term**          | **Definition**                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Substrate**     | Blockchain development framework by Parity Technologies, used to build custom Polkadot-compatible chains    |
| **Pallet**        | Modular runtime component in Substrate (analogous to smart contracts, but compiled into blockchain runtime) |
| **XCM**           | Cross-Consensus Messaging - Polkadot's protocol for cross-chain communication                               |
| **Parachain**     | Independent blockchain running parallel to Polkadot relay chain, sharing its security                       |
| **Extrinsic**     | Substrate term for transactions (e.g., function calls to pallets)                                           |
| **SCALE Codec**   | Simple Concatenated Aggregate Little-Endian - Substrate's data encoding format                              |
| **Paseo Testnet** | Polkadot's test network for experimentation without real DOT tokens                                         |
| **Soulbound NFT** | Non-transferable NFT tied to a specific wallet (prevents credential trading)                                |
| **Trust Score**   | Algorithmic reputation metric (0-100) calculated from credential quality/quantity                           |

### 14.5 Support Channels

**During Hackathon (Oct 27 - Nov 18, 2025):**

- **Polkadot Discord**: [polkadot-discord.w3f.tools](https://polkadot-discord.w3f.tools) - #hackathon-help channel
- **Hackathon Luma Events**: [luma.polkadot.network/hackathon](https://luma.polkadot.network/hackathon) - Office hours (Mon/Wed/Fri 3-5pm UTC)
- **GitHub Issues**: [github.com/polkadot-developers/support](https://github.com/polkadot-developers/support) - Technical questions
- **Stack Exchange**: [substrate.stackexchange.com](https://substrate.stackexchange.com) - Community Q&A

**Post-Hackathon:**

- **Project Email**: freelanceforge@protonmail.com (to be created)
- **Twitter**: @FreelanceForge (to be created)
- **GitHub Discussions**: [github.com/yourteam/freelanceforge/discussions](https://github.com) (for community engagement)

### 14.6 Acknowledgments

- **Polkadot Cloud Hackathon Organizers**: For providing workshops, resources, and prize pool
- **Substrate Community**: For open-source tools and documentation
- **Test Users**: [Names of mock testers] for usability feedback
- **Advisors**: [Any mentors consulted during development]

---

## Document Approval

| **Role**            | **Name**      | **Signature**            | **Date**     |
| ------------------- | ------------- | ------------------------ | ------------ |
| **Product Manager** | [Your Name]   | **\*\***\_\_\_\_**\*\*** | Oct 27, 2025 |
| **Backend Lead**    | [Team Member] | **\*\***\_\_\_\_**\*\*** | Oct 27, 2025 |
| **Frontend Lead**   | [Team Member] | **\*\***\_\_\_\_**\*\*** | Oct 27, 2025 |
| **UX/UI Designer**  | [Team Member] | **\*\***\_\_\_\_**\*\*** | Oct 27, 2025 |

**Contact Information:**

- **Team Lead**: [Your Name]
- **Email**: [youremail@example.com]
- **Discord**: [YourDiscord#1234]
- **GitHub**: [github.com/yourteam/freelanceforge](https://github.com)

**Hackathon Submission Deadline**: November 18, 2025, 4:45 AM GMT+5

---

**End of Document**

_This PRD is a living document. Post-hackathon updates will be tracked via GitHub version control._
