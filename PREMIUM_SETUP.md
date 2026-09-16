# Premium 2027 — konfiguracja płatności

System składa się z:
- frontendu w tym repo,
- Supabase do kont i dostępów,
- Cloudflare Worker do Stripe Checkout i generowania kluczy,
- Stripe do płatności.

## 1. Supabase

W Supabase otwórz SQL Editor i uruchom `supabase-premium.sql`.

To utworzy:
- `access_keys`,
- `subject_access`,
- `get_my_subject_access()`,
- `redeem_subject_key()`.

Klucz Premium odblokowuje wszystkie trzy przedmioty.

## 2. Stripe

Utwórz produkt i jednorazową cenę w Stripe.
Skopiuj identyfikator ceny `price_...`.

## 3. Cloudflare Worker

Kod Workera jest w `premium-worker/`.

Ustaw sekrety:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_ID
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put LICENSE_SECRET
```

`LICENSE_SECRET` ustaw jako długi losowy sekret. Nie zapisuj go w repo.

W `premium-worker/wrangler.toml` sprawdź `FRONTEND_ORIGIN`.

Następnie wdroż Worker:

```bash
cd premium-worker
wrangler deploy
```

## 4. Stripe webhook

W Stripe dodaj endpoint:

```text
https://TWOJ-WORKER.workers.dev/api/stripe-webhook
```

Nasłuchuj zdarzenia:

```text
checkout.session.completed
```

Skopiuj webhook signing secret `whsec_...` do `STRIPE_WEBHOOK_SECRET`.

## 5. Frontend

Po wdrożeniu Workera ustaw w `config.js`:

```js
paymentsApiBase: 'https://TWOJ-WORKER.workers.dev'
```

## 6. Test

1. Otwórz stronę.
2. Kliknij `Kup dostęp`.
3. Zapłać kartą testową Stripe.
4. Po powrocie strona pokaże klucz `PREM-XXXX-XXXX-XXXX`.
5. Zaloguj się.
6. Aktywuj klucz przy dowolnym przedmiocie.
7. Wszystkie trzy przedmioty powinny być odblokowane.

## Ważne

- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` i `LICENSE_SECRET` muszą być wyłącznie sekretami Workera.
- Nie umieszczaj ich w `config.js`, HTML ani repozytorium.
- Najpierw testuj na Stripe Test Mode.
