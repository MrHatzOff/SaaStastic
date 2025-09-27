import Stripe from 'stripe';
import { db } from '@/core/db/client';
import type {
  SubscriptionPlan,
  CheckoutSessionData,
  BillingPortalSession,
  SubscriptionUpdateData,
  PaymentMethodDetails,
  InvoiceDetails,
  MeteredBillingData,
} from '../types/billing-types';
import { BillingError } from '../types/billing-types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams',
    stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    stripeProductId: process.env.STRIPE_PRODUCT_STARTER!,
    price: 2900, // $29/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 5 team members',
      '10 GB storage',
      '1,000 API calls/month',
      'Email support',
      'Basic analytics',
    ],
    limits: {
      users: 5,
      storage: 10,
      apiCalls: 1000,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    stripeProductId: process.env.STRIPE_PRODUCT_PRO!,
    price: 9900, // $99/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 20 team members',
      '100 GB storage',
      '10,000 API calls/month',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    limits: {
      users: 20,
      storage: 100,
      apiCalls: 10000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    stripeProductId: process.env.STRIPE_PRODUCT_ENTERPRISE!,
    price: 29900, // $299/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited team members',
      '1 TB storage',
      'Unlimited API calls',
      'Dedicated support',
      'Custom analytics',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    limits: {
      users: -1, // unlimited
      storage: 1000,
      apiCalls: -1, // unlimited
    },
  },
];

