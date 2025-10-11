# Backend API Requirements for Meme-to-Money UI

## 📋 Overview

This document outlines all the backend APIs required to support the current UI implementation. The frontend is already built and integrated with API calls - the backend services need to implement these endpoints to make the platform fully functional.

---

## 🏗️ Service Architecture

The UI expects the following microservices:

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

### **API Proxy Configuration (Already Set Up)**
```javascript
// next.config.js - API Routes
/api/auth/*     → USER_SERVICE_URL (Port 8080)
/api/users/*    → USER_SERVICE_URL (Port 8080)
/api/content/*  → CONTENT_SERVICE_URL (Port 8081)
/api/wallet/*   → MONETIZATION_SERVICE_URL (Port 8082)
```

---

## 🔐 User Service API (Port 8080)

### **Authentication Endpoints**

#### **POST /auth/login**
```typescript
Request Body:
{
  email: string;
  password: string;
}

Response:
{
  status: number;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      handle: string;
      name: string;
      isVerified: boolean;
      role: 'USER' | 'CREATOR' | 'ADMIN';
      profilePicture?: string;
      bio?: string;
      createdAt: string;
    };
    token: string;
    refreshToken: string;
  }
}
```

#### **POST /auth/register**
```typescript
Request Body:
{
  email: string;
  password: string;
  handle: string;
  name: string;
  acceptTerms: boolean;
}

Response: Same as login
```

#### **POST /auth/logout**
```typescript
Headers: Authorization: Bearer <token>
Response:
{
  status: number;
  message: string;
}
```

#### **POST /auth/refresh**
```typescript
Request Body:
{
  refreshToken: string;
}

Response:
{
  status: number;
  message: string;
  data: {
    token: string;
    refreshToken: string;
  }
}
```

#### **POST /auth/forgot-password**
```typescript
Request Body:
{
  email: string;
}

Response:
{
  status: number;
  message: string;
}
```

#### **POST /auth/reset-password**
```typescript
Request Body:
{
  token: string;
  newPassword: string;
}

Response:
{
  status: number;
  message: string;
}
```

### **User Profile Endpoints**

#### **GET /users/profile**
```typescript
Headers: Authorization: Bearer <token>
Response:
{
  status: number;
  message: string;
  data: {
    id: string;
    email: string;
    handle: string;
    name: string;
    bio?: string;
    profilePicture?: string;
    isVerified: boolean;
    role: string;
    stats: {
      totalContent: number;
      totalFollowers: number;
      totalFollowing: number;
      totalEarnings: number;
      joinedAt: string;
    };
    preferences: {
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
      privacy: 'public' | 'private';
    };
  }
}
```

#### **PUT /users/profile**
```typescript
Headers: Authorization: Bearer <token>
Request Body:
{
  name?: string;
  bio?: string;
  profilePicture?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    privacy?: 'public' | 'private';
  };
}

Response: Same as GET /users/profile
```

#### **GET /users/{userId}**
```typescript
Path Params: userId: string
Response: Same as GET /users/profile (public fields only)
```

### **KYC Verification Endpoints**

#### **POST /users/kyc/submit**
```typescript
Headers: Authorization: Bearer <token>
Request Body:
{
  documentType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE';
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

Response:
{
  status: number;
  message: string;
  data: {
    kycId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
  }
}
```

#### **GET /users/kyc/status**
```typescript
Headers: Authorization: Bearer <token>
Response:
{
  status: number;
  message: string;
  data: {
    kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt?: string;
    approvedAt?: string;
    rejectionReason?: string;
  }
}
```

---

## 📱 Content Service API (Port 8081)

### **Content Feed Endpoints**

