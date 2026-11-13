/* Panning the original map in the Map/List preview, at any page zoom or breakpoint. */
(()=>{
 const find=id=>document.querySelector('[data-node-id="'+id+'"]'),viewport=find('913:5911'),world=find('913:5912');if(!viewport||!world)return;
 let x=0,y=0,drag=null,suppressClick=false,nativePan=null;
 const originalStyle=getComputedStyle(world),viewportStyle=getComputedStyle(viewport);
 const originalOffset={x:parseFloat(originalStyle.left)||0,y:originalStyle.top==='auto'?parseFloat(viewportStyle.height)-parseFloat(originalStyle.height)-(parseFloat(originalStyle.bottom)||0):parseFloat(originalStyle.top)};
 viewport.classList.add('zc-preview-map-pan');viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Карта вольеров. Перетаскивайте пальцем или мышью; стрелки перемещают карту, Home возвращает исходный вид.');
 function bounds(){return {left:viewport.clientWidth-world.offsetWidth-originalOffset.x,right:-originalOffset.x,top:viewport.clientHeight-world.offsetHeight-originalOffset.y,bottom:-originalOffset.y};}
 function draw(){const b=bounds();x=Math.min(b.right,Math.max(b.left,x));y=Math.min(b.bottom,Math.max(b.top,y));if(nativePan)nativePan.sync();else world.style.transform='translate3d('+x+'px,'+y+'px,0)';}
 function reset(){x=0;y=0;draw();}
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('pointerdown',e=>{if(nativePan||window.PortfolioTouchPan?.handles(e))return;if(e.button!==0||drag)return;suppressClick=false;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y,moved:false,scale:viewport.getBoundingClientRect().width/viewport.clientWidth};});
 viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(!drag.moved&&Math.hypot(dx,dy)>6){drag.moved=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-panning');}if(drag.moved){e.preventDefault();x=drag.x+dx/drag.scale;y=drag.y+dy/drag.scale;draw();}});
 function release(cancel=false){if(!drag)return;suppressClick=drag.moved&&!cancel;drag=null;viewport.classList.remove('is-panning');}
 viewport.addEventListener('pointerup',()=>release());viewport.addEventListener('pointercancel',()=>release(true));viewport.addEventListener('lostpointercapture',()=>release(true));
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
 viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const step=80,moves={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]};if(moves[e.key]){e.preventDefault();x+=moves[e.key][0];y+=moves[e.key][1];draw();}else if(e.key==='Home'){e.preventDefault();reset();}});
 for(const button of document.querySelectorAll('[data-node-id="913:5908"] [data-name="Моё местоположение"]')){button.tabIndex=0;button.setAttribute('role','button');button.setAttribute('aria-label','Вернуться к исходному положению карты');button.addEventListener('click',e=>{e.stopPropagation();reset();});button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();reset();}});}
 nativePan=window.PortfolioTouchPan?.native(viewport,{world,get:()=>({x,y}),set:state=>{x=state.x;y=state.y;},draw,size:()=>({w:world.offsetWidth,h:world.offsetHeight,padX:0,padY:0,offsetX:originalOffset.x,offsetY:originalOffset.y,scale:1,viewWidth:viewport.clientWidth}),finish:moved=>{suppressClick=moved;}});
 if(!nativePan)window.PortfolioTouchPan?.attach(viewport,{get:()=>({x,y}),set:state=>{x=state.x;y=state.y;},draw,finish:moved=>{suppressClick=moved;}});
 new ResizeObserver(()=>{if(viewport.clientWidth)draw();}).observe(viewport);draw();
})();
