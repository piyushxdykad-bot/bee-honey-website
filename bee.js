/* Bee — a 3D honeybee that lives on every page.
   Wanders, follows your cursor, dodges fast hands, lands on things you're reading,
   flies to the basket when you add a jar, and does a loop if you tap it. */
(function(){
  if(window.__bee3d) return; window.__bee3d=true;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer:coarse)').matches;
  let enabled=true; try{enabled=localStorage.getItem('bee-off')!=='1'}catch(e){}

  /* ---------- DOM ---------- */
  const css=document.createElement('style');
  css.textContent=`
  #bee3d-trail{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:54}
  #bee3d-gl{position:fixed;left:0;top:0;pointer-events:none;z-index:55;will-change:transform}
  #bee3d-gl{opacity:0;transition:opacity .8s ease}
  #bee3d-gl.on{opacity:1}
  .bee3d-off #bee3d-trail,.bee3d-off #bee3d-gl{display:none}
  #bee3d-toggle{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:56;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 8px;border-radius:99px;border:1px solid rgba(220,205,174,.9);background:rgba(251,246,236,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#1E1D16;font:500 12.5px/1 "Geist","Helvetica Neue",system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px -16px rgba(90,60,10,.45);opacity:0;transform:translateY(10px);transition:opacity .6s,transform .6s cubic-bezier(.2,.7,.1,1),bottom .4s}
  #bee3d-toggle.ready{opacity:1;transform:none}
  #bee3d-toggle svg{width:22px;height:22px}
  #bee3d-toggle:focus-visible{outline:2px solid #D99A1F;outline-offset:3px}
  body:has(.mbar.show) #bee3d-toggle{bottom:calc(92px + env(safe-area-inset-bottom,0px))}
  @media (max-width:560px){#bee3d-toggle{padding:0 8px;width:38px;justify-content:center}#bee3d-toggle span{display:none}}
  @media print{#bee3d-trail,#bee3d-gl,#bee3d-toggle{display:none}}`;
  document.head.appendChild(css);
  const trail=document.createElement('canvas');trail.id='bee3d-trail';trail.setAttribute('aria-hidden','true');
  const gl=document.createElement('canvas');gl.id='bee3d-gl';gl.setAttribute('aria-hidden','true');
  const tog=document.createElement('button');tog.id='bee3d-toggle';tog.type='button';
  tog.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="11" cy="10" rx="6" ry="4" transform="rotate(-25 11 10)" fill="#fff" fill-opacity=".8" stroke="#6F6A57" stroke-width="1"/><ellipse cx="21" cy="10" rx="6" ry="4" transform="rotate(25 21 10)" fill="#fff" fill-opacity=".8" stroke="#6F6A57" stroke-width="1"/><ellipse cx="16" cy="19" rx="6" ry="8.5" fill="#E8B74A"/><path d="M10.4 16h11.2M10 20h12M11 24h10" stroke="#1E1D16" stroke-width="2.2"/><circle cx="16" cy="9.5" r="3" fill="#1E1D16"/></svg><span></span>';
  document.body.append(trail,gl,tog);
  const setTog=()=>{tog.querySelector('span').textContent=enabled?'Let the bee rest':'Wake the bee';tog.setAttribute('aria-label',enabled?'Let the bee rest':'Wake the bee');tog.setAttribute('aria-pressed',String(!enabled));document.documentElement.classList.toggle('bee3d-off',!enabled)};
  setTog();
  tog.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('bee-off',enabled?'0':'1')}catch(e){};setTog();if(enabled){last=performance.now();if(ready)requestAnimationFrame(frame)}});

  if(typeof THREE==='undefined'||!THREE.GLTFLoader){tog.remove();window.__beeReady=true;dispatchEvent(new Event('bee:ready'));return}

  /* ---------- three ---------- */
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:gl,alpha:true,antialias:true,powerPreference:'low-power'})}catch(e){tog.remove();window.__beeReady=true;dispatchEvent(new Event('bee:ready'));return}
  renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));let CS=240;
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(20,1,10,20000);
  scene.add(new THREE.HemisphereLight(0xfff3da,0x5a3d12,1.25));
  const key=new THREE.DirectionalLight(0xffffff,1.7);key.position.set(-0.5,0.9,1.2);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffd88a,0.7);rim.position.set(0.8,-0.4,0.6);scene.add(rim);
  const root=new THREE.Group(),head=new THREE.Group(),roll=new THREE.Group(),align=new THREE.Group(),body=new THREE.Group();
  align.rotation.y=Math.PI/2;
  root.add(head);head.add(roll);roll.add(align);align.add(body);scene.add(root);
  const U={uFlap:{value:0},uPhase:{value:0}};
  let W=innerWidth,H=innerHeight,SIZE=100;
  function resize(){W=innerWidth;H=innerHeight;
    SIZE=Math.max(64,Math.min(132,Math.min(W,H)*0.125));body.scale.setScalar(SIZE/1.45);
    CS=Math.ceil(SIZE*2.3);renderer.setSize(CS,CS,false);gl.style.width=gl.style.height=CS+'px';
    trail.width=W;trail.height=H;
    camera.aspect=1;const d=(CS/2)/Math.tan(THREE.MathUtils.degToRad(10));camera.near=d*0.3;camera.far=d*3;camera.position.set(0,0,d);camera.lookAt(0,0,0);camera.updateProjectionMatrix()}
  const tctx=trail.getContext('2d');

  /* load model (meshopt-compressed, with a plain fallback) */
  let ready=false;
  function bake(gltf){
    let mesh;gltf.scene.traverse(o=>{if(o.isMesh&&!mesh)mesh=o});
    gltf.scene.updateMatrixWorld(true);
    const g=mesh.geometry,M=mesh.matrixWorld,NM=new THREE.Matrix3().getNormalMatrix(M);
    const pa=g.attributes.position,na=g.attributes.normal,n=pa.count,v=new THREE.Vector3();
    const P=new Float32Array(n*3),N=new Float32Array(n*3),Wg=new Float32Array(n);
    const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
    for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(M);P[i*3]=v.x;P[i*3+1]=v.y;P[i*3+2]=v.z;
      const ax=Math.abs(v.x);Wg[i]=Math.sign(v.x)*ss(.27,.42,ax)*ss(-.02,.1,v.y)*ss(-.72,-.6,v.z)*(1-ss(.14,.26,v.z));
      if(na){v.fromBufferAttribute(na,i).applyMatrix3(NM).normalize();N[i*3]=v.x;N[i*3+1]=v.y;N[i*3+2]=v.z}}
    const ng=new THREE.BufferGeometry();ng.setIndex(g.index);
    ng.setAttribute('position',new THREE.BufferAttribute(P,3));
    if(na)ng.setAttribute('normal',new THREE.BufferAttribute(N,3));else ng.computeVertexNormals();
    ng.setAttribute('uv',g.attributes.uv);ng.setAttribute('wing',new THREE.BufferAttribute(Wg,1));
    const mat=mesh.material;mat.side=THREE.DoubleSide;
    mat.onBeforeCompile=sh=>{sh.uniforms.uFlap=U.uFlap;sh.uniforms.uPhase=U.uPhase;
      sh.vertexShader='attribute float wing;\nuniform float uFlap;\nuniform float uPhase;\n'+sh.vertexShader
        .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
          float wS=sign(wing),wW=abs(wing);
          float wA=wS*wW*(uFlap*sin(uPhase)-uFlap*0.15);
          float wc=cos(wA),wsn=sin(wA);
          objectNormal.xy=vec2(wc*objectNormal.x-wsn*objectNormal.y,wsn*objectNormal.x+wc*objectNormal.y);`)
        .replace('#include <begin_vertex>',`#include <begin_vertex>
          vec2 wH=vec2(0.3*wS,0.1);vec2 wd=transformed.xy-wH;
          transformed.xy=wH+vec2(wc*wd.x-wsn*wd.y,wsn*wd.x+wc*wd.y);`)};
    const m=new THREE.Mesh(ng,mat);
    m.position.set(0,0.12,0.12);
    body.add(m);
  }
  function load(url){const file=/-q-/.test(url)?'models/bee-q.glb':'models/bee.glb';
    return fetch(file).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(buf=>new Promise((res,rej)=>{const L=new THREE.GLTFLoader();if(window.MeshoptDecoder)L.setMeshoptDecoder(MeshoptDecoder);L.parse(buf,'',res,rej)}))}
  const start=()=>{
    const tryMo=window.MeshoptDecoder?MeshoptDecoder.ready.then(()=>load('models/bee-glb.txt')):Promise.reject();
    tryMo.catch(e=>{console.warn('bee: using fallback model',e);return load('models/bee-q-glb.txt')}).then(g=>{bake(g);resize();ready=true;window.__beeReady=true;dispatchEvent(new Event('bee:ready'));const go=()=>{init();gl.classList.add('on');tog.classList.add('ready');last=performance.now();if(enabled)requestAnimationFrame(frame)};if(document.documentElement.classList.contains('mx-loading'))addEventListener('bee:loader-done',go,{once:true});else go()}).catch(()=>{window.__beeReady=true;dispatchEvent(new Event('bee:ready'));tog.remove()});
  };
  const kick=()=>setTimeout(()=>(window.requestIdleCallback||setTimeout)(start,{timeout:800}),250);
  if(document.documentElement.classList.contains('mx-loading'))addEventListener('bee:loader-done',kick,{once:true});
  else if(document.readyState==='complete')kick();else addEventListener('load',kick,{once:true});

  /* ---------- behaviour ---------- */
  const p={x:0,y:0},vel={x:0,y:0},tgt={x:0,y:0};
  let rf=0,state='enter',ang=Math.PI,angV=0,bank=0,flap=0,phase=0,t=0,last=performance.now();
  let landEl=null,landOff={x:0,y:0},landUntil=0,landedAt=0,stateT=0,hops=0,loopT=0,loopDir=1;
  const mouse={x:-999,y:-999,t:-9,vx:0,vy:0};let scrollV=0,lastScroll=scrollY,lastScrollT=performance.now();
  const trailPts=[],burst=[];
  const LAND=['.hero h1 .soft','.hero h1 em','h1 em','h2 em','.cta-dark','.cta-light','.btn','.add-big','.pc[aria-current="true"] .ph','.card .ph','.tcard','.notecard','.pr','.yr.on','.drop','.legend button','.food[aria-pressed="true"]','.chip[aria-pressed="true"]','.moment .ph','.cert','.pl','.b','.tile','.stage','.readout','.match'].join(',');
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const vis=el=>{if(!el||!el.isConnected)return null;const r=el.getBoundingClientRect();if(r.width<24||r.height<10)return null;
    if(r.top<110||r.top>H-70||r.left<10||r.right>W-10)return null;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity<.2)return null;return r};
  function pickWander(){const m=70;let x,y;
    if(Math.random()<.7){x=Math.random()<.5?rnd(m,W*.28):rnd(W*.72,W-m)}else x=rnd(m,W-m);
    y=rnd(Math.max(100,m),H-m);tgt.x=x;tgt.y=y}
  function tryLand(prefer){
    let el=prefer&&vis(prefer)?prefer:null;
    if(!el){const c=[...document.querySelectorAll(LAND)].filter(vis);if(!c.length)return false;
      c.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return Math.hypot(ra.left-p.x,ra.top-p.y)-Math.hypot(rb.left-p.x,rb.top-p.y)});
      el=c[Math.floor(Math.random()*Math.min(4,c.length))]}
    const r=el.getBoundingClientRect();landEl=el;landOff.x=r.width*rnd(.25,.75);landOff.y=-SIZE*0.26;state='approach';stateT=0;return true}
  function takeoff(kick){landEl=null;state='wander';stateT=0;hops=0;pickWander();if(kick){vel.x+=kick.x;vel.y+=kick.y}}
  function init(){
    p.x=W+SIZE;p.y=H*rnd(.25,.4);vel.x=-300;vel.y=0;
    const first=document.querySelector('.hero h1 .soft')||document.querySelector('h1 em')||document.querySelector('h1');
    if(reduce){const r=first&&first.getBoundingClientRect();landEl=first;landOff.x=r?r.width*.6:0;landOff.y=-SIZE*.26;state='landed';ang=0;return}
    if(!(first&&vis(first)&&tryLand(first))){state='wander';pickWander()}
  }
  window.bee={visit(el){if(!ready||!enabled||reduce)return;const e=typeof el==='string'?document.querySelector(el):el;if(!e)return;
      const r=e.getBoundingClientRect();if(r.bottom<0||r.top>H)return;landEl=e;landOff.x=r.width/2;landOff.y=-SIZE*.05;state='visit';stateT=0}};

  /* inputs */
  addEventListener('pointermove',e=>{const now=performance.now()/1000,dt=Math.max(.008,now-mouse.t);mouse.vx=(e.clientX-mouse.x)/dt;mouse.vy=(e.clientY-mouse.y)/dt;mouse.x=e.clientX;mouse.y=e.clientY;mouse.t=now},{passive:true});
  addEventListener('scroll',()=>{const now=performance.now(),dt=Math.max(8,now-lastScrollT);scrollV=Math.abs(scrollY-lastScroll)/dt*1000;lastScroll=scrollY;lastScrollT=now},{passive:true});
  addEventListener('resize',()=>{if(ready)resize()});
  document.addEventListener('click',e=>{if(!ready||!enabled||reduce)return;
    if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<SIZE*.7){state='loop';loopT=0;loopDir=Math.random()<.5?-1:1;landEl=null;
      for(let i=0;i<26;i++){const a=Math.random()*6.283,s=rnd(60,260);burst.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,r:rnd(1.5,3.5)})};return}
    const b=e.target.closest('.add,.add-big,#mAdd,#quickAdd,.pcard button');
    if(b){const cart=document.querySelector('#cartBtn')||document.querySelector('.tools a[aria-label="Shop"]');if(cart)setTimeout(()=>{const nav=document.getElementById('nav');if(nav)nav.classList.remove('hide');window.bee.visit(cart)},550)}
  },true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();if(ready&&enabled)requestAnimationFrame(frame)}});

  /* ---------- frame ---------- */
  function frame(now){
    if(!enabled||document.hidden)return;
    const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;t+=dt;stateT+=dt;
    scrollV*=Math.pow(.02,dt);
    const near=Math.hypot(mouse.x-p.x,mouse.y-p.y),mspeed=Math.hypot(mouse.vx,mouse.vy),mAge=now/1000-mouse.t;
    let speed=280,turn=3.2;

    if(state==='landed'||state==='rest'){
      const r=landEl&&landEl.isConnected?landEl.getBoundingClientRect():null;
      if(!r||r.bottom<60||r.top>H-30){takeoff({x:0,y:-160})}
      else{p.x=r.left+landOff.x;p.y=r.top+landOff.y;vel.x*=.8;vel.y*=.8;
        if(!reduce){
          if(scrollV>1600)takeoff({x:rnd(-200,200),y:-220});
          else if(near<SIZE*.9&&mspeed>500&&mAge<.2)takeoff({x:(p.x-mouse.x)*6,y:(p.y-mouse.y)*6-120});
          else if(now>landUntil)takeoff({x:rnd(-120,120),y:-200});
        }}
    }else{
      if(state==='enter'){state='wander';pickWander()}
      if(state==='loop'){loopT+=dt;speed=0;if(loopT>1){state='wander';pickWander()}}
      if(state==='approach'||state==='visit'){
        const r=landEl&&landEl.isConnected?landEl.getBoundingClientRect():null;
        if(!r||(state==='approach'&&!vis(landEl)&&stateT>.2)){takeoff()}
        else{tgt.x=r.left+landOff.x;tgt.y=r.top+landOff.y;speed=state==='visit'?820:420;
          if(Math.hypot(tgt.x-p.x,tgt.y-p.y)<10){const wasVisit=state==='visit';state='landed';landedAt=now;landUntil=now+(wasVisit?2600:rnd(4500,9000));if(landEl.id==='cartBtn'||landEl.matches('.tools a'))landUntil=now+2600;
            ang=Math.abs(Math.cos(ang))>0.1?(Math.cos(ang)>0?rnd(-.25,.25):Math.PI+rnd(-.25,.25)):ang}}}
      if(state==='wander'||state==='follow'){
        if(state==='wander'&&mAge<1.2&&near<W*.35&&!coarse&&Math.random()<dt*.5){state='follow';stateT=0}
        if(state==='follow'){tgt.x=mouse.x+Math.cos(t*1.3)*SIZE*.9;tgt.y=mouse.y-SIZE*.7+Math.sin(t*2.1)*SIZE*.35;speed=380;
          if(mAge>2.5||stateT>9){state='wander';pickWander()}}
        else if(Math.hypot(tgt.x-p.x,tgt.y-p.y)<40||stateT>6){stateT=0;hops++;
          if(hops>=2&&Math.random()<.6&&tryLand()){} else pickWander()}
        if(near<SIZE*.8&&mspeed>700&&mAge<.15){const k=1/Math.max(1,near);vel.x+=(p.x-mouse.x)*k*900;vel.y+=(p.y-mouse.y)*k*900}
      }
      if(state!=='loop'){
        const dx=tgt.x-p.x,dy=tgt.y-p.y,d=Math.hypot(dx,dy)||1,arrive=Math.min(1,d/160);
        const ds=speed*arrive,dvx=dx/d*ds,dvy=dy/d*ds;
        vel.x+=(dvx-vel.x)*Math.min(1,dt*turn);vel.y+=(dvy-vel.y)*Math.min(1,dt*turn);
        const wob=Math.min(1,d/80);vel.x+=Math.sin(t*5.3)*40*dt*60*wob*.05;vel.y+=Math.cos(t*6.1)*60*dt*60*wob*.05;
      }else{vel.x*=.9;vel.y*=.9}
      p.x+=vel.x*dt;p.y+=vel.y*dt;
      p.x=Math.max(-SIZE,Math.min(W+SIZE,p.x));p.y=Math.max(40,Math.min(H+SIZE,p.y));
    }

    /* orientation */
    const flying=!(state==='landed'||state==='rest');
    const sp=Math.hypot(vel.x,vel.y);
    if(flying&&sp>25&&state!=='loop'){const want=Math.atan2(-vel.y,vel.x);let da=want-ang;da=Math.atan2(Math.sin(da),Math.cos(da));
      const prev=ang;ang+=da*Math.min(1,dt*6);angV=(ang-prev)/Math.max(dt,1e-3)}
    else angV*=.9;
    if(state==='loop')ang+=loopDir*dt*Math.PI*2.2;
    bank+=((flying?Math.max(-.7,Math.min(.7,-angV*.18)):0)-bank)*Math.min(1,dt*5);
    const wantFlap=flying?.55+Math.min(.35,sp/1400):(Math.sin(t*1.7)>.97?.25:0);
    flap+=(wantFlap-flap)*Math.min(1,dt*(flying?8:4));
    phase+=dt*Math.PI*2*(flying?15:9);
    U.uFlap.value=flap;U.uPhase.value=phase;
    const hover=flying?Math.sin(t*9)*2.2:0;
    gl.style.transform=`translate3d(${(p.x-CS/2).toFixed(1)}px,${(p.y+hover-CS/2).toFixed(1)}px,0)`;
    head.rotation.z=ang;
    roll.rotation.x=(flying?.95:1.12)+bank+(state==='loop'?Math.sin(loopT*Math.PI)*.8:0);
    rf++;const onScreen=p.x>-CS&&p.x<W+CS&&p.y>-CS&&p.y<H+CS;
    if(onScreen&&(flying||flap>.02||rf%4===0))renderer.render(scene,camera);

    /* trail, shadow, pollen */
    tctx.clearRect(0,0,W,H);
    if(!reduce){
      if(flying&&sp>40)trailPts.push({x:p.x-Math.cos(ang)*SIZE*.35,y:p.y+Math.sin(ang)*SIZE*.35,t});
      while(trailPts.length&&t-trailPts[0].t>1.4)trailPts.shift();
      for(let i=0;i<trailPts.length;i+=2){const q=trailPts[i],a=1-(t-q.t)/1.4;tctx.fillStyle=`rgba(217,154,31,${(a*.55).toFixed(3)})`;tctx.beginPath();tctx.arc(q.x,q.y,1.2+a*1.6,0,6.283);tctx.fill()}
      for(let i=burst.length-1;i>=0;i--){const b=burst[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=.94;b.vy=b.vy*.94+30*dt;b.l-=dt*1.1;if(b.l<=0){burst.splice(i,1);continue}
        tctx.fillStyle=`rgba(232,183,74,${b.l.toFixed(3)})`;tctx.beginPath();tctx.arc(b.x,b.y,b.r,0,6.283);tctx.fill()}
    }
    const lift=flying?SIZE*.42:SIZE*.1;
    const g=tctx.createRadialGradient(p.x+lift*.35,p.y+lift,0,p.x+lift*.35,p.y+lift,SIZE*(flying?.42:.36));
    g.addColorStop(0,`rgba(60,40,10,${flying?.13:.22})`);g.addColorStop(1,'rgba(60,40,10,0)');
    tctx.fillStyle=g;tctx.beginPath();tctx.ellipse(p.x+lift*.35,p.y+lift,SIZE*.42,SIZE*.2,0,0,6.283);tctx.fill();

    requestAnimationFrame(frame);
  }
})();
