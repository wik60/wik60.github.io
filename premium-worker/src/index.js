const WORKER_VERSION='3.2.0';
const STRIPE_API_VERSION='2026-03-25.dahlia; custom_checkout_payment_form_preview=v1';
const json=(data,status=200,headers={})=>new Response(JSON.stringify({...data,workerVersion:WORKER_VERSION}),{status,headers:{'content-type':'application/json; charset=utf-8','x-worker-version':WORKER_VERSION,...headers}});

function cors(env){return {'access-control-allow-origin':env.FRONTEND_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};}
function hex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hmacHex(secret,message){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message)));}
async function sha256Hex(message){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(message)));}
function safeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
function formatKey(seed){const s=seed.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,12);return `PREM-${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8,12)}`;}

async function stripeRequest(env,path,init={}){
  if(!env.STRIPE_SECRET_KEY){const e=new Error('Missing STRIPE_SECRET_KEY');e.publicMessage='Brak konfiguracji STRIPE_SECRET_KEY w Workerze.';throw e;}
  let res;
  try{
    res=await fetch(`https://api.stripe.com/v1${path}`,{...init,headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'Stripe-Version':STRIPE_API_VERSION,...(init.headers||{})}});
  }catch(fetchError){const e=new Error(`Stripe network error: ${fetchError?.message||'fetch failed'}`);e.publicMessage='Worker nie może połączyć się z API Stripe.';throw e;}
  const raw=await res.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{data={raw};}
  if(!res.ok){
    console.error('Stripe error',res.status,JSON.stringify(data));
    const stripeMessage=data?.error?.message||raw||`Stripe HTTP ${res.status}`;
    const e=new Error(stripeMessage);const type=data?.error?.type||'';const param=data?.error?.param||'';
    if(type==='authentication_error')e.publicMessage=`Stripe odrzucił klucz API (${res.status}). Sprawdź STRIPE_SECRET_KEY.`;
    else if(param.includes('price')||String(stripeMessage).toLowerCase().includes('price'))e.publicMessage=`Stripe odrzucił cenę produktu (${res.status}): ${stripeMessage}`;
    else e.publicMessage=`Stripe (${res.status}): ${stripeMessage}`;
    throw e;
  }
  return data;
}

async function createCheckout(env){
  if(!env.STRIPE_PRICE_ID){const e=new Error('Missing STRIPE_PRICE_ID');e.publicMessage='Brak STRIPE_PRICE_ID w konfiguracji Workera.';throw e;}
  const body=new URLSearchParams();
  body.set('ui_mode','form');
  body.set('mode','payment');
  body.set('line_items[0][price]',env.STRIPE_PRICE_ID);
  body.set('line_items[0][quantity]','1');
  body.set('billing_address_collection','auto');
  body.set('phone_number_collection[enabled]','false');
  body.set('automatic_tax[enabled]','false');
  body.set('submit_type','auto');
  body.set('integration_identifier','custom_embedded_web_0002');
  return stripeRequest(env,'/checkout/sessions',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
}

async function deriveLicense(env,sessionId){const seed=await hmacHex(env.LICENSE_SECRET,`matura2026:${sessionId}`);const license=formatKey(seed);return {license,keyHash:await sha256Hex(license)};}
async function upsertAccessKey(env,session){
  if(session.payment_status!=='paid')throw new Error('Payment is not paid');
  const {license,keyHash}=await deriveLicense(env,session.id);
  const res=await fetch(`${env.SUPABASE_URL}/rest/v1/access_keys?on_conflict=stripe_session_id`,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({key_hash:keyHash,subject:'premium',active:true,stripe_session_id:session.id,purchaser_email:session.customer_details?.email||null})});
  if(!res.ok){console.error('Supabase upsert error',res.status,await res.clone().text());const e=new Error('Supabase upsert failed');e.publicMessage='Płatność przeszła, ale nie udało się zapisać klucza w Supabase.';throw e;}
  return license;
}
async function verifyStripeWebhook(request,env,raw){const header=request.headers.get('stripe-signature')||'';const parts=Object.fromEntries(header.split(',').map(x=>x.split('=',2)));const t=parts.t,v1=parts.v1;if(!t||!v1)return false;if(Math.abs(Date.now()/1000-Number(t))>300)return false;const expected=await hmacHex(env.STRIPE_WEBHOOK_SECRET,`${t}.${raw}`);return safeEqual(expected,v1);}

export default {async fetch(request,env){
  const url=new URL(request.url),headers=cors(env);if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'x-worker-version':WORKER_VERSION}});
  try{
    if(request.method==='GET'&&url.pathname==='/api/health')return json({ok:true},200,headers);
    if(request.method==='POST'&&url.pathname==='/api/create-checkout'){
      const origin=request.headers.get('origin');if(origin&&origin!==env.FRONTEND_ORIGIN)return json({error:'Origin not allowed'},403,headers);
      const session=await createCheckout(env);return json({client_secret:session.client_secret,session_id:session.id},200,headers);
    }
    if(request.method==='GET'&&url.pathname==='/api/checkout-key'){
      const origin=request.headers.get('origin');if(origin&&origin!==env.FRONTEND_ORIGIN)return json({error:'Origin not allowed'},403,headers);
      const sessionId=url.searchParams.get('session_id');if(!sessionId||!sessionId.startsWith('cs_'))return json({error:'Invalid session'},400,headers);
      const session=await stripeRequest(env,`/checkout/sessions/${encodeURIComponent(sessionId)}`);if(session.payment_status!=='paid')return json({error:'Payment not completed'},409,headers);
      const license=await upsertAccessKey(env,session);return json({license,email:session.customer_details?.email||null},200,headers);
    }
    if(request.method==='POST'&&url.pathname==='/api/stripe-webhook'){
      const raw=await request.text();if(!await verifyStripeWebhook(request,env,raw))return new Response('Invalid signature',{status:400,headers:{'x-worker-version':WORKER_VERSION}});
      const event=JSON.parse(raw);if(event.type==='checkout.session.completed'&&event.data?.object?.payment_status==='paid')await upsertAccessKey(env,event.data.object);return new Response('ok',{headers:{'x-worker-version':WORKER_VERSION}});
    }
    return json({error:'Not found'},404,headers);
  }catch(error){console.error('Worker error',error?.message||error,error?.stack||'');return json({error:error?.publicMessage||error?.message||'Server error'},500,headers);}
}};
