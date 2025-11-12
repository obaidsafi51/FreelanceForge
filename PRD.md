# Product Requirements Document (PRD): FreelanceForge - Web3 Identity Portfolio for Freelancers

## 1. Document Overview

| **Attribute**       | **Details**                            |
| ------------------- | -------------------------------------- |
| **Product Name**    | FreelanceForge                         |
| **Version**         | 1.1 (MVP for Polkadot Cloud Hackathon) |
| **Date**            | October 27, 2025                       |
| **Author**          | [Your Name or Team Name]               |
| **Document Status** | **CRITICAL UPDATE - 7 DAYS REMAINING** |
| **Last Updated**    | November 10, 2025                      |
| **Deadline**        | **November 18, 2025, 11:59 PM GMT+5**  |

### 1.1 Purpose

Define comprehensive requirements for a decentralized application (dApp) built on the Polkadot blockchain that aggregates freelance credentials (skills, client reviews, payment histories) into portable, verifiable NFT-based digital identities. The MVP specifically targets the Polkadot Cloud Hackathon's "User-Centric Apps" and "Polkadot Tinkerers" themes, emphasizing user sovereignty, verification integrity, and cross-chain interoperability.

### 1.2 🚨 CRITICAL UPDATE: 7-Day Emergency Sprint Plan

**Current Status (Nov 10, 2025):**

- **Days Remaining**: 7 days until Nov 17, 11:59 PM GMT+5 deadline
- **Original Plan**: 22-day development cycle (obsolete)
- **Revised Strategy**: Emergency sprint with aggressive descoping

**IMMEDIATE ACTION REQUIRED:**

| **Priority Level** | **Features**                                                | **Rationale**                                  |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------- |
| **P0 (MUST)**      | NFT minting pallet + Dashboard + Wallet + JSON export       | Core demo requirements, technically achievable |
| **P1 (SHOULD)**    | Trust score calculation + Mock data import + QR sharing     | Enhances demo, low complexity                  |
| **DESCOPED**       | ❌ XCM (too complex)<br>❌ PDF export<br>❌ Talisman wallet | Insufficient time, mention as future work      |

**Success Criteria (Revised):**

1. ✅ Working Substrate pallet on Paseo OR local node (Day 1-3)
2. ✅ Functional React dashboard with wallet integration (Day 3-5)
3. ✅ End-to-end flow: Connect → Mint → View → Export JSON (Day 5-6)
4. ✅ 3-minute demo video recorded and submitted (Day 7)

**Technology Stack Changes:**

- ✅ **React 18.2.0** (stable, production-ready - React 19 still in RC)
- ✅ **@polkadot/api 11.3.1** (current stable release)
- ✅ **@polkadot/extension-dapp 0.47.x** (renamed from extension-dojo in v10+)
- ❌ jsPDF → ✅ **Native JSON.stringify** (simpler)
- ✅ Added: @tanstack/react-query 5.51+ (proper caching with React 18)
- ✅ Added: @polkadot/types 11.3.1 (custom pallet type definitions)
- ✅ Added: @polkadot/keyring 12.6.2 (wallet/account management)

### 1.3 Scope

**⚠️ CRITICAL: REVISED MVP SCOPE (7-day sprint, deadline: Nov 17, 2025, 11:59 PM GMT+5)**:

**PRIORITY 0 (Must Have - Days 1-5):**

- Core NFT credential minting via **simplified** Substrate pallet OR smart contract fallback
- Basic web dashboard with credential display (React 18.x stable, not 19.x)
- Wallet integration (Polkadot.js extension only - Talisman secondary)
- Mock data aggregation (JSON import only - no complex parsing)
- Deployment on Paseo testnet OR local Substrate node

**PRIORITY 1 (Should Have - Days 6-7):**

- Trust score calculation (client-side only, simplified algorithm)
- Export functionality (JSON only - PDF if time permits)
- 3-minute demonstration video for submission
- GitHub repository with documentation

**DESCOPED FOR MVP (Post-Hackathon):**

- ❌ XCM implementation (too complex for 7 days - use as "future work" in presentation)
- ❌ PDF export (use JSON + mention future PDF in demo)
- ❌ Advanced UI polish (focus on functional over beautiful)
- ❌ Multiple wallet support (Polkadot.js only)

**Out-of-Scope for MVP**:

- Real-time Web2 API integrations (Upwork, Fiverr, LinkedIn OAuth)
- **Cross-Consensus Messaging (XCM) - DESCOPED due to time constraints**
- **PDF export - use JSON only, mention PDF as future enhancement**
- Advanced zero-knowledge proof (ZKP) implementations
- Mobile native applications (iOS/Android)
- Production-grade security audits
- Monetization features (freemium models)
- AI-enhanced trust scoring algorithms
- DAO governance mechanisms for dispute resolution
- **Talisman wallet support - Polkadot.js only for MVP**

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

- Mock user satisfaction score: ≥80% (from 5-10 test users)
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
| **Income**         | $45K/year (₹37L)                                                                                                                                                                                          |
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

