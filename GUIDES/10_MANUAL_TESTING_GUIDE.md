# Manual Testing Guide for SaaStastic

**Last Updated**: October 7, 2025  
**Purpose**: Simple step-by-step instructions for testing subscription features manually

---

## 🎯 What is Manual Testing?

Manual testing means **you** (a real person) click through your website to make sure everything works correctly - just like your customers would use it. Think of it like test driving a car before buying it.

---

## 🚀 Before You Start

### What You Need:
1. **Your SaaStastic website running** - Either on your computer or on the internet
2. **A Stripe account** - Set to "Test Mode" (the toggle switch in Stripe dashboard)
3. **Test credit card numbers** from Stripe (these are fake cards that won't charge real money)

### Important: Always Use Test Mode!
- In your Stripe dashboard, make sure the toggle says **"Test Mode"** 
- Never use real credit card numbers during testing
- Test mode data is completely separate from real customer data

---

## 📋 Complete Testing Checklist

### Test 1: Sign Up & Company Creation ✅
**What you're testing**: Can a new user create an account?

1. Open your website in a private/incognito browser window (this simulates a new user)
2. Click "Sign Up" or "Get Started"
3. Fill out the signup form
4. Create your company/organization name
5. **Expected result**: You should land on the dashboard

**What could go wrong**: If you get an error, the authentication might not be set up correctly.

---

### Test 2: View Pricing & Plans ✅
**What you're testing**: Can users see what they can buy?

1. While logged in, go to the Pricing page (usually `/pricing`)
2. Look at each plan (Starter, Professional, Enterprise)
3. **Expected result**: You should see:
   - Plan names and prices
   - Features listed for each plan
   - "Subscribe" or "Get Started" buttons

**What could go wrong**: If prices don't show, check your plan configuration.

---

### Test 3: Subscribe to a Plan ✅
**What you're testing**: Can users actually buy a subscription?

1. Click "Subscribe" on any plan
2. You should be taken to a Stripe checkout page
3. Use a test card number: **4242 4242 4242 4242**
   - Expiry: Any future date (like 12/25)
   - CVC: Any 3 digits (like 123)
   - ZIP: Any 5 digits (like 12345)
4. Click "Pay"
5. **Expected result**: You should return to your dashboard with a success message

**What could go wrong**: 
- If the page doesn't redirect to Stripe, your Stripe API keys might be wrong
- If payment fails, make sure you're using the test card number exactly as shown

---

### Test 4: Test Failed Payment ✅
**What you're testing**: Does the app handle payment failures correctly?

1. Try to subscribe again (or use a different plan)
2. This time use the "declined card" number: **4000 0000 0000 0002**
3. Click "Pay"
4. **Expected result**: You should see an error message saying the card was declined
5. You should NOT get a subscription

**What could go wrong**: If the error message is confusing or scary, you might need to improve the error handling.

---

### Test 5: View Billing Portal ✅
**What you're testing**: Can users manage their subscription?

1. Go to your dashboard
2. Find and click "Billing" or "Manage Subscription"
3. **Expected result**: You should be taken to Stripe's customer portal
4. You should see:
   - Your current plan
   - Your payment method
   - Billing history (invoices)
   - Option to cancel subscription

**What could go wrong**: If you get a "no subscription" error, Test 3 might not have worked.

---

### Test 6: Cancel Subscription ✅
**What you're testing**: Can users cancel when they want to?

1. From the billing portal, click "Cancel subscription"
2. Confirm the cancellation
3. **Expected result**: 
   - You should see confirmation that subscription is cancelled
   - The cancellation should show in your dashboard
   - You might see "active until [end date]" - this is normal!

**What could go wrong**: If cancellation doesn't work, check webhook settings (see Advanced Testing below).

---

## 🔄 What Are Webhooks? (Simple Explanation)

**Webhooks** are like text messages from Stripe to your website. When something happens in Stripe (like a payment succeeds or a subscription cancels), Stripe sends a message to your website saying "Hey! This just happened!"

Your website needs to:
1. Receive the message (webhook)
2. Update the database
3. Send a confirmation back to Stripe

**Why this matters for testing**: Sometimes there's a delay between when Stripe processes something and when your website updates. This is normal!

---

## 🧪 Advanced Testing (Optional)

### Testing Subscription Changes

These tests require an **active subscription** first (complete Test 3 above):

#### Plan Upgrade
1. Go to pricing page
2. Subscribe to a more expensive plan
3. **Expected result**: Upgrade should happen immediately
4. Check billing portal to confirm new plan

#### Plan Downgrade  
1. Go to pricing page
2. Subscribe to a less expensive plan
3. **Expected result**: Downgrade usually happens at end of current billing period
4. Check billing portal - it should show "changes on [date]"

**Why these are optional**: These involve complex webhook processing and timing. They're important for production but can be tested when you're ready to launch.

---

## 🐛 What If Something Breaks?

### Quick Troubleshooting:

**Problem**: Checkout page doesn't load
- **Fix**: Check that your Stripe API keys are correct in your `.env` file
- Make sure you're using TEST keys (start with `pk_test_` and `sk_test_`)

**Problem**: Payment succeeds but dashboard doesn't update
- **Fix**: This is usually a webhook issue
- Check that webhooks are configured in Stripe dashboard
- Look for webhook errors in Stripe dashboard → Developers → Webhooks

**Problem**: Error says "No company found"
- **Fix**: Log out and log back in
- Make sure you completed company creation
- Check that your user has a company in the database

**Problem**: "Permission denied" errors
- **Fix**: This is an RBAC (permission) issue
- Make sure your user role is OWNER or ADMIN
- Check that roles were created for your company

---

## 📊 What Good Testing Looks Like

After completing all tests, you should have:
- ✅ Successfully created an account
- ✅ Subscribed to at least one plan
- ✅ Tested a failed payment
- ✅ Accessed the billing portal
- ✅ Successfully cancelled a subscription
- ✅ All features working smoothly

**Pro tip**: Test on both your computer AND your phone to make sure it works everywhere!

---

## 🚀 When to Use Staging vs Production

### Your Computer (localhost)
**When to use**: During development and initial testing
- **Pros**: Fast, easy to fix bugs immediately
- **Cons**: Only you can access it
- **Use test mode**: Always!

### Staging Environment (staging.yoursite.com)
**When to use**: Before launching to real customers
- **Pros**: Looks exactly like production, team can test
- **Cons**: Requires setup and deployment
- **Use test mode**: Yes! Always use test mode in staging

**Think of staging as**: A dress rehearsal before opening night

### Production (yoursite.com)
**When to use**: Only when everything works in staging
- **Pros**: Real customers can use it
- **Cons**: Bugs affect real people and real money!
- **Use test mode**: NO! Use LIVE mode here

**Think of production as**: Your real business running with real customers

---

## ✅ Ready for Production?

Before switching to production (real customers), make sure:
- [ ] All 6 basic tests pass without errors
- [ ] You've tested on multiple devices (computer, phone, tablet)
- [ ] Error messages are clear and helpful (not scary)
- [ ] You have real Stripe API keys ready (LIVE keys, not test)
- [ ] Your team has tested everything in staging first
- [ ] You have a plan for monitoring after launch

---

## 📞 Need Help?

If tests are failing and you can't figure out why:
1. Check the browser console for error messages (F12 key)
2. Check your server logs for errors
3. Check Stripe dashboard → Developers → Logs
4. Look at the test results in `tests/e2e/` and `tests/unit/`

**Remember**: It's better to find bugs during testing than after real customers start using your app!

---

*This guide is written for humans, not robots. If something is confusing, that means we need to improve this guide!*
