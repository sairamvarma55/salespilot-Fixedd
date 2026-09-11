import Stripe from 'stripe';

export async function POST() {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_PRICE_ID ||
    !process.env.APP_URL
  ) {
    return Response.json(
      {
        error:
          'Payments are not configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRICE_ID and APP_URL in Vercel.',
      },
      { status: 503 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/?success=1`,
      cancel_url: `${process.env.APP_URL}/?canceled=1`,
      allow_promotion_codes: true,
    });

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    return Response.json(
      {
        error: error?.message || 'Checkout failed.',
      },
      { status: 500 }
    );
  }
}
