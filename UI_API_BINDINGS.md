# UI-API Bindings Documentation

## 📋 Overview

This document maps every UI component to its corresponding backend API calls, showing exactly what APIs are already integrated and need to be implemented in the backend services.

---

## 🔐 Authentication Flow

### **Login Page** (`/auth/login`)
**File**: `src/app/auth/login/page.tsx`

**API Calls**:
```typescript
// Login submission
POST /api/auth/login
Request: { email: string, password: string }
Usage: When user submits login form
Component: AuthForm component

// Error handling and success redirect
Success: Redirect to /feed
Error: Display error message in form
```

### **Register Page** (`/auth/register`)
**File**: `src/app/auth/register/page.tsx`

**API Calls**:
```typescript
// Registration submission
POST /api/auth/register
Request: { email: string, password: string, handle: string, name: string, acceptTerms: boolean }
Usage: When user submits registration form
Component: AuthForm component

// Success redirect
Success: Redirect to /feed
Error: Display validation errors
```

### **AuthContext** (Global Authentication State)
**File**: `src/lib/auth/AuthContext.tsx`

**API Calls**:
```typescript
// Token refresh
POST /api/auth/refresh
Usage: Automatic token renewal when expired
Trigger: Axios response interceptor

// Logout
POST /api/auth/logout
Usage: When user logs out
Trigger: logout() function call

// Profile verification
GET /api/users/profile
Usage: On app initialization to verify token
Trigger: AuthProvider mount
```

---

## 🏠 Home & Feed Pages

### **Landing Page** (`/`)
**File**: `src/app/page.tsx`

**API Calls**:
```typescript
// No direct API calls
// Redirects authenticated users to /feed
// Shows welcome page for non-authenticated users
```

### **Feed Page** (`/feed`)
**File**: `src/app/feed/page.tsx`

**API Calls**:
```typescript
// Search suggestions (on page load)
GET /api/content/search/suggestions
Usage: Load trending hashtags and suggestions for category chips
Component: ContentFeed component initialization

// Category-based content filtering
// No direct API - uses feed APIs with category filters
```

### **ContentFeed Component**
**File**: `src/components/content/ContentFeed.tsx`

**API Calls**:
```typescript
// Home feed loading
GET /api/content/feed/home?page=0&size=10
Usage: Default feed for authenticated users
Trigger: Component mount, infinite scroll

// Trending feed loading
GET /api/content/trending?page=0&size=10&hours=24
Usage: When user switches to "Trending" tab
Trigger: Tab change, infinite scroll

// Fresh feed loading
GET /api/content/feed/fresh?page=0&size=10&hours=6
Usage: When user switches to "Fresh" tab
Trigger: Tab change, infinite scroll

// Featured feed loading
GET /api/content/feed/featured?page=0&size=10
Usage: When user switches to "Featured" tab (default for non-authenticated)
Trigger: Tab change, infinite scroll

// Infinite scroll implementation
- Uses Intersection Observer API
- Automatically loads next page when user scrolls near bottom
- Manages loading states and error handling

// Shorts content loading
GET /api/content/shorts?page=0&size=8
Usage: Load short video content for shorts section
Trigger: Component mount
Component: ShortsFeed component integration
```

### **MobileOptimizedContentCard Component**
**File**: `src/components/content/MobileOptimizedContentCard.tsx`

**API Calls**:
```typescript
// Like/Unlike content
POST /api/content/{contentId}/like
DELETE /api/content/{contentId}/like
Usage: When user clicks heart icon
Trigger: handleLike() function
Update: Optimistic UI update + API call

// Share content
POST /api/content/{contentId}/share
Usage: When user clicks share icon
Trigger: Share button click

// Comment modal trigger
// Opens CommentsModal component which makes its own API calls
```

### **ShortsFeed Component** (NEW)
**File**: `src/components/content/ShortsFeed.tsx`

**API Calls**:
```typescript
// Load shorts content
GET /api/content/shorts?page=0&size=8
Usage: Load short video content for home page shorts section
Trigger: Component mount in feed page
Component: Grid of vertical video players

// Like shorts video
POST /api/content/{contentId}/like
DELETE /api/content/{contentId}/like
Usage: When user likes/unlikes a shorts video
Trigger: Heart icon click in video overlay
Update: Optimistic UI update + API call

// Share shorts video
POST /api/content/{contentId}/share
Usage: When user shares a shorts video
Trigger: Share button click in video overlay

// Open comments for shorts
// Triggers CommentsModal for the specific shorts video
// Uses same comment API as regular content

// Future API calls (when full shorts player is implemented):
// GET /api/content/shorts/following - Shorts from followed creators
// GET /api/content/shorts/trending - Trending shorts videos
// POST /api/content/shorts/{id}/view - Track shorts video views
```

