# Douglas To-Do List - Project Structure

## Overview

This document outlines the complete file structure for the Douglas To-Do List application, including all directories, files, and their purposes.

---

## 1. Root Directory Structure

```
douglas-todo-app/
├── .github/                      # GitHub configuration
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline (optional)
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
├── src/                         # Source code
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components
│   ├── lib/                     # Utility functions and configurations
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── styles/                  # Global styles
│   └── middleware.ts            # Next.js middleware
├── supabase/                    # Supabase configuration
│   ├── functions/               # Edge Functions
│   ├── migrations/              # Database migrations
│   └── config.toml              # Supabase config
├── .env.local.example           # Environment variables template
├── .env.local                   # Local environment variables (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

---

## 2. Detailed Directory Breakdown

### 2.1 `/src/app` - Next.js App Router

```
src/app/
├── layout.tsx                   # Root layout component
├── page.tsx                     # Home page (redirects to login or dashboard)
├── globals.css                  # Global CSS styles
├── providers.tsx                # Context providers wrapper
├── (auth)/                      # Auth route group
│   ├── layout.tsx              # Auth layout (centered, minimal)
│   └── login/
│       └── page.tsx            # PIN login page
├── (dashboard)/                 # Dashboard route group (protected)
│   ├── layout.tsx              # Dashboard layout (with nav, sidebar)
│   ├── page.tsx                # Main dashboard (today's tasks)
│   ├── tasks/
│   │   ├── page.tsx            # All tasks view
│   │   └── [id]/
│   │       └── page.tsx        # Individual task detail
│   ├── progress/
│   │   └── page.tsx            # Progress tracking and history
│   └── admin/                  # Admin-only routes
│       ├── layout.tsx          # Admin layout
│       ├── page.tsx            # Admin dashboard
│       ├── tasks/
│       │   ├── page.tsx        # Task management
│       │   ├── new/
│       │   │   └── page.tsx    # Create new task
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx # Edit task
│       ├── users/
│       │   └── page.tsx        # User management
│       └── settings/
│           └── page.tsx        # App settings
├── api/                         # API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts        # POST /api/auth/login
│   │   ├── logout/
│   │   │   └── route.ts        # POST /api/auth/logout
│   │   └── session/
│   │       └── route.ts        # GET /api/auth/session
│   ├── tasks/
│   │   ├── route.ts            # GET, POST /api/tasks
│   │   ├── [id]/
│   │   │   └── route.ts        # GET, PUT, DELETE /api/tasks/[id]
│   │   └── today/
│   │       └── route.ts        # GET /api/tasks/today
│   ├── progress/
│   │   ├── route.ts            # GET, POST /api/progress
│   │   └── [id]/
│   │       └── route.ts        # PUT /api/progress/[id]
│   └── admin/
│       ├── users/
│       │   └── route.ts        # GET, POST /api/admin/users
│       └── settings/
│           └── route.ts        # GET, PUT /api/admin/settings
└── error.tsx                    # Error boundary
```

### 2.2 `/src/components` - React Components

```
src/components/
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   └── ...                     # Other shadcn components
├── auth/
│   ├── PinInput.tsx            # PIN entry component
│   ├── LoginForm.tsx           # Login form wrapper
│   └── ProtectedRoute.tsx      # Route protection HOC
├── tasks/
│   ├── TaskCard.tsx            # Individual task card
│   ├── TaskList.tsx            # List of tasks
│   ├── TaskDetail.tsx          # Detailed task view
│   ├── TaskForm.tsx            # Create/edit task form
│   ├── TaskProgress.tsx        # Progress indicator
│   ├── TaskFilters.tsx         # Filter and sort controls
│   └── EmbeddedWebsite.tsx     # Iframe for embedded links
├── progress/
│   ├── ProgressChart.tsx       # Completion chart
│   ├── ProgressStats.tsx       # Statistics display
│   └── ProgressCalendar.tsx    # Calendar view of progress
├── admin/
│   ├── AdminNav.tsx            # Admin navigation
│   ├── UserTable.tsx           # User management table
│   ├── SettingsForm.tsx        # Settings configuration
│   └── NotificationLog.tsx     # Notification history
├── layout/
│   ├── Header.tsx              # App header
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Footer.tsx              # App footer
│   └── MobileNav.tsx           # Mobile navigation
└── common/
    ├── LoadingSpinner.tsx      # Loading indicator
    ├── ErrorMessage.tsx        # Error display
    ├── EmptyState.tsx          # Empty state placeholder
    └── ConfirmDialog.tsx       # Confirmation modal
