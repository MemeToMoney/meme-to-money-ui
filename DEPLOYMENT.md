# 🚀 MemeToMoney UI Service Deployment Guide

This guide covers deploying the UI service with your backend services already deployed on Render.

## 📋 Prerequisites

- Backend services deployed on Render
- Docker installed locally
- Your Render service URLs ready

## 🔧 Environment Variables Setup

### 1. **Get Your Render URLs**

From your Render dashboard, copy the URLs for each backend service:
```
User Service: https://your-user-service.onrender.com
Content Service: https://your-content-service.onrender.com
Monetization Service: https://your-monetization-service.onrender.com
```

### 2. **Create Environment File**

Copy the example file and configure it:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Render URLs:
```bash
# Replace with your actual Render URLs
USER_SERVICE_URL=https://your-user-service.onrender.com
NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com

CONTENT_SERVICE_URL=https://your-content-service.onrender.com
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com

MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com
NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com
```

## 🐳 Docker Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Update environment variables in docker-compose.yml:**
   ```yaml
   environment:
     # Update these with your Render URLs
     USER_SERVICE_URL: https://your-user-service.onrender.com
     NEXT_PUBLIC_USER_SERVICE_URL: https://your-user-service.onrender.com
     # ... etc
   ```

2. **Build and run:**
   ```bash
   cd deployment
   docker-compose up --build
   ```

3. **Access your app:**
   ```
   http://localhost:3000
   ```

### Option 2: Direct Docker Build

1. **Build with environment variables:**
   ```bash
   docker build \
     --build-arg NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com \
     --build-arg NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com \
     --build-arg NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com \
     -f deployment/Dockerfile \
     -t memetomoney-ui .
   ```

2. **Run with runtime variables:**
   ```bash
   docker run -p 3000:3000 \
     -e USER_SERVICE_URL=https://your-user-service.onrender.com \
     -e CONTENT_SERVICE_URL=https://your-content-service.onrender.com \
     -e MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com \
     memetomoney-ui
   ```

## ☁️ Cloud Platform Deployment

### Deploy to Render

1. **Connect your GitHub repository to Render**

2. **Create a new Web Service with these settings:**
   ```
   Build Command: docker build -f deployment/Dockerfile .
   Start Command: docker run -p $PORT:3000 your-image
   ```

3. **Set environment variables in Render dashboard:**
   ```
   USER_SERVICE_URL=https://your-user-service.onrender.com
   CONTENT_SERVICE_URL=https://your-content-service.onrender.com
   MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com

   NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.onrender.com
   NEXT_PUBLIC_CONTENT_SERVICE_URL=https://your-content-service.onrender.com
   NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://your-monetization-service.onrender.com
   ```

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add the same environment variables as above

### Deploy to Netlify

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npx netlify deploy --prod --dir=.next
   ```

## 🔍 Environment Variables Explained

### Build-time Variables (NEXT_PUBLIC_*)
These are embedded into the JavaScript bundle during build:
```bash
NEXT_PUBLIC_USER_SERVICE_URL      # Client-side API calls
NEXT_PUBLIC_CONTENT_SERVICE_URL   # Client-side API calls
NEXT_PUBLIC_MONETIZATION_SERVICE_URL # Client-side API calls
```

### Server-side Variables
These are used by Next.js server for API proxying:
```bash
USER_SERVICE_URL          # Server-side API proxy
CONTENT_SERVICE_URL       # Server-side API proxy
MONETIZATION_SERVICE_URL  # Server-side API proxy
```

### Why Both?
- **NEXT_PUBLIC_***: For direct client-to-backend communication
- **Server variables**: For Next.js API routes and server-side rendering

## 🔧 API Routing

The application supports two API communication patterns:

### 1. Direct Backend Communication
Client → Backend Services (uses NEXT_PUBLIC_* variables)

### 2. Proxied Communication
Client → Next.js → Backend Services (uses server variables)

API routes are automatically configured in `next.config.js`:
```javascript
/api/auth/*    → USER_SERVICE_URL/api/auth/*
/api/users/*   → USER_SERVICE_URL/api/users/*
/api/content/* → CONTENT_SERVICE_URL/api/content/*
/api/wallet/*  → MONETIZATION_SERVICE_URL/api/wallet/*
```

## 🛡️ Security Notes

1. **HTTPS Only**: Always use HTTPS URLs for production
2. **CORS Configuration**: Ensure your backend services allow requests from your UI domain
3. **Environment Variables**: Never commit `.env.local` to git
4. **API Keys**: Use environment variables for all sensitive data

## 🧪 Testing Your Deployment

1. **Health Check:**
   ```bash
   curl http://localhost:3000
   ```

2. **API Connectivity:**
   ```bash
   curl http://localhost:3000/api/users/health
   curl http://localhost:3000/api/content/health
   curl http://localhost:3000/api/wallet/health
   ```

3. **Frontend Features:**
   - Navigate to http://localhost:3000
   - Test Feed → Shorts navigation
   - Verify video player controls
   - Check responsive design

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot connect to backend"**
   - Verify Render URLs are correct and accessible
   - Check environment variables are set
   - Ensure backend services are running

2. **"Build failed"**
   - Check build arguments are passed correctly
   - Verify all NEXT_PUBLIC_ variables are set during build

3. **"API calls failing"**
   - Check CORS settings on backend services
   - Verify API routes in next.config.js
   - Test backend URLs directly

### Debug Commands:
```bash
# Check environment variables in container
docker exec -it container_name env | grep SERVICE_URL

# Check Next.js configuration
docker exec -it container_name cat next.config.js

# View application logs
docker logs container_name
```

## 📈 Production Optimizations

1. **Enable caching** for static assets
2. **Configure CDN** for media files
3. **Set up monitoring** for API endpoints
4. **Enable gzip compression** in your hosting platform
5. **Configure error tracking** (Sentry, etc.)

---

Your UI service is now ready to connect with your Render backend services! 🎉