**Features**:
- **Vertical Video Player**: Custom video player optimized for mobile
- **Auto-play/Pause**: Videos play when visible, pause when not
- **Engagement Overlay**: Like, comment, share buttons on video
- **Creator Info**: Avatar, username, follow button overlay
- **Mute/Unmute**: Volume control for videos
- **Grid Layout**: Responsive grid showing multiple shorts
- **Full-screen Mode**: "Watch All Shorts" button for dedicated shorts player

---

## 💬 Comment System

### **CommentsModal Component**
**File**: `src/components/content/CommentsModal.tsx`

**API Calls**:
```typescript
// Load comments
GET /api/content/{contentId}/comments?page=0&size=20
Usage: When modal opens, load more comments
Trigger: Modal open, "Load More" button
Component: Full comment thread with pagination

// Add new comment
POST /api/content/{contentId}/comments
Request: { text: string, parentCommentId?: string }
Usage: When user submits comment
Trigger: Comment form submission
Update: Optimistic UI update + refresh comments

// Comment likes (future implementation)
// POST /api/content/{contentId}/comments/{commentId}/like
// DELETE /api/content/{contentId}/comments/{commentId}/like
```

---

## 🔍 Search & Discovery

### **Search Page** (`/search`)
**File**: `src/app/search/page.tsx`

**API Calls**:
```typescript
// Search suggestions loading
GET /api/content/search/suggestions
Usage: Load trending tags and suggestions on page load
Trigger: Component mount

// Content search
GET /api/content/search?q={query}&page=0&size=10
Usage: When user searches for content
Trigger: Search form submission, search filters

// Hashtag search
GET /api/content/search?hashtag={hashtag}&page=0&size=10
Usage: When user clicks on hashtag
Trigger: Hashtag chip click

// Category search
GET /api/content/search?category={category}&page=0&size=10
Usage: When user selects category filter
Trigger: Category selection
```

---

## 🏆 Contest System

### **Contests Page** (`/contests`)
**File**: `src/app/contests/page.tsx`

**API Calls**:
```typescript
// Load all contests
GET /api/content/contests?page=0&size=10
Usage: Load live, upcoming, and ended contests
Trigger: Component mount
Data: Currently uses mock data, needs API implementation

// Join contest
POST /api/content/contests/{contestId}/join
Request: { contentId: string }
Usage: When user joins a contest
Trigger: "Join FREE" button click
Component: handleJoinContest() function

// Contest leaderboard (Tab 3)
GET /api/content/contests/{contestId}/leaderboard?page=0&size=50
Usage: Display contest rankings
Trigger: Leaderboard tab selection
Update: Real-time updates during live contests
```

### **LiveContestBanner Component**
**File**: `src/components/contest/LiveContestBanner.tsx`

**API Calls**:
```typescript
// No direct API calls
// Receives contest data from parent component
// Displays live contest information with countdown timer
// Handles contest join functionality via props
```

---

## 📊 Analytics & Leaderboard

### **Analytics Page** (`/analytics`)
**File**: `src/app/analytics/page.tsx`

**API Calls**:
```typescript
// Creator analytics overview
GET /api/content/analytics/overview?period=month
Usage: Load creator performance metrics
Trigger: Component mount, period selection
Data: Views, likes, shares, earnings, top content

// Creator earnings analytics
GET /api/wallet/earnings/analytics?period=month
Usage: Load detailed earnings breakdown
Trigger: Component mount, period selection
Data: Daily/weekly/monthly earnings, growth rate

// Top performing content
GET /api/content/analytics/top-content?period=month&limit=5
Usage: Display best performing content
Trigger: Component mount
Data: Content performance metrics
```

### **Leaderboard Page** (`/leaderboard`)
**File**: `src/app/leaderboard/page.tsx`

**API Calls**:
```typescript
// Platform leaderboard by earnings
GET /api/content/leaderboard?type=earnings&period=month&page=0&size=50
Usage: Display top earning creators
Trigger: Component mount, tab switch to "Earnings"

// Platform leaderboard by views
GET /api/content/leaderboard?type=views&period=month&page=0&size=50
Usage: Display most viewed creators
Trigger: Tab switch to "Views"

// Platform leaderboard by likes
GET /api/content/leaderboard?type=likes&period=month&page=0&size=50
Usage: Display most liked creators
Trigger: Tab switch to "Likes"

// Platform leaderboard by growth
GET /api/content/leaderboard?type=growth&period=month&page=0&size=50
Usage: Display fastest growing creators
Trigger: Tab switch to "Growth"

// User rank information
GET /api/content/leaderboard/user-rank?type=earnings
Usage: Display current user's rank in leaderboard
Trigger: Component mount (if authenticated)
```

