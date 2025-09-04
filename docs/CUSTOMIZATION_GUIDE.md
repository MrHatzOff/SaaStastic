# Customization Guide

This guide explains how to easily customize the generic marketing pages and branding for your specific SaaS application.

## Quick Start Customization

### 1. Update Site Configuration

The main configuration file is located at `src/lib/site-config.ts`. This single file controls most of the branding and content across all marketing pages.

```typescript
export const siteConfig = {
  // Basic Information - UPDATE THESE FIRST
  name: "YourSaaS",
  tagline: "Your Custom Tagline Here",
  description: "Your custom description...",
  
  // URLs
  url: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
  
  // Contact Information
  contact: {
    email: "hello@yourdomain.com",
    phone: "+1 (555) 123-4567",
    // ... update address
  },
  
  // Social Links
  social: {
    twitter: "https://twitter.com/yourhandle",
    linkedin: "https://linkedin.com/company/yourcompany",
    github: "https://github.com/yourcompany",
    discord: "https://discord.gg/yourserver"
  }
}
```

### 2. Customize Features

Update the `features` array in `site-config.ts` to highlight your specific product features:

```typescript
features: [
  {
    title: "Your Feature Name",
    description: "Description of what this feature does for your customers.",
    icon: "🚀" // Use emoji or replace with icon component
  },
  // Add more features...
]
```

### 3. Update Pricing Plans

Modify the `pricing` array to reflect your actual pricing structure:

```typescript
pricing: [
  {
    name: "Starter",
    price: "$29",
    period: "month",
    description: "Perfect for small teams",
    features: [
      "Feature 1",
      "Feature 2",
      // Add your features
    ],
    popular: false
  },
  // Add more plans...
]
```

### 4. Customize FAQ

Update the `faq` array with questions specific to your product:

```typescript
faq: [
  {
    question: "What makes your product different?",
    answer: "Your unique value proposition and differentiators..."
  },
  // Add more Q&As
]
```

### 5. Company Information

Update the `company` section for the About page:

```typescript
company: {
  founded: "2024",
  mission: "Your company mission statement...",
  vision: "Your company vision...",
  values: [
    {
      title: "Your Value",
      description: "What this value means to your company..."
    },
    // Add more values
  ]
}
```

## Advanced Customization

### Colors and Branding

1. **Primary Colors**: Update Tailwind classes throughout the components
   - Replace `blue-600`, `blue-500` etc. with your brand colors
   - Update `tailwind.config.js` to include your custom color palette

2. **Logo**: Replace text logo in `Navigation` component with your logo image:
   ```tsx
   <Link href="/" className="-m-1.5 p-1.5">
     <img src="/your-logo.svg" alt="Your Company" className="h-8 w-auto" />
   </Link>
   ```

### Page Structure

Each marketing page follows this structure:
- `Navigation` - Header with menu
- Hero section - Main headline and CTA
- Content sections - Features, pricing, etc.
- `Footer` - Links and company info

To modify a page:
1. Open the page file (e.g., `src/app/about/page.tsx`)
2. Update the content while keeping the same structure
3. Modify sections as needed for your use case

### Adding New Pages

1. Create a new page file: `src/app/your-page/page.tsx`
2. Follow the same pattern as existing pages
3. Add navigation link in `components/marketing/navigation.tsx`
4. Add footer link in `components/marketing/footer.tsx`

### Custom Components

Create reusable components in `src/components/marketing/`:

```typescript
// src/components/marketing/testimonials.tsx
export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      {/* Your testimonials content */}
    </section>
  )
}
```

Then import and use in your pages.

### Styling Guidelines

- Use Tailwind CSS classes for consistency
- Follow the existing color scheme or update globally
- Maintain responsive design with `sm:`, `md:`, `lg:` prefixes
- Use the existing Card, Button, and Badge components for consistency

### Content Strategy

1. **Headlines**: Make them benefit-focused, not feature-focused
2. **Descriptions**: Focus on solving customer problems
3. **CTAs**: Use action-oriented language ("Get Started", "Try Free")
4. **Social Proof**: Add testimonials, logos, metrics where relevant

### Environment Variables

Update `.env.local` with your specific values:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_COMPANY_NAME="Your Company"
```

## Testing Your Changes

1. Start the development server: `npm run dev`
2. Navigate to each page to verify changes
3. Test responsive design on different screen sizes
4. Verify all links and contact information work correctly

## Deployment Checklist

Before deploying your customized site:

- [ ] Updated all placeholder content in `site-config.ts`
- [ ] Replaced contact information with real details
- [ ] Updated social media links
- [ ] Added your logo and favicon
- [ ] Tested all forms and contact methods
- [ ] Verified pricing information is accurate
- [ ] Updated meta tags for SEO
- [ ] Tested responsive design
- [ ] Checked all internal and external links

## SEO Optimization

Add meta tags to each page:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Your Company',
  description: 'Learn about our mission and values...',
}
```

## Analytics Integration

Add your analytics tracking code to `src/app/layout.tsx`:

```tsx
// Google Analytics, Mixpanel, etc.
```

This guide should help you quickly customize the boilerplate for your specific SaaS application while maintaining the professional design and functionality.
