import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' as any })
  : null;

export function isStripeConfigured(): boolean {
  return !!stripe && !!process.env.STRIPE_WEBHOOK_SECRET;
}
