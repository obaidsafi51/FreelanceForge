# FreelanceForge Production Deployment

This document provides a complete guide for deploying FreelanceForge to production on Paseo testnet.

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/freelanceforge/freelanceforge.git
cd freelanceforge

# 2. Install dependencies
npm run setup

# 3. Configure production environment
cp frontend/.env.example frontend/.env.production
# Edit .env.production with your settings

# 4. Build and deploy
npm run deploy:production

# 5. Verify deployment
./scripts/verify-deployment.sh

# 6. Run end-to-end tests
npm run test:deployment
```

## 📋 Production Checklist

### ✅ Pre-deployment Requirements

- [ ] Docker and Docker Compose installed
- [ ] Production environment configured (`.env.production`)
- [ ] Paseo testnet connectivity verified
- [ ] Test account funded with Paseo tokens
- [ ] SSL certificates ready (if using custom domain)
- [ ] Monitoring service configured (optional)

### ✅ Deployment Steps

- [ ] Production build completed successfully
- [ ] All containers running and healthy
- [ ] Frontend accessible and responsive
- [ ] Substrate node connected to Paseo testnet
- [ ] End-to-end tests passing
- [ ] Monitoring and alerting configured

### ✅ Post-deployment Verification

- [ ] Wallet connection works
- [ ] Credential minting successful
- [ ] Dashboard loads credentials
- [ ] Trust score calculation accurate
- [ ] Export functionality working
- [ ] Portfolio sharing functional
- [ ] Performance metrics within targets

## 🌐 Network Configuration

### Paseo Testnet Endpoints

| Purpose     | URL                           | Status    |
| ----------- | ----------------------------- | --------- |
| Primary RPC | `wss://paseo.dotters.network` | ✅ Active |
| Fallback 1  | `wss://rpc.ibp.network/paseo` | ✅ Active |
| Fallback 2  | `wss://paseo.rpc.amforc.com`  | ✅ Active |
| Explorer    | `https://paseo.subscan.io`    | ✅ Active |

### Environment Variables

```bash
# Production configuration
VITE_NETWORK=paseo
VITE_WS_PROVIDER=wss://paseo.dotters.network
VITE_DEBUG=false
VITE_LOG_LEVEL=error

# Optional monitoring
VITE_ERROR_REPORTING_URL=https://your-sentry-dsn
VITE_PERFORMANCE_REPORTING_URL=https://your-monitoring-service
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Substrate Node │    │  Paseo Testnet  │
│   (React/Vite)  │◄──►│  (Local/Remote) │◄──►│   (External)    │
│   Port: 80      │    │  Port: 9944     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Monitoring    │    │   External      │
│   (Optional)    │    │   (Prometheus)  │    │   Services      │
│   Port: 443     │    │   Port: 9090    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Service Configuration

### Frontend Service

- **Technology**: React 19 + Vite + TypeScript
- **Port**: 80 (HTTP) / 443 (HTTPS)
- **Build**: Optimized production bundle with code splitting
- **Caching**: Static assets cached for 1 year, HTML for 1 hour
- **Security**: CSP headers, XSS protection, CORS configured

### Substrate Node Service

- **Runtime**: Custom pallet integrated
- **Network**: Connects to Paseo testnet
- **Ports**: 9944 (WebSocket), 9933 (HTTP RPC), 30333 (P2P)
- **Storage**: Persistent volume for chain data
- **Health**: Built-in health check endpoint

## 📊 Monitoring and Observability

### Key Metrics

| Metric                   | Target | Alert Threshold |
| ------------------------ | ------ | --------------- |
| Frontend Response Time   | <2s    | >3s             |
| RPC Response Time        | <1s    | >2s             |
| Transaction Success Rate | >95%   | <90%            |
| Memory Usage             | <2GB   | >3GB            |
| CPU Usage                | <50%   | >80%            |
| Disk Usage               | <80%   | >90%            |

### Monitoring Stack

```bash
# Start monitoring services
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Access dashboards
# Grafana: http://localhost:3001 (admin/freelanceforge2024)
# Prometheus: http://localhost:9090
# AlertManager: http://localhost:9093
```

### Log Aggregation

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f substrate-node

# Export logs for analysis
docker-compose -f docker-compose.prod.yml logs --no-color > freelanceforge.log
```

