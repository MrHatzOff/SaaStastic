This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Visit `http://localhost:3000` to see your application!

## 📖 Usage Guide

### Customizing Your SaaS

1. **Update Branding** - Edit `src/lib/site-config.ts` to customize:
   - Company name and tagline
   - Features and pricing
   - Contact information
   - FAQ content

2. **Add Your Features** - Create modules in `/modules/your-feature/`:
   - Components in `/components`
   - API routes in `/routes` 
   - Database schemas in `/schemas`

3. **Customize UI** - Modify components in `/src/components/`:
   - Update colors in Tailwind config
   - Add your logo and branding
   - Customize marketing pages

### Multi-Tenant Development

```typescript
// Use company context in components
import { useCurrentCompany } from '@/core/auth/company-provider'

function MyComponent() {
  const company = useCurrentCompany()
  // Component automatically scoped to current company
}

// API routes automatically enforce tenant isolation
export const GET = withApiMiddleware(handler, {
  requireAuth: true,
  requireCompany: true, // Ensures tenant context
})
```

## 🏢 Multi-Tenancy

This boilerplate implements **row-level security** with automatic tenant isolation:

- **Database Level** - All queries automatically scoped by `companyId`
- **API Level** - Middleware enforces company context on all endpoints
- **UI Level** - Components receive tenant-aware data
- **Authentication** - Clerk integration with company switching

See [TENANTING.md](./docs/TENANTING.md) for detailed architecture.

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📁 Project Structure

### Core Directories

- **`/core`** - Business logic and shared services
  - `/auth` - Authentication and company context
  - `/db` - Database client with tenant isolation
  - `/automation` - Background jobs and workflows

- **`/modules`** - Feature-specific code
  - Each module contains its own components, routes, and schemas
  - Promotes modularity and code organization

- **`/src/app`** - Next.js App Router
  - Pages, layouts, and API routes
  - Marketing pages and dashboard

- **`/src/components`** - Reusable UI components
  - `/ui` - Base components (Button, Card, etc.)
  - `/marketing` - Marketing page components

### Key Files

- `site-config.ts` - Centralized configuration for easy customization
- `middleware.ts` - Authentication and routing middleware
- `schema.prisma` - Database schema with multi-tenant design
- `api-middleware.ts` - API request handling and validation

## 🔧 Configuration

### Site Configuration
Edit `src/lib/site-config.ts` to customize:
- Company information
- Features and pricing
- Contact details
- FAQ content

### Environment Variables
See `.env.example` for all available options:
- Database connections
- Authentication keys
- Feature flags
- External service configurations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database
- **Development**: Local PostgreSQL
- **Production**: Neon, Supabase, or any PostgreSQL provider

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- [**Customization Guide**](./docs/CUSTOMIZATION_GUIDE.md) - How to adapt for your SaaS
- [**Multi-Tenancy Guide**](./docs/TENANTING.md) - Architecture and best practices
- [**API Documentation**](./docs/API.md) - Endpoint reference
- [**Contributing Guide**](./docs/CONTRIBUTING.md) - Development workflow

## 🧪 Testing

```bash
# Unit tests with Vitest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Test specific tenant isolation
npm run test:tenancy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 Email: support@yourdomain.com

## 🙏 Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database ORM
- [Clerk](https://clerk.dev/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Ready to build your SaaS?** Start customizing this boilerplate for your specific needs!
