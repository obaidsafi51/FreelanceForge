#!/bin/bash

# Quick test to verify Substrate node arguments are correct

echo "🧪 Testing Substrate node arguments..."

cd substrate-node

# Test if the binary exists
if [ ! -f "target/release/minimal-template-node" ]; then
    echo "❌ Substrate node binary not found. Run: cargo build --release -p minimal-template-node"
    exit 1
fi

# Test the help command
echo "✅ Testing --help command..."
if ./target/release/minimal-template-node --help >/dev/null 2>&1; then
    echo "✅ Help command works"
else
    echo "❌ Help command failed"
    exit 1
fi

# Test the version command
echo "✅ Testing --version command..."
if ./target/release/minimal-template-node --version >/dev/null 2>&1; then
    echo "✅ Version command works"
    VERSION=$(./target/release/minimal-template-node --version)
    echo "   Version: $VERSION"
else
    echo "❌ Version command failed"
    exit 1
fi

# Test the dev arguments (dry run)
echo "✅ Testing --dev --rpc-external arguments..."
if timeout 5 ./target/release/minimal-template-node --dev --rpc-external --help >/dev/null 2>&1; then
    echo "✅ Arguments are valid"
else
    echo "❌ Arguments are invalid"
    exit 1
fi

echo ""
echo "🎉 All tests passed! The Substrate node is ready to run."
echo ""
echo "To start the node:"
echo "  cd substrate-node"
echo "  cargo run --release -p minimal-template-node -- --dev --rpc-external"
echo ""
echo "Or use the setup script:"
echo "  ./setup-and-run.sh run"