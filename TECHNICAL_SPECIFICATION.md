# Meme-to-Money Platform - Technical Specification

## 🏗️ System Architecture Overview

### **Frontend Architecture (UI Service)**
- **Framework**: Next.js 14.1.0 with App Router
- **Language**: TypeScript 5.0+ for type safety
- **Styling**: Material-UI (MUI) v5 with custom theme system
- **State Management**: React Query + React Context API
- **Authentication**: JWT tokens with HTTP-only cookies
- **PWA**: Progressive Web App capabilities

### **Backend Microservices Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Service    │    │  User Service   │    │ Content Service │
│   (Next.js)     │────│ (Auth/Profile)  │    │  (Media/Feed)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 8081    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│ Monetization    │──────────────┘
                        │    Service      │
                        │ (Wallet/Tips)   │
                        │   Port: 8082    │
                        └─────────────────┘
```

---

## 📁 Frontend Codebase Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   └── reset/page.tsx        # Password reset
│   ├── feed/page.tsx             # Main content feed
│   ├── profile/page.tsx          # User profile pages
│   ├── wallet/page.tsx           # Wallet dashboard
│   ├── upload/page.tsx           # Content upload
│   ├── contests/page.tsx         # Contest system
│   ├── search/page.tsx           # Search and discovery
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx            # Main navigation
│   │   ├── MobileSidebar.tsx     # Mobile navigation
│   │   ├── DesktopSidebar.tsx    # Desktop sidebar
│   │   └── Footer.tsx            # Footer component
│   ├── content/                  # Content-related components
│   │   ├── ContentFeed.tsx       # Main feed component
│   │   ├── MobileOptimizedContentCard.tsx # Instagram-style cards
│   │   ├── SimpleContentCard.tsx # Basic content cards
│   │   ├── YouTubeStyleVideoPlayer.tsx # Video player
│   │   ├── CommentsModal.tsx     # Comment system
│   │   └── ContentUpload.tsx     # Upload interface
│   ├── forms/                    # Form components
│   │   ├── AuthForm.tsx          # Authentication forms
│   │   ├── ProfileForm.tsx       # Profile management
│   │   └── ContactForm.tsx       # Contact forms
│   ├── wallet/                   # Monetization components
│   │   ├── WalletDashboard.tsx   # Wallet overview
│   │   ├── TipModal.tsx          # Tip sending interface
│   │   ├── TransactionHistory.tsx # Transaction list
│   │   └── PayoutRequest.tsx     # Withdrawal requests
│   └── ui/                       # Generic UI components
│       ├── Loading.tsx           # Loading states
│       ├── ErrorBoundary.tsx     # Error handling
│       └── ThemeToggle.tsx       # Theme switcher
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication logic
│   │   ├── AuthContext.tsx       # Auth state management
│   │   ├── authApi.ts            # Auth API client
│   │   └── types.ts              # Auth type definitions
│   ├── api/                      # API clients
│   │   ├── contentApi.ts         # Content service API
│   │   ├── userApi.ts            # User service API
│   │   ├── walletApi.ts          # Wallet service API
│   │   └── baseApi.ts            # Base API configuration
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useLocalStorage.ts    # Local storage hook
│   │   └── useDebounce.ts        # Debounce hook
│   └── utils/                    # Helper functions
│       ├── format.ts             # Formatting utilities
│       ├── validation.ts         # Input validation
│       └── constants.ts          # App constants
├── types/                        # TypeScript definitions
│   ├── auth.ts                   # Auth types
│   ├── content.ts                # Content types
│   ├── wallet.ts                 # Wallet types
│   └── api.ts                    # API response types
└── styles/                       # Styling
    ├── theme.ts                  # MUI theme configuration
    └── globals.css               # Global CSS
```

---

## 🔧 Key Technical Components

### **1. Authentication System**

#### AuthContext.tsx
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

**Features:**
- JWT token management with HTTP-only cookies
- Automatic token refresh
- Protected route handling
- Session persistence
- Loading states

