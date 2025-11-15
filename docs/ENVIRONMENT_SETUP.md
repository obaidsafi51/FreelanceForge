# FreelanceForge Environment Setup Guide

This guide provides detailed instructions for setting up FreelanceForge in different environments: development, staging, and production.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Development Environment](#development-environment)
3. [Staging Environment](#staging-environment)
4. [Production Environment](#production-environment)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Network Configuration](#network-configuration)
7. [Troubleshooting](#troubleshooting)

## Environment Overview

FreelanceForge supports three distinct environments:

| Environment     | Purpose                       | Network              | Deployment             |
| --------------- | ----------------------------- | -------------------- | ---------------------- |
| **Development** | Local development and testing | Local Substrate node | Docker Compose         |
| **Staging**     | Pre-production testing        | Paseo testnet        | Docker Compose         |
| **Production**  | Live application              | Paseo testnet        | Docker Compose / Cloud |

## Development Environment

### Prerequisites

- Docker Desktop 4.0+ with Docker Compose v2
- Node.js 18+ (for local development)
- Git
- 8GB RAM minimum
- 20GB free disk space

### Quick Start

```bash
# Clone repository
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge

# Install dependencies
npm run setup

# Start development environment
npm run dev
```

### Detailed Setup

#### 1. Install Dependencies

```bash
# Install frontend dependencies
npm run install:frontend

# Build Substrate node (first time only)
npm run build:substrate
```

#### 2. Configure Environment

```bash
# Copy development environment template
cp frontend/.env.example frontend/.env.local

# Edit development configuration
nano frontend/.env.local
```

**Development Configuration:**

```bash
# Local development settings
VITE_WS_PROVIDER=ws://localhost:9944
VITE_NETWORK=local
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Enable all features for development
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_SHARING=true
```

#### 3. Start Services

```bash
# Start all services with Docker Compose
docker-compose up --build

# Or start services individually:
# Terminal 1: Start Substrate node
npm run dev:substrate

# Terminal 2: Start frontend
npm run dev:frontend
```

#### 4. Verify Setup

```bash
# Check Substrate node
curl -H "Content-Type: application/json" \
     -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
     http://localhost:9933

# Check frontend
curl http://localhost:3000/health

# Check WebSocket connection
wscat -c ws://localhost:9944
```

### Development Tools

#### Hot Reload

- **Frontend**: Vite provides instant hot reload
- **Substrate**: Requires restart for pallet changes

#### Testing

```bash
# Run all tests
npm run test

# Run frontend tests only
npm run test:frontend

# Run Substrate tests only
npm run test:substrate

# Watch mode for frontend tests
cd frontend && npm run test:watch
```

#### Debugging

```bash
# View logs
docker-compose logs -f

# Debug specific service
docker-compose logs -f substrate-node
docker-compose logs -f frontend

# Access container shell
docker-compose exec substrate-node bash
docker-compose exec frontend sh
```

## Staging Environment

### Purpose

Staging environment mirrors production but uses Paseo testnet for safe testing of:

- Production builds
- Real blockchain transactions
- Performance testing
- Integration testing

### Setup

#### 1. Configure Staging Environment

```bash
# Create staging environment file
cp frontend/.env.example frontend/.env.staging

# Configure for Paseo testnet
nano frontend/.env.staging
```

**Staging Configuration:**

```bash
# Paseo testnet configuration
VITE_WS_PROVIDER=wss://paseo.dotters.network
VITE_NETWORK=paseo
VITE_DEBUG=false
VITE_LOG_LEVEL=info

# Staging-specific settings
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_SHARING=true

# Optional: Staging monitoring
VITE_ERROR_REPORTING_URL=https://staging-monitoring.example.com/errors
```

#### 2. Deploy to Staging

```bash
# Build staging version
NODE_ENV=staging npm run build:frontend

# Or use Docker Compose
docker-compose -f docker-compose.staging.yml up --build -d
```

#### 3. Staging Testing Checklist

- [ ] Wallet connection works with testnet
- [ ] Credential minting succeeds
- [ ] Dashboard loads credentials
- [ ] Trust score calculation works
- [ ] Export functionality works
- [ ] Portfolio sharing works
- [ ] Error handling works properly
- [ ] Performance meets requirements

### Staging Docker Compose

Create `docker-compose.staging.yml`:

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=staging
    env_file:
      - frontend/.env.staging
    restart: unless-stopped

  # Note: Staging uses Paseo testnet, no local Substrate node needed
```

## Production Environment

### Prerequisites

- Production server with Docker
- Domain name (optional)
- SSL certificate (recommended)
- Monitoring service account (optional)

### Setup Steps

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application user
sudo useradd -m -s /bin/bash freelanceforge
sudo usermod -aG docker freelanceforge
```

#### 2. Configure Production Environment

```bash
# Switch to application user
sudo su - freelanceforge

# Clone repository
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge

# Create production environment
cp frontend/.env.example frontend/.env.production
nano frontend/.env.production
```

**Production Configuration:**

```bash
# Production Paseo testnet settings
VITE_WS_PROVIDER=wss://paseo.dotters.network
VITE_NETWORK=paseo
VITE_DEBUG=false
VITE_LOG_LEVEL=error

# Security settings
VITE_ENABLE_ANALYTICS=false

# Performance settings
VITE_CACHE_STALE_TIME=60000
VITE_CACHE_TIME=300000

# Monitoring (optional)
VITE_ERROR_REPORTING_URL=https://your-sentry-dsn.ingest.sentry.io/api/errors
VITE_PERFORMANCE_REPORTING_URL=https://your-monitoring.com/api/performance
```

#### 3. Deploy Production

```bash
# Deploy production services
npm run deploy:production

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

#### 4. Configure Reverse Proxy (Optional)

If using a custom domain, configure nginx:

```nginx
# /etc/nginx/sites-available/freelanceforge
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:9944;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 5. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Environment Variables Reference

### Core Configuration

| Variable           | Development           | Staging                       | Production                    | Description        |
| ------------------ | --------------------- | ----------------------------- | ----------------------------- | ------------------ |
| `VITE_NETWORK`     | `local`               | `paseo`                       | `paseo`                       | Target network     |
| `VITE_WS_PROVIDER` | `ws://localhost:9944` | `wss://paseo.dotters.network` | `wss://paseo.dotters.network` | WebSocket endpoint |
| `VITE_DEBUG`       | `true`                | `false`                       | `false`                       | Debug mode         |
| `VITE_LOG_LEVEL`   | `debug`               | `info`                        | `error`                       | Logging level      |

### Feature Flags

| Variable                | Default | Description               |
| ----------------------- | ------- | ------------------------- |
| `VITE_ENABLE_MOCK_DATA` | `true`  | Enable mock data import   |
| `VITE_ENABLE_EXPORT`    | `true`  | Enable portfolio export   |
| `VITE_ENABLE_SHARING`   | `true`  | Enable portfolio sharing  |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics tracking |

### Performance Settings

| Variable                | Default  | Description                 |
| ----------------------- | -------- | --------------------------- |
| `VITE_CACHE_STALE_TIME` | `60000`  | Query cache stale time (ms) |
| `VITE_CACHE_TIME`       | `300000` | Query cache time (ms)       |

### Monitoring (Optional)

| Variable                         | Description                     |
| -------------------------------- | ------------------------------- |
| `VITE_ERROR_REPORTING_URL`       | Error reporting endpoint        |
| `VITE_PERFORMANCE_REPORTING_URL` | Performance monitoring endpoint |
| `VITE_SENTRY_DSN`                | Sentry DSN for error tracking   |

## Network Configuration

### Local Development Network

```bash
# Substrate node configuration
Chain: Development
WebSocket: ws://localhost:9944
HTTP RPC: http://localhost:9933
P2P: localhost:30333
```

### Paseo Testnet Network

```bash
# Primary endpoints
Primary: wss://paseo.dotters.network
Fallback 1: wss://rpc.ibp.network/paseo
Fallback 2: wss://paseo.rpc.amforc.com

# Explorer
Subscan: https://paseo.subscan.io
Polkadot.js: https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network
```

### Network Switching

The application automatically selects endpoints based on `VITE_NETWORK`:

```typescript
// Automatic endpoint selection
const endpoints =
  network === "local"
    ? ["ws://localhost:9944"]
    : [
        "wss://paseo.dotters.network",
        "wss://rpc.ibp.network/paseo",
        "wss://paseo.rpc.amforc.com",
      ];
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check file exists
ls -la frontend/.env.*

# Verify file format (no spaces around =)
cat frontend/.env.production | grep -v "^#" | grep "="

# Restart services after changes
docker-compose restart
```

#### 2. Network Connection Issues

```bash
# Test Paseo connectivity
curl -H "Content-Type: application/json" \
     -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain"}' \
     https://paseo.dotters.network

# Check WebSocket
wscat -c wss://paseo.dotters.network

# Verify firewall
sudo ufw status
```

#### 3. Build Issues

```bash
# Clear build cache
docker-compose down -v
docker system prune -f

# Rebuild from scratch
docker-compose build --no-cache
```

#### 4. Permission Issues

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER .
```

### Environment Validation

Use this script to validate your environment:

```bash
#!/bin/bash
# validate-environment.sh

echo "=== FreelanceForge Environment Validation ==="

# Check Docker
if command -v docker &> /dev/null; then
    echo "✓ Docker installed: $(docker --version)"
else
    echo "✗ Docker not found"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose installed: $(docker-compose --version)"
else
    echo "✗ Docker Compose not found"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js installed: $(node --version)"
else
    echo "✗ Node.js not found"
fi

# Check environment files
if [ -f "frontend/.env.local" ] || [ -f "frontend/.env.production" ]; then
    echo "✓ Environment files found"
else
    echo "✗ No environment files found"
fi

# Test network connectivity
if curl -s --max-time 5 https://paseo.dotters.network > /dev/null; then
    echo "✓ Paseo testnet accessible"
else
    echo "✗ Cannot reach Paseo testnet"
fi

echo "=== Validation Complete ==="
```

### Getting Help

1. **Check logs first**: `docker-compose logs -f`
2. **Review documentation**: All guides in `/docs` folder
3. **Search issues**: GitHub repository issues
4. **Community support**: Substrate Stack Exchange
5. **Create issue**: Provide logs and environment details

---

**Next Steps**: After environment setup, proceed to the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for production deployment instructions.
