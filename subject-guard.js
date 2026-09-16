(async()=>{
  const subject=document.body.dataset.protectedSubject;
  if(!subject)return;

  const cfg=window.VADEMECUM_CONFIG||{};
  const names={polski:'Język polski',angielski:'Język angielski',matematyka:'Matematyka'};
  const labels={polski:'POL',angielski:'ANG',matematyka:'MAT'};

  function showPreview(reason='access'){
    document.body.style.visibility='visible';
    document.body.classList.add('subject-preview');
    document.documentElement.classList.add('subject-preview-mode');

    const style=document.createElement('style');
    style.id='subjectPreviewStyles';
    style.textContent=`
      body.subject-preview{overflow-x:hidden}
      body.subject-preview main,body.subject-preview .main{position:relative;max-height:1120px;overflow:hidden}
      body.subject-preview #content{position:relative;max-height:880px;overflow:hidden}
      body.subject-preview #content:after{content:"";position:absolute;z-index:40;left:0;right:0;top:360px;bottom:0;min-height:520px;backdrop-filter:blur(11px);-webkit-backdrop-filter:blur(11px);background:linear-gradient(to bottom,rgba(255,255,255,.08),rgba(255,250,253,.58) 18%,rgba(255,250,253,.9) 62%,rgba(255,250,253,.98));pointer-events:auto}
      body.subject-preview .sidebar nav,body.subject-preview #nav,body.subject-preview .search-wrap,body.subject-preview .searchbox,body.subject-preview #randomBtn,body.subject-preview .selection-tools,body.subject-preview #mathSelectionTools{pointer-events:none;opacity:.55}
      .subject-preview-banner{position:fixed;z-index:9999;left:50%;bottom:22px;transform:translateX(-50%);width:min(620px,calc(100vw - 24px));padding:16px 18px;border:1px solid #f0bfd5;border-radius:20px;background:rgba(255,255,255,.96);box-shadow:0 22px 60px rgba(80,30,55,.24);backdrop-filter:blur(12px);font-family:Nunito,Inter,system-ui,sans-serif;color:#3d2b34;text-align:center}
      .subject-preview-banner b{display:block;font-size:17px;color:#8b3d65;margin-bottom:4px}.subject-preview-banner span{display:block;font-size:13px;color:#765d69;margin-bottom:12px}.subject-preview-actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}.subject-preview-actions a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:12px;padding:10px 14px;font-weight:900;font-size:13px}.subject-preview-actions .buy{background:#d93b81;color:#fff;border:1px solid #d93b81}.subject-preview-actions .key{background:#fff;color:#8b3d65;border:1px solid #eab8cf}
      .subject-preview-tag{position:fixed;z-index:9998;right:16px;top:16px;padding:8px 11px;border-radius:999px;background:#fff;border:1px solid #efbfd5;box-shadow:0 8px 22px rgba(80,30,55,.12);font:800 11px Nunito,Inter,system-ui,sans-serif;color:#9b4d72;letter-spacing:.04em}
      @media(max-width:650px){body.subject-preview main,body.subject-preview .main{max-height:980px}body.subject-preview #content{max-height:760px}body.subject-preview #content:after{top:300px}.subject-preview-banner{bottom:10px;padding:13px}.subject-preview-actions a{flex:1;min-width:130px}}
    `;
    document.head.appendChild(style);

    const banner=document.createElement('div');
    banner.className='subject-preview-banner';
    banner.innerHTML=`<b>Podgląd: ${names[subject]||subject}</b><span>Widzisz darmowy fragment. Pełna zawartość jest dostępna po zakupie lub aktywacji klucza.</span><div class="subject-preview-actions"><a class="buy" href="index.html?purchase=${encodeURIComponent(subject)}">Kup dostęp za 34,99 zł</a><a class="key" href="index.html?activate=${encodeURIComponent(subject)}">Mam klucz</a></div>`;
    document.body.appendChild(banner);

    const tag=document.createElement('div');
    tag.className='subject-preview-tag';
    tag.textContent=`PREVIEW ${labels[subject]||''} · v3.3.1`;
    document.body.appendChild(tag);
  }

  if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey){showPreview('config');return}

  try{
    const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
    const {data:{session}}=await client.auth.getSession();
    if(!session){showPreview('login');return}

    const {data,error}=await client.rpc('get_my_subject_access');
    if(error){showPreview('database');return}

    if(!(data||[]).some(row=>row.subject===subject)){showPreview('access');return}

    document.body.style.visibility='visible';
    document.body.classList.remove('subject-preview');
  }catch(error){
    showPreview('error');
  }
})();
