import { NextRequest, NextResponse } from 'next/server';
import { stripe, POINTS_PACKAGES } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId } = body;

    // Find the selected package
    const selectedPackage = POINTS_PACKAGES.find(pkg => pkg.id === packageId);

    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.label,
              description: `Purchase ${selectedPackage.points.toLocaleString()} points for BookExchange`,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=true&points=${selectedPackage.points}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?canceled=true`,
      metadata: {
        userId: session.user.id,
        packageId: selectedPackage.id,
        points: selectedPackage.points.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
