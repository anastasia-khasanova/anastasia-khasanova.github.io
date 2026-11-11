const holder=document.querySelector('.desktop-holder');
const canvas=document.querySelector('.desktop-canvas');
function fit(){const scale=Math.min(1924,document.documentElement.clientWidth)/1924;holder.style.height=15020*scale+'px';const header=document.querySelector('.desktop-case-header');holder.style.marginTop=(header.getBoundingClientRect().height+40-212*scale)+'px';canvas.style.zoom=scale;canvas.style.transform='none';document.querySelectorAll('.mobile-visual').forEach(el=>{const s=el.clientWidth/Number(el.dataset.width);el.style.height=Number(el.dataset.height)*s+'px';el.firstElementChild.style.zoom=s;el.firstElementChild.style.transform='none';});}
fit();new ResizeObserver(fit).observe(document.body);
const back=document.querySelector('.back-top');window.addEventListener('scroll',()=>back.classList.toggle('visible',window.scrollY>600),{passive:true});back.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
// Related cases do not yet have URLs. Keep their preview cards actionable and explicit.
document.querySelectorAll('[data-node-id="409:14427"],[data-node-id="409:14428"],[data-node-id="409:14429"]').forEach((el,i)=>{el.tabIndex=0;el.role='button';el.ariaLabel=['Открыть другой проект: персонаж','Открыть другой проект: Open Hours','Открыть другой проект: Visual Identity'][i%3];el.style.cursor='pointer';function open(){document.querySelector('#project-dialog').showModal();}el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});
const dialog=document.querySelector('#project-dialog');document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
// This is a case illustration, not a live memory browser: remove export-only inert controls.
document.querySelectorAll('[data-name="Switcher-2"]').forEach(el=>{el.tabIndex=-1;el.setAttribute('aria-hidden','true');el.style.pointerEvents='none';});

const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
const mediaObserver=new IntersectionObserver(entries=>entries.forEach(({target:video,isIntersecting})=>{
 if(isIntersecting&&!reducedMotion.matches&&!video.dataset.userPaused)video.play().catch(()=>{});
 else video.pause();
}),{threshold:.05});
document.querySelectorAll('.case-video').forEach(video=>{
 video.muted=true;mediaObserver.observe(video);
 const toggle=video.nextElementSibling;
 const mediaSection=video.closest('.design-section,.mobile-visual');
 if(mediaSection)mediaSection.appendChild(toggle);
 function label(){toggle.replaceChildren();const icon=document.createElement('span');icon.className=video.paused?'play-icon':'pause-icon';icon.setAttribute('aria-hidden','true');toggle.appendChild(icon);toggle.setAttribute('aria-label',video.paused?'Воспроизвести видео':'Приостановить видео');toggle.title=toggle.getAttribute('aria-label');}
 video.addEventListener('play',label);video.addEventListener('pause',label);
 toggle.addEventListener('click',()=>{if(video.paused){delete video.dataset.userPaused;video.play().catch(()=>{});}else{video.dataset.userPaused='1';video.pause();}label();});
 if(reducedMotion.matches)video.pause();label();
});
// Each illustration starts its shared 15-second timeline when entering view.
const animatedSections=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
 target.classList.toggle('is-in-view',isIntersecting);
}),{threshold:.05});
document.querySelectorAll('.design-section,.mobile-visual').forEach(section=>animatedSections.observe(section));

// Scrub the complete native timeline with its circular handle, then resume it.
for(const section of document.querySelectorAll('.design-section.s12,.mobile-visual:has([data-node-id="385:7286"])')){
 const circle=section.querySelector('[data-node-id="385:7286"]');if(!circle)continue;
 const handle=document.createElement('button');handle.type='button';handle.className='timeline-drag-handle';
 handle.setAttribute('aria-label','Перемещать по хронологии');handle.setAttribute('role','slider');handle.setAttribute('aria-valuemin','0');handle.setAttribute('aria-valuemax','100');handle.setAttribute('aria-valuenow','0');
 handle.innerHTML='<span></span><span></span>';circle.appendChild(handle);
 let active=null;
 const animations=()=>section.getAnimations({subtree:true}).filter(a=>!handle.contains(a.effect?.target));
 function seek(t){for(const a of active.animations)a.currentTime=t;active.time=t;handle.setAttribute('aria-valuenow',String(Math.round(t/300)));}
 function start(){
  const list=animations(),time=(Number(list[0]?.currentTime)||0)%30000;
  const states=list.map(a=>a.playState);list.forEach(a=>a.pause());
  active={animations:list,states,time,samples:[]};
  for(let i=0;i<=240;i++){const t=i*125;seek(t);const r=handle.getBoundingClientRect();active.samples.push({t,x:r.left+r.width/2});}
  seek(time);section.classList.add('timeline-is-dragging');
 }
 function finish(){if(!active)return;const saved=active;active=null;section.classList.remove('timeline-is-dragging');saved.animations.forEach((a,i)=>{if(saved.states[i]==='running'&&!reducedMotion.matches)a.play();});}
 handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();start();handle.setPointerCapture(e.pointerId);});
 handle.addEventListener('pointermove',e=>{
  if(!active)return;let best=null;
  for(let i=1;i<active.samples.length;i++){
   const a=active.samples[i-1],b=active.samples[i],dx=b.x-a.x;if(Math.abs(dx)<.01)continue;
   const f=Math.max(0,Math.min(1,(e.clientX-a.x)/dx)),x=a.x+dx*f,t=a.t+(b.t-a.t)*f;
   const score=Math.abs(x-e.clientX)+Math.abs(t-active.time)*.00001;
   if(!best||score<best.score)best={score,t};
  }
  if(best)seek(best.t);
 });
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);
 handle.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();start();seek(Math.max(0,Math.min(29999,active.time+(e.key==='ArrowRight'?400:-400))));finish();});
}

// Hide the floating navigation control while the footer is on screen.
(() => {
 const footer=document.querySelector('.case-footer'),button=document.querySelector('.back-top');
 if(!footer||!button)return;
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>button.classList.toggle('footer-hidden',entries[0].isIntersecting),{threshold:0}).observe(footer);
 else {const sync=()=>button.classList.toggle('footer-hidden',footer.getBoundingClientRect().top<innerHeight);addEventListener('scroll',sync,{passive:true});sync();}
})();