#### Implementation Details:
- Tokens stored securely in HTTP-only cookies
- Automatic redirect to login for protected routes
- Context provider wraps entire application
- Token validation on each API request

### **2. Content Management System**

#### ContentFeed.tsx
```typescript
interface ContentFeedProps {
  initialFeedType?: FeedType;
  showTabs?: boolean;
  maxItems?: number;
  onContentClick?: (contentId: string) => void;
  onProfileClick?: (userId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}
```

**Features:**
- Infinite scroll implementation
- Multiple feed types (trending, fresh, featured, home)
- Mobile-optimized design
- Real-time engagement updates
- Optimistic UI updates

#### Feed Types:
- **Home Feed**: Personalized content for authenticated users
- **Trending Feed**: Popular content in last 24 hours
- **Fresh Feed**: Latest content from past 6 hours
- **Featured Feed**: Editor-curated content

### **3. Mobile-Optimized Content Cards**

#### MobileOptimizedContentCard.tsx
```typescript
interface MobileOptimizedContentCardProps {
  content: Content;
  userEngagement?: UserEngagementStatus;
  onContentClick?: (contentId: string) => void;
  onProfileClick?: (userId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}
```

**Features:**
- Instagram-style layout
- Responsive design (mobile-first)
- Engagement actions (like, comment, share)
- Video player integration
- Dark/light theme support
- Placeholder image system for broken URLs

### **4. Comment System**

#### CommentsModal.tsx
```typescript
interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle?: string;
}
```

**Features:**
- Full-screen mobile modal
- Desktop popup modal
- Real-time comment loading
- Nested replies support
- Optimistic comment posting
- Loading states and error handling

---

## 🌐 API Integration Architecture

### **API Client Structure**

#### Base API Configuration
```typescript
// baseApi.ts
const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 10000,
  });

  // Request interceptor for auth
  client.interceptors.request.use((config) => {
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => handleApiError(error)
  );

  return client;
};
```

#### Service-Specific API Clients

**Content API (contentApi.ts)**
```typescript
export const contentApi = {
  // Feed endpoints
  getHomeFeed: (page = 0, size = 10): Promise<UIFeedResponse>
  getTrendingFeed: (page = 0, size = 10, hours = 24): Promise<UIFeedResponse>
  getFreshFeed: (page = 0, size = 10, hours = 6): Promise<UIFeedResponse>
  getFeaturedFeed: (page = 0, size = 10): Promise<UIFeedResponse>

  // Content management
  uploadContent: (data: FormData): Promise<Content>
  getContentDetails: (id: string): Promise<UIContentDetailResponse>
  deleteContent: (id: string): Promise<void>

  // Engagement
  likeContent: (id: string): Promise<void>
  unlikeContent: (id: string): Promise<void>
  addComment: (id: string, comment: CommentRequest): Promise<Comment>
  getContentCommentsUI: (id: string, page: number): Promise<UICommentsResponse>

  // Search
  searchContent: (query: string, filters: SearchFilters): Promise<UISearchResponse>
  getSearchSuggestions: (): Promise<UISearchSuggestionsResponse>
};
```

### **API Proxy Configuration**

#### Next.js Rewrites (next.config.js)
```javascript
async rewrites() {
  return [
    {
      source: '/api/auth/:path*',
      destination: `${process.env.USER_SERVICE_URL}/:path*`
    },
    {
      source: '/api/content/:path*',
      destination: `${process.env.CONTENT_SERVICE_URL}/:path*`
    },
    {
      source: '/api/wallet/:path*',
      destination: `${process.env.MONETIZATION_SERVICE_URL}/:path*`
    }
  ];
}
```

---

## 📱 Mobile-First Design System

### **Responsive Breakpoints**
```typescript
const theme = {
  breakpoints: {
    xs: 0,      // Mobile (0-599px)
    sm: 600,    // Tablet (600-959px)
    md: 960,    // Desktop (960-1279px)
    lg: 1280,   // Large Desktop (1280-1919px)
    xl: 1920    // Extra Large (1920px+)
  }
};
```

