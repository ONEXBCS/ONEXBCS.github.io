/* ONEX — mini Pinokkio die je volgt terwijl je scrolt */
(function(){
  const src=document.getElementById("puppet");
  if(!src)return;
  const T=window.T||(s=>s);
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* build: a string from the top of the screen + a copy of the big puppet */
  const wrap=document.createElement("div");
  wrap.className="buddy";wrap.setAttribute("aria-hidden","true");
  wrap.innerHTML=`<svg class="toymaker" viewBox="0 0 200 112" aria-hidden="true">
  <defs>
    <radialGradient id="mkSkin" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#ffd9bd"/><stop offset=".7" stop-color="#f0b48e"/><stop offset="1" stop-color="#d98e66"/></radialGradient>
    <linearGradient id="mkWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3a466"/><stop offset="1" stop-color="#7e4a22"/></linearGradient>
    <linearGradient id="mkPants" gradientUnits="userSpaceOnUse" x1="0" y1="34" x2="0" y2="82"><stop offset="0" stop-color="#6b5a45"/><stop offset="1" stop-color="#4a3c2c"/></linearGradient>
    <linearGradient id="mkStripe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e7d2"/><stop offset="1" stop-color="#cdbf9f"/></linearGradient>
    <linearGradient id="mkWig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c96a"/><stop offset="1" stop-color="#c39a3a"/></linearGradient>
    <linearGradient id="mkHat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b8be8"/><stop offset="1" stop-color="#1f4f9e"/></linearGradient>
  </defs>
  <!-- legs kicking up in the air behind him -->
  <g class="mk-leg mk-leg1" transform="translate(18 0)">
    <path d="M58 74H34" stroke="url(#mkPants)" stroke-width="13" stroke-linecap="round"/>
    <path d="M34 74L22 44" stroke="url(#mkPants)" stroke-width="11" stroke-linecap="round"/>
    <path d="M13 41c0-7 6-10 13-8l7 3c3 2 2 6-2 6H15c-1 0-2-0-2-1z" fill="url(#mkWood)" stroke="#3d200c" stroke-width="1.6"/>
  </g>
  <g class="mk-leg mk-leg2" transform="translate(18 0)">
    <path d="M62 73.5H42" stroke="url(#mkPants)" stroke-width="13" stroke-linecap="round"/>
    <path d="M42 73.5l8-28" stroke="url(#mkPants)" stroke-width="11" stroke-linecap="round"/>
    <path d="M41 41c1-7 8-9 14-6l6 4c3 2 1 6-3 5l-15-1c-1 0-2-1-2-2z" fill="url(#mkWood)" stroke="#3d200c" stroke-width="1.6"/>
  </g>
  <!-- body lying on the bar: striped shirt, braces -->
  <path d="M54 80c-2-16 10-26 32-26h26c18 0 30 10 32 26z" fill="url(#mkStripe)" stroke="#3d200c" stroke-width="1.8"/>
  <path d="M70 80c0-10 4-22 14-24h18c8 2 12 12 12 24z" fill="#8a5a33" stroke="#4a2a10" stroke-width="1.6"/>
  <path d="M84 56l-4-6M102 56l3-6" stroke="#4a2a10" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="84" y="66" width="16" height="9" rx="1.5" fill="#6e4524" stroke="#4a2a10" stroke-width="1"/>
  <path d="M88 66v-4M92 66v-6" stroke="#e8b021" stroke-width="1.6" stroke-linecap="round"/>
  <!-- arms hanging over the edge, holding the reel -->
  <path class="mk-arm" d="M118 66c8 4 12 14 12 24" stroke="url(#mkStripe)" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M118 66c8 4 12 14 12 24" stroke="#3d200c" stroke-width="1.4" fill="none" opacity=".35"/>
  <!-- head (big and round) -->
  <g transform="translate(-9 5)"><g class="mk-head">
    <ellipse cx="129" cy="51" rx="6" ry="8" fill="url(#mkSkin)" stroke="#3d200c" stroke-width="1.6"/>
    <ellipse cx="179" cy="51" rx="6" ry="8" fill="url(#mkSkin)" stroke="#3d200c" stroke-width="1.6"/>
    <path d="M128 46c0-19 12-29 26-29s26 10 26 29c0 15-10 30-26 30s-26-15-26-30z" fill="url(#mkSkin)" stroke="#3d200c" stroke-width="1.8"/>
    <!-- old age: forehead lines, crow's feet, bags under the eyes -->
    <path d="M140 31q14-4 28 0M142 35q12-3 24 0M145 39q9-2 18 0" stroke="#b86f4c" stroke-width="1.3" fill="none" opacity=".75"/>
    <path d="M134 47l-4-2M134 50l-4 0M174 47l4-2M174 50l4 0" stroke="#b86f4c" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>
    <path d="M140 57q5 2 10 0M158 57q5 2 10 0" stroke="#c27a57" stroke-width="1.1" fill="none" opacity=".8"/>
    <path d="M141 64q-3 4-1 8M167 64q3 4 1 8" stroke="#c27a57" stroke-width="1.2" fill="none" opacity=".6"/>
    <!-- grey hair showing under the wig at the temples -->
    <path d="M131 44c-2 6-1 12 2 16M177 44c2 6 1 12-2 16" stroke="#a9a49b" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <!-- grey stubble on chin -->
    <path d="M136 62c4 9 10 13 18 13s14-4 18-13c-5 4-11 6-18 6s-13-2-18-6z" fill="#a9a49b" opacity=".7"/>
    <!-- cheeks -->
    <ellipse cx="139" cy="56" rx="5" ry="3.4" fill="#ef8b78" opacity=".5"/>
    <ellipse cx="169" cy="56" rx="5" ry="3.4" fill="#ef8b78" opacity=".5"/>
    <!-- mouth with a small drooping grey moustache -->
    <path d="M148 67q6 3 12 0" stroke="#7a3b2a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M143 64c4-3 8-3 11-1 3-2 7-2 11 1-2 3-5 3-8 2-1 0-2 0-3 1-1-1-2-1-3-1-3 1-6 1-8-2z" fill="#bdb8b0" stroke="#8d887f" stroke-width="1"/>
    <!-- long nose -->
    <path d="M151 47c1 6 1 10-2 13 3 2 9 2 11 0-3-3-3-8-2-13z" fill="#f2a487" stroke="#a2543f" stroke-width="1.2"/>
    <!-- thick grey brows -->
    <path d="M137 41q6-5 13-1M158 40q7-4 13 1" stroke="#b5b0a7" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- small round spectacles on the nose -->
    <circle cx="145" cy="49" r="6.5" fill="#ffffff" fill-opacity=".2" stroke="#6b4a1e" stroke-width="1.8"/>
    <circle cx="163" cy="49" r="6.5" fill="#ffffff" fill-opacity=".2" stroke="#6b4a1e" stroke-width="1.8"/>
    <path d="M151.5 49h5" stroke="#6b4a1e" stroke-width="1.6"/>
    <g class="mk-eyes"><circle cx="145" cy="51" r="2.3" fill="#2a1d14"/><circle cx="163" cy="51" r="2.3" fill="#2a1d14"/>
      <circle cx="145.8" cy="50.2" r=".8" fill="#fff"/><circle cx="163.8" cy="50.2" r=".8" fill="#fff"/></g>
    <!-- the famous yellow wig ("Polendina") -->
    <path d="M124 50c-6-8-4-20 2-26 2-10 12-15 20-13 6-6 18-6 24 0 9-1 16 6 16 14 6 6 6 17 0 25-2-7-5-11-9-13 0-8-6-14-14-15-5 4-13 4-18 0-8 1-14 7-14 15-4 2-6 7-7 13z" fill="url(#mkWig)" stroke="#8a6410" stroke-width="1.6" stroke-linejoin="round"/>
    <g fill="none" stroke="#b8861a" stroke-width="1.3" stroke-linecap="round">
      <path d="M131 26q3 4 0 8M141 17q3 4 0 8M154 14q3 4 0 8M167 17q3 4 0 8M177 26q3 4 0 8"/>
      <path d="M126 38q3 3 1 7M182 38q3 3 1 7"/>
    </g>
    <!-- carpenter pencil behind the ear -->
    <g transform="rotate(-50 182 44)"><rect x="174" y="42" width="16" height="3.4" rx="1" fill="#e8b021" stroke="#7a5a08" stroke-width=".7"/><path d="M190 42l3.5 1.7-3.5 1.7z" fill="#3d200c"/></g>
  </g></g>
  <!-- reel -->
  <g class="mk-spool">
    <circle cx="140" cy="98" r="10" fill="url(#mkWood)" stroke="#3d200c" stroke-width="1.6"/>
    <circle cx="140" cy="98" r="6.5" fill="none" stroke="#e6dfcf" stroke-width="2.4" stroke-dasharray="3 1.6"/>
    <path d="M140 88v20M130 98h20" stroke="#5a3317" stroke-width="1.5"/>
    <circle cx="140" cy="98" r="2.4" fill="#3d200c"/>
  </g>
  <!-- hands -->
  <circle cx="131" cy="95" r="5.5" fill="url(#mkSkin)" stroke="#3d200c" stroke-width="1.5"/>
  <circle class="mk-hand-crank" cx="147" cy="91" r="5" fill="url(#mkSkin)" stroke="#3d200c" stroke-width="1.5"/>
</svg>`+'<i class="buddy-str"></i><div class="buddy-bubble" data-noi18n></div><div class="gep-bubble" data-noi18n></div>';
  const svg=src.cloneNode(true);
  svg.removeAttribute("id");svg.removeAttribute("role");svg.removeAttribute("aria-label");
  svg.setAttribute("class","buddy-pup");
  svg.setAttribute("viewBox","40 20 240 470");
  svg.querySelectorAll(".str,.bar,defs").forEach(n=>n.remove());
  svg.style.cssText="--nose:1.15";
  wrap.appendChild(svg);
  document.body.appendChild(wrap);
  let rigging=false;
  /* on load Geppetto comes down on a string too, like the menu */
  if(document.documentElement.classList.contains("rig-on")&&getComputedStyle(wrap).display!=="none"){
    const tm=wrap.querySelector(".toymaker").getBoundingClientRect(),wr=wrap.getBoundingClientRect();
    const r=document.createElement("i");r.className="rope";r.setAttribute("aria-hidden","true");
    const len=innerHeight*1.2,y=tm.top-wr.top+tm.height*.62;
    r.style.cssText=`bottom:auto;top:${y-len}px;height:${len}px;left:${tm.left-wr.left+tm.width*.36}px;z-index:2;--rd:.7s`;
    wrap.appendChild(r);
    /* first Geppetto lands, then he lets Pinokkio down */
    rigging=true;
    setTimeout(()=>{rigging=false;wrap.classList.add("unroll");update();ready=true;setTimeout(()=>wrap.classList.remove("unroll"),1300)},2000);
  }
  const bubble=wrap.querySelector(".buddy-bubble"),gepBubble=wrap.querySelector(".gep-bubble");

  /* what he says in each section */
  const LINES={
    wie:"Dit ben ik!",
    skills:"Kijk, mijn skills!",
    bouwen:"Wat zal ik voor je bouwen?",
    projecten:"Kijk wat ik al maakte!",
    socials:"Hier vind je me!",
    contact:"Stuur me een brief!"
  };
  const ids=Object.keys(LINES);
  let current=null,key=null,hideT=null;

  let wheeing=false;
  function say(k){
    if(wheeing)return;
    key=k;bubble.textContent=T(LINES[k]||k);
    wrap.classList.add("talk");
    clearTimeout(hideT);hideT=setTimeout(()=>wrap.classList.remove("talk"),2600);
    if(!reduce){svg.classList.remove("wave");void svg.getBoundingClientRect();svg.classList.add("wave");}
  }

  let ready=false,gepSaid=false,gepKey=null,gepT=null,replyT=null;
  function gepTalk(k){gepKey=k;gepBubble.textContent=T(k);wrap.classList.add("gep-talk");clearTimeout(gepT);gepT=setTimeout(()=>wrap.classList.remove("gep-talk"),3200);}
  function update(){
    const max=document.documentElement.scrollHeight-innerHeight;
    const p=max>0?Math.min(1,scrollY/max):0;
    /* hidden while the big puppet on home is visible */
    const home=document.getElementById("home");
    const show=!rigging&&(home?home.getBoundingClientRect().bottom<innerHeight*0.35:true); /* while Geppetto comes down, Pinokkio stays rolled up */
    wrap.classList.toggle("on",show);
    /* string gets longer the further you scroll */
    const strTop=wrap.querySelector(".buddy-str").getBoundingClientRect().top;
    const pupH=wrap.clientWidth*470/240; /* puppet height from its width, ignores the hide animation */
    const room=Math.max(0,innerHeight-strTop-pupH-40);
    const drop=show?20+p*room:0; /* rolled up while you are on home */
    wrap.style.setProperty("--drop",Math.round(drop)+"px");
    wrap.style.setProperty("--spin",(drop*4).toFixed(1)+"deg");
    const ang=drop*4*Math.PI/180;
    const hand=wrap.querySelector(".mk-hand-crank");
    if(hand){hand.setAttribute("cx",(140+8*Math.cos(ang-Math.PI/4)).toFixed(1));hand.setAttribute("cy",(98+8*Math.sin(ang-Math.PI/4)).toFixed(1));}
    /* which section is in the middle of the screen */
    let sec=null;
    for(const id of ids){const el=document.getElementById(id);if(!el)continue;const r=el.getBoundingClientRect();if(r.top<innerHeight*0.5&&r.bottom>innerHeight*0.5)sec=id;}
    const atBottom=show&&p>0.985;
    if(!ready){
      /* just loaded or refreshed: remember where we are, but stay quiet */
      if(atBottom){gepSaid=true;current="bottom";}else if(show&&sec)current=sec;
    }else if(atBottom){
      /* at the very bottom: Geppetto calls, Pinokkio answers */
      if(!gepSaid){gepSaid=true;current="bottom";wrap.classList.remove("talk");
        gepTalk("Pinokkio, kom terug naar boven!");
        clearTimeout(replyT);replyT=setTimeout(()=>say("Ik kom zo, papa!"),1400);}
    }else{
      if(p<0.9&&gepSaid){gepSaid=false;current=null;}
      if(show&&sec&&sec!==current&&current!=="bottom"){current=sec;say(sec);}
    }
    if(!show)current=null;
  }

  let ticking=false;
  addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;update()})}},{passive:true});
  addEventListener("resize",update);
  document.addEventListener("langchange",()=>{if(key)bubble.textContent=T(LINES[key]||key);if(gepKey)gepBubble.textContent=T(gepKey)});

  /* click him: back to the top */
  svg.style.pointerEvents="auto";
  let wheeT=null;
  function whee(){
    if(scrollY<=2||!wrap.classList.contains("on")||!svg.getBoundingClientRect().width)return; /* at the top, or he is hidden (small screen) */
    wheeing=true;key=null;clearTimeout(hideT);wrap.classList.remove("talk","gep-talk");
    if(reduce){scrollTo({top:0,behavior:"auto"});wheeing=false;return}
    /* a slow, fun ride up that leaves a trail of "Wheeeee" behind him */
    const from=scrollY,dur=Math.min(1800,600+from*.25),t0=performance.now();
    let i=0,lastY=null;
    cancelAnimationFrame(wheeT);
    const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    const step=now=>{
      const t=Math.min(1,(now-t0)/dur);
      scrollTo({top:Math.round(from*(1-ease(t))),behavior:"instant"});
      const r=svg.getBoundingClientRect();
      const y=Math.min(r.bottom-4,innerHeight-72); /* keep the first W on screen */
      if(lastY===null||lastY-y>=17){
        lastY=y;
        const l=document.createElement("span");l.className="whee";l.setAttribute("aria-hidden","true");
        l.textContent=i===0?"W":i===1?"h":"e";
        l.style.left=(r.left+r.width/2+Math.sin(i*1.1)*9)+"px";
        l.style.top=y+"px";
        l.style.setProperty("--r",(Math.sin(i*2.1)*12).toFixed(1)+"deg");
        l.style.fontSize=(i===0?30:24)+"px";
        document.body.appendChild(l);
        setTimeout(()=>l.remove(),1700);
        i++;
      }
      if(t<1)wheeT=requestAnimationFrame(step);else wheeing=false;
    };
    wheeT=requestAnimationFrame(step);
  }
  svg.addEventListener("click",whee);
  /* ONEX logo, Home and "Naar boven" links: same ride up */
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href="#home"]');
    if(!a||!wrap.classList.contains("on")||scrollY<=2||!svg.getBoundingClientRect().width)return;
    e.preventDefault();whee();
  });

  update();
  addEventListener("load",()=>{update();setTimeout(()=>{if(rigging)return;update();ready=true},700)});
})();
