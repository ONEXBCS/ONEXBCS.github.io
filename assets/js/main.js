/* ONEX — scripts */
(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* night sky: twinkling stars + now and then a shooting star */
  (function(){
    const sky=document.createElement("div");sky.className="sky";sky.setAttribute("aria-hidden","true");
    const n=innerWidth<700?55:110;
    for(let i=0;i<n;i++){const s=document.createElement("i");s.className="st"+(Math.random()<.15?" y":"");
      const big=Math.random()<.08;
      s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";
      s.style.setProperty("--s",(big?2.6:0.8+Math.random()*1.4)+"px");s.style.setProperty("--o",(big?.95:.35+Math.random()*.5).toFixed(2));
      s.style.setProperty("--dur",(2.5+Math.random()*4).toFixed(1)+"s");s.style.setProperty("--dl",(-Math.random()*6).toFixed(1)+"s");sky.appendChild(s)}
    const sh=document.createElement("i");sh.className="shoot";sky.appendChild(sh);
    document.body.prepend(sky);
    if(reduce)return;
    function shoot(){if(!document.hidden){sh.style.left=(40+Math.random()*55)+"%";sh.style.top=(3+Math.random()*35)+"%";sh.classList.remove("go");void sh.offsetWidth;sh.classList.add("go")}
      setTimeout(shoot,7000+Math.random()*9000)}
    setTimeout(shoot,3000);
  })();

  /* on load: the menu hangs on strings; the strings go back up afterwards */
  if(document.documentElement.classList.contains("rig-on")){
    const rig=[...document.querySelectorAll(".header .logo,.nav a,.lang,.burger")];
    rig.forEach(el=>{
      if(el.closest(".nav")&&innerWidth<=860)return;
      const r=document.createElement("i");r.className="rope";r.setAttribute("aria-hidden","true");
      r.style.setProperty("--rd",getComputedStyle(el).animationDelay.split(",")[0]);
      el.appendChild(r);
    });
    setTimeout(()=>{document.querySelectorAll(".rope").forEach(r=>r.remove());document.documentElement.classList.remove("rig-on")},3400);
  }

  /* phones and tablets: a thin scrollbar that starts under the menu bar, not behind it */
  if(matchMedia("(pointer:coarse)").matches){
    const bar=document.createElement("i");bar.className="mscroll";bar.setAttribute("aria-hidden","true");
    document.body.appendChild(bar);
    const head=document.querySelector(".header");let hideBar=null;
    const place=show=>{
      const top=head?head.getBoundingClientRect().bottom:0;
      const track=innerHeight-top-4,doc=document.documentElement.scrollHeight;
      if(doc<=innerHeight+1){bar.classList.remove("show");return}
      const h=Math.max(36,track*innerHeight/doc);
      const p=scrollY/(doc-innerHeight);
      bar.style.height=h+"px";bar.style.top=(top+2+(track-h)*Math.min(1,Math.max(0,p)))+"px";
      if(show){bar.classList.add("show");clearTimeout(hideBar);hideBar=setTimeout(()=>bar.classList.remove("show"),900)}
    };
    addEventListener("scroll",()=>place(true),{passive:true});
    addEventListener("resize",()=>place(false));
    place(false);
  }

  /* ransom headings */
  const styles=[
    {bg:"#cfcfcf",fg:"#141414",f:"'Abril Fatface',Georgia,serif"},
    {bg:"#2f6fd0",fg:"#dce7f6",f:"'Bowlby One','Arial Black',sans-serif"},
    {bg:"#4a2a22",fg:"#ece6d8",f:"'Abril Fatface',Georgia,serif"},
    {bg:"#e8b021",fg:"#d6312a",f:"'Special Elite','Courier New',monospace"},
    {bg:"#ece6d8",fg:"#0f0c19",f:"'Rubik Mono One','Arial Black',sans-serif"},
    {bg:"#d6312a",fg:"#ece6d8",f:"'Playfair Display',Georgia,serif",i:1},
    {bg:"#0f0c19",fg:"#ece6d8",f:"'Bowlby One','Arial Black',sans-serif",b:1},
    {bg:"#c88a4b",fg:"#2a170a",f:"'Abril Fatface',Georgia,serif"}
  ];
  /* the italic serif makes a Q look like a 2, so a Q gets a plain style instead */
  function pickStyle(ch,i){let st=styles[i];if(st.i&&/[QqGg2]/.test(ch))st=styles[(i+1)%styles.length];return st}
  function rnd(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
  function renderRansoms(){document.querySelectorAll('.ransom[data-word]').forEach(el=>{
    el.textContent="";
    const r=rnd(+el.dataset.seed||1);
    T(el.dataset.word).split(" ").forEach(part=>{
      const w=document.createElement("span");w.className="w";w.setAttribute("aria-hidden","true");
      [...part].forEach(ch=>{
        const st=pickStyle(ch,Math.floor(r()*styles.length));
        const rot=+(r()*12-6).toFixed(1), y=Math.round(r()*14-7);
        const l=document.createElement("span");l.className="l";l.textContent=ch;
        l.style.background=st.bg;l.style.color=st.fg;l.style.fontFamily=st.f;
        if(st.i)l.style.fontStyle="italic";
        if(st.b)l.style.border="2px solid #ece6d8";
        l.style.transform=`rotate(${rot}deg) translateY(${y/100}em)`;
        l.style.setProperty("--hov",`rotate(${(rot*1.8).toFixed(1)}deg) translateY(${(y*1.6)/100}em)`);
        w.appendChild(l);
      });
      el.appendChild(w);
    });
  });}
  renderRansoms();

  /* mobile menu */
  const menu=document.getElementById("menu");
  document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>menu.checked=false));

  /* nav highlight */
  const links=[...document.querySelectorAll(".nav a")];
  const secs=links.map(a=>document.querySelector(a.getAttribute("href")));
  function mark(){
    const y=scrollY+innerHeight*.4;let cur=secs[0];
    secs.forEach(s=>{if(s&&s.offsetTop<=y)cur=s});
    links.forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+cur.id));
  }
  const header=document.querySelector(".header");
  function shrink(){header.classList.toggle("small",scrollY>40);
    const max=document.documentElement.scrollHeight-innerHeight;header.style.setProperty("--sp",max>0?(scrollY/max).toFixed(4):0)}
  addEventListener("scroll",()=>{mark();shrink()},{passive:true});mark();shrink();

  /* the puppet */
  const pup=document.getElementById("puppet"),bub=document.getElementById("bubble");
  const lies=["Mijn code werkt altijd meteen.","Ik heb nog nooit een bug gehad.","Ik ga altijd vroeg slapen.","Ik lees altijd eerst de uitleg.","Mijn server crasht nooit.","Ik heb nog nooit iets gegoogeld.","Ik heb vroeger nooit gelogen.","Ik ben de beste developer ter wereld."];
  const truths=["Oké oké. Ik vind programmeren gewoon leuk.","Echt waar: ik maak servers op maat.","Waarheid: je mag me altijd mailen.","Zie je, de neus krimpt."];
  let n=0,li=0,ti=0;
  function setNose(){
    const v=1+n*.5;
    pup.style.setProperty("--nose",v);pup.style.setProperty("--leaf",n>=3?1:0);
  }
  let sayKey="Klik op mij. Ik lieg nooit, echt.";
  function say(t){sayKey=t;bub.textContent=T(t);bub.classList.remove("pop");void bub.offsetWidth;bub.classList.add("pop")}
  function lie(){
    if(n>=8){say("Ok stop, mijn neus is lang genoeg.");return}
    n++;say(lies[li++%lies.length]);setNose();
  }
  pup.addEventListener("click",lie);
  document.getElementById("lie").addEventListener("click",lie);
  document.getElementById("truth").addEventListener("click",()=>{n=0;say(truths[ti++%truths.length]);setNose()});
  document.getElementById("dance").addEventListener("click",()=>{
    say("Kijk mij gaan!");const rig=document.getElementById("rig");[pup,rig].forEach(e=>{e.classList.remove("dance");void e.offsetWidth;e.classList.add("dance")});
    setTimeout(()=>{pup.classList.remove("dance");rig.classList.remove("dance")},1500);
  });
  setNose();

  /* eyes follow the mouse */
  const root=document.documentElement;
  addEventListener("pointermove",e=>{
    const r=pup.getBoundingClientRect();
    const hx=r.left+r.width/2,hy=r.top+r.height*.3;
    const dx=Math.max(-1,Math.min(1,(e.clientX-hx)/300)),dy=Math.max(-1,Math.min(1,(e.clientY-hy)/300));
    root.style.setProperty("--lx",(dx*3.5).toFixed(2)+"px");root.style.setProperty("--ly",(dy*3).toFixed(2)+"px");
  },{passive:true});

  /* age updates by itself every 21 March */
  (function(){
    const d=new Date(),y=d.getFullYear(),m=d.getMonth(),day=d.getDate();
    const had=(m>2)||(m===2&&day>=21);
    document.getElementById("age").textContent=y-2009-(had?0:1);
    if(m===2&&day===21){document.getElementById("bday").hidden=false;say("Vandaag ben ik jarig! Dat is geen leugen.")}
  })();

  document.getElementById("yr").textContent=new Date().getFullYear();
  const fm=document.getElementById("footmail");
  fm.addEventListener("click",()=>{const sp=fm.querySelector("span"),t="xeno.becaus1@gmail.com";
    const done=()=>{sp.textContent=T("gekopieerd!");setTimeout(()=>sp.textContent=t,1600)};
    try{navigator.clipboard.writeText(t).then(done,()=>{})}catch(e){}});

  /* tab title when you leave */
  const TITLE="ONEX · Pinokkio's werkplaats";
  document.addEventListener("visibilitychange",()=>{document.title=T(document.hidden?"kom terug, ik lieg niet":TITLE)});

  /* strings follow hands and knees */
  const all=pup.querySelector(".all"),strs=[...pup.querySelectorAll(".str")];
  const pt=pup.createSVGPoint();
  (function tie(){
    const inv=all.getCTM().inverse();
    strs.forEach(l=>{
      const g=pup.querySelector("."+l.dataset.limb);
      pt.x=+l.dataset.px;pt.y=+l.dataset.py;
      const p=pt.matrixTransform(inv.multiply(g.getCTM()));
      l.setAttribute("x2",p.x.toFixed(1));l.setAttribute("y2",p.y.toFixed(1));
    });
    requestAnimationFrame(tie);
  })();

  /* skills: noses grow when visible */
  function grow(sk){
    if(sk.classList.contains("grown"))return;
    sk.classList.add("grown");
    const p=sk.querySelector(".pct"),to=+p.dataset.to;
    if(reduce){p.textContent=to+"%";return}
    const t0=performance.now();
    (function f(t){const k=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-k,3);p.textContent=Math.round(to*e)+"%";if(k<1)requestAnimationFrame(f)})(t0);
  }
  const skills=[...document.querySelectorAll(".skill")];
  if("IntersectionObserver" in window){
    const box=document.querySelector(".skills");
    const growAll=()=>skills.forEach((sk,i)=>setTimeout(()=>grow(sk),i*130));
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){growAll();io.disconnect()}},{threshold:.15});
    io.observe(box);
  }else skills.forEach(grow);

  /* contact: build your own letter */
  const TO="xeno.becaus1@gmail.com";
  const fName=document.getElementById("f-name"),fMsg=document.getElementById("f-msg"),note=document.getElementById("note");
  const nTitle=document.getElementById("n-title"),nMsg=document.getElementById("n-msg"),nName=document.getElementById("n-name");
  const mailbtn=document.getElementById("mailbtn"),gmailbtn=document.getElementById("gmailbtn"),status=document.getElementById("status");
  /* phones: Gmail web compose doesn't work well, use the mail app instead */
  const isPhone=/Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle/i.test(navigator.userAgent)
    ||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1) /* iPad that pretends to be a Mac */
    ||matchMedia("(pointer:coarse)").matches;
  if(isPhone){
    gmailbtn.hidden=true;
    mailbtn.textContent=T("Verstuur via mail");
    mailbtn.classList.remove("ghost");mailbtn.classList.add("red");
    mailbtn.removeAttribute("target");
  }
  function ransomInto(el,word,seed){
    el.textContent="";const r=rnd(seed);
    word.toUpperCase().split(" ").forEach(part=>{
      const w=document.createElement("span");w.className="w";
      [...part].forEach(ch=>{
        const st=pickStyle(ch,Math.floor(r()*styles.length));
        const l=document.createElement("span");l.className="l";l.textContent=ch;
        l.style.background=st.bg;l.style.color=st.fg;l.style.fontFamily=st.f;
        if(st.i)l.style.fontStyle="italic";
        l.style.transform=`rotate(${(r()*10-5).toFixed(1)}deg)`;
        w.appendChild(l);
      });
      el.appendChild(w);
    });
  }
  function what(){return document.querySelector('input[name="what"]:checked').value}
  function body(){
    const n=fName.value.trim(),m=fMsg.value.trim();
    const w=what(),q=w==="Vraag";
    return `${T("Hoi ONEX,")}\n\n${q?T("Ik heb een vraag:"):T("Ik wil graag:")+" "+T(w)}\n\n${m||T("(typ hier je bericht)")}\n\n${T("Groetjes,")}\n${n||"..."}`;
  }
  let lastWhat="";
  function update(){
    const w=what();
    const key=w+getLang();
    if(key!==lastWhat){ransomInto(nTitle,T(w),w.length*7+3);lastWhat=key;note.classList.remove("pop");void note.offsetWidth;note.classList.add("pop")}
    const m=fMsg.value.trim();
    nMsg.textContent=m||T("Typ hier je vraag of wat je wilt laten maken.");nMsg.classList.toggle("empty",!m);
    nName.textContent=fName.value.trim()||"...";
    const su=encodeURIComponent(w==="Vraag"?T("Vraag via je website"):"Project: "+T(w)),bo=encodeURIComponent(body());
    mailbtn.href=`mailto:${TO}?subject=${su}&body=${bo}`;
    gmailbtn.href=`https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${su}&body=${bo}`;
  }
  document.getElementById("maker").addEventListener("input",update);
  document.getElementById("maker").addEventListener("submit",e=>e.preventDefault());
  const tooLong=()=>encodeURIComponent(body()).length>6000;
  gmailbtn.addEventListener("click",()=>{status.textContent=T(tooLong()?"Je bericht is erg lang. Als het in Gmail afgekapt is, gebruik dan Kopieer en plak het erin.":"Gmail opent in een nieuw tabblad met je brief al ingevuld.")});
  mailbtn.addEventListener("click",()=>{status.textContent=T("Je mail-app zou nu moeten openen. Gebeurt er niets? Gebruik Kopieer en mail het zelf.")});
  function copyText(t,el,ok){
    const sel=()=>{if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);status.textContent=T("Geselecteerd, druk Ctrl+C.")};
    try{navigator.clipboard.writeText(t).then(()=>status.textContent=T(ok),sel)}catch(e){sel()}
  }
  document.getElementById("copymsg").addEventListener("click",()=>copyText(body(),nMsg,"Gekopieerd! Plak het in een mail of op Discord."));
  const em=document.getElementById("email");
  document.getElementById("copy").addEventListener("click",()=>copyText(TO,em,"Mailadres gekopieerd!"));
  update();
  /* "Bespreken" buttons pick that project in the letter */
  document.querySelectorAll("[data-pick]").forEach(btn=>btn.addEventListener("click",()=>{
    const r=document.querySelector(`input[name="what"][value="${btn.dataset.pick}"]`);
    if(r){r.checked=true;update();status.textContent="";}
  }));

  /* visitor counter: GoatCounter counts unique visitors without storing IPs */
  (function(){
    const box=document.getElementById("v-digits");
    function show(n){
      const d=String(n).padStart(4,"0");
      box.innerHTML="";
      box.style.setProperty("--len",d.length);
      box.classList.toggle("long",d.length>6);
      [...d].forEach((c,i)=>{const el=document.createElement("i");el.textContent=c;el.style.setProperty("--r",((i%2?1:-1)*(1+(+c%3)))+"deg");
        if(d.length>4&&i>0&&(d.length-i)%3===0)el.classList.add("grp"); /* small gap every 3 digits: 1 234 567 */
        if(!reduce)el.style.animationDelay=(i*90)+"ms";box.appendChild(el)});
      box.setAttribute("aria-label",n);
    }
    /* count this browser once: GoatCounter itself stores no IPs */
    let counted=false,justCounted=false;try{counted=localStorage.getItem("onex-counted")==="1"}catch(e){}
    if(!counted)justCounted=true; /* this visit is about to be counted */
    function countOnce(tries){
      if(counted)return;
      if(window.goatcounter&&window.goatcounter.count){
        window.goatcounter.count({path:"/",title:"ONEX"});
        try{localStorage.setItem("onex-counted","1")}catch(e){}
        counted=true;justCounted=true;
      }else if(tries<20)setTimeout(()=>countOnce(tries+1),250);
    }
    countOnce(0);
    /* GoatCounter caches each counter URL for a while. A far-future "end" date that changes
       on every request gives a fresh URL, so the number is always current. */
    let shown=-1,bump=0,base=null;
    const started=Date.now();
    function render(n){if(n!==shown){shown=n;show(n)}}
    function load(){
      const end=new Date(Date.UTC(2030,0,1)+(Math.floor(Date.now()/1000)%3000)*864e5).toISOString().slice(0,10);
      fetch("https://onexbcs.goatcounter.com/counter/TOTAL.json?start=2026-10-05&end="+end,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{
        const n=parseInt(String(j.count).replace(/\D/g,""),10);
        if(isNaN(n))return;
        if(base===null){base=n;bump=justCounted?1:0}
        /* a new visitor sees themselves at once; GoatCounter needs a few seconds to process the visit */
        if(bump&&(n>base||Date.now()-started>120000))bump=0;
        render(n+bump);
      }).catch(()=>{if(shown<0)document.getElementById("visits").hidden=true});
    }
    load();
    /* keep the number live while the page is open */
    setInterval(()=>{if(!document.hidden)load()},20000);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
  })();

  /* language NL / EN */
  document.querySelectorAll(".lang button").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
  document.addEventListener("langchange",()=>{
    renderRansoms();
    bub.textContent=T(sayKey);
    if(isPhone)mailbtn.textContent=T("Verstuur via mail");
    status.textContent="";
    document.title=T(TITLE);
    update();
  });
  applyLang();
})();
