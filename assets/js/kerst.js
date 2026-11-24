/* ONEX · Christmas makeover.
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
const T={nl:{tag:"fijne feestdagen",foot:"Fijne feestdagen en een gelukkig 2027!"},en:{tag:"happy holidays",foot:"Happy holidays and a happy 2027!"}};
const L=()=>root.lang==="en"?"en":"nl";

/* --- string of lights under the menu bar --- */
const header=document.querySelector(".header");
const COLS=["#e2483d","#f2c14e","#4fae6a","#5b8ee6","#f08bb4"];
let lightsW=0;
function buildLights(){
  if(!header)return;
  const w=innerWidth;if(w===lightsW)return;lightsW=w;
  let el=header.querySelector(".xm-lights");
  if(!el){el=document.createElement("div");el.className="xm-lights";el.setAttribute("aria-hidden","true");header.appendChild(el)}
  const seg=w<700?70:96,n=Math.ceil(w/seg),sag=12;
  let d="M0 4",bulbs="";
  for(let i=0;i<n;i++){
    const x0=i*seg,x1=x0+seg,xm=x0+seg/2;
    d+=` Q${xm} ${4+sag*2} ${x1} 4`;
    // two bulbs per swoop, sitting on the curve
    [.3,.7].forEach((t,k)=>{
      const x=x0+seg*t,y=4+2*sag*2*t*(1-t)*1; // quadratic: y = (1-t)^2*4 + 2t(1-t)*(4+2sag) + t^2*4
      const c=COLS[(i*2+k)%COLS.length];
      bulbs+=`<g class="xm-b" style="--c:${c};--dl:${(((i*2+k)*0.37)%2.4).toFixed(2)}s" transform="translate(${x.toFixed(1)} ${(y+1).toFixed(1)}) rotate(${k?8:-8})"><rect x="-2.6" y="-1" width="5.2" height="4" rx="1" fill="#3a3a3a"/><path d="M0 2.5c4.2 0 5.6 5 5.6 7.6 0 3.4-2.6 5.6-5.6 5.6s-5.6-2.2-5.6-5.6C-5.6 7.5-4.2 2.5 0 2.5z" fill="${c}"/><ellipse cx="-1.8" cy="7.5" rx="1.3" ry="2.3" fill="#fff" opacity=".55"/></g>`;
    });
  }
  el.innerHTML=`<svg width="${w}" height="44" viewBox="0 0 ${w} 44"><path d="${d}" fill="none" stroke="#1f2a1c" stroke-width="1.6"/>${bulbs}</svg>`;
}

/* --- Santa hats: on the marionette and on the ONEX logos --- */
function puppetHat(){
  const all=document.querySelector("#puppet .all");if(!all||all.querySelector(".xm-hat"))return;
  const g=document.createElementNS(NS,"g");g.setAttribute("class","xm-hat");
  g.innerHTML=`
    <path d="M104 90C110 44 146 10 192 6c40-3 66 22 66 60-10-16-28-22-42-12 2 10 4 24 4 36z" fill="#c8242b" stroke="#6e1014" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M150 22c18-8 40-8 58 0" stroke="#e45a50" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M94 94c40-22 92-22 134 0l2 22c-42-20-96-20-138 0z" fill="#f4f1ea" stroke="#b9b2a3" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="258" cy="70" r="15" fill="#f4f1ea" stroke="#b9b2a3" stroke-width="2"/>`;
  all.appendChild(g);
}
function logoHats(){
  document.querySelectorAll(".logo").forEach(a=>{
    if(a.querySelector(".xm-lhat"))return;
    const s=document.createElement("span");s.className="xm-lhat";s.setAttribute("aria-hidden","true");
    s.innerHTML=`<svg viewBox="0 0 60 46"><path d="M8 34C10 16 22 4 38 3c12-1 20 7 20 19-4-5-10-6-14-2 1 4 1 9 1 14z" fill="#c8242b" stroke="#6e1014" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 36c14-8 32-8 44 0v7c-12-7-30-7-44 0z" fill="#f4f1ea" stroke="#b9b2a3" stroke-width="1.2"/><circle cx="57" cy="24" r="5" fill="#f4f1ea" stroke="#b9b2a3" stroke-width="1.2"/></svg>`;
    a.appendChild(s);
  });
}

/* --- a paper tag on a string in the hero, and a line in the footer --- */
function tag(){
  const copy=document.querySelector(".hero .copy");if(!copy||copy.querySelector(".xm-tag"))return;
  const t=document.createElement("span");t.className="xm-tag";t.setAttribute("aria-hidden","true");
  t.innerHTML=`<i class="xm-str"></i><b class="xm-card"></b>`;copy.appendChild(t);
  const f=document.querySelector(".foot .wrap, .foot");
  if(f&&!document.querySelector(".xm-foot")){const p=document.createElement("p");p.className="xm-foot";f.appendChild(p)}
  texts();
}
function texts(){
  const c=document.querySelector(".xm-card");if(c)c.textContent=T[L()].tag;
  const p=document.querySelector(".xm-foot");if(p)p.textContent="❄ "+T[L()].foot+" ❄";
}
new MutationObserver(texts).observe(root,{attributes:true,attributeFilter:["lang"]});

/* --- snow --- */
function snow(){
  if(reduce)return;
  const cv=document.createElement("canvas");cv.className="xm-snow";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");
  let W=0,H=0,dpr=1,flakes=[],raf=0,last=0,wind=0;
  function size(){
    const w=innerWidth,h=innerHeight;if(w===W&&Math.abs(h-H)<150&&W)return;
    W=w;H=h;dpr=Math.min(1.5,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(Math.min(110,W*H/16000));
    flakes=Array.from({length:n},()=>mk(true));
  }
  function mk(any){const r=.8+Math.random()*2.4;return{x:Math.random()*W,y:any?Math.random()*H:-10,r,s:.25+r*.22+Math.random()*.25,ph:Math.random()*6.28,a:.35+Math.random()*.5}}
  function step(now){
    const dt=Math.min(50,now-(last||now))/16.7;last=now;
    wind+=((Math.sin(now/4000)*.35)-wind)*.02;
    ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";
    for(const f of flakes){
      f.ph+=.01*dt;f.y+=f.s*dt;f.x+=(Math.sin(f.ph)*.3+wind)*dt;
      if(f.y>H+6){Object.assign(f,mk(false))}
      if(f.x>W+6)f.x=-6;else if(f.x<-6)f.x=W+6;
      ctx.globalAlpha=f.a;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fill();
    }
    ctx.globalAlpha=1;
    raf=requestAnimationFrame(step);
  }
  size();addEventListener("resize",size);
  const go=()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(step)};
  document.addEventListener("visibilitychange",go);go();
}

function start(){buildLights();puppetHat();logoHats();tag();snow();addEventListener("resize",buildLights)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