```

### 2.3 `/src/lib` - Utilities and Configuration

```
src/lib/
├── supabase/
│   ├── client.ts               # Supabase client (browser)
│   ├── server.ts               # Supabase client (server)
│   ├── middleware.ts           # Supabase middleware helpers
│   └── types.ts                # Supabase generated types
├── auth/
│   ├── pin.ts                  # PIN hashing and validation
│   ├── session.ts              # Session management
│   └── permissions.ts          # Role-based permissions
├── api/
│   ├── tasks.ts                # Task API functions
│   ├── progress.ts             # Progress API functions
│   ├── users.ts                # User API functions
│   └── notifications.ts        # Notification API functions
├── utils/
│   ├── date.ts                 # Date formatting utilities
│   ├── validation.ts           # Input validation schemas
│   ├── constants.ts            # App constants
│   └── helpers.ts              # General helper functions
└── cn.ts                       # Tailwind class merger utility
```

### 2.4 `/src/hooks` - Custom React Hooks

```
src/hooks/
├── useAuth.ts                   # Authentication hook
├── useTasks.ts                  # Tasks data hook
├── useProgress.ts               # Progress tracking hook
├── useToast.ts                  # Toast notifications hook
├── useLocalStorage.ts           # Local storage hook
└── useMediaQuery.ts             # Responsive design hook
```

### 2.5 `/src/types` - TypeScript Definitions

```
src/types/
├── index.ts                     # Main type exports
├── database.ts                  # Database types (generated)
├── auth.ts                      # Auth-related types
├── tasks.ts                     # Task-related types
├── progress.ts                  # Progress-related types
└── api.ts                       # API response types
```

### 2.6 `/supabase` - Supabase Configuration

```
supabase/
├── functions/                   # Edge Functions
│   ├── send-daily-email/
│   │   ├── index.ts            # Email notification function
│   │   └── deno.json           # Deno configuration
│   ├── send-daily-sms/
│   │   ├── index.ts            # SMS notification function
│   │   └── deno.json
│   ├── schedule-notifications/
│   │   ├── index.ts            # Scheduler function
│   │   └── deno.json
│   └── _shared/                # Shared utilities
│       ├── supabase.ts         # Supabase client
│       ├── email.ts            # Email templates
│       └── sms.ts              # SMS templates
├── migrations/                  # Database migrations
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240101000001_create_functions.sql
│   ├── 20240101000002_create_policies.sql
│   └── 20240101000003_seed_data.sql
└── config.toml                  # Supabase project config
```

---

## 3. Configuration Files

### 3.1 `package.json`

```json
{
  "name": "douglas-todo-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:status": "supabase status",
    "supabase:reset": "supabase db reset",
    "supabase:gen-types": "supabase gen types typescript --local > src/lib/supabase/types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^3.0.6",
    "bcryptjs": "^2.4.3",
    "zustand": "^4.4.7",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.303.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "supabase": "^1.142.2"
  }
}
```

### 3.2 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'agent.drz.services',
      'quo.drz.services',
      // Add other allowed image domains
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3.3 `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 3.4 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3.5 `.env.local.example`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Security
PIN_SALT_ROUNDS=12
SESSION_SECRET=your_session_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 3.6 `.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Supabase
supabase/.branches
supabase/.temp
```

---

## 4. Key File Purposes

### 4.1 Core Application Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers, fonts, metadata |
| `src/app/page.tsx` | Landing page with redirect logic |
| `src/middleware.ts` | Authentication and route protection |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |

### 4.2 Authentication Files

| File | Purpose |
|------|---------|
| `src/app/(auth)/login/page.tsx` | PIN login interface |
| `src/components/auth/PinInput.tsx` | PIN entry component |
| `src/lib/auth/pin.ts` | PIN hashing and validation |
| `src/lib/auth/session.ts` | Session management utilities |

### 4.3 Task Management Files

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/page.tsx` | Main dashboard with today's tasks |
| `src/components/tasks/TaskCard.tsx` | Individual task display |
| `src/components/tasks/TaskList.tsx` | Task list container |
| `src/app/api/tasks/route.ts` | Task CRUD API endpoints |

### 4.4 Admin Files

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/admin/page.tsx` | Admin dashboard |
| `src/app/(dashboard)/admin/tasks/page.tsx` | Task management interface |
| `src/components/admin/UserTable.tsx` | User management |

