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
  const FS=`precision highp float;
uniform vec2 uRes;uniform float uTime,uF,uT,uAsp;uniform vec4 uD[${MAXD}];uniform vec4 uS[${MAXS}];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float cap(vec2 p,float r1,float r2,float h){p.x=abs(p.x);float b=(r1-r2)/h,a=sqrt(max(1.-b*b,0.));float k=dot(p,vec2(-b,a));
  if(k<0.)return length(p)-r1;if(k>a*h)return length(p-vec2(0.,h))-r2;return dot(p,vec2(a,b))-r1;}
float Fx(float x){return uF+.011*sin(x*6.+uTime*1.1)+.006*sin(x*15.-uTime*1.7)+.004*sin(x*31.+uTime*2.3);}
float Tx(float x){return uT+.013*sin(x*5.-uTime*.9)+.007*sin(x*13.+uTime*1.3);}
float map(vec2 p){
  float d=max(p.y-Fx(p.x),Tx(p.x)-p.y);
  for(int i=0;i<${MAXD};i++){vec4 D=uD[i];if(D.w<.5)continue;
    vec2 q=vec2(p.x-D.x,p.y-(Fx(D.x)-.035));
    float c=cap(q,D.z*1.05,D.z*.42,max(D.y,.002));
    c=smin(c,length(q-vec2(0.,D.y))-D.z,.028);
    d=smin(d,c,.05);}
  for(int i=0;i<${MAXS};i++){vec4 S=uS[i];if(S.z<.0004&&S.w<.0004)continue;
    vec2 q=vec2(p.x-S.x,(Tx(S.x)+.03)-p.y);
    float c=1e3;
    if(S.z>.0004)c=cap(q,S.z*2.6,S.z,max(S.y,.002));
    if(S.w>.0004)c=smin(c,length(q-vec2(0.,S.y))-S.w,.012);
    d=smin(d,c,.03);}
  return d;}
float hgt2(vec2 p,float d){float s=clamp(-d/.05,0.,1.);float h=sqrt(1.-(1.-s)*(1.-s));
  return h+s*(.16*noise(vec2(p.x*2.6,p.y*1.3-uTime*.32))+.05*noise(vec2(p.x*8.,p.y*3.6-uTime*.6)));}
float hgt(vec2 p){float d=map(p);float s=clamp(-d/.05,0.,1.);float h=sqrt(1.-(1.-s)*(1.-s));
  h+=s*(.16*noise(vec2(p.x*2.6,p.y*1.3-uTime*.32))+.05*noise(vec2(p.x*8.,p.y*3.6-uTime*.6))+.018*noise(vec2(p.x*21.,p.y*10.-uTime*1.1)));return h;}
void main(){
  vec2 uv=vec2(gl_FragCoord.x/uRes.x,1.-gl_FragCoord.y/uRes.y);vec2 p=vec2(uv.x*uAsp,uv.y);
  float d=map(p);if(d>.006){gl_FragColor=vec4(0.);return;}
  float e=1.6/uRes.y;
  float h=hgt2(p,d),hx=hgt2(p+vec2(e,0.),map(p+vec2(e,0.))),hy=hgt2(p+vec2(0.,e),map(p+vec2(0.,e)));
  vec3 N=normalize(vec3((h-hx)*.05/e,(h-hy)*.05/e,1.));
  vec3 L=normalize(vec3(-.35,-.7,.62)),V=vec3(0.,0.,1.),H=normalize(L+V);
  float thick=clamp(h,0.,1.);
  vec3 lightC=vec3(1.,.84,.42),deepC=vec3(.6,.27,.03);
  float depth=thick*(.55+.25*noise(vec2(p.x*2.2,p.y*1.4-uTime*.25)));
  vec3 col=mix(lightC,deepC,depth);
  float diff=max(dot(N,L),0.);
  col*=.78+.34*diff;
  col+=vec3(1.,.62,.14)*(1.-thick)*.16;
  float rim=smoothstep(0.,.14,thick)*(1.-smoothstep(.14,.42,thick));
  col=mix(col,deepC*.62,rim*.38);
  float nh=max(dot(N,H),0.);
  col+=vec3(1.,.97,.9)*(pow(nh,140.)*1.5+pow(nh,26.)*.12);
  vec3 R=reflect(vec3(0.,0.,-1.),N);
  float win=smoothstep(.93,.99,dot(R,normalize(vec3(-.32,-.55,.77))));
  float win2=smoothstep(.95,.995,dot(R,normalize(vec3(.42,-.3,.86))));
  col+=vec3(1.,.96,.86)*(win*.55+win2*.3);
  col+=vec3(1.,.92,.72)*pow(1.-N.z,2.4)*.16;
  float st=noise(vec2(p.x*26.,p.y*1.2-uTime*.6));col+=vec3(1.,.88,.55)*smoothstep(.72,.97,st)*.05*thick;col+=vec3(1.,.9,.6)*(1.-uv.y)*.07*thick;
  vec2 bc=p*vec2(22.,12.)+vec2(0.,-uTime*.35);vec2 bi=floor(bc);vec2 bp=fract(bc)-vec2(hash(bi),hash(bi+7.3));
  float bb=length(bp*vec2(1.,1.8));col+=vec3(1.,.95,.8)*smoothstep(.06,.045,bb)*smoothstep(.035,.05,bb)*.5*step(.86,hash(bi+3.1))*thick;
  float a=smoothstep(.003,-.002,d)*mix(.8,1.,thick);
  gl_FragColor=vec4(col*a,a);}`;
  const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  let HG=null;
  function honeyGL(){
    if(HG!==null)return HG;
    const c=document.createElement('canvas');c.id='mx-honey';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    const g=c.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:'high-performance'});
    if(!g){c.remove();return HG=false}
    const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);if(!g.getShaderParameter(o,g.COMPILE_STATUS)){console.warn(g.getShaderInfoLog(o));return null}return o};
    const vs=sh(g.VERTEX_SHADER,VS),fs=sh(g.FRAGMENT_SHADER,FS);if(!vs||!fs){c.remove();return HG=false}
    const pr=g.createProgram();g.attachShader(pr,vs);g.attachShader(pr,fs);g.linkProgram(pr);if(!g.getProgramParameter(pr,g.LINK_STATUS)){c.remove();return HG=false}
    g.useProgram(pr);const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
    const al=g.getAttribLocation(pr,'a');g.enableVertexAttribArray(al);g.vertexAttribPointer(al,2,g.FLOAT,false,0,0);
    const U={};['uRes','uTime','uF','uT','uAsp','uD','uS'].forEach(n=>U[n]=g.getUniformLocation(pr,n));
    g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA);
    const size=()=>{const dpr=Math.min(1.5,devicePixelRatio||1),w=Math.min(innerWidth*dpr,960),s=w/innerWidth;c.width=Math.round(innerWidth*s);c.height=Math.round(innerHeight*s);g.viewport(0,0,c.width,c.height)};
    size();addEventListener('resize',size);
    const D=new Float32Array(MAXD*4),S=new Float32Array(MAXS*4),t0=performance.now();
    if(g.isContextLost&&g.isContextLost()){c.remove();return HG=false}
    HG={c,draw(st){g.uniform2f(U.uRes,c.width,c.height);g.uniform1f(U.uTime,(performance.now()-t0)/1000);g.uniform1f(U.uF,st.F);g.uniform1f(U.uT,st.T);g.uniform1f(U.uAsp,innerWidth/innerHeight);
      D.fill(0);S.fill(0);st.drips.forEach((d,i)=>{if(i<MAXD)D.set([d.x,d.len,d.r,1],i*4)});st.strings.forEach((s,i)=>{if(i<MAXS)S.set([s.x,s.len,s.r,s.b||0],i*4)});
      g.uniform4fv(U.uD,D);g.uniform4fv(U.uS,S);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);g.drawArrays(g.TRIANGLES,0,3)}};
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
