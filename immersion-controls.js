(() => {
const sequence=[88,92,98,108,116,127,139,151,163,158,145,129,112,96];
document.querySelectorAll('.immersion-scene').forEach(scene=>{
 const pulse=scene.querySelector('.projected-heart-rate'),value=pulse.querySelector('span');let step=0,timer=null,visible=true;
 function tick(){if(!visible||document.hidden)return;const n=sequence[step++%sequence.length];value.textContent=n;pulse.dataset.level=n>=150?'critical':n>=105?'active':'calm';pulse.style.setProperty('--beat-duration',60/n+'s');pulse.setAttribute('aria-label','Демонстрационный пульс '+n);}
 scene.querySelectorAll('[data-feature]').forEach(b=>b.addEventListener('click',()=>{
 const on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(on));
 if(b.dataset.feature==='emotions')scene.classList.toggle('emotions-on',on);
 if(b.dataset.feature==='heartbeat'){pulse.hidden=!on;clearInterval(timer);timer=null;if(on){step=0;tick();timer=setInterval(tick,1800);}}
 }));
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scene.classList.toggle('scene-offscreen',!visible);}).observe(scene);
});
})();

// Each travelling wave owns an immutable gradient captured at birth.
(() => {
 if(!window.requestAnimationFrame)return;
 const ns='http://www.w3.org/2000/svg',reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const palette={
 delight:['#24443E','#4A7A71','#A5E9D7'],stress:['#21454B','#458D93','#A7EAF0'],victory:['#27475A','#4F8FB3','#A4DFFD'],solitude:['#303E59','#627FB3','#BDD2F9'],pain:['#3D3555','#7C74A6','#C4B5EF'],love:['#4A3553','#9670A6','#E8BAF4'],fun:['#533640','#A66B7D','#F2BECD'],fear:['#51332B','#A66B5B','#EDB4A4']};
 const stages=[{duration:7000,emotions:['fear','pain','stress']},{duration:11000,emotions:['delight','victory']},{duration:10000,emotions:['love','fun']},{duration:12000,emotions:['stress','solitude']},{duration:11000,emotions:['delight','stress','victory']},{duration:10000,emotions:['pain','love']},{duration:8000,emotions:['fear']}];
 const cycle=stages.reduce((sum,s)=>sum+s.duration,0),gaps=[2800,6700,10800,4100,13900,7600,3500,9200],widths=[10,24,16,32,12,21,37,15];
 function emotionsAt(time){let p=time%cycle;for(const stage of stages){if(p<stage.duration)return stage.emotions;p-=stage.duration;}return stages[0].emotions;}
 document.querySelectorAll('.immersion-scene').forEach((scene,sceneIndex)=>{
  const layer=scene.querySelector('.emotion-screen-waves');layer.classList.add('organic-equalizer');
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 600');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs');svg.append(defs);layer.append(svg);
  let frame=0,last=null,time=0,nextWave=0,serial=0,visible=true,waves=[];
  function spawn(birth){
   const emotions=[...emotionsAt(birth)],id='emotion-wave-'+sceneIndex+'-'+serial++,gradient=document.createElementNS(ns,'linearGradient');
   gradient.id=id;gradient.setAttribute('x1','0%');gradient.setAttribute('y1','20%');gradient.setAttribute('x2','100%');gradient.setAttribute('y2','80%');
   const colors=emotions.length===1?palette[emotions[0]]:[palette[emotions[0]][0],...emotions.flatMap(emotion=>[palette[emotion][1],palette[emotion][2]])];
   colors.forEach((color,i)=>{const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',i/(colors.length-1)*100+'%');stop.setAttribute('stop-color',color);gradient.append(stop);});defs.append(gradient);
   const path=document.createElementNS(ns,'path');path.setAttribute('fill','none');path.setAttribute('stroke-linejoin','round');path.setAttribute('stroke','url(#'+id+')');path.style.color=palette[emotions[0]][1];path.dataset.emotions=emotions.join('+');path.classList.add('wave-light-body');
   const group=document.createElementNS(ns,'g'),haze=document.createElementNS(ns,'path'),core=document.createElementNS(ns,'path');
   haze.classList.add('wave-light-haze');core.classList.add('wave-light-core');
   for(const glow of [haze,core]){glow.setAttribute('fill','none');glow.setAttribute('stroke','url(#'+id+')');glow.setAttribute('stroke-linejoin','round');}
   haze.setAttribute('stroke-width','86');haze.setAttribute('opacity','.23');core.setAttribute('stroke-width','5');core.setAttribute('opacity','.65');path.setAttribute('opacity','.65');
   group.append(haze,path,core);svg.append(group);
   const width=widths[(serial-1)%widths.length],lifetime=5200+(serial%3)*650;path.dataset.width=String(width);waves.push({birth,path,gradient,group,haze,core,width,lifetime,phase:serial*.81});
  }
  function paint(){
   if(time>=nextWave){spawn(time);nextWave=time+gaps[(serial-1)%gaps.length];}
   waves=waves.filter(w=>{const age=time-w.birth;if(age>=w.lifetime){w.group.remove();w.gradient.remove();return false;}
    const progress=age/w.lifetime,scale=.48+progress*.95,t=age/1000;
    w.path.setAttribute('stroke-width',String(w.width+Math.sin(t*1.5+w.phase)*w.width*.12));w.haze.setAttribute('stroke-width',String(w.width*2.8+Math.sin(t+w.phase)*6));w.group.setAttribute('opacity',String(Math.pow(Math.sin(progress*Math.PI),.65)*.95));
    const points=[];for(let i=0;i<120;i++){const a=i/120*Math.PI*2;
     const ripple=Math.sin(a*7+t*2+w.phase)*.032+Math.sin(a*13-t*1.3+w.phase)*.017+Math.sin(a*3+t*.6)*.023;
     const radius=scale+ripple;points.push((540+Math.cos(a)*470*radius).toFixed(2)+','+(285+Math.sin(a)*310*radius).toFixed(2));}
    const contour='M'+points.join(' L')+' Z';for(const part of [w.haze,w.path,w.core])part.setAttribute('d',contour);return true;
   });
  }
  function tick(now){frame=0;if(last!==null)time+=Math.min(now-last,100);last=now;paint();
   if(scene.classList.contains('emotions-on')&&visible&&!document.hidden&&!reduced.matches)frame=window.requestAnimationFrame(tick);
  }
  function sync(){if(frame)window.cancelAnimationFrame(frame);frame=0;last=null;
   if(scene.classList.contains('emotions-on')&&visible&&!document.hidden){if(reduced.matches){if(!waves.length)spawn(0);time=2800;paint();}else frame=window.requestAnimationFrame(tick);}}
  scene.querySelector('[data-feature="emotions"]').addEventListener('click',()=>{if(!scene.classList.contains('emotions-on')){waves.forEach(w=>{w.group.remove();w.gradient.remove();});waves=[];time=0;nextWave=0;}sync();});
  if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();}).observe(scene);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 });
})();
