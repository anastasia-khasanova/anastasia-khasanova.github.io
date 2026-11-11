(()=>{
const captions={route:'<span>В режиме «Маршрут памяти»</span> (по умолчанию) шкала года зафиксирована. Интерфейс отмечает пройденный маршрут между воспоминаниями, позволяя видеть пройденный путь и сохранять таймлайн исходного года.',jump:'<span>В режиме «Прыжок во времени»</span> навигация переключается на новый период. Например, при клике на событие из 2015 года, находясь в 2022-м, старый маршрут стирается, а шкала автоматически перестраивается под 2015 год.'};
for(const root of document.querySelectorAll('.mode-instructions')){
 let visible=false;
 const panels=[...root.querySelectorAll('.instruction-panel')],tabs=[...root.querySelectorAll('[data-mode-tab]')];
 const updatePlayback=()=>{for(const panel of panels){const video=panel.querySelector('video');video.muted=true;if(!panel.hidden&&visible&&!matchMedia('(prefers-reduced-motion:reduce)').matches)video.play().catch(()=>{});else video.pause();for(const a of panel.getAnimations({subtree:true}))a.pause();}};
 function select(mode){
  root.dataset.mode=mode;
  for(const panel of panels){const active=panel.dataset.instruction===mode;panel.hidden=!active;panel.inert=!active;if(active){panel.querySelector('video').currentTime=0;for(const a of panel.getAnimations({subtree:true}))a.currentTime=0;}}
  for(const tab of tabs){const active=tab.dataset.modeTab===mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  root.querySelector('.instruction-caption').innerHTML=captions[mode];
  updatePlayback();root.dispatchEvent(new CustomEvent('instruction-mode-change',{detail:{mode}}));
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab.dataset.modeTab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;tabs[next].focus();select(tabs[next].dataset.modeTab);});});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updatePlayback();root.classList.toggle('instruction-is-visible',visible);},{threshold:.15}).observe(root);
 for(const panel of panels){const video=panel.querySelector('video');video.addEventListener('error',()=>{panel.classList.add('instruction-video-unavailable');video.pause();});}
 select('route');

}
})();
