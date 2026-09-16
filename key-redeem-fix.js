// v3.3.6 — reliable access-key redemption without pgcrypto hashing in the RPC.
async function sha256Key(value){
  const normalized=String(value||'').trim().toUpperCase();
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}

const keySubmitButton=document.querySelector('#keySubmit');
if(keySubmitButton){
  keySubmitButton.onclick=async()=>{
    const key=document.querySelector('#accessKey').value.trim().toUpperCase();
    const errorBox=document.querySelector('#keyError');
    errorBox.textContent='';
    if(!key){errorBox.textContent='Wpisz klucz dostępu.';return}
    if(!pendingSubject){errorBox.textContent='Nie wybrano przedmiotu. Zamknij okno i spróbuj ponownie.';return}

    keySubmitButton.disabled=true;
    keySubmitButton.textContent='Sprawdzanie…';
    try{
      const hash=await sha256Key(key);
      const {data,error}=await client.rpc('redeem_subject_key_hash',{p_subject:pendingSubject,p_key_hash:hash});
      if(error){
        console.error('redeem_subject_key_hash',error);
        const detail=[error.code,error.message].filter(Boolean).join(' — ');
        errorBox.textContent=`Błąd Supabase${detail?`: ${detail}`:''}`;
        return;
      }
      if(!data){
        errorBox.textContent='Klucz jest nieprawidłowy, został już wykorzystany albo dotyczy innego przedmiotu.';
        return;
      }
      document.querySelector('#keyDialog').close();
      await refreshAccess();
      toast('Dostęp został przypisany do Twojego konta');
      if(routes[pendingSubject])setTimeout(()=>location.href=routes[pendingSubject],450);
    }catch(error){
      console.error('key redemption error',error);
      errorBox.textContent=`Nie udało się sprawdzić klucza: ${error?.message||'nieznany błąd'}`;
    }finally{
      keySubmitButton.disabled=false;
      keySubmitButton.textContent='Aktywuj dostęp';
    }
  };
}