#### **GET /content/feed/home**
```typescript
Query Params:
- page: number (default: 0)
- size: number (default: 10)

Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    content: {
      content: Content[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
    userEngagements?: Record<string, UserEngagementStatus>;
    metadata: {
      authenticated: boolean;
      userId?: string;
      feedType: 'home';
      timestamp: number;
    };
  }
}

// Content Interface
interface Content {
  id: string;
  title: string;
  description: string;
  type: 'IMAGE' | 'SHORT_VIDEO';
  creatorId: string;
  creatorHandle: string;
  thumbnailUrl: string;
  processedFile?: {
    s3Key: string;
    url: string;
    size: number;
    format: string;
  };
  originalFile?: {
    s3Key: string;
    url: string;
    size: number;
    format: string;
  };
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface UserEngagementStatus {
  liked: boolean;
  bookmarked: boolean;
  shared: boolean;
  commented: boolean;
}
```

#### **GET /content/trending**
```typescript
Query Params:
- page: number (default: 0)
- size: number (default: 10)
- hours: number (default: 24) // Trending window

Response: Same as home feed
```

#### **GET /content/feed/fresh**
```typescript
Query Params:
- page: number (default: 0)
- size: number (default: 10)
- hours: number (default: 6) // Fresh content window

Response: Same as home feed
```

#### **GET /content/feed/featured**
```typescript
Query Params:
- page: number (default: 0)
- size: number (default: 10)

Response: Same as home feed
```

#### **GET /content/shorts**
```typescript
Query Params:
- page: number (default: 0)
- size: number (default: 8)
- category?: string // Optional filter by category

Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    content: {
      content: Content[]; // Only SHORT_VIDEO type
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
    userEngagements?: Record<string, UserEngagementStatus>;
    metadata: {
      authenticated: boolean;
      userId?: string;
      feedType: 'shorts';
      timestamp: number;
    };
  }
}

// Note: This endpoint should only return content where type === 'SHORT_VIDEO'
// Videos should be optimized for vertical mobile viewing (9:16 or 3:4 aspect ratio)
```

### **Content Management Endpoints**

#### **POST /content/upload**
```typescript
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: File (image or video)
- title: string
- description: string
- hashtags: string[] (JSON array)
- category: string
- isPrivate: boolean (default: false)

Response:
{
  status: number;
  message: string;
  data: {
    contentId: string;
    uploadStatus: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    processingUrl?: string;
    estimatedTime?: number; // seconds
  }
}
```

#### **GET /content/{contentId}**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    content: Content;
    userEngagement?: UserEngagementStatus;
    analytics?: {
      viewsToday: number;
      likesToday: number;
      sharesTotal: number;
      commentsTotal: number;
    };
    metadata: {
      authenticated: boolean;
      userId?: string;
      canEdit: boolean;
      canDelete: boolean;
      canComment: boolean;
      timestamp: number;
    };
  }
}
```

#### **DELETE /content/{contentId}**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token>

Response:
{
  status: number;
  message: string;
}
```

### **Content Engagement Endpoints**

#### **POST /content/{contentId}/like**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token>

Response:
{
  status: number;
  message: string;
  data: {
    liked: boolean;
    likeCount: number;
  }
}
```

#### **DELETE /content/{contentId}/like**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token>

Response: Same as POST like
```

#### **POST /content/{contentId}/share**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token>

Response:
{
  status: number;
  message: string;
  data: {
    shareCount: number;
    shareUrl: string;
  }
}
```

### **Comment System Endpoints**

#### **GET /content/{contentId}/comments**
```typescript
Path Params: contentId: string
Query Params:
- page: number (default: 0)
- size: number (default: 20)

Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    comments: {
      content: Comment[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
    contentId: string;
    totalComments: number;
    metadata: {
      authenticated: boolean;
      userId?: string;
      canComment: boolean;
      timestamp: number;
    };
  }
}

interface Comment {
  id: string;
  contentId: string;
  userId: string;
  username: string;
  userHandle: string;
  text: string;
  parentCommentId?: string;
  likeCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  reply: boolean;
}
```

#### **POST /content/{contentId}/comments**
```typescript
Path Params: contentId: string
Headers: Authorization: Bearer <token>

Request Body:
{
  text: string;
  parentCommentId?: string; // For replies
}