| **Feature**               | **Priority**  | **Complexity** | **User Impact** | **MVP Status**            |
| ------------------------- | ------------- | -------------- | --------------- | ------------------------- |
| NFT Credential Minting    | P0 (Critical) | Medium         | High            | ✅ Included (Simplified)  |
| Portfolio Dashboard       | P0 (Critical) | Medium         | High            | ✅ Included (Basic UI)    |
| Trust Score Algorithm     | P0 (Critical) | High→Medium    | High            | ✅ Included (Client-side) |
| Wallet Integration        | P0 (Critical) | Low            | High            | ✅ Included (Polkadot.js) |
| Mock Data Aggregation     | P0 (Critical) | Low            | Medium          | ✅ Included (JSON only)   |
| Export to JSON            | P1 (High)     | Low            | Medium          | ✅ Included               |
| QR Code/Link Sharing      | P1 (High)     | Low            | Medium          | ✅ Included (if time)     |
| Export to PDF             | P2 (Medium)   | Medium         | Medium          | ❌ Post-MVP               |
| Basic XCM Transfer        | P2 (Medium)   | Very High      | Medium          | ❌ Descoped (7-day limit) |
| Real Web2 API Integration | P2 (Medium)   | Very High      | High            | ❌ Post-MVP               |
| Zero-Knowledge Proofs     | P3 (Low)      | Very High      | Medium          | ❌ Post-MVP               |
| Mobile Native App         | P3 (Low)      | High           | Medium          | ❌ Post-MVP               |
| AI-Enhanced Scoring       | P3 (Low)      | Very High      | Low             | ❌ Future                 |
| DAO Governance            | P3 (Low)      | High           | Low             | ❌ Future                 |

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
  - Stale time: 60 seconds for credentials
  - Cache time: 5 minutes
  - Refetch interval: disabled (only on invalidation)
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
Trust Score = (0.60 × Review Score) + (0.30 × Skill Score) + (0.10 × Payment Score)
```

**Component Calculations:**

1. **Review Score (60% weight)**:

   ```
   Review Score = (Average rating / 5) × 100 × 0.6
   ```

   - Example: 10 reviews averaging 4.5 stars → (4.5 / 5) × 100 × 0.6 = 54 points

2. **Skill Score (30% weight)**:

   ```
   Skill Score = (Number of verified skills × 5) + (Certification bonus)
   ```

   - Max 100 points (capped at 20 skills)
   - Certification bonus: +10 points per verified certification (max 3)
   - Example: 12 skills + 2 certifications → (12 × 5) + 20 = 80 → 80 × 0.3 = 24 points

3. **Payment Score (10% weight)**:
   ```
   Payment Score = MIN(100, (Total payment volume / $1000) × 10) × Recency factor
   ```
   - Recency factor: 1.0 if payments within 6 months, 0.7 if within 1 year, 0.5 if older
   - Example: $8,500 earned in last 6 months → (8500 / 1000) × 10 × 1.0 = 85 → 85 × 0.1 = 8.5 points

**Total Example:**
Alex has 10 reviews (avg 4.5★), 12 skills, 2 certifications, $8,500 earned → 54 + 24 + 8.5 = **86.5 Trust Score** (Gold tier)

**Technical Implementation:**

- Computed client-side in React for MVP (no gas costs)
- Future: On-chain calculation via Substrate pallet function for third-party verification
- Real-time updates when new credentials are minted

**Gamification Tiers:**

- 🥉 Bronze (0-25): "Getting Started"
- 🥈 Silver (26-50): "Building Reputation"
- 🥇 Gold (51-75): "Established Professional"
- 💎 Platinum (76-100): "Elite Freelancer"

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

**Data Transformation Layer:**

Platform-specific JSON must be transformed to match pallet schema:

```typescript
// src/utils/mockDataTransformers.ts
function transformUpworkJSON(upworkData: any) {
  return upworkData.reviews.map((review: any) => ({
    credential_type: "review",
    name: `${review.client} Review`,
    description: review.comment,
    rating: review.rating,
    timestamp: new Date(review.date).toISOString(),
    issuer: "Upwork",
    visibility: "public",
    proof_hash: null,
  }));
}

function transformLinkedInJSON(linkedInData: any) {
  return linkedInData.skills.map((skill: any) => ({
    credential_type: skill.certification ? "certification" : "skill",
    name: skill.name,
    description: skill.endorsements ? `${skill.endorsements} endorsements` : "",
    rating: null,
    timestamp: new Date().toISOString(),
    issuer: "LinkedIn",
    visibility: "public",
    proof_hash: null,
  }));
}

