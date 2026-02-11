'use client';

import { useState } from 'react';

const POINTS_PACKAGES = [
  {
    id: 'points_500',
    points: 500,
    price: 2.5,
    label: '500 Points',
    popular: false,
  },
  {
    id: 'points_1000',
    points: 1000,
    price: 5,
    label: '1,000 Points',
    popular: true,
  },
  {
    id: 'points_2500',
    points: 2500,
    price: 10,
    label: '2,500 Points',
    popular: false,
    bonus: '25% bonus',
  },
  {
    id: 'points_5000',
    points: 5000,
    price: 17.5,
    label: '5,000 Points',
    popular: false,
    bonus: '43% bonus',
  },
];

export function BuyPointsCard() {
  const [selectedPackage, setSelectedPackage] = useState('points_1000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent/10">
          <svg
            className="w-6 h-6 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Buy Points</h3>
          <p className="text-sm text-muted-foreground">
            Get more points to request books
          </p>
        </div>
      </div>

      {/* Package Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {POINTS_PACKAGES.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedPackage === pkg.id
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
                Popular
              </span>
            )}
            {pkg.bonus && (
              <span className="absolute -top-2 right-2 px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full">
                {pkg.bonus}
              </span>
            )}
            <div className="text-lg font-bold text-foreground">
              {pkg.points.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">points</div>
            <div className="mt-2 text-accent font-semibold">
              ${pkg.price.toFixed(2)}
            </div>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Purchase with Card
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-center text-muted-foreground">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}
