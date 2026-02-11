import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Points pricing configuration
export const POINTS_PACKAGES = [
  {
    id: 'points_500',
    points: 500,
    price: 250, // in cents ($2.50)
    label: '500 Points',
    popular: false,
  },
  {
    id: 'points_1000',
    points: 1000,
    price: 500, // in cents ($5.00)
    label: '1,000 Points',
    popular: true,
  },
  {
    id: 'points_2500',
    points: 2500,
    price: 1000, // in cents ($10.00)
    label: '2,500 Points',
    popular: false,
    bonus: '25% bonus',
  },
  {
    id: 'points_5000',
    points: 5000,
    price: 1750, // in cents ($17.50)
    label: '5,000 Points',
    popular: false,
    bonus: '43% bonus',
  },
] as const;

export type PointsPackage = (typeof POINTS_PACKAGES)[number];
