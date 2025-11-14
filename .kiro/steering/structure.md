# FreelanceForge Project Structure

## Repository Organization

FreelanceForge follows a monorepo structure with clear separation between blockchain backend, frontend application, and supporting documentation.

```
freelanceforge/
├── substrate-node/          # Substrate blockchain node
├── frontend/               # React.js frontend application
├── docs/                  # Project documentation
├── .kiro/                 # Kiro AI assistant configuration
├── docker-compose.yml     # Development environment
└── package.json          # Root project scripts
```

## Substrate Node Structure

```
substrate-node/
├── node/                  # Node implementation
│   ├── src/
│   │   ├── main.rs       # Entry point
│   │   ├── service.rs    # Node service configuration
│   │   ├── rpc.rs        # RPC endpoint definitions
│   │   ├── cli.rs        # Command-line interface
│   │   ├── command.rs    # Command handling
│   │   └── chain_spec.rs # Chain specification
│   └── Cargo.toml        # Node dependencies
├── runtime/               # Runtime logic
│   ├── src/
│   │   └── lib.rs        # Runtime configuration and pallet integration
│   └── Cargo.toml        # Runtime dependencies
├── pallets/               # Custom pallets
│   ├── freelance-credentials/  # Core credential NFT pallet
│   │   ├── src/
│   │   │   └── lib.rs    # Pallet implementation with comprehensive tests
│   │   └── Cargo.toml    # Pallet dependencies
│   └── template/         # Template pallet (unused)
├── Cargo.toml            # Workspace configuration
├── Dockerfile            # Container configuration
└── dev_chain_spec.json   # Development chain specification
```

## Frontend Application Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-based page components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions and API wrappers
│   ├── types/           # TypeScript type definitions
│   ├── contexts/        # React context providers
│   ├── assets/          # Static assets (images, icons)
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static public assets
├── package.json         # Frontend dependencies and scripts
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── Dockerfile           # Container configuration
└── .env.example         # Environment variable template
```

## Documentation Structure

```
docs/
├── SETUP_GUIDE.md       # Comprehensive setup instructions
├── PSVM_GUIDE.md        # Polkadot SDK Version Manager guide
├── development-setup.md # Additional development resources
├── TASK_1_COMPLETION.md # Implementation progress tracking
└── README.md            # Documentation index
```

## Kiro Configuration Structure

```
.kiro/
├── steering/            # AI assistant guidance documents
│   ├── product.md       # Product overview and goals
│   ├── tech.md          # Technical stack and commands
│   └── structure.md     # Project organization (this file)
└── specs/               # Feature specifications
    └── freelanceforge/
        ├── requirements.md  # Detailed requirements
        └── tasks.md        # Implementation task breakdown
```

## Key File Conventions

### Naming Patterns

- **Rust files**: `snake_case.rs` (e.g., `chain_spec.rs`, `lib.rs`)
- **TypeScript files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Configuration files**: `kebab-case` (e.g., `docker-compose.yml`, `vite.config.ts`)
- **Documentation**: `UPPER_CASE.md` for guides, `lowercase.md` for specs

### Import Organization

- **Substrate pallets**: Use `frame::prelude::*` for common imports
- **React components**: Organize imports by: React, third-party, local components, utilities
- **API utilities**: Group Polkadot.js imports and separate from React imports

### Code Organization Principles

#### Substrate Pallet Structure

- **Storage**: Define storage maps with appropriate bounds and types
- **Events**: Use descriptive event names with relevant data fields
- **Errors**: Provide clear error types with user-friendly messages
- **Extrinsics**: Include comprehensive weight calculations and validation
- **Tests**: Achieve >80% coverage with boundary condition testing

#### React Component Structure

- **Single Responsibility**: Each component handles one specific UI concern
- **Custom Hooks**: Extract complex logic into reusable hooks
- **Type Safety**: Use TypeScript interfaces for all props and state
- **Error Boundaries**: Wrap components with error handling
- **Performance**: Use React.memo and useMemo for expensive operations

#### API Layer Organization

- **Separation of Concerns**: Separate blockchain queries from UI state
- **Error Handling**: Consistent error types and user-friendly messages
- **Caching Strategy**: Use TanStack Query for server state management
- **Type Generation**: Generate types from Substrate metadata

## Environment Configuration

### Development Environment

- **Local Substrate**: `ws://localhost:9944`
- **Frontend Dev Server**: `http://localhost:3000`
- **Docker Compose**: Orchestrates both services

### Production Environment

- **Paseo Testnet**: `wss://paseo.dotters.network`
- **Frontend Build**: Static files served via nginx
- **Environment Variables**: Configured via `.env` files

## Build Artifacts

### Substrate Node

- **Target Directory**: `substrate-node/target/`
- **Release Binary**: `target/release/minimal-template-node`
- **Development Binary**: `target/debug/minimal-template-node`

### Frontend Application

- **Build Directory**: `frontend/dist/`
- **Static Assets**: Optimized and bundled by Vite
- **Source Maps**: Generated for debugging

## Testing Structure

### Substrate Tests

- **Unit Tests**: Embedded in pallet `lib.rs` files using `#[cfg(test)]`
- **Integration Tests**: Test complete runtime functionality
- **Mock Runtime**: Configured for isolated pallet testing

### Frontend Tests

- **Component Tests**: Using React Testing Library
- **Hook Tests**: Testing custom React hooks in isolation
- **Integration Tests**: End-to-end user workflows
- **API Tests**: Mock Polkadot.js API interactions

## Deployment Structure

### Docker Configuration

- **Multi-stage builds**: Optimize image sizes
- **Development**: Hot reload and debugging enabled
- **Production**: Optimized builds with security hardening

### CI/CD Pipeline (Future)

- **Build**: Compile Substrate node and frontend
- **Test**: Run comprehensive test suites
- **Deploy**: Automated deployment to testnet/mainnet
