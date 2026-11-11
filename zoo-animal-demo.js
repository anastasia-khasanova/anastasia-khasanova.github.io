// Autoplay the full care flow; a task click hands the same state to the visitor.
(()=>{
 const demo=document.querySelector('[data-animal-demo]');if(!demo)return;
 const display=demo.querySelector('.zc-animal-display'),scroll=demo.querySelector('.zc-animal-scroll'),viewport=demo.querySelector('.zc-animal-viewport'),edit=demo.querySelector('[data-animal-edit]'),editButton=demo.querySelector('[data-animal-edit-button]'),saveButton=demo.querySelector('[data-animal-save-button]'),newForm=demo.querySelector('[data-animal-new-form]'),daily=demo.querySelector('.zc-animal-daily'),touch=demo.querySelector('.zc-animal-touch'),toast=demo.querySelector('.zc-animal-saved');
 const motion=matchMedia('(prefers-reduced-motion:reduce)');let visible=false,paused=false,elapsed=0,last=0,frame=0,scrollY=0,editScroll=250,dailyScroll=850,manual=null,resumeTimer=0,tapTimer=0,transitionTimer=0;
 let drag=null,glideFrame=0,suppressClickUntil=0;
 function stopGlide(){cancelAnimationFrame(glideFrame);glideFrame=0;}
 const period=48000,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const tasks=[{key:'food',title:'Конина 5 кг',steps:[30000,31500],base:1,total:3,external:'930:7237',initialTime:'05:50'},{key:'water',title:'Смена воды',steps:[33500,35000],base:2,total:4,external:'930:7238',initialTime:'05:55'},{key:'medicine',title:'Хондроитина сульфат',steps:[37000],base:1,total:2,external:'930:7239',initialTime:'05:55'}];
 const careEvents=tasks.flatMap(task=>task.steps).sort((a,b)=>a-b);
 const careTime=index=>{const minutes=(14*60+30+index*5)%(24*60);return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');};
 const noteText='Повторный осмотр выполнен. Данные обновлены.';let noteCommitted=false;
 function commitNote(content=noteText,replace=false){
  if((noteCommitted&&!replace)||!content.trim())return;
  window.dispatchEvent(new CustomEvent('zoo:staff-note',{detail:{body:content.trim()}}));
  demo.dataset.noteSaved='true';noteCommitted=true;
 }

 const external=tasks.map(task=>{const root=document.querySelector('[data-node-id="'+task.external+'"]');return {root,count:root?.querySelector('[data-name="check-boxes"] p'),time:root?.querySelector('[data-name^="Блок ·"] p+ p'),bars:[...root?.querySelectorAll('[data-name^="Индикатор жеста"]')||[]]};});
 const cards=tasks.map(task=>demo.querySelector('[data-animal-task="'+task.key+'"]'));
 const regions=[document.querySelector('[data-node-id="930:7291"]'),demo].filter(Boolean),hovered=new Set();
 function measure(){editScroll=Math.max(0,editButton.offsetTop+editButton.offsetHeight+36-viewport.clientHeight);dailyScroll=Math.max(editScroll,Math.min(scroll.scrollHeight-viewport.clientHeight,daily.offsetTop-160));if(manual)pose(28500);}
 function text(el,value){if(!el)return;if(el.matches('input,textarea,select')){if(el.value!==value)el.value=value;}else if(el.textContent!==value)el.textContent=value;}
 function localCenter(el){let x=el.offsetWidth/2,y=el.offsetHeight/2;for(let p=el;p&&p!==display;p=p.offsetParent){x+=p.offsetLeft;y+=p.offsetTop;}if(scroll.contains(el))y-=scrollY;return [x,y];}
 function cue(el,show){touch.classList.toggle('is-visible',show);if(show){const [x,y]=localCenter(el);touch.style.left=x+'px';touch.style.top=y+'px';}}
 let swipeCue=null;
 // Short finger drags followed by deceleration, as on a touch screen.
 function swipeScroll(from,to,progress){
  const p=clamp(progress),distance=to-from,steps=Math.max(1,Math.ceil(Math.abs(distance)/320)),position=p*steps,index=Math.min(steps-1,Math.floor(position)),phase=p===1?1:position-index;
  const drag=ease((phase-.1)/.55),coast=1-Math.pow(1-clamp((phase-.65)/.28),3),travel=.85*drag+.15*coast;
  if(p>0&&p<1&&phase>=.1&&phase<.65){const direction=Math.sign(distance);swipeCue={x:display.clientWidth*.68,y:62+viewport.clientHeight*(direction>0?.73-.38*drag:.35+.38*drag)};}
  return from+distance*(index+travel)/steps;
 }
 const initial={weight:'126',temperature:'38,7',sleep:'19',appetite:'Снижен'},updated={weight:'127',temperature:'38,5',sleep:'20',appetite:'Снижен'},units={weight:' кг',temperature:' °C',sleep:' ч',appetite:' аппетит'},fields={weight:[11200,12400],temperature:[13200,14400],sleep:[15200,16200]};
 function formatMetric(key,value){return key==='appetite'&&value.replace(/\s/g,' ')==='В норме'?'Аппетит в норме':value+units[key];}
 function renderTask(i,count,time,tapped){
  const task=tasks[i],card=cards[i],other=external[i],complete=count>=task.total;
  card.classList.toggle('is-tapped',tapped);other.root?.classList.toggle('zc-care-tapped',tapped);card.classList.toggle('zc-care-complete',complete);other.root?.classList.toggle('zc-care-complete',complete);
  text(card.querySelector('[data-task-count]'),count+'/'+task.total);text(other.count,count+'/'+task.total);
  const subtitle=complete?'Задача выполнена':'Обновление в '+time;
  text(card.querySelector('.zc-animal-daily-copy>span'),subtitle);text(other.time,subtitle);
  card.disabled=complete;card.setAttribute('aria-label',task.title+'. '+count+' из '+task.total+(complete?'. Задача выполнена':''));
  card.dataset.count=String(count);card.dataset.time=time;
  card.querySelectorAll('.zc-animal-segments i').forEach((bar,k)=>bar.classList.toggle('zc-animal-done',k<count));
  other.bars.forEach((bar,k)=>{bar.style.backgroundColor=k<count?'#fff':'rgba(255,255,255,.3)';});
  other.root?.setAttribute('aria-disabled',String(complete));other.root?.setAttribute('aria-label',task.title+'. '+(complete?'Задача выполнена':count+' из '+task.total+'. Выполнить следующий пункт'));
 }
 function pose(time){
  swipeCue=null;
  const t=time>=45700?0:time,saved=manual?manual.saved:t>=21000,editing=manual?manual.view==='edit':t>=9600&&t<21000;
  demo.dataset.phase=manual?'manual-'+manual.view:editing?'edit':t>=28500?'daily':saved?'saved':t>=3200?'scroll':'card';
  scrollY=manual?viewport.scrollTop:t<9600?swipeScroll(0,editScroll,(t-3200)/5600):saved?swipeScroll(editScroll,dailyScroll,(t-23500)/5000):editScroll;
  if(!manual&&t>=41000)scrollY=swipeScroll(dailyScroll,0,(t-41000)/4500);
  if(manual)scroll.style.transform='none';else{viewport.scrollTop=0;scroll.style.transform='translateY('+(-scrollY).toFixed(3)+'px)';}
  if(!manual)text(toast,'✓ Изменения сохранены');
  edit.classList.toggle('is-open',editing);edit.inert=!editing;newForm.classList.toggle('is-open',!!manual&&manual.view==='new');newForm.inert=!(manual&&manual.view==='new');viewport.inert=editing||!!manual&&manual.view==='new';toast.classList.toggle('is-visible',manual?!!manual.toast:t>=21300&&t<23500);
  editButton.classList.toggle('is-pressed',!manual&&t>=9200&&t<9600);saveButton.classList.toggle('is-pressed',!manual&&t>=20400&&t<21000);
  for(const key of Object.keys(initial)){
   const field=demo.querySelector('[data-animal-field="'+key+'"]'),range=fields[key];let value=initial[key];
   if(range&&t>=range[0])value=updated[key].slice(0,Math.max(1,Math.ceil(clamp((t-range[0])/(range[1]-range[0]))*updated[key].length)));
   if(!manual||manual.view!=='edit')text(demo.querySelector('[data-animal-input="'+key+'"]'),manual?manual.values[key]:value);field?.classList.toggle('is-writing',!manual&&!!range&&t>=range[0]&&t<range[1]);
   text(demo.querySelector('[data-animal-value="'+key+'"]'),formatMetric(key,manual?manual.values[key]:saved?updated[key]:initial[key]));
  }
  const comment=noteText,progress=clamp((t-17000)/3000);
  if(!manual)text(demo.querySelector('[data-animal-comment]'),progress?comment.slice(0,Math.ceil(progress*comment.length)):'');demo.querySelector('.zc-animal-comment').classList.toggle('is-written',progress>0);
  if(saved&&!manual)commitNote();
  text(demo.querySelector('[data-animal-chart-weight]'),(manual?manual.values.weight:saved?updated.weight:initial.weight)+' кг');text(demo.querySelector('[data-animal-updated]'),saved?'05:56, 04.11.2026':'05:40, 02.11.2026');
  let target=null;if(!manual&&t>=9200&&t<9600)target=editButton;if(!manual&&t>=20400&&t<21000)target=saveButton;
  tasks.forEach((task,i)=>{
   const completedSteps=task.steps.filter(at=>t>=at+500).length,count=manual?manual.counts[i]:Math.min(task.total,task.base+completedSteps),tapped=manual?manual.tapped===i:task.steps.some(at=>t>=at&&t<at+500),time=manual?manual.times[i]:completedSteps?careTime(careEvents.indexOf(task.steps[completedSteps-1])):task.initialTime;
   renderTask(i,count,time,tapped);if(tapped&&!manual)target=cards[i];
  });cue(target,!!target);touch.classList.toggle('is-swiping',!!swipeCue);if(swipeCue){touch.classList.add('is-visible');touch.style.left=swipeCue.x+'px';touch.style.top=swipeCue.y+'px';}
 }
 // Speed up only scrolling; typing and reading holds keep their original pace.
 function scrollRate(time){const t=time%period;return (t>=3200&&t<8800)||(t>=23500&&t<28500)||(t>=41000&&t<45500)?2:1;}
 function tick(now){frame=0;if(!visible||paused||manual||document.hidden||motion.matches){last=0;return;}if(last)elapsed+=Math.min(now-last,100)*scrollRate(elapsed);last=now;pose(elapsed%period);frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;demo.dataset.running=String(visible&&!paused&&!manual&&!document.hidden&&!motion.matches);if(manual){pose(28500);return;}if(motion.matches){elapsed=0;pose(0);}else if(visible&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
 function beginManual(view='card'){
  clearTimeout(resumeTimer);if(manual){if(view!=='card')manual.view=view;return;}
  const phase=elapsed%period,saved=phase>=21000&&phase<45700;
  manual={counts:cards.map(card=>Number(card.dataset.count)),times:cards.map(card=>card.dataset.time),saved,values:{...(saved?updated:initial)},view,scroll:scrollY,tapped:-1,events:cards.reduce((sum,card,k)=>sum+Number(card.dataset.count)-tasks[k].base,0),toast:''};
  demo.classList.add('is-manual');scroll.style.transition='';scroll.style.transform='none';viewport.scrollTop=manual.scroll;sync();
 }
 function resetManual(){
  if(!manual)return;stopGlide();drag=null;clearTimeout(resumeTimer);clearTimeout(tapTimer);const y=viewport.scrollTop;document.activeElement?.closest('[data-animal-demo]')&&document.activeElement.blur();
  manual=null;paused=false;demo.classList.remove('is-manual');scroll.style.transition='';viewport.scrollTop=0;scroll.style.transform='translateY('+(-y)+'px)';scroll.getBoundingClientRect();elapsed=0;scroll.style.transition=motion.matches?'none':'transform .8s ease';pose(0);clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>scroll.style.transition='',900);sync();
 }
 function scheduleResume(ignoreFocus=false){clearTimeout(resumeTimer);if(manual&&!hovered.size&&(ignoreFocus||!regions.some(region=>region.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))))resumeTimer=setTimeout(resetManual,600);}
 function showToast(message){if(!manual)return;manual.toast=message;text(toast,message);toast.classList.add('is-visible');setTimeout(()=>{if(manual){manual.toast='';toast.classList.remove('is-visible');}},1800);}
 function openEdit(){beginManual('edit');manual.view='edit';for(const key of Object.keys(initial))text(demo.querySelector('[data-animal-input="'+key+'"]'),manual.values[key]);text(demo.querySelector('[data-animal-comment]'),'');edit.scrollTop=0;sync();}
 function perform(i,reveal=false){
  const current=Number(cards[i].dataset.count)||tasks[i].base;if(current>=tasks[i].total)return;
  clearTimeout(tapTimer);clearTimeout(transitionTimer);beginManual();manual.view='card';manual.counts[i]=Math.min(tasks[i].total,manual.counts[i]+1);manual.times[i]=careTime(manual.events++);manual.tapped=i;sync();
  if(reveal)viewport.scrollTo({top:dailyScroll,behavior:motion.matches?'instant':'smooth'});
  const message=tasks[i].title+'. '+(manual.counts[i]===tasks[i].total?'Задача выполнена':manual.counts[i]+' из '+tasks[i].total+'. Обновление в '+manual.times[i]);const announce=document.querySelector('.zc-announcer');if(announce)announce.textContent=message;
  tapTimer=setTimeout(()=>{if(manual){manual.tapped=-1;pose(28500);}},500);scheduleResume();
 }
 editButton.addEventListener('click',openEdit);
 edit.addEventListener('submit',e=>{
  e.preventDefault();beginManual('edit');const values={};let valid=true;
  for(const key of Object.keys(initial)){const input=demo.querySelector('[data-animal-input="'+key+'"]');let value=input.value.trim();if(key!=='appetite'){const n=Number(value.replace(',','.'));const ok=value!==''&&Number.isFinite(n)&&(key==='sleep'?n>=0&&n<=24:n>0);input.setCustomValidity(ok?'':'Введите корректное значение');if(!ok)valid=false;value=value.replace('.',',');}values[key]=value;}
  if(!valid){edit.reportValidity();return;}
  manual.values=values;manual.saved=true;const comment=demo.querySelector('[data-animal-comment]').value.trim();if(comment)commitNote(comment,true);manual.view='card';sync();showToast('✓ Изменения сохранены');
 });
 edit.addEventListener('input',e=>{e.target.setCustomValidity?.('');});
 demo.querySelector('[data-animal-cancel]').addEventListener('click',()=>{beginManual();manual.view='card';sync();});
 // New task is intentionally inactive in this demonstration.
 demo.querySelector('[data-animal-new-cancel]').addEventListener('click',()=>{manual.view='card';sync();});
 newForm.addEventListener('submit',e=>{
  e.preventDefault();if(!newForm.reportValidity())return;beginManual('new');const title=newForm.elements.title.value.trim();if(!title)return;
  const item=document.createElement('div');item.className='zc-animal-created-task';const heading=document.createElement('b');heading.textContent=title;item.append(heading);
  if(newForm.elements.urgent.checked){const urgent=document.createElement('small');urgent.textContent='Срочная задача';item.append(urgent);}const comment=newForm.elements.comment.value.trim();if(comment){const p=document.createElement('p');p.textContent=comment;item.append(p);}
  demo.querySelector('[data-animal-created-tasks]').prepend(item);manual.view='card';measure();sync();viewport.scrollTo({top:daily.offsetTop-20,behavior:motion.matches?'instant':'smooth'});showToast('✓ Задача создана');
 });
 viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Карточка Леона. Можно прокручивать и нажимать кнопки');
 demo.addEventListener('wheel',e=>beginManual(e.target.closest('[data-animal-edit]')?'edit':e.target.closest('[data-animal-new-form]')?'new':'card'),{passive:true,capture:true});viewport.addEventListener('scroll',()=>{if(manual)manual.scroll=viewport.scrollTop;},{passive:true});
 demo.addEventListener('pointerdown',e=>beginManual(e.target.closest('[data-animal-edit]')?'edit':e.target.closest('[data-animal-new-form]')?'new':'card'),{capture:true});
 // Touch keeps native panning. A mouse drag offers the same swipe on desktop.
 display.addEventListener('pointerdown',e=>{
  stopGlide();if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('input,textarea,select'))return;
  const panel=e.target.closest('.zc-animal-viewport,.zc-animal-edit');if(!panel||panel.inert)return;
  drag={id:e.pointerId,panel,startY:e.clientY,startScroll:panel.scrollTop,lastY:e.clientY,lastTime:performance.now(),velocity:0,moved:false,scale:panel.clientHeight/Math.max(1,panel.getBoundingClientRect().height)};
 });
 display.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;const delta=e.clientY-drag.startY;
  if(!drag.moved&&Math.abs(delta)<5)return;
  if(!drag.moved){drag.moved=true;display.setPointerCapture(e.pointerId);demo.classList.add('is-swiping');}
  e.preventDefault();const now=performance.now(),dt=Math.max(1,now-drag.lastTime);
  drag.velocity=-(e.clientY-drag.lastY)*drag.scale/dt;drag.lastY=e.clientY;drag.lastTime=now;
  drag.panel.scrollTop=drag.startScroll-delta*drag.scale;
 },{passive:false});
 function endSwipe(e){
  if(!drag||drag.id!==e.pointerId)return;const state=drag;drag=null;demo.classList.remove('is-swiping');
  if(display.hasPointerCapture(e.pointerId))display.releasePointerCapture(e.pointerId);
  if(!state.moved)return;suppressClickUntil=performance.now()+350;
  let velocity=performance.now()-state.lastTime<100?Math.max(-2.5,Math.min(2.5,state.velocity)):0,previous=performance.now();
  const glide=now=>{glideFrame=0;if(!manual)return;const dt=Math.min(32,now-previous);previous=now;const before=state.panel.scrollTop;state.panel.scrollTop+=velocity*dt;velocity*=Math.exp(-dt/150);if(Math.abs(velocity)>.02&&Math.abs(state.panel.scrollTop-before)>.1)glideFrame=requestAnimationFrame(glide);};
  if(e.type!=='pointercancel')glideFrame=requestAnimationFrame(glide);scheduleResume(true);
 }
 display.addEventListener('pointerup',endSwipe);display.addEventListener('pointercancel',endSwipe);
 display.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 demo.addEventListener('focusin',e=>{if(!manual)beginManual(e.target.closest('[data-animal-edit]')?'edit':e.target.closest('[data-animal-new-form]')?'new':'card');});
 external.forEach((other,i)=>{if(!other.root)return;other.root.classList.add('zc-care-control');other.root.tabIndex=0;other.root.setAttribute('role','button');other.root.addEventListener('click',()=>perform(i,true));other.root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();perform(i,true);}});});
 regions.forEach(region=>{region.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;hovered.add(region);clearTimeout(resumeTimer);});region.addEventListener('pointerleave',()=>{hovered.delete(region);scheduleResume(true);});region.addEventListener('focusin',()=>clearTimeout(resumeTimer));region.addEventListener('focusout',()=>setTimeout(scheduleResume,0));});
 demo.removeAttribute('tabindex');demo.setAttribute('role','group');demo.setAttribute('aria-label','Интерактивная карточка Леона');
 cards.forEach((card,i)=>card.addEventListener('click',()=>perform(i)));
 demo.addEventListener('keydown',e=>{if(e.key==='Escape'&&manual){e.preventDefault();resetManual();}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.18;sync();},{threshold:[0,.18]}).observe(demo);
 document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);addEventListener('resize',measure,{passive:true});document.fonts.ready.then(()=>{measure();pose(elapsed%period);});measure();pose(0);
})();
