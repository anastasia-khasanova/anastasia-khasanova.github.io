// Touch panning in screen coordinates, with bounded momentum shared by both maps.
(()=>{
 const handles=e=>e.pointerType==='touch'||window.portfolioIPad===true;
 function attach(viewport,{get,set,draw,exclude='',finish=()=>{}}){
  let drag=null,frame=0,inertia=0;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  viewport.style.touchAction='none';viewport.classList.add('zc-touch-pan');
  function flush(){frame=0;draw();}
  function queue(){if(!frame)frame=requestAnimationFrame(flush);}
  function stop(){cancelAnimationFrame(inertia);inertia=0;}
  viewport.addEventListener('pointerdown',e=>{if(!handles(e)||e.button!==0||exclude&&e.target.closest(exclude))return;stop();const state=get();drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,lastX:e.clientX,lastY:e.clientY,x:state.x,y:state.y,scale:viewport.getBoundingClientRect().width/viewport.clientWidth,time:e.timeStamp,vx:0,vy:0,moved:false};finish(false);});
  viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag,dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(!d.moved&&Math.hypot(dx,dy)>3){d.moved=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');}if(!d.moved)return;e.preventDefault();const dt=Math.max(8,Math.min(50,e.timeStamp-d.time)),gain=1.15;d.vx=.35*d.vx+.65*(e.clientX-d.lastX)/dt*gain;d.vy=.35*d.vy+.65*(e.clientY-d.lastY)/dt*gain;d.lastX=e.clientX;d.lastY=e.clientY;d.time=e.timeStamp;set({x:d.x+dx/d.scale*gain,y:d.y+dy/d.scale*gain});queue();},{passive:false});
  function release(e,cancel){if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;viewport.classList.remove('is-dragging');cancelAnimationFrame(frame);frame=0;draw();finish(d.moved);if(!d.moved||cancel||reduce.matches||e.timeStamp-d.time>100)return;let vx=d.vx,vy=d.vy,last=performance.now();function glide(now){const dt=Math.min(32,now-last);last=now;const state=get(),dx=vx*dt/d.scale,dy=vy*dt/d.scale;set({x:state.x+dx,y:state.y+dy});draw();const result=get();if(Math.abs(result.x-state.x)<.01)vx=0;if(Math.abs(result.y-state.y)<.01)vy=0;const decay=Math.exp(-dt/180);vx*=decay;vy*=decay;if(Math.hypot(vx,vy)>.025)inertia=requestAnimationFrame(glide);else inertia=0;}inertia=requestAnimationFrame(glide);}
  viewport.addEventListener('pointerup',e=>release(e,false));viewport.addEventListener('pointercancel',e=>release(e,true));viewport.addEventListener('lostpointercapture',e=>release(e,true));document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduce.addEventListener('change',stop);
 }
 window.PortfolioTouchPan={handles,attach};
})();
