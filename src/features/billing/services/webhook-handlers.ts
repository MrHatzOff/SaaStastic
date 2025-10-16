import Stripe from 'stripe';
import { db } from '@/core/db/client';
import { StripeService } from './stripe-service';
import { BillingEmailService } from './email-service';
import type { HandledStripeEvent } from '../types/billing-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export class WebhookHandlers {
  /**
   * Verify webhook signature
   */
  static async verifyWebhookSignature(
    body: string,
    signature: string
  ): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }
  }

  /**
   * Main webhook handler
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    // Log the event for audit purposes
    await this.logWebhookEvent(event);

    switch (event.type as HandledStripeEvent) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;

      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event);
        break;

      case 'invoice.created':
        await this.handleInvoiceCreated(event);
        break;

      case 'invoice.finalized':
        await this.handleInvoiceFinalized(event);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event);
        break;

      case 'invoice.payment_action_required':
        await this.handlePaymentActionRequired(event);
        break;

      case 'payment_method.attached':
        await this.handlePaymentMethodAttached(event);
        break;

      case 'payment_method.detached':
        await this.handlePaymentMethodDetached(event);
        break;

      case 'payment_method.updated':
        await this.handlePaymentMethodUpdated(event);
        break;

      default:
        // TODO: Add proper logging for unhandled webhook events
        // console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle checkout session completed
   */
  static async handleCheckoutSessionCompleted(
    event: Stripe.Event
  ): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.mode !== 'subscription') return;

    const companyId = session.metadata?.companyId;
    const userId = session.metadata?.userId;

    if (!companyId || !userId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // The subscription will be handled by subscription.created event
    // Here we can track conversion metrics
    await db.eventLog.create({
      data: {
        action: 'subscription.checkout_completed',
        companyId,
        userId,
        metadata: {
          sessionId: session.id,
          customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
          subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
        },
      },
    });
  }

  /**
   * Handle subscription created
   */
  static async handleSubscriptionCreated(
    event: Stripe.Event
  ): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Sync to database
    await StripeService.syncSubscriptionToDatabase(subscription);

    const companyId = subscription.metadata.companyId;
    const userId = subscription.metadata.userId;

    if (companyId && userId) {
      // Log the event
      await db.eventLog.create({
        data: {
          action: 'subscription.created',
          companyId,
          userId,
          metadata: {
            subscriptionId: subscription.id,
            status: subscription.status,
            priceId: subscription.items.data[0].price.id,
          },
        },
      });

      // Send welcome email (implement email service)
      // await EmailService.sendSubscriptionWelcome(companyId);
    }
  }

  /**
   * Handle subscription updated
   */
  static async handleSubscriptionUpdated(
    event: Stripe.Event
  ): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const previousAttributes = event.data.previous_attributes as Record<string, unknown>;

    // Sync to database
    await StripeService.syncSubscriptionToDatabase(subscription);

    const companyId = subscription.metadata.companyId;

    if (companyId) {
      // Get a user for logging (preferably the one who made the change)
      const userCompany = await db.userCompany.findFirst({
        where: { companyId, role: 'OWNER' },
        select: { userId: true },
      });

      if (userCompany) {
        // Log the event
        await db.eventLog.create({
          data: {
            action: 'subscription.updated',
            companyId,
            userId: userCompany.userId,
            metadata: {
              subscriptionId: subscription.id,
              status: subscription.status,
              previousStatus: (previousAttributes?.status as string) || null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              changes: JSON.stringify(previousAttributes || {}),
            },
          },
        });
      }

      // Handle specific status changes
      if (previousAttributes?.status && previousAttributes.status !== subscription.status) {
        await this.handleSubscriptionStatusChange(
          companyId,
          previousAttributes.status as string,
          subscription.status
        );
      }
    }
  }

  /**
   * Handle subscription deleted
   */
  static async handleSubscriptionDeleted(
    event: Stripe.Event
  ): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Sync to database
    await StripeService.syncSubscriptionToDatabase(subscription);

    const companyId = subscription.metadata.companyId;

    if (companyId) {
      // Get a user for logging
      const userCompany = await db.userCompany.findFirst({
        where: { companyId, role: 'OWNER' },
        select: { userId: true, user: { select: { email: true, name: true } } },
      });

      if (userCompany) {
        // Log the event
        await db.eventLog.create({
          data: {
            action: 'subscription.canceled',
            companyId,
            userId: userCompany.userId,
            metadata: {
              subscriptionId: subscription.id,
              canceledAt: subscription.canceled_at,
            },
          },
        });

        // Send cancellation email
        const plan = StripeService.getSubscriptionPlan(subscription.items.data[0].price.id);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // Stripe v19: Access period properties with type assertion
        const sub = subscription as unknown as {
          current_period_end?: number;
          currentPeriodEnd?: number;
        } & Stripe.Subscription;
        
        const periodEnd = sub.current_period_end || sub.currentPeriodEnd || Math.floor(Date.now() / 1000);
        const endDate = new Date(periodEnd * 1000).toLocaleDateString();
        
        await BillingEmailService.sendSubscriptionCancelledEmail(
          userCompany.user.email,
          {
            customerName: userCompany.user.name || userCompany.user.email,
            planName: plan?.name || 'Subscription',
            endDate,
            portalUrl: `${baseUrl}/dashboard/billing`,
            reactivateUrl: `${baseUrl}/dashboard/billing`,
            feedbackUrl: undefined, // Can add feedback form URL later
          }
        );
      }

      // Optionally revoke access or downgrade to free tier
      // await this.handleAccessRevocation(companyId);
    }
  }

  /**
   * Handle trial will end
   */
  static async handleTrialWillEnd(
    event: Stripe.Event
  ): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const companyId = subscription.metadata.companyId;

    if (companyId) {
      // Send trial ending reminder email
      // await EmailService.sendTrialEndingReminder(companyId);

      // Log the event
      const userCompany = await db.userCompany.findFirst({
        where: { companyId, role: 'OWNER' },
        select: { userId: true },
      });

      if (userCompany) {
        await db.eventLog.create({
          data: {
            action: 'subscription.trial_ending',
            companyId,
            userId: userCompany.userId,
            metadata: {
              subscriptionId: subscription.id,
              trialEnd: subscription.trial_end,
            },
          },
        });
      }
    }
  }

  /**
   * Handle invoice created
   */
  static async handleInvoiceCreated(
    event: Stripe.Event
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Sync invoice to database
    // Invoice metadata contains companyId in Stripe v19

    await StripeService.syncInvoiceToDatabase(invoice);
  }

  /**
   * Handle invoice finalized
   */
  static async handleInvoiceFinalized(
    event: Stripe.Event
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    await StripeService.syncInvoiceToDatabase(invoice);

    // Send invoice email
    const companyId = invoice.metadata?.companyId;
    
    if (companyId && invoice.hosted_invoice_url) {
      // await EmailService.sendInvoice(companyId, invoice.hosted_invoice_url);
    }
  }

  /**
   * Handle invoice paid
   */
  static async handleInvoicePaid(
    event: Stripe.Event
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    await StripeService.syncInvoiceToDatabase(invoice);

    const companyId = invoice.metadata?.companyId;

    if (companyId) {
      // Log successful payment
      const userCompany = await db.userCompany.findFirst({
        where: { companyId, role: 'OWNER' },
        select: { userId: true, user: { select: { email: true, name: true } } },
      });

      if (userCompany) {
        await db.eventLog.create({
          data: {
            action: 'invoice.paid',
            companyId,
            userId: userCompany.userId,
            metadata: {
              invoiceId: invoice.id,
              amountPaid: invoice.amount_paid,
              currency: invoice.currency,
            },
          },
        });

        // Send payment successful email
        const subscription = await db.subscription.findUnique({
          where: { companyId },
          select: { stripePriceId: true, currentPeriodEnd: true },
        });

        if (subscription) {
          const plan = StripeService.getSubscriptionPlan(subscription.stripePriceId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          
          await BillingEmailService.sendPaymentSuccessfulEmail(
            userCompany.user.email,
            {
              customerName: userCompany.user.name || userCompany.user.email,
              planName: plan?.name || 'Subscription',
              amount: invoice.amount_paid,
              currency: invoice.currency,
              invoiceNumber: invoice.number || undefined,
              invoiceUrl: invoice.hosted_invoice_url || undefined,
              nextBillingDate: subscription.currentPeriodEnd.toLocaleDateString(),
              portalUrl: `${baseUrl}/dashboard/billing`,
            }
          );
        }
      }
    }
  }

  /**
   * Handle invoice payment failed
   */
  private static async handleInvoicePaymentFailed(
    event: Stripe.Event
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    await StripeService.syncInvoiceToDatabase(invoice);

    const companyId = invoice.metadata?.companyId;

    if (companyId) {
      // Log failed payment
      const userCompany = await db.userCompany.findFirst({
        where: { companyId, role: 'OWNER' },
        select: { userId: true, user: { select: { email: true, name: true } } },
      });

      if (userCompany) {
        await db.eventLog.create({
          data: {
            action: 'invoice.payment_failed',
            companyId,
            userId: userCompany.userId,
            metadata: {
              invoiceId: invoice.id,
              amountDue: invoice.amount_due,
              attemptCount: invoice.attempt_count,
              nextPaymentAttempt: invoice.next_payment_attempt,
            },
          },
        });

        // Send payment failed email with update payment method link
        const subscription = await db.subscription.findUnique({
          where: { companyId },
          select: { stripePriceId: true },
        });

        if (subscription) {
          const plan = StripeService.getSubscriptionPlan(subscription.stripePriceId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          
          await BillingEmailService.sendPaymentFailedEmail(
            userCompany.user.email,
            {
              customerName: userCompany.user.name || userCompany.user.email,
              planName: plan?.name || 'Subscription',
              amount: invoice.amount_due,
              currency: invoice.currency,
              nextRetryDate: invoice.next_payment_attempt 
                ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
                : undefined,
              portalUrl: `${baseUrl}/dashboard/billing`,
            }
          );
        }
      }

      // Implement dunning management
      await this.handleDunning(companyId, invoice);
    }
  }

  /**
   * Handle payment action required
   */
  private static async handlePaymentActionRequired(
    event: Stripe.Event
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    const companyId = invoice.metadata?.companyId;

    if (companyId) {
      // Send email requiring payment action (3D Secure, etc.)
      // await EmailService.sendPaymentActionRequired(companyId, invoice);
    }
  }

  /**
   * Handle payment method attached
   */
  private static async handlePaymentMethodAttached(
    event: Stripe.Event
  ): Promise<void> {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    
    if (!paymentMethod.customer) return;

    // Find company by Stripe customer ID
    const company = await db.company.findFirst({
      where: { stripeCustomerId: paymentMethod.customer as string },
    });

    if (company) {
      await StripeService.syncPaymentMethodToDatabase(
        paymentMethod.id,
        company.id
      );
    }
  }

  /**
   * Handle payment method detached
   */
  private static async handlePaymentMethodDetached(
    event: Stripe.Event
  ): Promise<void> {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    
    // Remove from database
    await db.paymentMethod.deleteMany({
      where: { stripePaymentMethodId: paymentMethod.id },
    });
  }

  /**
   * Handle payment method updated
   */
  private static async handlePaymentMethodUpdated(
    event: Stripe.Event
  ): Promise<void> {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    
    if (!paymentMethod.customer) return;

    // Find company by Stripe customer ID
    const company = await db.company.findFirst({
      where: { stripeCustomerId: paymentMethod.customer as string },
    });

    if (company) {
      await StripeService.syncPaymentMethodToDatabase(
        paymentMethod.id,
        company.id
      );
    }
  }

  /**
   * Handle subscription status change
   */
  private static async handleSubscriptionStatusChange(
    companyId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    // Handle specific transitions
    if (oldStatus === 'trialing' && newStatus === 'active') {
      // Trial converted to paid
      // await EmailService.sendTrialConverted(companyId);
    } else if (newStatus === 'past_due') {
      // Subscription is past due
      // await EmailService.sendSubscriptionPastDue(companyId);
    } else if (newStatus === 'unpaid') {
      // Subscription is unpaid after retries
      // await this.handleAccessRestriction(companyId);
    }
  }

  /**
   * Handle dunning management
   */
  private static async handleDunning(
    companyId: string,
    invoice: Stripe.Invoice
  ): Promise<void> {
    const attemptCount = invoice.attempt_count || 0;

    if (attemptCount >= 3) {
      // After 3 failed attempts, consider restricting access
      // await this.handleAccessRestriction(companyId);
      
      // Send final warning email
      // await EmailService.sendFinalPaymentWarning(companyId);
    } else {
      // Schedule retry notification
      // await EmailService.sendPaymentRetryNotification(companyId, attemptCount);
    }
  }

  /**
   * Log webhook event for audit
   */
  private static async logWebhookEvent(_event: Stripe.Event): Promise<void> {
    // Store webhook events for debugging and audit
    // This could be in a separate table or logging service
    // TODO: Replace with proper structured logging service in production
    // console.log(`Webhook received: ${_event.type}`, {
    //   id: _event.id,
    //   type: _event.type,
    //   created: new Date(_event.created * 1000),
    // });
  }
}
