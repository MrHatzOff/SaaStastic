import { z } from 'zod';

// Checkout session schema
export const createCheckoutSessionSchema = z.object({
  planName: z.enum(['Starter', 'Professional', 'Enterprise']),
  successUrl: z.string().url('Success URL must be valid'),
  cancelUrl: z.string().url('Cancel URL must be valid'),
  trialDays: z.number().min(0).max(365).optional(),
});

// Update subscription schema
export const updateSubscriptionSchema = z.object({
  priceId: z.string().min(1).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  trialEnd: z.union([z.number(), z.literal('now')]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Cancel subscription schema
export const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().optional(),
  feedback: z.string().optional(),
});

// Add payment method schema
export const addPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  setAsDefault: z.boolean().default(false),
});

// Remove payment method schema
export const removePaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

// Create billing portal session schema
export const createBillingPortalSchema = z.object({
  returnUrl: z.string().url('Return URL must be valid'),
});

// Record usage schema
export const recordUsageSchema = z.object({
  metric: z.enum(['api_calls', 'storage_gb', 'team_members', 'custom']),
  quantity: z.number().min(0),
  timestamp: z.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Get invoices schema
export const getInvoicesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  startingAfter: z.string().optional(),
  endingBefore: z.string().optional(),
});

// Subscription filters schema
export const subscriptionFiltersSchema = z.object({
  status: z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused',
  ]).optional(),
  priceId: z.string().optional(),
});

// Webhook event schema
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
    previous_attributes: z.any().optional(),
  }),
  created: z.number(),
});

// Plan selection schema
export const selectPlanSchema = z.object({
  planId: z.enum(['starter', 'professional', 'enterprise']),
  interval: z.enum(['month', 'year']).default('month'),
});

// Usage limit check schema
export const checkUsageLimitSchema = z.object({
  feature: z.string().min(1),
  requiredAmount: z.number().min(1).default(1),
});

// Billing address schema
export const billingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().min(1),
  country: z.string().length(2), // ISO country code
});

// Update customer schema
export const updateCustomerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: billingAddressSchema.optional(),
  taxId: z.object({
    type: z.string(),
    value: z.string(),
  }).optional(),
});

// Coupon application schema
export const applyCouponSchema = z.object({
  couponCode: z.string().min(1),
});

// Export all schemas
export const billingSchemas = {
  createCheckoutSession: createCheckoutSessionSchema,
  updateSubscription: updateSubscriptionSchema,
  cancelSubscription: cancelSubscriptionSchema,
  addPaymentMethod: addPaymentMethodSchema,
  removePaymentMethod: removePaymentMethodSchema,
  createBillingPortal: createBillingPortalSchema,
  recordUsage: recordUsageSchema,
  getInvoices: getInvoicesSchema,
  subscriptionFilters: subscriptionFiltersSchema,
  webhookEvent: webhookEventSchema,
  selectPlan: selectPlanSchema,
  checkUsageLimit: checkUsageLimitSchema,
  billingAddress: billingAddressSchema,
  updateCustomer: updateCustomerSchema,
  applyCoupon: applyCouponSchema,
};

// Type exports
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>;
export type RemovePaymentMethodInput = z.infer<typeof removePaymentMethodSchema>;
export type CreateBillingPortalInput = z.infer<typeof createBillingPortalSchema>;
export type RecordUsageInput = z.infer<typeof recordUsageSchema>;
export type GetInvoicesInput = z.infer<typeof getInvoicesSchema>;
export type SubscriptionFiltersInput = z.infer<typeof subscriptionFiltersSchema>;
export type WebhookEventInput = z.infer<typeof webhookEventSchema>;
export type SelectPlanInput = z.infer<typeof selectPlanSchema>;
export type CheckUsageLimitInput = z.infer<typeof checkUsageLimitSchema>;
export type BillingAddressInput = z.infer<typeof billingAddressSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
