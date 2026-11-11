// Keep the original artwork fixed; animate only its visibility mask.
(()=>{
 const width=1920,height=847,period=10500,reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const bubbles=[[445,278,20],[476,342,29],[589,304,53],[675,487,39],[1032,630,39],[1776,230,39],[1872,402,39],[1689,613,39]];
 const timeline=new Path2D('M700 308 C700 230 803 230 835 275 C930 320 1080 300 1110 275 C1130 242 1195 242 1225 275 C1330 319 1480 300 1506 275 C1530 240 1590 240 1620 275 C1750 312 1830 302 1920 288 L1920 329 C1770 315 1700 311 1620 342 C1590 382 1520 382 1506 342 C1390 310 1320 310 1225 342 C1200 378 1130 378 1110 342 C1010 310 930 310 835 342 C790 390 700 380 700 308Z');
 const floor=new Path2D('M0 701 Q540 677 1080 682 L1250 664 Q1270 642 1303 657 Q1400 551 1510 518 Q1570 501 1624 515 Q1630 568 1560 710 L1600 847 H0Z');
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),states=[];
 document.querySelectorAll('.panorama-illustration').forEach(scene=>{
  const image=scene.querySelector('.panorama-original'),canvas=scene.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const mask=document.createElement('canvas'),alpha=mask.getContext('2d');if(!alpha)return;
  const state={visible:false,ready:false,elapsed:0,last:0,frame:0};states.push(state);
  function size(){const ratio=Math.max(1,Math.min(2,scene.getBoundingClientRect().width*devicePixelRatio/width));canvas.width=mask.width=Math.round(width*ratio);canvas.height=mask.height=Math.round(height*ratio);ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);alpha.setTransform(mask.width/width,0,0,mask.height/height,0,0);paint(state.elapsed%period);}
  function paint(t){
   if(!state.ready)return;ctx.clearRect(0,0,width,height);alpha.clearRect(0,0,width,height);alpha.globalAlpha=1;alpha.fillStyle='#fff';alpha.fill(floor);
   if(reduced.matches||t>=6000&&t<9800){ctx.drawImage(image,0,0,width,height);scene.dataset.phase='complete';return;}
   const fade=1-ease((t-9800)/700);alpha.globalAlpha=fade;
   const progress=ease((t-120)/2600),end=680+1280*progress;
   alpha.save();alpha.clip(timeline);const edge=alpha.createLinearGradient(end-28,0,end,0);edge.addColorStop(0,'white');edge.addColorStop(1,'transparent');alpha.fillStyle=edge;alpha.fillRect(0,0,end,height);alpha.restore();
   const radial=ease((t-1750)/2800);
   if(radial>0){alpha.save();alpha.beginPath();alpha.rect(0,0,width,height);for(const [x,y,r]of bubbles){alpha.moveTo(x+r+1,y);alpha.arc(x,y,r+1,0,Math.PI*2);}alpha.clip('evenodd');const span=600*radial,gradient=alpha.createLinearGradient(0,308-span,0,308+span);gradient.addColorStop(0,'transparent');gradient.addColorStop(.08,'white');gradient.addColorStop(.92,'white');gradient.addColorStop(1,'transparent');alpha.fillStyle=gradient;alpha.fillRect(0,308-span,width,span*2);alpha.restore();}
   bubbles.forEach(([x,y,r],i)=>{const p=ease((t-3300-i*150)/1200);if(p<=0)return;alpha.fillStyle='white';alpha.beginPath();alpha.arc(x,y,(r+3)*p,0,Math.PI*2);alpha.fill();});
   ctx.drawImage(image,0,0,width,height);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0,width,height);ctx.globalCompositeOperation='source-over';
   scene.dataset.phase=t>=9800?'reset':t>=3300?'bubbles':t>=1750?'associations':'timeline';
  }
  function tick(now){state.frame=0;if(!state.visible||document.hidden||reduced.matches){state.last=0;return;}if(state.last)state.elapsed+=Math.min(80,now-state.last);state.last=now;paint(state.elapsed%period);scene.dataset.cycle=String(Math.floor(state.elapsed/period));state.frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(state.frame);state.frame=0;state.last=0;if(!state.ready)return;paint(state.elapsed%period);if(state.visible&&!document.hidden&&!reduced.matches)state.frame=requestAnimationFrame(tick);}
  state.sync=sync;
  function ready(){if(state.ready||!image.naturalWidth)return;state.ready=true;size();scene.classList.add('panorama-ready');sync();}
  image.addEventListener('load',ready,{once:true});if(image.complete)ready();
  new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(scene);
  addEventListener('resize',size,{passive:true});reduced.addEventListener('change',sync);
 });
 document.addEventListener('visibilitychange',()=>states.forEach(state=>state.sync()));
})();