function transformStripeJSON(stripeData: any) {
  return [
    {
      credential_type: "payment",
      name: "Payment History",
      description: `${stripeData.transactions.length} transactions`,
      rating: null,
      timestamp: stripeData.transactions[0].date,
      issuer: "Stripe",
      visibility: "private",
      proof_hash: null,
      metadata: {
        total_amount: stripeData.transactions.reduce(
          (sum: number, t: any) => sum + t.amount,
          0
        ),
        currency: "USD",
      },
    },
  ];
}
```

**Future Enhancement:**
Post-MVP, replace with OAuth flows to platforms like Upwork (using their API), Coursera, GitHub, etc.

---

#### **Feature 6: Export to JSON Resume (PDF Post-MVP)**

**Description:**  
Generate downloadable portfolio formats for off-chain use (email applications, Web2 job boards, archival).

**MVP Export Format:**

1. **JSON Format** (PRIMARY):
   - Machine-readable export of all NFT metadata
   - Includes trust score calculation breakdown
   - Schema matches NFT metadata structure + portfolio summary
   - Example structure:
   ```json
   {
     "wallet_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
     "trust_score": 86.5,
     "trust_breakdown": {
       "review_score": 54,
       "skill_score": 24,
       "payment_score": 8.5
     },
     "credentials": [
       {
         "id": "0x1234...",
         "credential_type": "review",
         "name": "Acme Corp Review",
         "rating": 5,
         "timestamp": "2025-10-15T10:30:00Z"
       }
     ],
     "export_timestamp": "2025-11-10T14:22:00Z",
     "blockchain_verification": "paseo.subscan.io/account/5GrwvaEF..."
   }
   ```
   - Use case: Import into future platforms, personal websites, API integrations

**DESCOPED FOR MVP (Post-Hackathon):**

2. **PDF Resume** (FUTURE ENHANCEMENT):
   - Clean, professional layout (single-page or multi-page)
   - Sections: Header (name, wallet address, trust score), Skills, Reviews, Certifications, Payment History
   - Includes QR code linking to on-chain portfolio
   - Watermark: "Verified on Polkadot Blockchain"
   - Technology: jsPDF library (not in MVP dependencies)
   - Rationale for descoping: 7-day time constraint, JSON sufficient for demo

**User Flow (MVP - JSON Only):**

1. User clicks "Export Portfolio" button on dashboard
2. Browser downloads `freelanceforge-portfolio-{wallet}.json` automatically
3. Success notification: "Portfolio exported! Share this file with recruiters or import it elsewhere."
4. Optional: Display preview of JSON in modal before download

**User Flow (Future - PDF):**

1. User clicks "Export as PDF" button
2. Modal shows PDF preview with professional formatting
3. Click "Download" → PDF saved to local device
4. PDF includes QR code scannable to on-chain portfolio

---

#### **Feature 7: Cross-Chain Portability (XCM) - ⚠️ POST-MVP / FUTURE WORK**

**⚠️ DESCOPED FOR 7-DAY SPRINT**: XCM implementation requires 40+ hours (relay chain setup, parachain configuration, message crafting, testing). This exceeds our MVP timeline. Will be demonstrated conceptually in video and documented as future enhancement.

**Description:**  
Demonstrate Polkadot's Cross-Consensus Messaging (XCM) by transferring NFT metadata between Paseo testnet and a parachain (Astar or Moonbeam).

**Technical Approach (POST-MVP):**

- **Scope**: Basic XCM transfer of credential metadata (not full NFT transfer, which requires complex parachain setup)
- **Demo Flow** (conceptual for hackathon):
  1. User selects a credential from portfolio
  2. Clicks "Share to Parachain" button (UI mockup only)
  3. Modal shows destination options (e.g., "Astar DAO Portal")
  4. ~~Transaction sends XCM message with metadata payload~~ (future implementation)
  5. ~~Confirmation shows transaction hash on both chains~~ (future)

**XCM Message Structure (Reference):**

```rust
// Simplified example for future implementation
let message = Xcm(vec![
    WithdrawAsset(metadata_asset),
    BuyExecution { fees, weight_limit },
    DepositAsset { assets, beneficiary }
]);
```

**MVP Approach:**

- Include "Share to Parachain" button in UI (disabled state)
- Tooltip: "Coming soon - Cross-chain credential sharing"
- Mention XCM capability in demo video as differentiator
- Document XCM implementation plan in README future roadmap

**Post-Hackathon Implementation Plan:**

- Week 1-2: Set up local relay chain + parachain test environment
- Week 3-4: Implement XCM message crafting for metadata transfer
- Week 5-6: Testing and optimization
- Week 7+: Deploy to Paseo + live parachain

**Success Criteria (Post-MVP):**

- Successful XCM message sent from Paseo relay chain to live parachain
- Metadata retrievable on destination chain
- Round-trip time <10 seconds

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

---

## 6.5 Low-Level Technical Implementation Guide (7-Day Sprint)

### 6.5.1 Substrate Pallet Code (Simplified for MVP)

**File Structure:**

```
substrate-node/
├── pallets/
│   └── freelance-credentials/
│       ├── src/
│       │   ├── lib.rs           # Main pallet logic
│       │   ├── mock.rs          # Test setup
│       │   └── tests.rs         # Unit tests
│       └── Cargo.toml
└── runtime/
    ├── src/
    │   └── lib.rs               # Runtime configuration
    └── Cargo.toml
```

**Minimal Pallet Code (pallets/freelance-credentials/src/lib.rs):**

```rust
#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    }

    // Storage: credential_id -> (owner, JSON metadata)
    #[pallet::storage]
    pub type Credentials<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::Hash,
        (T::AccountId, BoundedVec<u8, ConstU32<4096>>),
        OptionQuery,
    >;

    // Storage: owner -> list of credential IDs
    #[pallet::storage]
    pub type OwnerCredentials<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<T::Hash, ConstU32<500>>,
        ValueQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        CredentialMinted {
            credential_id: T::Hash,
            owner: T::AccountId
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        CredentialAlreadyExists,
        MetadataTooLarge,
        TooManyCredentials,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(T::DbWeight::get().reads_writes(2, 2) + 50_000)]
        pub fn mint_credential(
            origin: OriginFor<T>,
            metadata_json: Vec<u8>,
        ) -> DispatchResult {
            let owner = ensure_signed(origin)?;

            ensure!(metadata_json.len() <= 4096, Error::<T>::MetadataTooLarge);

            let bounded_metadata = BoundedVec::try_from(metadata_json.clone())
                .map_err(|_| Error::<T>::MetadataTooLarge)?;

            let credential_id = T::Hashing::hash_of(&(&bounded_metadata, &owner));

            ensure!(!Credentials::<T>::contains_key(&credential_id),
                    Error::<T>::CredentialAlreadyExists);

            Credentials::<T>::insert(&credential_id, (owner.clone(), bounded_metadata));

            OwnerCredentials::<T>::try_mutate(&owner, |creds| {
                creds.try_push(credential_id)
                    .map_err(|_| Error::<T>::TooManyCredentials)
            })?;

            Self::deposit_event(Event::CredentialMinted { credential_id, owner });
            Ok(())
        }
    }
}
```

**Runtime Integration (runtime/src/lib.rs):**

```rust
// Add to runtime configuration
impl pallet_freelance_credentials::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
}

// Add to construct_runtime! macro
construct_runtime!(
    pub struct Runtime {
        System: frame_system,
        Balances: pallet_balances,
        FreelanceCredentials: pallet_freelance_credentials,  // Add this line
    }
);
```

### 6.5.2 Frontend Polkadot.js Integration

**Package.json Dependencies:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@polkadot/api": "^11.3.1",
    "@polkadot/extension-dapp": "^0.47.6",
    "@polkadot/types": "^11.3.1",
    "@polkadot/keyring": "^12.6.2",
    "@tanstack/react-query": "^5.51.23",
    "@mui/material": "^5.16.7",
    "@mui/icons-material": "^5.16.7",
    "qrcode.react": "^3.1.0",
    "react-router-dom": "^6.26.0",
    "yup": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "http-proxy-middleware": "^2.0.6"
  }
}
```

