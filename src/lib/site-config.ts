/**
 * Site Configuration
 * 
 * Centralized configuration for easy customization of marketing pages.
 * Update these values to customize your SaaS application.
 */

export const siteConfig = {
  // Basic Information
  name: "SaasTastic",
  tagline: "Your Multi-Tenant SaaS Solution",
  description: "Build and scale your B2B SaaS application with our secure, multi-tenant boilerplate. Get started in minutes, not months.",
  
  // URLs
  url: process.env.NEXT_PUBLIC_APP_URL || "https://saastastic.com",
  
  // Contact Information
  contact: {
    email: "hello@saastastic.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States"
    }
  },
  
  // Social Links
  social: {
    twitter: "https://twitter.com/saastastic",
    linkedin: "https://linkedin.com/company/saastastic",
    github: "https://github.com/saastastic",
    discord: "https://discord.gg/saastastic"
  },
  
  // Features for landing page
  features: [
    {
      title: "Multi-Tenant Architecture",
      description: "Built-in tenant isolation ensures your customers' data is secure and separated.",
      icon: "🏢"
    },
    {
      title: "Authentication Ready",
      description: "Clerk integration with company switching and role-based access control.",
      icon: "🔐"
    },
    {
      title: "Database Optimized",
      description: "Prisma ORM with PostgreSQL, including migrations and performance indexes.",
      icon: "🗄️"
    },
    {
      title: "API Middleware",
      description: "Rate limiting, validation, and error handling built into every endpoint.",
      icon: "⚡"
    },
    {
      title: "Modern Stack",
      description: "Next.js 15, TypeScript, Tailwind CSS, and the latest web technologies.",
      icon: "🚀"
    },
    {
      title: "Production Ready",
      description: "Security headers, CORS, environment validation, and deployment scripts.",
      icon: "✅"
    }
  ],
  
  // Pricing plans
  pricing: [
    {
      name: "Starter",
      price: "$29",
      period: "month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic support",
        "Core features"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "month", 
      description: "For growing businesses that need more",
      features: [
        "Up to 25 team members",
        "100GB storage",
        "Priority support",
        "Advanced features",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited team members",
        "Unlimited storage",
        "24/7 dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false
    }
  ],
  
  // FAQ items
  faq: [
    {
      question: "What is multi-tenancy?",
      answer: "Multi-tenancy allows multiple customers (tenants) to use the same application while keeping their data completely isolated and secure. Each tenant has their own workspace but shares the same underlying infrastructure."
    },
    {
      question: "How secure is the data isolation?",
      answer: "We implement tenant isolation at multiple layers: database queries are automatically scoped by tenant ID, API endpoints validate tenant access, and middleware enforces company context throughout the application."
    },
    {
      question: "Can I customize the application?",
      answer: "Absolutely! The boilerplate is designed to be highly customizable. You can modify the branding, add new features, integrate with external services, and adapt it to your specific business needs."
    },
    {
      question: "What technologies are included?",
      answer: "The stack includes Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Clerk authentication, and many other modern tools for building scalable SaaS applications."
    },
    {
      question: "Do you provide support?",
      answer: "Yes! We offer different levels of support depending on your plan. From community support for starter plans to dedicated 24/7 support for enterprise customers."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for an account, choose your plan, and follow our quick start guide. You can have your SaaS application running in minutes with our pre-configured boilerplate."
    }
  ],
  
  // Company information for about page
  company: {
    founded: "2024",
    mission: "To democratize SaaS development by providing secure, scalable, and easy-to-use boilerplates that help developers focus on building great products instead of infrastructure.",
    vision: "A world where any developer can build and launch a successful SaaS business without worrying about complex multi-tenant architecture.",
    values: [
      {
        title: "Security First",
        description: "We prioritize security in every aspect of our platform, ensuring your data and your customers' data is always protected."
      },
      {
        title: "Developer Experience",
        description: "We believe great tools should be easy to use. Our platform is designed with developers in mind, providing clear documentation and intuitive APIs."
      },
      {
        title: "Scalability",
        description: "Built to grow with your business. Our architecture supports everything from small startups to enterprise-level applications."
      },
      {
        title: "Community",
        description: "We're building more than just software - we're building a community of developers who support each other's success."
      }
    ]
  }
}

export type SiteConfig = typeof siteConfig
