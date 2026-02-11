import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received');

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  console.log('📝 Signature present:', !!signature);
  console.log(
    '📝 Webhook secret configured:',
    !!process.env.STRIPE_WEBHOOK_SECRET
  );

  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Use the webhook secret for signature verification
      event = stripe.webhooks.constructEvent(
        body,
        signature || '',
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook signature verified');
    } else {
      // Development fallback - parse event directly (not secure for production!)
      console.log('⚠️ No webhook secret - parsing event directly');
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('📨 Event type:', event.type);

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('💳 Checkout session completed:', session.id);
    console.log('📦 Metadata:', session.metadata);

    const userId = session.metadata?.userId;
    const points = parseInt(session.metadata?.points || '0', 10);

    if (!userId || !points) {
      console.error('❌ Missing metadata in checkout session:', {
        sessionId: session.id,
        userId,
        points,
        metadata: session.metadata,
      });
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    try {
      // Check if user exists first
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true },
      });

      if (!user) {
        console.error('❌ User not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      console.log('👤 User found:', { userId, currentPoints: user.points });

      // Add points to user account
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { points: { increment: points } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: userId,
            amount: points,
            type: 'BONUS',
            description: `Purchased ${points.toLocaleString()} points`,
          },
        }),
      ]);

      console.log(`✅ Successfully added ${points} points to user ${userId}`);
      console.log(`📊 New balance: ${updatedUser.points}`);
    } catch (error) {
      console.error('❌ Failed to add points:', error);
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
