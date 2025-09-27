import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookHandlers } from '@/features/billing/services/webhook-handlers';

// Stripe webhooks must use raw body, so we disable body parsing
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text();
    
    // Get the Stripe signature from headers
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature and get the event
    const event = await WebhookHandlers.verifyWebhookSignature(body, signature);

    // Handle the webhook event
    await WebhookHandlers.handleWebhook(event);

    // Return success response
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);

    // Return error response
    // Important: Return 400 for signature verification failures
    // so Stripe knows to retry
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('signature verification')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // For other errors, return 200 to prevent Stripe from retrying
    // but log the error for investigation
    console.error('Webhook processing error:', error);
    return NextResponse.json({ received: true });
  }
}
