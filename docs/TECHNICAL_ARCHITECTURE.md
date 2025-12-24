# Douglas To-Do List Application - Technical Architecture

## Executive Summary

This document outlines the technical architecture for a sophisticated to-do list web application designed for Douglas, featuring PIN-based authentication, dynamic task management, AI agent integrations, and automated notifications.

---

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
  - Server-side rendering for optimal performance
  - Built-in API routes for backend logic
  - Excellent Vercel integration
  - TypeScript for type safety
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
  - Modern, sophisticated design system
  - Highly customizable
  - Responsive by default
- **State Management**: React Context API + Zustand (for complex state)
- **Form Handling**: React Hook Form + Zod validation
- **Date Handling**: date-fns

### Backend & Infrastructure
- **Database**: Supabase PostgreSQL
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Built-in authentication
- **Authentication**: Supabase Auth (Custom PIN implementation)
- **API Layer**: Supabase Edge Functions (Deno runtime)
  - Email notifications
  - SMS notifications
  - Scheduled tasks
- **File Storage**: Supabase Storage (if needed for attachments)
- **Deployment**: Vercel
  - Automatic deployments from Git
  - Edge network for global performance
  - Environment variable management

### External Services
- **Email Service**: Resend or SendGrid (via Edge Functions)
- **SMS Service**: Twilio (via Edge Functions)
- **AI Agents**: 
  - agent.drz.services
  - quo.drz.services

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │    Tablet    │      │
│  │  (Desktop)   │  │    Device    │  │    Device    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Pages/     │  │  API Routes  │  │ Middleware  │ │ │
│  │  │  Components  │  │              │  │             │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth System │  │    Storage   │      │
│  │   Database   │  │  (PIN-based) │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Edge Functions (Deno)                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Email    │  │    SMS     │  │  Scheduled │    │  │
│  │  │ Notifier   │  │  Notifier  │  │   Tasks    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Resend/   │  │    Twilio    │  │  AI Agents   │      │
│  │   SendGrid   │  │     SMS      │  │  (drz.*)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Authentication Flow

### PIN-Based Authentication System

Instead of traditional username/password, we implement a PIN-based system:

```
User Flow:
1. User visits application
2. Presented with PIN entry screen (4-6 digit PIN)
3. PIN is hashed and compared against stored hash in Supabase
4. On success, JWT token issued with role (client/admin)
5. Token stored in httpOnly cookie
6. Subsequent requests authenticated via token
```

### Implementation Strategy

**Option 1: Custom Auth with Supabase (Recommended)**
- Store PIN hashes in custom `user_profiles` table
- Use Supabase Auth for session management
- Create custom sign-in function that validates PIN
- Leverage Supabase RLS for authorization

**Option 2: Supabase Auth with Email (Alternative)**
- Use email-based auth with auto-generated emails
- PIN becomes the "password"
- Simpler implementation but less elegant

### Security Considerations
- PINs stored as bcrypt hashes (never plaintext)
- Rate limiting on PIN attempts (max 5 attempts per 15 minutes)
- Session timeout after 24 hours of inactivity
- HTTPS only (enforced by Vercel)
- CSRF protection via Next.js middleware

---

## 4. Data Models & Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│  user_profiles  │
├─────────────────┤
│ id (PK)         │
│ supabase_uid    │◄────┐
│ role            │     │
│ pin_hash        │     │
│ email           │     │
│ phone           │     │
│ created_at      │     │
│ updated_at      │     │
└─────────────────┘     │
                        │
                        │
┌─────────────────┐     │
│   todo_items    │     │
├─────────────────┤     │
│ id (PK)         │     │
│ title           │     │
│ description     │     │
│ link_url        │     │
│ is_static       │     │
│ is_active       │     │
│ display_date    │     │
│ created_by      │─────┘
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ todo_progress   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ todo_item_id(FK)│
│ completed       │
│ completed_at    │
│ notes           │
│ created_at      │
│ updated_at      │
└─────────────────┘


