# Deployment Guide

This guide covers deploying the Colmi Ring Dashboard to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Deployment Options](#deployment-options)
- [Platform-Specific Guides](#platform-specific-guides)
- [Environment Configuration](#environment-configuration)
- [HTTPS Requirements](#https-requirements)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure:

- ✅ Node.js 18.x or higher installed
- ✅ All dependencies installed: `npm install`
- ✅ Build completes successfully: `npm run build`
- ✅ No TypeScript or lint errors: `npm run type-check && npm run lint`

## Build Configuration

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Build Output

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── cache/           # Build cache
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option as it's made by the creators of Next.js.

**Advantages:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Automatic deployments from Git
- Free tier available

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. For production:
```bash
vercel --prod
```

**Or deploy via Vercel Dashboard:**

1. Visit [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel auto-detects Next.js
4. Click "Deploy"

### Option 2: Netlify

**Advantages:**
- Easy Git integration
- Automatic HTTPS
- CDN distribution
- Free tier available

**Steps:**

1. Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. Connect repository on [Netlify](https://netlify.com)

3. Set build command: `npm run build`

4. Set publish directory: `.next`

5. Deploy

### Option 3: Docker

**Advantages:**
- Self-hosted
- Full control
- Reproducible builds

**Steps:**

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

2. Create `.dockerignore`:
```
node_modules
.next
.git
.gitignore
README.md
.env*.local
```

3. Build and run:
```bash
docker build -t colmi-ring-dashboard .
docker run -p 3000:3000 colmi-ring-dashboard
```

### Option 4: Traditional Node.js Hosting

**For VPS or dedicated servers:**

1. Clone repository on server
2. Install dependencies: `npm ci --production`
3. Build: `npm run build`
4. Start: `npm start`
5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "colmi-dashboard" -- start
pm2 save
pm2 startup
```

### Option 5: Static Export

**Note:** Static export has limitations with Web Bluetooth.

```javascript
// next.config.ts
const nextConfig = {
  output: 'export',
};

export default nextConfig;
```

Build static files:
```bash
npm run build
```

Deploy the `out/` directory to any static host (GitHub Pages, S3, etc.)

**⚠️ Limitation:** Web Bluetooth requires secure context (HTTPS).

## Platform-Specific Guides

### AWS Amplify

1. Connect Git repository
2. Set build settings:
   - Build command: `npm run build`
   - Base directory: `/`
   - Output directory: `.next`
3. Deploy

### Google Cloud Run

1. Create `Dockerfile` (see Docker section)
2. Build and push:
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/colmi-dashboard
```
3. Deploy:
```bash
gcloud run deploy --image gcr.io/PROJECT-ID/colmi-dashboard --platform managed
```

### Azure Static Web Apps

1. Connect Git repository
2. Configure build:
   - App location: `/`
   - API location: (leave empty)
   - Output location: `.next`
3. Deploy

### Railway

1. Connect Git repository
2. Railway auto-detects Next.js
3. Click "Deploy"

## Environment Configuration

### Environment Variables

Create `.env.production`:

```bash
# No environment variables required for basic functionality
# Add only if using analytics, etc.

# Example:
# NEXT_PUBLIC_ANALYTICS_ID=your_id
```

**Important:** Never commit sensitive keys. Use platform-specific environment variable management.

### Build Settings

For all platforms, ensure:
- Node version: `18.x` or higher
- Build command: `npm run build` or `npm ci && npm run build`
- Start command: `npm start`
- Output directory: `.next`

## HTTPS Requirements

**Critical:** Web Bluetooth API requires HTTPS in production.

### Automatic HTTPS

Most platforms provide automatic HTTPS:
- ✅ Vercel
- ✅ Netlify
- ✅ AWS Amplify
- ✅ Google Cloud Run
- ✅ Azure

### Manual HTTPS (Self-Hosted)

Use a reverse proxy with SSL:

**Nginx with Let's Encrypt:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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

**Caddy (automatic HTTPS):**

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

## Security Headers

Add security headers in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'bluetooth=*, camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

## Performance Optimization

### 1. Enable Compression

Most platforms enable automatically, but for self-hosted:

```bash
npm install compression
```

### 2. CDN Configuration

Use platform CDN or configure CloudFlare:
- Enable caching for static assets
- Set cache headers appropriately
- Use image optimization

### 3. Next.js Optimizations

Already included:
- Automatic code splitting
- Image optimization with `next/image`
- Font optimization with `next/font`

## Monitoring

### Analytics

Add to `.env.production`:

```bash
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

Add to `app/layout.tsx`:

```typescript
import Script from 'next/script';

// In component
{process.env.NEXT_PUBLIC_GA_ID && (
  <Script
    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    strategy="afterInteractive"
  />
)}
```

### Error Tracking

Consider services like:
- Sentry
- LogRocket
- Bugsnag

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Bluetooth Not Working

1. Verify HTTPS is enabled
2. Check browser compatibility
3. Test in Chrome/Edge (best support)
4. Check browser console for errors

### Performance Issues

1. Enable production mode
2. Check bundle size: `npm run build` shows sizes
3. Analyze with:
```bash
npm install -g @next/bundle-analyzer
```

### CORS Issues

Not applicable - all processing is client-side

## Continuous Deployment

### GitHub Actions

Already configured in `.github/workflows/ci.yml`

For deployment, add:

```yaml
- name: Deploy to Vercel
  run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
image: node:18

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
```

## Health Checks

Add health check endpoint in `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

## Rollback Strategy

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker tag colmi-dashboard:current colmi-dashboard:rollback
docker run -p 3000:3000 colmi-dashboard:rollback
```

### Git-based
```bash
git revert HEAD
git push
```

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Open an issue on GitHub
4. Check browser console for errors

## Checklist

Before going live:

- [ ] Build succeeds without errors
- [ ] All lint checks pass
- [ ] TypeScript compilation successful
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Analytics setup (optional)
- [ ] Error tracking configured (optional)
- [ ] Domain configured
- [ ] SSL certificate valid
- [ ] Tested with actual Colmi ring
- [ ] Tested on multiple browsers
- [ ] Mobile responsive verified
- [ ] Performance acceptable

---

Happy deploying! 🚀
