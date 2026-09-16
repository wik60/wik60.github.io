# Stripe Integration TODO

## Values to Replace

The embedded Checkout modal is implemented in version 3.2.0. One public value is still required before it can render the Stripe form.

**Files containing placeholders:**
- [config.js](config.js)

| Field | Current Value | What to Set |
|---|---|---|
| `stripePublishableKey` | empty string | Your live Stripe publishable key beginning with `pk_live_` from Stripe Dashboard → Developers → API keys. This key is public and may be stored in frontend config. |

## Configured Parameters

**Files containing these parameters:**
- [premium-worker/src/index.js](premium-worker/src/index.js)

| Parameter | Value |
|---|---|
| `ui_mode` | `form` |
| `mode` | `payment` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `custom_embedded_web_0002` |
| Stripe API version | `2026-03-25.dahlia; custom_checkout_payment_form_preview=v1` |
| `line_items[0][price]` | Cloudflare `STRIPE_PRICE_ID` binding |

## Setup and next steps

1. Put the live `pk_live_...` value into `stripePublishableKey` in `config.js`.
2. Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `LICENSE_SECRET` only as Cloudflare Worker secrets.
3. Keep `STRIPE_PRICE_ID`, `FRONTEND_ORIGIN`, and `SUPABASE_URL` as Worker variables.
4. Ensure the Cloudflare deploy command is `npx wrangler deploy` so the newest Worker version receives production traffic.
5. Test one live purchase end-to-end: open modal → pay → generate `PREM-...` key → save in Supabase → activate account access.

## Flow overview

The browser loads Stripe.js directly from Stripe, opens an on-page payment dialog, requests a Checkout Session client secret from the Cloudflare Worker, mounts Stripe's hosted form inside the modal, confirms payment through Stripe, then requests the generated Premium license from the Worker. The webhook remains enabled as a second fulfillment path.

## Testing

This project is currently configured for live Stripe resources. Do not use Stripe test card numbers with live keys. If you later switch to test mode, switch the secret key, publishable key, Price ID, and webhook secret together.

## Resources

- Stripe Support: https://support.stripe.com
- Stripe docs / MCP: https://docs.stripe.com/mcp
