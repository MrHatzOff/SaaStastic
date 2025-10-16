/**
 * Email Service for Billing Notifications
 * 
 * In development: Logs emails to console
 * In production: Extend to use Resend or other email service
 */

import { 
  generatePaymentFailedEmail, 
  type PaymentFailedEmailProps 
} from '../email-templates/payment-failed';
import { 
  generatePaymentSuccessfulEmail, 
  type PaymentSuccessfulEmailProps 
} from '../email-templates/payment-successful';
import { 
  generateSubscriptionCancelledEmail, 
  type SubscriptionCancelledEmailProps 
} from '../email-templates/subscription-cancelled';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class BillingEmailService {
  /**
   * Send email (currently logs to console in dev, extend for production)
   */
  private static async sendEmail(payload: EmailPayload): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // In development, log to console
      console.log('\n📧 ===== EMAIL NOTIFICATION =====');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log('\n--- Email Content (Text) ---');
      console.log(payload.text);
      console.log('\n--- Email Content (HTML Preview) ---');
      console.log(`HTML email ready (${payload.html.length} bytes)`);
      console.log('================================\n');
    } else {
      // In production, integrate with Resend or other email service
      // TODO: Implement production email sending
      // Example with Resend:
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'billing@saastastic.com',
      //   to: payload.to,
      //   subject: payload.subject,
      //   html: payload.html,
      //   text: payload.text,
      // });
      
      console.warn('⚠️ Production email sending not configured. Email would be sent to:', payload.to);
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedEmail(
    to: string,
    props: PaymentFailedEmailProps
  ): Promise<void> {
    try {
      const { subject, html, text } = generatePaymentFailedEmail(props);
      await this.sendEmail({ to, subject, html, text });
    } catch (error) {
      console.error('Failed to send payment failed email:', error);
      // Don't throw - we don't want email failures to break webhook processing
    }
  }

  /**
   * Send payment successful notification
   */
  static async sendPaymentSuccessfulEmail(
    to: string,
    props: PaymentSuccessfulEmailProps
  ): Promise<void> {
    try {
      const { subject, html, text } = generatePaymentSuccessfulEmail(props);
      await this.sendEmail({ to, subject, html, text });
    } catch (error) {
      console.error('Failed to send payment successful email:', error);
      // Don't throw - we don't want email failures to break webhook processing
    }
  }

  /**
   * Send subscription cancelled notification
   */
  static async sendSubscriptionCancelledEmail(
    to: string,
    props: SubscriptionCancelledEmailProps
  ): Promise<void> {
    try {
      const { subject, html, text } = generateSubscriptionCancelledEmail(props);
      await this.sendEmail({ to, subject, html, text });
    } catch (error) {
      console.error('Failed to send subscription cancelled email:', error);
      // Don't throw - we don't want email failures to break webhook processing
    }
  }
}