Response:
{
  status: number;
  message: string;
  data: Comment;
}
```

### **Search Endpoints**

#### **GET /content/search**
```typescript
Query Params:
- q: string // Search query
- category?: string
- contentType?: 'IMAGE' | 'SHORT_VIDEO'
- hashtag?: string
- sortBy?: 'RELEVANCE' | 'DATE' | 'POPULARITY'
- page: number (default: 0)
- size: number (default: 10)

Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    results: {
      content: Content[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
    query: string;
    suggestions?: string[];
    relatedHashtags?: string[];
    metadata: {
      authenticated: boolean;
      userId?: string;
      searchTime: number;
      timestamp: number;
    };
  }
}
```

#### **GET /content/search/suggestions**
```typescript
Response:
{
  status: number;
  message: string;
  data: {
    trending: string[];
    popular: string[];
    trendingHashtags: string[];
    categories: string[];
  }
}
```

---

## 💰 Monetization Service API (Port 8082)

### **Wallet Management Endpoints**

#### **GET /wallet/balance**
```typescript
Headers: Authorization: Bearer <token>

Response:
{
  status: number;
  message: string;
  data: {
    balance: number;
    currency: 'INR';
    pendingBalance: number;
    lastUpdated: string;
    walletId: string;
  }
}
```

#### **GET /wallet/transactions**
```typescript
Headers: Authorization: Bearer <token>
Query Params:
- page: number (default: 0)
- size: number (default: 20)
- type?: 'TIP_RECEIVED' | 'TIP_SENT' | 'PAYOUT' | 'SUBSCRIPTION' | 'COMMISSION'
- startDate?: string (ISO date)
- endDate?: string (ISO date)

