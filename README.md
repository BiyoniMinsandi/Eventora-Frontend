<<<<<<< HEAD
# Eventora-Frontend
=======
# Eventora - Event Vendor Marketplace

A complete event vendor marketplace application built with **Next.js 16** and **Tailwind CSS 4**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Custom Components
- **Forms**: React Hook Form + Zod
- **State Management**: React Context API
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Features

### Authentication System
- ✅ User registration with role selection (Customer, Vendor)
- ✅ Login with email and password
- ✅ Protected routes for different user roles
- ✅ Session persistence with localStorage
- ✅ Auto-redirect based on user role
- ✅ Demo accounts for testing

### User Roles

1. **Customer**
   - Browse vendors
   - Make bookings
   - View booking history
   - Message vendors

2. **Vendor**
   - Manage bookings
   - View analytics
   - Update portfolio
   - Respond to customer requests
   - Requires admin approval before activation

3. **Admin**
   - User management
   - Vendor approvals
   - System analytics
   - Dispute resolution
   - Content moderation

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

The app includes a fully functional authentication system with localStorage-based persistence.

### Demo Accounts

You can use these pre-configured demo accounts:

- **Customer**: 
  - Email: `customer@example.com`
  - Password: `demo123`

- **Vendor**: 
  - Email: `vendor@example.com`
  - Password: `demo123`

- **Admin**: 
  - Email: `admin@example.com`
  - Password: `demo123`

### Register New Account

1. Go to `/register`
2. Choose account type (Customer or Vendor)
3. Fill in the registration form
4. For customers: Auto-login and redirect to dashboard
5. For vendors: Account requires admin approval

### How It Works

- **Registration**: User data is stored in localStorage with a unique ID
- **Login**: Credentials are validated against stored users
- **Session**: Current user data is persisted in localStorage
- **Protection**: Dashboard routes check authentication and role permissions
- **Logout**: Clears session data and redirects to login

## Project Structure

```
app/
├── login/              # Login page
├── register/           # Registration page
├── customer/           # Customer dashboard & features
├── vendor/             # Vendor dashboard & features
├── admin/              # Admin dashboard & features
└── vendors/            # Public vendor directory

components/
├── auth-provider.tsx   # Authentication context
├── protected-route.tsx # Route protection component
├── layout/             # Header, Footer, Sidebar
└── ui/                 # Reusable UI components

lib/
├── auth.ts             # Authentication utilities
└── utils.ts            # Helper functions
```

## Key Files

- `lib/auth.ts` - Authentication logic and localStorage management
- `components/auth-provider.tsx` - React Context for auth state
- `components/protected-route.tsx` - HOC for protected routes
- `app/login/page.tsx` - Login page with validation
- `app/register/page.tsx` - Registration with role selection

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Features Overview

### Customer Features
- Browse vendor marketplace
- View vendor profiles and portfolios
- Request bookings
- Track booking status
- Rate and review vendors
- Message vendors
- Manage profile and settings

### Vendor Features
- Business profile management
- Portfolio showcase
- Booking request management
- Calendar and scheduling
- Analytics dashboard
- Customer messaging
- Reviews and ratings

### Admin Features
- User management (customers & vendors)
- Vendor approval system
- Platform analytics
- Dispute resolution
- Content moderation
- System settings

## Styling

The app uses Tailwind CSS 4 with a custom design system:

- **Colors**: Deep Indigo (Primary), Soft Rose (Secondary), Warm Gold (Accent)
- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile-first design
- **Components**: Consistent design language using Radix UI primitives

## Security Notes

⚠️ **Important**: This implementation uses localStorage for demonstration purposes only.

For production, you should:
- Use a backend API for authentication
- Store passwords securely with bcrypt/argon2
- Use JWT or session tokens
- Implement rate limiting
- Add CSRF protection
- Use HTTPS only
- Validate all inputs server-side

## Future Enhancements

- Backend API integration
- Database persistence
- Email verification
- Password reset functionality
- OAuth providers (Google, Facebook)
- Two-factor authentication
- Real-time messaging
- Payment integration
- Advanced search and filtering
- Notification system

## License

This project is for demonstration purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.
>>>>>>> 00f1789 (Create frontend of Eventora)
