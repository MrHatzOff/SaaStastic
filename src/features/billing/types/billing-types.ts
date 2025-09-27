// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users?: number;
    storage?: number; // in GB
    apiCalls?: number;
    [key: string]: number | undefined;
  };
}

// Billing Portal
export interface BillingPortalSession {
  url: string;
  return_url: string;
}

// Checkout Session
export interface CheckoutSessionData {
  priceId: string;
  companyId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

// Payment Method
export interface PaymentMethodDetails {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

// Invoice
export interface InvoiceDetails {
  id: string;
  number: string | null;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate: Date | null;
  paidAt: Date | null;
  periodStart: Date;
  periodEnd: Date;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
}

// Usage Tracking
export interface UsageMetric {
  metric: string;
  quantity: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Webhook Events
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
    previous_attributes?: unknown;
  };
}

// Subscription Status
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

// Billing Error
export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

// Subscription Update
export interface SubscriptionUpdateData {
  priceId?: string;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: number | 'now';
}

// Price Tier
export interface PriceTier {
  upTo: number | null; // null means unlimited
  unitAmount: number; // in cents
  flatAmount?: number; // in cents
}

// Metered Billing
export interface MeteredBillingData {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  action?: 'increment' | 'set';
}

// Dunning Configuration
export interface DunningConfig {
  maxRetries: number;
  retryDelays: number[]; // days between retries
  finalAction: 'cancel' | 'pause' | 'downgrade';
}

// Billing Summary
export interface BillingSummary {
  currentPlan: SubscriptionPlan | null;
  subscription: {
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  } | null;
  usage: {
    [metric: string]: {
      current: number;
      limit: number;
      percentage: number;
    };
  };
  upcomingInvoice: {
    amountDue: number;
    dueDate: Date;
  } | null;
  paymentMethods: PaymentMethodDetails[];
}

// Stripe Event Types we handle
export const HANDLED_STRIPE_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'payment_method.attached',
  'payment_method.detached',
  'payment_method.updated',
] as const;

export type HandledStripeEvent = typeof HANDLED_STRIPE_EVENTS[number];
