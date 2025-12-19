# GlobalCareer AI - AI-Powered Career Coaching Platform

## Overview
GlobalCareer AI is a world-class, AI-powered career coaching platform built for SIWES defense presentation. The platform helps users build professional careers through:
- ATS-optimized CV building with AI enhancement
- Job opportunity discovery with intelligent matching
- Application tracking through Kanban board
- Personalized career guidance

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Secure local email/password with server-side sessions
- **AI**: Google Gemini API for content optimization

## Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **Cookie Security**: httpOnly, secure (production), sameSite=lax
- **Session Fixation Prevention**: Session regeneration on login
- **Environment Validation**: SESSION_SECRET required in production

## Key Features
1. **Landing Page** - Beautiful hero section with feature highlights and testimonials
2. **Authentication** - Secure local email/password signup and signin with protected routes
3. **Dashboard** - Analytics, stats, quick actions, and recent activity
4. **CV Builder** - 5-step wizard (Personal Info, Education, Experience, Skills, Projects) with:
   - AI-powered content optimization
   - Real-time preview
   - PDF export
5. **Jobs** - AI-matched job opportunities with compatibility scores
6. **Applications** - Kanban board with drag-and-drop for tracking applications

## User Roles
- **Normal User**: Can sign up, create and manage their own CV, view matched jobs
- **Admin (isAdmin=true)**: Full system access, can view all users, monitor signups, manage jobs

## Authentication Flow
1. User visits landing page → clicks "Get Started" or "Sign Up"
2. User fills signup form (name, email, password)
3. Password is hashed with bcrypt and stored
4. User signs in → server creates session, stores in PostgreSQL
5. Session cookie sent to browser (httpOnly)
6. Protected routes check for valid session before access

## Project Structure
```
client/
  src/
    pages/           # Main page components (Landing, SignUp, SignIn, Dashboard, CVBuilder, Jobs, Applications)
    components/      # Reusable UI components (Navbar, ThemeToggle, LoadingSpinner)
    context/         # React contexts (AuthContext, ThemeContext)
    lib/             # Utilities (queryClient)
server/
  index.ts           # Express app setup with session middleware
  routes.ts          # API endpoints including auth routes
  storage.ts         # Database operations
  auth.ts            # bcrypt password hashing utilities
  gemini.ts          # AI integration with fallbacks
shared/
  schema.ts          # Database schema and types
```

## API Routes
### Authentication
- `POST /api/auth/signup` - Create new user account (bcrypt password hashing)
- `POST /api/auth/signin` - Sign in with email/password (session regeneration)
- `POST /api/auth/logout` - Destroy session and clear cookie
- `GET /api/auth/me` - Get current user from session

### CV Profile
- `GET /api/cv-profile` - Get user's CV profile
- `GET /api/cv-profile/full` - Get CV with all details
- `POST /api/cv-profile` - Create/update CV profile

### Jobs
- `GET /api/jobs` - Get all job opportunities
- `GET /api/jobs/matched` - Get matched jobs for user

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create new application

## Environment Variables Required
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - **Required in production** for session security

## Recent Changes
- December 2024: Implemented secure local authentication system
- Replaced Firebase with local email/password auth
- Added bcrypt password hashing with salt
- Implemented server-side sessions with PostgreSQL store
- Added session regeneration to prevent fixation attacks
- Created dedicated SignUp and SignIn pages
- Updated all routes to use session-based authentication

## Design Guidelines
- Uses Inter font for body text, Space Grotesk for headings
- Professional SaaS aesthetic with blue primary color (#2563EB)
- Supports light and dark mode
- Follows Shadcn UI design patterns
