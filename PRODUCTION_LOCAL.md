# Running Production Configurations Locally

This guide shows you how to run the application with production configurations from your local machine.

## Method 1: Using Next.js Production Build (Recommended)

This method builds and runs the production-optimized version locally.

### Step 1: Create Production Environment File

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit .env.production with your actual production URLs
nano .env.production  # or use your preferred editor
```

### Step 2: Build and Run

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

The app will be available at `http://localhost:3000` with production optimizations enabled.

**Note:** Next.js will automatically use `.env.production` when `NODE_ENV=production` (which is set during `npm run build` and `npm start`).

---

## Method 2: Using Docker with Production Configs

This method runs the production build in a Docker container, exactly as it would run in production.

### Step 1: Create Environment File for Docker

Create a `.env` file in the project root (or use the one from docker-compose):

```bash
# .env file
NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com
NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com

USER_SERVICE_URL=https://your-user-service.onrender.com
CONTENT_SERVICE_URL=https://your-content-service.onrender.com
MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com

NODE_ENV=production
```

### Step 2: Run with Docker Compose

```bash
cd deployment
docker-compose up --build
```

Or build and run directly with Docker:

```bash
# Build the image with production URLs
docker build \
  --build-arg NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com \
  --build-arg NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com \
  --build-arg NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com \
  -t memetomoney-ui:prod .

# Run the container
docker run -p 3000:3000 \
  -e USER_SERVICE_URL=https://your-user-service.onrender.com \
  -e CONTENT_SERVICE_URL=https://your-content-service.onrender.com \
  -e MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com \
  -e NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com \
  -e NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com \
  -e NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com \
  memetomoney-ui:prod
```

---

## Method 3: Development Mode with Production URLs

If you want to use production API URLs but keep development features (hot reload, etc.):

### Step 1: Create `.env.local` File

```bash
# .env.local (this file is gitignored)
NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com
NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com

USER_SERVICE_URL=https://your-user-service.onrender.com
CONTENT_SERVICE_URL=https://your-content-service.onrender.com
MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com
```

### Step 2: Run Development Server

```bash
npm run dev
```

**Note:** `.env.local` takes precedence over `.env.production` in development mode.

---

## Environment Variable Priority

Next.js loads environment variables in this order (highest to lowest priority):

1. `.env.local` (always loaded, except in test)
2. `.env.production` / `.env.development` (based on NODE_ENV)
3. `.env` (default fallback)

**For production builds:** Use `.env.production`
**For development with prod URLs:** Use `.env.local`

---

## Quick Commands Reference

```bash
# Production build and run
npm run build && npm start

# Development with production URLs (using .env.local)
npm run dev

# Docker with production configs
cd deployment && docker-compose up --build

# Check which environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_USER_SERVICE_URL)"
```

---

## Troubleshooting

### Issue: Environment variables not loading
- Make sure the file is named correctly (`.env.production` for production builds)
- Restart the dev server after changing `.env.local`
- Rebuild after changing `.env.production` (variables are embedded at build time)

### Issue: API calls failing
- Verify your production URLs are correct and accessible
- Check CORS settings on your backend services
- Ensure HTTPS is used for production URLs

### Issue: Build fails
- Make sure all `NEXT_PUBLIC_*` variables are set (they're required at build time)
- Check for typos in environment variable names
- Verify Node.js version matches requirements (>=18.0.0)

---

## Testing Production Build Locally

After starting the production server, test:

1. **Health Check:**
   ```bash
   curl http://localhost:3000
   ```

2. **API Connectivity:**
   - Open browser DevTools Network tab
   - Check API calls are going to production URLs
   - Verify responses are successful

3. **Performance:**
   - Production build includes optimizations (minification, tree-shaking, etc.)
   - Check bundle size in DevTools
   - Verify images are optimized

