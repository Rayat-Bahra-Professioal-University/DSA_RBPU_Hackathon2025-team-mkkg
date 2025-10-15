# CityCare - Civic Issue Reporting Portal

![CityCare Banner](https://via.placeholder.com/1200x300/0a0a0f/22c55e?text=CityCare+-+Civic+Issue+Reporting+Portal)

**A modern, user-friendly platform for citizens to report and track civic issues.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?logo=vite)](https://vitejs.dev)
[![Clerk](https://img.shields.io/badge/Clerk-5.7.4-6C47FF)](https://clerk.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Features

### 🔐 **Authentication**

- Secure authentication powered by Clerk
- Support for email/password and OAuth (Google, Microsoft, Apple)
- Protected routes and session management

### 📊 **Dashboard**

- Real-time statistics (Total, Pending, Resolved issues)
- Paginated issue list with status indicators
- Quick access to all reported issues

### ✍️ **Create Issue**

- Multi-category support (Potholes, Streetlights, Waste Management, etc.)
- Interactive Google Maps integration for precise location
- Voice-to-text description using speech recognition
- Image/video attachments (up to 5 files, 10MB each)
- Priority marking for urgent issues
- Form validation and error handling

### 🔍 **Search & Filter**

- Search by registration number
- Advanced filters: Status, Category, Date range
- Results with detailed information
- Direct navigation to issue details

### 📋 **Issue Details**

- Complete issue information display
- Status timeline with history
- Image gallery for attachments
- Location with coordinates and address
- Contact information (excluding reporter identity for privacy)

### 👤 **User Management**

- Profile viewing and editing (Clerk integration)
- Password change with OAuth detection
- Account deletion with confirmation
- Notification preferences

### 🎨 **Design**

- Dark theme with green nature-inspired accents
- Fully responsive (Mobile, Tablet, Desktop)
- Smooth animations and transitions
- Accessible UI components

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- npm or yarn
- Clerk account ([Sign up](https://clerk.com))
- Google Maps API key ([Get key](https://console.cloud.google.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Rayat-Bahra-Professioal-University/DSA_RBPU_Hackathon2025-team-mkkg.git
   cd DSA_RBPU_Hackathon2025-team-mkkg/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env.local` file in the frontend directory:

   ```env
   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

   # Google Maps API
   VITE_GOOGLE_MAPS_API_KEY=AIzaxxxxx
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**

   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
frontend/
├── docs/                      # 📚 Complete documentation
│   ├── README.md             # Documentation index
│   ├── SDD.md                # Software Design Document
│   ├── API_MODELS.md         # Data models & schemas
│   ├── API_ENDPOINTS.md      # REST API specification
│   └── BACKEND_SETUP.md      # Backend implementation guide
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable components
│   │   ├── layouts/          # Layout wrappers
│   │   ├── navbar/           # Navigation bar
│   │   └── sidebar/          # Sidebar menu
│   ├── pages/                # Route-based pages
│   │   ├── dashboard/        # Dashboard view
│   │   ├── create-issue/     # Issue creation form
│   │   ├── issue-details/    # Issue detail page
│   │   ├── search-complaints/ # Search interface
│   │   ├── profile/          # User profile
│   │   ├── change-password/  # Password management
│   │   └── delete-account/   # Account deletion
│   ├── App.jsx               # Root component
│   ├── App.css               # Global styles
│   ├── main.jsx              # Entry point
│   └── index.css             # Base styles
├── .env.local                # Environment variables (create this)
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

---

## 🎨 Tech Stack

### Frontend Core

- **React 18.3.1** - UI library
- **Vite 5.4.10** - Build tool & dev server
- **React Router 6.27.0** - Client-side routing

### Authentication & Authorization

- **Clerk 5.7.4** - Complete auth solution
- OAuth providers (Google, Microsoft, Apple)

### Forms & Validation

- **React Hook Form 7.53.2** - Form state management
- Custom validation rules

### Maps & Location

- **Google Maps JavaScript API** - Interactive maps
- Geolocation support
- Draggable markers

### Speech Recognition

- **react-speech-recognition 3.10.0** - Voice-to-text
- Browser Web Speech API integration

### UI & Styling

- Custom CSS with CSS variables
- Responsive design (Mobile-first)
- Dark theme with green accents (#22c55e)

### Icons

- **react-icons** - Icon library (Feather Icons)

---

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

| Document                                          | Description                               |
| ------------------------------------------------- | ----------------------------------------- |
| [📘 Documentation Index](./docs/README.md)        | Overview of all documentation             |
| [🏗️ Software Design Document](./docs/SDD.md)      | Architecture, design patterns, components |
| [📊 API Data Models](./docs/API_MODELS.md)        | Data structures, schemas, validation      |
| [🔌 API Endpoints](./docs/API_ENDPOINTS.md)       | REST API specification with examples      |
| [⚙️ Backend Setup Guide](./docs/BACKEND_SETUP.md) | Complete backend implementation guide     |

---

## 🔧 Configuration

### Clerk Setup

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy **Publishable Key** from API Keys section
4. Add to `.env.local`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

### Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps JavaScript API**
3. Create API key from Credentials
4. Add to `.env.local`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaxxxxx
   ```

---

## 🎯 Usage Guide

### Reporting an Issue

1. **Sign in** with your account
2. Navigate to **Create Complaint**
3. Fill in the form:
   - Select issue category
   - Write description (or use voice input)
   - Pin location on map
   - Upload photos/videos (optional)
   - Mark as urgent (if applicable)
   - Add contact number (optional)
4. Click **Submit** to register issue
5. Note your registration number

### Tracking Issues

1. Go to **Dashboard** to see all your issues
2. Use **Search Complaint** to find specific issues
3. Click **View** on any issue for detailed information
4. Check the timeline for status updates

### Managing Profile

1. Click your profile picture (top right)
2. Select **Manage Account** to edit profile
3. Go to **Change Password** to update password
4. Use **Delete Account** to permanently remove account

---

## 🚧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- ESLint configuration included
- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions

---

## 📱 Responsive Design

CityCare is fully responsive and works seamlessly on:

- 📱 **Mobile** (320px - 767px)
- 📱 **Tablet** (768px - 1023px)
- 💻 **Desktop** (1024px+)

Breakpoints are defined in CSS:

- `@media (max-width: 768px)` - Tablet and below
- `@media (max-width: 480px)` - Mobile devices

---

## 🔐 Security

- ✅ Secure authentication with Clerk
- ✅ Protected routes for authenticated users only
- ✅ Input validation on all forms
- ✅ File upload restrictions (size, type)
- ✅ XSS protection
- ✅ HTTPS in production

---

## 🌐 Browser Support

- ✅ Chrome (recommended for speech recognition)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Speech recognition has limited support in Firefox

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Hackathon Project:** DSA_RBPU_Hackathon2025  
**Team:** team-mkkg  
**University:** Rayat Bahra Professional University

---

## 📞 Support

For issues, questions, or suggestions:

- 🐛 [Report Bugs](https://github.com/Rayat-Bahra-Professioal-University/DSA_RBPU_Hackathon2025-team-mkkg/issues)
- 💡 [Request Features](https://github.com/Rayat-Bahra-Professioal-University/DSA_RBPU_Hackathon2025-team-mkkg/issues)
- 📧 Contact development team

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for authentication
- [Google Maps Platform](https://developers.google.com/maps) for mapping services
- [React Icons](https://react-icons.github.io/react-icons/) for icon library
- [Unsplash](https://unsplash.com) for placeholder images

---

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Analytics dashboard for authorities
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered issue categorization
- [ ] Community voting system
- [ ] Progressive Web App (PWA)

---

**Made with ❤️ for better civic governance**

---

_Last updated: October 14, 2025_

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