**API Utilities (src/utils/polkadotApi.ts):**

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";

const RPC_ENDPOINTS = [
  "wss://paseo.dotters.network", // Primary - Community-verified
  "wss://rpc.ibp.network/paseo", // Secondary - IBP (high reliability)
  "wss://paseo.rpc.amforc.com", // Tertiary
  "ws://127.0.0.1:9944", // Local fallback
];

let apiInstance: ApiPromise | null = null;

export async function getApi(): Promise<ApiPromise> {
  if (apiInstance?.isConnected) return apiInstance;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const provider = new WsProvider(endpoint);
      const api = await ApiPromise.create({ provider });
      await api.isReady;
      console.log(`✅ Connected to ${endpoint}`);
      apiInstance = api;
      return api;
    } catch (err) {
      console.warn(`Failed ${endpoint}:`, err);
    }
  }

  throw new Error("No Substrate node available");
}

export async function connectWallet() {
  const extensions = await web3Enable("FreelanceForge");
  if (!extensions.length) {
    throw new Error("Install Polkadot.js extension");
  }

  const accounts = await web3Accounts();
  if (!accounts.length) {
    throw new Error("No accounts in wallet");
  }

  return accounts;
}

export async function mintCredential(
  accountAddress: string,
  credentialData: Record<string, any>
): Promise<string> {
  const api = await getApi();

  // Get all accounts to find the source
  const accounts = await web3Accounts();
  const account = accounts.find((acc) => acc.address === accountAddress);

  if (!account) {
    throw new Error("Account not found in wallet");
  }

  // Use web3FromSource instead of web3FromAddress
  const injector = await web3FromSource(account.meta.source);

  const metadataJson = JSON.stringify(credentialData);

  return new Promise((resolve, reject) => {
    api.tx.freelanceCredentials
      .mintCredential(metadataJson)
      .signAndSend(
        accountAddress,
        { signer: injector.signer },
        ({ status, events }) => {
          if (status.isInBlock) {
            // Check for errors
            events.forEach(({ event }) => {
              if (api.events.system.ExtrinsicFailed.is(event)) {
                const [dispatchError] = event.data;
                let errorMsg = "Transaction failed";

                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  errorMsg = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                }

                reject(new Error(errorMsg));
              }
            });

            resolve(status.asInBlock.toString());
          }
        }
      )
      .catch(reject);
  });
}

export async function getCredentials(
  accountAddress: string
): Promise<Array<{ id: string; data: any }>> {
  const api = await getApi();

  const credentialIds = await api.query.freelanceCredentials.ownerCredentials(
    accountAddress
  );

  const ids = credentialIds.toJSON() as string[];

  // Use batch query for efficiency
  const credentials = await api.query.freelanceCredentials.credentials.multi(
    ids
  );

  return credentials
    .map((credData, index) => {
      if (credData.isSome) {
        const [owner, metadataBytes] = credData.unwrap();
        const metadataStr = new TextDecoder().decode(
          new Uint8Array(metadataBytes.toU8a())
        );
        return {
          id: ids[index],
          owner: owner.toString(),
          data: JSON.parse(metadataStr),
        };
      }
      return null;
    })
    .filter((c) => c !== null);
}
```

**TanStack Query Hooks (src/hooks/useCredentials.ts):**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCredentials, mintCredential } from "../utils/polkadotApi";

export function useCredentials(accountAddress: string | null) {
  return useQuery({
    queryKey: ["credentials", accountAddress],
    queryFn: () => getCredentials(accountAddress!),
    enabled: !!accountAddress,
    staleTime: 60000, // 60 seconds
    refetchInterval: false, // Only refetch on invalidation
  });
}

export function useMintCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountAddress, credentialData }: any) =>
      mintCredential(accountAddress, credentialData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["credentials", variables.accountAddress],
      });
    },
  });
}
```

### 6.5.3 Error Handling Matrix

| **Error Code**            | **Cause**                  | **User-Friendly Message**                    | **Action**                |
| ------------------------- | -------------------------- | -------------------------------------------- | ------------------------- |
| `No injected sources`     | Extension not installed    | "Please install Polkadot.js extension"       | Show install link         |
| `1010: Invalid`           | Insufficient balance       | "Insufficient balance. Get testnet tokens"   | Link to Paseo faucet      |
| `CredentialAlreadyExists` | Duplicate hash             | "This credential already exists"             | Suggest modifying data    |
| `MetadataTooLarge`        | JSON > 4KB                 | "Credential data too large (max 4KB)"        | Reduce description length |
| `TooManyCredentials`      | Owner has 500+ credentials | "Maximum credentials reached (500)"          | Suggest archiving         |
| `Network timeout`         | RPC endpoint down          | "Connection failed. Retrying with backup..." | Auto-switch to local node |
| `User rejected`           | Wallet signature canceled  | "Transaction canceled"                       | Allow retry               |
| `{"Module":{"index":X}}`  | Generic pallet error       | "Transaction failed. Please try again"       | Check pallet logs         |
| `Priority is too low`     | Transaction pool rejection | "Network busy. Retrying with higher fee..."  | Increase transaction tip  |
| `Inability to pay fees`   | Balance too low for fees   | "Insufficient balance for transaction fees"  | Link to faucet            |
| `{"BadOrigin": null}`     | Permission denied          | "Unauthorized operation"                     | Verify account selected   |

### 6.5.4 Deployment Configuration

