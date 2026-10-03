(()=>{'use strict';
const $=id=>document.getElementById(id);const LABS=[['parameter','Parameter','sandbox'],['contrast','Contrast','contrast'],['timing','Timing','timing'],['motion','Motion','motion'],['kspace','K-Space','kspace'],['spatial','Spatial','spatial'],['artifact','Artifact','artifact']];
const LAB_GUIDES={
  parameter:{section:'sandbox',title:'Trace one tradeoff end to end',prompt:'Start with FOV or phase matrix. Change one control, then follow the live model, causal chain, and A/B result before changing a second variable.',controls:'#paramControlsCard',result:'#paramModelCard',reset:'sandboxReset'},
  contrast:{section:'contrast',title:'Make one timing change visible',prompt:'Load a familiar timing preset, then move TR or TE by itself. Watch signal spread, the brightest synthetic material, and the relaxation curves change together.',controls:'.contrast-controls-card',result:'.contrast-output-card',reset:'contrastReset'},
  timing:{section:'timing',title:'Move the center of the echo train',prompt:'Start with the short-train preset. Raise ETL or move the center echo, then compare effective-TE-like timing, train count, and the acquisition-time proxy.',controls:'.timing-controls-card',result:'.timing-output-card',reset:'timingReset'},
  motion:{section:'motion',title:'Change when motion happens',prompt:'Use the sudden-shift preset, move onset earlier or later, then switch phase-line ordering. Compare acquisition history with the reconstructed consequence.',controls:'.motion-controls-card',result:'.motion-output-card',reset:'motionReset'},
  kspace:{section:'kspace',title:'Change what survives in frequency space',prompt:'Load Center only, adjust the retained amount, then compare coefficient count, Fourier energy, and the teaching reconstruction before trying undersampling.',controls:'.kspace-controls-card',result:'.kspace-readouts',reset:'kspaceReset'},
  spatial:{section:'spatial',title:'Separate coverage from sampling density',prompt:'Load Phase wrap and raise phase FOV until folding disappears. Then change sample count without changing FOV to see a different effect.',controls:'.spatial-controls-card',result:'.spatial-readouts',reset:'spatialReset'},
  artifact:{section:'artifact',title:'Separate pattern from mechanism',prompt:'Choose a visual pattern, change strength or direction, then use Pattern DNA and the look-alike differential to test whether appearance alone is enough.',controls:'.artifact-lab-controls',result:'.artifact-lab-canvas-card',reset:'artifactLabReset'}
};
const ICONS={parameter:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M16 7h4M4 17h4M11 17h9M13 4v6M8 14v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',contrast:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17c4-11 7-11 9 0 2-8 5-9 9-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 6h18" stroke="currentColor" opacity=".35"/></svg>',timing:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14h3l2-7 3 12 3-10 2 5h5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 21h18" stroke="currentColor" opacity=".35"/></svg>',motion:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8c4-5 5 8 9 3s5 7 9 3M3 15c4-5 5 8 9 3s5 7 9 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',kspace:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v18M9 3v18M15 3v18M19 3v18M3 5h18M3 9h18M3 15h18M3 19h18" stroke="currentColor" opacity=".35"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>',spatial:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 5v14M16 5v14M4 10h16M4 15h16" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 8V3h5M21.5 16v5h-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',artifact:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h10v10H5zM9 9h10v10H9z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 20h16" stroke="currentColor" opacity=".35"/></svg>'};
function cv(id,h=122){const c=$(id);if(!c)return null;const d=Math.min(2.5,devicePixelRatio||1),rect=c.getBoundingClientRect(),w=Math.max(180,Math.round(rect.width||300)),rh=Math.max(96,Math.round(rect.height||h||122));c.width=Math.round(w*d);c.height=Math.round(rh*d);const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);const bg=x.createLinearGradient(0,0,0,rh);bg.addColorStop(0,'#07111d');bg.addColorStop(1,'#040912');x.fillStyle=bg;x.fillRect(0,0,w,rh);x.strokeStyle='rgba(140,190,220,.045)';for(let q=0;q<w;q+=24){x.beginPath();x.moveTo(q,0);x.lineTo(q,rh);x.stroke()}for(let q=0;q<rh;q+=24){x.beginPath();x.moveTo(0,q);x.lineTo(w,q);x.stroke()}return{x,w,h:rh}}
function homeHud(a,label,accent='#6d9cff'){
  const x=a.x,w=a.w,h=a.h,o=8,s=10;x.save();x.strokeStyle=accent;x.globalAlpha=.38;x.lineWidth=1;
  [[o,o,1,1],[w-o,o,-1,1],[o,h-o,1,-1],[w-o,h-o,-1,-1]].forEach(v=>{const px=v[0],py=v[1],dx=v[2],dy=v[3];x.beginPath();x.moveTo(px+dx*s,py);x.lineTo(px,py);x.lineTo(px,py+dy*s);x.stroke()});
  x.globalAlpha=1;x.font='800 8px system-ui';x.fillStyle='rgba(166,190,205,.58)';x.fillText(label.toUpperCase(),o+3,h-14);x.restore()
}
function parameter(){const a=cv('homeParameterPreview');if(!a)return;let m={detail:1,snr:1,time:1};try{m=sandboxMetrics(sandboxState())}catch(e){}
  const rows=[['DETAIL','#6d9cff',m.detail],['SIGNAL','#67e4c0',m.snr],['TIME','#ffd166',m.time]],top=Math.max(22,a.h*.18),bottom=30,gap=(a.h-top-bottom)/3;
  rows.forEach(row=>{const label=row[0],color=row[1],v=row[2],i=rows.indexOf(row),y=top+i*gap,trackW=a.w-56,val=Math.max(.04,Math.min(1.35,v)),baseX=18+trackW/1.35;
    a.x.fillStyle='rgba(255,255,255,.035)';a.x.fillRect(18,y,trackW,10);
    const g=a.x.createLinearGradient(18,0,18+trackW,0);g.addColorStop(0,'rgba(255,255,255,.03)');g.addColorStop(.45,color);g.addColorStop(1,color);a.x.fillStyle=g;a.x.globalAlpha=.84;a.x.fillRect(18,y,trackW*val/1.35,10);a.x.globalAlpha=1;
    a.x.fillStyle='rgba(220,238,248,.25)';a.x.fillRect(baseX,y-3,1,16);a.x.fillStyle='#9fb4c1';a.x.font='800 9px system-ui';a.x.fillText(label,18,y-7);
    a.x.fillStyle=color;a.x.font='900 10px ui-monospace,monospace';a.x.textAlign='right';a.x.fillText(Math.round(v*100)+'%',a.w-18,y-6);a.x.textAlign='left'
  });
  a.x.fillStyle='rgba(109,156,255,.06)';a.x.beginPath();a.x.arc(a.w*.77,a.h*.22,Math.min(a.w,a.h)*.12,0,Math.PI*2);a.x.fill();a.x.strokeStyle='rgba(85,232,255,.18)';a.x.beginPath();a.x.arc(a.w*.77,a.h*.22,Math.min(a.w,a.h)*.075,0,Math.PI*2);a.x.stroke();
  homeHud(a,'TRADEOFF VECTOR','#6d9cff')
}
function contrast(){const a=cv('homeContrastPreview');if(!a)return;let s={tr:800,te:20,ti:600,mode:'se'};try{s=contrastState()}catch(e){}
  const palette=[['#a58cff',.9],['#d28cff',1.35],['#55e8ff',1.9]],left=14,right=a.w-14,top=18,bottom=a.h-24;
  a.x.strokeStyle='rgba(165,140,255,.10)';for(let i=1;i<4;i++){const y=top+(bottom-top)*i/4;a.x.beginPath();a.x.moveTo(left,y);a.x.lineTo(right,y);a.x.stroke()}
  palette.forEach(row=>{const c=row[0],k=row[1];a.x.strokeStyle=c;a.x.lineWidth=2;a.x.beginPath();for(let i=0;i<=100;i++){const t=i/100,xx=left+t*(right-left),yy=bottom-(1-Math.exp(-t*4/k))*(bottom-top);i?a.x.lineTo(xx,yy):a.x.moveTo(xx,yy)}a.x.stroke()});
  const marker=left+Math.min(1,s.te/160)*(right-left);a.x.strokeStyle='rgba(255,209,102,.84)';a.x.setLineDash([3,3]);a.x.beginPath();a.x.moveTo(marker,top-4);a.x.lineTo(marker,bottom+3);a.x.stroke();a.x.setLineDash([]);
  palette.forEach(row=>{const c=row[0],k=row[1],t=Math.min(1,s.te/160),yy=bottom-(1-Math.exp(-t*4/k))*(bottom-top);a.x.fillStyle=c;a.x.beginPath();a.x.arc(marker,yy,3,0,Math.PI*2);a.x.fill()});homeHud(a,'RELAXATION RESPONSE','#a58cff')
}
function timing(){const a=cv('homeTimingPreview');if(!a)return;let s={etl:8,center:4};try{s=timingState()}catch(e){}
  const n=Math.max(2,Math.min(16,+s.etl||8)),center=Math.max(1,Math.min(n,+s.center||Math.ceil(n/2))),base=a.h*.65;
  a.x.fillStyle='rgba(84,217,255,.035)';a.x.fillRect(12,base-4,a.w-24,8);a.x.strokeStyle='#54d9ff';a.x.lineWidth=2;a.x.beginPath();a.x.moveTo(10,base);
  for(let i=0;i<n;i++){const xx=24+i*(a.w-48)/Math.max(1,n-1),isCenter=i===center-1,peak=a.h*.28-(isCenter?8:0);a.x.lineTo(xx-5,base);a.x.lineTo(xx,peak);a.x.lineTo(xx+5,base);if(isCenter){a.x.save();a.x.shadowColor='#54d9ff';a.x.shadowBlur=12;a.x.fillStyle='#e8fbff';a.x.beginPath();a.x.arc(xx,peak,4,0,Math.PI*2);a.x.fill();a.x.restore()}}
  a.x.lineTo(a.w-10,base);a.x.stroke();const cx=24+(center-1)*(a.w-48)/Math.max(1,n-1);a.x.strokeStyle='rgba(255,209,102,.46)';a.x.setLineDash([3,4]);a.x.beginPath();a.x.moveTo(cx,12);a.x.lineTo(cx,a.h-18);a.x.stroke();a.x.setLineDash([]);homeHud(a,'ECHO TRAIN','#54d9ff')
}
function motion(){const a=cv('homeMotionPreview');if(!a)return;let s={amplitude:3,onset:45,cycles:2};try{s=motionState()}catch(e){}
  const onset=Math.max(0,Math.min(1,(+s.onset||0)/100)),amp=Math.min(a.h*.25,4*(+s.amplitude||0)),left=12,right=a.w-12,mid=a.h*.48;
  a.x.strokeStyle='rgba(255,255,255,.08)';a.x.beginPath();a.x.moveTo(left,mid);a.x.lineTo(right,mid);a.x.stroke();
  const fill=a.x.createLinearGradient(0,mid-amp,0,mid+amp);fill.addColorStop(0,'rgba(255,144,127,.16)');fill.addColorStop(1,'rgba(255,144,127,.025)');a.x.beginPath();a.x.moveTo(left,mid);
  const pts=[];for(let i=0;i<=100;i++){const t=i/100,xx=left+t*(right-left),yy=mid+(t<onset?0:Math.sin((t-onset)*Math.PI*2*(+s.cycles||2))*amp);pts.push([xx,yy]);a.x.lineTo(xx,yy)}a.x.lineTo(right,mid);a.x.closePath();a.x.fillStyle=fill;a.x.fill();
  a.x.strokeStyle='#ff907f';a.x.lineWidth=2;a.x.beginPath();pts.forEach((p,i)=>i?a.x.lineTo(p[0],p[1]):a.x.moveTo(p[0],p[1]));a.x.stroke();
  const cx=left+onset*(right-left);a.x.strokeStyle='rgba(255,177,111,.72)';a.x.setLineDash([3,3]);a.x.beginPath();a.x.moveTo(cx,10);a.x.lineTo(cx,a.h-18);a.x.stroke();a.x.setLineDash([]);homeHud(a,'ACQUISITION MOTION','#ff907f')
}
function kspace(){const a=cv('homeKspacePreview');if(!a)return;let s={mode:'full',amount:100};try{s=kspaceState()}catch(e){}
  const cx=a.w/2,cy=a.h/2,amt=Math.max(.1,Math.min(1,(+s.amount||100)/100));for(let y=10;y<a.h-18;y+=7)for(let x=12;x<a.w-12;x+=7){const d=Math.hypot((x-cx)/(a.w*.34),(y-cy)/(a.h*.60));let on=true;if(s.mode==='center')on=d<amt;if(s.mode==='outer')on=d>1-amt;if(s.mode==='truncate')on=Math.abs(y-cy)<a.h*.40*amt;if(s.mode==='undersample')on=Math.round((y-10)/7)%Math.max(2,Math.round(+s.amount||2))===0;const q=Math.max(0,1-d);a.x.fillStyle=on?'rgba(255,209,102,'+(.06+.88*q*q)+')':'rgba(255,255,255,.018)';a.x.fillRect(x,y,3,3)}
  a.x.strokeStyle='rgba(255,209,102,.18)';a.x.beginPath();a.x.moveTo(cx,8);a.x.lineTo(cx,a.h-20);a.x.moveTo(8,cy);a.x.lineTo(a.w-8,cy);a.x.stroke();a.x.fillStyle='rgba(255,209,102,.10)';a.x.beginPath();a.x.arc(cx,cy,15,0,Math.PI*2);a.x.fill();homeHud(a,'FREQUENCY SPACE','#ffd166')
}
function spatial(){const a=cv('homeSpatialPreview');if(!a)return;let s={readFov:100,phaseFov:100,readSamples:256,phaseSamples:256};try{s=spatialState()}catch(e){}
  const rw=Math.max(.3,Math.min(1,+s.readFov/100)),ph=Math.max(.3,Math.min(1,+s.phaseFov/100)),fw=a.w*.64*rw,fh=(a.h-25)*.70*ph,x=(a.w-fw)/2,y=(a.h-24-fh)/2;
  a.x.fillStyle='rgba(103,228,192,.055)';a.x.fillRect(x,y,fw,fh);a.x.strokeStyle='#67e4c0';a.x.setLineDash([6,5]);a.x.strokeRect(x,y,fw,fh);a.x.setLineDash([]);
  const nx=Math.max(4,Math.min(12,Math.round((+s.readSamples||256)/32))),ny=Math.max(3,Math.min(10,Math.round((+s.phaseSamples||256)/36)));a.x.strokeStyle='rgba(85,232,255,.22)';
  for(let i=1;i<nx;i++){const xx=x+i*fw/nx;a.x.beginPath();a.x.moveTo(xx,y);a.x.lineTo(xx,y+fh);a.x.stroke()}for(let i=1;i<ny;i++){const yy=y+i*fh/ny;a.x.beginPath();a.x.moveTo(x,yy);a.x.lineTo(x+fw,yy);a.x.stroke()}
  a.x.fillStyle='rgba(103,228,192,.12)';a.x.beginPath();a.x.ellipse(a.w*.5,a.h*.45,Math.min(38,fw*.24),Math.min(30,fh*.28),0,0,Math.PI*2);a.x.fill();homeHud(a,'ENCODED FIELD','#67e4c0')
}
function artifact(){const a=cv('homeArtifactPreview');if(!a)return;let s={mode:'motion',strength:55,direction:'x'};try{s=artifactLabState()}catch(e){}
  const p=Math.max(.15,Math.min(1,(+s.strength||50)/100)),dx=s.direction==='x'?18*p:0,dy=s.direction==='y'?15*p:0,cx=a.w*.5,cy=a.h*.47,rw=Math.min(a.w*.22,44),rh=Math.min(a.h*.27,34);
  function phantom(ox,oy,alpha){a.x.strokeStyle='rgba(217,140,255,'+alpha+')';a.x.lineWidth=2;a.x.beginPath();a.x.ellipse(cx+ox,cy+oy,rw,rh,0,0,Math.PI*2);a.x.stroke();a.x.beginPath();a.x.arc(cx-rw*.28+ox,cy-rh*.05+oy,Math.max(4,rw*.12),0,Math.PI*2);a.x.stroke()}
  phantom(0,0,.92);
  if(s.mode==='motion'||s.mode==='flow'){phantom(dx,dy,.36);phantom(dx*2,dy*2,.16)}
  else if(s.mode==='zipper'){a.x.strokeStyle='rgba(255,144,127,.82)';a.x.lineWidth=3;a.x.beginPath();a.x.moveTo(8,a.h*.62);a.x.lineTo(a.w-8,a.h*.62);a.x.stroke()}
  else if(s.mode==='wrap'){phantom(-a.w*.25*p,0,.30);phantom(a.w*.25*p,0,.20)}
  else if(s.mode==='trunc'){a.x.strokeStyle='rgba(217,140,255,.28)';for(let i=1;i<5;i++){a.x.beginPath();a.x.ellipse(cx,cy,rw+i*5,rh+i*5,0,0,Math.PI*2);a.x.stroke()}}
  else{a.x.strokeStyle='rgba(255,209,102,.48)';a.x.beginPath();a.x.arc(cx+rw*.30,cy,10+18*p,0,Math.PI*2);a.x.stroke()}
  homeHud(a,'PATTERN SIGNAL','#d98cff')
}
const PREV={parameter,contrast,timing,motion,kspace,spatial,artifact};function drawHome(){Object.values(PREV).forEach(f=>{try{f()}catch(e){}})}let raf=0;function queue(){cancelAnimationFrame(raf);raf=requestAnimationFrame(drawHome)}
function switchers(){document.querySelectorAll('[data-v27-shared-switcher]').forEach(h=>{h.classList.add('v27-lab-switcher');h.innerHTML='<button type="button" class="v27-lab-exit" onclick="showHome()" aria-label="Exit Lab and return to Labs home"><svg class="v27-home-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 11.2 12 4.8l7.5 6.4v8H14.8v-5.2H9.2v5.2H4.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span class="v27-lab-label">Home</span></button>'+LABS.map(([id,label])=>`<button type="button" data-v27-lab="${id}" onclick="openLab('${id}')" aria-label="Open ${label} Lab">${ICONS[id]}<span class="v27-lab-label">${label}</span></button>`).join('')})}function activeLab(id){document.querySelectorAll('[data-v27-lab]').forEach(b=>{const on=b.dataset.v27Lab===id;b.classList.toggle('active',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')})}
function guideScroll(lab,kind){
  const cfg=LAB_GUIDES[lab],section=cfg&&$(cfg.section);if(!cfg||!section)return;
  const target=section.querySelector(kind==='controls'?cfg.controls:cfg.result);
  target?.scrollIntoView({behavior:document.documentElement.classList.contains('ui-reduce-motion')?'auto':'smooth',block:'start'});
  if(target){target.classList.add('v281-guide-target');setTimeout(()=>target.classList.remove('v281-guide-target'),700)}
}
function guideReset(lab){
  const cfg=LAB_GUIDES[lab];if(!cfg)return;
  const fn=window[cfg.reset];if(typeof fn==='function')fn();
  window.__mrccLastChange={lab,label:'Lab reset',value:'baseline'};
  requestAnimationFrame(()=>{renderI();drawHome()});
  window.restartLabProof?.(lab);
}
function guideMove(lab,dir){
  const i=LABS.findIndex(x=>x[0]===lab);if(i<0)return;
  const next=(i+dir+LABS.length)%LABS.length;openLab(LABS[next][0]);
}
function guides(){
  LABS.forEach(([lab,label,sectionId],index)=>{
    const section=$(sectionId),cfg=LAB_GUIDES[lab];if(!section||!cfg||section.querySelector('[data-v281-guide]'))return;
    const head=section.querySelector('.section-head');
    const guide=document.createElement('aside');guide.className='v281-lab-guide';guide.dataset.v281Guide=lab;guide.setAttribute('aria-label',label+' Lab quick start');
    guide.innerHTML=`<div class="v281-guide-copy"><div class="v281-guide-kicker"><span>Lab ${index+1} / ${LABS.length}</span><i>Quick start</i></div><b>${cfg.title}</b><p>${cfg.prompt}</p></div><div class="v281-guide-actions"><button type="button" onclick="guideScroll('${lab}','controls')"><span>01</span>Controls</button><button type="button" onclick="guideScroll('${lab}','result')"><span>02</span>Live result</button><button type="button" onclick="guideReset('${lab}')"><span>↺</span>Reset</button></div><div class="v281-guide-nav"><button type="button" onclick="guideMove('${lab}',-1)" aria-label="Open previous Lab">←</button><span>${label}</span><button type="button" onclick="guideMove('${lab}',1)" aria-label="Open next Lab">→</button></div>`;
    (head||section.firstElementChild)?.insertAdjacentElement('afterend',guide);
  });
}
window.guideScroll=guideScroll;window.guideReset=guideReset;window.guideMove=guideMove;
function makeHub(id,title,kicker,items){let b=$(id);if(b)return b;b=document.createElement('div');b.id=id;b.className='v27-hubback';b.setAttribute('aria-hidden','true');b.innerHTML=`<section class="v27-hub" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><div class="v27-hub-head"><div><div class="v27-kicker">${kicker}</div><h2 id="${id}Title">${title}</h2></div><button class="v27-hub-close" aria-label="Close">✕</button></div><div class="v27-hub-grid">${items.map(x=>`<button type="button" data-action="${x[0]}"><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div></section>`;document.body.appendChild(b);b.addEventListener('click',e=>{if(e.target===b||e.target.closest('.v27-hub-close'))close(b);const x=e.target.closest('[data-action]');if(x){close(b);run(x.dataset.action)}});return b}function close(b){b.classList.remove('open');b.setAttribute('aria-hidden','true')}function open(b){b.classList.add('open');b.setAttribute('aria-hidden','false');setTimeout(()=>b.querySelector('button')?.focus(),0)}function run(a){if(a==='parameterref'){go?.('sandbox',true);setTimeout(()=>$('parameterReference')?.scrollIntoView({behavior:'smooth'}),100)}else if(a==='settings')openPreferences?.();else if(a==='search')openPalette?.();else if(a==='premium')openPremiumWorkspace?.();else if(a==='home')showHome?.();else if(a==='compare')openParameterWorkspace?.('compare');else go?.(a)}
window.openV27ReferenceHub=()=>open(makeHub('v27ReferenceHub','MRI Reference','Reference hub',[['parameterref','Parameter Reference','Geometry, signal, efficiency, contrast, artifacts'],['math','Scan Math','Voxel size and acquisition-time relationships'],['rescue','Sequence Rescue','Work backward from the limiting problem'],['artifact','Artifact troubleshooting','Pattern, mechanism, direction, discriminator'],['safety','MR Safety','Evidence chain and escalation routes'],['burn','Thermal / RF','Heating, loops, cables, and setup concepts']]));window.openV27MoreMenu=()=>open(makeHub('v27MoreHub','More MRCC tools','Workspace',[['premium','Premium previews','Advanced interactive concept models'],['compare','Parameter A/B Compare','Compare saved A against the live stack'],['safety','MR Safety','Safety reference and escalation'],['settings','Settings','Text size, contrast, motion, backup'],['search','Search','Find a Lab, sequence, artifact, or reference'],['home','Home','Return to MRCC Home']]));
function intel(section,lab){
  const s=$(section);if(!s||s.querySelector('.v27-intelligence'))return;
  const h=document.createElement('div');
  h.className='v27-intelligence';h.dataset.v27Intel=lab;h.setAttribute('aria-live','polite');h.setAttribute('aria-atomic','false');
  h.innerHTML='<div class="v27-intel-cell"><small>Changed</small><b data-v27-what>Current state</b><span data-v27-wd>Move a control to compare the experiment.</span></div><div class="v27-intel-cell"><small>Live result</small><b data-v27-why>Current outcome</b><span data-v27-yd>The modeled result updates here.</span></div><div class="v27-intel-cell"><small>Why it matters</small><b data-v27-next>Relationship</b><span data-v27-nd>The dominant teaching relationship appears here.</span></div>';
  const anchorMap={parameter:'#paramModelCard',contrast:'.contrast-layout',timing:'.timing-layout',motion:'.motion-layout',kspace:'.kspace-readouts',spatial:'.spatial-readouts',artifact:'.artifact-lab-grid'};
  let anchor=s.querySelector(anchorMap[lab]||'');
  if(lab==='parameter'&&anchor)anchor=anchor.closest('.grid2')||anchor;
  if(!anchor)anchor=s.querySelector('.section-head,.lab-canvas-head,.contrast-lab-head,.lab-switcher')||s.firstElementChild;
  anchor?.insertAdjacentElement('afterend',h);
}
function setI(l,a,b,c,d,e,f){const h=document.querySelector(`[data-v27-intel="${l}"]`);if(!h)return;[['[data-v27-what]',a],['[data-v27-wd]',b],['[data-v27-why]',c],['[data-v27-yd]',d],['[data-v27-next]',e],['[data-v27-nd]',f]].forEach(([q,v])=>{const x=h.querySelector(q);if(x)x.textContent=v})}
function changeLead(lab,title,detail){
  const c=window.__mrccLastChange;
  if(!(c&&c.lab===lab))return[title,detail];
  const movement=c.previous&&c.value&&c.previous!==c.value?c.previous+' → '+c.value:c.value?'Now '+c.value:detail;
  return[c.label+' changed',movement];
}
function renderI(){
  try{
    const s=sandboxState(),m=sandboxMetrics(s),n=sandboxChangedCount?.(s)||0,ch=changeLead('parameter','Current parameter stack',n+' control'+(n===1?'':'s')+' from baseline');
    setI('parameter',ch[0],ch[1],`Detail ${Math.round(m.detail*100)}% · SNR ${Math.round(m.snr*100)}%`,`Modeled time ${Math.round(m.time*100)}% · ${n} changed control${n===1?'':'s'}`,'Tradeoffs move together','Voxel geometry, bandwidth, averaging, acceleration, ETL and sampling burden redistribute detail, signal and time.');
  }catch(e){}
  try{
    const s=contrastState(),cue=contrastTeachingCue(s),sig=contrastMaterialsModel.map(m=>contrastSignal(m,s)),mx=Math.max(...sig,.000001),mn=Math.min(...sig),spread=Math.round((mx-mn)/mx*100),bi=sig.indexOf(mx),bright=contrastMaterialsModel[bi]?.name||'—',ch=changeLead('contrast',s.mode==='ir'?'IR-like timing':'SE-like timing',`TR ${Math.round(s.tr)} ms · TE ${Math.round(s.te)} ms${s.mode==='ir'?' · TI '+Math.round(s.ti)+' ms':''}`);
    setI('contrast',ch[0],ch[1],`Signal spread ${spread}%`,`${bright} brightest · ${cue.label||'relative contrast'}`,cue.label||'Timing changes weighting',cue.detail||'TR, TE and TI shift relative recovery and decay in the teaching model.');
  }catch(e){}
  try{
    const s=timingState(),m=timingMetrics(s),ch=changeLead('timing',`ETL ${s.etl} · center echo ${s.center}`,`TR ${Math.round(s.tr)} ms · spacing ${Math.round(s.spacing)} ms`);
    setI('timing',ch[0],ch[1],`Center timing ${Math.round(m.effectiveTe)} ms`,`${m.trains} train${m.trains===1?'':'s'} · toy burden ${Math.round(m.timeSec)} s · ${m.fit?'fits TR':'exceeds TR'}`,'Center k-space timing drives the result','Changing echo-train structure moves the center echo and the modeled acquisition burden together.');
  }catch(e){}
  try{
    const s=motionState(),a=motionAcquire(s),copy=motionTeachingCopy(s,a),ch=changeLead('motion',`${copy.short} motion`,`${Number(s.amplitude||0).toFixed(1)} px · onset ${Math.round(s.onset||0)}% · ${s.order==='centric'?'centric':'linear'} order`);
    setI('motion',ch[0],ch[1],`${a.affected} / ${KS_N} phase lines affected`,`Peak shift ${Number(a.peak||0).toFixed(1)} px · center shift ${Math.abs(Number(a.centerShift||0)).toFixed(1)} px`,copy.dominant||'Acquisition timing matters',copy.dominantDetail||'The artifact depends on which phase lines are acquired while the object is displaced.');
  }catch(e){}
  try{
    const s=kspaceState(),masked=kspaceApplyMask(s),copy=kspaceTeachingCopy(s),summary=kspaceModeSummary(s),ret=Math.round(masked.retained*100),ch=changeLead('kspace',summary.title||'Current mask',summary.meta||'Synthetic sampling mask');
    setI('kspace',ch[0],ch[1],`${ret}% samples retained`,`${copy.effect||'Image response'} · ${copy.detail||summary.meta||''}`,'Mask → image response','Central, peripheral and regularly omitted spatial frequencies produce different image structure and artifacts.');
  }catch(e){}
  try{
    const s=spatialState(),m=spatialMetrics(s),copy=spatialTeachingCopy(s,m),ch=changeLead('spatial',`Read FOV ${Math.round(s.readFov)}% · phase FOV ${Math.round(s.phaseFov)}%`,`${Math.round(s.readSamples)} × ${Math.round(s.phaseSamples)} samples`);
    setI('spatial',ch[0],ch[1],copy.short||'Encoding state',`Pixel proxy ${m.readPixel.toFixed(2)}× / ${m.phasePixel.toFixed(2)}× · burden ${Math.round(m.sampleBurden*100)}%`,'Coverage and sampling are different',copy.detail||'FOV controls encoded coverage while sample count controls the represented grid.');
  }catch(e){}
  try{
    const s=artifactLabState(),p=artifactProfile(s.mode),cue=artifactTeachingCue(s),title=artifacts[s.mode]?.title||p.pattern||'Artifact',ch=changeLead('artifact',title,`Strength ${Math.round(s.strength)}% · ${s.direction==='x'?'horizontal':'vertical'} display / encoding direction`);
    setI('artifact',ch[0],ch[1],cue?.[0]||p.pattern||'Pattern response',cue?.[1]||p.footprint||'The synthetic pattern updates with the selected evidence state.','Pattern evidence first',p.discriminator||p.directionHint||p.direction||'Use morphology, footprint and direction behavior before naming the artifact.');
  }catch(e){}
}
function dna(){try{sequenceDnaRank().slice(0,3).forEach(r=>{const c=document.querySelector(`[data-seq-dna-family="${r.id}"]`);if(!c||c.querySelector('.v27-dna-evidence'))return;const b=document.createElement('div');b.className='v27-dna-evidence';const f=x=>x.map(([d,v])=>`<span>${sequenceDnaDimensions[d].label}: ${sequenceDnaLabel(d,v)}</span>`).join('')||'<span>None</span>';b.innerHTML=`<div><small>Matches</small>${f(r.matched)}</div><div class="conflict"><small>Conflicts</small>${f(r.missed)}</div>`;c.appendChild(b)})}catch(e){}}
function canvases(){const m={motionHistoryCanvas:'Synthetic motion displacement across phase-line acquisition.',motionReferenceCanvas:'Stationary synthetic reference phantom.',motionResultCanvas:'Synthetic motion-corrupted reconstruction.',motionLinearCanvas:'Synthetic reconstruction using linear phase ordering.',motionCentricCanvas:'Synthetic reconstruction using centric phase ordering.',ksKspaceCanvas:'Synthetic k-space magnitude map for the active mask.',ksImageCanvas:'Synthetic reconstruction from the active k-space mask.',ksPsfCanvas:'Mathematical impulse response of the active synthetic mask.',spWorldCanvas:'Synthetic object with encoded field-of-view frame.',spReconCanvas:'Synthetic reconstruction illustrating wrap and sampling density.',artifactCanvas:'Stylized MRI artifact teaching pattern; Pattern DNA provides text evidence.'};Object.entries(m).forEach(([id,label])=>{const c=$(id);if(c){c.setAttribute('role','img');c.setAttribute('aria-label',label)}})}
function boot(){switchers();guides();LABS.forEach(([id,,s])=>intel(s,id));canvases();renderI();drawHome();document.querySelectorAll('.lab-home-card').forEach(c=>{const t=c.querySelector('h3')?.textContent?.trim(),b=c.querySelector('.lab-home-open'),id=LABS.find(x=>c.classList.contains('lab-home-'+x[0]))?.[0];if(t&&b)b.setAttribute('aria-label','Open '+t);if(id){const i=c.querySelector('.lab-home-icon');if(i)i.innerHTML=ICONS[id]}});document.addEventListener('input',()=>{requestAnimationFrame(renderI);queue()},{passive:true});document.addEventListener('change',()=>{requestAnimationFrame(renderI);queue()},{passive:true});document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.closest('.v27-lab-switcher'))return;const section=b.closest('.section');if(!section||!document.body.classList.contains('lab-stage-mode'))return;const lab=LABS.find(x=>x[2]===section.id)?.[0];if(!lab)return;const label=(b.querySelector('b')?.textContent||b.textContent||'Lab action').replace(/\s+/g,' ').trim().slice(0,48);window.__mrccLastChange={lab,label,value:'applied'};requestAnimationFrame(()=>{renderI();queue()})},{passive:true});addEventListener('resize',queue,{passive:true});if(typeof renderSequenceDna==='function'){const old=renderSequenceDna;window.renderSequenceDna=function(){const r=old.apply(this,arguments);requestAnimationFrame(dna);return r};requestAnimationFrame(dna)}if(typeof setWorkspaceTabActive==='function'){window.setWorkspaceTabActive=function(tab='home'){const d={safety:'reference',compare:'labs',more:'reference'}[tab]||tab,m={premium:'more',safety:'more',compare:'more'}[tab]||tab;document.querySelectorAll('#workspaceRail [data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===d;b.classList.toggle('active',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});document.querySelectorAll('#mobileNav [data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===m;b.classList.toggle('active',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')})}}if(typeof openLab==='function'){const old=openLab;window.openLab=function(id){activeLab(id);const r=old.apply(this,arguments);requestAnimationFrame(()=>{renderI();drawHome()});return r}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();})();

;(()=>{'use strict';
const $=id=>document.getElementById(id);
const LAB_SECTION={parameter:'sandbox',contrast:'contrast',timing:'timing',motion:'motion',kspace:'kspace',spatial:'spatial',artifact:'artifact'};
const CONTROL_MAP={
 sbFov:['parameter','FOV'],sbFreq:['parameter','frequency matrix'],sbPhase:['parameter','phase matrix'],sbPhaseFov:['parameter','phase FOV'],sbSlice:['parameter','slice thickness'],sbNex:['parameter','NEX'],sbBw:['parameter','bandwidth'],sbEtl:['parameter','ETL'],sbAccel:['parameter','acceleration'],sbPf:['parameter','partial Fourier'],
 clMode:['contrast','sequence model'],clTr:['contrast','TR'],clTe:['contrast','TE'],clTi:['contrast','TI'],
 timingTr:['timing','TR'],timingFirstEcho:['timing','first echo'],timingSpacing:['timing','echo spacing'],timingEtl:['timing','ETL'],timingCenter:['timing','center echo'],timingPhase:['timing','phase encodes'],timingNex:['timing','NEX'],
 motionMode:['motion','motion pattern'],motionDirection:['motion','translation direction'],motionOrder:['motion','phase-line ordering'],motionAmplitude:['motion','motion amplitude'],motionOnset:['motion','motion onset'],motionCycles:['motion','motion cycles'],
 ksMode:['kspace','mask family'],ksAmount:['kspace','mask amount / acceleration'],
 spPhaseFov:['spatial','phase FOV'],spReadFov:['spatial','read FOV'],spPhaseSamples:['spatial','phase samples'],spReadSamples:['spatial','read samples'],
 artifactSelect:['artifact','artifact evidence pattern'],artifactStrength:['artifact','artifact strength'],artifactDirection:['artifact','display / encoding direction']
};
const lastChange={};
const resultSnapshots={};
let interactionBase=null;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const pct=v=>(Math.round(v*1000)/10)+'%';
const delta=v=>{const n=Math.round((v-1)*100);return (n>0?'+':'')+n+'%'};
const signed=(v,d=1,unit='')=>{const n=Number(v)||0,eps=Math.pow(10,-d)/2;if(Math.abs(n)<eps)return '0'+unit;return (n>0?'+':'')+n.toFixed(d)+unit};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function labResultSnapshot(lab){
  try{
    if(lab==='parameter'){const m=sandboxMetrics(sandboxState());return{detail:m.detail*100,snr:m.snr*100,time:m.time*100,voxel:m.voxel}}
    if(lab==='contrast'){const s=contrastState(),sig=contrastMaterialsModel.map(m=>contrastSignal(m,s)),mx=Math.max(...sig,.000001),mn=Math.min(...sig),bi=sig.indexOf(mx);return{spread:(mx-mn)/mx*100,bright:contrastMaterialsModel[bi]?.name||'—'}}
    if(lab==='timing'){const m=timingMetrics(timingState());return{center:m.effectiveTe,time:m.timeSec,trains:m.trains,span:m.trainSpan}}
    if(lab==='motion'){const s=motionState(),a=motionAcquire(s);return{affected:a.affected,center:Math.abs(a.centerShift),peak:a.peak}}
    if(lab==='kspace'){const s=kspaceState(),m=kspaceApplyMask(s),e=kspaceEnergyStats(m),p=kspaceMaskPsf(m);return{samples:m.retained*100,energy:e.energyRetained*100,side:p.sideRatio*100}}
    if(lab==='spatial'){const s=spatialState(),m=spatialMetrics(s);return{read:m.readPixel,phase:m.phasePixel,burden:m.sampleBurden*100,wrap:(m.readWrap?1:0)+(m.phaseWrap?1:0)}}
    if(lab==='artifact'){const s=artifactLabState();return{strength:s.strength,mode:s.mode,direction:s.direction}}
  }catch(e){}
  return null;
}
function labDeltaText(lab,prev,now){
  if(!prev||!now)return'';
  if(lab==='parameter')return 'detail '+signed(now.detail-prev.detail,1,' pts')+' · SNR '+signed(now.snr-prev.snr,1,' pts')+' · time '+signed(now.time-prev.time,1,' pts');
  if(lab==='contrast'){const bright=prev.bright!==now.bright?' · brightest '+prev.bright.replace('Material ','')+' → '+now.bright.replace('Material ',''):'';return 'spread '+signed(now.spread-prev.spread,1,' pts')+bright}
  if(lab==='timing')return 'center '+signed(now.center-prev.center,0,' ms')+' · time '+signed(now.time-prev.time,1,' s')+' · trains '+signed(now.trains-prev.trains,0,'');
  if(lab==='motion')return 'affected '+signed(now.affected-prev.affected,0,' lines')+' · center '+signed(now.center-prev.center,2,' px')+' · peak '+signed(now.peak-prev.peak,2,' px');
  if(lab==='kspace')return 'samples '+signed(now.samples-prev.samples,1,' pts')+' · energy '+signed(now.energy-prev.energy,1,' pts')+' · side response '+signed(now.side-prev.side,1,' pts');
  if(lab==='spatial'){const wrap=prev.wrap!==now.wrap?' · wrap axes '+prev.wrap+' → '+now.wrap:'';return 'read pixel '+signed(now.read-prev.read,2,'×')+' · phase pixel '+signed(now.phase-prev.phase,2,'×')+' · burden '+signed(now.burden-prev.burden,1,' pts')+wrap}
  if(lab==='artifact'){const bits=['strength '+signed(now.strength-prev.strength,0,' pts')];if(prev.mode!==now.mode)bits.push('pattern changed');if(prev.direction!==now.direction)bits.push(prev.direction+' → '+now.direction);return bits.join(' · ')}
  return'';
}
function labForElement(el){
  const section=el?.closest?.('.section');if(!section)return'';
  return Object.entries(LAB_SECTION).find(([,id])=>id===section.id)?.[0]||'';
}
function pulseLabResult(lab){
  const section=$(LAB_SECTION[lab]);if(!section)return;
  const sel={parameter:'#paramModelCard',contrast:'.contrast-output-card',timing:'.timing-output-card',motion:'.motion-output-card',kspace:'.kspace-output-card:last-child',spatial:'.spatial-output-card:last-child',artifact:'.artifact-lab-canvas-card'}[lab];
  const target=section.querySelector(sel)||section.querySelector('.card');
  [target,section.querySelector('.v271-analysis')].filter(Boolean).forEach(el=>{el.classList.add('lab-result-updating');clearTimeout(el.__mrccPulse);el.__mrccPulse=setTimeout(()=>el.classList.remove('lab-result-updating'),320)});
}
function paintInteractionDelta(lab,text){
  if(!text)return;
  const intel=document.querySelector('[data-v27-intel="'+lab+'"]');
  const detail=intel?.querySelector('[data-v27-yd]');
  if(detail)detail.textContent='Δ from interaction start · '+text;
  const resultCell=intel?.querySelector('.v27-intel-cell:nth-child(2)');
  if(resultCell){resultCell.classList.add('sf-updated');clearTimeout(resultCell.__mrccPulse);resultCell.__mrccPulse=setTimeout(()=>resultCell.classList.remove('sf-updated'),360)}
  pulseLabResult(lab);
}
function applyInteractionDelta(lab,now,commit=false){
  const base=interactionBase?.lab===lab?interactionBase.snapshot:resultSnapshots[lab];
  const text=labDeltaText(lab,base,now);
  paintInteractionDelta(lab,text);
  if(commit||!interactionBase)resultSnapshots[lab]=now;
  return text;
}

const PROOF_TASKS={
  parameter:{title:'Make one tradeoff undeniable',goal:'Move the stack until detail, SNR, or modeled time shifts by at least 8 points from your session start.',hit:(b,n)=>Math.max(Math.abs(n.detail-b.detail),Math.abs(n.snr-b.snr),Math.abs(n.time-b.time))>=8},
  contrast:{title:'Create a visible contrast change',goal:'Change timing until signal spread moves by at least 10 points, or the brightest synthetic material changes.',hit:(b,n)=>Math.abs(n.spread-b.spread)>=10||n.bright!==b.bright},
  timing:{title:'Move timing enough to matter',goal:'Shift center timing, train count, or the time proxy enough to produce a clearly measurable consequence.',hit:(b,n)=>Math.abs(n.center-b.center)>=8||Math.abs(n.time-b.time)>=12||Math.abs(n.trains-b.trains)>=4},
  motion:{title:'Make acquisition inconsistency visible',goal:'Change motion timing, amplitude, or ordering until affected lines or displacement changes clearly.',hit:(b,n)=>Math.abs(n.affected-b.affected)>=4||Math.abs(n.center-b.center)>=.5||Math.abs(n.peak-b.peak)>=.5},
  kspace:{title:'Make the mask change the reconstruction',goal:'Alter the sampling mask until retained samples, retained energy, or side response moves substantially.',hit:(b,n)=>Math.abs(n.samples-b.samples)>=10||Math.abs(n.energy-b.energy)>=10||Math.abs(n.side-b.side)>=5},
  spatial:{title:'Separate FOV from sampling',goal:'Cause wrap to appear/disappear, or move relative pixel width or sample burden far enough to compare the mechanisms.',hit:(b,n)=>Math.abs(n.read-b.read)>=.12||Math.abs(n.phase-b.phase)>=.12||Math.abs(n.burden-b.burden)>=15||n.wrap!==b.wrap},
  artifact:{title:'Change pattern evidence',goal:'Change pattern, direction, or teaching strength enough to create a different visual-evidence state.',hit:(b,n)=>Math.abs(n.strength-b.strength)>=15||n.mode!==b.mode||n.direction!==b.direction}
};
const proofState={};
function proofEnsure(lab){
  if(proofState[lab])return proofState[lab];
  proofState[lab]={base:labResultSnapshot(lab),touched:new Set()};
  return proofState[lab];
}
function proofPanel(lab){
  const guide=document.querySelector('[data-v281-guide="'+lab+'"]');if(!guide)return null;
  let panel=guide.parentElement.querySelector(':scope > [data-v282-proof="'+lab+'"]');
  if(panel)return panel;
  const task=PROOF_TASKS[lab];if(!task)return null;
  panel=document.createElement('section');panel.className='v282-lab-proof';panel.dataset.v282Proof=lab;panel.setAttribute('aria-label','Session experiment');
  panel.innerHTML='<div class="v282-proof-head"><div><small>Session experiment</small><h3>'+esc(task.title)+'</h3></div><span data-proof-score>0 / 3</span></div><p class="v282-proof-goal">'+esc(task.goal)+'</p><div class="v282-proof-steps"><div data-proof-step="change"><i>1</i><span><b>Change one lever</b><small>Use a control or preset.</small></span></div><div data-proof-step="result"><i>2</i><span><b>Cause a measurable result</b><small>Push past the task threshold.</small></span></div><div data-proof-step="second"><i>3</i><span><b>Test a second lever</b><small>See whether the relationship holds.</small></span></div></div><div class="v282-proof-evidence"><div role="status" aria-live="polite" aria-atomic="true"><small>Live evidence</small><b data-proof-evidence>Waiting for your first change</b><span data-proof-detail>MRCC will summarize the delta from this session starting point.</span></div><button type="button" onclick="restartLabProof(\''+lab+'\')">Restart task</button></div>';
  guide.insertAdjacentElement('afterend',panel);return panel;
}
function proofRender(lab){
  const task=PROOF_TASKS[lab],state=proofEnsure(lab),panel=proofPanel(lab),now=labResultSnapshot(lab);if(!task||!state.base||!now||!panel)return;
  const changed=state.touched.size>=1,result=task.hit(state.base,now),second=state.touched.size>=2,flags={change:changed,result,second};
  Object.entries(flags).forEach(([key,on])=>{const el=panel.querySelector('[data-proof-step="'+key+'"]');el?.classList.toggle('done',!!on)});
  const score=[changed,result,second].filter(Boolean).length,scoreEl=panel.querySelector('[data-proof-score]');if(scoreEl){scoreEl.textContent=score+' / 3';scoreEl.classList.toggle('done',score===3)}
  const deltaText=labDeltaText(lab,state.base,now),ev=panel.querySelector('[data-proof-evidence]'),detail=panel.querySelector('[data-proof-detail]');
  if(ev)ev.textContent=deltaText||'Waiting for your first change';
  if(detail)detail.textContent=score===3?'Experiment complete. Reset the task or keep exploring with a new combination.':result?'The modeled consequence cleared the task threshold. Now test another lever.':changed?'A lever changed; push it farther or try a preset until the result crosses the task threshold.':'MRCC will summarize the delta from this session starting point.';
}
function proofTouch(lab,key){
  const state=proofEnsure(lab);if(!state||!key)return;state.touched.add(key);requestAnimationFrame(()=>proofRender(lab));
}
function proofRestart(lab){
  const state=proofEnsure(lab);state.base=labResultSnapshot(lab);state.touched.clear();proofRender(lab);
}
function proofBoot(){
  Object.keys(PROOF_TASKS).forEach(lab=>{proofPanel(lab);proofEnsure(lab);proofRender(lab)});
}
window.restartLabProof=proofRestart;

function host(lab,title,kicker='Lab Intelligence'){
  const intel=document.querySelector('[data-v27-intel="'+lab+'"]'); if(!intel)return null;
  let box=intel.parentElement.querySelector(':scope > .v271-analysis[data-lab="'+lab+'"]');
  if(!box){box=document.createElement('section');box.className='v271-analysis';box.dataset.lab=lab;box.innerHTML='<div class="v271-analysis-head"><div><small>'+esc(kicker)+'</small><h3>'+esc(title)+'</h3></div><span class="v271-live"><i></i>live model</span></div><div class="v271-analysis-body"></div>';intel.insertAdjacentElement('afterend',box)}
  return box.querySelector('.v271-analysis-body');
}
function bars(rows){
  return '<div class="v271-bars">'+rows.map(r=>'<div class="v271-bar"><div><b>'+esc(r[0])+'</b><span>'+esc(r[2]||'')+'</span></div><div class="v271-track"><i style="--p:'+clamp(r[1])*100+'%;--c:'+(r[3]||'var(--lab-accent,#5be7ff)')+'"></i></div></div>').join('')+'</div>';
}
function parameterAnalysis(){
  const body=host('parameter','What is driving this stack?');if(!body)return;
  try{
    const s=sandboxState(),keys=Object.keys(sbBase),labels={fov:'FOV',mx:'frequency matrix',phase:'phase matrix',phaseFov:'phase FOV',slice:'slice thickness',nex:'NEX',bw:'bandwidth',etl:'ETL',accel:'acceleration',pf:'partial Fourier'};
    const rows=keys.filter(k=>Math.abs(Number(s[k])-Number(sbBase[k]))>1e-9).map(k=>{
      const iso={...sbBase,[k]:s[k]},m=sandboxMetrics(iso);
      const impacts=[['detail',m.detail],['SNR',m.snr],['time',m.time]];
      const score=impacts.reduce((a,[,v])=>a+Math.abs(Math.log(Math.max(.001,v))),0);
      const strongest=impacts.sort((a,b)=>Math.abs(Math.log(b[1]))-Math.abs(Math.log(a[1])))[0];
      return {k,label:labels[k],score,strongest:strongest[0]+' '+delta(strongest[1]),detail:m.detail,snr:m.snr,time:m.time};
    }).sort((a,b)=>b.score-a.score);
    if(!rows.length){body.innerHTML='<div class="v271-empty"><b>Baseline stack</b><span>Move any Parameter control and MRCC will rank its isolated contribution to detail, SNR, and modeled time.</span></div>';return}
    const max=Math.max(...rows.map(r=>r.score),.001),top=rows.slice(0,4);
    body.innerHTML='<div class="v271-driver-grid">'+top.map((r,i)=>'<button type="button" data-v271-inspector="'+r.k+'" class="v271-driver '+(i===0?'lead':'')+'"><span class="v271-rank">'+(i+1)+'</span><div><small>'+esc(r.label)+'</small><b>'+esc(r.strongest)+'</b><span>D '+delta(r.detail)+' · SNR '+delta(r.snr)+' · time '+delta(r.time)+'</span></div><i style="--p:'+Math.max(8,Math.round(r.score/max*100))+'%"></i></button>').join('')+'</div><p class="v271-footnote">Each row isolates one changed lever against the Parameter Lab baseline. It is a teaching decomposition, not a scanner prediction.</p>';
    body.querySelectorAll('[data-v271-inspector]').forEach(b=>b.onclick=()=>{try{setParameterInspector(b.dataset.v271Inspector);document.getElementById('parameterDeepCockpit')?.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}});
  }catch(e){body.innerHTML='<div class="v271-empty"><b>Driver analysis unavailable</b><span>The underlying Parameter Lab remains active.</span></div>'}
}
function contrastSpread(s){const sig=contrastMaterialsModel.map(m=>contrastSignal(m,s)),mx=Math.max(...sig,.000001),mn=Math.min(...sig);return {spread:(mx-mn)/mx,sig}}
function contrastAnalysis(){
  const body=host('contrast','Which timing lever is separating the signals?');if(!body)return;
  try{
    const s=contrastState(),base=contrastSpread(s).spread,bounds={tr:[300,5000,Math.max(80,s.tr*.08)],te:[10,180,Math.max(5,s.te*.12)],ti:[50,2500,Math.max(30,s.ti*.08)]};
    const levers=(s.mode==='ir'?['tr','te','ti']:['tr','te']).map(k=>{
      const [lo,hi,step]=bounds[k],plus={...s,[k]:clamp(s[k]+step,lo,hi)},minus={...s,[k]:clamp(s[k]-step,lo,hi)},dp=contrastSpread(plus).spread-base,dm=contrastSpread(minus).spread-base;
      const best=Math.abs(dp)>=Math.abs(dm)?{dir:'increase',d:dp}:{dir:'decrease',d:dm};
      return {k,label:k.toUpperCase(),strength:Math.max(Math.abs(dp),Math.abs(dm)),best};
    }).sort((a,b)=>b.strength-a.strength);
    const max=Math.max(...levers.map(x=>x.strength),.001);
    body.innerHTML='<div class="v271-sensitivity">'+levers.map((r,i)=>'<div class="'+(i===0?'lead':'')+'"><small>'+r.label+' local sensitivity</small><b>'+pct(r.strength)+' spread change</b><span>Try '+r.best.dir+' · '+(r.best.d>=0?'separation grows':'separation shrinks')+'</span><i style="--p:'+Math.max(5,r.strength/max*100)+'%"></i></div>').join('')+'</div><div class="v271-callout"><b>Current synthetic spread '+pct(base)+'</b><span>Local sensitivity tests a small timing perturbation around the current state; it does not imply clinical optimization.</span></div>';
  }catch(e){}
}
function timingAnalysis(){
  const body=host('timing','Where is the timing pressure?');if(!body)return;
  try{
    const s=timingState(),m=timingMetrics(s),util=clamp(m.trainSpan/Math.max(1,s.tr)),center=clamp(m.effectiveTe/Math.max(1,m.trainSpan)),trainPressure=clamp(m.trains/40),timePressure=clamp(m.timeSec/180);
    body.innerHTML=bars([['TR occupied',util,Math.round(util*100)+'% of toy TR','#5be7ff'],['Center position',center,'echo '+s.center+' of '+s.etl,'#9a83ff'],['Train count',trainPressure,m.trains+' train'+(m.trains===1?'':'s'),'#68e1b8'],['Toy acquisition burden',timePressure,Math.round(m.timeSec)+' s','#ffd166']])+'<div class="v271-callout '+(!m.fit?'warn':'')+'"><b>'+(m.fit?'Train fits inside toy TR':'Train exceeds toy TR')+'</b><span>Train span '+Math.round(m.trainSpan)+' ms · effective-TE-like center '+Math.round(m.effectiveTe)+' ms · idle '+Math.round(m.idle)+' ms.</span></div>';
  }catch(e){}
}
function motionAnalysis(){
  const body=host('motion','Which phase lines are vulnerable?');if(!body)return;
  try{
    const s=motionState(),a=motionAcquire(s),st=motionLineStats(a),den=Math.max(.001,s.amplitude||1);
    const cells=[];for(let y=0;y<KS_N;y++){const ky=motionSignedIndex(y),rank=a.rankByY[y],d=Math.abs(a.dispByRank[rank]),v=clamp(d/den);cells.push('<i class="'+(Math.abs(ky)<=4?'center':'')+'" style="--v:'+v+'" title="ky '+ky+' · rank '+rank+' · |shift| '+d.toFixed(2)+'"></i>')}
    body.innerHTML='<div class="v271-motion-timeline"><div class="v271-motion-key"><span>outer</span><b>phase-line acquisition vulnerability</b><span>center</span></div><div class="v271-motion-lines">'+cells.join('')+'</div></div><div class="v271-kpis"><div><small>Center-band mean</small><b>'+st.centerMean.toFixed(2)+' px</b></div><div><small>Outer mean</small><b>'+st.outerMean.toFixed(2)+' px</b></div><div><small>Center lines affected</small><b>'+st.centerAffected+' / '+st.centerN+'</b></div><div><small>Center acquired</small><b>rank '+a.centerRank+'</b></div></div>';
  }catch(e){}
}
function kspaceAnalysis(){
  const body=host('kspace','What does this mask retain—and create?');if(!body)return;
  try{
    const s=kspaceState(),masked=kspaceApplyMask(s),e=kspaceEnergyStats(masked),p=kspaceMaskPsf(masked);
    body.innerHTML=bars([['Samples retained',masked.retained,'Rough acquisition burden '+pct(masked.retained),'#52b7ff'],['Fourier energy retained',e.energyRetained,'Energy ≠ diagnostic importance','#ffd166'],['Center-band energy',e.centerRetained,'Broad structure proxy','#68e1b8'],['Outer-band energy',e.outerRetained,'Rapid spatial variation proxy','#9a83ff'],['Off-center mask response',p.sideRatio,'Side response '+pct(p.sideRatio),'#ff8f7d']])+'<div class="v271-callout"><b>Energy efficiency '+e.efficiency.toFixed(2)+'×</b><span>'+esc(kspaceModeSummary(s).meta)+' · mask half-peak support '+p.halfCount+' samples.</span></div>';
  }catch(e){}
}
function spatialAnalysis(){
  const body=host('spatial','Coverage problem or sampling problem?');if(!body)return;
  try{
    const s=spatialState(),m=spatialMetrics(s),copy=spatialTeachingCopy(s,m);
    const readRepair=m.readWrap?'increase read FOV':m.readPixel>1.12?'increase read samples or reduce read FOV':'read axis contained';
    const phaseRepair=m.phaseWrap?'increase phase FOV / anti-alias coverage':m.phasePixel>1.12?'increase phase samples or reduce phase FOV':'phase axis contained';
    body.innerHTML='<div class="v271-axis-grid"><div class="'+(m.readWrap?'warn':'')+'"><small>Read axis</small><b>'+(m.readWrap?'coverage-limited':'coverage contained')+'</b><span>FOV '+Math.round(s.readFov)+'% · pixel '+m.readPixel.toFixed(2)+'× · '+readRepair+'</span></div><div class="'+(m.phaseWrap?'warn':'')+'"><small>Phase axis</small><b>'+(m.phaseWrap?'coverage-limited':'coverage contained')+'</b><span>FOV '+Math.round(s.phaseFov)+'% · pixel '+m.phasePixel.toFixed(2)+'× · '+phaseRepair+'</span></div></div><div class="v271-callout"><b>'+esc(copy.short)+'</b><span>'+esc(copy.detail)+' Fewer samples change the grid; undersized FOV creates periodic wrap in this model.</span></div>';
  }catch(e){}
}
const ART_E={
 motion:{m:'replicas',f:'global',d:'phase',c:'whole'},wrap:{m:'foldover',f:'outside',d:'axis',c:'outside'},chem:{m:'boundary',f:'interface',d:'frequency',c:'orderly'},metal:{m:'distortion',f:'focal',d:'local',c:'irregular'},zipper:{m:'line',f:'global',d:'persistent',c:'system'},trunc:{m:'ringing',f:'edge',d:'sampling',c:'edge'},flow:{m:'replicas',f:'source',d:'phase',c:'pulsatile'},dielectric:{m:'shading',f:'broad',d:'none',c:'smooth'}
};
function artifactMatcher(){
  const body=host('artifact','Match the evidence before choosing the label','Evidence-driven matcher');if(!body)return;
  let box=body.querySelector('.v271-artifact-matcher');
  if(!box){box=document.createElement('div');box.className='v271-artifact-matcher';box.innerHTML='<div class="v271-matcher-controls"><label>Morphology<select data-e="m"><option value="">Any</option><option value="replicas">replicas / ghosts</option><option value="foldover">foldover</option><option value="boundary">bright-dark boundary</option><option value="distortion">focal distortion</option><option value="line">coherent line</option><option value="ringing">edge ringing</option><option value="shading">broad shading</option></select></label><label>Footprint<select data-e="f"><option value="">Any</option><option value="global">distributed / global</option><option value="outside">outside-FOV anatomy</option><option value="interface">fat-water interface</option><option value="focal">focal source</option><option value="edge">sharp edge</option><option value="source">vessel / CSF source</option><option value="broad">broad field</option></select></label><label>Direction behavior<select data-e="d"><option value="">Any</option><option value="phase">phase-related</option><option value="frequency">frequency-related</option><option value="axis">undersized encoded axis</option><option value="local">local B0 / non-axis</option><option value="persistent">persists across anatomy</option><option value="sampling">sampling-boundary</option><option value="none">not directional</option></select></label><label>Strongest clue<select data-e="c"><option value="">Any</option><option value="whole">whole-anatomy replicas</option><option value="outside">plausible outside-FOV anatomy</option><option value="orderly">orderly fat-water edge</option><option value="irregular">irregular local distortion</option><option value="system">system-like stripe</option><option value="edge">alternating bands at edge</option><option value="pulsatile">pulsatile source</option><option value="smooth">smooth shading</option></select></label></div><div class="v271-matcher-results"></div>';body.appendChild(box);box.querySelectorAll('select').forEach(s=>s.addEventListener('change',renderArtifactMatcher))}
  renderArtifactMatcher();
}
function renderArtifactMatcher(){
  const box=document.querySelector('.v271-artifact-matcher');if(!box)return;
  const evidence={};box.querySelectorAll('select').forEach(s=>evidence[s.dataset.e]=s.value);
  const active=Object.values(evidence).filter(Boolean).length,rows=Object.entries(ART_E).map(([id,p])=>{let hit=0,conf=0;for(const k of Object.keys(evidence)){if(!evidence[k])continue;p[k]===evidence[k]?hit++:conf++}return{id,hit,conf,score:active?hit/active:0}}).sort((a,b)=>b.score-a.score||a.conf-b.conf);
  const out=box.querySelector('.v271-matcher-results');if(!active){out.innerHTML='<div class="v271-empty"><b>Add one evidence clue</b><span>MRCC will rank artifact patterns without requiring you to choose the answer first.</span></div>';return}
  out.innerHTML=rows.slice(0,3).map((r,i)=>{const p=artifactProfile(r.id),a=artifacts[r.id];return '<button type="button" data-art-load="'+r.id+'" class="'+(i===0?'lead':'')+'"><small>'+(i===0?'Strongest evidence fit':'Alternate')+'</small><b>'+esc(a?.title||r.id)+' · '+Math.round(r.score*100)+'%</b><span>'+esc(p.discriminator)+'</span></button>'}).join('');
  out.querySelectorAll('[data-art-load]').forEach(b=>b.onclick=()=>{const sel=$('artifactSelect');if(sel){sel.value=b.dataset.artLoad;artifactLabUpdate();sel.scrollIntoView({behavior:'smooth',block:'center'})}});
}
function dnaMatrix(){
  try{
    const root=$('seqDnaAmbiguity');if(!root)return;let box=root.parentElement.querySelector('.v271-dna-matrix');if(!box){box=document.createElement('div');box.className='v271-dna-matrix';root.insertAdjacentElement('afterend',box)}
    const state=sequenceDnaState(),rank=sequenceDnaRank(state).slice(0,3),dims=['prep','echo','readout','output'];
    box.innerHTML='<div class="v271-analysis-head"><div><small>DNA evidence matrix</small><h3>Why the top families rank where they do</h3></div></div><div class="v271-dna-table"><div class="head"><b>Family</b>'+dims.map(d=>'<span>'+esc(sequenceDnaDimensions[d].label)+'</span>').join('')+'</div>'+rank.map(r=>'<div><b>'+esc(r.family.code)+'</b>'+dims.map(d=>{const v=state[d],any=v==='any',match=any||sequenceDnaProfiles[r.id][d]?.includes(v);return '<span class="'+(any?'neutral':match?'match':'miss')+'">'+(any?'—':match?'✓ ':'× ')+esc(any?'not set':sequenceDnaLabel(d,v))+'</span>'}).join('')+'</div>').join('')+'</div><p class="v271-footnote">'+esc(sequenceDnaDifferentiator(rank[0],rank[1]))+'</p>';
  }catch(e){}
}
function desc(id,text){const c=$(id);if(!c)return;let p=$(id+'V271Desc');if(!p){p=document.createElement('p');p.id=id+'V271Desc';p.className='sr-only';c.insertAdjacentElement('afterend',p);c.setAttribute('aria-describedby',p.id)}p.textContent=text}
function canvasDescriptions(){
  try{const s=motionState(),a=motionAcquire(s),st=motionLineStats(a);desc('motionHistoryCanvas','Motion '+s.mode+', '+s.amplitude+' pixel teaching amplitude, begins '+s.onset+' percent through acquisition. Center-band mean displacement '+st.centerMean.toFixed(2)+' pixels.')}catch(e){}
  try{const s=kspaceState(),m=kspaceApplyMask(s),e=kspaceEnergyStats(m);desc('ksKspaceCanvas',kspaceModeSummary(s).title+'. '+pct(m.retained)+' samples and '+pct(e.energyRetained)+' Fourier energy retained.')}catch(e){}
  try{const s=spatialState(),m=spatialMetrics(s),c=spatialTeachingCopy(s,m);desc('spReconCanvas',c.title+'. Read relative pixel width '+m.readPixel.toFixed(2)+' times baseline; phase relative pixel width '+m.phasePixel.toFixed(2)+' times baseline.')}catch(e){}
  try{const s=artifactLabState(),p=artifactProfile(s.mode);desc('artifactCanvas',p.pattern+'. '+p.footprint+'. '+p.directionLogic+'.')}catch(e){}
}
let raf=0;function renderDeep(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{parameterAnalysis();contrastAnalysis();timingAnalysis();motionAnalysis();kspaceAnalysis();spatialAnalysis();artifactMatcher();dnaMatrix();canvasDescriptions()})}
function controlReading(el){
  if(!el)return'';
  if(el.tagName==='SELECT')return el.selectedOptions?.[0]?.textContent?.trim()||el.value||'';
  const row=el.closest('.sliderline,.contrast-slider,.timing-slider,.motion-slider,.kspace-slider,.spatial-slider,.artifact-lab-slider,.field');
  const out=row?.querySelector('output');
  if(out?.textContent?.trim())return out.textContent.trim();
  return String(el.value??'').trim();
}
const IMPACT_TARGETS={
  sbFov:['#sbRes','#sbVoxel','#sbSnr','#mapDetail','#mapSnr'],sbFreq:['#sbRes','#sbVoxel','#sbSnr','#mapDetail','#mapSnr'],sbPhase:['#sbRes','#sbVoxel','#sbSnr','#sbTime','#mapDetail','#mapSnr','#mapTime'],sbPhaseFov:['#sbRes','#sbVoxel','#sbSnr','#mapDetail','#mapSnr'],sbSlice:['#sbVoxel','#sbSnr','#mapSnr'],sbNex:['#sbSnr','#sbTime','#mapSnr','#mapTime'],sbBw:['#sbSnr','#mapSnr'],sbEtl:['#sbTime','#mapTime'],sbAccel:['#sbSnr','#sbTime','#mapSnr','#mapTime'],sbPf:['#sbTime','#mapTime'],
  clMode:['#contrastMaterials','.contrast-summary','.contrast-timeline'],clTr:['#contrastMaterials','#clSpread','.contrast-timeline'],clTe:['#contrastMaterials','#clSpread','.contrast-timeline'],clTi:['#contrastMaterials','#clSpread','.contrast-timeline'],
  timingTr:['#timingFitBadge','#timingTimeCard','.timing-timeline'],timingFirstEcho:['#timingEffectiveTe','#timingTrainSpan','.timing-timeline'],timingSpacing:['#timingEffectiveTe','#timingTrainSpan','.timing-timeline'],timingEtl:['#timingTrainSpan','#timingTrainCount','#timingTimeProxy','.timing-timeline'],timingCenter:['#timingEffectiveTe','.timing-timeline'],timingPhase:['#timingTrainCount','#timingTimeProxy'],timingNex:['#timingTimeProxy'],
  motionMode:['#motionResultCanvas','.motion-history','.motion-summary'],motionDirection:['#motionResultCanvas','#motionCenterShift'],motionOrder:['#motionResultCanvas','.motion-history','#motionCenterSummary'],motionAmplitude:['#motionResultCanvas','.motion-history','#motionAffected','#motionPeak'],motionOnset:['#motionResultCanvas','.motion-history','#motionAffected','#motionCenterShift'],motionCycles:['#motionResultCanvas','.motion-history','#motionAffected'],
  ksMode:['#ksKspaceCanvas','#ksImageCanvas','.kspace-readouts'],ksAmount:['#ksKspaceCanvas','#ksImageCanvas','.kspace-readouts'],
  spPhaseFov:['#spWorldCanvas','#spReconCanvas','#spatialWrapCue','#spatialPixelProxy'],spReadFov:['#spWorldCanvas','#spReconCanvas','#spatialWrapCue','#spatialPixelProxy'],spPhaseSamples:['#spReconCanvas','#spatialPixelProxy','#spatialSampleBurden'],spReadSamples:['#spReconCanvas','#spatialPixelProxy','#spatialSampleBurden'],
  artifactSelect:['#artifactCanvas','#artifactVisualCue','#artifactVisualBadge'],artifactStrength:['#artifactCanvas','#artifactVisualCue'],artifactDirection:['#artifactCanvas','#artifactPhaseLabel']
};
function impactBox(node){
  if(!node)return null;
  if(node.matches('canvas'))return node.closest('.kspace-canvas-shell,.spatial-canvas-shell,.motion-image-shell,.artifact-canvas-shell,.contrast-curve-panel')||node;
  return node.closest('.comparecard,.balance-row,.artifact-lab-readout,.contrast-summary>div,.timing-summary>div,.motion-summary>div,.kspace-readouts>div,.spatial-readouts>div,.card,.contrast-timeline,.motion-history')||node;
}
function flashControlImpacts(control){
  if(!control)return;
  const row=control.closest('.sliderline,.contrast-slider,.timing-slider,.motion-slider,.kspace-slider,.spatial-slider,.artifact-lab-slider,.contrast-field,.timing-field,.motion-field,.kspace-field,.spatial-field,.artifact-lab-field,.field');
  if(row){row.classList.add('control-causing-change');clearTimeout(row.__mrccImpact);row.__mrccImpact=setTimeout(()=>row.classList.remove('control-causing-change'),420)}
  const selectors=IMPACT_TARGETS[control.id]||[];
  selectors.forEach(sel=>document.querySelectorAll(sel).forEach(n=>{const box=impactBox(n);if(!box)return;box.classList.add('consequence-highlight');clearTimeout(box.__mrccImpact);box.__mrccImpact=setTimeout(()=>box.classList.remove('consequence-highlight'),520)}));
}
function noteControlChange(e){
  const m=CONTROL_MAP[e.target?.id];if(!m)return;
  const lab=m[0],now=labResultSnapshot(lab);proofTouch(lab,e.target.id);
  lastChange[lab]=m[1];
  window.__mrccLastChange={lab,label:m[1],value:controlReading(e.target),previous:interactionBase?.lab===lab&&interactionBase.controlId===e.target.id?interactionBase.controlValue:''};
  const deltaText=applyInteractionDelta(lab,now,e.type==='change');
  requestAnimationFrame(()=>paintInteractionDelta(lab,deltaText));
  flashControlImpacts(e.target);
  renderDeep();
}
function relocateDiagnostics(){const adv=document.querySelector('.v27-advanced-settings-grid'),sys=$('offlineBar');if(adv&&sys&&!adv.contains(sys)){const wrap=document.createElement('div');wrap.className='v271-diagnostics';wrap.innerHTML='<h4>System & offline diagnostics</h4><p>Cache, network, runtime self-checks, and offline status.</p>';wrap.appendChild(sys);adv.appendChild(wrap)}}
document.addEventListener('pointerdown',e=>{
  if(!document.body.classList.contains('lab-stage-mode'))return;
  const target=e.target.closest('input,select,button');if(!target||target.closest('.v27-lab-switcher'))return;
  const mapped=CONTROL_MAP[target.id],lab=mapped?.[0]||labForElement(target);if(!lab)return;
  interactionBase={lab,snapshot:labResultSnapshot(lab),controlId:target.id||'',controlValue:controlReading(target)};
},{passive:true});
document.addEventListener('focusin',e=>{
  if(!document.body.classList.contains('lab-stage-mode'))return;
  const target=e.target.closest?.('input,select,button');if(!target||target.closest('.v27-lab-switcher'))return;
  const mapped=CONTROL_MAP[target.id],lab=mapped?.[0]||labForElement(target);if(!lab||interactionBase?.lab===lab)return;
  interactionBase={lab,snapshot:labResultSnapshot(lab),controlId:target.id||'',controlValue:controlReading(target)};
},{passive:true});
document.addEventListener('input',noteControlChange,{passive:true});
document.addEventListener('change',e=>{noteControlChange(e);const m=CONTROL_MAP[e.target?.id];if(m)interactionBase=null},{passive:true});
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||!document.body.classList.contains('lab-stage-mode')||b.closest('.v27-lab-switcher,.v281-lab-guide,.v282-lab-proof'))return;
  const lab=labForElement(b);if(!lab)return;
  const label=(b.querySelector('b')?.textContent||b.textContent||'Lab action').replace(/\s+/g,' ').trim().slice(0,64);
  if(/reset/i.test(label)){setTimeout(()=>proofRestart(lab),0)}
  else proofTouch(lab,'action:'+label);
  requestAnimationFrame(()=>{const now=labResultSnapshot(lab);applyInteractionDelta(lab,now,true);interactionBase=null;renderDeep();proofRender(lab)});
},{passive:true});
requestAnimationFrame(()=>Object.keys(LAB_SECTION).forEach(lab=>{const snap=labResultSnapshot(lab);if(snap)resultSnapshots[lab]=snap}));
const oldRender=window.renderSequenceDna;if(typeof oldRender==='function')window.renderSequenceDna=function(){const r=oldRender.apply(this,arguments);requestAnimationFrame(dnaMatrix);return r};
function boot(){document.documentElement.dataset.mrccRelease='28.1';relocateDiagnostics();proofBoot();renderDeep();setTimeout(()=>{renderDeep();Object.keys(PROOF_TASKS).forEach(proofRender)},120);setTimeout(renderDeep,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
;(()=>{'use strict';
function sfRange(el){if(!el||el.type!=='range')return;const a=Number(el.min||0),b=Number(el.max||100),v=Number(el.value||0),p=b>a?((v-a)/(b-a))*100:0;el.style.setProperty('--sf-fill',Math.max(0,Math.min(100,p))+'%')}
function sfRefresh(){document.querySelectorAll('input[type="range"]').forEach(sfRange);document.querySelectorAll('.card,.lab-home-card,.seqfam-family,.premium-card,.v271-analysis,.pref-card').forEach(el=>{if(el.dataset.sfReactive)return;el.dataset.sfReactive='1';el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--sf-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');el.style.setProperty('--sf-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true});el.addEventListener('pointerleave',()=>{el.style.setProperty('--sf-x','50%');el.style.setProperty('--sf-y','0%')},{passive:true})})}
document.addEventListener('input',e=>{if(e.target?.type==='range')sfRange(e.target)},{passive:true});
document.addEventListener('change',e=>{if(e.target?.type==='range')sfRange(e.target)},{passive:true});
const sfObs=new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))requestAnimationFrame(sfRefresh)});
function sfBoot(){document.documentElement.dataset.mrccRelease='28.1';sfRefresh();sfObs.observe(document.body,{subtree:true,childList:true});setTimeout(sfRefresh,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sfBoot,{once:true});else sfBoot();
})();
;(()=>{'use strict';
const pulseTargets='.comparecard,.kpi,.result,.state,.v27-intel-cell,.v271-analysis,.contrast-summary,.timing-summary,.motion-summary>div,.kspace-readouts>div,.spatial-axis-card';
function sfPulse(el){if(!el)return;el.classList.remove('sf-updated');void el.offsetWidth;el.classList.add('sf-updated');setTimeout(()=>el.classList.remove('sf-updated'),520)}
function sfWakeFromControl(control){
  const section=control.closest('.section');if(!section)return;
  const near=control.closest('.card')||section;
  const output=control.parentElement?.querySelector('output')||control.closest('.field,.sliderline,.contrast-slider,.timing-slider,.motion-slider,.kspace-slider,.spatial-slider,.artifact-lab-slider')?.querySelector('output');
  sfPulse(output||near);
  if(document.body.classList.contains('lab-stage-mode'))return;
  const visible=section.querySelectorAll(pulseTargets);for(let i=0;i<Math.min(visible.length,3);i++)sfPulse(visible[i]);
}
document.addEventListener('input',e=>{if(e.target?.matches('input[type="range"],input[type="number"]'))requestAnimationFrame(()=>sfWakeFromControl(e.target))},{passive:true});
document.addEventListener('change',e=>{if(e.target?.matches('select,input[type="checkbox"],input[type="radio"]'))requestAnimationFrame(()=>sfWakeFromControl(e.target))},{passive:true});
})();