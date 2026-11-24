/* ONEX · Christmas makeover, in the site's own style: twine, cut paper, ransom letters, typewriter.
   Everything festive lives in this file and kerst.css, and only works while <html> has the "kerst" class.
   It switches itself off after 6 January, so the site goes back to normal on its own.
   To turn it off by hand: remove the two lines marked KERST in index.html. */
(function(){
"use strict";
const END=new Date(2027,0,7); // 7 Jan 2027, 00:00
if(new Date()>=END)return;
const root=document.documentElement;
root.classList.add("kerst");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS="http://www.w3.org/2000/svg";
const T={nl:{word:"FIJNE FEESTDAGEN",foot:"// fijne feestdagen en een gelukkig 2027"},en:{word:"HAPPY HOLIDAYS",foot:"// happy holidays and a happy 2027"}};
const L=()=>root.lang==="en"?"en":"nl";
// same paper scraps as the ransom headings
const PAPER=[
  {bg:"#cfcfcf",fg:"#141414",f:"'Abril Fatface',Georgia,serif"},
  {bg:"#2f6fd0",fg:"#dce7f6",f:"'Bowlby One','Arial Black',sans-serif"},
  {bg:"#4a2a22",fg:"#ece6d8",f:"'Abril Fatface',Georgia,serif"},
  {bg:"#e8b021",fg:"#d6312a",f:"'Special Elite','Courier New',monospace"},
  {bg:"#ece6d8",fg:"#0f0c19",f:"'Rubik Mono One','Arial Black',sans-serif"},
  {bg:"#d6312a",fg:"#ece6d8",f:"'Playfair Display',Georgia,serif",i:1},
  {bg:"#c88a4b",fg:"#2a170a",f:"'Abril Fatface',Georgia,serif"}
];
function rnd(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}

/* --- twine garland with cut-paper flags and stars under the menu bar --- */
const header=document.querySelector(".header");
let gW=0;
function garland(){
  if(!header)return;
  const w=innerWidth;if(w===gW)return;gW=w;
  let el=header.querySelector(".xm-garland");
  if(!el){el=document.createElement("div");el.className="xm-garland";el.setAttribute("aria-hidden","true");header.appendChild(el)}
  const seg=w<700?150:230,n=Math.ceil(w/seg),sag=w<700?12:16,r=rnd(17);
  let d="M0 2",items="";
  for(let i=0;i<n;i++){
    const x0=i*seg,x1=x0+seg;
    d+=` Q${x0+seg/2} ${2+sag*2} ${x1} 2`;
    const per=w<700?4:6;
    for(let k=1;k<per;k++){
      const t=k/per,x=x0+seg*t,y=2+4*sag*t*(1-t);
      const p=PAPER[Math.floor(r()*PAPER.length)],star=r()<.18;
      const rot=(r()*10-5).toFixed(1),dl=(r()*3).toFixed(2),sz=star?(w<700?18:22):(w<700?16:20);
      items+=`<i class="xm-f${star?" xm-star":""}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;--bg:${p.bg};--s:${sz}px;--r:${rot}deg;--dl:-${dl}s"></i>`;
    }
  }
  el.innerHTML=`<svg width="${w}" height="40" viewBox="0 0 ${w} 40"><path d="${d}" fill="none" stroke="#d9d1bf" stroke-width="1.3" opacity=".8"/></svg>${items}`;
}

/* --- ransom-letter banner on two strings in the hero --- */
function banner(){
  const copy=document.querySelector(".hero .copy");if(!copy)return;
  let b=copy.querySelector(".xm-banner");
  if(!b){b=document.createElement("div");b.className="xm-banner";b.setAttribute("aria-hidden","true");copy.appendChild(b)}
  const r=rnd(41);let html="<i class=\"xm-s xm-s1\"></i><i class=\"xm-s xm-s2\"></i><span class=\"xm-word\">";
  T[L()].word.split(" ").forEach(part=>{
    html+="<span class=\"w\">";
    [...part].forEach(ch=>{
      let p=PAPER[Math.floor(r()*PAPER.length)];if(p.i&&/[QqGg2]/.test(ch))p=PAPER[0];
      const rot=(r()*12-6).toFixed(1),y=Math.round(r()*10-5);
      html+=`<span class="l" style="background:${p.bg};color:${p.fg};font-family:${p.f};${p.i?"font-style:italic;":""}transform:rotate(${rot}deg) translateY(${y/100}em)">${ch}</span>`;
    });
    html+="</span>";
  });
  b.innerHTML=html+"</span>";
}

/* --- Santa hats: carved and painted on the marionette, cut paper on the logos --- */
function puppetHat(){
  const all=document.querySelector("#puppet .all");if(!all||all.querySelector(".xm-hat"))return;
  const g=document.createElementNS(NS,"g");g.setAttribute("class","xm-hat");
  g.innerHTML=`
    <path d="M106 92C110 46 146 12 190 8c38-3 62 20 64 56-9-14-26-20-40-11 3 12 5 25 5 39z" fill="#d6312a" stroke="#5a3317" stroke-width="2.5" stroke-linejoin="round"/>
    <g stroke="#8e1d18" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"><path d="M132 84q4-30 26-52"/><path d="M164 82q2-30 22-58"/><path d="M196 84q-2-24 12-48"/></g>
    <path d="M94 96c40-22 92-22 134 0l2 22c-42-20-96-20-138 0z" fill="#ece6d8" stroke="#5a3317" stroke-width="2.5" stroke-linejoin="round"/>
    <g stroke="#a39a86" stroke-width="1.4" opacity=".7" stroke-linecap="round"><path d="M110 100v10M126 95v11M144 92v11M162 91v11M180 92v11M198 94v11M214 98v10"/></g>
    <circle cx="254" cy="68" r="14" fill="#ece6d8" stroke="#5a3317" stroke-width="2.5"/>
    <path d="M247 62q6-4 12 2" stroke="#a39a86" stroke-width="1.4" fill="none"/>`;
  all.appendChild(g);
}
function logoHats(){
  document.querySelectorAll(".logo").forEach(a=>{
    if(a.querySelector(".xm-lhat"))return;
    const s=document.createElement("span");s.className="xm-lhat";s.setAttribute("aria-hidden","true");
    s.innerHTML=`<i class="xm-lh-red"></i><i class="xm-lh-trim"></i><i class="xm-lh-pom"></i>`;
    a.appendChild(s);
  });
}

/* --- typewriter line in the footer --- */
function foot(){
  const f=document.querySelector(".foot .wrap")||document.querySelector(".foot");
  let p=document.querySelector(".xm-foot");
  if(f&&!p){p=document.createElement("p");p.className="xm-foot";f.appendChild(p)}
  if(p)p.textContent=T[L()].foot;
}
new MutationObserver(()=>{banner();foot()}).observe(root,{attributes:true,attributeFilter:["lang"]});

/* --- paper snow: little torn scraps and a few cut-out snowflakes --- */
function snow(){
  if(reduce)return;
  const cv=document.createElement("canvas");cv.className="xm-snow";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");
  let W=0,H=0,dpr=1,bits=[],raf=0,last=0;
  const flake=new Path2D();
  for(let a=0;a<6;a++){ // cut-paper snowflake, 6 arms with little side cuts, radius 1
    const c=Math.cos(a*Math.PI/3),s=Math.sin(a*Math.PI/3),rot=(x,y)=>[x*c-y*s,x*s+y*c];
    const pts=[[-.09,0],[-.09,.55],[-.3,.75],[-.22,.83],[-.06,.68],[-.06,1],[.06,1],[.06,.68],[.22,.83],[.3,.75],[.09,.55],[.09,0]].map(([x,y])=>rot(x,y));
    flake.moveTo(...pts[0]);pts.slice(1).forEach(p=>flake.lineTo(...p));flake.closePath();
  }
  function size(){
    const w=innerWidth,h=innerHeight;if(w===W&&Math.abs(h-H)<150&&W)return;
    W=w;H=h;dpr=Math.min(1.5,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;
    const n=Math.round(Math.min(60,W*H/24000));
    bits=Array.from({length:n},()=>mk(true));
  }
  function mk(any){
    const f=Math.random()<.22;
    return{x:Math.random()*W,y:any?Math.random()*H:-20,f,r:f?6+Math.random()*6:2+Math.random()*2.5,
      v:f?.35+Math.random()*.25:.45+Math.random()*.4,a:Math.random()*6.28,va:(Math.random()-.5)*.03,ph:Math.random()*6.28,
      k:[.8+Math.random()*.4,.7+Math.random()*.5,.9+Math.random()*.3]}
  }
  function step(now){
    const dt=Math.min(50,now-(last||now))/16.7;last=now;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    for(const b of bits){
      b.ph+=.012*dt;b.y+=b.v*dt;b.x+=Math.sin(b.ph)*.35*dt;b.a+=b.va*dt;
      if(b.y>H+20)Object.assign(b,mk(false));
      ctx.setTransform(dpr,0,0,dpr,b.x*dpr,b.y*dpr);ctx.rotate(b.a);
      ctx.fillStyle="#00000055";
      if(b.f){ctx.save();ctx.translate(1.5,2.5);ctx.scale(b.r,b.r);ctx.fill(flake);ctx.restore();ctx.fillStyle="#ece6d8";ctx.scale(b.r,b.r);ctx.fill(flake)}
      else{const r=b.r;ctx.fillStyle="#ece6d8";ctx.beginPath();ctx.moveTo(-r*b.k[0],-r*.8);ctx.lineTo(r*b.k[1],-r);ctx.lineTo(r,r*b.k[2]);ctx.lineTo(-r*.9,r);ctx.closePath();ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1}
    }
    raf=requestAnimationFrame(step);
  }
  size();addEventListener("resize",size);
  const go=()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(step)};
  document.addEventListener("visibilitychange",go);go();
}

function start(){garland();banner();puppetHat();logoHats();foot();snow();addEventListener("resize",garland)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