## 🔒 Security Considerations

### Network Security

- Firewall configured for required ports only
- SSL/TLS encryption for HTTPS traffic
- WebSocket connections secured
- CORS properly configured

### Application Security

- Debug mode disabled in production
- Sensitive data not logged
- Input validation and sanitization
- XSS and CSRF protection enabled
- Private keys never stored or transmitted

### Container Security

- Non-root user in containers
- Minimal base images used
- Regular security updates
- Resource limits configured

## 🚨 Troubleshooting

### Common Issues

#### 1. Frontend Not Loading

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs frontend

# Verify build
ls -la frontend/dist/

# Test directly
curl http://localhost/health
```

#### 2. Substrate Connection Issues

```bash
# Test Paseo connectivity
curl -H "Content-Type: application/json" \
     -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain"}' \
     https://paseo.dotters.network

# Check WebSocket
wscat -c wss://paseo.dotters.network

# Verify local node
curl http://localhost:9933/health
```

#### 3. Transaction Failures

```bash
# Check account balance
# Use Polkadot.js Apps: https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network

# Verify pallet integration
docker-compose -f docker-compose.prod.yml logs substrate-node | grep -i pallet

# Test with minimal transaction
npm run test:deployment
```

#### 4. Performance Issues

```bash
# Monitor resource usage
docker stats

# Check system resources
free -h
df -h
top

# Analyze bundle size
cd frontend && npm run build:analyze
```

### Emergency Procedures

#### Service Recovery

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Rebuild and redeploy
npm run deploy:production

# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
# Deploy previous version
```

#### Data Recovery

```bash
# Backup chain data
docker-compose -f docker-compose.prod.yml exec substrate-node \
  tar -czf /data/backup-$(date +%Y%m%d).tar.gz /data

# Restore from backup
docker-compose -f docker-compose.prod.yml down
# Restore backup files
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

### Frontend Optimization

- Code splitting implemented
- Static assets cached with long expiry
- Gzip compression enabled
- Bundle size optimized (<2MB total)
- Lazy loading for large components

### Backend Optimization

- Connection pooling for RPC calls
- Query result caching (60s stale time)
- Efficient storage queries
- Background data fetching
- Error retry with exponential backoff

## 🔄 Maintenance

### Daily Tasks

- [ ] Check service health endpoints
- [ ] Monitor error rates and performance
- [ ] Verify Paseo testnet connectivity
- [ ] Review application logs

### Weekly Tasks

- [ ] Update dependencies (security patches)
- [ ] Backup configuration and data
- [ ] Performance analysis and optimization
- [ ] Security scan and updates

### Monthly Tasks

- [ ] Capacity planning review
- [ ] Security audit
- [ ] Disaster recovery testing
- [ ] Documentation updates

## 📞 Support

### Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [API Documentation](./docs/API.md)

### Community

- [GitHub Issues](https://github.com/freelanceforge/freelanceforge/issues)
- [Substrate Stack Exchange](https://substrate.stackexchange.com/)
- [Polkadot Discord](https://discord.gg/polkadot)

### Emergency Contacts

- **Technical Issues**: Create GitHub issue with logs
- **Security Issues**: security@freelanceforge.com
- **Infrastructure**: ops@freelanceforge.com

---

## 🎯 Success Criteria

The deployment is considered successful when:

- ✅ All health checks pass
- ✅ End-to-end tests complete successfully
- ✅ Performance metrics meet targets
- ✅ Security scans show no critical issues
- ✅ Monitoring and alerting functional
- ✅ Documentation complete and accessible

**Deployment Status**: 🟢 Ready for Production

**Last Updated**: $(date)
**Version**: 1.0.0
**Network**: Paseo Testnet
