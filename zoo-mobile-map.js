/* One phone on mobile: the existing enclosure card slides over the existing live map. */
(()=>{
 const node=id=>document.querySelector('[data-node-id="'+id+'"]'),screen=node('898:11117'),sheet=node('898:11149'),handle=node('898:11249'),map=node('898:9927');
 if(!screen||!sheet||!handle||!map)return;
 const media=matchMedia('(max-width:1024px)'),mapTab=node('I898:11250;47:3845;167:741'),enclosureTab=node('I898:11250;47:3845;167:742');
 const navbar=node('898:11250'),navbarWasInert=navbar.inert;
 let open=false,gesture=null,ignoreClickUntil=0;
 const saved=new Map([handle,mapTab,enclosureTab].map(el=>[el,['role','tabindex','aria-label','aria-pressed','aria-disabled'].map(a=>[a,el.getAttribute(a)])]));
 function clearDrag(){gesture=null;sheet.style.removeProperty('--sheet-drag');sheet.classList.remove('is-sheet-dragging');}
 function setOpen(value,focus=false){
  if(!media.matches)return;open=value;clearDrag();screen.dataset.mobileView=open?'enclosure':'map';sheet.inert=!open;sheet.setAttribute('aria-hidden',String(!open));
  map.inert=open;map.setAttribute('aria-hidden',String(open));mapTab.setAttribute('aria-pressed',String(!open));enclosureTab.setAttribute('aria-pressed',String(open));
  if(open){sheet.scrollTop=0;if(focus)handle.focus({preventScroll:true});}else if(focus)map.focus({preventScroll:true});
 }
 function activate(el,label,fn){el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',label);el.addEventListener('click',()=>{if(media.matches&&performance.now()>ignoreClickUntil)fn();});el.addEventListener('keydown',e=>{if(media.matches&&(e.key==='Enter'||e.key===' ')){e.preventDefault();fn();}});}
 activate(handle,'Закрыть карточку вольера и вернуться к карте',()=>setOpen(false,true));

 function sync(){
  if(media.matches){navbar.inert=true;activateAttributes();setOpen(false);}
  else{navbar.inert=navbarWasInert;open=false;clearDrag();delete screen.dataset.mobileView;sheet.inert=false;map.inert=false;sheet.removeAttribute('aria-hidden');map.removeAttribute('aria-hidden');for(const[el,attrs]of saved)for(const[a,v]of attrs)if(v===null)el.removeAttribute(a);else el.setAttribute(a,v);}
 }
 function activateAttributes(){handle.setAttribute('role','button');handle.tabIndex=0;handle.setAttribute('aria-label','Закрыть карточку вольера и вернуться к карте');for(const el of [mapTab,enclosureTab]){el.tabIndex=-1;el.setAttribute('aria-disabled','true');}}

 function start(x,y,target,id){
  if(!media.matches||!open||(!handle.contains(target)&&(sheet.scrollTop>1||target.closest('button,input,select,textarea,a,[role="button"]'))))return;
  gesture={id,x,y,dy:0,scale:402/Math.max(1,sheet.getBoundingClientRect().width),time:performance.now(),target};
 }
 function drag(x,y,event){if(!gesture)return;const dx=x-gesture.x,dy=y-gesture.y;if(Math.abs(dx)>Math.max(10,Math.abs(dy))){clearDrag();return;}if(dy>8){event.preventDefault();gesture.dy=dy;sheet.classList.add('is-sheet-dragging');sheet.style.setProperty('--sheet-drag',dy*gesture.scale+'px');}}
 function finish(cancel=false){if(!gesture)return;const close=!cancel&&gesture.dy>56;clearDrag();if(close){ignoreClickUntil=performance.now()+400;setOpen(false,true);}}
 sheet.addEventListener('pointerdown',e=>{if(e.button!==0||(e.pointerType==='touch'&&!handle.contains(e.target)))return;start(e.clientX,e.clientY,e.target,e.pointerId);if(gesture)sheet.setPointerCapture(e.pointerId);});
 sheet.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId)drag(e.clientX,e.clientY,e);});sheet.addEventListener('pointerup',e=>{if(gesture?.id===e.pointerId)finish();});sheet.addEventListener('pointercancel',()=>finish(true));
 sheet.addEventListener('touchstart',e=>{if(handle.contains(e.target)||e.touches.length!==1)return;const t=e.touches[0];start(t.clientX,t.clientY,e.target,'touch');},{passive:true});
 sheet.addEventListener('touchmove',e=>{if(gesture?.id==='touch'&&e.touches.length===1){const t=e.touches[0];drag(t.clientX,t.clientY,e);}},{passive:false});sheet.addEventListener('touchend',()=>{if(gesture?.id==='touch')finish();});sheet.addEventListener('touchcancel',()=>finish(true));
 screen.addEventListener('keydown',e=>{if(e.key==='Escape'&&media.matches&&open){e.preventDefault();setOpen(false,true);}});
 window.addEventListener('zoo:enclosure-selected',()=>setOpen(true,true));window.addEventListener('zoo:responsive',sync);sync();
})();