**Vite Config (vite.config.ts):**

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/rpc": {
          target: env.VITE_LOCAL_RPC || "ws://127.0.0.1:9944",
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/rpc/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    define: {
      "process.env": {},
      "import.meta.env.VITE_PASEO_RPC": JSON.stringify(env.VITE_PASEO_RPC),
      "import.meta.env.VITE_LOCAL_RPC": JSON.stringify(env.VITE_LOCAL_RPC),
      "import.meta.env.VITE_APP_NAME": JSON.stringify(env.VITE_APP_NAME),
    },
  };
});
```

**Environment Variables (.env):**

```
VITE_PASEO_RPC=wss://paseo.rpc.amforc.com
VITE_LOCAL_RPC=ws://127.0.0.1:9944
VITE_APP_NAME=FreelanceForge
```

---

## 7. User Stories

### 7.1 System Architecture

**⚠️ UPDATED TECHNOLOGY STACK (Compatibility-Tested for 7-Day Sprint):**

| **Component**          | **Technology**               | **Version**            | **Purpose**                                     | **Why This Version**                                   |
| ---------------------- | ---------------------------- | ---------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| **Backend Runtime**    | Substrate (Rust)             | 3.0+ / polkadot-v1.1.0 | Custom blockchain logic for NFT minting/storage | Stable release, well-documented                        |
| **Frontend Framework** | React.js                     | **18.2.0**             | User interface and dashboard                    | **React 19 is RC - using stable 18.2 for reliability** |
| **State Management**   | TanStack Query (React Query) | **5.51.x**             | Server state and async data management          | Latest stable with React 18 compatibility              |
| **Blockchain API**     | @polkadot/api                | **11.3.1**             | Connect frontend to Substrate node              | **Current stable (v10 is outdated)**                   |
| **Wallet Integration** | @polkadot/extension-dapp     | **0.47.x**             | Wallet connection and transaction signing       | **Renamed from extension-dojo in v10+**                |
| **UI Components**      | @mui/material (Material-UI)  | **5.16.x**             | Pre-built responsive components                 | Stable, React 18 compatible                            |
| **JSON Export**        | Native JSON.stringify        | N/A                    | Generate JSON resumes                           | No external dependency needed                          |
| **QR Code**            | qrcode.react                 | **3.1.x**              | Generate shareable QR codes                     | Lightweight, React 18 compatible                       |
| **PDF Export**         | ~~jsPDF~~ (DESCOPED)         | ~~2.x~~                | ~~Generate PDF resumes~~                        | **Removed - JSON only for MVP**                        |
| **Deployment Network** | Paseo Testnet OR Local Node  | N/A                    | Polkadot test network for MVP                   | Local node fallback if Paseo unstable                  |

**CRITICAL ADDITIONS:**

| **Component**        | **Technology**        | **Version** | **Purpose**                                |
| -------------------- | --------------------- | ----------- | ------------------------------------------ |
| **CORS Proxy (Dev)** | http-proxy-middleware | 2.0.x       | Local dev: proxy Substrate RPC calls       |
| **Polkadot Types**   | @polkadot/types       | 11.3.1      | Type definitions for custom pallet         |
| **Polkadot Keyring** | @polkadot/keyring     | 12.6.x      | Account/wallet management                  |
| **Form Validation**  | Yup OR Zod            | Latest      | Validate credential input forms            |
| **React Router**     | react-router-dom      | 6.x         | Navigation (dashboard, mint, export pages) |

**Data Storage**: On-chain Substrate storage maps (Credentials<T>, OwnerCredentials<T>)  
**Integrations**: Mock JSON for Web2 data (no real APIs in MVP)  
**State Management**: TanStack Query for server state + React Context for wallet state

### 7.2 Non-Functional Requirements

**Performance:**

- Page load time: <2 seconds (revised from 1.5s - more realistic for testnet)
- Query response: <1 second (revised from 500ms - account for RPC latency)
- Transaction cost: <0.01 DOT (target <0.005 DOT on Paseo)
- Dashboard rendering: Support up to 100 credentials without pagination

**Security:**

- Wallet-based authentication (non-custodial)
- Immutable NFTs (soulbound by default)
- No PII storage on-chain (only hashes/IPFS links if needed)
- Input validation and sanitization (XSS prevention)
- **CORS configuration** for local dev (Substrate node + React app on different ports)
- **Rate limiting** on RPC calls (max 10 queries/second to prevent overload)

**Scalability:**

- Polkadot parachains for horizontal scaling (post-MVP)
- Lazy loading for credentials (load 20 at a time, infinite scroll)
- SCALE codec optimization for on-chain storage
- TanStack Query caching to reduce redundant RPC calls (5-minute cache)
- **Local storage fallback** for offline portfolio viewing

**Usability:**

- Mobile-responsive (breakpoints: 320px, 768px, 1024px)
- **WCAG 2.1 AA accessibility** (high-contrast mode, keyboard navigation)
- Browser support: Chrome 90+, Firefox 88+, Safari 14+ (desktop)
- **Error messages** in plain language (not technical jargon)
- **Loading states** for all async operations (spinners, skeleton screens)

**Reliability:**

- **Fallback to local Substrate node** if Paseo testnet is down
- **Transaction retry logic** (3 attempts with exponential backoff)
- **Wallet connection recovery** (auto-reconnect on page refresh)
- **Data persistence** (TanStack Query cache survives page reloads)

**Dependencies:**

- **Backend**: Rust 1.70+, Cargo, Substrate CLI (cargo install --git https://github.com/paritytech/polkadot-sdk)
- **Frontend**: Node.js 18+ (LTS), npm 9+, React 18.2, @polkadot/api 11.3+, @tanstack/react-query 5.51+, @mui/material 5.16+, qrcode.react 3.1+
- **Development**: Docker (optional, for containerized Substrate node), Git, VS Code with Rust Analyzer

## 8. Design and UX Guidelines

## 7. Technical Requirements

### 7.1 System Architecture

- **Backend**: Polkadot SDK (Substrate in Rust) for custom NFT pallet and trust score logic.
- **Frontend**: React.js with Polkadot.js API for wallet integration and queries.
- **Deployment**: Paseo testnet (Polkadot’s test network); local node for dev.
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
- **Compatibility**: Chrome/Firefox, Polkadot.js extension (primary wallet).
- **Dependencies**:
  - Rust/Cargo (backend).
  - Node.js 18+, React 18.2, @polkadot/api 11.3+, @polkadot/extension-dapp 0.47+, @tanstack/react-query 5.51+, @polkadot/types 11.3+, @polkadot/keyring 12.6+, @mui/material 5.16+, qrcode.react 3.1+, yup 1.4+ (frontend).

## 8. Design and UX Guidelines

- **Style Guide**: Clean, modern UI (Material UI-inspired); blue/green palette (#0078D4, #00CC6A) for trust/tech vibe.
- **Wireframes** (Conceptual):
  - **Login Page**: Wallet connect button, minimal branding.
  - **Dashboard**: Timeline of NFT cards (skill/review/payment), trust score badge, export button.
  - **Mint Page**: Form (name, description), submit extrinsic.
- **User Flow**:
  1. Connect wallet → Sign in.
  2. Mint/upload credential → Save as NFT.
  3. View dashboard → Export/share.
  4. Share link/QR with recruiter.
- **Accessibility**: Clear fonts (e.g., Roboto), high contrast, screen-reader support.

**⚠️ WCAG 2.1 AA Accessibility (Time-Permitting on Day 6):**

If time permits on Day 6, implement basic accessibility features:

1. **Keyboard Navigation**:

   - All interactive elements accessible via Tab key
   - Visible focus indicators (outline: 2px solid #0078D4)
   - Logical tab order (top to bottom, left to right)

2. **ARIA Labels**:

   ```jsx
   <button aria-label="Connect Polkadot.js wallet">Connect Wallet</button>
   <div role="status" aria-live="polite">{statusMessage}</div>
   ```

3. **Color Contrast**:

   - Text: Minimum 4.5:1 contrast ratio (use WebAIM Contrast Checker)
   - Buttons: 3:1 for large text

4. **Alt Text**: All images/icons have descriptive alt attributes

**If Time Constraints**: Remove WCAG claim from README, document as "future enhancement".

## 9. Development and Testing Plan

### 9.1 Timeline (⚠️ CRITICAL: 7 Days Remaining, Nov 10-17, 2025)

**EMERGENCY SPRINT PLAN - DAILY BREAKDOWN:**

| **Day**   | **Date**  | **Focus Area**                      | **Tasks**                                                                                                                                                               | **Deliverables**                                                              | **Owner**          | **Status** |
| --------- | --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------ | ---------- |
| **Day 1** | Nov 10    | **Setup & Substrate Foundation**    | - Init Substrate node from template<br>- Create basic pallet skeleton<br>- Setup React 18 app with Vite<br>- Install all dependencies<br>- Test Paseo RPC connection    | - Running local node<br>- React app scaffold<br>- Dependency verification     | Backend + Frontend | 🔴 URGENT  |
| **Day 2** | Nov 11    | **Backend: NFT Pallet Core**        | - Implement storage maps (Credentials, OwnerCredentials)<br>- Write mint_credential() extrinsic<br>- Add basic error handling<br>- Cargo unit tests (>70% coverage)     | - Functional minting extrinsic<br>- Storage working<br>- Tests passing        | Backend            | 🔴 URGENT  |
| **Day 3** | Nov 12    | **Backend Deploy + Frontend Start** | - Deploy pallet to Paseo testnet<br>- Start wallet integration (@polkadot/extension-dapp)<br>- Create dashboard component skeleton<br>- Setup TanStack Query            | - Paseo deployment live<br>- Wallet connects<br>- Basic UI layout             | Backend + Frontend | 🔴 URGENT  |
| **Day 4** | Nov 13    | **Frontend: Dashboard + Mint UI**   | - Build credential timeline component<br>- Create mint form with validation<br>- Integrate @polkadot/api queries<br>- Add loading states and error messages             | - Working dashboard<br>- Minting from UI<br>- Credentials display             | Frontend           | 🔴 URGENT  |
| **Day 5** | Nov 14    | **Trust Score + Mock Data**         | - Implement client-side trust score algorithm<br>- Build JSON import feature<br>- Create sample mock data files<br>- Add trust score visualization                      | - Trust score calculating<br>- Mock import working<br>- Score widget rendered | Frontend           | 🔴 URGENT  |
| **Day 6** | Nov 15    | **Export, Sharing, Polish**         | - Build JSON export functionality<br>- Add QR code generation for portfolio links<br>- Responsive design fixes<br>- Accessibility improvements<br>- Bug fixes           | - JSON export working<br>- QR codes generate<br>- Mobile responsive           | Frontend           | 🟡 HIGH    |
| **Day 7** | Nov 16-17 | **Testing, Video, Submission**      | - E2E testing (mint → view → export → share)<br>- Record 3-min demo video<br>- Write README + documentation<br>- Code cleanup<br>- **SUBMIT by Nov 17, 11:59 PM GMT+5** | - Demo video uploaded<br>- GitHub repo public<br>- Devpost submitted          | Full Team          | 🔴 URGENT  |

**DAILY STANDUP SCHEDULE:**

- **9:00 AM GMT+5**: Quick sync (15 min max) - blockers, day's goals
- **9:00 PM GMT+5**: EOD check-in (10 min) - progress, tomorrow prep

**CRITICAL PATH ITEMS (Cannot Slip):**

1. ✅ Day 1-2: Substrate pallet working (mint + storage)
2. ✅ Day 3: Paseo deployment successful
3. ✅ Day 4: Wallet → Mint → Dashboard flow complete
4. ✅ Day 5: Trust score + mock data working
5. ✅ Day 7: Video recorded + Devpost submitted

**FALLBACK PLAN (If Paseo Fails):**

- Use local Substrate node for demo
- Clearly state "Testnet deployment" in video
- Provide instructions for judges to run locally

### 9.2 Testing Strategy

**Unit Testing (Backend - Cargo):**

```rust
// pallets/freelance-credentials/src/tests.rs
#[test]
fn test_mint_credential_success() {
    new_test_ext().execute_with(|| {
        let metadata = vec![1, 2, 3];
        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(1),
            metadata.clone()
        ));
        // Verify credential exists
        assert!(Credentials::<Test>::contains_key(&hash(&metadata)));
    });
}

