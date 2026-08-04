# TravelHub Pro - B2B Travel Management Platform

A comprehensive enterprise SaaS platform for managing travel agencies, bookings, payments, and operations.

## Features

- **Multi-Agency Support**: Manage unlimited travel agencies through a unified platform
- **Real-time Booking System**: Create and track bookings with automatic slot management
- **Manual Payment Processing**: Support for multiple payment methods with admin approval workflow
- **Wallet Management**: Agency and agent wallet systems for balance tracking
- **Admin Dashboard**: Comprehensive admin portal for management and analytics
- **Agent Portal**: Travel agent dashboard for booking management and sales
- **Premium Landing Page**: Modern, responsive landing page with CTAs
- **Role-Based Access**: 7 different user roles with granular permissions
- **Audit Logging**: Track all user activities and changes
- **Secure Authentication**: JWT-based authentication with refresh tokens

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Express.js patterns
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod for type-safe validation

## Database Schema

The platform includes 25+ tables covering:

- Users & Roles
- Agencies & Agents
- Groups & Tours
- Bookings
- Payments
- Wallet & Top-ups
- Hotels & Flights
- Visa Services
- Invoices
- CRM Activities
- Notifications
- Audit Logs

## Project Structure

```
/app
  /api              # API routes
    /auth          # Authentication endpoints
    /admin         # Admin management endpoints
    /bookings      # Booking management
    /payments      # Payment processing
    /groups        # Tour groups
    /wallet        # Wallet management
  /dashboard        # Admin dashboard
  /agent           # Agent portal
  /login           # Login page
  /register        # Registration page
  /layout.tsx      # Root layout

/components
  /landing         # Landing page components
    - nav-bar.tsx
    - hero.tsx
    - features.tsx
    - testimonials.tsx
    - cta.tsx
    - footer.tsx

/lib
  - auth.ts        # Authentication utilities
  - middleware.ts  # Auth middleware
  - utils.ts       # Utility functions

/prisma
  - schema.prisma  # Database schema
  - migrations/    # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Initialize the database:
```bash
pnpm prisma migrate dev --name init
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

```
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## User Roles

1. **SUPER_ADMIN** - Full platform access
2. **ADMIN** - Administrative functions
3. **FINANCE_ADMIN** - Payment and financial management
4. **BOOKING_MANAGER** - Booking operations
5. **SUPPORT_STAFF** - Customer support
6. **TRAVEL_AGENT** - Agent portal access
7. **CUSTOMER** - End user access

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking

### Groups
- `GET /api/groups` - List available tours

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Submit payment

### Wallet
- `GET /api/wallet` - Get wallet info
- `POST /api/wallet` - Request wallet top-up

### Admin
- `GET /api/admin/agencies` - List agencies
- `POST /api/admin/agencies/[id]/approve` - Approve/reject agency

## Security Features

- JWT-based authentication with 15-minute expiration
- Refresh token rotation with 7-day expiration
- Bcrypt password hashing with salt rounds
- Role-based access control (RBAC)
- Input validation with Zod
- Secure cookie handling (HttpOnly, Secure, SameSite)
- CORS protection

## Deployment

The application can be deployed to Vercel, AWS, or any Node.js hosting provider.

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy

### Database Migration for Production

For production deployment, consider migrating to:
- PostgreSQL with Neon
- MySQL with PlanetScale
- AWS Aurora

Update the `prisma/schema.prisma` datasource provider accordingly.

## Performance Optimizations

- Static site generation for public pages
- API route caching
- Database query optimization with indexing
- Tailwind CSS v4 purging
- Next.js automatic code splitting

## Future Enhancements

- Real-time notifications with WebSockets
- Email notification system
- PDF invoice generation
- Multi-currency support
- Advanced analytics and reporting
- Mobile app (React Native)
- API rate limiting
- Payment gateway integration

## License

Proprietary - TravelHub Pro

## Support

For support, contact: support@travelhubpro.com

## Contributing

Contributions are welcome! Please follow the existing code style and patterns.

---

**TravelHub Pro** - Making travel management effortless
