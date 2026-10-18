/* Bee — shared motion layer for every page.
   Honey page transitions · weighted scrolling · word reveals · image wipes ·
   magnetic buttons + honey ripple · card tilt · honey cursor · scroll skew · wordmark fill. */
(function(){
  if(window.__beeMotion)return;window.__beeMotion=true;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement;
  const E='cubic-bezier(.2,.7,.1,1)';

  /* ---------- styles ---------- */
  const css=document.createElement('style');
  css.textContent=`
  html.lenis,html.lenis body{height:auto}
  html.lenis.lenis-smooth{scroll-behavior:auto!important}
  html.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}
  html.lenis.lenis-stopped{overflow:hidden}

  /* honey transition */
  #mx-honey{position:fixed;inset:0;width:100%;height:100%;z-index:300;pointer-events:none;display:none}
  #mx-honey.on{display:block}
  #mx-lbl{position:fixed;left:0;right:0;top:50%;z-index:301;pointer-events:none;margin:0;transform:translateY(-40%);text-align:center;font-family:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;font-weight:700;letter-spacing:-.05em;font-size:clamp(46px,9vw,140px);line-height:.9;color:#FFF3D6;text-shadow:0 1px 0 rgba(255,240,200,.35),0 18px 40px rgba(90,40,0,.35);opacity:0;filter:blur(6px);transition:opacity .45s cubic-bezier(.2,.7,.1,1),transform .7s cubic-bezier(.2,.7,.1,1),filter .5s}
  #mx-lbl small{display:block;font:500 11px/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.22em;text-transform:uppercase;margin-bottom:18px;opacity:.75;text-shadow:none}
  #mx-lbl.show{opacity:1;transform:translateY(-50%);filter:none}
  #mx-curtain{position:fixed;left:0;right:0;top:0;height:135vh;z-index:300;pointer-events:none;transform:translate3d(0,-110%,0)}
  #mx-curtain svg{position:absolute;inset:0;width:100%;height:100%}
  html.mx-covering::after{content:"";position:fixed;inset:0;background:#B9741C;z-index:299}

  .grain{animation:none!important;inset:0!important;width:100%!important;height:100%!important}

  /* word reveal */
  .mx-split .mw{display:inline-block;overflow:hidden;vertical-align:top;padding:.04em .02em .1em;margin:-.04em -.02em -.1em}
  .mx-split .mw>span{display:inline-block;transform:translateY(105%) rotate(4deg);filter:blur(8px);opacity:0;transform-origin:0 100%;transition:transform 1.15s ${E},filter 1s ${E},opacity .8s ${E};transition-delay:calc(var(--i)*55ms)}
  .mx-split.mx-in .mw>span{transform:none;filter:none;opacity:1}
  .mx-skew{transform:skewY(var(--mx-skew,0deg));transition:transform .5s ${E}}

  /* image wipe */
  .mx-wipe{clip-path:inset(18% 10% 18% 10% round 28px);transition:clip-path 1.5s ${E}}
  .mx-wipe img{scale:1.22;transition:scale 2s ${E}}
  .mx-wipe.mx-in{clip-path:inset(0 0 0 0 round var(--mx-r,22px))}
  .mx-wipe.mx-in img{scale:1}

  /* magnetic + ripple */
  .mx-mag{transition:translate .6s ${E}}
  .mx-mag>*{transition:translate .6s ${E}}
  .mx-rip{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(247,227,176,.9),rgba(217,154,31,.5) 45%,rgba(217,154,31,0) 70%);transform:translate(-50%,-50%) scale(0);animation:mxrip .9s ${E} forwards;z-index:0;mix-blend-mode:screen}
  @keyframes mxrip{to{transform:translate(-50%,-50%) scale(1);opacity:0}}

  /* tilt */
  .mx-tilt.mx-hot{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-4px)!important;transition:transform .2s linear!important}
  .mx-tilt::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(420px circle at var(--gx,50%) var(--gy,50%),rgba(255,236,190,.28),transparent 45%);opacity:0;transition:opacity .5s;z-index:2}
  .mx-tilt.mx-hot::after{opacity:1}

  /* honey cursor */
  #mx-cur{position:fixed;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;z-index:400;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF1C8 0 18%,#E8B74A 40%,#B9701A 100%);box-shadow:0 4px 12px rgba(120,70,10,.35);opacity:0;transition:width .45s ${E},height .45s ${E},margin .45s ${E},opacity .3s,background .3s}
  #mx-cur.on{opacity:1}
  #mx-cur.big{width:78px;height:78px;margin:-39px 0 0 -39px;background:rgba(232,183,74,.92);box-shadow:0 14px 30px -10px rgba(120,70,10,.5)}
  #mx-cur span{position:absolute;inset:0;display:grid;place-items:center;font:600 11px/1 "Geist","Helvetica Neue",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#1E1D16;opacity:0;transition:opacity .25s}
  #mx-cur.big span{opacity:1}
  #mx-cur.down{width:12px;height:12px;margin:-6px 0 0 -6px}

  /* wordmark fill */
  .wordmark{background:linear-gradient(0deg,#E8B74A 0,#D99A1F var(--mx-fill,0%),transparent var(--mx-fill,0%));-webkit-background-clip:text;background-clip:text}
  .wordmark em{color:transparent!important;-webkit-text-stroke:1px rgba(232,183,74,.28)}

  @media (prefers-reduced-motion:reduce){.mx-split .mw>span{transform:none;filter:none;opacity:1}.mx-wipe{clip-path:none}.mx-wipe img{scale:1}}
  `;
  document.head.appendChild(css);

  /* ---------- honey page transitions (WebGL, with an SVG fallback) ---------- */
  const NAMES={'index.html':'Home','':'Home','story.html':'Our Story','products.html':'The Shop','tasting.html':'Tasting','sustainability.html':'Sustainability'};
  const lbl=document.createElement('p');lbl.id='mx-lbl';lbl.setAttribute('aria-hidden','true');document.body.appendChild(lbl);
  const setLbl=n=>{lbl.innerHTML=`<small>Bee · Raw honey</small>${n}`};
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const MAXD=8,MAXS=8;
  let HG=null;
  /* Honey renderer (Canvas 2D: same result on every browser and GPU).
     State units: F/T/len/r in screen heights, x in screen heights from the left. */
  function honeyGL(){
    if(HG!==null)return HG;
    const c=document.createElement('canvas');c.id='mx-honey';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    const x=c.getContext('2d');if(!x){c.remove();return HG=false}
    let W=0,H=0,D=1;
    const size=()=>{D=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=Math.round(W*D);c.height=Math.round(H*D)};
    size();addEventListener('resize',size);
    const t0=performance.now();
    function edge(px,base,t,a){return base+a*(Math.sin(px*.006+t*1.1)*.55+Math.sin(px*.017-t*1.7)*.3+Math.sin(px*.041+t*2.3)*.15)}
    function sheetPath(top,t){ /* top=true: honey above a wavy bottom edge (pour in). false: honey below a wavy top edge (slide out) */ }
    function drip(px,y0,len,r){ /* neck + round bulb hanging from y0 */
      const yb=y0+len;x.moveTo(px-r*1.9,y0-r);
      x.bezierCurveTo(px-r*1.05,y0-r*.2,px-r*.62,y0+len*.32,px-r*.55,y0+len*.62);
      x.bezierCurveTo(px-r*.5,yb-r*1.1,px-r*1.02,yb-r*.6,px-r,yb);
      x.arc(px,yb,r,Math.PI,0,true);
      x.bezierCurveTo(px+r*1.02,yb-r*.6,px+r*.5,yb-r*1.1,px+r*.55,y0+len*.62);
      x.bezierCurveTo(px+r*.62,y0+len*.32,px+r*1.05,y0-r*.2,px+r*1.9,y0-r);x.closePath()}
    function dripR(px,y0,len,r,yl){ /* same drip, traced right side first so it joins the sheet outline */
      const yb=y0+len;
      x.bezierCurveTo(px+r*1.05,y0-r*.2+r*.8,px+r*.62,y0+len*.32,px+r*.55,y0+len*.62);
      x.bezierCurveTo(px+r*.5,yb-r*1.1,px+r*1.02,yb-r*.6,px+r,yb);
      x.arc(px,yb,r,0,Math.PI,false);
      x.bezierCurveTo(px-r*1.02,yb-r*.6,px-r*.5,yb-r*1.1,px-r*.55,y0+len*.62);
      x.bezierCurveTo(px-r*.62,y0+len*.32,px-r*1.05,y0+r*.6,px-r*1.9,yl)}
    function strand(px,y0,len,r,b){ /* thread rising from the sheet with a bead at its tip */
      const yt=y0-len;
      if(r>.2){x.moveTo(px-r*2.4,y0+2);x.quadraticCurveTo(px-r*.6,y0-len*.25,px-r*.5,yt);x.lineTo(px+r*.5,yt);x.quadraticCurveTo(px+r*.6,y0-len*.25,px+r*2.4,y0+2);x.closePath()}
      if(b>.3){x.moveTo(px+b,yt);x.arc(px,yt,b,0,Math.PI*2)}}
    function fillHoney(t,hiY){
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#A9600F');g.addColorStop(.45,'#C9821C');g.addColorStop(1,'#DB9A2A');
      x.fillStyle=g;x.fill();
      x.save();x.clip();
      /* light coming through thinner honey near the moving edge */
      const e=x.createLinearGradient(0,hiY-H*.22,0,hiY);e.addColorStop(0,'rgba(255,200,90,0)');e.addColorStop(1,'rgba(255,205,100,.42)');
      x.fillStyle=e;x.fillRect(0,hiY-H*.22,W,H*.24);
      /* slow flowing streaks */
      for(let i=0;i<7;i++){const sx=((i*173.3+t*22*(i%2?1:-.6))%(W+200)+W+200)%(W+200)-100,sw=40+(i*37)%90;
        const s=x.createLinearGradient(sx,0,sx+sw,0);s.addColorStop(0,'rgba(255,235,170,0)');s.addColorStop(.5,'rgba(255,235,170,'+(.05+.04*(i%3))+')');s.addColorStop(1,'rgba(255,235,170,0)');
        x.fillStyle=s;x.fillRect(sx,0,sw,H)}
      /* broad window reflection */
      const r=x.createRadialGradient(W*.28,H*.18,0,W*.28,H*.18,Math.max(W,H)*.55);r.addColorStop(0,'rgba(255,246,220,.22)');r.addColorStop(1,'rgba(255,246,220,0)');
      x.fillStyle=r;x.fillRect(0,0,W,H);
      x.restore()}
    function shine(path){ /* dark refraction rim + bright meniscus just inside the edge */
      x.save();path();x.clip();
      x.lineJoin='round';
      x.strokeStyle='rgba(110,50,0,.35)';x.lineWidth=5;path();x.stroke();
      x.translate(0,-5);x.strokeStyle='rgba(255,236,180,.55)';x.lineWidth=2.4;path();x.stroke();
      x.restore()}
    HG={c,draw(st){
      const t=(performance.now()-t0)/1000;
      x.setTransform(D,0,0,D,0,0);x.clearRect(0,0,W,H);
      const pour=st.T<-1; /* pour in: honey from the top. slide out: honey to the bottom */
      const base=pour?st.F*H:st.T*H,amp=H*.016;
      const path=()=>{x.beginPath();
        if(pour){x.moveTo(-10,-10);x.lineTo(W+10,-10);
          /* one outline: walk the edge right to left and trace every drip into it, so the sheet and drips never cancel out */
          const ds=st.drips.map(d=>({px:d.x*H,r:Math.max(2,d.r*H*.9),len:d.len*H})).filter(d=>d.len>2).sort((a,b)=>b.px-a.px);
          let px=W+10,i=0;x.lineTo(px,edge(px,base,t,amp));
          while(px>-10){const d=ds[i];
            if(d&&px-10<=d.px+d.r*1.9){const xr=d.px+d.r*1.9,xl=d.px-d.r*1.9;if(xr<px)x.lineTo(xr,edge(xr,base,t,amp));dripR(d.px,edge(d.px,base,t,amp),d.len,d.r,edge(xl,base,t,amp));px=Math.min(px,xl);i++;continue}
            px-=10;x.lineTo(px,edge(px,base,t,amp))}
          x.closePath()}
        else{x.moveTo(-10,H+10);x.lineTo(-10,edge(-10,base,t,amp));for(let px=-10;px<=W+10;px+=10)x.lineTo(px,edge(px,base,t,amp));x.lineTo(W+10,H+10);x.closePath();
          st.strings.forEach(s=>{const px=s.x*H;strand(px,edge(px,base,t,amp),s.len*H,s.r*H,(s.b||0)*H)})}};
      if(pour?base<-H*.6&&!st.drips.some(d=>d.len>0):base>H*1.05)return;
      path();fillHoney(t,pour?base:H);
      shine(path);
      /* specular on each drip bulb and strand bead */
      x.fillStyle='rgba(255,250,235,.75)';
      if(pour)st.drips.forEach(d=>{const px=d.x*H,r=Math.max(2,d.r*H*.9),yb=edge(px,base,t,amp)+d.len*H;if(d.len*H>2){x.beginPath();x.ellipse(px-r*.38,yb-r*.38,r*.26,r*.18,-.6,0,Math.PI*2);x.fill()}});
      else st.strings.forEach(s=>{const b=(s.b||0)*H;if(b>.3){const px=s.x*H,yt=edge(px,base,t,amp)-s.len*H;x.beginPath();x.arc(px-b*.35,yt-b*.35,b*.3,0,Math.PI*2);x.fill()}})
    }};
    return HG;
  }
  const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
  function spread(n,asp,pad){const xs=[];for(let i=0;i<n;i++)xs.push((i+.5)/n*asp+rnd(-.35,.35)*asp/n);return xs.map(x=>Math.max(pad,Math.min(asp-pad,x)))}
  /* pour down over the page, then call done */
  function pourIn(done){
    let H=null;try{H=honeyGL()}catch(e){H=false}
    if(!H){svgPour(done);return}
    try{H.draw({F:-5,T:-5,drips:[],strings:[]})}catch(e){HG=false;svgPour(done);return}
    const asp=innerWidth/innerHeight,n=Math.max(4,Math.min(MAXD,Math.round(3+asp*3)));
    const drips=spread(n,asp,.03).map(x=>({x,L:rnd(.12,.4),r:rnd(.02,.036),k:rnd(.85,1.2),len:0}));
    H.c.classList.add('on');const t0=performance.now(),DUR=760;let shown=false;
    let fin=false;const finish=()=>{if(fin)return;fin=true;done()};setTimeout(finish,DUR+600);
    (function f(now){const p=Math.max(0,Math.min(1,(now-t0)/DUR)),e=p*p*(3-2*p);
      const F=-.22+1.48*Math.pow(e,1.08);
      drips.forEach(d=>{d.len=d.L*(.3+.8*ss(0,.55,p*d.k))*(1-.35*ss(.7,1,p))});
      H.draw({F,T:-5,drips,strings:[]});
      if(!shown&&p>.55){shown=true;lbl.classList.add('show')}
      if(p<1&&!fin)requestAnimationFrame(f);else finish()})(t0);
  }
  /* honey slides off the new page, leaving strands that thin and snap */
  function pourOut(intro){
    let H=null;try{H=honeyGL()}catch(e){H=false}
    setTimeout(()=>{root.classList.remove('mx-covering');if(HG&&HG.c)HG.c.classList.remove('on');lbl.classList.remove('show')},(intro?2600:1800));
    if(!H){svgOut();root.classList.remove('mx-covering');return}
    const asp=innerWidth/innerHeight,n=Math.max(4,Math.min(MAXS,Math.round(3+asp*3)));
    const strings=spread(n,asp,.05).map(x=>({x,L:rnd(.12,.34),r0:rnd(.004,.009),brk:rnd(.42,.78),len:0,r:0,b:0,b0:rnd(.01,.018)}));
    const drips=[];
    H.c.classList.add('on');H.draw({F:5,T:-.15,drips,strings:[]});
    requestAnimationFrame(()=>root.classList.remove('mx-covering'));
    lbl.classList.add('show');
    const HOLD=intro?650:110,DUR=intro?1300:950,t0=performance.now();let hid=false,lt=t0;
    (function f(now){const el=now-t0,p=Math.max(0,Math.min(1,(el-HOLD)/DUR)),dt=Math.max(0,Math.min(.05,(now-lt)/1000));lt=now;
      if(!hid&&el>HOLD-80){hid=true;lbl.classList.remove('show')}
      const e=Math.pow(p,1.7);const T=-.15+1.6*e;
      strings.forEach(s=>{
        if(p<s.brk){s.len=s.L*ss(0,s.brk,p);s.r=s.r0*(1-.75*ss(0,s.brk,p));s.b=s.b0*ss(0,.15,p)}
        else{s.r=0;s.len*=Math.exp(-dt*7.5);s.b=s.b0*Math.max(.35,s.len/s.L)}});
      H.draw({F:5,T,drips,strings});
      if(p<1)requestAnimationFrame(f);else{H.c.classList.remove('on')}})(t0);
  }
  /* fallback: SVG curtain */
  let cur=null;
  function svgCurtain(){if(cur)return cur;cur=document.createElement('div');cur.id='mx-curtain';cur.setAttribute('aria-hidden','true');
    let d='M0 0H100V100';const xs=[...Array(8)].map(()=>Math.random()*92+4).sort((a,b)=>b-a);
    xs.forEach(x=>{const w=1.6+Math.random()*2.2,l=4+Math.random()*16;d+=`H${x+w}C${x+w} ${100+l*.6} ${x+w*1.35} ${100+l} ${x} ${100+l}C${x-w*1.35} ${100+l} ${x-w} ${100+l*.6} ${x-w} 100`});
    cur.innerHTML=`<svg viewBox="0 0 100 125" preserveAspectRatio="none"><path d="${d}H0Z" fill="#C98A2E"/></svg>`;document.body.appendChild(cur);return cur}
  function svgPour(done){const c=svgCurtain();c.animate([{transform:'translate3d(0,-110%,0)'},{transform:'translate3d(0,-12%,0)'}],{duration:800,easing:'cubic-bezier(.7,0,.25,1)',fill:'forwards'}).onfinish=done;setTimeout(()=>lbl.classList.add('show'),450)}
  function svgOut(){const c=svgCurtain();c.style.transform='translate3d(0,-12%,0)';lbl.classList.add('show');setTimeout(()=>lbl.classList.remove('show'),250);
    c.animate([{transform:'translate3d(0,-12%,0)'},{transform:'translate3d(0,-12%,0)',offset:.2},{transform:'translate3d(0,105%,0)'}],{duration:1150,easing:'cubic-bezier(.7,0,.25,1)',fill:'forwards'})}

  let covered=null;try{covered=sessionStorage.getItem('mx-nav');sessionStorage.removeItem('mx-nav')}catch(e){}
  /* ---------- first-visit loader: a bee fills the comb ---------- */
  function runLoader(){
    const NS='http://www.w3.org/2000/svg',R=46,S3=Math.sqrt(3);
    const st=document.createElement('style');st.textContent=`
    #mx-load{position:fixed;inset:0;z-index:350;background:radial-gradient(60% 55% at 50% 42%,#FFFBF2 0%,#F7EFDF 55%,#EFE3C8 100%);display:grid;grid-template-rows:auto 1fr auto;color:#1E1D16;overflow:hidden;transition:opacity .35s ease}
    #mx-load .top,#mx-load .bot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:calc(22px + env(safe-area-inset-top,0px)) max(24px,env(safe-area-inset-right,0px)) 0 max(24px,env(safe-area-inset-left,0px));font:500 11px/1.4 "Geist Mono",ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#6F6A57;position:relative;z-index:2}
    #mx-load .bot{padding:0 max(24px,env(safe-area-inset-right,0px)) calc(22px + env(safe-area-inset-bottom,0px)) max(24px,env(safe-area-inset-left,0px))}
    #mx-load .lg{display:flex;align-items:center;gap:8px;font:700 22px/1 "Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;letter-spacing:-.03em;text-transform:none;color:#1E1D16}
    #mx-load .skip{pointer-events:auto;border:1px solid #DCCDAE;background:rgba(255,255,255,.5);border-radius:99px;padding:8px 14px;font:inherit;letter-spacing:.14em;color:#1E1D16;cursor:pointer;transition:background .3s}
    #mx-load .skip:hover{background:#fff}
    #mx-load svg.comb{position:absolute;inset:0;width:100%;height:100%;z-index:1}
    #mx-load .wall{fill:#FBF6EC;stroke:#D9C49A;stroke-width:2.6;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1s cubic-bezier(.2,.7,.1,1),fill .6s}
    #mx-load .cell.drawn .wall{stroke-dashoffset:0}
    #mx-load .cell.full .wall{stroke:#C99A4A}
    #mx-load .read{position:absolute;left:0;right:0;bottom:calc(7vh + 40px);text-align:center;z-index:2;display:grid;justify-items:center;gap:10px;pointer-events:none}
    #mx-load .num{font:700 clamp(64px,10vw,128px)/.85 "Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;letter-spacing:-.06em;font-variant-numeric:tabular-nums;display:flex;align-items:flex-start;gap:4px}
    #mx-load .num small{font-size:.32em;letter-spacing:-.02em;margin-top:.25em;color:#A5650F}
    #mx-load .msg{font:500 12px/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#6F6A57;height:14px;overflow:hidden}
    #mx-load .msg span{display:block;transition:transform .5s cubic-bezier(.2,.7,.1,1),opacity .4s}
    #mx-load .msg span.out{transform:translateY(-110%);opacity:0}
    #mx-load .bar{width:min(260px,60vw);height:2px;background:#E5D7B8;border-radius:2px;overflow:hidden}
    #mx-load .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#E8B74A,#A5650F);transform-origin:0 50%;transform:scaleX(0)}
    #mx-load .wing{transform-box:fill-box;transform-origin:50% 100%;animation:mxflap .06s linear infinite alternate}
    #mx-load .wing.r{animation-delay:.03s}
    @keyframes mxflap{to{transform:scaleY(.25)}}
    #mx-load .ring{transform-box:view-box;transform-origin:center;animation:mxspin 40s linear infinite}
    @keyframes mxspin{to{transform:rotate(360deg)}}
    #mx-load.fin .read,#mx-load.fin .top,#mx-load.fin .bot{opacity:0;transition:opacity .5s}
    html.mx-loading,html.mx-loading body{overflow:hidden}
    
    @media (max-height:640px){#mx-load .read{bottom:24px}}`;
    document.head.appendChild(st);
    const L=document.createElement('div');L.id='mx-load';L.setAttribute('role','status');L.setAttribute('aria-label','Loading Bee');
    L.innerHTML=`<div class="top"><span class="lg"><svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="11" cy="9" rx="6" ry="4" transform="rotate(-25 11 9)" fill="none" stroke="#A5650F" stroke-width="1.4"/><ellipse cx="21" cy="9" rx="6" ry="4" transform="rotate(25 21 9)" fill="none" stroke="#A5650F" stroke-width="1.4"/><ellipse cx="16" cy="19" rx="6" ry="9" fill="#E8B74A"/><path d="M10.4 16h11.2M10 20h12M11 24h10" stroke="#1E1D16" stroke-width="2.2"/><circle cx="16" cy="9.5" r="3" fill="#1E1D16"/></svg>Bee</span><span>Spring harvest · 2026</span></div>
      <svg class="comb" aria-hidden="true"><defs>
        <linearGradient id="mxLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4C55E"/><stop offset=".45" stop-color="#DE9A2C"/><stop offset="1" stop-color="#B9701A"/></linearGradient>
        <linearGradient id="mxSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#FFF6DD" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="mxGloss" cx=".32" cy=".25" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs><g class="ring"></g><g class="comb-g"></g><g class="trail"></g><g class="bee"></g></svg>
      <div></div>
      <div class="read"><p class="num" aria-live="off"><span>0</span><small>%</small></p><div class="bar"><i></i></div><p class="msg"><span>Waking the hives</span></p></div>
      <div class="bot"><span>Made by bees · Shared by people</span><button class="skip" type="button">Skip</button></div>`;
    document.body.appendChild(L);
    const svg=L.querySelector('svg.comb'),gComb=L.querySelector('.comb-g'),gTrail=L.querySelector('.trail'),gBee=L.querySelector('.bee'),gRing=L.querySelector('.ring');
    const hex=r=>{let s='';for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30);s+=`${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)} `}return s};
    /* spiral order: centre, ring 1, ring 2 */
    const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],cells=[[0,0]];
    for(let rad=1;rad<=2;rad++){let q=-rad,r=rad;for(let i=0;i<6;i++)for(let j=0;j<rad;j++){cells.push([q,r]);q+=dirs[i][0];r+=dirs[i][1]}}
    const C=cells.map(([q,r],i)=>{const x=R*S3*(q+r/2),y=R*1.5*r;
      const g=document.createElementNS(NS,'g');g.setAttribute('class','cell');g.setAttribute('transform',`translate(${x.toFixed(2)},${y.toFixed(2)})`);
      g.innerHTML=`<clipPath id="mxc${i}"><polygon points="${hex(R*.84)}"/></clipPath><polygon class="wall" pathLength="1" points="${hex(R*.94)}"/><g clip-path="url(#mxc${i})"><path class="liq" fill="url(#mxLiq)"/><ellipse cx="-12" cy="-14" rx="22" ry="14" fill="url(#mxGloss)" opacity="0"/></g>`;
      gComb.appendChild(g);return {x,y,g,liq:g.querySelector('.liq'),gl:g.querySelector('ellipse'),lv:0,want:0,ph:Math.random()*6}});
    gRing.innerHTML=`<polygon points="${hex(R*5.2)}" fill="none" stroke="#E2D2AE" stroke-width="1" stroke-dasharray="2 8"/><polygon points="${hex(R*6.4)}" fill="none" stroke="#EADDC0" stroke-width="1" transform="rotate(30)"/>`;
    gBee.innerHTML=`<g class="bb"><ellipse class="wing" cx="-5" cy="-11" rx="9" ry="6" fill="#fff" fill-opacity=".85" stroke="#6F6A57" stroke-width=".8"/><ellipse class="wing r" cx="5" cy="-11" rx="9" ry="6" fill="#fff" fill-opacity=".85" stroke="#6F6A57" stroke-width=".8"/><ellipse cx="0" cy="0" rx="15" ry="10" fill="#E8B74A"/><path d="M-4 -9.5v19M3 -9.8v19.6M9.5 -7v14" stroke="#1E1D16" stroke-width="3.2"/><circle cx="-15" cy="-1" r="6" fill="#1E1D16"/><path d="M-19 -5q-5 -6 -9 -5M-17 -6q-2 -7 -6 -9" stroke="#1E1D16" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M15 0l5 0" stroke="#1E1D16" stroke-width="2" stroke-linecap="round"/></g>`;
    const bb=gBee.querySelector('.bb');
    const dots=[...Array(16)].map(()=>{const c=document.createElementNS(NS,'circle');c.setAttribute('r','1.6');c.setAttribute('fill','#D99A1F');gTrail.appendChild(c);return c});
    let VW=0,VH=0;const size=()=>{const w=innerWidth,h=innerHeight,k=Math.max(R*8.6/(h*.5),R*9/(w*.86));VW=w*k;VH=h*k;svg.setAttribute('viewBox',`${(-VW/2).toFixed(1)} ${(-VH/2+VH*.09).toFixed(1)} ${VW.toFixed(1)} ${VH.toFixed(1)}`)};
    size();addEventListener('resize',size);

    /* real loading progress */
    const P={dom:document.readyState!=='loading'?1:0,fonts:0,img:0,bee:window.__beeReady?1:0};
    document.addEventListener('DOMContentLoaded',()=>P.dom=1);
    (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>P.fonts=1);
    const imgs=[...document.images].filter(i=>i.loading!=='lazy');let done=0;const tick=()=>{done++;P.img=imgs.length?done/imgs.length:1};
    if(!imgs.length)P.img=1;imgs.forEach(i=>{if(i.complete)tick();else{i.addEventListener('load',tick,{once:true});i.addEventListener('error',tick,{once:true})}});
    addEventListener('bee:ready',()=>P.bee=1);
    const t0=performance.now();
    const real=()=>{const el=(performance.now()-t0)/1000;if(el>2.2)P.fonts=1;let p=.25*P.dom+.35*P.fonts+.4*P.img;if(el>3.5)p=1;return Math.min(1,p)};

    /* messages */
    const MSG=[[0,'Waking the hives'],[.2,'Following bees to the blossom'],[.45,'Filling the comb'],[.7,'Capping each cell with wax'],[.95,'Pouring your jar']];
    const msgEl=L.querySelector('.msg');let msgI=0;
    const setMsg=t=>{const old=msgEl.querySelector('span'),n=document.createElement('span');n.textContent=t;n.style.transform='translateY(110%)';msgEl.appendChild(n);old.classList.add('out');requestAnimationFrame(()=>requestAnimationFrame(()=>n.style.transform=''));setTimeout(()=>old.remove(),500)};

    /* draw the walls in, centre outwards */
    C.forEach((c,i)=>setTimeout(()=>c.g.classList.add('drawn'),60+i*28));

    const bee={x:-VW*.6,y:-VH*.2,vx:0,vy:0,a:0},trail=[];
    let k=0,phase='fill',skip=false,ft=0,last=performance.now(),shown=0,finT=0;
    L.querySelector('.skip').addEventListener('click',()=>{skip=true;C.forEach(c=>c.want=1);k=C.length});
    const num=L.querySelector('.num span'),bar=L.querySelector('.bar i');
    function liqPath(c,t){const lv=c.lv,top=R*.84-lv*R*1.75,amp=lv>0&&lv<1?3.2:1.2;let d=`M${-R} ${R}L${-R} ${top.toFixed(2)}`;
      for(let x=-R;x<=R;x+=8)d+=`L${x} ${(top+Math.sin(x*.12+t*5+c.ph)*amp).toFixed(2)}`;return d+`L${R} ${R}Z`}
    function frame(now){
      const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;const t=now/1000;
      const allow=skip?C.length:Math.floor(real()*C.length+.0001);
      let tx,ty,spd=1500;
      if(phase==='fill'){
        if(k<C.length&&k<allow){const c=C[k];tx=c.x;ty=c.y-R*.15;
          if(Math.hypot(tx-bee.x,ty-bee.y)<14){c.want=1;k++}}
        else if(k<C.length){const c=C[Math.max(0,k-1)];tx=c.x+Math.cos(t*3)*R*.9;ty=c.y+Math.sin(t*3)*R*.6-R*.2;spd=380}
        else{tx=0;ty=-R*.35;spd=500;if(C.every(c=>c.lv>.995)&&Math.hypot(tx-bee.x,ty-bee.y)<8){phase='cap';ft=0}}
      }else{tx=bee.x;ty=bee.y}
      if(phase==='fill'||phase==='cap'){
        const dx=tx-bee.x,dy=ty-bee.y,d=Math.hypot(dx,dy)||1,ar=Math.min(1,d/60),wx=dx/d*spd*ar,wy=dy/d*spd*ar;
        bee.vx+=(wx-bee.vx)*Math.min(1,dt*7);bee.vy+=(wy-bee.vy)*Math.min(1,dt*7);
        bee.vx+=-dy/d*Math.sin(t*9)*40*dt*60*.08;bee.vy+=dx/d*Math.sin(t*9)*40*dt*60*.08;
        bee.x+=bee.vx*dt;bee.y+=bee.vy*dt}
      /* fill levels */
      let tot=0;C.forEach(c=>{if(c.want>c.lv)c.lv=Math.min(1,c.lv+dt*(skip?7:4.4));tot+=c.lv;
        c.liq.setAttribute('d',liqPath(c,t));c.gl.setAttribute('opacity',(c.lv*.9).toFixed(2));if(c.lv>.99)c.g.classList.add('full')});
      const prog=tot/C.length;shown+=(prog-shown)*Math.min(1,dt*10);
      num.textContent=Math.round(shown*100);bar.style.transform=`scaleX(${shown.toFixed(3)})`;
      while(msgI<MSG.length-1&&shown>=MSG[msgI+1][0]){msgI++;setMsg(MSG[msgI][1])}
      /* bee pose + trail */
      const sp=Math.hypot(bee.vx,bee.vy);
      const want=Math.atan2(bee.vy,bee.vx);let da=want-bee.a;da=Math.atan2(Math.sin(da),Math.cos(da));if(sp>25)bee.a+=da*Math.min(1,dt*10);
      const flip=Math.cos(bee.a)<0;
      bb.setAttribute('transform',`translate(${bee.x.toFixed(1)},${(bee.y+Math.sin(t*14)*1.5).toFixed(1)}) rotate(${(bee.a*180/Math.PI+(flip?180:0)).toFixed(1)}) scale(${flip?1.45:-1.45},1.45)`);
      if(sp>60)trail.push({x:bee.x,y:bee.y,t});while(trail.length&&t-trail[0].t>.6)trail.shift();
      dots.forEach((d,i)=>{const q=trail[Math.floor(i/dots.length*trail.length)];if(q){d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.setAttribute('opacity',(1-(t-q.t)/.6)*.55)}else d.setAttribute('opacity',0)});
      /* finale */
      if(phase==='cap'){ft+=dt;
        if(!L.classList.contains('fin')){L.classList.add('fin');
          const sh=document.createElementNS(NS,'rect');sh.setAttribute('x',-R*6);sh.setAttribute('y',-R*5);sh.setAttribute('width',R*3);sh.setAttribute('height',R*10);sh.setAttribute('fill','url(#mxSheen)');sh.setAttribute('transform','rotate(20)');sh.style.mixBlendMode='soft-light';gComb.appendChild(sh);
          sh.animate([{transform:'rotate(20deg) translateX(0)'},{transform:`rotate(20deg) translateX(${R*10}px)`}],{duration:700,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'})}
        if(ft>.35){/* bee leaves upward */bee.vy-=dt*2600;bee.vx+=dt*500;bee.x+=bee.vx*dt;bee.y+=bee.vy*dt}
        if(ft>.45){const z=Math.pow(Math.min(1,(ft-.45)/.6),2.2),s=1+z*(Math.hypot(VW/2,VH/2+VH*.09)/(R*.84*.866)*1.12);
          gComb.setAttribute('transform',`scale(${s.toFixed(3)})`);C.forEach((c,i)=>{if(i)c.g.style.opacity=Math.max(0,1-z*3)});C[0].g.querySelector('.wall').style.opacity=Math.max(0,1-z*2.5);gRing.style.opacity=1-z;
          if(z>=1&&!L.dataset.out){L.dataset.out=1;finish();return}}
      }
      requestAnimationFrame(frame)}
    function finish(){
      try{sessionStorage.setItem('bee-seen','1')}catch(e){}
      const H=honeyGL();
      setLbl('Made by bees.<br>Shared by people.');
      if(H){H.c.classList.add('on');H.draw({F:5,T:-.15,drips:[],strings:[]})}
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        L.style.opacity='0';setTimeout(()=>{L.remove();st.remove()},400);
        root.classList.remove('mx-loading');
        pourOut(true)}));
      setTimeout(()=>dispatchEvent(new Event('bee:loader-done')),900);
    }
    requestAnimationFrame(frame);
  }
  let seen='1';try{seen=sessionStorage.getItem('bee-seen')}catch(e){}
  if(covered&&!reduce){try{sessionStorage.setItem('bee-seen','1')}catch(e){};root.classList.remove('mx-loading');setLbl(covered);pourOut()}
  else{root.classList.remove('mx-covering');
    if(!seen&&!reduce&&document.body)runLoader();else{root.classList.remove('mx-loading');dispatchEvent(new Event('bee:loader-done'))}}
  addEventListener('pageshow',e=>{if(e.persisted){if(HG)HG.c.classList.remove('on');if(cur){cur.getAnimations().forEach(a=>a.cancel());cur.style.transform='translate3d(0,-110%,0)'}lbl.classList.remove('show');busy=false}});
  let busy=false;
  /* warm up: compile the honey shader and prefetch the other pages while idle */
  const idle=f=>(window.requestIdleCallback||setTimeout)(f,{timeout:1500});
  addEventListener('load',()=>idle(()=>{
    try{const H=honeyGL();if(H&&!H.c.classList.contains('on')){H.c.classList.add('on');H.draw({F:-5,T:-5,drips:[],strings:[]});H.c.classList.remove('on')}}catch(e){}
    const here=location.pathname.split('/').pop()||'index.html';
    Object.keys(NAMES).filter(f=>f&&f!==here).forEach(f=>{const l=document.createElement('link');l.rel='prefetch';l.href=f;document.head.appendChild(l)});
  }));
  document.addEventListener('click',e=>{
    if(reduce||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    const href=a.getAttribute('href');if(!href||href.startsWith('#')||/^[a-z]+:/i.test(href))return;
    const file=href.split('#')[0].split('/').pop();if(!(file in NAMES))return;
    const here=location.pathname.split('/').pop();if(file===here||(file===''&&here==='index.html'))return;
    e.preventDefault();if(busy)return;busy=true;const name=NAMES[file];setLbl(name);
    try{sessionStorage.setItem('mx-nav',name)}catch(err){}
    pourIn(()=>{location.href=href});
  });

  if(reduce)return;

  /* ---------- weighted scrolling ---------- */
  let lenis=null;
  if(window.Lenis&&fine){
    $$('.d-list,.tbl-wrap,.rail-grid,textarea,.drawer,.m-card,#menu').forEach(el=>el.setAttribute('data-lenis-prevent',''));
    root.style.scrollBehavior='auto';
    lenis=new Lenis({lerp:.09,wheelMultiplier:1,smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"],a[href*=".html#"]');if(!a)return;
      const h=a.getAttribute('href'),file=h.split('#')[0].split('/').pop(),here=location.pathname.split('/').pop();
      if(file&&file!==here)return;const id=h.split('#')[1];const t=id&&document.getElementById(id);if(!t)return;
      e.preventDefault();lenis.scrollTo(t,{offset:-90,duration:1.4})},true);
    window.beeLenis=lenis;
  }

  /* ---------- word reveals for headings ---------- */
  const heads=$$('h2.rv, .s-head h2, .p-head h2, .c-head h2, .v-head h2, .m-head h2, .r-head h2, .t-head h2, .faq h2, .nb-copy h2, .w-copy h2, .pz h2, .trace h2, .ap-grid h2, .band h2, .host h2, .final h2, .intro h1, .hero-top h1, .info h2:not(#pName)').filter(h=>!h.classList.contains('split')&&!h.closest('.split'));
  function splitWords(h){
    let i=0;const walk=(node)=>{[...node.childNodes].forEach(n=>{
      if(n.nodeType===3){const frag=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return}
          const w=document.createElement('span');w.className='mw';const s=document.createElement('span');s.textContent=p;s.style.setProperty('--i',i++);w.appendChild(s);frag.appendChild(w)});n.replaceWith(frag)}
      else if(n.nodeType===1&&n.tagName!=='BR')walk(n)})};
    walk(h);h.classList.add('mx-split','mx-skew');h.classList.remove('rv','up','d1','d2','d3');h.style.opacity='';h.style.transform=''}
  heads.forEach(splitWords);
  $$('h2.split, .split').forEach(h=>h.classList.add('mx-skew'));

  /* ---------- image wipes ---------- */
  const wipes=$$('.moment .ph, .card .ph, .pc .ph, .b.img, .note-card .pic, .collage, .yr .ph, .diff-media, .pour-photo, .h-media .big, .jarline img, .ap-list, .stage').filter(el=>!el.closest('.mx-wipe'));
  wipes.forEach(el=>{const r=getComputedStyle(el).borderRadius;el.style.setProperty('--mx-r',r&&r!=='0px'?r:'0px');el.classList.add('mx-wipe')});

  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('mx-in');io.unobserve(en.target)}}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  [...heads,...wipes].forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*.92&&r.bottom>0)setTimeout(()=>el.classList.add('mx-in'),120);else io.observe(el)});

  /* ---------- magnetic buttons + ripple ---------- */
  const MAG='.cta-dark,.cta-light,.btn,.add-big,.cta-glass,.band .cta,.tbl-btn,.timer,.lid button,.news button,.go,.d-foot .go';
  if(fine)$$(MAG).forEach(b=>{b.classList.add('mx-mag');
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      b.style.translate=`${x*.22}px ${y*.3}px`;[...b.children].forEach(c=>c.style.translate=`${x*.08}px ${y*.1}px`)});
    b.addEventListener('pointerleave',()=>{b.style.translate='';[...b.children].forEach(c=>c.style.translate='')})});
  document.addEventListener('pointerdown',e=>{const b=e.target.closest(MAG+',.chip,.food,.legend button,.space button,.hpick button,.tabs button,.sizes button,.picker button,.add');if(!b)return;
    const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.6,d=document.createElement('span');d.className='mx-rip';
    d.style.cssText=`left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:${s}px;height:${s}px`;
    if(getComputedStyle(b).position==='static')b.style.position='relative';if(getComputedStyle(b).overflow!=='hidden')b.style.overflow='hidden';
    b.appendChild(d);setTimeout(()=>d.remove(),950)});

  /* ---------- card tilt ---------- */
  if(fine)$$('.pr,.b:not(.img),.pc,.moment,.yr,.pl,.food,.cert,.tcard,.t-panel,.feat,.readout,.match,.note-card,.pdp-card .stage').forEach(c=>{
    if(getComputedStyle(c).position==='static')c.style.position='relative';
    c.classList.add('mx-tilt');const big=c.offsetWidth>500?3:7;
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.classList.add('mx-hot');c.style.setProperty('--ry',((x-.5)*big).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y)*big).toFixed(2)+'deg');c.style.setProperty('--gx',x*100+'%');c.style.setProperty('--gy',y*100+'%')});
    c.addEventListener('pointerleave',()=>{c.classList.remove('mx-hot');c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})});

  /* ---------- honey cursor ---------- */
  let cx=-100,cy=-100,x=-100,y=-100,pvx=0,pvy=0;const hc=document.createElement('div');hc.id='mx-cur';hc.innerHTML='<span></span>';
  if(fine){document.body.appendChild(hc);
    addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;hc.classList.add('on')},{passive:true});
    document.documentElement.addEventListener('pointerleave',()=>hc.classList.remove('on'));
    addEventListener('pointerdown',()=>hc.classList.add('down'));addEventListener('pointerup',()=>hc.classList.remove('down'));
    document.addEventListener('pointerover',e=>{
      const img=e.target.closest('.card .ph,.pc,.moment .ph,.stage,.b.img,.yr .ph,.collage');
      const lab=img?(img.closest('.pc')?'Open':img.closest('.card')?'Add':'Look'):'';
      hc.classList.toggle('big',!!lab);hc.querySelector('span').textContent=lab});
  }

  /* ---------- scroll skew, wordmark fill, loop ---------- */
  const wm=$$('.wordmark');let lastY=scrollY,skew=0;
  (function tick(){
    const sy=lenis?lenis.scroll:scrollY,v=sy-lastY;lastY=sy;
    skew+=(Math.max(-4,Math.min(4,v*.12))-skew)*.12;root.style.setProperty('--mx-skew',skew.toFixed(3)+'deg');
    wm.forEach(w=>{const r=w.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(r.height+innerHeight*.35)));w.style.setProperty('--mx-fill',(p*100).toFixed(1)+'%')});
    if(fine){x+=(cx-x)*.2;y+=(cy-y)*.2;const vx=cx-x,vy=cy-y,sp=Math.min(1,Math.hypot(vx,vy)/90),an=Math.atan2(vy,vx);
      hc.style.transform=hc.classList.contains('big')?`translate3d(${x}px,${y}px,0)`:`translate3d(${x}px,${y}px,0) rotate(${an}rad) scale(${1+sp*.9},${1-sp*.35})`}
    requestAnimationFrame(tick)})();
})();