#[test]
fn test_mint_credential_duplicate_fails() {
    new_test_ext().execute_with(|| {
        let metadata = vec![1, 2, 3];
        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(1),
            metadata.clone()
        ));
        // Try to mint again - should fail
        assert_noop!(
            FreelanceCredentials::mint_credential(RuntimeOrigin::signed(1), metadata),
            Error::<Test>::CredentialAlreadyExists
        );
    });
}

#[test]
fn test_mint_credential_metadata_too_large() {
    new_test_ext().execute_with(|| {
        let metadata = vec![0u8; 5000]; // 5KB, exceeds 4KB limit
        assert_noop!(
            FreelanceCredentials::mint_credential(RuntimeOrigin::signed(1), metadata),
            Error::<Test>::MetadataTooLarge
        );
    });
}

#[test]
fn test_mint_credential_max_boundary() {
    new_test_ext().execute_with(|| {
        let metadata = vec![0u8; 4096]; // Exactly 4KB - should pass
        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(1),
            metadata
        ));
    });
}

#[test]
fn test_mint_500th_credential() {
    new_test_ext().execute_with(|| {
        // Mint 499 credentials
        for i in 0..499 {
            let metadata = format!("credential_{}", i).into_bytes();
            assert_ok!(FreelanceCredentials::mint_credential(
                RuntimeOrigin::signed(1),
                metadata
            ));
        }

        // 500th should succeed (boundary test)
        let metadata = b"credential_500".to_vec();
        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(1),
            metadata
        ));

        // 501st should fail
        let metadata = b"credential_501".to_vec();
        assert_noop!(
            FreelanceCredentials::mint_credential(RuntimeOrigin::signed(1), metadata),
            Error::<Test>::TooManyCredentials
        );
    });
}

