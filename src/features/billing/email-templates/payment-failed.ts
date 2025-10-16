/**
 * Payment Failed Email Template
 * 
 * Urgent notification when a payment fails requiring immediate action
 */

export interface PaymentFailedEmailProps {
  customerName: string;
  planName: string;
  amount: number;
  currency: string;
  nextRetryDate?: string;
  portalUrl: string;
}

export function generatePaymentFailedEmail(props: PaymentFailedEmailProps): { subject: string; html: string; text: string } {
  const {
    customerName,
    planName,
    amount,
    currency,
    nextRetryDate,
    portalUrl,
  } = props;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const subject = '⚠️ Payment Failed - Action Required';

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
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .warning-box strong { color: #dc2626; }
    .details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #6b7280; font-weight: 500; }
    .details-value { color: #111827; font-weight: 600; }
    .cta-button { display: inline-block; background: #dc2626; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
    .cta-button:hover { background: #b91c1c; }
    .steps { margin: 20px 0; }
    .step { margin: 12px 0; padding-left: 24px; position: relative; }
    .step::before { content: '→'; position: absolute; left: 0; color: #dc2626; font-weight: bold; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failed</h1>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="warning-box">
        <strong>Action Required:</strong> We were unable to process your payment for your ${planName} subscription.
      </div>
      
      <p>Your payment of <strong>${formattedAmount}</strong> for the ${planName} plan could not be processed. This may be due to:</p>
      
      <ul>
        <li>Insufficient funds</li>
        <li>Expired or invalid payment method</li>
        <li>Card security restrictions</li>
        <li>Billing address mismatch</li>
      </ul>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Plan:</span>
          <span class="details-value">${planName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Amount:</span>
          <span class="details-value">${formattedAmount}</span>
        </div>
        ${nextRetryDate ? `
        <div class="details-row">
          <span class="details-label">Next Retry:</span>
          <span class="details-value">${nextRetryDate}</span>
        </div>
        ` : ''}
      </div>
      
      <h3>What happens next?</h3>
      <div class="steps">
        <div class="step">Update your payment method within 3 days</div>
        <div class="step">We'll automatically retry the payment</div>
        <div class="step">If unsuccessful, your subscription will be paused</div>
      </div>
      
      <center>
        <a href="${portalUrl}" class="cta-button">Update Payment Method</a>
      </center>
      
      <p style="margin-top: 30px;">Need help? Please reply to this email or contact our support team.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated notification about your subscription.</p>
      <p><a href="${portalUrl}">Manage your subscription</a> | <a href="mailto:support@saastastic.com">Contact support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${subject}

Hi ${customerName},

ACTION REQUIRED: We were unable to process your payment for your ${planName} subscription.

Payment Details:
- Plan: ${planName}
- Amount: ${formattedAmount}
${nextRetryDate ? `- Next Retry: ${nextRetryDate}` : ''}

This may be due to insufficient funds, an expired card, security restrictions, or a billing address mismatch.

What happens next?
1. Update your payment method within 3 days
2. We'll automatically retry the payment
3. If unsuccessful, your subscription will be paused

Update your payment method now:
${portalUrl}

Need help? Please reply to this email or contact support@saastastic.com
  `.trim();

  return { subject, html, text };
}
