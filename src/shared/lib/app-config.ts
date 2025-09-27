/**
 * Application Configuration
 * 
 * 🎯 CUSTOMIZE THIS FILE TO MAKE SAASTASTIC YOUR OWN!
 * 
 * This is the main configuration file for your SaaS application.
 * Update these values to customize branding, features, and business logic.
 * 
 * After updating this file, restart your development server.
 */

export const appConfig = {
  // 🏢 BUSINESS INFORMATION
  // Update these with your company details
  business: {
    name: "SaaStastic",
    legalName: "SaaStastic Inc.",
    tagline: "Your Multi-Tenant SaaS Solution",
    description: "Build and scale your B2B SaaS application with our secure, multi-tenant boilerplate.",
    
    // Domain and URLs
    domain: "saastastic.com", // Your production domain (without https://)
    url: process.env.NEXT_PUBLIC_APP_URL || "https://saastastic.com",
    
    // Contact Information
    contact: {
      support: "support@saastastic.com",
      sales: "sales@saastastic.com", 
      noreply: "noreply@saastastic.com",
      phone: "+1 (555) 123-4567",
      address: {
        street: "123 Innovation Drive",
        city: "San Francisco", 
        state: "CA",
        zip: "94105",
        country: "United States"
      }
    },

    // Social Media Links
    social: {
      twitter: "https://twitter.com/saastastic",
      linkedin: "https://linkedin.com/company/saastastic", 
      github: "https://github.com/saastastic",
      discord: "https://discord.gg/saastastic",
      youtube: "", // Optional
      facebook: "", // Optional
    },

    // Legal Links
    legal: {
      privacy: "/privacy",
      terms: "/terms", 
      cookies: "/cookies",
      security: "/security"
    }
  },

  // 💰 PRICING & BILLING
  // Configure your subscription plans
  billing: {
    currency: "USD",
    taxRate: 0, // Set to your tax rate (e.g., 0.08 for 8%)
    
    // Subscription Plans - Update these to match your Stripe products
    plans: {
      starter: {
        name: "Starter",
        description: "Perfect for small teams getting started",
        price: 29, // Monthly price in dollars
        yearlyPrice: 290, // Yearly price (optional discount)
        stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY,
        features: [
          "Up to 5 team members",
          "10GB storage", 
          "Basic support",
          "Core features"
        ],
        limits: {
          users: 5,
          storage: 10, // GB
          apiCalls: 10000, // per month
        }
      },
      
      professional: {
        name: "Professional", 
        description: "For growing businesses that need more",
        price: 99,
        yearlyPrice: 990,
        stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
        features: [
          "Up to 25 team members",
          "100GB storage",
          "Priority support", 
          "Advanced features",
          "API access"
        ],
        limits: {
          users: 25,
          storage: 100,
          apiCalls: 100000,
        },
        popular: true
      },
      
      enterprise: {
        name: "Enterprise",
        description: "For large organizations with custom needs", 
        price: 299,
        yearlyPrice: 2990,
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
        features: [
          "Unlimited team members",
          "Unlimited storage",
          "24/7 dedicated support",
          "Custom integrations", 
          "SLA guarantee"
        ],
        limits: {
          users: -1, // -1 means unlimited
          storage: -1,
          apiCalls: -1,
        }
      }
    },

    // Trial Settings
    trial: {
      enabled: true,
      days: 14,
      plan: "professional" // Which plan to trial
    }
  },

  // 🎨 BRANDING & UI
  // Customize the look and feel
  branding: {
    // Logo Configuration
    logo: {
      text: "SaaStastic", // Text logo fallback
      // Add your logo files to /public/images/
      light: "/images/logo-light.svg", // Logo for light mode
      dark: "/images/logo-dark.svg",   // Logo for dark mode
      favicon: "/favicon.ico",
      appleTouchIcon: "/apple-touch-icon.png"
    },

    // Color Theme (Tailwind CSS classes)
    colors: {
      primary: "blue", // Primary brand color
      accent: "indigo", // Accent color
    },

    // Font Configuration
    fonts: {
      sans: "Inter", // Main font family
      mono: "JetBrains Mono" // Code font family
    }
  },

  // ⚙️ FEATURES & FUNCTIONALITY
  // Enable/disable features for your SaaS
  features: {
    // Core Features
    billing: true,
    teams: true,
    invitations: true,
    fileUploads: true,
    
    // Advanced Features
    analytics: true,
    auditLogs: true,
    apiAccess: true,
    webhooks: false,
    
    // Admin Features
    adminPortal: true,
    impersonation: true, // For customer support
    
    // Marketing Features
    blog: false,
    changelog: false,
    statusPage: false,
    
    // Integration Features
    sso: false, // Single Sign-On
    ldap: false,
    slack: false,
    zapier: false
  },

  // 📧 EMAIL CONFIGURATION
  // Email templates and settings
  email: {
    from: {
      name: "SaaStastic Team",
      address: "noreply@saastastic.com"
    },
    
    // Email Templates
    templates: {
      welcome: {
        subject: "Welcome to SaaStastic!",
        // Template will be in /emails/welcome.tsx
      },
      invitation: {
        subject: "You've been invited to join {{companyName}} on SaaStastic",
      },
      passwordReset: {
        subject: "Reset your SaaStastic password",
      },
      billing: {
        subject: "Your SaaStastic billing update",
      }
    }
  },

  // 🔒 SECURITY SETTINGS
  security: {
    // Rate Limiting
    rateLimit: {
      api: 100, // requests per minute per IP
      auth: 5,  // auth attempts per minute per IP
    },
    
    // Session Settings
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    },
    
    // CORS Settings
    cors: {
      origins: [
        "https://saastastic.com",
        "https://www.saastastic.com",
        // Add your domains here
      ]
    }
  },

  // 📊 ANALYTICS & MONITORING
  analytics: {
    // Google Analytics
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
    
    // PostHog (Product Analytics)
    posthog: {
      key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST
    },
    
    // Mixpanel (optional)
    mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  // 🚀 DEPLOYMENT SETTINGS
  deployment: {
    // Environment
    environment: process.env.NODE_ENV || "development",
    
    // Database
    database: {
      provider: "postgresql", // or "mysql", "sqlite"
      ssl: process.env.NODE_ENV === "production"
    },
    
    // CDN Settings (for file uploads)
    cdn: {
      provider: "cloudflare", // or "aws", "vercel"
      bucket: process.env.R2_BUCKET_NAME,
      region: "auto"
    }
  },

  // 🎯 MARKETING CONTENT
  // Content for your marketing pages
  marketing: {
    // Hero Section
    hero: {
      headline: "Build Your SaaS in Days, Not Months",
      subheadline: "Complete multi-tenant boilerplate with authentication, billing, and team management built-in.",
      cta: "Start Free Trial"
    },

    // Value Propositions
    benefits: [
      {
        title: "Save Development Time",
        description: "Skip months of boilerplate coding and focus on your unique features.",
        icon: "⏰"
      },
      {
        title: "Production Ready",
        description: "Built with security, scalability, and best practices from day one.",
        icon: "🚀"
      },
      {
        title: "Multi-Tenant Architecture", 
        description: "Secure tenant isolation and company management out of the box.",
        icon: "🏢"
      }
    ],

    // Social Proof
    testimonials: [
      {
        quote: "SaaStastic saved us 6 months of development time. We launched our MVP in just 2 weeks!",
        author: "Sarah Chen",
        title: "CTO, TechStartup Inc.",
        avatar: "/images/testimonials/sarah.jpg"
      }
      // Add more testimonials
    ],

    // FAQ
    faq: [
      {
        question: "How quickly can I launch my SaaS?",
        answer: "With SaaStastic, you can have a fully functional SaaS application running in under an hour. Most customers launch their MVP within 1-2 weeks."
      },
      {
        question: "Is my data secure?",
        answer: "Yes! We implement enterprise-grade security with tenant isolation, encrypted data, and regular security audits."
      }
      // Add more FAQs
    ]
  }
}

// Type exports for TypeScript
export type AppConfig = typeof appConfig
export type BillingPlan = typeof appConfig.billing.plans.starter
export type FeatureFlags = typeof appConfig.features

// Helper functions
export const getConfig = () => appConfig
export const getPlan = (planId: keyof typeof appConfig.billing.plans) => appConfig.billing.plans[planId]
export const isFeatureEnabled = (feature: keyof typeof appConfig.features) => appConfig.features[feature]
