# 🔗 Stripe Webhook Setup Guide

## 🎯 What Are Webhooks?

Webhooks are how Stripe tells your app when something happens (like a successful payment). Think of them as notifications from Stripe to your app.

## 📍 For Local Testing (Development)

### Step 1: Set Up Webhook in Stripe Dashboard
1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Click:** "Add endpoint"
3. **Endpoint URL:** `http://localhost:3000/api/webhooks/stripe`
4. **Select Events:** Click "Select events" and choose:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click:** "Add endpoint"

### Step 2: Get Webhook Secret
1. **Click on your new webhook** in the list
2. **Copy the "Signing secret"** (starts with `whsec_`)
3. **Add to your `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Step 3: Test It Works
1. **Make a test purchase** on your pricing page
2. **Check Stripe Dashboard → Webhooks → Your endpoint**
3. **You should see:** Successful webhook deliveries

## ⚠️ Important Notes for Local Development

### Webhooks Won't Work Perfectly Locally
- Stripe can't reach `http://localhost:3000` from the internet
- Your app will still work for testing payments
- Webhooks are mainly needed for production

### For Advanced Local Testing (Optional)
If you really want to test webhooks locally:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Use the ngrok URL** in your Stripe webhook:
   - Instead of `http://localhost:3000/api/webhooks/stripe`
   - Use `https://abc123.ngrok.io/api/webhooks/stripe`

## 🚀 For Production Deployment

### Step 1: Update Webhook URL
1. **Go to your Stripe webhook**
2. **Change URL to:** `https://yourdomain.com/api/webhooks/stripe`
3. **Save changes**

### Step 2: Test Production Webhooks
1. **Make a real purchase** (small amount)
2. **Check webhook delivery** in Stripe Dashboard
3. **Verify your app** receives the webhook

## 🔍 How to Check If Webhooks Are Working

### In Stripe Dashboard
1. **Go to:** Webhooks → Your endpoint
2. **Check:** Recent deliveries
3. **Green checkmarks** = Working ✅
4. **Red X marks** = Failed ❌

### In Your App Logs
1. **Check terminal** for webhook logs
2. **Look for:** "Webhook received" messages
3. **Check for errors** in the logs

## 🚨 Troubleshooting

### Webhook Fails with 404 Error
- **Problem:** URL is wrong
- **Fix:** Make sure URL ends with `/api/webhooks/stripe`

### Webhook Fails with 401/403 Error
- **Problem:** Webhook secret is wrong
- **Fix:** Copy the correct signing secret from Stripe

### Webhook Times Out
- **Problem:** Your app is too slow to respond
- **Fix:** Check your webhook handler code for performance issues

## 📝 What Happens When Webhooks Work

1. **Customer pays** on Stripe checkout
2. **Stripe sends webhook** to your app
3. **Your app receives notification**
4. **App updates database** with subscription info
5. **Customer gets access** to features

## 🎯 For Your Current Testing

**Right now, you can test payments without webhooks working perfectly.** 

The important thing is:
- ✅ Checkout redirects to Stripe
- ✅ Payment completes successfully  
- ✅ User gets redirected back to dashboard
- ✅ Success message shows

Webhooks are the "behind the scenes" part that makes sure everything stays in sync. They're crucial for production but not required for basic testing.

## 🔄 Next Steps

1. **Test the payment flow** without worrying about webhooks
2. **Deploy to production** when ready
3. **Set up production webhooks** with your real domain
4. **Monitor webhook delivery** in production

The payment flow will work for testing even if webhooks aren't perfect locally!