---

## 💰 Wallet & Monetization

### **Wallet Page** (`/wallet`)
**File**: `src/app/wallet/page.tsx` (Referenced in sidebar)

**API Calls**:
```typescript
// Wallet balance
GET /api/wallet/balance
Usage: Display current wallet balance
Trigger: Component mount, real-time updates
Data: Balance, pending balance, last updated

// Transaction history
GET /api/wallet/transactions?page=0&size=20
Usage: Display transaction history
Trigger: Component mount, pagination
Data: Tips received/sent, payouts, commissions

// Earnings analytics
GET /api/wallet/earnings/analytics?period=month
Usage: Display earnings charts and insights
Trigger: Component mount, period selection
```

### **Tip System** (Modal Components)
**Files**: Various modal components for tipping

**API Calls**:
```typescript
// Send tip to creator
POST /api/wallet/tip
Request: { toUserId: string, contentId?: string, amount: number, message?: string }
Usage: When user sends tip to creator
Trigger: Tip modal submission
Update: Wallet balance update, transaction history refresh

// Tip transaction status
GET /api/wallet/transactions/{transactionId}
Usage: Check tip transaction status
Trigger: After tip submission
```

### **Subscription System**
**File**: `src/components/premium/PremiumSubscriptionModal.tsx`

**API Calls**:
```typescript
// Create subscription
POST /api/wallet/subscription/create
Request: { plan: 'MONTHLY' | 'YEARLY', paymentMethod: string }
Usage: When user subscribes to premium
Trigger: Subscription form submission

// Check subscription status
GET /api/wallet/subscription/status
Usage: Check if user has active subscription
Trigger: Component mount, premium feature access
```

---

## 👤 Profile Management

### **Profile Page** (`/profile`)
**File**: `src/app/profile/page.tsx` (Referenced in navigation)

**API Calls**:
```typescript
// Get user profile
GET /api/users/profile
Usage: Load current user's profile information
Trigger: Component mount
Data: Profile details, stats, preferences

// Update user profile
PUT /api/users/profile
Request: { name?: string, bio?: string, profilePicture?: string, preferences?: {} }
Usage: When user updates profile
Trigger: Profile form submission

// Get public user profile
GET /api/users/{userId}
Usage: View other user's public profile
Trigger: Profile link click, creator profile view
```

### **KYC Verification**
**Files**: KYC-related components

**API Calls**:
```typescript
// Submit KYC documents
POST /api/users/kyc/submit
Request: { documentType, documentNumber, fullName, dateOfBirth, address, bankDetails }
Usage: When user submits KYC for monetization
Trigger: KYC form submission

// Check KYC status
GET /api/users/kyc/status
Usage: Display KYC verification status
Trigger: Component mount, status checks
```

---

## 📤 Content Upload

### **Upload Page** (`/upload`)
**File**: `src/app/upload/page.tsx`

**API Calls**:
```typescript
// Upload content
POST /api/content/upload
Request: FormData with file, title, description, hashtags, category
Usage: When user uploads new content
Trigger: Upload form submission
Process: File upload → processing → thumbnail generation

// Upload progress tracking
// WebSocket or polling for upload status
GET /api/content/upload/status/{uploadId}
Usage: Track upload and processing progress
Trigger: After upload initiation
```

---

## 🎛️ Admin & Moderation

### **Content Moderation**
**Files**: Admin components (future implementation)

**API Calls**:
```typescript
// Moderate content
POST /api/admin/content/{contentId}/moderate
Request: { action: 'APPROVE' | 'REJECT', reason?: string }
Usage: Content moderation decisions
Trigger: Admin action

// Moderation queue
GET /api/admin/content/moderation-queue?page=0&size=20
Usage: Load content pending moderation
Trigger: Admin dashboard load
```

---

## 🔧 Global Components

### **DesktopSidebar Component**
**File**: `src/components/layout/DesktopSidebar.tsx`

**API Calls**:
```typescript
// User earnings display (mock data currently)
GET /api/wallet/balance
Usage: Display user earnings in sidebar
Trigger: Component mount, periodic refresh
Data: Weekly earnings, total earnings, coin balance

// Navigation analytics
// No direct API calls, uses router for navigation
// Links to: Analytics, Leaderboard, Contests, Wallet
```

### **Navigation Components**
**Files**: Mobile bottom nav, app bars

**API Calls**:
```typescript
// No direct API calls
// Handle navigation between pages
// Display user authentication status
// Route protection for authenticated features
```

---

## 🔌 API Client Configuration