#[test]
fn test_concurrent_minting() {
    new_test_ext().execute_with(|| {
        // Two users minting different credentials simultaneously
        let metadata1 = b"user1_credential".to_vec();
        let metadata2 = b"user2_credential".to_vec();

        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(1),
            metadata1
        ));
        assert_ok!(FreelanceCredentials::mint_credential(
            RuntimeOrigin::signed(2),
            metadata2
        ));

        // Verify both exist
        assert_eq!(OwnerCredentials::<Test>::get(1).len(), 1);
        assert_eq!(OwnerCredentials::<Test>::get(2).len(), 1);
    });
}
```

- **Coverage Target**: 80%+ for pallet functions (use `cargo tarpaulin` for coverage reports)
- **Run Tests**: `cargo test -p pallet-freelance-credentials`

**Integration Testing (Frontend + Backend):**

- **End-to-End Flow Tests**:

  1. ✅ Wallet connection flow (Polkadot.js extension detection → account selection → connection)
  2. ✅ Mint credential flow (form validation → transaction signing → success confirmation)
  3. ✅ Query credentials flow (fetch from chain → display in dashboard → cache validation)
  4. ✅ Export flow (JSON generation → download trigger → file validation)
  5. ✅ Share flow (QR code generation → link creation → clipboard copy)

- **Cross-Browser Testing**: Chrome 90+, Firefox 88+, Safari 14+ (macOS only)
- **Verification Tool**: Use Polkadot.js Apps UI to independently verify on-chain data
- **Automated Testing**: Mock wallet responses using `@polkadot/extension-mocks` (if available)

**Security Testing:**

- **Input Validation Tests**:
  - XSS attempts: `<script>alert('xss')</script>` in credential name/description
  - JSON injection: Malformed JSON in mock data upload
  - SQL injection patterns: `'; DROP TABLE--` (not applicable but test sanitization)
  - Oversized inputs: 10MB JSON file upload (should reject >5MB)
- **Transaction Security**:
  - Replay attack test: Submit same signed transaction twice (should fail with nonce error)
  - Unauthorized minting: Attempt to mint credential for different wallet address
  - Front-running: Simulate concurrent minting of same credential (one should fail)
- **Wallet Security**:
  - ✅ Verify no private keys logged in console
  - ✅ Verify no private keys in localStorage/sessionStorage
  - ✅ Verify transaction details shown before signing
  - ✅ Test wallet disconnection clears sensitive state

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
├── substrate-node/
│   ├── pallets/
│   │   └── freelance-credentials/
│   ├── runtime/
│   └── Cargo.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── README.md
├── docs/
│   ├── PRD.md (this document)
│   ├── ARCHITECTURE.md
│   └── USER_GUIDE.md
├── demo/
│   ├── screenshots/
│   └── demo-script.md
├── README.md (main)
├── LICENSE (MIT)
└── .github/
    └── workflows/ci.yml
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

## 11. Risks and Mitigations (UPDATED FOR 7-DAY SPRINT)

