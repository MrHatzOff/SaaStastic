/**
 * Subscription Cancelled Email Template
 * 
 * Confirmation when a subscription is cancelled
 */

export interface SubscriptionCancelledEmailProps {
  customerName: string;
  planName: string;
  endDate: string;
  portalUrl: string;
  reactivateUrl: string;
  feedbackUrl?: string;
}

export function generateSubscriptionCancelledEmail(props: SubscriptionCancelledEmailProps): { subject: string; html: string; text: string } {
  const {
    customerName,
    planName,
    endDate,
    portalUrl,
    reactivateUrl,
    feedbackUrl,
  } = props;

  const subject = 'Subscription Cancelled - We\'ll Miss You';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .info-box strong { color: #374151; }
    .access-card { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; border: 2px solid #fbbf24; text-align: center; }
    .access-card .icon { font-size: 32px; margin-bottom: 10px; }
    .access-card h3 { margin: 10px 0; color: #92400e; }
    .access-card p { color: #78350f; margin: 5px 0; }
    .details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #6b7280; font-weight: 500; }
    .details-value { color: #111827; font-weight: 600; }
    .cta-button { display: inline-block; background: #059669; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 8px; text-align: center; }
    .cta-button:hover { background: #047857; }
    .cta-button.secondary { background: #2563eb; }
    .cta-button.secondary:hover { background: #1d4ed8; }
    .feature-list { margin: 20px 0; }
    .feature-item { padding: 10px 0; padding-left: 24px; position: relative; }
    .feature-item::before { content: '✓'; position: absolute; left: 0; color: #059669; font-weight: bold; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subscription Cancelled</h1>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="info-box">
        <strong>Confirmed:</strong> Your ${planName} subscription has been cancelled as requested.
      </div>
      
      <div class="access-card">
        <div class="icon">⏰</div>
        <h3>You still have access!</h3>
        <p>Your subscription remains active until <strong>${endDate}</strong></p>
        <p style="font-size: 14px; margin-top: 10px;">Make the most of it before then.</p>
      </div>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Cancelled Plan:</span>
          <span class="details-value">${planName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Access Until:</span>
          <span class="details-value">${endDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Status:</span>
          <span class="details-value">Cancelling (Active until end date)</span>
        </div>
      </div>
      
      <h3>Before you go...</h3>
      <p>We'd love to understand what led to your decision. Your feedback helps us improve for everyone.</p>
      
      ${feedbackUrl ? `
      <center>
        <a href="${feedbackUrl}" class="cta-button secondary">Share Feedback</a>
      </center>
      ` : ''}
      
      <h3>Changed your mind?</h3>
      <p>You can reactivate your subscription anytime before ${endDate}. All your data will be preserved.</p>
      
      <div class="feature-list">
        <div class="feature-item">All your data remains safe and secure</div>
        <div class="feature-item">Reactivate with one click anytime</div>
        <div class="feature-item">Keep your current settings and preferences</div>
      </div>
      
      <center>
        <a href="${reactivateUrl}" class="cta-button">Reactivate Subscription</a>
      </center>
      
      <h3>What happens after ${endDate}?</h3>
      <ul>
        <li><strong>Access ends:</strong> You'll no longer be able to use premium features</li>
        <li><strong>Data preserved:</strong> Your data will be safely stored for 30 days</li>
        <li><strong>Easy return:</strong> Resubscribe anytime to regain full access</li>
      </ul>
      
      <p style="margin-top: 30px;">Thank you for being part of our community. We hope to see you again soon!</p>
    </div>
    
    <div class="footer">
      <p><strong>We're sorry to see you go.</strong></p>
      <p><a href="${portalUrl}">Manage subscription</a> | <a href="mailto:support@saastastic.com">Contact support</a></p>
      <p style="margin-top: 20px; font-size: 12px;">Questions about your cancellation? We're here to help.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${subject}

Hi ${customerName},

Your ${planName} subscription has been cancelled as requested.

YOU STILL HAVE ACCESS!
Your subscription remains active until ${endDate}. Make the most of it before then.

Cancellation Details:
- Cancelled Plan: ${planName}
- Access Until: ${endDate}
- Status: Cancelling (Active until end date)

Before you go...
We'd love to understand what led to your decision. Your feedback helps us improve.
${feedbackUrl ? `Share feedback: ${feedbackUrl}` : ''}

Changed your mind?
You can reactivate your subscription anytime before ${endDate}.

What we'll preserve:
✓ All your data remains safe and secure
✓ Keep your current settings and preferences
✓ Reactivate with one click anytime

Reactivate now: ${reactivateUrl}

What happens after ${endDate}?
- Access ends: You'll no longer be able to use premium features
- Data preserved: Your data will be safely stored for 30 days
- Easy return: Resubscribe anytime to regain full access

Thank you for being part of our community. We hope to see you again soon!

Manage subscription: ${portalUrl}
Questions? Contact support@saastastic.com
  `.trim();

  return { subject, html, text };
}
