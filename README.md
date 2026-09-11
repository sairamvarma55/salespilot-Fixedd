# SalesPilot AI — Vercel version

Next.js app designed for Vercel deployment.

## Deploy
1. Push the contents of this folder to GitHub.
2. Import the repository into Vercel.
3. Framework: Next.js (auto-detected).
4. Add environment variables from `.env.example` in Vercel Project Settings → Environment Variables.
5. Deploy.

## Required for live AI
OPENAI_API_KEY and optionally OPENAI_MODEL.

## Required for live subscriptions
STRIPE_SECRET_KEY, STRIPE_PRICE_ID, APP_URL.

Use Stripe test mode first. Never commit secret keys.
