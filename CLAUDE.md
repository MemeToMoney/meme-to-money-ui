# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development and Build
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Environment Setup
Required environment variables:
```bash
# Service URLs for API communication
export USER_SERVICE_URL="http://localhost:8080"
export CONTENT_SERVICE_URL="http://localhost:8081"
export MONETIZATION_SERVICE_URL="http://localhost:8082"

# For production deployment
export NEXT_PUBLIC_USER_SERVICE_URL="https://api.memetomoney.com/auth"
export NEXT_PUBLIC_CONTENT_SERVICE_URL="https://api.memetomoney.com/content"
export NEXT_PUBLIC_MONETIZATION_SERVICE_URL="https://api.memetomoney.com/wallet"
```

## Architecture Overview

This is the **UI Service** for the Meme-to-Money platform - a Next.js React frontend that integrates with all backend microservices:

**Technology Stack:**
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Query** for server state management
- **Axios** for API communication
- **React Hook Form + Zod** for form handling and validation
- **Recharts** for analytics visualization

### Core Features

**Authentication & User Management:**
- Login/Register with JWT tokens
- Profile management and KYC verification
- Password reset and security settings
- Session management with cookie storage

**Content Management:**
- Content feed with infinite scrolling
- Upload memes and short videos
- Content discovery and search
- Trending content algorithms
- Content creator analytics

**Monetization Features:**
- Wallet dashboard with balance display
- Tip sending/receiving interface
- Earnings tracking and analytics
- Payout request management
- Transaction history

**Social Features:**
- User profiles and creator pages
- Content engagement (likes, comments, shares)
- Following/followers system
- Notifications and activity feeds

### Service Integration

**API Communication:**
- All API calls proxy through Next.js rewrites
- JWT token handling via cookies and Axios interceptors
- Error handling with automatic login redirection
- Service-specific API clients for each backend

**Authentication Flow:**
1. User login/register via User Service API
2. JWT token stored in secure HTTP-only cookies
3. Token automatically included in API requests
4. Token validation handled by backend services

**Content Workflow:**
1. File uploads handled via Content Service
2. Media processing and CDN storage
3. Real-time engagement updates via WebSocket
4. Monetization events sent to Wallet Service

### Package Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, register)
│   ├── feed/              # Content feed and discovery
│   ├── profile/           # User profile management
│   ├── wallet/            # Monetization and wallet
│   ├── upload/            # Content upload interface
│   └── dashboard/         # Creator analytics dashboard
├── components/            # Reusable UI components
│   ├── layout/            # Navigation and layout components
│   ├── content/           # Content display components
│   ├── forms/             # Form components and validation
│   └── wallet/            # Wallet and payment components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication context and API
│   ├── api/               # API clients for each service
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── types/                 # TypeScript type definitions
└── styles/                # Global styles and themes
```

### Key Components

**Authentication System:**
- `AuthContext` - Global authentication state management
- `authApi` - User Service API integration
- Protected routes with automatic redirects
- Token refresh and session management

**Content Management:**
- `ContentFeed` - Infinite scroll feed with content cards
- `ContentUpload` - Multi-step upload with file validation
- `VideoPlayer` - Custom video player with engagement tracking
- `ContentAnalytics` - Creator dashboard with performance metrics

**Wallet Integration:**
- `WalletDashboard` - Balance display and transaction history
- `TipModal` - Tip sending interface with payment processing
- `PayoutRequest` - Withdrawal request form with KYC validation
- `EarningsChart` - Visual analytics for creator earnings

### API Integration Patterns

**Service Communication:**
- Each backend service has dedicated API client
- Consistent error handling across all services
- Request/response interceptors for authentication
- Type-safe API responses with Zod validation

**State Management:**
- React Query for server state caching
- React Context for global UI state
- Local storage for user preferences
- Cookie-based authentication persistence

**Performance Optimizations:**
- Next.js Image optimization for media content
- Code splitting with dynamic imports
- Service Worker for offline capabilities
- CDN integration for static assets

### Development Guidelines

**Component Architecture:**
- Functional components with TypeScript
- Custom hooks for business logic
- MUI theming for consistent design
- Responsive design with mobile-first approach

**API Integration:**
- Service-specific API clients in `/lib/api/`
- Consistent error handling and loading states
- Request deduplication with React Query
- Automatic retry logic for failed requests

**Security Considerations:**
- JWT tokens in HTTP-only cookies
- CSRF protection via SameSite cookies
- Input validation on client and server
- Content Security Policy headers

**Testing Strategy:**
- Unit tests for utility functions
- Integration tests for API clients
- E2E tests for critical user flows
- Visual regression testing for UI components

## Service URLs and Integration

### Development Environment
- **UI Service**: http://localhost:3000
- **User Service**: http://localhost:8080 (authentication, profiles)
- **Content Service**: http://localhost:8081 (content upload, feeds)
- **Monetization Service**: http://localhost:8082 (wallet, payments)

### API Proxy Configuration
Next.js rewrites handle API routing:
- `/api/auth/*` → User Service
- `/api/users/*` → User Service  
- `/api/content/*` → Content Service
- `/api/wallet/*` → Monetization Service

### Authentication Integration
- JWT token validation across all services
- User session management via cookies
- Automatic token refresh and error handling
- Cross-service user context sharing

## Development Notes

**Environment Setup:**
- Node.js 18+ required for Next.js 14
- All backend services must be running for full functionality
- MongoDB databases required for data persistence
- Redis for caching and session management

**Build Process:**
- TypeScript compilation with strict mode
- ESLint with Next.js configuration
- Automatic code formatting with Prettier
- Production build optimization with SWC

**Deployment Considerations:**
- Environment-specific configuration
- CDN setup for static assets and media
- SSL certificates for secure API communication
- Load balancing for high availability

**Performance Monitoring:**
- Next.js built-in analytics
- Real User Monitoring (RUM)
- API response time tracking
- Error boundary implementation

This UI service provides a complete frontend interface for the Meme-to-Money platform, seamlessly integrating with all backend microservices to deliver a smooth user experience for content creators and consumers.