### 4.5 Edge Function Files

| File | Purpose |
|------|---------|
| `supabase/functions/send-daily-email/index.ts` | Email notification sender |
| `supabase/functions/send-daily-sms/index.ts` | SMS notification sender |
| `supabase/functions/schedule-notifications/index.ts` | Notification scheduler |

---

## 5. Component Hierarchy

```
App
├── Providers (Auth, Toast, Theme)
│   ├── Layout (Root)
│   │   ├── Header
│   │   ├── Main Content
│   │   │   ├── (Auth Routes)
│   │   │   │   └── Login
│   │   │   │       └── PinInput
│   │   │   └── (Dashboard Routes)
│   │   │       ├── Sidebar
│   │   │       ├── Dashboard
│   │   │       │   ├── TaskList
│   │   │       │   │   └── TaskCard[]
│   │   │       │   │       ├── TaskProgress
│   │   │       │   │       └── EmbeddedWebsite
│   │   │       │   └── ProgressStats
│   │   │       └── Admin
│   │   │           ├── AdminNav
│   │   │           ├── TaskForm
│   │   │           ├── UserTable
│   │   │           └── SettingsForm
│   │   └── Footer
│   └── Toaster
```

---

## 6. Data Flow

```
User Action
    ↓
Component (React)
    ↓
Custom Hook (useAuth, useTasks, etc.)
    ↓
API Route (/api/*)
    ↓
Supabase Client (server.ts)
    ↓
Database (PostgreSQL)
    ↓
RLS Policies (Security)
    ↓
Response
    ↓
Component Update
    ↓
UI Render
```

---

## 7. Build and Deployment Structure

### 7.1 Development

```
Local Machine
    ↓
npm run dev
    ↓
Next.js Dev Server (localhost:3000)
    ↓
Local Supabase (optional)
```

### 7.2 Production

```
Git Push
    ↓
GitHub Repository
    ↓
Vercel (Auto Deploy)
    ↓
Build Process
    ↓
Edge Network Deployment
    ↓
Production URL
```

---

## 8. File Naming Conventions

### 8.1 Components

- **React Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Page Components**: `page.tsx` (Next.js convention)
- **Layout Components**: `layout.tsx` (Next.js convention)

### 8.2 Utilities and Hooks

- **Utility Files**: camelCase (e.g., `validation.ts`)
- **Custom Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **API Routes**: `route.ts` (Next.js convention)

### 8.3 Types

- **Type Files**: camelCase (e.g., `database.ts`)
- **Type Names**: PascalCase (e.g., `TodoItem`, `UserProfile`)

---

## 9. Import Aliases

Configure path aliases in `tsconfig.json`:

```typescript
// Instead of: import { Button } from '../../../components/ui/button'
// Use: import { Button } from '@/components/ui/button'

"paths": {
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/types/*": ["./src/types/*"]
}
```

---

## 10. Code Organization Best Practices

### 10.1 Component Structure

```typescript
// 1. Imports
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

// 2. Types
interface TaskCardProps {
  task: TodoItem;
  onComplete: (id: string) => void;
}

// 3. Component
export function TaskCard({ task, onComplete }: TaskCardProps) {
  // 4. Hooks
  const { user } = useAuth();
  
  // 5. State
  const [isLoading, setIsLoading] = useState(false);
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Handlers
  const handleComplete = () => {
    // ...
  };
  
  // 8. Render
  return (
    // JSX
  );
}
```

### 10.2 File Size Guidelines

- **Components**: < 300 lines (split if larger)
- **Utilities**: < 200 lines per file
- **API Routes**: < 150 lines per endpoint
- **Hooks**: < 100 lines per hook

### 10.3 Separation of Concerns

- **Presentation**: Components focus on UI
- **Logic**: Hooks handle business logic
- **Data**: API routes handle data fetching
- **State**: Context/Zustand for global state
- **Styling**: Tailwind classes, no inline styles

---

## Summary

This project structure provides:

1. **Clear Organization**: Logical grouping of related files
2. **Scalability**: Easy to add new features and components
3. **Maintainability**: Consistent naming and structure
4. **Type Safety**: TypeScript throughout
5. **Best Practices**: Following Next.js and React conventions
6. **Developer Experience**: Clear imports, good tooling support

The structure is production-ready and follows industry standards for modern web applications.