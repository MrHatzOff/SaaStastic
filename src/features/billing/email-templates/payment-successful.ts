/**
 * Payment Successful Email Template
 * 
 * Confirmation when a payment is successfully processed
 */

export interface PaymentSuccessfulEmailProps {
  customerName: string;
  planName: string;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  nextBillingDate: string;
  portalUrl: string;
}

export function generatePaymentSuccessfulEmail(props: PaymentSuccessfulEmailProps): { subject: string; html: string; text: string } {
  const {
    customerName,
    planName,
    amount,
    currency,
    invoiceNumber,
    invoiceUrl,
    nextBillingDate,
    portalUrl,
  } = props;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const subject = '✅ Payment Confirmed - Thank You!';

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
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header .checkmark { font-size: 48px; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .success-box { background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .success-box strong { color: #059669; }
    .invoice-card { background: #f9fafb; padding: 24px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .invoice-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .invoice-row:last-child { border-bottom: none; }
    .invoice-label { color: #6b7280; font-weight: 500; }
    .invoice-value { color: #111827; font-weight: 600; }
    .amount-charged { font-size: 36px; color: #059669; font-weight: 700; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #2563eb; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 8px; text-align: center; }
    .cta-button:hover { background: #1d4ed8; }
    .cta-button.secondary { background: #6b7280; }
    .cta-button.secondary:hover { background: #4b5563; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .footer a { color: #2563eb; text-decoration: none; }
    .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Payment Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="success-box">
        <strong>Thank you!</strong> Your payment has been successfully processed.
      </div>
      
      <div class="amount-charged">${formattedAmount}</div>
      
      <p style="text-align: center; color: #6b7280; margin-top: -10px;">charged to your payment method</p>
      
      <div class="invoice-card">
        <h3 style="margin-top: 0; color: #111827;">Payment Details</h3>
        <div class="invoice-row">
          <span class="invoice-label">Plan:</span>
          <span class="invoice-value">${planName}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Amount:</span>
          <span class="invoice-value">${formattedAmount}</span>
        </div>
        ${invoiceNumber ? `
        <div class="invoice-row">
          <span class="invoice-label">Invoice:</span>
          <span class="invoice-value">#${invoiceNumber}</span>
        </div>
        ` : ''}
        <div class="invoice-row">
          <span class="invoice-label">Next Billing Date:</span>
          <span class="invoice-value">${nextBillingDate}</span>
        </div>
      </div>
      
      <p>Your <span class="highlight">${planName}</span> subscription is active and you have full access to all features.</p>
      
      <center>
        ${invoiceUrl ? `<a href="${invoiceUrl}" class="cta-button">View Invoice</a>` : ''}
        <a href="${portalUrl}" class="cta-button secondary">Manage Subscription</a>
      </center>
      
      <h3>What's included in your ${planName} plan?</h3>
      <p>You now have access to all ${planName} features. Check out our documentation to make the most of your subscription.</p>
      
      <p style="margin-top: 30px;">Questions? We're here to help! Reply to this email or contact our support team.</p>
    </div>
    
    <div class="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p><a href="${portalUrl}">Manage subscription</a> | ${invoiceUrl ? `<a href="${invoiceUrl}">Download invoice</a> | ` : ''}<a href="mailto:support@saastastic.com">Contact support</a></p>
      <p style="margin-top: 20px; font-size: 12px;">This is an automated receipt for your subscription payment.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${subject}

Hi ${customerName},

Thank you! Your payment has been successfully processed.

Amount Charged: ${formattedAmount}

Payment Details:
- Plan: ${planName}
- Amount: ${formattedAmount}
${invoiceNumber ? `- Invoice: #${invoiceNumber}` : ''}
- Next Billing Date: ${nextBillingDate}

Your ${planName} subscription is active and you have full access to all features.

${invoiceUrl ? `View your invoice: ${invoiceUrl}` : ''}

Manage your subscription: ${portalUrl}

Questions? Reply to this email or contact support@saastastic.com

Thank you for your business!
  `.trim();

  return { subject, html, text };
}
