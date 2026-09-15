(async()=>{
  const subject=document.body.dataset.protectedSubject;
  if(!subject)return;
  const cfg=window.VADEMECUM_CONFIG||{};
  const fail=reason=>location.replace(`index.html?locked=${encodeURIComponent(subject)}&reason=${encodeURIComponent(reason)}`);
  if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey){fail('config');return}
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const {data:{session}}=await client.auth.getSession();
  if(!session){fail('login');return}
  const {data,error}=await client.rpc('get_my_subject_access');
  if(error){fail('database');return}
  if(!(data||[]).some(row=>row.subject===subject)){fail('access');return}
  document.body.style.visibility='visible';
})().catch(()=>location.replace('index.html?reason=error'));
