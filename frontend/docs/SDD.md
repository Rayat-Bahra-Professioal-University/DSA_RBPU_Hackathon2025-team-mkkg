# Software Design Document (SDD)

## CityCare - Civic Issue Reporting Portal

**Version:** 1.0  
**Date:** October 14, 2025  
**Project:** DSA_RBPU_Hackathon2025

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Design Patterns](#4-design-patterns)
5. [Component Architecture](#5-component-architecture)
6. [Data Flow](#6-data-flow)
7. [Security Design](#7-security-design)
8. [Performance Considerations](#8-performance-considerations)
9. [Scalability](#9-scalability)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Introduction

### 1.1 Purpose

CityCare is a civic issue reporting and tracking portal that enables citizens to report municipal issues (potholes, streetlights, waste management, etc.) and track their resolution status. The system facilitates transparent communication between citizens and civic authorities.

### 1.2 Scope

This document describes the software design for the CityCare frontend application, including:

- User authentication and authorization
- Issue creation and management
- Issue search and filtering
- User profile management
- Real-time location tracking with Google Maps
- Voice-to-text issue reporting

### 1.3 Objectives

- Provide intuitive UI for civic issue reporting
- Enable efficient issue tracking and status monitoring
- Ensure secure user authentication
- Support multimedia attachments (images/videos)
- Provide location-based issue mapping
- Maintain accessibility and responsive design

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   React    │  │  React Router│  │  Clerk Auth      │    │
│  │   v18.x    │  │     v6.x     │  │     v4.x         │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services Layer                   │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   Clerk    │  │ Google Maps  │  │  Backend API     │    │
│  │   Auth     │  │   API v3     │  │   (To Build)     │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Frontend Architecture Pattern

**Pattern:** Component-Based Architecture with Atomic Design Principles

```
src/
├── components/          # Reusable UI components
│   ├── layouts/        # Layout wrappers
│   ├── navbar/         # Navigation component
│   └── sidebar/        # Sidebar navigation
├── pages/              # Route-based page components
│   ├── dashboard/      # Dashboard view
│   ├── create-issue/   # Issue creation form
│   ├── issue-details/  # Issue detail view
│   ├── search-complaints/ # Search interface
│   ├── profile/        # User profile
│   ├── change-password/ # Password management
│   └── delete-account/ # Account deletion
├── assets/             # Static assets
├── App.jsx             # Root component with routing
├── App.css             # Global styles and CSS variables
└── main.jsx            # Application entry point
```

---

## 3. Technology Stack

### 3.1 Core Technologies

| Category           | Technology               | Version | Purpose              |
| ------------------ | ------------------------ | ------- | -------------------- |
| **Framework**      | React                    | 18.3.1  | UI library           |
| **Build Tool**     | Vite                     | 5.4.10  | Development & build  |
| **Language**       | JavaScript               | ES2022  | Programming language |
| **Routing**        | React Router             | 6.27.0  | Client-side routing  |
| **Authentication** | Clerk                    | 5.7.4   | User authentication  |
| **Forms**          | React Hook Form          | 7.53.2  | Form management      |
| **Speech**         | react-speech-recognition | 3.10.0  | Voice input          |

### 3.2 External APIs

| Service                    | Purpose                | Authentication |
| -------------------------- | ---------------------- | -------------- |
| Clerk API                  | User management, OAuth | API Key        |
| Google Maps JavaScript API | Location mapping       | API Key        |
| Backend REST API           | Issue CRUD operations  | JWT Token      |

### 3.3 Development Tools

- **Linting:** ESLint v9.13.0
- **Code Style:** Custom ESLint configuration
- **Package Manager:** npm
- **Version Control:** Git

---

## 4. Design Patterns

### 4.1 Component Patterns

#### 4.1.1 Container/Presentational Pattern

- **Container Components:** Handle business logic and state management
- **Presentational Components:** Focus on UI rendering

Example:

```javascript
// Container Component
export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Fetch data logic
  }, []);

  return <DashboardView stats={stats} issues={issues} />;
}
```

#### 4.1.2 Higher-Order Component (HOC) Pattern

```javascript
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

### 4.2 State Management Pattern

**Local State:** useState for component-specific state
**Form State:** React Hook Form for complex form management
**Global State:** Clerk context for authentication state

### 4.3 Routing Pattern

**Layout Wrapping:** All authenticated routes wrapped in ContentLayout

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <ContentLayout>
        <Dashboard />
      </ContentLayout>
    </ProtectedRoute>
  }
/>
```

---

## 5. Component Architecture

### 5.1 Core Components

#### 5.1.1 App Component

- **Responsibility:** Root component, routing configuration
- **State:** Mobile menu open/close
- **Features:** Protected routes, authentication boundaries

#### 5.1.2 Navbar Component

- **Props:** `onMobileMenuToggle`, `isMobileMenuOpen`
- **Features:** Logo, mobile menu toggle, user profile button
- **Integration:** Clerk UserButton component

#### 5.1.3 Sidebar Component

- **Props:** `isOpen`, `onClose`
- **State:** Active navigation item
- **Features:** Navigation menu, auto-close on mobile, sign-out

#### 5.1.4 ContentLayout Component

- **Purpose:** Consistent page layout wrapper
- **Features:** Padding, max-width, responsive design

### 5.2 Page Components

#### 5.2.1 Dashboard

- **Route:** `/dashboard`
- **Data:** Issue statistics, issue list with pagination
- **Features:** Stats cards, data table, pagination controls

#### 5.2.2 CreateIssue

- **Route:** `/create-issue`
- **Form Fields:** Type, description, location, priority, phone, files
- **Features:**
  - Voice-to-text input
  - Google Maps integration
  - File upload (max 5 files, 10MB each)
  - Form validation

#### 5.2.3 IssueDetails

- **Route:** `/issue/:id`
- **Data:** Complete issue information
- **Features:**
  - Status timeline
  - Image gallery
  - Location display
  - Contact information

#### 5.2.4 SearchComplaints

- **Route:** `/search-complaints`
- **Features:**
  - Registration ID search
  - Advanced filters (status, category, date range)
  - Results table with navigation to details

#### 5.2.5 UserProfile

- **Route:** `/profile`
- **Integration:** Clerk UserProfile component
- **Features:** View/edit user information

#### 5.2.6 ChangePassword

- **Route:** `/change-password`
- **Features:**
  - OAuth user detection
  - Password validation
  - Provider-specific guidance for OAuth users

#### 5.2.7 DeleteAccount

- **Route:** `/delete-account`
- **Features:**
  - Two-step confirmation
  - Type "DELETE" verification
  - Warning about pending issues

---

## 6. Data Flow

### 6.1 Authentication Flow

```
User → Sign In Page → Clerk Auth
                        ↓
                   JWT Token
                        ↓
                   Set Cookie
                        ↓
              Protected Routes Access
                        ↓
                  API Requests
               (with auth header)
```

### 6.2 Issue Creation Flow

```
User Input → Form Validation → File Upload
                                    ↓
                              Location Selection
                                    ↓
                              Voice Recording
                                    ↓
                              Form Submit
                                    ↓
                              Backend API
                                    ↓
                              Issue Created
                                    ↓
                          Redirect to Dashboard
```

### 6.3 Issue Search Flow

```
Search Input → Apply Filters → API Request
                                    ↓
                              Response Data
                                    ↓
                              Format Results
                                    ↓
                              Display Table
                                    ↓
                            View Details (Click)
```

---

## 7. Security Design

### 7.1 Authentication Security

- **Provider:** Clerk (Industry-standard authentication)
- **Token Type:** JWT (JSON Web Tokens)
- **Storage:** Secure HTTP-only cookies
- **Session Management:** Automatic token refresh

### 7.2 Authorization

- **Route Protection:** All routes except sign-in require authentication
- **Component Level:** SignedIn/SignedOut boundaries
- **API Security:** Bearer token in Authorization header

### 7.3 Data Validation

- **Client-Side:** React Hook Form validation
- **Server-Side:** Backend API validation (to be implemented)
- **Sanitization:** Input sanitization for XSS prevention

### 7.4 File Upload Security

- **Size Limit:** 10MB per file
- **File Count:** Maximum 5 files
- **Type Validation:** Image and video files only
- **Server Validation:** Backend MIME type verification (to be implemented)

---

## 8. Performance Considerations

### 8.1 Code Splitting

- **Route-based:** Lazy loading of page components
- **Bundle Size:** Optimized with Vite tree-shaking

### 8.2 Optimization Techniques

- **React.memo:** Memoization of expensive components
- **useMemo/useCallback:** Prevent unnecessary re-renders
- **Pagination:** Limit data rendering (10 items per page)
- **Image Optimization:** Use responsive images with proper sizing

### 8.3 Loading States

- **Async Operations:** Loading indicators for API calls
- **Map Loading:** Google Maps loading spinner
- **Skeleton Screens:** Placeholder content during data fetch

---

## 9. Scalability

### 9.1 Component Reusability

- **Design System:** CSS variables for consistent theming
- **Shared Components:** Reusable UI elements (buttons, inputs, cards)
- **Layout Templates:** Consistent page structure

### 9.2 State Management Scalability

**Current:** Local state with React hooks  
**Future:** Consider Redux/Zustand for complex state needs

### 9.3 API Integration

- **Centralized:** API service layer (to be created)
- **Error Handling:** Consistent error boundaries
- **Caching:** Future implementation of React Query

---

## 10. Future Enhancements

### 10.1 Planned Features

1. **Real-time Notifications**

   - WebSocket integration for live updates
   - Push notifications for issue status changes

2. **Analytics Dashboard**

   - Issue resolution metrics
   - Category-wise statistics
   - Geographic heat maps

3. **Advanced Search**

   - Full-text search
   - Proximity-based search
   - Machine learning categorization

4. **Offline Support**

   - Progressive Web App (PWA)
   - Service worker for offline access
   - IndexedDB for local storage

5. **Multi-language Support**
   - i18n internationalization
   - Regional language support

### 10.2 Technical Improvements

1. **Testing**

   - Unit tests (Jest, React Testing Library)
   - Integration tests
   - E2E tests (Playwright/Cypress)

2. **Accessibility**

   - WCAG 2.1 AA compliance
   - Screen reader optimization
   - Keyboard navigation improvements

3. **Performance**
   - Image lazy loading
   - Virtual scrolling for large lists
   - CDN integration for assets

---

## Conclusion

This Software Design Document provides a comprehensive overview of the CityCare frontend architecture, design patterns, and technical implementation. The system is built with modern web technologies focusing on user experience, security, and scalability. The modular component-based architecture ensures maintainability and future extensibility.

---

**Document Control**

| Version | Date         | Author           | Changes         |
| ------- | ------------ | ---------------- | --------------- |
| 1.0     | Oct 14, 2025 | Development Team | Initial version |
