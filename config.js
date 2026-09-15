// Dane publiczne używane przez frontend.
// Supabase publishable/anon key może być publiczny. Nigdy nie wklejaj tutaj service_role ani sekretów Stripe.
window.VADEMECUM_CONFIG = {
  supabaseUrl: 'https://ztxbktelvqfisafywmvx.supabase.co',
  supabaseAnonKey: 'sb_publishable_-r1TbaNpDb4tD-sdFwf4kg_btsGHHkX',

  // Po wdrożeniu premium-workera w Cloudflare wklej tutaj jego publiczny adres,
  // np. https://matura2027byak-premium.twoj-subdomain.workers.dev
  paymentsApiBase: ''
};
