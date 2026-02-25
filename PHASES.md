# Meme-to-Money UI - Phase-Wise Implementation Documentation

## Service Overview

The meme-to-money-ui is the frontend single-page application for the Meme-to-Money platform. Built with Next.js 14 and TypeScript, it provides the complete user-facing experience including authentication, content feed, messaging, notifications, and creator tools.

**Technology**: Next.js 14, TypeScript, React 18, Material-UI (MUI) 5, Axios
**Port**: 3000 (development)
**Deployment**: Vercel / Static Export

---

## Phase 5: UI Foundation

### What Was Implemented

This phase built the entire frontend application from scratch, integrating with all backend microservices.

#### 5.1 Project Setup & Configuration

**Next.js 14 App Router**:
- TypeScript configuration with strict mode
- App Router directory structure (`src/app/`)
- Server-side rendering with client-side hydration
- Environment-based API URL configuration

**Material-UI Theme** (`src/components/ThemeRegistry/theme.ts`):
```
Palette:
  Primary:      #8B5CF6 (Violet), light: #A78BFA, dark: #7C3AED
  Secondary:    #EC4899 (Pink), light: #F472B6, dark: #DB2777
  Background:   #0f1117 (default), #1f2937 (paper)
  Text:         #F9FAFB (primary), #9CA3AF (secondary)
  Divider:      rgba(255, 255, 255, 0.08)

Typography: Inter font, weights 300-700
Shape:      12px border radius
Components: Buttons 12px radius, Cards 16px radius, no background images
```

**ThemeRegistry** (`src/components/ThemeRegistry/ThemeRegistry.tsx`):
- MUI ThemeProvider with Emotion cache
- Server-side rendering support for CSS-in-JS

#### 5.2 API Client Architecture

**API Client** (`src/lib/api/client.ts`):

**Environment Detection**:
- `NEXT_PUBLIC_API_ENV=production` or `NODE_ENV=production` -> Cloud Run URLs
- Otherwise -> localhost URLs
- Individual overrides via `NEXT_PUBLIC_*_SERVICE_URL` env vars

**Service URLs (Production)**:
| Service | URL |
|---------|-----|
| Auth | `https://auth-service-703108401175.asia-south2.run.app` |
| Content | `https://content-service-703108401175.asia-south2.run.app` |
| Messaging | `https://messaging-service-703108401175.asia-south2.run.app` |
| Notification | `https://notification-service-703108401175.asia-south2.run.app` |

**Service URLs (Development)**:
| Service | URL |
|---------|-----|
| Auth | `http://localhost:8080` |
| Content | `http://localhost:8081` |
| Messaging | `http://localhost:8082` |
| Notification | `http://localhost:8083` |

**Axios Instances**: Separate instance per service with:
- 30-second timeout
- Request interceptor: Injects JWT Bearer token from localStorage
- Response interceptor: On 401, clears token and redirects to login

**Type Definitions**:
- `ApiResponse<T>` - Standard response: { status, message, data }
- `User` - Full user interface with all profile fields
- `Post` - Content post interface

**Utility Functions**:
- `TokenManager` - localStorage token management (get, set, remove, getAuthHeaders)
- `handleApiResponse<T>` - Wraps Axios calls with error handling
- `isApiSuccess<T>` - Type guard for successful responses
- `parseJavaDate(dateValue)` - Handles Java LocalDateTime array format [year, month, day, hour, min, sec, nano]
- `formatTimeAgo(dateValue)` - Relative time strings (now, 5m, 2h, 3d, 1w)
- `formatCreatorHandle(handle, fallback)` - Strips @, handles raw userIds
- `getHandleInitial(handle)` - First letter for avatars

**API Modules**:

| Module | File | Methods |
|--------|------|---------|
| AuthAPI | `src/lib/api/auth.ts` | login, register, googleAuth, getCurrentUser, updateProfile, uploadProfilePicture, logout |
| ContentAPI | `src/lib/api/content.ts` | getUploadUrl, uploadFile, createContent, getContent, getHomeFeed, getTrendingFeed, getFreshFeed, getUserContent, getUserLikedContent, recordEngagement, recordView, getComments, addComment, deleteComment, getCommentReplies, likeComment, unlikeComment, searchContent, getSearchSuggestions, getCategoryStats, getBulkEngagementStatus, savePost, unsavePost, getSavedPosts, isPostSaved |
| UserAPI | `src/lib/api/user.ts` | followUser, unfollowUser, getUserProfile, getFollowStatus, getFollowers, getFollowing, searchUsers, getSuggestions, getMutualFollowers, blockUser, unblockUser |
| MessagingAPI | `src/lib/api/messaging.ts` | getConversations, getConversation, createDirectConversation, createGroupConversation, getMessages, sendMessage, markAsRead |
| NotificationAPI | `src/lib/api/notifications.ts` | getNotifications, markAsRead, markAllAsRead |

