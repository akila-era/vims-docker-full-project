# VIMS Nginx Setup Guide (HTTP - No SSL)

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

## Domain Access (HTTP Only)

After setup, you can access:

- **Main App**: http://vims.hexalyte.com
- **API Docs**: http://api.vims.hexalyte.com/docs  
- **Database Admin**: http://db.vims.hexalyte.com
- **WebSocket Test**: ws://ws.vims.hexalyte.com

## Local Testing Setup

Add these to your `/etc/hosts` file (Windows: `C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1 vims.hexalyte.com
127.0.0.1 api.vims.hexalyte.com  
127.0.0.1 ws.vims.hexalyte.com
127.0.0.1 db.vims.hexalyte.com
```

## Services Overview

| Service | Container | Port | Domain |
|---------|-----------|------|--------|
| Frontend | frontend-app | 3000 | vims.hexalyte.com |
| Backend API | backend-app | 4444 | api.vims.hexalyte.com |
| WebSocket | backend-app | 4444 | ws.vims.hexalyte.com |
| Database | mysql-container | 3306 | Internal only |
| PhpMyAdmin | phpmyadmin-container | 80 | db.vims.hexalyte.com |
| Nginx Proxy | nginx-proxy | 80 | All domains |

## Flutter App Configuration

Your Flutter app is already configured to use `https://api.vims.hexalyte.com`. For local testing, you may need to update:

```dart
// In api_environment.dart, change to:
return 'http://api.vims.hexalyte.com';  // Remove https for local testing
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart nginx only
docker-compose restart nginx

# Rebuild and restart
docker-compose down && docker-compose up --build -d

# Check nginx config
docker exec nginx-proxy nginx -t

# View nginx access logs
docker-compose logs nginx-proxy
```

## Troubleshooting

1. **Domains not resolving**: Check `/etc/hosts` file
2. **502 Bad Gateway**: Check if backend services are running
3. **CORS errors**: Update CORS_ORIGIN in .env file
4. **Database connection**: Verify DB credentials in .env

## Production Migration

To enable SSL later:
1. Install Let's Encrypt certificates
2. Update nginx.conf ports from 80 → 443
3. Add SSL certificate paths
4. Enable HTTPS redirects

## Monitoring

- **Health check**: http://api.vims.hexalyte.com/health
- **API status**: http://api.vims.hexalyte.com/docs
- **Database**: http://db.vims.hexalyte.com (phpMyAdmin)