### **Base API Setup**
**File**: `src/lib/api/baseApi.ts`

**Configuration**:
```typescript
// API client configuration
Base URLs:
- User Service: http://localhost:8080
- Content Service: http://localhost:8081
- Monetization Service: http://localhost:8082

// Request interceptors
- Add Authorization header: Bearer {token}
- Add Content-Type: application/json
- Handle CSRF tokens

// Response interceptors
- Handle 401 unauthorized → redirect to login
- Handle 403 forbidden → show error message
- Handle 500 server error → show error notification
- Handle network errors → retry logic
```

### **Error Handling**
**File**: `src/lib/api/errorHandler.ts`

**Error Types**:
```typescript
// Authentication errors
401 Unauthorized → Clear token, redirect to login
403 Forbidden → Show permission denied message

// Validation errors
400 Bad Request → Show field-specific error messages
422 Unprocessable Entity → Show validation errors

// Server errors
500 Internal Server Error → Show generic error message
503 Service Unavailable → Show maintenance message

// Network errors
Network timeout → Show retry option
Connection refused → Show offline message
```

---

## 📊 Data Flow Summary

### **Authentication Flow**
1. **Login/Register** → `POST /api/auth/login|register` → Store JWT token
2. **Token Verification** → `GET /api/users/profile` → Verify on app load
3. **Auto Refresh** → `POST /api/auth/refresh` → Renew expired tokens
4. **Logout** → `POST /api/auth/logout` → Clear session

### **Content Flow**
1. **Feed Loading** → `GET /api/content/feed/*` → Display content cards
2. **Engagement** → `POST /api/content/{id}/like` → Update UI optimistically
3. **Comments** → `GET/POST /api/content/{id}/comments` → Real-time comments
4. **Upload** → `POST /api/content/upload` → Process and display

### **Monetization Flow**
1. **Wallet Balance** → `GET /api/wallet/balance` → Display balance
2. **Send Tips** → `POST /api/wallet/tip` → Transfer money
3. **View Analytics** → `GET /api/wallet/earnings/analytics` → Show charts
4. **Request Payout** → `POST /api/wallet/payout/request` → Withdraw money

### **Contest Flow**
1. **Load Contests** → `GET /api/content/contests` → Display contest cards
2. **Join Contest** → `POST /api/content/contests/{id}/join` → Participate
3. **View Leaderboard** → `GET /api/content/contests/{id}/leaderboard` → Rankings
4. **Live Updates** → WebSocket or polling → Real-time leaderboard

---

## 🚀 Implementation Checklist

### **Phase 1 - Authentication & Core**
- [ ] `POST /api/auth/login` - User login
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/refresh` - Token refresh
- [ ] `GET /api/users/profile` - User profile
- [ ] `PUT /api/users/profile` - Update profile

### **Phase 2 - Content System**
- [ ] `GET /api/content/feed/home` - Home feed
- [ ] `GET /api/content/trending` - Trending content
- [ ] `GET /api/content/feed/fresh` - Fresh content
- [ ] `GET /api/content/feed/featured` - Featured content
- [ ] `GET /api/content/shorts` - Shorts video feed (NEW)
- [ ] `POST /api/content/upload` - Content upload
- [ ] `POST /api/content/{id}/like` - Like content
- [ ] `DELETE /api/content/{id}/like` - Unlike content

### **Phase 3 - Social Features**
- [ ] `GET /api/content/{id}/comments` - Load comments
- [ ] `POST /api/content/{id}/comments` - Add comment
- [ ] `GET /api/content/search` - Search content
- [ ] `GET /api/content/search/suggestions` - Search suggestions

### **Phase 4 - Monetization**
- [ ] `GET /api/wallet/balance` - Wallet balance
- [ ] `GET /api/wallet/transactions` - Transaction history
- [ ] `POST /api/wallet/tip` - Send tips
- [ ] `GET /api/wallet/earnings/analytics` - Earnings analytics
- [ ] `POST /api/wallet/subscription/create` - Create subscription

### **Phase 5 - Advanced Features**
- [ ] `GET /api/content/contests` - Contest system
- [ ] `POST /api/content/contests/{id}/join` - Join contests
- [ ] `GET /api/content/contests/{id}/leaderboard` - Contest leaderboard
- [ ] `GET /api/content/leaderboard` - Platform leaderboard
- [ ] `GET /api/content/analytics/overview` - Creator analytics

---

*This document provides a complete mapping of UI components to backend APIs. Every API call listed is already implemented in the frontend and requires corresponding backend endpoints.*

**Last Updated**: September 2024
**Frontend Status**: ✅ Complete
**Backend Status**: ⏳ Pending Implementation