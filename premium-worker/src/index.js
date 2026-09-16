const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...headers}});

function cors(env){return {'access-control-allow-origin':env.FRONTEND_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};}
function hex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hmacHex(secret,message){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message)));}
async function sha256Hex(message){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(message)));}
function safeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
function formatKey(seed){const s=seed.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,12);return `PREM-${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8,12)}`;}

async function stripeRequest(env,path,init={}){
  const res=await fetch(`https://api.stripe.com/v1${path}`,{...init,headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,...(init.headers||{})}});
  const data=await res.json();
  if(!res.ok)throw new Error(data?.error?.message||'Stripe request failed');
  return data;
}

async function createCheckout(env){
  const body=new URLSearchParams();
  body.set('mode','payment');
  body.set('line_items[0][price]',env.STRIPE_PRICE_ID);
  body.set('line_items[0][quantity]','1');
  body.set('success_url',`${env.FRONTEND_ORIGIN}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url',`${env.FRONTEND_ORIGIN}/?checkout=cancelled`);
  body.set('client_reference_id','matura2027-premium');
  body.set('metadata[product]','matura2027-premium');
  return stripeRequest(env,'/checkout/sessions',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
}

async function deriveLicense(env,sessionId){
  const seed=await hmacHex(env.LICENSE_SECRET,`matura2027:${sessionId}`);
  const license=formatKey(seed);
  return {license,keyHash:await sha256Hex(license)};
}

async function upsertAccessKey(env,session){
  if(session.payment_status!=='paid')throw new Error('Payment is not paid');
  const {license,keyHash}=await deriveLicense(env,session.id);
  const res=await fetch(`${env.SUPABASE_URL}/rest/v1/access_keys?on_conflict=stripe_session_id`,{
    method:'POST',
    headers:{
      apikey:env.SUPABASE_SERVICE_ROLE_KEY,
      authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type':'application/json',
      prefer:'resolution=merge-duplicates,return=minimal'
    },
    body:JSON.stringify({key_hash:keyHash,subject:'premium',active:true,stripe_session_id:session.id,purchaser_email:session.customer_details?.email||null})
  });
  if(!res.ok)throw new Error(`Supabase upsert failed: ${await res.text()}`);
  return license;
}

async function verifyStripeWebhook(request,env,raw){
  const header=request.headers.get('stripe-signature')||'';
  const parts=Object.fromEntries(header.split(',').map(x=>x.split('=',2)));
  const t=parts.t,v1=parts.v1;
  if(!t||!v1)return false;
  if(Math.abs(Date.now()/1000-Number(t))>300)return false;
  const expected=await hmacHex(env.STRIPE_WEBHOOK_SECRET,`${t}.${raw}`);
  return safeEqual(expected,v1);
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),headers=cors(env);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    try{
      if(request.method==='POST'&&url.pathname==='/api/create-checkout'){
        const origin=request.headers.get('origin');
        if(origin&&origin!==env.FRONTEND_ORIGIN)return json({error:'Origin not allowed'},403,headers);
        const session=await createCheckout(env);
        return json({url:session.url},200,headers);
      }

      if(request.method==='GET'&&url.pathname==='/api/checkout-key'){
        const origin=request.headers.get('origin');
        if(origin&&origin!==env.FRONTEND_ORIGIN)return json({error:'Origin not allowed'},403,headers);
        const sessionId=url.searchParams.get('session_id');
        if(!sessionId||!sessionId.startsWith('cs_'))return json({error:'Invalid session'},400,headers);
        const session=await stripeRequest(env,`/checkout/sessions/${encodeURIComponent(sessionId)}`);
        if(session.payment_status!=='paid')return json({error:'Payment not completed'},409,headers);
        const license=await upsertAccessKey(env,session);
        return json({license,email:session.customer_details?.email||null},200,headers);
      }

      if(request.method==='POST'&&url.pathname==='/api/stripe-webhook'){
        const raw=await request.text();
        if(!await verifyStripeWebhook(request,env,raw))return new Response('Invalid signature',{status:400});
        const event=JSON.parse(raw);
        if(event.type==='checkout.session.completed'&&event.data?.object?.payment_status==='paid')await upsertAccessKey(env,event.data.object);
        return new Response('ok');
      }

      return json({error:'Not found'},404,headers);
    }catch(error){
      console.error(error);
      return json({error:'Server error'},500,headers);
    }
  }
};