┌─────────────────┐
│ notifications   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ sent_at         │
│ status          │
│ error_message   │
└─────────────────┘
```

---

## 5. Feature Specifications

### 5.1 PIN Authentication

**User Stories:**
- As Douglas (client), I want to log in with a simple PIN so I can quickly access my to-do list
- As an admin, I want to log in with a separate PIN so I can manage tasks

**Technical Requirements:**
- 4-6 digit PIN input
- PIN stored as bcrypt hash
- Role-based access control (RBAC)
- Session persistence across browser sessions
- Automatic logout after 24 hours

### 5.2 To-Do List Display

**User Stories:**
- As Douglas, I want to see my daily tasks including both static and dynamic items
- As Douglas, I want to click on links to access external resources
- As Douglas, I want to view embedded websites within the app

**Technical Requirements:**
- Fetch tasks for current date
- Combine static (recurring) and dynamic (one-time) tasks
- Display tasks in priority order
- Clickable links that open in new tab or iframe
- Responsive card-based layout
- Real-time updates when admin adds tasks

### 5.3 Progress Tracking

**User Stories:**
- As Douglas, I want to mark tasks as complete so I can track my progress
- As Douglas, I want my progress saved so it persists across sessions

**Technical Requirements:**
- Checkbox to mark completion
- Optimistic UI updates
- Persist to Supabase immediately
- Visual indication of completion (strikethrough, color change)
- Progress percentage display
- Historical progress view

### 5.4 Admin Panel

**User Stories:**
- As an admin, I want to create new tasks for Douglas
- As an admin, I want to edit existing tasks
- As an admin, I want to delete tasks
- As an admin, I want to set tasks as recurring or one-time

**Technical Requirements:**
- CRUD operations for todo_items
- Form validation
- Date picker for scheduling
- Toggle for static/dynamic tasks
- Rich text editor for descriptions
- URL validation for links
- Preview before saving

### 5.5 Notifications

**User Stories:**
- As Douglas, I want to receive a daily email with my tasks
- As Douglas, I want to receive a daily SMS with my tasks

**Technical Requirements:**
- Scheduled Edge Function (runs daily at configured time)
- Email template with task list
- SMS message with task summary
- Error handling and retry logic
- Notification log for debugging
- Configurable send time

### 5.6 AI Agent Integration

**User Stories:**
- As Douglas, I want to access agent.drz.services directly from tasks
- As Douglas, I want to access quo.drz.services directly from tasks
- As Douglas, I want to view these agents within the app

**Technical Requirements:**
- Iframe embedding with security considerations
- Fallback to new tab if iframe blocked
- Loading states
- Error handling for unavailable services
- Responsive iframe sizing

---

## 6. Security Architecture

### Authentication & Authorization
- **PIN Security**: Bcrypt hashing with salt rounds = 12
- **Session Management**: JWT tokens with 24-hour expiration
- **CSRF Protection**: Next.js built-in CSRF tokens
- **XSS Prevention**: React's built-in escaping + Content Security Policy

### Database Security (Row Level Security)
```sql
-- Users can only see their own progress
CREATE POLICY "Users can view own progress"
  ON todo_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all todo items
CREATE POLICY "Admins can manage todos"
  ON todo_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid()
      AND role = 'admin'
    )
  );

-- Clients can view active todos
CREATE POLICY "Clients can view active todos"
  ON todo_items FOR SELECT
  USING (is_active = true);
```

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- Environment variables for secrets
- HTTPS only
- CORS configuration

### Iframe Security
- Content Security Policy headers
- X-Frame-Options configuration
- Sandbox attributes on iframes
- Whitelist of allowed domains

---

## 7. Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for admin panel
- **Image Optimization**: Next.js Image component
- **Caching**: SWR for data fetching with revalidation
- **Lazy Loading**: Components below fold
- **Bundle Size**: Tree shaking and minification

### Backend Optimization
- **Database Indexing**: On frequently queried columns
- **Connection Pooling**: Supabase handles automatically
- **Query Optimization**: Use Supabase query builder efficiently
- **Edge Functions**: Cold start optimization

### Caching Strategy
- **Static Assets**: CDN caching via Vercel
- **API Responses**: SWR cache with 30-second revalidation
- **Database Queries**: Supabase real-time subscriptions
- **Session Data**: Local storage + server validation

---

## 8. Monitoring & Logging

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Vercel Analytics
- **User Analytics**: Privacy-focused analytics (Plausible/Fathom)
- **Uptime Monitoring**: Vercel built-in

### Logging Strategy
- **Frontend Errors**: Console errors sent to Sentry
- **API Errors**: Structured logging in Edge Functions
- **Database Errors**: Supabase logs
- **Notification Failures**: Logged to notifications table

---

## 9. Scalability Considerations

### Current Scale
- **Users**: 2 (Douglas + Admin)
- **Tasks**: ~50-100 active tasks
- **Notifications**: 2 per day

### Future Scale Potential
- Architecture supports multiple clients
- Database schema allows multi-tenancy
- Edge Functions scale automatically
- Vercel scales with traffic

### Scaling Strategy
If expanding to multiple clients:
1. Add organization/tenant concept
2. Update RLS policies for multi-tenancy
3. Add user management interface
4. Implement billing (if needed)

---

## 10. Development Workflow

### Environment Setup
```
Development → Staging → Production