export class StripeService {
  /**
   * Create or retrieve a Stripe customer for a company
   */
  static async createOrRetrieveCustomer(
    companyId: string,
    email: string,
    name: string
  ): Promise<string> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeCustomerId: true },
    });

    if (company?.stripeCustomerId) {
      return company.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        companyId,
      },
    });

    // Update company with Stripe customer ID
    await db.company.update({
      where: { id: companyId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    data: CheckoutSessionData
  ): Promise<Stripe.Checkout.Session> {
    const { priceId, companyId, userId, successUrl, cancelUrl, trialDays } = data;

    // Get or create Stripe customer
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { userId },
          include: { user: true },
        },
      },
    });

    if (!company) {
      throw new BillingError('Company not found', 'COMPANY_NOT_FOUND', 404);
    }

    const user = company.users[0]?.user;
    if (!user) {
      throw new BillingError('User not found', 'USER_NOT_FOUND', 404);
    }

    const customerId = await this.createOrRetrieveCustomer(
      companyId,
      user.email,
      company.name
    );

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          companyId,
          userId,
        },
      },
      metadata: {
        companyId,
        userId,
      },
    });

    return session;
  }

  /**
   * Create billing portal session
   */
  static async createBillingPortalSession(
    companyId: string,
    returnUrl: string
  ): Promise<BillingPortalSession> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeCustomerId: true },
    });

    if (!company?.stripeCustomerId) {
      throw new BillingError('No billing account found', 'NO_BILLING_ACCOUNT', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
      return_url: returnUrl,
    };
  }

  /**
   * Update subscription
   */
  static async updateSubscription(
    companyId: string,
    updateData: SubscriptionUpdateData
  ): Promise<Stripe.Subscription> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeSubscriptionId: true },
    });

    if (!company?.stripeSubscriptionId) {
      throw new BillingError('No active subscription', 'NO_SUBSCRIPTION', 404);
    }

    const subscription = await stripe.subscriptions.retrieve(
      company.stripeSubscriptionId
    );

    const updateParams: Stripe.SubscriptionUpdateParams = {};

    if (updateData.priceId) {
      // Change plan
      updateParams.items = [
        {
          id: subscription.items.data[0].id,
          price: updateData.priceId,
        },
      ];
    }

    if (updateData.cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = updateData.cancelAtPeriodEnd;
    }

    if (updateData.trialEnd) {
      updateParams.trial_end = updateData.trialEnd;
    }

    const updatedSubscription = await stripe.subscriptions.update(
      company.stripeSubscriptionId,
      updateParams
    );

    // Update database
    await this.syncSubscriptionToDatabase(updatedSubscription);

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    companyId: string,
    immediately = false
  ): Promise<Stripe.Subscription> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeSubscriptionId: true },
    });

    if (!company?.stripeSubscriptionId) {
      throw new BillingError('No active subscription', 'NO_SUBSCRIPTION', 404);
    }

    const subscription = immediately
      ? await stripe.subscriptions.cancel(company.stripeSubscriptionId)
      : await stripe.subscriptions.update(company.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

    // Update database
    await this.syncSubscriptionToDatabase(subscription);

    return subscription;
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(companyId: string): Promise<PaymentMethodDetails[]> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeCustomerId: true },
    });

    if (!company?.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: company.stripeCustomerId,
      type: 'card',
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
          }
        : undefined,
      isDefault: false, // Will be set based on default payment method
    }));
  }

  /**
   * Add payment method
   */
  static async addPaymentMethod(
    companyId: string,
    paymentMethodId: string,
    setAsDefault = false
  ): Promise<void> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeCustomerId: true },
    });

    if (!company?.stripeCustomerId) {
      throw new BillingError('No billing account found', 'NO_BILLING_ACCOUNT', 404);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: company.stripeCustomerId,
    });

    if (setAsDefault) {
      // Set as default payment method
      await stripe.customers.update(company.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Sync to database
    await this.syncPaymentMethodToDatabase(paymentMethodId, companyId);
  }

  /**
   * Remove payment method
   */
  static async removePaymentMethod(
    companyId: string,
    paymentMethodId: string
  ): Promise<void> {
    // Verify ownership
    const paymentMethod = await db.paymentMethod.findFirst({
      where: {
        companyId,
        stripePaymentMethodId: paymentMethodId,
      },
    });

    if (!paymentMethod) {
      throw new BillingError('Payment method not found', 'PAYMENT_METHOD_NOT_FOUND', 404);
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Remove from database
    await db.paymentMethod.delete({
      where: { id: paymentMethod.id },
    });
  }

  /**
   * Get invoices
   */
  static async getInvoices(
    companyId: string,
    limit = 10
  ): Promise<InvoiceDetails[]> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeCustomerId: true },
    });

    if (!company?.stripeCustomerId) {
      return [];
    }

    const invoices = await stripe.invoices.list({
      customer: company.stripeCustomerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status || 'draft',
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status === 'paid' && invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    }));
  }

  /**
   * Record usage for metered billing
   */
  static async recordUsage(
    companyId: string,
    data: MeteredBillingData
  ): Promise<void> {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { stripeSubscriptionId: true },
    });

    if (!company?.stripeSubscriptionId) {
      throw new BillingError('No active subscription', 'NO_SUBSCRIPTION', 404);
    }

    await stripe.subscriptionItems.createUsageRecord(
      data.subscriptionItemId,
      {
        quantity: data.quantity,
        timestamp: data.timestamp || Math.floor(Date.now() / 1000),
        action: data.action || 'increment',
      }
    );

    // Also record in our database for analytics
    await db.usageRecord.create({
      data: {
        companyId,
        metric: 'api_calls', // This should be dynamic based on the subscription item
        quantity: data.quantity,
        metadata: {
          subscriptionItemId: data.subscriptionItemId,
          action: data.action,
        },
      },
    });
  }

  /**
   * Sync Stripe subscription to database
   */
  static async syncSubscriptionToDatabase(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const companyId = subscription.metadata.companyId;
    if (!companyId) return;

    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status.toUpperCase() as 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      metadata: subscription.metadata,
    };

    await db.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        ...subscriptionData,
      },
      update: subscriptionData,
    });

    // Update company with subscription ID
    await db.company.update({
      where: { id: companyId },
      data: { stripeSubscriptionId: subscription.id },
    });
  }

  /**
   * Sync Stripe invoice to database
   */
  static async syncInvoiceToDatabase(invoice: Stripe.Invoice): Promise<void> {
    const companyId = invoice.subscription_details?.metadata?.companyId ||
                      invoice.metadata?.companyId;
    
    if (!companyId) return;

    const invoiceData = {
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: (invoice.status?.toUpperCase() as 'DRAFT' | 'OPEN' | 'PAID' | 'UNCOLLECTIBLE' | 'VOID') || 'DRAFT',
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status === 'paid' && invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
      metadata: invoice.metadata || {},
    };

    await db.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        companyId,
        ...invoiceData,
      },
      update: invoiceData,
    });
  }

  /**
   * Sync payment method to database
   */
  static async syncPaymentMethodToDatabase(
    paymentMethodId: string,
    companyId: string
  ): Promise<void> {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    await db.paymentMethod.upsert({
      where: { stripePaymentMethodId: paymentMethodId },
      create: {
        companyId,
        stripePaymentMethodId: paymentMethodId,
        type: paymentMethod.type,
        card: paymentMethod.card
          ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
            }
          : {},
        isDefault: false, // Will be updated based on customer default
      },
      update: {
        card: paymentMethod.card
          ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
            }
          : {},
      },
    });
  }

  /**
   * Get subscription plan by price ID
   */
  static getSubscriptionPlan(priceId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find((plan) => plan.stripePriceId === priceId);
  }

  /**
   * Check if company can use feature based on plan limits
   */
  static async checkFeatureLimit(
    companyId: string,
    feature: string,
    requiredAmount = 1
  ): Promise<boolean> {
    const subscription = await db.subscription.findUnique({
      where: { companyId },
      select: { stripePriceId: true, status: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return false;
    }

    const plan = this.getSubscriptionPlan(subscription.stripePriceId);
    if (!plan) return false;

    const limit = plan.limits[feature];
    if (limit === undefined || limit === -1) return true; // No limit or unlimited

    // Check current usage
    const usage = await this.getCurrentUsage(companyId, feature);
    return usage + requiredAmount <= limit;
  }

  /**
   * Get current usage for a feature
   */
  static async getCurrentUsage(
    companyId: string,
    feature: string
  ): Promise<number> {
    switch (feature) {
      case 'users':
        const userCount = await db.userCompany.count({
          where: { companyId },
        });
        return userCount;

      case 'storage':
        // This would need to be implemented based on your file storage system
        return 0;

      case 'apiCalls':
        // Get usage for current billing period
        const subscription = await db.subscription.findUnique({
          where: { companyId },
          select: { currentPeriodStart: true },
        });

        if (!subscription) return 0;

        const usage = await db.usageRecord.aggregate({
          where: {
            companyId,
            metric: 'api_calls',
            timestamp: { gte: subscription.currentPeriodStart },
          },
          _sum: { quantity: true },
        });

        return usage._sum.quantity || 0;

      default:
        return 0;
    }
  }
}