| **Risk**                               | **Impact**              | **Probability** | **Mitigation Strategy**                                                                                                     | **Contingency Plan**                                                                       |
| -------------------------------------- | ----------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **⚠️ CRITICAL: Only 7 days remaining** | **VERY HIGH**           | **CERTAIN**     | - **IMMEDIATE**: Descope XCM, PDF export<br>- Focus ONLY on P0 features<br>- Work in parallel (backend + frontend teams)    | Submit minimal but functional MVP<br>Document future features in README                    |
| **Substrate pallet bugs**              | High (blocker)          | Medium          | - Use simplified pallet design (JSON storage)<br>- Copy from substrate-node-template<br>- Test locally before Paseo deploy  | Use pre-built `pallet-uniques` as fallback<br>Store metadata off-chain (IPFS) if desperate |
| **Paseo testnet instability**          | Medium (demo affected)  | Medium          | - **Day 1**: Test Paseo connection immediately<br>- Keep local node running 24/7<br>- Record demo early (Day 6)             | Demo with local node, mention Paseo in video<br>Judges can verify code quality             |
| **Frontend-backend integration lag**   | High (delays)           | High            | - Define API contract Day 1 (JSON structure)<br>- Frontend mocks backend until Day 3<br>- Daily integration tests           | Use hardcoded mock data for demo if integration fails<br>Show backend separately           |
| **Wallet extension issues**            | Medium (UX friction)    | Medium          | - Test Polkadot.js extension immediately<br>- Provide clear installation guide<br>- Support ONLY Polkadot.js (not Talisman) | Include pre-funded test account in demo<br>Screencast of wallet setup                      |
| **Team member unavailability**         | High (capacity loss)    | Low             | - Cross-train on both backend/frontend<br>- Daily code commits<br>- Document setup in README                                | Solo developer can finish core features<br>Reduce scope further if needed                  |
| **TanStack Query caching bugs**        | Low (data stale)        | Low             | - Use aggressive refetch (30s stale time)<br>- Manual invalidation after mutations<br>- Test in incognito mode              | Fall back to manual `useEffect` + `useState`<br>Simpler but functional                     |
| **Security vulnerabilities**           | Medium (reputation)     | Medium          | - Input validation (Yup/Zod)<br>- Sanitize JSON before minting<br>- Disclaimer: "Testnet prototype"                         | Acknowledge in README<br>Plan security audit post-hackathon                                |
| **Demo video quality low**             | Medium (judging impact) | Low             | - Use OBS Studio + good mic<br>- Write script beforehand<br>- Record 2-3 takes, pick best                                   | Use Loom as fallback (simpler)<br>Add captions manually if needed                          |

## 12. Competitive Analysis

| **Solution**         | **Blockchain**    | **Key Features**                                                            | **Strengths**                                                     | **Weaknesses**                                                                                | **FreelanceForge Advantage**                                                                                         |
| -------------------- | ----------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Braintrust**       | Ethereum          | - Gig matching marketplace<br>- BTRST token for governance<br>- Talent pool | - Established user base (500K+ users)<br>- Real Web2 integrations | - High gas fees ($2-5 per transaction)<br>- No portable NFT portfolio<br>- Ethereum-locked    | - Sub-penny transactions on Polkadot<br>- True cross-chain portability via XCM<br>- User-owned NFT credentials       |
| **Superteam**        | Solana            | - NFT badges for Web3 contributions<br>- Bounty platform                    | - Fast transactions<br>- Growing Solana ecosystem                 | - Solana-only (no cross-chain)<br>- Limited to crypto-native work<br>- No trust scoring       | - Polkadot XCM enables broader interoperability<br>- Aggregates Web2 + Web3 credentials<br>- Algorithmic trust score |
| **Gitcoin Passport** | Ethereum, Polygon | - Decentralized identity<br>- Sybil resistance stamps<br>- 20+ integrations | - Strong Web3 adoption<br>- Diverse credential types              | - Not freelancer-focused<br>- Generic scoring (no gig specialization)<br>- High Ethereum fees | - Tailored to gig economy (reviews, payments)<br>- Freelance-specific trust algorithm<br>- Lower costs on Polkadot   |
| **LinkedIn + Web3**  | N/A               | - Traditional professional network<br>- Endorsements/recommendations        | - 900M+ users<br>- Industry standard                              | - Centralized (Microsoft-owned)<br>- No blockchain verification<br>- Siloed data              | - Decentralized, user-owned<br>- Tamper-proof on-chain credentials<br>- Exportable across platforms                  |
| **Upwork Profiles**  | N/A (Web2)        | - Reviews, skills, earnings<br>- Talent matching                            | - Largest gig platform<br>- Built-in payment system               | - Platform lock-in<br>- 20% commission fees<br>- No portability                               | - Zero platform lock-in<br>- Portable across all platforms<br>- User controls data                                   |

**Unique Value Propositions:**

1. **Polkadot's Low Fees**: ~$0.01 vs. $2-5 on Ethereum → accessible to global freelancers (including unbanked)
2. **XCM Interoperability**: Only solution enabling true cross-chain credential sharing (Polkadot ↔ Astar ↔ Moonbeam ↔ future bridges)
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
  - **Mitigation**: Test early on Paseo; leverage Oct 21–24 workshops (YouTube).

## 12. Competitive Analysis

- **Braintrust (Ethereum)**: Gig matching, no unified NFT portfolio. FreelanceForge adds cross-platform portability.
- **Superteam (Solana)**: NFT badges, but Solana-locked. Polkadot’s XCM enables broader interoperability.
- **Gitcoin Passport (Ethereum/Polygon)**: General credentials, not freelancer-focused. FreelanceForge tailors to gig economy with trust score.
- **Unique Edge**: Polkadot’s low fees (~0.01 DOT vs. $2+ ETH), Substrate customization, XCM portability.

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
- **React 18 Documentation**: [react.dev](https://react.dev) - Official React documentation (18.2 stable)
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
