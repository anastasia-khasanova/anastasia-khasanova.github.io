// Match homepage covers; animate only the hovered or keyboard-focused card.
(()=>{
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 const items=[...document.querySelectorAll('.case-cover video,.case-cover iframe')];
 const visible=new Set(),hovered=new Set();
 function active(el){const card=el.closest('a');return visible.has(el)&&(hovered.has(el)||card.matches(':focus-visible'))&&!document.hidden&&!motion.matches;}
 function sync(el){el.closest('.case-cover').classList.toggle('is-active',visible.has(el)&&(hovered.has(el)||el.closest('a').matches(':focus-visible'))&&!document.hidden);const play=active(el);if(el.tagName==='IFRAME'){el.contentWindow.postMessage({type:el.dataset.coverScene+'-play',active:play},location.origin);}else if(play){el.play().then(()=>{if(!active(el))el.pause();}).catch(()=>{});}else el.pause();}
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting)visible.add(target);else visible.delete(target);sync(target);}),{threshold:.05});
 items.forEach(el=>{
  const card=el.closest('a');observer.observe(el);el.addEventListener('load',()=>sync(el));
  card.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;hovered.add(el);sync(el);});
  card.addEventListener('pointerleave',()=>{hovered.delete(el);sync(el);});
  card.addEventListener('pointercancel',()=>{hovered.delete(el);sync(el);});
  card.addEventListener('focus',()=>sync(el));card.addEventListener('blur',()=>sync(el));
 });
 document.addEventListener('visibilitychange',()=>items.forEach(sync));motion.addEventListener('change',()=>items.forEach(sync));
})();