### **Mobile Navigation System**

#### Bottom Navigation (Mobile)
```typescript
const bottomNavItems = [
  { label: 'Feed', icon: Home, route: '/feed' },
  { label: 'Profile', icon: Person, route: '/profile' },
  { label: 'Contests', icon: EmojiEvents, route: '/contests' },
  { label: 'Create', icon: VideoLibrary, route: '/upload' }
];
```

#### Desktop Sidebar Navigation
```typescript
const sidebarItems = [
  { label: 'Home', icon: Home, route: '/' },
  { label: 'Feed', icon: Feed, route: '/feed' },
  { label: 'Upload', icon: CloudUpload, route: '/upload' },
  { label: 'Wallet', icon: AccountBalanceWallet, route: '/wallet' },
  { label: 'Profile', icon: Person, route: '/profile' },
  { label: 'Contests', icon: EmojiEvents, route: '/contests' }
];
```

---

## 🎨 Theme System

### **Material-UI Theme Configuration**
```typescript
const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});
```

### **Dark Mode Support**
- Automatic system preference detection
- Manual theme toggle
- Persistent theme selection
- Component-level theme awareness

---

## 🔄 State Management

### **React Query Configuration**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### **Custom Hooks**

#### useAuth Hook
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### useLocalStorage Hook
```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};
```

---

## 🚀 Performance Optimizations

### **Next.js Optimizations**
- **Static Generation**: Pre-rendered pages for better SEO
- **Image Optimization**: Automatic image compression and WebP conversion
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Regular bundle size monitoring

### **React Optimizations**
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Dynamic imports for heavy components
- **Virtual Scrolling**: For large lists (future implementation)
- **Debounced Search**: Reduced API calls for search

### **API Optimizations**
- **Request Deduplication**: React Query automatic deduplication
- **Background Refetching**: Stale-while-revalidate pattern
- **Optimistic Updates**: Immediate UI updates for better UX
- **Error Boundaries**: Graceful error handling

---

## 🔒 Security Implementation

### **Authentication Security**
- HTTP-only cookies for token storage
- CSRF protection with SameSite cookies
- Automatic token refresh
- Secure logout and session cleanup

### **Input Validation**
- Client-side validation with Zod schemas
- Server-side validation in backend services
- XSS prevention with sanitized inputs
- SQL injection prevention with parameterized queries

### **Content Security**
- Content Security Policy (CSP) headers
- File upload validation and scanning
- Image processing and optimization
- Media content moderation

---

## 🧪 Testing Strategy

### **Frontend Testing**
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Storybook + Chromatic

### **Performance Testing**
- **Lighthouse**: Core Web Vitals monitoring
- **Bundle Analyzer**: Regular bundle size checks
- **Load Testing**: API endpoint performance
- **Memory Profiling**: React component optimization

---

## 📊 Monitoring & Analytics

### **Application Monitoring**
- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: Web Vitals tracking
- **User Analytics**: Custom event tracking
- **API Monitoring**: Response time and error rates

### **Business Metrics**
- **User Engagement**: DAU, session duration, retention
- **Content Performance**: Upload rates, engagement rates
- **Revenue Tracking**: Tips, subscriptions, commissions
- **Creator Metrics**: Earnings, content performance

---

## 🔧 Development Workflow

### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code linting with Next.js config
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

### **Version Control**
- **Git**: Version control with feature branches
- **Conventional Commits**: Standardized commit messages
- **Pull Requests**: Code review process
- **Automated Testing**: CI/CD pipeline integration

### **Development Environment**
```bash
# Environment Variables
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8080
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_MONETIZATION_SERVICE_URL=http://localhost:8082

# Development Commands
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run linting
npm run type-check   # TypeScript checking
```

---

*This technical specification will be updated as the platform evolves and new features are implemented.*

**Last Updated**: September 2024
**Version**: 1.0
**Next Review**: October 2024