**Firebase Integration**:
- `src/lib/firebase-config.ts` - Firebase app initialization
- `src/lib/google-auth.ts` - Google sign-in with Firebase

#### 5.3 Authentication System

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Global state: user (User | null), loading (boolean), isAuthenticated
- On mount: checks localStorage for token, validates via `getCurrentUser()`
- `login(email, password)`: Calls AuthAPI.login, stores token, fetches full profile
- `logout()`: Clears token and user state
- `updateUser(userData)`: Updates local user state
- `updateProfile(profileData)`: Calls API and updates state

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`):
- Wraps authenticated-only pages
- Shows loading spinner during auth check
- Redirects to `/auth/login` if not authenticated

**Login Page** (`src/app/auth/login/page.tsx`):
- Email + password form
- Error handling with user feedback
- Google sign-in button
- Link to registration
- Redirects to `/feed` on success

**Register Page** (`src/app/auth/register/page.tsx`):
- Full registration form: name, email, mobile, password, confirm password
- Field validation
- Link to login

#### 5.4 Layout & Navigation

**Root Layout** (`src/app/layout.tsx`):
- ThemeRegistry provider (MUI theme)
- AuthProvider (authentication context)
- Root HTML with metadata

**MainLayout** (`src/components/layout/MainLayout.tsx`):
- Responsive container: sidebar (desktop) + bottom nav (mobile)
- Content area with proper padding

**BottomNavigation** (`src/components/layout/BottomNavigation.tsx`):
- Fixed bottom bar with 5 items:
  1. Home (/feed) - HomeIcon
  2. Shorts (/shorts) - PlayArrowIcon
  3. Create (center) - FloatingActionButton with gradient
  4. Search (/search) - SearchIcon
  5. Profile (/profile) - PersonIcon
- Center FAB: Purple gradient (#6B46C1 -> #9333EA), 56px, elevated
- Hidden on: /auth/*, /landing, /onboarding
- Active state: purple (#6B46C1)
- Safe area padding for iOS notch

**SidebarNavigation** (`src/components/layout/SidebarNavigation.tsx`):
- Desktop-only sidebar with full navigation links
- User profile preview at top

**Sidebar** (`src/components/layout/Sidebar.tsx`):
- Alternative sidebar component

**MobileLayout** (`src/components/layout/MobileLayout.tsx`):
- Mobile-specific layout wrapper

#### 5.5 Pages

**Feed Page** (`src/app/feed/page.tsx`):
- Main content feed with infinite scroll
- Uses ContentAPI.getHomeFeed with pagination
- FeedPostCard for each content item
- Pull-to-refresh capability
- Tab switcher for feed types (Following, Trending, Fresh)

**Shorts Page** (`src/app/shorts/page.tsx`):
- Full-screen vertical video player
- Swipe up/down navigation between videos
- Overlay UI: creator avatar, handle, description
- Engagement buttons: like (with count), comment, share
- Auto-play on visible, pause when swiped away
- Sound toggle
- Fetches SHORT_VIDEO type content from API

**Upload Page** (`src/app/upload/page.tsx`):
- Step 1: Select file (image or video)
- Step 2: Add metadata (title, description, type, category)
- Step 3: Add tags and hashtags
- Step 4: Review and publish
- Uses ContentAPI.uploadFile + ContentAPI.createContent
- Progress indicator during upload
- Support for MEME (image) and SHORT_VIDEO types

**Profile Page** (`src/app/profile/page.tsx`):
- Current user's own profile
- Profile header: avatar, name, handle, bio
- Stats bar: posts, followers, following
- Edit profile button -> /profile/edit
- Content grid showing user's posts
- Tab navigation: Posts, Liked, Saved

**Other User Profile** (`src/app/profile/[userId]/page.tsx`):
- Any user's public profile
- Follow/Unfollow button (toggles based on follow status)
- Profile header with stats
- Content grid
- Uses UserAPI.getUserProfile + UserAPI.getFollowStatus

**Followers Page** (`src/app/profile/[userId]/followers/page.tsx`):
- Paginated list of user's followers
- Each item: avatar, name, handle, follow button
- Uses UserAPI.getFollowers

**Following Page** (`src/app/profile/[userId]/following/page.tsx`):
- Paginated list of users being followed
- Each item: avatar, name, handle, unfollow button
- Uses UserAPI.getFollowing

**Profile Edit Page** (`src/app/profile/edit/page.tsx`):
- Full profile editing form
- Fields: displayName, username, bio, website, social links
- Profile picture upload with preview
- Character counts for bio
- Uses AuthAPI.updateProfile

**Search Page** (`src/app/search/page.tsx`):
- Search bar with debounced input
- Tab: Users (UserAPI.searchUsers) and Content (ContentAPI.searchContent)
- Category cards for browsing
- Recent searches

**Trending Page** (`src/app/trending/page.tsx`):
- Trending content display
- Time range selector

**Messages Page** (`src/app/messages/page.tsx`):
- Split view: conversation list (left) + chat window (right)
- Conversation list: avatar, name, last message, timestamp, unread badge
- Search conversations
- New conversation button
- Uses MessagingAPI.getConversations
- Polling: conversation list every 10 seconds

**Notifications Page** (`src/app/notifications/page.tsx`):
- Notification list grouped by date (Today, This Week, Earlier)
- Type icons: FOLLOW (person), LIKE (heart), COMMENT (bubble)
- Tap to mark as read
- "Mark all as read" button
- Follow-back button on follow notifications
- Uses NotificationAPI.getNotifications

**Wallet Page** (`src/app/wallet/page.tsx`):
- Meme Coin balance display (prominent number)
- KYC status card with current state
- KYC submission flow for NOT_SUBMITTED users
- Earnings breakdown: total, weekly
- Payout request button (only when KYC VERIFIED)

**Dashboard Page** (`src/app/dashboard/page.tsx`):
- Creator analytics dashboard
- Content performance overview
- Engagement metrics (views, likes, shares, comments)
- Earnings summary

**Settings Page** (`src/app/settings/page.tsx`):
- Account settings and preferences

**Onboarding Page** (`src/app/onboarding/page.tsx`):
- New user onboarding flow
- Profile completion steps

**Landing Page** (`src/app/landing/page.tsx`):
- Public marketing/landing page

**Home Page** (`src/app/page.tsx`):
- Root redirect (to feed or landing based on auth state)

#### 5.6 Shared Components

**FeedPostCard** (`src/components/FeedPostCard.tsx`):
- Content card for feed display
- Creator info: avatar, handle, timestamp
- Content: image or video with proper aspect ratio
- Engagement bar: like (toggle), comment (count), share, save/bookmark
- Like animation
- Connects to ContentAPI for engagement actions

**PostDetailModal** (`src/components/PostDetailModal.tsx`):
- Full-screen content detail view
- Large media display
- Full engagement bar
- Comment section
- Creator info

**CommentDialog** (`src/components/content/CommentDialog.tsx`):
- Bottom sheet / dialog for comments
- Comment list with avatars, timestamps
- Reply threading
- Comment input with auto-resize
- Like/unlike comments
- Delete own comments
- Connects to ContentAPI.getComments, addComment, deleteComment

**ShareDialog** (`src/components/ShareDialog.tsx`):
- Share options bottom sheet
- Copy link
- Share to social platforms (Web Share API when available)
- Share via DM

**ChatWindow** (`src/components/chat/ChatWindow.tsx`):
- Chat message display
- Message bubbles: sent (right, colored) vs received (left, gray)
- Message timestamps
- Auto-scroll to bottom on new messages
- Text input with send button
- Polling: messages every 3 seconds when chat is open
- Uses MessagingAPI.getMessages, sendMessage

### Key Files Summary

| Category | File | Purpose |
|----------|------|---------|
| **Config** | `src/app/layout.tsx` | Root layout with providers |
| **Config** | `src/components/ThemeRegistry/theme.ts` | MUI dark theme |
| **Config** | `src/lib/api/client.ts` | API clients + utilities |
| **Auth** | `src/contexts/AuthContext.tsx` | Auth state management |
| **Auth** | `src/components/ProtectedRoute.tsx` | Route protection |
| **Auth** | `src/lib/firebase-config.ts` | Firebase setup |
| **Auth** | `src/lib/google-auth.ts` | Google sign-in |
| **Layout** | `src/components/layout/BottomNavigation.tsx` | Mobile bottom nav |
| **Layout** | `src/components/layout/MainLayout.tsx` | Responsive layout |
| **Layout** | `src/components/layout/SidebarNavigation.tsx` | Desktop sidebar |
| **API** | `src/lib/api/auth.ts` | Auth API |
| **API** | `src/lib/api/content.ts` | Content API |
| **API** | `src/lib/api/user.ts` | User/social API |
| **API** | `src/lib/api/messaging.ts` | Messaging API |
| **API** | `src/lib/api/notifications.ts` | Notifications API |
| **Pages** | `src/app/feed/page.tsx` | Main content feed |
| **Pages** | `src/app/shorts/page.tsx` | Vertical video player |
| **Pages** | `src/app/upload/page.tsx` | Content upload |
| **Pages** | `src/app/profile/page.tsx` | Own profile |
| **Pages** | `src/app/profile/[userId]/page.tsx` | Other user profile |
| **Pages** | `src/app/profile/edit/page.tsx` | Profile editor |
| **Pages** | `src/app/profile/[userId]/followers/page.tsx` | Followers list |
| **Pages** | `src/app/profile/[userId]/following/page.tsx` | Following list |
| **Pages** | `src/app/search/page.tsx` | Search |
| **Pages** | `src/app/trending/page.tsx` | Trending content |
| **Pages** | `src/app/messages/page.tsx` | Messaging |
| **Pages** | `src/app/notifications/page.tsx` | Notifications |
| **Pages** | `src/app/wallet/page.tsx` | Wallet/earnings |
| **Pages** | `src/app/dashboard/page.tsx` | Creator dashboard |
| **Pages** | `src/app/settings/page.tsx` | Settings |
| **Pages** | `src/app/onboarding/page.tsx` | Onboarding |
| **Pages** | `src/app/landing/page.tsx` | Landing page |
| **Pages** | `src/app/auth/login/page.tsx` | Login |
| **Pages** | `src/app/auth/register/page.tsx` | Register |
| **Components** | `src/components/FeedPostCard.tsx` | Feed content card |
| **Components** | `src/components/PostDetailModal.tsx` | Content detail modal |
| **Components** | `src/components/content/CommentDialog.tsx` | Comments UI |
| **Components** | `src/components/ShareDialog.tsx` | Share options |
| **Components** | `src/components/chat/ChatWindow.tsx` | Chat UI |

---

## Phase 6: Real-Time Messaging (UI Integration)

### What Was Implemented

#### Messaging Page (`src/app/messages/page.tsx`)
- Two-panel layout: conversation list + active chat
- Conversation list fetched from MessagingAPI.getConversations
- Each conversation shows: participant name/avatar, last message preview, timestamp, unread count
- Click conversation to open chat in right panel
- New conversation: search users, select, create direct conversation

#### Chat Window (`src/components/chat/ChatWindow.tsx`)
- Message list with sender-aligned bubbles
- Current user messages on right (primary color)
- Other user messages on left (gray)
- Message timestamps
- Auto-scroll to newest message
- Text input with send button
- Polling-based real-time updates (3-second interval)

#### Messaging API Client (`src/lib/api/messaging.ts`)
- Complete API integration:
  - `getConversations(page, size)` - List conversations
  - `getConversation(id)` - Get single conversation
  - `createDirectConversation(otherUserId)` - Start 1:1 chat
  - `createGroupConversation(name, participantIds, avatarUrl)` - Start group
  - `getMessages(conversationId, page, size)` - Message history
  - `sendMessage(conversationId, { type, text, mediaUrl })` - Send message
  - `markAsRead(conversationId, lastReadMessageId)` - Read receipt

---

## Phase 7: Notifications (UI Integration)

### What Was Implemented

#### Notifications Page (`src/app/notifications/page.tsx`)
- Notification list sorted by date
- Grouping: Today, This Week, Earlier
- Type-specific rendering:
  - FOLLOW: Person icon, "started following you", follow-back button
  - LIKE: Heart icon, "liked your post"
  - COMMENT: Comment icon, "commented on your post"
- Mark as read on tap (visual state change)
- "Mark all as read" header action
- Actor info (name, avatar) resolved from auth-service
- Empty state when no notifications

#### Notification API Client (`src/lib/api/notifications.ts`)
- `getNotifications(userId, page, size)` - Paginated notifications
- `markAsRead(notificationId, userId)` - Mark single as read
- `markAllAsRead(userId)` - Mark all as read

---

## Phase 8: Monetization & Creator Dashboard (UI)

### What Was Implemented

#### Wallet Page (`src/app/wallet/page.tsx`)
- Meme Coin balance display with large number
- KYC status tracking card:
  - NOT_SUBMITTED: "Complete KYC to earn" with CTA
  - PENDING: "Under review" with spinner
  - VERIFIED: Green checkmark
  - REJECTED: Red with reason and retry CTA
- Earnings overview: total lifetime + this week
- Payout eligibility indicator

#### Dashboard Page (`src/app/dashboard/page.tsx`)
- Creator analytics overview
- Content count and performance metrics
- Engagement rate calculation
- Views/likes/shares/comments summary
- Earnings trend

---

## Phase 9: Polish & Deployment (UI)

### What Was Implemented

#### Environment Configuration
- `src/lib/api/client.ts` auto-detects production vs development
- All service URLs configurable via environment variables
- Graceful fallback to localhost for development

#### Date Handling
- `parseJavaDate()` handles Java LocalDateTime arrays [year, month, day, hour, minute, second, nanosecond]
- `formatTimeAgo()` produces human-readable relative times

#### Creator Handle Display
- `formatCreatorHandle()` strips @ prefix, handles raw ObjectId-style userIds
- `getHandleInitial()` extracts first letter for avatar fallbacks

#### Visual Polish
- Dark theme with proper contrast ratios
- Purple gradient (#6B46C1 -> #9333EA) for primary actions
- Consistent 12px button radius, 16px card radius
- Hover effects on interactive elements
- Mobile-first responsive design
- Safe area padding for iOS devices
- Loading states and skeletons throughout
- Error boundaries and fallback UI

---

## Directory Structure

```
src/
+-- app/
|   +-- page.tsx                            # Root / redirect
|   +-- layout.tsx                          # Root layout
|   +-- auth/
|   |   +-- login/page.tsx                  # Login page
|   |   +-- register/page.tsx               # Registration page
|   +-- feed/page.tsx                       # Main content feed
|   +-- shorts/page.tsx                     # Vertical video player
|   +-- upload/page.tsx                     # Content upload
|   +-- profile/
|   |   +-- page.tsx                        # Own profile
|   |   +-- edit/page.tsx                   # Profile editor
|   |   +-- [userId]/
|   |       +-- page.tsx                    # Other user profile
|   |       +-- followers/page.tsx          # Followers list
|   |       +-- following/page.tsx          # Following list
|   +-- search/page.tsx                     # Search page
|   +-- trending/page.tsx                   # Trending content
|   +-- messages/page.tsx                   # Messaging
|   +-- notifications/page.tsx              # Notifications
|   +-- wallet/page.tsx                     # Wallet/earnings
|   +-- dashboard/page.tsx                  # Creator dashboard
|   +-- settings/page.tsx                   # Settings
|   +-- onboarding/page.tsx                 # Onboarding
|   +-- landing/page.tsx                    # Landing page
+-- components/
|   +-- FeedPostCard.tsx                    # Feed content card
|   +-- PostDetailModal.tsx                 # Content detail view
|   +-- ProtectedRoute.tsx                  # Auth route guard
|   +-- ShareDialog.tsx                     # Share options
|   +-- content/
|   |   +-- CommentDialog.tsx               # Comments UI
|   +-- chat/
|   |   +-- ChatWindow.tsx                  # Chat messages
|   +-- layout/
|   |   +-- BottomNavigation.tsx            # Mobile bottom nav
|   |   +-- MainLayout.tsx                  # Responsive layout
|   |   +-- MobileLayout.tsx                # Mobile wrapper
|   |   +-- SidebarNavigation.tsx           # Desktop sidebar
|   |   +-- Sidebar.tsx                     # Alt sidebar
|   +-- ThemeRegistry/
|       +-- theme.ts                        # MUI theme definition
|       +-- ThemeRegistry.tsx               # Theme provider
+-- contexts/
|   +-- AuthContext.tsx                      # Authentication state
+-- lib/
    +-- api/
    |   +-- client.ts                       # API client config
    |   +-- auth.ts                         # Auth API methods
    |   +-- content.ts                      # Content API methods
    |   +-- user.ts                         # User/social API methods
    |   +-- messaging.ts                    # Messaging API methods
    |   +-- notifications.ts                # Notification API methods
    +-- firebase-config.ts                  # Firebase initialization
    +-- google-auth.ts                      # Google auth helper
```
