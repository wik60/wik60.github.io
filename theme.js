(()=>{
  const KEY='vademecum-theme',root=document.documentElement,decorated=new Map();
  function toggleDecorations(theme){
    if(!document.body)return;
    if(theme==='discord'){
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
      while(node=walker.nextNode()){
        if(node.parentElement?.closest('script,style,textarea,input'))continue;
        if(/[♡♥✿🎀]/.test(node.nodeValue)){
          if(!decorated.has(node))decorated.set(node,node.nodeValue);
          node.nodeValue=node.nodeValue.replace(/[♡♥✿🎀]/g,'').replace(/\s{2,}/g,' ');
        }
      }
    }else{
      for(const [node,value] of decorated)if(node.isConnected)node.nodeValue=value;
      decorated.clear();
    }
  }
  function setTheme(name){
    const theme=name==='discord'?'discord':'pink';root.dataset.theme=theme;localStorage.setItem(KEY,theme);
    document.querySelectorAll('.theme-option').forEach(x=>x.classList.toggle('active',x.dataset.themeChoice===theme));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='discord'?'#313338':'#d93b81');
    toggleDecorations(theme);
  }
  function build(){
    if(document.querySelector('.theme-switcher'))return;
    document.body.insertAdjacentHTML('beforeend',`<button class="theme-switcher" type="button" aria-expanded="false">🎨 Wygląd</button><section class="theme-panel" hidden aria-label="Wybierz wygląd"><h2>Wybierz wygląd</h2><p>Ustawienie zapisuje się na tym urządzeniu.</p><div class="theme-options"><button class="theme-option pink" data-theme-choice="pink"><span>♡</span>Różowe notatki</button><button class="theme-option discord" data-theme-choice="discord"><span>◉</span>Discord dark</button></div></section>`);
    const button=document.querySelector('.theme-switcher'),panel=document.querySelector('.theme-panel');
    button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden))};
    panel.onclick=e=>{const pick=e.target.closest('[data-theme-choice]');if(!pick)return;setTheme(pick.dataset.themeChoice);panel.hidden=true;button.setAttribute('aria-expanded','false')};
    document.addEventListener('click',e=>{if(!e.target.closest('.theme-switcher,.theme-panel')){panel.hidden=true;button.setAttribute('aria-expanded','false')}});
    setTheme(localStorage.getItem(KEY)||root.dataset.theme);
  }
  root.dataset.theme=localStorage.getItem(KEY)==='discord'?'discord':'pink';
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',build):build();
})();