Local Dev:
- Local Supabase instance (optional)
- Environment variables from .env.local
- Hot reload with Next.js

Staging:
- Vercel preview deployments
- Supabase staging project
- Test notifications

Production:
- Vercel production deployment
- Supabase production project
- Real notifications
```

### Git Workflow
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (local development)
```

### CI/CD Pipeline
1. Push to feature branch
2. Vercel creates preview deployment
3. Run tests (if implemented)
4. Manual review
5. Merge to develop → staging deployment
6. Final testing
7. Merge to main → production deployment

---

## 11. Technology Justification

### Why Next.js?
- **Vercel Integration**: Seamless deployment and optimization
- **Performance**: Server-side rendering and static generation
- **Developer Experience**: Hot reload, TypeScript support, great documentation
- **API Routes**: Built-in backend capabilities
- **SEO**: Better than pure client-side React (if needed)

### Why Supabase?
- **All-in-One**: Database, auth, storage, edge functions
- **PostgreSQL**: Robust, reliable, feature-rich
- **Real-time**: Built-in subscriptions for live updates
- **RLS**: Database-level security
- **Developer Experience**: Excellent documentation and tooling

### Why Tailwind CSS?
- **Rapid Development**: Utility-first approach
- **Consistency**: Design system built-in
- **Performance**: Purges unused CSS
- **Customization**: Highly configurable
- **Community**: Large ecosystem of components

### Why shadcn/ui?
- **Quality**: Beautiful, accessible components
- **Customization**: Copy-paste, not npm install
- **Flexibility**: Full control over code
- **Modern**: Built on Radix UI primitives
- **TypeScript**: Full type safety

---

## 12. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Supabase downtime | High | Low | Implement retry logic, status page monitoring |
| Email/SMS delivery failure | Medium | Medium | Retry mechanism, fallback providers, logging |
| PIN brute force | High | Medium | Rate limiting, account lockout, monitoring |
| Iframe security issues | Medium | Low | CSP headers, sandbox attributes, whitelist |
| Data loss | High | Very Low | Supabase automatic backups, point-in-time recovery |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User adoption | Low | Low | Simple UX, training documentation |
| Cost overrun | Low | Low | Supabase free tier sufficient, Vercel hobby plan |
| Maintenance burden | Medium | Medium | Clean code, documentation, monitoring |

---

## 13. Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Task Categories/Tags**: Organize tasks by type
2. **Recurring Tasks**: Advanced scheduling (weekly, monthly)
3. **Subtasks**: Break down complex tasks
4. **File Attachments**: Upload documents to tasks
5. **Comments**: Add notes to tasks
6. **Task History**: View completed tasks archive
7. **Analytics Dashboard**: Progress over time, completion rates
8. **Mobile App**: React Native or PWA
9. **Voice Input**: Add tasks via voice
10. **Calendar Integration**: Sync with Google Calendar

### Technical Improvements
1. **Testing**: Unit tests, integration tests, E2E tests
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Internationalization**: Multi-language support
4. **Offline Support**: PWA with service workers
5. **Advanced Caching**: Redis for session management

---

## 14. Success Metrics

### Key Performance Indicators (KPIs)

**User Engagement:**
- Daily active usage (target: 90%+)
- Task completion rate (target: 80%+)
- Average session duration (target: 5-10 minutes)

**Technical Performance:**
- Page load time (target: < 2 seconds)
- API response time (target: < 500ms)
- Uptime (target: 99.9%)

**Notification Delivery:**
- Email delivery rate (target: 99%+)
- SMS delivery rate (target: 99%+)
- Notification send time accuracy (target: ±5 minutes)

---

## 15. Conclusion

This architecture provides a solid foundation for Douglas's to-do list application with room for growth. The technology stack is modern, well-supported, and optimized for the use case. The PIN-based authentication provides simplicity while maintaining security, and the notification system ensures Douglas stays on track with his daily tasks.

The modular design allows for easy maintenance and future enhancements, while the use of managed services (Supabase, Vercel) minimizes operational overhead.