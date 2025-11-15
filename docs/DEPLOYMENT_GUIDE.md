# FreelanceForge Deployment Guide

This guide covers deploying FreelanceForge to production environments, specifically targeting the Paseo testnet for blockchain operations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Production Build](#production-build)
4. [Deployment Options](#deployment-options)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Docker**: Version 20.10+ with Docker Compose v2
- **Node.js**: Version 18+ (for local builds)
- **Rust**: Latest stable version with Cargo
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection for Paseo testnet access

### Required Accounts and Services

- **Paseo Testnet Account**: Funded account for testing transactions
- **Domain Name**: (Optional) For custom domain deployment
- **SSL Certificate**: (Optional) For HTTPS deployment
- **Monitoring Service**: (Optional) Sentry, LogRocket, or similar

## Environment Setup

### 1. Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge

# Install frontend dependencies
npm run install:frontend

# Build Substrate node
npm run build:substrate
```

### 2. Configure Environment Variables

Create production environment files:

```bash
# Copy and configure production environment
cp frontend/.env.example frontend/.env.production

# Edit production configuration
nano frontend/.env.production
```

**Key Production Variables:**

```bash
# Network Configuration
VITE_NETWORK=paseo
VITE_WS_PROVIDER=wss://paseo.dotters.network

# Security Settings
VITE_DEBUG=false
VITE_LOG_LEVEL=error

# Optional: Error Monitoring
VITE_ERROR_REPORTING_URL=https://your-monitoring-service.com/api/errors
VITE_PERFORMANCE_REPORTING_URL=https://your-monitoring-service.com/api/performance
```

### 3. Verify Paseo Testnet Connectivity

```bash
# Test connection to Paseo testnet
curl -H "Content-Type: application/json" \
     -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
     https://paseo.dotters.network
```

Expected response should include `"result": "Paseo Testnet"`

## Production Build

### Option 1: Docker Compose (Recommended)

```bash
# Build and deploy production containers
npm run deploy:production

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Manual Build

```bash
# Build optimized production assets
npm run build:production

# Verify build artifacts
ls -la frontend/dist/
ls -la substrate-node/target/release/
```

## Deployment Options

### 1. Self-Hosted Server Deployment

#### Using Docker Compose

```bash
# On your production server
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge

# Configure production environment
cp frontend/.env.example frontend/.env.production
# Edit .env.production with your settings

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml logs -f
```

#### Health Checks

```bash
# Check frontend health
curl http://your-server/health

# Check Substrate node health
curl http://your-server:9933/health

# Check WebSocket connection
wscat -c ws://your-server:9944
```

### 2. Cloud Platform Deployment

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Configure environment variables in Vercel dashboard
# Set VITE_NETWORK=paseo and other production variables
```

#### DigitalOcean Droplet

```bash
# Create droplet with Docker pre-installed
# SSH into droplet and run deployment commands

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 9944
ufw allow 9933
ufw enable
```

#### AWS EC2

```bash
# Launch EC2 instance (t3.medium or larger)
# Install Docker and Docker Compose
# Clone repository and deploy

# Configure security groups:
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - WebSocket (9944): 0.0.0.0/0
# - RPC (9933): 0.0.0.0/0
# - SSH (22): Your IP only
```

### 3. Kubernetes Deployment

Create Kubernetes manifests:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: freelanceforge-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: freelanceforge-frontend
  template:
    metadata:
      labels:
        app: freelanceforge-frontend
    spec:
      containers:
        - name: frontend
          image: freelanceforge/frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: VITE_NETWORK
              value: "paseo"
            - name: VITE_WS_PROVIDER
              value: "wss://paseo.dotters.network"
```

## Monitoring and Maintenance

### 1. Application Monitoring

#### Health Check Endpoints

- **Frontend**: `GET /health` → Returns "healthy"
- **Substrate**: `GET :9933/health` → Returns node status
- **WebSocket**: `WS :9944` → Connection test

#### Performance Metrics

Monitor these key metrics:

```bash
# Frontend Performance
- Page load time: <2 seconds
- API response time: <1 second
- Bundle size: <2MB total

# Substrate Node Performance
- Block time: ~6 seconds (Paseo)
- Memory usage: <2GB
- CPU usage: <50%
- Disk usage: Monitor growth
```

#### Log Monitoring

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f substrate-node

# Monitor error rates
grep "ERROR" logs/*.log | wc -l
```

### 2. Automated Monitoring Setup

#### Using Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: "3.8"
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: freelanceforge
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: SubstrateNodeDown
        expr: up{job="substrate-node"} == 0
        for: 1m
        annotations:
          summary: "Substrate node is down"
```

### 3. Backup and Recovery

#### Database Backup (Substrate Chain Data)

```bash
# Backup chain data
docker-compose -f docker-compose.prod.yml exec substrate-node \
  tar -czf /data/backup-$(date +%Y%m%d).tar.gz /data

# Copy backup to safe location
docker cp freelanceforge-substrate-prod:/data/backup-$(date +%Y%m%d).tar.gz ./backups/
```

#### Configuration Backup

```bash
# Backup configuration files
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  frontend/.env.production \
  docker-compose.prod.yml \
  nginx.conf
```

## Troubleshooting

### Common Issues

#### 1. Connection to Paseo Testnet Fails

```bash
# Check network connectivity
ping paseo.dotters.network

# Test WebSocket connection
wscat -c wss://paseo.dotters.network

# Check firewall rules
ufw status

# Verify DNS resolution
nslookup paseo.dotters.network
```

#### 2. Frontend Build Fails

```bash
# Clear node modules and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build:production

# Check for TypeScript errors
npm run lint
```

#### 3. Substrate Node Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs substrate-node

# Verify binary
docker-compose -f docker-compose.prod.yml exec substrate-node \
  /usr/local/bin/minimal-template-node --version

# Check disk space
df -h
```

#### 4. High Memory Usage

```bash
# Monitor container resources
docker stats

# Restart containers if needed
docker-compose -f docker-compose.prod.yml restart

# Check for memory leaks in logs
grep -i "memory\|oom" logs/*.log
```

### Performance Optimization

#### 1. Frontend Optimization

```bash
# Analyze bundle size
cd frontend
npm run build:analyze

# Enable compression in nginx
# (Already configured in nginx.conf)

# Optimize images
# Use WebP format for images
# Implement lazy loading
```

#### 2. Substrate Node Optimization

```bash
# Increase cache size
docker-compose -f docker-compose.prod.yml exec substrate-node \
  /usr/local/bin/minimal-template-node --help | grep cache

# Monitor block production
curl -H "Content-Type: application/json" \
     -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock", "params":[]}' \
     http://localhost:9933
```

### Security Considerations

#### 1. Network Security

```bash
# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9944/tcp  # WebSocket
ufw allow 9933/tcp  # RPC
ufw enable
```

#### 2. SSL/TLS Setup

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 3. Container Security

```bash
# Scan images for vulnerabilities
docker scan freelanceforge/frontend:latest
docker scan freelanceforge/substrate:latest

# Update base images regularly
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Maintenance Schedule

### Daily Tasks

- Check application health endpoints
- Monitor error logs
- Verify Paseo testnet connectivity

### Weekly Tasks

- Review performance metrics
- Update dependencies (if needed)
- Backup configuration files

### Monthly Tasks

- Security updates
- Performance optimization review
- Capacity planning review

## Support and Resources

### Documentation

- [Polkadot Documentation](https://docs.polkadot.network/)
- [Substrate Documentation](https://docs.substrate.io/)
- [Paseo Testnet Information](https://github.com/paseo-network/paseo-action-submission)

### Community Support

- [Polkadot Stack Exchange](https://substrate.stackexchange.com/)
- [Substrate Technical Chat](https://matrix.to/#/#substrate-technical:matrix.org)
- [FreelanceForge GitHub Issues](https://github.com/freelanceforge/freelanceforge/issues)

### Emergency Contacts

- **Technical Issues**: Create GitHub issue
- **Security Issues**: security@freelanceforge.com
- **Infrastructure**: ops@freelanceforge.com

---

**Note**: This deployment guide assumes deployment to Paseo testnet. For mainnet deployment, additional security measures and testing would be required.
