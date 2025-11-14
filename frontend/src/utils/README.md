# FreelanceForge API Integration Layer

This directory contains the API integration layer for FreelanceForge, providing a type-safe interface between the React frontend and the Substrate blockchain backend.

## Architecture Overview

The API layer follows a singleton pattern with the `FreelanceForgeAPI` class managing connections, transactions, and queries. It includes:

- **Connection Management**: Automatic endpoint fallback and retry logic
- **Type Safety**: Generated TypeScript types from Substrate metadata
- **Error Handling**: Comprehensive error classification and user-friendly messages
- **Transaction Management**: Signing, submission, and status tracking
- **Caching Strategy**: Optimized for use with TanStack Query

## Core Components

### `api.ts`

Main API integration file containing:

- `FreelanceForgeAPI` class with connection management
- Transaction functions (`mintCredential`, `updateCredential`, `deleteCredential`)
- Query functions (`getCredentials`, `getCredentialById`)
- Error handling and retry logic
- Type definitions for credential metadata

### Generated Types (`../types/generated/`)

TypeScript definitions generated from Substrate metadata:

- Pallet call interfaces
- Event definitions
- Error types
- Storage query types

## Usage Examples

### Basic Connection

```typescript
import { connectToBlockchain, getNetworkInfo } from "./utils/api";

// Connect to blockchain
const api = await connectToBlockchain();

// Get network information
const networkInfo = await getNetworkInfo();
console.log(`Connected to ${networkInfo.chainName} at ${networkInfo.endpoint}`);
```

### Minting Credentials

```typescript
import { mintCredential, type CredentialMetadata } from "./utils/api";

const credentialData: CredentialMetadata = {
  credential_type: "skill",
  name: "JavaScript Development",
  description: "Expert in JavaScript and React",
  issuer: "Tech Company Inc.",
  rating: 5,
  timestamp: new Date().toISOString(),
  visibility: "public",
  proof_hash: "sha256_hash_of_supporting_document",
};

try {
  const result = await mintCredential(walletAddress, credentialData);
  console.log(`Credential minted: ${result.hash}`);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Minting failed: ${error.message}`);
  }
}
```

### Querying Credentials

```typescript
import { getCredentials, getCredentialById } from "./utils/api";

// Get all credentials for a user
const credentials = await getCredentials(walletAddress);

// Get specific credential
const credential = await getCredentialById("credential-id");
```

### Updating Credentials

```typescript
import { updateCredential } from "./utils/api";

// Update visibility
await updateCredential(walletAddress, credentialId, {
  visibility: "private",
});

// Add proof hash
await updateCredential(walletAddress, credentialId, {
  proof_hash: "new_document_hash",
});
```

## Error Handling

The API uses a comprehensive error classification system:

```typescript
enum ApiErrorType {
  CONNECTION_FAILED = "CONNECTION_FAILED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  CREDENTIAL_ALREADY_EXISTS = "CREDENTIAL_ALREADY_EXISTS",
  METADATA_TOO_LARGE = "METADATA_TOO_LARGE",
  TOO_MANY_CREDENTIALS = "TOO_MANY_CREDENTIALS",
  CREDENTIAL_NOT_FOUND = "CREDENTIAL_NOT_FOUND",
  NOT_CREDENTIAL_OWNER = "NOT_CREDENTIAL_OWNER",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}
```

### Error Recovery

- **Automatic Retry**: Exponential backoff for network errors
- **Endpoint Fallback**: Switches to backup RPC endpoints on connection failure
- **User-Friendly Messages**: Translates technical errors to actionable messages

## Network Configuration

### Environment Variables

The API supports both Vite and Create React App environment variable formats:

```bash
# Local Development
VITE_NETWORK=local
VITE_WS_PROVIDER=ws://localhost:9944

# Paseo Testnet
VITE_NETWORK=paseo
VITE_PASEO_RPC_1=wss://paseo.dotters.network
VITE_PASEO_RPC_2=wss://rpc.ibp.network/paseo
VITE_PASEO_RPC_3=wss://paseo.rpc.amforc.com
```

### Network Strategy

- **Single Network Targeting**: No dynamic switching to avoid state sync issues
- **Environment-Based**: Use environment variables to target specific networks
- **Fallback Endpoints**: Multiple RPC endpoints for reliability

## Type Generation

Generate TypeScript types from Substrate metadata:

```bash
npm run generate-types
```

This connects to the running Substrate node and generates type definitions in `src/types/generated/`.

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

Requires a running Substrate node:

```bash
RUN_INTEGRATION_TESTS=true npm run test
```

## Performance Considerations

### Connection Management

- **Singleton Pattern**: Single API instance shared across the application
- **Connection Pooling**: Reuses existing connections when possible
- **Timeout Handling**: 5-second connection timeout with fallback

### Transaction Optimization

- **Batch Operations**: Support for sequential credential minting
- **Gas Estimation**: Automatic fee calculation
- **Retry Logic**: Exponential backoff for failed transactions

### Query Optimization

- **Efficient Queries**: Minimizes RPC calls through batching
- **Caching Strategy**: Designed for TanStack Query integration
- **Pagination Support**: Ready for large credential sets

## Security Features

### Input Validation

- **Metadata Size**: 4KB limit enforcement
- **Schema Validation**: Required field checking
- **Type Safety**: Compile-time type checking

### Transaction Security

- **Signature Required**: All transactions require wallet signature
- **Preview Mode**: Display transaction details before signing
- **Error Isolation**: Prevents sensitive data leakage

### Privacy Controls

- **Visibility Settings**: Public/private credential filtering
- **Owner Verification**: Ensures only owners can modify credentials
- **Data Minimization**: Only necessary data stored on-chain

## Troubleshooting

### Common Issues

1. **Connection Failed**

   - Check if Substrate node is running
   - Verify RPC endpoint configuration
   - Check network connectivity

2. **Transaction Failed**

   - Ensure sufficient balance for fees
   - Verify wallet is connected
   - Check credential metadata size

3. **Type Errors**
   - Regenerate types: `npm run generate-types`
   - Check Substrate node version compatibility
   - Verify pallet is properly integrated

### Debug Mode

Enable debug logging:

```bash
VITE_DEBUG=true npm run dev
```

This provides detailed console output for connection attempts, transaction status, and error details.