Response:
{
  status: number;
  message: string;
  data: {
    transactions: {
      content: Transaction[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
    summary: {
      totalIncome: number;
      totalExpense: number;
      thisMonthIncome: number;
      thisWeekIncome: number;
    };
  }
}

interface Transaction {
  id: string;
  type: 'TIP_RECEIVED' | 'TIP_SENT' | 'PAYOUT' | 'SUBSCRIPTION' | 'COMMISSION';
  amount: number;
  currency: 'INR';
  description: string;
  fromUserId?: string;
  toUserId?: string;
  contentId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  platformFee: number;
  netAmount: number;
  createdAt: string;
  completedAt?: string;
}
```

### **Tip System Endpoints**

#### **POST /wallet/tip**
```typescript
Headers: Authorization: Bearer <token>

Request Body:
{
  toUserId: string;
  contentId?: string;
  amount: number;
  message?: string;
}

Response:
{
  status: number;
  message: string;
  data: {
    transactionId: string;
    amount: number;
    platformFee: number; // 10%
    netAmount: number; // 90% to creator
    recipientUsername: string;
    status: 'COMPLETED' | 'PENDING';
  }
}
```

### **Earnings Analytics Endpoints**

#### **GET /wallet/earnings/analytics**
```typescript
Headers: Authorization: Bearer <token>
Query Params:
- period: 'day' | 'week' | 'month' | 'year' | 'all'
- startDate?: string (ISO date)
- endDate?: string (ISO date)

Response:
{
  status: number;
  message: string;
  data: {
    totalEarnings: number;
    periodEarnings: number;
    growthRate: number; // percentage
    breakdown: {
      tips: number;
      subscriptions: number;
      contests: number;
      brandPartnerships: number;
    };
    dailyData: {
      date: string;
      earnings: number;
      tips: number;
    }[];
    topContent: {
      contentId: string;
      title: string;
      earnings: number;
      views: number;
    }[];
  }
}
```

### **Payout Endpoints**

#### **POST /wallet/payout/request**
```typescript
Headers: Authorization: Bearer <token>

Request Body:
{
  amount: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

Response:
{
  status: number;
  message: string;
  data: {
    payoutId: string;
    amount: number;
    processingFee: number;
    netAmount: number;
    estimatedArrival: string; // Date
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  }
}
```

#### **GET /wallet/payout/history**
```typescript
Headers: Authorization: Bearer <token>
Query Params:
- page: number (default: 0)
- size: number (default: 10)

Response:
{
  status: number;
  message: string;
  data: {
    payouts: {
      content: Payout[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    };
  }
}

interface Payout {
  id: string;
  amount: number;
  processingFee: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankDetails: {
    accountNumber: string; // Masked
    bankName: string;
  };
  requestedAt: string;
  completedAt?: string;
  failureReason?: string;
}
```

### **Subscription Endpoints**

#### **POST /wallet/subscription/create**
```typescript
Headers: Authorization: Bearer <token>

Request Body:
{
  plan: 'MONTHLY' | 'YEARLY';
  paymentMethod: 'UPI' | 'CARD' | 'WALLET';
}

Response:
{
  status: number;
  message: string;
  data: {
    subscriptionId: string;
    plan: 'MONTHLY' | 'YEARLY';
    amount: number; // 99 for monthly, 999 for yearly
    status: 'ACTIVE' | 'PENDING';
    startDate: string;
    endDate: string;
    paymentUrl?: string; // For payment gateway
  }
}
```

#### **GET /wallet/subscription/status**
```typescript
Headers: Authorization: Bearer <token>

Response:
{
  status: number;
  message: string;
  data: {
    isSubscribed: boolean;
    subscription?: {
      id: string;
      plan: 'MONTHLY' | 'YEARLY';
      status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
      startDate: string;
      endDate: string;
      autoRenew: boolean;
      features: string[];
    };
  }
}
```

---

## 🏆 Contest System APIs

### **Contest Endpoints**

#### **GET /content/contests**
```typescript
Query Params:
- status?: 'LIVE' | 'UPCOMING' | 'ENDED'
- page: number (default: 0)
- size: number (default: 10)

Response:
{
  status: number;
  message: string;
  data: {
    contests: Contest[];
    liveCount: number;
    upcomingCount: number;
  }
}

interface Contest {
  id: string;
  title: string;
  description: string;
  participants: number;
  timeRemaining: number; // seconds
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
  category: string;
  icon: string;
  entryFee: 'FREE';
  startTime: string;
  endTime: string;
  rewards: {
    type: 'MERCHANDISE' | 'RECOGNITION' | 'FEATURES' | 'BRAND_COLLAB';
    description: string;
    sponsor?: string;
  }[];
  sponsor?: {
    name: string;
    logo: string;
  };
  rules: string[];
  eligibility: string[];
}
```

#### **POST /content/contests/{contestId}/join**
```typescript
Path Params: contestId: string
Headers: Authorization: Bearer <token>

Request Body:
{
  contentId: string; // User's contest entry
}

Response:
{
  status: number;
  message: string;
  data: {
    participationId: string;
    contestId: string;
    contentId: string;
    submittedAt: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  }
}
```

#### **GET /content/contests/{contestId}/leaderboard**
```typescript
Path Params: contestId: string
Query Params:
- page: number (default: 0)
- size: number (default: 50)

Response:
{
  status: number;
  message: string;
  data: {
    leaderboard: LeaderboardEntry[];
    contestInfo: {
      title: string;
      status: string;
      totalParticipants: number;
      timeRemaining: number;
    };
    userRank?: number;
  }
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  userHandle: string;
  avatar?: string;
  votes: number;
  points: number;
  contentId: string;
  contentTitle: string;
  contentThumbnail: string;
  rewards?: string[];
}
```

---

## 📊 Analytics APIs

### **Creator Analytics Endpoints**

#### **GET /content/analytics/overview**
```typescript
Headers: Authorization: Bearer <token>
Query Params:
- period: 'day' | 'week' | 'month' | 'year'

Response:
{
  status: number;
  message: string;
  data: {
    overview: {
      totalViews: number;
      totalLikes: number;
      totalShares: number;
      totalComments: number;
      growthRate: number;
      engagementRate: number;
    };
    topContent: {
      id: string;
      title: string;
      views: number;
      likes: number;
      engagement: number;
      earnings: number;
      thumbnail: string;
    }[];
    performance: {
      date: string;
      views: number;
      likes: number;
      shares: number;
      comments: number;
    }[];
    insights: {
      bestPostingTime: string;
      topHashtags: string[];
      audienceGrowth: number;
      avgEngagementRate: number;
    };
  }
}
```

### **Platform Leaderboard Endpoints**

#### **GET /content/leaderboard**
```typescript
Query Params:
- type: 'earnings' | 'views' | 'likes' | 'growth'
- period: 'week' | 'month' | 'year' | 'all'
- page: number (default: 0)
- size: number (default: 50)

Headers: Authorization: Bearer <token> (optional)

Response:
{
  status: number;
  message: string;
  data: {
    leaderboard: CreatorLeaderboardEntry[];
    userRank?: number;
    metadata: {
      type: string;
      period: string;
      totalCreators: number;
      lastUpdated: string;
    };
  }
}

interface CreatorLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  userHandle: string;
  avatar?: string;
  totalEarnings: number;
  totalViews: number;
  totalLikes: number;
  followers: number;
  growthRate: number;
  isVerified: boolean;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  badge?: string;
}
```

---

## 🔧 Technical Requirements

### **Authentication & Security**
- **JWT Tokens**: HS256 algorithm, 24-hour expiry
- **Refresh Tokens**: 30-day expiry, stored securely
- **Rate Limiting**: Implement rate limits for all endpoints
- **CORS**: Configure for UI domain
- **Input Validation**: Validate all request payloads
- **SQL Injection Protection**: Use parameterized queries

### **File Upload Requirements**
- **Max File Size**: Images (10MB), Videos (100MB)
- **Supported Formats**:
  - Images: JPEG, PNG, WebP
  - Videos: MP4, WebM, MOV
- **Processing**: Automatic thumbnail generation for videos
- **Storage**: AWS S3 or compatible object storage
- **CDN**: CloudFront or similar for global delivery

### **Database Schema Requirements**
- **Users Table**: id, email, handle, name, password_hash, etc.
- **Content Table**: id, creator_id, title, description, file_urls, etc.
- **Comments Table**: id, content_id, user_id, text, parent_id, etc.
- **Likes Table**: id, content_id, user_id, created_at
- **Transactions Table**: id, from_user, to_user, amount, type, etc.
- **Contests Table**: id, title, description, start_time, end_time, etc.

### **Performance Requirements**
- **Response Time**: < 200ms for API calls
- **Throughput**: Support 1000+ concurrent users
- **Caching**: Implement Redis caching for frequently accessed data
- **Database Indexing**: Proper indexes on query columns
- **Connection Pooling**: Database connection pooling

### **Monitoring & Logging**
- **API Logging**: Log all requests/responses
- **Error Tracking**: Implement error monitoring (Sentry)
- **Performance Monitoring**: Track API response times
- **Health Checks**: Implement health check endpoints
- **Metrics**: Expose Prometheus metrics

### **Environment Variables Required**
```bash
# Database
DATABASE_URL=mongodb://localhost:27017/memetomoney
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-south-1

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# External APIs
CONTENT_MODERATION_API_KEY=your-moderation-key
```

---

## 🚀 Implementation Priority

### **Phase 1 - Core Functionality (Week 1-2)**
1. User authentication and profile management
2. Basic content upload and feed APIs
3. Content engagement (likes, comments)
4. Basic wallet and transaction APIs

### **Phase 2 - Social Features (Week 3-4)**
5. Advanced search and discovery
6. Comment system with threading
7. Tip system implementation
8. User following/followers

### **Phase 3 - Monetization (Week 5-6)**
9. Subscription system
10. Payout management
11. Analytics and reporting
12. Creator dashboard APIs

### **Phase 4 - Advanced Features (Week 7-8)**
13. Contest system
14. Leaderboard APIs
15. Advanced analytics
16. Admin moderation tools

---

*This document serves as the complete API specification for backend development. All endpoints listed are already integrated in the UI and require implementation to make the platform fully functional.*

**Last Updated**: September 2024
**UI Version**: 1.0
**Backend Version**: To be implemented