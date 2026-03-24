# Sit Happens — Production Environment Checklist

## 1. Environment Variables (.env)

### API (apps/api)
- [ ] `DATABASE_URL`: Production PostGIS-enabled PostgreSQL connection string.
- [ ] `JWT_SECRET`: High-entropy random string for token signing.
- [ ] `JWT_REFRESH_SECRET`: Separate secret for refresh tokens.
- [ ] `RESEND_API_KEY`: API key from [resend.com](https://resend.com).
- [ ] `STRIPE_SECRET_KEY`: Stripe "Secret Key" (sk_live_...).
- [ ] `STRIPE_WEBHOOK_SECRET`: Secret for signing webhook events (whsec_...).
- [ ] `GOOGLE_CLIENT_ID`: Google Cloud Console Credential ID.
- [ ] `GOOGLE_CLIENT_SECRET`: Google Cloud Console Credential Secret.
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox access token for direction API.
- [ ] `FRONTEND_URL`: `https://your-domain.com`.

### Web (apps/web)
- [ ] `NEXT_PUBLIC_API_URL`: `https://api.your-domain.com`.
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`: Same as API.

## 2. Infrastructure
- [ ] **PostGIS**: Ensure the `postgis` extension is enabled on the target DB.
- [ ] **Cron**: The API must allow background processes (e.g., for `MonitorService` and `InvoiceScheduler`).
- [ ] **WebSockets**: Ensure the load balancer/ingress supports WebSocket sticky sessions if scaling.

## 3. Google OAuth
- [ ] **Scopes**: Ensure `https://www.googleapis.com/auth/calendar.events` and `openid email profile` are authorized.
- [ ] **Redirect URIs**: Add `https://api.your-domain.com/auth/google/callback` to the dashboard.

## 4. Stripe
- [ ] **Webhook Endpoint**: Register `https://api.your-domain.com/webhooks/stripe` with events:
  - `payment_intent.succeeded`
  - `payment_intent.canceled`
  - `charge.refunded`
