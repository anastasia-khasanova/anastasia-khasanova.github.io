(() => {
const ipad=window.portfolioIPad===true;
const data=[
{title:'Иммерсивный интерфейс памяти',category:'product',src:'assets/dome-portfolio-smooth.mp4',href:'memory.html'},
{title:'Редактор генетического кода ребёнка',category:'product',scene:'genome',href:'genome.html'},
{title:'Мобильная система контроля зоопарка',category:'product',src:'assets/zoo-case/video/keeper-portfolio-fit-timeline.mp4',href:'zoo.html'},
{title:'Концептуальный сайт wellness-студии',category:'web',src:'assets/fitness-hero-smooth.mp4'},
{title:'Визуальная айдентика для фестиваля',category:'branding',scene:'festival',href:'https://www.behance.net/gallery/187540721/Visual-identity-for-festival'}];
const filterGroup=document.querySelector('.filters');
const categoryLabels={all:'All',product:'Product',web:'Web',branding:'Branding'};
const categories=['all',...new Set([...Object.keys(categoryLabels).filter(key=>key!=='all'),...data.map(p=>p.category)])];
filterGroup.replaceChildren();categories.forEach(category=>{const b=document.createElement('button');b.type='button';b.dataset.filter=category;const label=categoryLabels[category]||category.charAt(0).toUpperCase()+category.slice(1);b.textContent=label;const count=data.filter(p=>category==='all'||p.category===category).length;const total=document.createElement('sup');total.className='filter-count';total.textContent=String(count);b.append(total);b.setAttribute('aria-label',label+': '+count);b.setAttribute('aria-pressed',String(category==='all'));filterGroup.append(b);});
const genome=document.querySelector('.genome-preview');if(ipad)genome.src='genome-preview-ipad.html';genome.addEventListener('load',()=>syncGenome());
function syncGenome(){const active=data[selected]?.scene==='genome';genome.classList.toggle('is-active',active);genome.contentWindow.postMessage({type:'genome-play',active:active&&!document.hidden&&!motion.matches},location.origin);}
const festival=document.querySelector('.festival-preview');festival.addEventListener('load',()=>festival.contentWindow.postMessage({type:'festival-play',active:data[selected]?.scene==='festival'&&!document.hidden&&!motion.matches},location.origin));
const videos=[...document.querySelectorAll('.showreel-video')],rows=[...document.querySelectorAll('.work-row')],filters=[...document.querySelectorAll('[data-filter]')],dialog=document.querySelector('#coming-soon');
const motion=matchMedia('(prefers-reduced-motion: reduce)');let selected=0,filter='all',front=0,timer=null,paused=motion.matches,revision=0;
// First preview is 7.33s; leave 1.13s for the outgoing crossfade before it loops.
const slideDuration=6200;let rowProgress=null;
rows.forEach(row=>{const fill=document.createElement('span');fill.className='work-progress';fill.setAttribute('aria-hidden','true');row.prepend(fill);});
const matching=()=>data.map((p,i)=>i).filter(i=>filter==='all'||data[i].category===filter);
function schedule(){
 clearTimeout(timer);rowProgress?.cancel();rowProgress=null;
 const fill=rows[selected].querySelector('.work-progress');
 const duration=slideDuration;
 if(!paused&&!document.hidden&&matching().length>1){
  rowProgress=fill.animate?.([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'linear',fill:'forwards'});
  timer=setTimeout(()=>select(next(1)),duration);
 }else if(matching().length===1||motion.matches){fill.style.transform='scaleX(1)';}
} 
function next(direction){const ids=matching();return ids[(ids.indexOf(selected)+direction+ids.length)%ids.length];}
const fadeTimers=new WeakMap();
function pauseLater(v){clearTimeout(fadeTimers.get(v));fadeTimers.set(v,setTimeout(()=>{if(!v.classList.contains('is-active')||data[selected].scene)v.pause();},1050));}
function select(index){
 if(index===selected)return;
 selected=index;const p=data[index];rows.forEach((r,i)=>r.setAttribute('aria-pressed',String(i===index)));
 const list=document.querySelector('.work-list'),row=rows[index];
 if(list.clientHeight&&list.scrollTo){const top=row.offsetTop,bottom=top+row.offsetHeight;if(top<list.scrollTop)list.scrollTo({top,behavior:motion.matches?'instant':'smooth'});else if(bottom>list.scrollTop+list.clientHeight)list.scrollTo({top:bottom-list.clientHeight,behavior:motion.matches?'instant':'smooth'});}
 document.querySelector('.active-title').textContent=p.title;document.querySelector('.active-category').textContent=((categoryLabels[p.category]||p.category).toUpperCase()+' DESIGN');
 const still=document.querySelector('.showreel-image');
 document.body.dataset.preview=p.scene||'';syncGenome();festival.classList.toggle('is-active',p.scene==='festival');festival.contentWindow.postMessage({type:'festival-play',active:p.scene==='festival'&&!document.hidden&&!motion.matches},location.origin);
 if(p.scene){revision++;videos.forEach(pauseLater);still.classList.remove('is-active');schedule();return;}
 if(p.image){revision++;videos.forEach(pauseLater);still.src=p.image;still.classList.add('is-active');schedule();return;}
 if(ipad){
  const target=videos[1-front],previous=videos[front],ticket=++revision;
  const posters={0:'assets/dome-portfolio-clean-poster.png',2:'assets/zoo-case/video/keeper-fit-timeline-poster.png'};
  target.oncanplay=null;target.onloadeddata=null;target.onplaying=null;
  clearTimeout(fadeTimers.get(target));
  target.muted=true;target.defaultMuted=true;target.playsInline=true;
  target.poster=posters[index]||'';
  if(target.poster){still.src=target.poster;still.classList.add('is-active');}else still.classList.remove('is-active');
  // Make the new video visible before requesting playback: WebKit may suspend hidden media.
  previous.classList.remove('is-active');target.classList.add('is-active');front=videos.indexOf(target);
  target.src=p.src;
  function play(){if(ticket===revision&&!paused&&!document.hidden&&!motion.matches)target.play().catch(()=>{});}
  function decoded(){if(ticket!==revision)return;still.classList.remove('is-active');play();}
  target.onloadeddata=decoded;target.oncanplay=play;target.onplaying=()=>{if(ticket===revision)still.classList.remove('is-active');};
  target.load();play();previous.pause();schedule();return;
 }
 const target=videos[1-front],previous=videos[front],ticket=++revision;
 target.oncanplay=null;target.src=p.src;target.load();
 function reveal(){if(ticket!==revision)return;target.oncanplay=null;clearTimeout(fadeTimers.get(target));still.classList.remove('is-active');target.classList.add('is-active');previous.classList.remove('is-active');if(!paused&&!document.hidden&&!motion.matches)target.play().catch(()=>{});else target.pause();pauseLater(previous);front=videos.indexOf(target);}
 function ready(){target.oncanplay=null;if(ticket!==revision)return;clearTimeout(fadeTimers.get(target));if(!paused&&!document.hidden&&!motion.matches){target.play().then(()=>{if(target.requestVideoFrameCallback)target.requestVideoFrameCallback(reveal);else requestAnimationFrame(reveal);}).catch(reveal);}else reveal();}
 target.oncanplay=ready;if(target.readyState>=3)ready();schedule();
}
rows.forEach((row,i)=>{row.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&i!==selected)select(i);});row.addEventListener('focus',()=>{if(i!==selected)select(i);});row.addEventListener('click',()=>{select(i);if(!data[i].href&&!data[i].previewOnly){dialog.querySelector('h2').textContent=data[i].title;dialog.showModal();}});});
filters.forEach(b=>b.addEventListener('click',()=>{
 filter=b.dataset.filter;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 rows.forEach((r,i)=>r.hidden=filter!=='all'&&data[i].category!==filter);
 const ids=matching();document.querySelector('.work-empty').hidden=ids.length>0;document.querySelector('.active-project').hidden=ids.length===0;
 if(ids.length&&!ids.includes(selected))select(ids[0]);else schedule();
}));
// Accent the scrollbar only while its list is moving.
const scrollList=document.querySelector('.work-list');let scrollQuietTimer=null;
scrollList.addEventListener('scroll',()=>{scrollList.classList.add('is-scrolling');clearTimeout(scrollQuietTimer);scrollQuietTimer=setTimeout(()=>scrollList.classList.remove('is-scrolling'),650);},{passive:true});
// Drag the category strip without accidentally activating a tab.
let drag=null,suppressClick=false;
filterGroup.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,scroll:filterGroup.scrollLeft,moved:false};suppressClick=false;});
filterGroup.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)>5){drag.moved=true;filterGroup.setPointerCapture(e.pointerId);filterGroup.classList.add('is-dragging');}if(drag.moved){e.preventDefault();filterGroup.scrollLeft=drag.scroll-dx;}});
function endCategoryDrag(e){if(!drag||drag.id!==e.pointerId)return;suppressClick=drag.moved;drag=null;filterGroup.classList.remove('is-dragging');if(filterGroup.hasPointerCapture(e.pointerId))filterGroup.releasePointerCapture(e.pointerId);}
filterGroup.addEventListener('pointerup',endCategoryDrag);filterGroup.addEventListener('pointercancel',endCategoryDrag);filterGroup.addEventListener('lostpointercapture',()=>{drag=null;filterGroup.classList.remove('is-dragging');});filterGroup.addEventListener('pointerleave',e=>{if(drag&&!drag.moved)drag=null;});
filterGroup.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.addEventListener('visibilitychange',()=>{syncGenome();festival.contentWindow.postMessage({type:'festival-play',active:data[selected].scene==='festival'&&!document.hidden&&!motion.matches},location.origin);videos.forEach(v=>v.pause());if(!data[selected].image&&!data[selected].scene&&!paused&&!document.hidden&&!motion.matches)videos[front].play().catch(()=>{});schedule();});
motion.addEventListener('change',()=>{paused=motion.matches;syncGenome();festival.contentWindow.postMessage({type:'festival-play',active:data[selected].scene==='festival'&&!document.hidden&&!paused},location.origin);if(paused)videos.forEach(v=>v.pause());else if(!data[selected].image&&!data[selected].scene)videos[front].play().catch(()=>{});schedule();});
if(ipad){
 function resume(){if(!data[selected].scene&&!data[selected].image&&!paused&&!document.hidden&&!motion.matches)videos[front].play().catch(()=>{});syncGenome();}
 document.addEventListener('pointerdown',resume,{passive:true});addEventListener('pageshow',resume);addEventListener('ipadviewport',resume);
 videos.forEach(v=>{v.defaultMuted=true;v.muted=true;v.playsInline=true;});
}
schedule();
})();
