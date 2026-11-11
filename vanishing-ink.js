(() => {
 const area=document.querySelector('.ink-playground');if(!area)return;
 const canvas=area.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
 const signature=area.querySelector('.neon-signature');
 let strokes=[],current=null,inside=false,touch=null,raf=0,width=1,height=1;
 const hold=3500,fade=2500;
 function hideName(){area.classList.add('ink-active');}
 function showName(){if(current||strokes.length||!area.classList.contains('ink-active'))return;area.classList.remove('ink-active');signature.getAnimations({subtree:true}).forEach(a=>{a.cancel();a.play();});}
 function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);const dpr=Math.max(2,Math.min(devicePixelRatio||1,3));canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
 function point(e){const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
 function start(e){hideName();current={points:[point(e)],ended:Infinity};strokes.push(current);if(strokes.length>60)strokes.shift();}
 function end(){if(current){current.ended=performance.now();current=null;}schedule();}
 function move(e){if(!current)start(e);const samples=e.getCoalescedEvents?.()||[e];for(const sample of samples){const raw=point(sample),last=current.points.at(-1),p={x:last.x+(raw.x-last.x)*.72,y:last.y+(raw.y-last.y)*.72};if(Math.hypot((p.x-last.x)*width,(p.y-last.y)*height)>.45){current.points.push(p);if(current.points.length>5000)current.points.splice(1,1);}}schedule();}
 function trace(points){ctx.beginPath();const first=points[0];ctx.moveTo(first.x*width,first.y*height);if(points.length<2){ctx.lineTo(first.x*width+.01,first.y*height+.01);return;}
 // A clamped Catmull–Rom spline passes through every sample with continuous tangents.
 for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];ctx.bezierCurveTo((p1.x+(p2.x-p0.x)/6)*width,(p1.y+(p2.y-p0.y)/6)*height,(p2.x-(p3.x-p1.x)/6)*width,(p2.y-(p3.y-p1.y)/6)*height,p2.x*width,p2.y*height);}}
 function render(now){raf=0;ctx.clearRect(0,0,width,height);strokes=strokes.filter(s=>s===current||now-s.ended<hold+fade);ctx.lineCap='round';ctx.lineJoin='round';for(const s of strokes){const age=s===current?0:now-s.ended;ctx.globalAlpha=age<hold?1:Math.max(0,1-(age-hold)/fade);trace(s.points);ctx.strokeStyle='rgba(44,118,255,.26)';ctx.shadowColor='#2470ff';ctx.shadowBlur=22;ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='#6399ff';ctx.shadowColor='#4787ff';ctx.shadowBlur=11;ctx.lineWidth=3.5;ctx.stroke();ctx.shadowColor='#b1ccff';ctx.shadowBlur=4;ctx.strokeStyle='#e4f7ff';ctx.lineWidth=2.1;ctx.stroke();}ctx.globalAlpha=1;ctx.shadowBlur=0;if(strokes.length)schedule();else showName();}
 function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(render);}
 canvas.addEventListener('pointerenter',()=>{inside=true;});
 canvas.addEventListener('pointermove',e=>{if(!current||touch!==e.pointerId)return;if(e.pointerType==='mouse'&&!(e.buttons&1)){finish(e);return;}move(e);});
 canvas.addEventListener('pointerleave',e=>{inside=false;if(!current)showName();});
 canvas.addEventListener('pointerdown',e=>{if(current||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();touch=e.pointerId;canvas.setPointerCapture(e.pointerId);start(e);schedule();});
 function finish(e){if(e.pointerId!==touch)return;end();touch=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!inside||e.pointerType==='touch')showName();}
 ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,finish));
 window.addEventListener('blur',()=>{inside=false;touch=null;end();showName();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){inside=false;touch=null;end();showName();if(raf)cancelAnimationFrame(raf);raf=0;}else schedule();});
 new ResizeObserver(resize).observe(canvas);resize();
})();
