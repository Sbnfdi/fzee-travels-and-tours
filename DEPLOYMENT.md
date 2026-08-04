# TravelHub Pro - Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] JWT secrets changed in production
- [ ] CORS and security headers configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Error logging/monitoring setup
- [ ] Rate limiting configured

## Development Deployment

### Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy TravelHub Pro"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     ```
     DATABASE_URL
     JWT_SECRET
     JWT_REFRESH_SECRET
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://your-domain.com
     ```

4. **Configure Database**
   - For production, migrate to PostgreSQL with Neon
   - Update `prisma/schema.prisma` datasource provider
   - Run migrations

5. **Deploy**
   - Vercel automatically deploys on push
   - Monitor deployments in Vercel dashboard

### Option 2: AWS EC2/ECS

1. **Setup EC2 Instance**
   ```bash
   # SSH into instance
   ssh -i key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install pnpm
   npm install -g pnpm
   ```

2. **Clone and Setup**
   ```bash
   git clone your-repo-url
   cd travelhub-pro
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Setup Database (Neon PostgreSQL)**
   - Create Neon database at https://console.neon.tech
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Run migrations: `pnpm prisma migrate deploy`

5. **Setup Process Manager (PM2)**
   ```bash
   sudo npm install -g pm2
   
   # Build application
   pnpm build
   
   # Start with PM2
   pm2 start "pnpm start" --name travelhub
   
   # Configure auto-restart on reboot
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   
   # Create config
   sudo nano /etc/nginx/sites-available/travelhub
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/travelhub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install --frozen-lockfile
   COPY . .
   RUN pnpm build
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=file:./prisma/prod.db
         - JWT_SECRET=${JWT_SECRET}
       volumes:
         - ./prisma:/app/prisma
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Database Migration Strategy

### SQLite → PostgreSQL (Neon)

1. **Update schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Create new migration**
   ```bash
   pnpm prisma migrate dev --name migrate_to_postgres
   ```

3. **Export data from SQLite** (if needed)
   ```bash
   pnpm prisma db push
   ```

4. **Verify production data**
   ```bash
   pnpm prisma studio
   ```

## Monitoring & Logging

### Application Monitoring
- Setup Sentry for error tracking
- Configure CloudWatch for AWS deployments
- Setup Vercel Analytics

### Database Monitoring
- Enable query logging
- Setup backup schedules
- Configure alerts for disk usage

### Performance Monitoring
- Setup New Relic or Datadog
- Monitor response times
- Track database query performance

## Security Hardening

### Environment Variables
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### Database Security
- Enable SSL/TLS connections
- Setup firewall rules
- Regular backups to secure storage
- Encrypt sensitive data at rest

### API Security
- Enable rate limiting
- Setup CORS properly
- Add security headers
- Use HTTPS only
- Implement request validation

## Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Use managed database services (Neon)

### Horizontal Scaling
- Deploy multiple instances
- Use load balancing (AWS ELB, Nginx)
- Implement caching (Redis)
- Separate concerns (API server, worker server)

## Backup & Recovery

### Automated Backups
```bash
# Daily backup script
0 2 * * * /usr/local/bin/backup-db.sh
```

### Restore from Backup
```bash
# Restore PostgreSQL backup
psql -U postgres -d travelhub < backup.sql
```

## Rollback Procedure

1. **Revert to previous deployment**
   ```bash
   git revert HEAD
   git push
   # Vercel automatically deploys
   ```

2. **If database migration failed**
   ```bash
   pnpm prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Restore from backup**
   - Stop application
   - Restore database from backup
   - Restart application

## Post-Deployment

1. **Verify deployment**
   - Test login functionality
   - Check all dashboard features
   - Verify API endpoints
   - Test payment flows

2. **Monitor logs**
   ```bash
   # PM2 logs
   pm2 logs travelhub
   
   # Application logs
   tail -f /var/log/app.log
   ```

3. **Performance testing**
   - Run load tests
   - Check response times
   - Monitor resource usage

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
pnpm prisma db push
```

**Port Already in Use**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Build Failed**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules

# Reinstall and rebuild
pnpm install
pnpm build
```

## Support

For deployment issues, contact: devops@travelhubpro.com
