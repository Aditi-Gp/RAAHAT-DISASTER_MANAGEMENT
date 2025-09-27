# 🚨 Raahat Client - Disaster Management Frontend

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.13-38B2AC.svg)](https://tailwindcss.com/)


DEMO VIDEO: https://youtu.be/51lw5EzS2As
WEBSITE: http://raahat-frontend.s3-website.ap-south-1.amazonaws.com/

A comprehensive disaster management frontend application built with React, TypeScript, and modern web technologies. This client provides real-time emergency response capabilities, interactive disaster mapping, and comprehensive user management for the Raahat disaster management system.

## 🌟 Features

### 🔐 Authentication & Authorization

- **Role-based access control** (USER, VOLUNTEER, DEPARTMENT, ADMIN, SUPER_ADMIN)
- **JWT token authentication** with secure session management
- **Protected routes** with automatic redirection
- **Profile management** with user preferences

### 🆘 Emergency SOS System

- **Real-time SOS alerts** with GPS location tracking
- **AI-powered emergency classification** (Medical, Fire, Flood, Rescue, Other)
- **Urgency level detection** (Low, Medium, High, Critical)
- **Instant emergency response** with nearest responder notification
- **Live status tracking** (NEW, ASSIGNED, IN_PROGRESS, RESOLVED)
- **Emergency contact integration** with automatic 112 calling

### 🗺️ Interactive Disaster Map

- **Google Maps integration** with real-time disaster visualization
- **Live SOS alert markers** with blinking animations
- **Safe shelter locations** with capacity and route information
- **Disaster zone polygons** with severity indicators
- **Admin route generation** between SOS alerts and shelters
- **User location tracking** with automatic updates
- **Route optimization** to nearest safe shelters

### 🏠 Shelter Management

- **Real-time shelter availability** across India
- **Capacity tracking** with live occupancy updates
- **Supply level monitoring** (Food, Medical, Essential)
- **Distance-based shelter recommendations**
- **Shelter owner contact information**
- **Navigation integration** with turn-by-turn directions

### 📊 Analytics & Insights

- **Real-time dashboard** with live statistics
- **Disaster trend analysis** with visual charts
- **SOS response metrics** and performance tracking
- **Volunteer assignment analytics**
- **Geographic distribution insights**
- **Resource allocation optimization**

### 🤖 AI-Powered Features

- **Intelligent emergency classification** using ML models
- **Automated resource suggestions** for disaster response
- **Predictive analytics** for disaster patterns
- **Smart volunteer assignment** based on proximity and skills
- **Route optimization** considering traffic and safety

### 🎯 Role-Specific Features

#### 👤 Regular Users

- Send SOS alerts with location
- View nearby safe shelters
- Track emergency response status
- Access safety guidelines
- Receive disaster notifications

#### 🚑 Volunteers & Emergency Departments

- Receive real-time SOS notifications
- View assigned emergency requests
- Update response status
- Access emergency protocols
- Coordinate with other responders

#### 👨‍💼 Administrators

- Manage disaster events
- Assign SOS alerts to volunteers
- Generate emergency routes
- Monitor system performance
- Access comprehensive analytics

#### 🔧 Super Administrators

- User management and role assignment
- System configuration
- Performance monitoring
- Data export and reporting
- Security management

## 🛠️ Technology Stack

### Core Framework

- **React 18.3.1** - Modern frontend framework
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.8** - Fast build tool and dev server
- **React Router DOM 7.8.2** - Client-side routing

### UI/UX Libraries

- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful SVG icons
- **Framer Motion** - Smooth animations
- **Sonner** - Toast notifications

### Data & State Management

- **Zustand 5.0.8** - Lightweight state management
- **React Hook Form 7.53.0** - Form handling
- **Zod 3.23.8** - Schema validation
- **Axios 1.11.0** - HTTP client

### Maps & Visualization

- **Google Maps JS API** - Interactive mapping
- **D3.js 7.9.0** - Data visualization
- **Recharts 2.12.7** - Chart components
- **TopoJSON** - Geographic data format

### Real-time Communication

- **Socket.IO Client 4.8.1** - WebSocket communication
- **Real-time notifications** for emergency alerts
- **Live data synchronization** across clients

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (buttons, cards, etc.)
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   ├── DisasterMap.tsx        # Interactive disaster map
│   │   ├── DisasterTeamDashboard.tsx  # Team coordination dashboard
│   │   └── UserSosStatus.tsx      # User SOS status tracker
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── LoginPage.tsx          # Authentication page
│   │   ├── DisasterMapPage.tsx    # Main map interface
│   │   ├── InsightsPage.tsx       # Analytics dashboard
│   │   └── SuperAdminPanel.tsx    # Admin interface
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   └── use-toast.ts          # Toast notification hook
│   ├── services/         # API services
│   │   ├── apiClient.ts          # HTTP client configuration
│   │   ├── types.ts              # API type definitions
│   │   └── examples.ts           # API usage examples
│   ├── store/            # State management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── data/             # Mock data and constants
│   │   ├── disasters.ts          # Disaster data
│   │   ├── sosAlerts.ts          # SOS alert data
│   │   └── users.ts              # User data
│   └── lib/              # Third-party library configurations
├── components.json        # Shadcn/ui configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts        # Vite build configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Google Maps API key** with the following APIs enabled:
  - Maps JavaScript API
  - Directions API
  - Places API
  - Geocoding API

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd raahat/client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory.

## 🔧 Configuration

### Google Maps Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the required APIs (Maps JavaScript API, Directions API, Places API, Geocoding API)
3. Create an API key with appropriate restrictions
4. Add the API key to your environment variables

### API Integration

The client communicates with the Raahat backend API. Ensure the backend server is running on the configured URL (default: `http://localhost:5000/api`).

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`. The design system includes:

- Custom color palette for emergency themes
- Responsive breakpoints
- Animation utilities
- Component variants

## 📱 Key Components

### DisasterMap Component

The main interactive map component featuring:

- **Real-time markers** for SOS alerts, shelters, and disasters
- **Admin route generation** with turn-by-turn directions
- **User location tracking** with GPS integration
- **Emergency SOS button** with one-click alerts
- **Dynamic legend** and map controls

**Usage:**

```tsx
<DisasterMap
  disasters={disasters}
  sosAlerts={sosAlerts}
  safeShelters={shelters}
  isAdmin={user?.role === "ADMIN"}
  onRouteGenerated={handleRouteGenerated}
/>
```

### SOS Alert System

Comprehensive emergency alert system:

- **Location-based alerts** with GPS coordinates
- **AI classification** of emergency types
- **Real-time notifications** to nearby responders
- **Status tracking** throughout the response process

### User Authentication

Secure authentication system with:

- **JWT token management** with automatic refresh
- **Role-based access control** for different user types
- **Protected route handling** with automatic redirects
- **Session persistence** across browser sessions

### Real-time Updates

WebSocket integration for:

- **Live SOS notifications** for responders
- **Real-time map updates** with new disasters
- **Status synchronization** across multiple clients
- **Emergency broadcasts** for critical situations

## 🎨 UI/UX Features

### Design System

- **Modern, accessible design** following WCAG guidelines
- **Responsive layout** optimized for mobile and desktop
- **Dark/light theme support** with user preferences
- **Emergency-focused color scheme** with high contrast

### Interactive Elements

- **Smooth animations** using Framer Motion
- **Loading states** with skeleton screens
- **Toast notifications** for user feedback
- **Modal dialogs** for important actions

### Mobile Optimization

- **Touch-friendly interface** with appropriate sizing
- **Offline capabilities** for critical functions
- **GPS integration** for location services
- **Emergency shortcuts** for quick access

## 🔒 Security Features

### Data Protection

- **HTTPS enforcement** in production
- **JWT token validation** with expiry handling
- **Role-based permissions** for API access
- **Input sanitization** and validation

### Privacy Considerations

- **Location data encryption** in transit
- **User consent management** for location services
- **Data anonymization** for analytics
- **GDPR compliance** features

## 📊 Performance Optimization

### Code Splitting

- **Route-based splitting** for faster initial loads
- **Component lazy loading** for better performance
- **Bundle optimization** with Vite
- **Tree shaking** for minimal bundle size

### Caching Strategy

- **API response caching** for static data
- **Image optimization** with lazy loading
- **Service worker** for offline functionality
- **Browser caching** for static assets

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

### Testing Structure

- **Unit tests** for individual components
- **Integration tests** for feature workflows
- **E2E tests** for critical user journeys
- **Accessibility tests** for WCAG compliance

## 🔍 Debugging

### Development Tools

- **React Developer Tools** browser extension
- **Redux DevTools** for state inspection
- **Network tab** for API debugging
- **Console logging** with structured output

### Common Issues

1. **Google Maps not loading** - Check API key and billing
2. **WebSocket connection failed** - Verify backend server status
3. **Location services disabled** - Guide users to enable GPS
4. **Authentication errors** - Check JWT token validity

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

```env
VITE_GOOGLE_MAPS_API_KEY=production_api_key
VITE_API_BASE_URL=https://api.raahat.com/api
VITE_SOCKET_URL=https://api.raahat.com
```

### Hosting Options

- **Vercel** - Recommended for React applications
- **Netlify** - Good alternative with form handling
- **AWS S3 + CloudFront** - Scalable enterprise solution
- **Firebase Hosting** - Integrated with Google services

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards

- **TypeScript strict mode** enabled
- **ESLint configuration** for code quality
- **Prettier formatting** for consistent style
- **Conventional commits** for changelog generation

### Component Guidelines

- **Single responsibility principle**
- **Props interface definition** with TypeScript
- **Accessibility considerations** (ARIA labels, keyboard navigation)
- **Error boundary implementation**

## 📚 API Integration

### Authentication Endpoints

```typescript
// Login
POST /api/auth/login
{
  email: string;
  password: string;
}

// Register
POST /api/auth/register
{
  fullName: string;
  email: string;
  password: string;
  role?: string;
}
```

### SOS Endpoints

```typescript
// Create SOS Alert
POST /api/sos
{
  text: string;
  // Location automatically detected from user
}

// Get SOS Alerts
GET /api/sos?latitude=28.6139&longitude=77.2090&radius=1000
```

### Disaster Endpoints

```typescript
// Get Disaster Events
GET / api / disasters / map / events;

// Get Map Data
GET / api / map / sos;
GET / api / map / events;
```

## 🔮 Future Enhancements

### Planned Features

- **Offline mode** with service worker
- **Progressive Web App** installation
- **Voice commands** for hands-free operation
- **AR integration** for navigation assistance
- **Multi-language support** for regional users
- **Advanced analytics** with machine learning insights

### Technical Improvements

- **Performance optimization** with code splitting
- **Accessibility enhancements** for disabled users
- **Cross-platform mobile app** with React Native
- **Real-time collaboration** features
- **Advanced caching** strategies

## 📄 License

This project is part of the Raahat Disaster Management System. Please refer to the main project license.

## 🆘 Support

For support and questions:

- **Email**: support@raahat.com
- **Emergency Hotline**: 112 (India)
- **Documentation**: [Raahat Docs](https://docs.raahat.com)
- **Community Forum**: [Raahat Community](https://community.raahat.com)

---

**⚠️ Emergency Notice**: This is a disaster management system. In case of real emergencies, always call 112 (India's emergency number) or your local emergency services immediately.
