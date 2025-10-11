# 🎬 MemeToMoney UI Service

> Transform your memes and short videos into money with our Instagram-style platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5-blue)](https://mui.com/)

## ✨ Features

### 🎯 Instagram-Style Interface
- **Modern Feed Design**: Instagram-inspired layout with clean navigation
- **Story-style Categories**: Circular category buttons with smooth animations
- **Responsive Design**: Optimized for both mobile and desktop

### 📱 Shorts Video Player
- **Full-Screen Experience**: Immersive TikTok-style video viewing
- **Interactive Controls**: Play/pause, volume control, and engagement buttons
- **Broader Desktop View**: Enhanced viewing experience on larger screens
- **Engagement Features**: Like, comment, and share functionality

### 🧭 Seamless Navigation
- **Desktop Navigation**:
  - Instagram-style header with tab switching
  - Prominent back button for shorts view
  - Integrated search functionality
- **Mobile Navigation**:
  - Bottom navigation with Home and Shorts tabs
  - Touch-friendly interface
  - Responsive design patterns

### 🔍 Search & Discovery
- **Instagram-style Search Bar**: Clean, minimal design
- **Category Filtering**: Browse content by type (Memes, Comedy, Viral, etc.)
- **Tag Navigation**: Easy hashtag-based content discovery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ui-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env.local

   # Edit .env.local with your configuration
   export USER_SERVICE_URL="http://localhost:8080"
   export CONTENT_SERVICE_URL="http://localhost:8081"
   export MONETIZATION_SERVICE_URL="http://localhost:8082"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: Material-UI (MUI) v5
- **Language**: TypeScript
- **Styling**: MUI Theme System + CSS-in-JS
- **State Management**: React Hooks + Context API

### Project Structure
```
src/
├── app/
│   ├── feed/              # Main feed page with shorts integration
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page (redirects to feed)
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
├── lib/                 # Utility libraries and API clients
└── types/              # TypeScript type definitions
```

## 🎮 User Experience

### Feed Tab
- **Instagram-style Categories**: Story-like circular buttons
- **Content Discovery**: Browse by categories (All, Memes, Comedy, etc.)
- **Responsive Layout**: Adapts to different screen sizes

### Shorts Tab
- **Full-Screen Player**: Immersive video experience
- **Video Controls**:
  - ▶️ Play/Pause toggle
  - 🔊 Volume control (mute/unmute)
  - ❤️ Like with engagement count
  - 💬 Comment with count display
  - 📤 Share functionality
- **Creator Information**: Username, title, and view count
- **Responsive Sizing**:
  - Mobile: Full viewport
  - Desktop: 480px → 720px (scales with screen size)

### Navigation Patterns
- **Desktop**: Header tabs for Feed/Shorts switching
- **Mobile**: Bottom navigation (Home, Shorts, Profile, Contests, Create)
- **Back Navigation**: Prominent back button in shorts mode

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Key Components

#### Feed Page (`/src/app/feed/page.tsx`)
- Main application entry point
- Handles tab switching between Feed and Shorts
- Responsive navigation management
- Instagram-style UI components

#### Features Implemented
- ✅ Instagram-style header and layout
- ✅ Story-style category navigation
- ✅ Full-screen shorts player
- ✅ Video controls (play/pause, volume)
- ✅ Engagement buttons (like, comment, share)
- ✅ Responsive design for mobile and desktop
- ✅ Proper navigation between Feed and Shorts

## 📱 Responsive Design

### Mobile (xs)
- Bottom navigation bar
- Full-screen shorts experience
- Touch-optimized controls
- Compressed header layout

### Desktop (sm+)
- Header-based navigation
- Larger shorts player (480px → 720px)
- Enhanced interaction patterns
- Desktop-optimized spacing

## 🎨 Design System

### Color Palette
- **Primary**: Material-UI blue palette
- **Background**: Adaptive light/dark theme
- **Accent Colors**: Instagram-inspired gradients
- **Typography**: Clean, modern font stack

### UI Patterns
- **Glassmorphism**: Semi-transparent overlays with blur effects
- **Smooth Animations**: Hover states and transitions
- **Material Design**: Following Material-UI guidelines
- **Instagram Aesthetics**: Familiar social media patterns

## 🔧 Configuration

### Environment Variables
```bash
# Backend Service URLs
USER_SERVICE_URL=http://localhost:8080
CONTENT_SERVICE_URL=http://localhost:8081
MONETIZATION_SERVICE_URL=http://localhost:8082

# Production URLs
NEXT_PUBLIC_USER_SERVICE_URL=https://api.memetomoney.com/auth
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://api.memetomoney.com/content
NEXT_PUBLIC_MONETIZATION_SERVICE_URL=https://api.memetomoney.com/wallet
```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Video upload functionality
- [ ] User authentication integration
- [ ] Content management system
- [ ] Monetization features
- [ ] Social features (comments, follows)
- [ ] Analytics dashboard

## 📞 Support

For support, email support@memetomoney.com or join our Discord community.

---

**Made with ❤️ by the MemeToMoney team**