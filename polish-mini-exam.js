(function(){
  const STORAGE_KEY='maturaPolishMiniExam01';
  const exam={
    title:'Miniarkusz tekstowy 1',
    max:8,
    tasks:[
      {id:'mt1',points:1,title:'Zadanie 1.',question:'Na podstawie Tekstu 1. wyjaśnij, dlaczego czytanie dłuższego tekstu na papierze może ułatwiać zapamiętanie jego treści.',rubric:'1 pkt za wskazanie, że stałe położenie fragmentów na stronie tworzy przestrzenne punkty orientacyjne, które pomagają porządkować i odtwarzać informacje.'},
      {id:'mt2',points:2,title:'Zadanie 2.',question:'Na podstawie Tekstu 2. podaj jedną korzyść i jedno zagrożenie wynikające z używania narzędzi AI podczas nauki.',rubric:'Po 1 pkt: korzyść — np. szybkie wyjaśnienie, informacja zwrotna, dopasowanie ćwiczeń; zagrożenie — np. rezygnacja z samodzielnego wysiłku, bezkrytyczne przyjmowanie błędów, pozorne poczucie opanowania materiału.'},
      {id:'mt3',points:2,title:'Zadanie 3.',question:'Czy autorzy obu tekstów zgodziliby się ze stwierdzeniem, że samo narzędzie decyduje o jakości nauki? Rozstrzygnij i uzasadnij odpowiedź, odwołując się do obu tekstów.',rubric:'2 pkt za właściwe rozstrzygnięcie „nie” oraz funkcjonalne odwołanie do obu tekstów: Tekst 1 podkreśla znaczenie sposobu czytania i aktywności ucznia, Tekst 2 — świadomego użycia AI i weryfikacji odpowiedzi. 1 pkt za poprawne rozstrzygnięcie z odwołaniem tylko do jednego tekstu albo niepełne porównanie.'},
      {id:'mt4',points:1,title:'Zadanie 4.',question:'Oceń, czy obraz Jeana-Honoré Fragonarda może ilustrować skupienie opisane w Tekście 1. Odpowiedz „tak” albo „nie” i uzasadnij, odwołując się do jednego elementu obrazu oraz do tekstu.',rubric:'1 pkt za logiczne rozstrzygnięcie poparte konkretnym elementem obrazu (np. pochylona postać, wzrok skierowany na książkę, brak rozpraszających działań) i powiązaniem z koncentracją opisaną w Tekście 1. Dopuszczalne są oba rozstrzygnięcia, jeśli uzasadnienie jest spójne.'},
      {id:'mt5',points:2,title:'Zadanie 5.',question:'Sformułuj wniosek o roli samodzielności w zdobywaniu wiedzy. W odpowiedzi wykorzystaj oba teksty oraz wybrany utwór literacki. Podaj tytuł utworu i omów konkretną sytuację bohatera.',rubric:'2 pkt za trafny wniosek, funkcjonalne wykorzystanie obu tekstów i konkretnej sytuacji z poprawnie wskazanego utworu. 1 pkt za trafny wniosek i dwa z trzech wymaganych elementów. Nie przyznawaj punktu za samo wymienienie tytułu bez omówienia sytuacji.'}
    ]
  };
  let answers={};
  try{answers=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(_){answers={}}

  function e(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  function answered(){return exam.tasks.filter(task=>(answers[task.id]||'').trim().length>0).length}
  function sourceTexts(){return `
    <section class="mini-source-grid" aria-label="Teksty źródłowe">
      <article class="mini-source selectable-text">
        <span class="mini-source-label">TEKST 1</span>
        <h3>Czy ekran zmienia sposób czytania?</h3>
        <p>Czytanie na ekranie nie musi być mniej wartościowe od czytania książki, lecz urządzenie sprzyja szybkiemu przesuwaniu wzroku. Powiadomienia, odsyłacze i możliwość natychmiastowego przejścia do innej treści zachęcają do zbierania pojedynczych informacji zamiast śledzenia całego wywodu. W tekście drukowanym fragment ma stałe położenie: czytelnik pamięta, że ważna myśl znajdowała się na górze lewej strony albo tuż przed końcem rozdziału. Takie przestrzenne punkty orientacyjne pomagają uporządkować treść.</p>
        <p>Nie oznacza to jednak, że papier automatycznie gwarantuje zrozumienie. Uczeń może bezmyślnie przewracać kartki, a na tablecie — uważnie zaznaczać argumenty, zapisywać pytania i po przeczytaniu odtwarzać tok rozumowania autora. O jakości nauki decyduje więc nie tylko nośnik, lecz przede wszystkim cel lektury oraz aktywność czytającego.</p>
        <p class="mini-source-note">Tekst autorski przygotowany do ćwiczenia.</p>
      </article>
      <article class="mini-source selectable-text">
        <span class="mini-source-label">TEKST 2</span>
        <h3>Pomocnik, który nie powinien myśleć za ucznia</h3>
        <p>Narzędzia wykorzystujące sztuczną inteligencję potrafią wyjaśnić pojęcie na kilka sposobów, ułożyć serię ćwiczeń i od razu skomentować odpowiedź. Dzięki temu uczeń nie musi długo czekać na informację zwrotną i może dopasować poziom zadania do swoich potrzeb. Taka pomoc jest szczególnie cenna, gdy służy do sprawdzania własnego toku rozumowania.</p>
        <p>Problem zaczyna się wtedy, gdy gotowa odpowiedź zastępuje wysiłek. Tekst wygenerowany w kilka sekund może stworzyć złudzenie, że materiał został opanowany, chociaż użytkownik nie potrafi samodzielnie odtworzyć argumentu. System może też podać informację nieprawdziwą, ale brzmiącą przekonująco. Dlatego rozsądne korzystanie z AI wymaga zadawania pytań, porównywania źródeł i podejmowania własnej próby przed poznaniem rozwiązania.</p>
        <p class="mini-source-note">Tekst autorski przygotowany do ćwiczenia.</p>
      </article>
    </section>`}
  function taskCard(task,index){
    const extra=index===3?`<figure class="mini-art"><img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Fragonard%2C_The_Reader.jpg?width=900" alt="Młoda kobieta w żółtej sukni czytająca książkę" loading="lazy"><figcaption>Jean-Honoré Fragonard, <i>Czytająca dziewczyna</i>, ok. 1770. Źródło: <a href="https://commons.wikimedia.org/wiki/File:Fragonard,_The_Reader.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>, domena publiczna.</figcaption></figure>`:'';
    return `<article class="mini-task" data-mini-task="${task.id}" data-search="${e(task.title+' '+task.question)}">
      <div class="mini-task-head"><div><span>ZADANIE ${index+1} Z 5</span><h3>${e(task.title)}</h3></div><b>${task.points} ${task.points===1?'punkt':'punkty'}</b></div>
      ${extra}<p class="mini-question">${e(task.question)}</p>
      <label class="mini-answer-label" for="${task.id}">Twoja odpowiedź</label>
      <textarea id="${task.id}" class="mini-answer" data-mini-answer="${task.id}" placeholder="Wpisz odpowiedź własnymi słowami…">${e(answers[task.id]||'')}</textarea>
      <div class="mini-answer-meta"><span data-mini-status="${task.id}">${answers[task.id]?'Odpowiedź zapisana':'Oczekuje na odpowiedź'}</span><span data-mini-count="${task.id}">0 słów</span></div>
    </article>`
  }
  function miniExamView(){
    return `<div class="mini-exam">
      <section class="mini-exam-hero">
        <div><span class="mini-kicker">JĘZYK POLSKI W UŻYCIU</span><h2>${exam.title}</h2><p>Pięć autorskich zadań wzorowanych na sposobie sprawdzania umiejętności w arkuszu CKE. Przeczytaj oba teksty, obejrzyj obraz i odpowiadaj własnymi słowami.</p></div>
        <div class="mini-exam-score"><strong>${exam.max}</strong><span>punktów</span></div>
      </section>
      <div class="mini-exam-toolbar"><div><span>Wykonano <b id="miniDone">${answered()}/5</b></span><div class="mini-progress"><i id="miniProgress" style="width:${answered()*20}%"></i></div></div><button type="button" data-mini-jump="mt1">Zacznij arkusz ↓</button></div>
      <div class="mini-instructions"><b>Instrukcja</b><span>Odpowiadaj wyłącznie na podstawie wskazanych materiałów, chyba że polecenie wymaga znajomości lektury. Wszystkie zadania są widoczne poniżej i zapisują się automatycznie.</span></div>
      <h2 class="section-title">Materiały do zadań 1–5</h2>
      ${sourceTexts()}
      <h2 class="section-title">Zadania • łącznie ${exam.max} pkt</h2>
      <div class="mini-task-list">${exam.tasks.map(taskCard).join('')}</div>
      <section class="mini-grade-panel">
        <div><span class="mini-kicker">SPRAWDŹ CAŁOŚĆ</span><h2>Oceń arkusz w ChatGPT</h2><p>Otrzymasz punkty za każde zadanie, procent, poprawione odpowiedzi oraz krótką listę rzeczy do przećwiczenia.</p><span id="miniGradeStatus">Uzupełniono ${answered()} z 5 zadań.</span></div>
        <button type="button" id="gradeMiniExam">✦ Oceń z ChatGPT</button>
      </section>
    </div>`
  }
  function updateMeta(){
    const done=answered(),doneEl=document.querySelector('#miniDone'),bar=document.querySelector('#miniProgress'),grade=document.querySelector('#miniGradeStatus');
    if(doneEl)doneEl.textContent=done+'/5';if(bar)bar.style.width=(done*20)+'%';if(grade)grade.textContent=`Uzupełniono ${done} z 5 zadań.`;
    document.querySelectorAll('[data-mini-answer]').forEach(el=>{const words=el.value.trim()?el.value.trim().split(/\s+/).length:0,count=document.querySelector(`[data-mini-count="${el.dataset.miniAnswer}"]`);if(count)count.textContent=words+' '+(words===1?'słowo':'słów')})
  }
  function saveAnswer(el){answers[el.dataset.miniAnswer]=el.value;localStorage.setItem(STORAGE_KEY,JSON.stringify(answers));const status=document.querySelector(`[data-mini-status="${el.dataset.miniAnswer}"]`);if(status)status.textContent=el.value.trim()?'Odpowiedź zapisana':'Oczekuje na odpowiedź';updateMeta()}
  function gradePrompt(){
    const rows=exam.tasks.map((task,i)=>`ZADANIE ${i+1} (${task.points} pkt)\nPolecenie: ${task.question}\nOdpowiedź ucznia: ${(answers[task.id]||'').trim()||'BRAK ODPOWIEDZI'}\nKryterium: ${task.rubric}`).join('\n\n');
    return `Jesteś egzaminatorem matury podstawowej z języka polskiego. Oceń pięć zadań z autorskiego miniarkusza. Oceniaj wyłącznie według podanych kryteriów, nie przyznawaj punktów ponad maksimum i nie karz dwa razy za ten sam błąd. Przy każdym zadaniu podaj: zdobyte punkty, co zrobiono dobrze, co jest błędne lub niepełne oraz krótką modelową odpowiedź napisaną prostym językiem. Na końcu podaj sumę /${exam.max}, procent i trzy najważniejsze wskazówki do dalszej nauki. Odpowiedź przedstaw w czytelnej tabeli.\n\nMATERIAŁY ŹRÓDŁOWE\nTekst 1: Czytanie ekranowe sprzyja skanowaniu, papier daje przestrzenne punkty orientacyjne, ale o jakości nauki ostatecznie decydują cel i aktywność czytającego.\nTekst 2: AI może szybko wyjaśniać i komentować, ale gotowa odpowiedź może zastąpić wysiłek i zawierać błędy; potrzebne są samodzielna próba i weryfikacja.\nObraz: Jean-Honoré Fragonard, „Czytająca dziewczyna” — samotna postać siedzi z książką, jej wzrok i postawa są skierowane na lekturę.\n\n${rows}`
  }
  function grade(){
    const prompt=gradePrompt(),status=document.querySelector('#miniGradeStatus');
    navigator.clipboard?.writeText(prompt).catch(()=>{});
    const url=prompt.length<7500?'https://chatgpt.com/?q='+encodeURIComponent(prompt):'https://chatgpt.com/';
    window.open(url,'_blank','noopener,noreferrer');
    if(status)status.textContent=prompt.length<7500?'Otwarto ocenianie w ChatGPT.':'Skopiowano arkusz — wklej go w ChatGPT skrótem Ctrl+V.';
    if(typeof toast==='function')toast('Arkusz przekazany do oceny w ChatGPT')
  }
  function bindMini(){
    document.querySelectorAll('[data-mini-answer]').forEach(el=>{el.addEventListener('input',()=>saveAnswer(el));const grow=()=>{el.style.height='auto';el.style.height=Math.max(132,el.scrollHeight)+'px'};el.addEventListener('input',grow);grow()});
    document.querySelector('#gradeMiniExam')?.addEventListener('click',grade);
    document.querySelector('[data-mini-jump]')?.addEventListener('click',e=>document.querySelector(`[data-mini-task="${e.currentTarget.dataset.miniJump}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}));
    updateMeta()
  }
  nav.splice(2,0,['textsheet','Zadania tekstowe • miniarkusz']);
  views.textsheet=miniExamView;
  renderNav=function(){navEl.innerHTML=nav.map(([id,n])=>`${id==='start'?'<div class="nav-title">START</div>':id==='exam'?'<div class="nav-title">ARKUSZE</div>':id==='books'?'<div class="nav-title">NAUKA</div>':id==='oral'?'<div class="nav-title">MATURA USTNA</div>':''}<button data-page="${id}" class="${state.page===id?'active':''}">${n}</button>`).join('')};
  const baseRender=render;
  render=function(keepScroll=false){baseRender(keepScroll);if(state.page==='textsheet')bindMini()};
  render(true);
})();
