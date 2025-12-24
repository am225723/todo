# Douglas To-Do List Application

A sophisticated, PIN-based to-do list application built with Next.js 14, Supabase, and deployed on Vercel. Features include task management, progress tracking, AI agent integrations, automated notifications, and calendar synchronization.

## 🎯 Features

### Core Features
- **🔐 PIN-Based Authentication**: Simple 4-6 digit PIN login (no passwords)
- **✅ Task Management**: Static daily tasks and dynamic one-time tasks
- **📊 Progress Tracking**: Persistent progress across sessions
- **🔗 AI Agent Integration**: Direct access to agent.drz.services and quo.drz.services
- **📧 Email Notifications**: Automated daily task emails
- **📱 SMS Notifications**: Daily task reminders via SMS
- **👨‍💼 Admin Panel**: Full CRUD operations for task management
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui

### Phase 2 Features
- **📅 Calendar Integration**: Sync with Google Calendar, Outlook, Apple Calendar, and iCal
- **🏷️ Task Categories & Tags**: Organize tasks by category with color coding
- **📈 Analytics Dashboard**: Completion rates, trends, and insights
- **🎮 Gamification**: Achievements, points, and streaks
- **🔔 Smart Notifications**: Customizable notification preferences
- **🌙 Dark Mode**: Eye-friendly dark theme
- **⌨️ Keyboard Shortcuts**: Power user navigation
- **📱 PWA Support**: Install as mobile app

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Calendar**: React Big Calendar

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Custom PIN)
- **API**: Next.js API Routes + Supabase Edge Functions
- **Storage**: Supabase Storage

### Integrations
- **Email**: Resend
- **SMS**: Twilio
- **Calendar**: Google Calendar API, iCal
- **AI Agents**: agent.drz.services, quo.drz.services

### Infrastructure
- **Hosting**: Vercel
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Vercel account (for deployment)
- Google Cloud Console account (for calendar integration)
- Resend account (for email notifications)
- Twilio account (for SMS notifications)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/am225723/todo.git
cd todo
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM=noreply@yourdomain.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# Security
PIN_SALT_ROUNDS=12
SESSION_SECRET=generate-a-random-secret-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CALENDAR_SYNC=true
\`\`\`

### 4. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migration scripts in the \`supabase/migrations\` directory
3. Enable Row Level Security (RLS) on all tables
4. Create the necessary database functions and triggers

See \`docs/DATABASE_SCHEMA.md\` for complete schema details.

### 5. Set Up Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: \`http://localhost:3000/api/calendar/callback\`
6. Copy the Client ID and Client Secret to your \`.env.local\`

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
todo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── admin/             # Admin pages
│   │   └── login/             # Login page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Authentication components
│   │   ├── tasks/            # Task components
│   │   ├── calendar/         # Calendar components
│   │   └── admin/            # Admin components
│   ├── lib/                   # Utilities and configurations
│   │   ├── supabase/         # Supabase clients
│   │   ├── auth/             # Authentication utilities
│   │   ├── calendar/         # Calendar integrations
│   │   └── utils/            # Helper functions
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── functions/             # Edge Functions
│   └── migrations/            # Database migrations
├── docs/                      # Documentation
├── public/                    # Static assets
└── package.json
\`\`\`

## 📚 Documentation

- [Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Implementation Guide](./docs/IMPLEMENTATION_GUIDE.md)
- [Code Snippets](./docs/CODE_SNIPPETS.md)
- [Additional Features](./docs/ADDITIONAL_FEATURES.md)
- [GitHub Setup](./docs/GITHUB_SETUP.md)

## 🔒 Security

- PIN hashed with bcrypt (12 rounds)
- Rate limiting (5 attempts per 15 minutes)
- Row Level Security (RLS) enabled
- Session timeout (24 hours)
- HTTPS only (enforced by Vercel)
- CSRF protection
- Input validation with Zod

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

### Configure Environment Variables in Vercel

1. Go to your project settings in Vercel
2. Navigate to Environment Variables
3. Add all variables from \`.env.local\`
4. Redeploy the application

## 📧 Setting Up Notifications

### Email Notifications (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to \`.env.local\`
4. Deploy the email Edge Function

### SMS Notifications (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID, Auth Token, and Phone Number
3. Add to \`.env.local\`
4. Deploy the SMS Edge Function

## 🎮 Usage

### For Users (Douglas)

1. **Login**: Enter your email and 4-6 digit PIN
2. **View Tasks**: See today's tasks on the dashboard
3. **Complete Tasks**: Check off tasks as you complete them
4. **View Progress**: Track your completion rate and streaks
5. **Calendar Sync**: Connect your Google Calendar to sync tasks

### For Admins

1. **Login**: Use admin credentials
2. **Manage Tasks**: Create, edit, and delete tasks
3. **Manage Users**: Add or remove users
4. **View Analytics**: See completion statistics
5. **Configure Settings**: Adjust notification times and preferences

## 🔧 Development

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
\`\`\`

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📄 License

Private and Confidential - All Rights Reserved

## 🆘 Support

For support, please refer to the documentation in the \`docs/\` directory or contact the development team.

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Built with ❤️ for Douglas by NinjaTech AI**