# psvm (Polkadot SDK Version Manager) Quick Reference

## Overview

psvm is the recommended tool for managing Polkadot SDK dependencies in Substrate projects. It ensures all crates are synchronized to compatible versions from a specific Polkadot SDK release.

## Installation

### Prerequisites

```bash
# Ubuntu/Debian
sudo apt-get install -y pkg-config libssl-dev

# Fedora/RHEL
sudo yum install -y pkg-config openssl-devel

# macOS
brew install pkg-config openssl
```

### Install psvm

```bash
cargo install psvm
```

## Basic Usage

### List Available Versions

```bash
# List all available Polkadot SDK versions
psvm -l
psvm --list

# Example output:
# Available Polkadot SDK versions:
# - 1.7.0 (latest)
# - 1.6.0
# - 1.5.0
# ...
```

### Update Dependencies

```bash
# Update to a specific version
psvm -v "1.7.0"
psvm --version "1.7.0"

# Update to latest version
psvm -v latest
```

### Check Compatibility

```bash
# Check compatibility without making changes
psvm -v "1.7.0" -c
psvm --version "1.7.0" --check

# This will show what would change without modifying files
```

## How It Works

1. **Fetches Plan.toml**: psvm retrieves the `Plan.toml` file from the Polkadot SDK release branch
2. **Generates Mapping**: Creates a mapping of all crates to their correct versions for that release
3. **Updates Dependencies**: Updates `Cargo.toml` files throughout the project to use compatible versions
4. **Ensures Consistency**: All Polkadot SDK crates are updated to the same release version

## Common Workflows

### Initial Project Setup

```bash
# Clone your project
git clone <your-substrate-project>
cd <your-substrate-project>

# Update to desired Polkadot SDK version
psvm -v "1.7.0"

# Build the project
cargo build --release
```

### Upgrading Polkadot SDK Version

```bash
# Check current version and what would change
psvm -v "1.8.0" -c

# If checks pass, update
psvm -v "1.8.0"

# Test the build
cargo check

# Build and run tests
cargo build --release
cargo test
```

### Working with Multiple Projects

```bash
# Update each project to the same version
cd project1 && psvm -v "1.7.0"
cd ../project2 && psvm -v "1.7.0"
cd ../project3 && psvm -v "1.7.0"
```

## Project Structure Requirements

psvm works best with projects that have:

- A root `Cargo.toml` with workspace definition
- Polkadot SDK dependencies (e.g., `frame-support`, `sp-runtime`, etc.)
- Standard Substrate project structure

Example structure:

```
project/
├── Cargo.toml          # Workspace definition
├── node/
│   └── Cargo.toml
├── pallets/
│   └── my-pallet/
│       └── Cargo.toml
└── runtime/
    └── Cargo.toml
```

## Advantages

### ✅ Automatic Synchronization

No need to manually update dozens of dependency versions

### ✅ Version Compatibility

Ensures all crates are from the same Polkadot SDK release

### ✅ Time Saving

Updates all dependencies with a single command

### ✅ Error Prevention

Reduces version conflicts and compatibility issues

### ✅ Workspace Support

Works seamlessly with Cargo workspaces

## Comparison with Manual Updates

### Manual Approach (❌ Not Recommended)

```toml
# Cargo.toml - Manually updating each dependency
[dependencies]
frame-support = "28.0.0"  # Is this compatible?
frame-system = "28.0.0"   # Are these versions right?
pallet-balances = "28.0.0"  # Which version should I use?
sp-runtime = "31.0.0"     # Different major version?
# ... and 50+ more dependencies
```

### With psvm (✅ Recommended)

```bash
# Just run one command
psvm -v "1.7.0"

# All dependencies updated to compatible versions automatically
```

## Version Format

Polkadot SDK uses semantic versioning:

- `1.7.0` - Stable release
- `1.7.1` - Patch release
- `1.8.0` - Minor release with new features

Always use the full version number:

```bash
# Correct
psvm -v "1.7.0"

# Also correct (if supported)
psvm -v latest
```

## Troubleshooting

### Issue: psvm command not found

```bash
# Solution: Ensure cargo bin is in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
```

### Issue: OpenSSL linking errors

```bash
# Solution: Install development libraries
# Ubuntu/Debian
sudo apt-get install -y pkg-config libssl-dev

# Fedora/RHEL
sudo yum install -y pkg-config openssl-devel
```

### Issue: Permission denied

```bash
# Solution: Install as user (not root)
cargo install psvm
# Don't use sudo with cargo install
```

### Issue: Dependencies already up to date

```bash
# This is normal if already on correct version
psvm -v "1.7.0"
# Output: Dependencies in Cargo.toml are already up to date
```

## Best Practices

### 1. Check Before Updating

```bash
# Always check first
psvm -v "1.8.0" -c

# Review changes, then update
psvm -v "1.8.0"
```

### 2. Test After Updates

```bash
# After updating with psvm
cargo check              # Quick syntax check
cargo build --release    # Full build
cargo test              # Run tests
```

### 3. Version Control

```bash
# Commit psvm updates separately
psvm -v "1.7.0"
git add Cargo.toml */Cargo.toml Cargo.lock
git commit -m "chore: update to Polkadot SDK 1.7.0"
```

### 4. Document Version

```bash
# Keep track in README or docs
echo "Polkadot SDK Version: 1.7.0" >> docs/versions.md
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install psvm
        run: cargo install psvm

      - name: Verify Polkadot SDK version
        run: psvm -v "1.7.0" -c

      - name: Build
        run: cargo build --release

      - name: Test
        run: cargo test
```

## Additional Resources

- [psvm GitHub Repository](https://github.com/paritytech/psvm)
- [Polkadot SDK Documentation](https://docs.substrate.io/)
- [Cargo Workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)
- [Substrate Node Template](https://github.com/substrate-developer-hub/substrate-node-template)

## Getting Help

If you encounter issues with psvm:

1. Check the [psvm GitHub Issues](https://github.com/paritytech/psvm/issues)
2. Review Polkadot SDK release notes
3. Verify your Rust toolchain is up to date
4. Check the Substrate Developer Hub

## Summary

psvm is an essential tool for Substrate development that:

- Simplifies dependency management
- Ensures version compatibility
- Saves development time
- Reduces configuration errors

**Always use psvm when updating Polkadot SDK dependencies!**
