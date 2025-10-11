# UI Service Deployment

This directory contains deployment configurations for the Meme-to-Money UI Service (Frontend).

## Files

- `Dockerfile` - Container build configuration for the UI service
- `docker-compose.yml` - Service deployment configuration
- `.env` - Environment variables (configure before deployment)
- `deploy.sh` - Deployment script

## Quick Start

1. Configure environment variables in `.env`
2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment

```bash
# Build the image
docker build -t memetomoney/ui-service:latest -f Dockerfile ..

# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f ui-service
```

## Configuration

### Required Environment Variables

- `NEXT_PUBLIC_AUTH_SERVICE_URL` - Auth service API endpoint
- `NEXT_PUBLIC_CONTENT_SERVICE_URL` - Content service API endpoint
- Firebase configuration variables (see `.env` file)

### Optional Environment Variables

- `CDN_BASE_URL` - CDN base URL for media
- `UPLOAD_BASE_URL` - Upload service base URL
- `NODE_ENV` - Node environment (production/development)

## Service Information

- **Port**: 3000
- **Frontend**: http://localhost:3000
- **Framework**: Next.js 14 with React 18
- **UI Library**: Material-UI (MUI)

## Features

- User authentication and registration
- Content creation and management
- Media upload and sharing
- User profiles and KYC
- Responsive design with Material-UI
- Server-side rendering with Next.js

## Dependencies

- Auth Service (for authentication APIs)
- Content Service (for content APIs)
- Firebase (for authentication)
- Google Cloud (for media storage)

## Build Configuration

The Dockerfile uses a multi-stage build:
1. **Builder stage**: Installs dependencies and builds the application
2. **Runtime stage**: Runs the optimized production build

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure auth and content services are running
   - Check API endpoint URLs in environment variables

2. **Firebase Configuration Error**
   - Verify all Firebase environment variables are set
   - Check Firebase project configuration

3. **Build Failures**
   - Ensure Node.js version 18+ is used
   - Check for TypeScript errors in the codebase

### Logs

```bash
# View service logs
docker-compose logs -f ui-service

# View build logs
docker build --no-cache -t memetomoney/ui-service:latest -f Dockerfile ..
```

## Development

For development with hot reloading:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```