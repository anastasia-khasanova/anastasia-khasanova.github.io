// Two independent, local demonstrations. No Figma prototype or movie runtime.
(async()=>{
const assets=await fetch('demo-assets.json').then(r=>{if(!r.ok)throw Error('Demo assets unavailable');return r.json();});
const img=(node,name)=>assets[`${node}-${name}`];
const emotionStates=await fetch('emotion-states.json').then(r=>r.json());
const [peopleSource,peopleGeometry,yearEventGeometry]=await Promise.all([fetch('people-source.html').then(r=>r.text()),fetch('people-catalog.json').then(r=>r.json()),fetch('year-event-geometry.json').then(r=>r.json())]);
// The original icon assets have 10% fill alpha; active silhouettes are opaque black.
const iconFilter=document.createElement('div');iconFilter.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';iconFilter.setAttribute('aria-hidden','true');
iconFilter.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs><filter id="search-active-icon-solid" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="0" intercept="0"/><feFuncG type="linear" slope="0" intercept="0"/><feFuncB type="linear" slope="0" intercept="0"/><feFuncA type="linear" slope="10" intercept="0"/></feComponentTransfer></filter></defs></svg>';document.body.appendChild(iconFilter);
const emotions=['Восторг','Стресс','Победы','Уединение','Боль','Любовь','Веселье','Страх'];
const petalIds=['2003:17780','2003:17790','2003:17792','2003:17788','2003:17784','2003:17778','2003:17782','2003:17786'];
const tones=['#4A7A71','#458D93','#4F8FB3','#627FB3','#7C74A6','#9670A6','#A66B7D','#A66B5B'];
// Four illustrative stories reuse the case's local photographs and portraits.
const memoryCases=[
 {tags:[7,4,2],photo:'imgImage16',rotation:0,title:'Первая поездка на горнолыжку Эльбруса',place:'Горнолыжный курорт Эльбрус',date:'28.05.2022',time:'09:15',temperature:'+2°C',people:[0,1,2],paragraphs:['Мой мучительный получасовой спуск с горы, с падениями и бесконечным дрожанием ног, страхом, что собьют другие сноубордисты или лыжники.','Для меня это была маленькая победа, которая заканчивалась дикой болью в ногах и нежеланием повторять это снова в ближайшее время…']},
 {tags:[0,6,2],photo:'imgImage4',rotation:-135,title:'Тот самый матч до заката',place:'Волейбольная площадка у пляжа',date:'16.07.2023',time:'17:40',temperature:'+26°C',people:[0,2],paragraphs:['Мы с Мишей и Семёном собирались сыграть всего одну партию, но остались на площадке до самого вечера. Песок был повсюду, а счёт мы постоянно забывали.','Последний мяч всё-таки оказался нашим. Помню смех, усталые руки и то чувство, когда обычный день вдруг становится одним из любимых.']},
 {tags:[3,1],photo:'imgImage5',rotation:-135,title:'Вечер на склоне вдвоём',place:'Освещённый склон за городом',date:'18.02.2023',time:'20:35',temperature:'−4°C',people:[0],paragraphs:['Мы с Мишей дождались, когда на склоне станет тише. После шумной недели хотелось просто выдохнуть, посмотреть на огни внизу и никуда не торопиться.','Сделали ещё один спуск, а потом долго грелись чаем. От этого вечера осталось ощущение близости и спокойствия, которое хочется сохранить.']},
 {tags:[5],photo:'imgImage9',rotation:-135,title:'Вдвоём у моря',place:'Тихая бухта у моря',date:'21.08.2023',time:'18:10',temperature:'+27°C',people:[0],paragraphs:['Мы с Мишей остановились посмотреть на море. Никуда не спешили: слушали волны, разглядывали лодки и просто сидели рядом.','Вроде бы ничего особенного не произошло. Но именно такие моменты хочется запомнить: когда любимый человек рядом и больше ничего не нужно.']}
];
function chooseMemory(cases,selected,lastIndex){const scores=cases.map(c=>c.tags.filter(t=>selected.has(t)).length),best=Math.max(...scores);let pool=cases.map((_,i)=>i).filter(i=>scores[i]===best);if(pool.length>1)pool=pool.filter(i=>i!==lastIndex);return pool[Math.floor(Math.random()*pool.length)];}
const MAX_SEARCH_PEOPLE=5;
function personMemoryCount(person,year){return year===undefined?person.lifetimeCount:Number(person.brightMemoryCounts[String(year)]||0);}

const yearData=Array.from({length:9},(_,i)=>({year:2018+i,src:img('92:4423',`img${2046+i}`)}));
const yearStories=await fetch('year-memory-stories.json').then(r=>r.json());
const yearPhotoSources=await fetch('year-photo-sources.json').then(r=>r.json());
const yearPhoto=i=>yearPhotoSources[String(i)].src;
const photoRotations=Object.fromEntries(Object.values(yearPhotoSources).map(photo=>[photo.src,photo.rotation]));
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const icon=(name)=>`<img alt="" src="${img('103:4676',name)}">`;
const home='<button type="button" class="demo-home" aria-label="Вернуться к выбору режима">⌂</button>';
for(const root of document.querySelectorAll('.memory-demo')){
 const mode=root.dataset.demo,menu=root.querySelector('.demo-menu'),years=root.querySelector('.demo-years'),memory=root.querySelector('.demo-memory');
 let auto=false,visible=false,clock=0,last=null,state='menu',current=2022,selection=new Set(),autoStep=-1,suppressClickUntil=0,networkMotion=!reduce.matches,lastMemory=-1;
 const toolbar=root.querySelector('.demo-toolbar'),play=root.querySelector('.demo-play');
 const hint=root.querySelector('.demo-hint');
 if(mode==='search'){toolbar.classList.add('random-demo-toolbar');const restart=toolbar.querySelector('.demo-restart');restart.innerHTML='<span aria-hidden="true">↺</span><span>Начать заново</span>';restart.setAttribute('aria-label','Начать заново: сбросить выбранные фильтры');hint.classList.add('random-demo-hint','search-demo-hint');hint.innerHTML='Выберите эмоции и людей<br>и откройте конкретное воспоминание';}
 if(mode==='random'){toolbar.classList.add('random-demo-toolbar');hint.classList.add('random-demo-hint');hint.innerHTML='Выберите эмоции и людей<br>и откройте воспоминание';const restart=toolbar.querySelector('.demo-restart');restart.innerHTML='<span aria-hidden="true">↺</span><span>Начать заново</span>';restart.setAttribute('aria-label','Начать заново: вернуться к выбору эмоций');root.addEventListener('pointerdown',()=>root.classList.add('has-interacted'));root.addEventListener('keydown',()=>root.classList.add('has-interacted'));}
 root.addEventListener('click',()=>{root.classList.add('has-interacted');hint.hidden=true;});
 root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){root.classList.add('has-interacted');hint.hidden=true;}});
 // Lift the toolbar above the foreground chair and vignette without moving the scene.
 const presentation=root.closest('.mobile-demo-block')||root.closest('.design-section,.mobile-visual');
 presentation.appendChild(toolbar);
 presentation.appendChild(hint);
 root.style.setProperty('--petal-mask',`url("${img('103:4676','imgBaseVector')}")`);
 const announce=root.querySelector('.demo-announcement');
 function announceText(text){announce.textContent=text;}
 function renderPlay(){const playing=mode==='random'?networkMotion:auto;play.hidden=true;play.innerHTML=`<span class="${playing?'pause-icon':'play-icon'}" aria-hidden="true"></span>`;play.setAttribute('aria-label',mode==='random'?(playing?'Приостановить движение связей':'Продолжить движение связей'):(playing?'Приостановить демонстрацию':'Запустить демонстрацию'));root.classList.toggle('is-network-paused',mode==='random'&&!networkMotion);}

 function stop(){auto=false;renderPlay();}
 function setState(next){state=next;root.dataset.state=next;toolbar.hidden=next==='menu'&&!selection.size&&!selectedPeople.size;hint.hidden=next!=='menu'||root.classList.contains('has-interacted');for(const el of [menu,years,memory]){const active=el.classList.contains(`demo-${next}`);el.inert=!active;el.setAttribute('aria-hidden',String(!active));}renderPlay();}
 const control=menu.querySelector('[data-node-id="103:4956"]');
 {
  for(const [id,cls] of [['103:4957','demo-find'],['635:11785','demo-random']]){const old=menu.querySelector(`[data-node-id="${id}"]`);const button=document.createElement('button');for(const attr of old.attributes)button.setAttribute(attr.name,attr.value);button.type='button';button.classList.add(cls,'source-control');button.innerHTML=old.innerHTML;old.replaceWith(button);if(cls==='demo-find'&&mode==='random'){button.setAttribute('aria-disabled','true');button.tabIndex=-1;}}
 }

 const petals=petalIds.map((id,i)=>{const el=menu.querySelector(`[data-node-id="${id}"]`);el.classList.add('emotion-petal');el.style.setProperty('--tone',tones[i]);el.style.setProperty('--hint-delay',(i*.8)+'s');const button=document.createElement('button');button.type='button';button.className='petal-hit';button.setAttribute('aria-label',emotions[i]);button.setAttribute('aria-pressed','false');button.addEventListener('click',e=>{stop();if(selection.has(i))selection.delete(i);else selection.add(i);updatePetals();announceText(selection.size?`Выбраны эмоции: ${[...selection].map(i=>emotions[i]).join(', ')}`:'Все эмоции');});const target=el.querySelector('[data-name="Element"]')||el;
 {button.addEventListener('pointermove',e=>{el.classList.add('hovered');});button.addEventListener('pointerleave',()=>el.classList.remove('hovered'));}

 {el.classList.add('exact-emotion');const base=img('103:4676','imgBaseVector');target.innerHTML=`<div class="emotion-idle"><img alt="" src="${base}"></div><div class="emotion-hover">${emotionStates[i].hover}</div><div class="emotion-click">${emotionStates[i].click}</div>`;}
 target.appendChild(button);return el;});
 function updatePetals(){petals.forEach((el,i)=>{el.classList.toggle('selected',selection.has(i));el.querySelector('button').setAttribute('aria-pressed',String(selection.has(i)));});updateSearchFilters();}
 let filterReturn=null,searchRevision=0;const storyCache=new Map(),lastStories=new Map();
 function pickYearStory(year){const key=[year,searchRevision,[...selection].sort(),[...selectedPeople.keys()].sort()].join('|');if(storyCache.has(key))return storyCache.get(key);const scores=yearStories.map(story=>story.tags.filter(id=>selection.has(id)).length*3+story.peopleNames.filter(name=>[...selectedPeople.values()].some(p=>p.name===name)).length),best=Math.max(...scores);let pool=yearStories.filter((story,i)=>scores[i]===best);if(pool.length>1)pool=pool.filter(story=>story.id!==lastStories.get(year));let seed=2166136261;for(const c of key)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;const selected=pool[seed%pool.length],story={...selected,src:selected.photo==='night'?yearData.find(d=>d.year===2022).src:yearPhoto(selected.photo),date:selected.dayMonth+'.'+year,textTone:selected.photo==='night'?'light':yearPhotoSources[String(selected.photo)].textTone,weatherIcon:img('75:249','imgIconSun')};storyCache.set(key,story);lastStories.set(year,story.id);return story;}
 const selectedPeople=new Map();let peopleLayer=null,searchBackground=null,peopleChips=null,emotionChips=null;
 function refreshPersonCounts(){
  if(!peopleLayer)return;
  for(const card of peopleLayer.querySelectorAll('.search-person')){
   const person=peopleGeometry.find(p=>p.id===card.dataset.person),count=personMemoryCount(person);
   card.dataset.memoryCount=String(count);card.querySelector('.person-count-value').textContent=String(count);
   card.querySelector('.search-person-hit').setAttribute('aria-label',person.name+', '+count+' ярких воспоминаний за всю жизнь');
  }
 }
 function positionPersonDetails(card,container){
  const bounds=card.getBoundingClientRect(),frame=root.getBoundingClientRect(),w=bounds.width;if(!w)return;
  card.classList.add('is-positioning-details');
  const x=bounds.left+w/2,y=bounds.top+bounds.height/2;
  const obstacles=[...container.querySelectorAll('.search-person,.year-card,.demo-filters button,.demo-find,.demo-random')].filter(n=>n!==card).map(n=>{const b=n.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,r:Math.max(b.width,b.height)/2};}).filter(c=>c.r>0);
  const preferred=x>=frame.left+frame.width/2?-90:90;
  const fit=window.fitPersonDetails({x,y,w,frame,obstacles,preferred,nameLength:card.querySelector('.person-detail-name').textContent.length,textSize:Math.max(16,parseFloat(card.style.width)*.2133)*w/parseFloat(card.style.width)});
  card.style.setProperty('--detail-fit-turn',fit.angle+'deg');card.style.setProperty('--detail-fit-unturn',(-fit.angle)+'deg');card.style.setProperty('--detail-fit-scale',String(fit.scale));
  card.style.setProperty('--detail-label-correction','0px');
  const label=card.querySelector('.person-detail-name'),counter=card.querySelector('.person-count'),native=card.querySelector('.person-details-native');
  if(window.getComputedStyle){const lb=label.getBoundingClientRect(),cb=counter.getBoundingClientRect(),angle=fit.angle*Math.PI/180,dx=-Math.sin(angle),dy=Math.cos(angle),extent=Math.abs(dx)*lb.width/2+Math.abs(dy)*lb.height/2,gap=((lb.left+lb.width/2)-(cb.left+cb.width/2))*dx+((lb.top+lb.height/2)-(cb.top+cb.height/2))*dy-w*fit.scale/2-extent,nativeWidth=parseFloat(window.getComputedStyle(native).getPropertyValue('--native-width')),scale=w*fit.scale/nativeWidth;if(scale>0)card.style.setProperty('--detail-label-correction',((5-gap)/scale)+'px');}
  counter.getBoundingClientRect();card.classList.remove('is-positioning-details','details-pending');
 }
 function updateSearchFilters(){
  if(!searchBackground)return;
  toolbar.hidden=state==='menu'&&!selection.size&&!selectedPeople.size;
  const positions=[[50,0],[85,8],[100,50],[85,92],[50,100],[15,92],[0,50],[15,8]];
  searchBackground.innerHTML=[...selection].map(i=>`<span data-emotion="${emotions[i]}" style="--color:${tones[i]};--x:${positions[i][0]}%;--y:${positions[i][1]}%"></span>`).join('');
  emotionChips.replaceChildren();
  [...selection].forEach((i,n)=>{
   const item=document.createElement('span');item.className='search-emotion-mini';item.setAttribute('role','listitem');item.style.zIndex=String(selection.size-n);
   const remove=document.createElement('button');remove.type='button';remove.className='search-emotion-remove';remove.dataset.emotionIndex=String(i);remove.setAttribute('aria-label','Убрать эмоцию: '+emotions[i]);remove.title='Убрать: '+emotions[i];
   remove.innerHTML=`<img class="emotion-mini-backing" alt="" src="assets/emotion-mini-${i}.svg" style="transform:scale(${i>=6?1/3:.5})"/><img alt="" src="assets/emotion-mini-${i}.svg" style="transform:scale(${i>=6?1/3:.5})"/>`;
   remove.addEventListener('click',()=>{selection.delete(i);updatePetals();announceText('Эмоция '+emotions[i]+' убрана из поиска');});
   item.appendChild(remove);emotionChips.appendChild(item);
  });
  emotionChips.hidden=selection.size===0;
  root.classList.toggle('has-search-emotions',selection.size>0);
  root.classList.toggle('has-search-people',selectedPeople.size>0);
  root.classList.toggle('has-both-search-filters',selection.size>0&&selectedPeople.size>0);
  root.querySelectorAll('.emotion-filter').forEach(b=>b.setAttribute('aria-pressed',String(root.dataset.searchView==='emotions'&&(selection.size>0||root.dataset.filterVisited==='true'))));
  root.querySelectorAll('.people-filter').forEach(b=>b.setAttribute('aria-pressed',String(root.dataset.searchView==='people'&&(selectedPeople.size>0||root.dataset.filterVisited==='true'))));
  peopleChips.replaceChildren();
  for(const [id,person] of selectedPeople){
   const remove=document.createElement('button');remove.type='button';remove.className='search-person-chip';remove.dataset.person=id;remove.setAttribute('aria-label','Убрать из поиска: '+person.name);remove.title='Убрать: '+person.name;
   const portrait=document.createElement('img');portrait.src=person.src;portrait.alt='';remove.appendChild(portrait);
   remove.addEventListener('click',()=>{selectedPeople.delete(id);updateSearchFilters();announceText(person.name+' убран из поиска');});
   peopleChips.appendChild(remove);
  }
  peopleChips.hidden=selectedPeople.size===0;root.dataset.selectedPeople=String(selectedPeople.size);
  const atLimit=selectedPeople.size>=MAX_SEARCH_PEOPLE;
  for(const button of peopleLayer.querySelectorAll('.search-person-hit')){
   const selected=selectedPeople.has(button.dataset.person);button.setAttribute('aria-pressed',String(selected));button.disabled=atLimit&&!selected;
  }
  refreshPersonCounts();
  const summary=years.querySelector('.search-filter-summary');
  if(summary)summary.textContent=[...selection].map(i=>emotions[i]).concat([...selectedPeople.values()].map(p=>p.name)).join(' · ');
 }
 function showSearchView(view,local=false){
  filterReturn=local?{year:current,state}:null;
  stop();setState('menu');root.dataset.searchView=view;root.dataset.filterVisited='true';peopleLayer.hidden=view!=='people';
  root.querySelectorAll('.emotion-filter').forEach(b=>b.setAttribute('aria-pressed',String(root.dataset.searchView==='emotions'&&(selection.size>0||root.dataset.filterVisited==='true'))));
  root.querySelectorAll('.people-filter').forEach(b=>b.setAttribute('aria-pressed',String(root.dataset.searchView==='people'&&(selectedPeople.size>0||root.dataset.filterVisited==='true'))));
  updateSearchFilters();
  announceText(view==='people'?'Выберите до 5 людей на орбитах. Повторное нажатие снимает выбор':'Выберите одну или несколько эмоций');
 }
 {
  root.dataset.searchView='emotions';root.dataset.emotionMatch='any';root.dataset.peopleMatch='all';toolbar.classList.add('search-demo-toolbar');
  if(mode==='search'){const dormant=menu.querySelector('.demo-random');dormant.disabled=true;dormant.setAttribute('aria-disabled','true');}else{const dormant=menu.querySelector('.demo-find');dormant.disabled=true;dormant.setAttribute('aria-disabled','true');}
  for(let i=0;i<(mode==='search'?2:0);i++){const wave=document.createElement('span');wave.className='find-invite-wave';wave.setAttribute('aria-hidden','true');wave.style.animationDelay=(i*1.8)+'s';menu.querySelector('.demo-find').appendChild(wave);}
  const bar=menu.querySelector('[data-node-id="558:8326"]');bar.classList.add('demo-filters','source-filter-bar');
  for(const [id,cls,label] of [['I558:8326;558:8312','emotion-filter','Выбрать эмоции'],['I558:8326;558:8313','people-filter','Выбрать людей']]){
   const old=bar.querySelector(`[data-node-id="${id}"]`),b=document.createElement('button');
   for(const a of old.attributes)b.setAttribute(a.name,a.value);
   b.type='button';b.classList.add(cls);b.setAttribute('aria-label',label);b.setAttribute('aria-pressed','false');b.innerHTML=old.innerHTML;old.replaceWith(b);
  }
  const template=document.createElement('template');template.innerHTML=peopleSource;
  peopleLayer=document.createElement('div');peopleLayer.className='search-people-layer';peopleLayer.hidden=true;peopleLayer.setAttribute('role','group');peopleLayer.setAttribute('aria-label','Выбор людей на орбитах');
  const original=template.content.querySelector('[data-node-id="575:10768"]'),orbits={};
  for(const [ring,sourceId] of [['inner','575:10534'],['outer','575:10535']]){
   const orbit=document.createElement('div');orbit.className='search-person-orbit search-orbit-'+ring;orbit.dataset.ring=ring;
   const nativeRing=original.querySelector(`[data-node-id="${sourceId}"]`).cloneNode(true);
   nativeRing.querySelectorAll('[data-name="Name-satellite"]').forEach(n=>n.remove());orbit.appendChild(nativeRing);peopleLayer.appendChild(orbit);orbits[ring]=orbit;
  }
  for(const person of peopleGeometry){
   const card=document.createElement('div');card.className='search-person';card.dataset.person=person.id;card.dataset.width=String(person.w);
   card.style.cssText=`left:${person.x}px;top:${person.y}px;width:${person.w}px;height:${person.w}px;--person-width:${person.w}px`;
   const family=person.w>=85?'XL':person.w>=68?'L':person.w>=46?'M':'S',nativeWidth={XL:125,L:100,M:93.75,S:62.5}[family];
   const details=document.createElement('div');details.className='person-details';
   const native=document.createElement('div');native.className='person-details-native';native.style.cssText=`--native-width:${nativeWidth}px;--detail-text-size:${Math.max(16,person.w*.2133)/(person.w/nativeWidth)}px;--detail-name-length:${person.name.length};--detail-name-gap:${4/(person.w/nativeWidth)}px;transform:scale(${person.w/nativeWidth})`;
   native.innerHTML=`<img class="person-detail-body" alt="" src="assets/person-hover-${family}.svg"/><span class="person-count"><span class="person-count-value"></span></span><span class="person-detail-name"></span>`;
   native.querySelector('.person-detail-name').textContent=person.name;details.appendChild(native);
   const face=document.createElement('span');face.className='search-person-face';const portrait=document.createElement('img');portrait.src=person.src;portrait.alt='';face.appendChild(portrait);
   const hit=document.createElement('button');hit.type='button';hit.className='search-person-hit';hit.dataset.person=person.id;hit.setAttribute('aria-pressed','false');
   details.addEventListener('click',e=>{e.stopPropagation();hit.click();});
   hit.addEventListener('click',()=>{
    if(selectedPeople.has(person.id)){selectedPeople.delete(person.id);}
    else if(selectedPeople.size>=MAX_SEARCH_PEOPLE){return;}
    else{selectedPeople.set(person.id,{name:person.name,src:person.src});}
    updateSearchFilters();announceText(selectedPeople.size?'Выбраны: '+[...selectedPeople.values()].map(p=>p.name).join(', '):'Выбор людей снят');
   });
   card.dataset.detailSide=person.x+person.w/2>=1027.42?'right':'left';
   const positionDetails=()=>positionPersonDetails(card,peopleLayer);
   card.addEventListener('pointerenter',positionDetails);card.addEventListener('focusin',positionDetails);
   card.append(details,face,hit);orbits[person.ring].appendChild(card);
  }
  const canvas=menu.querySelector('[data-node-id="103:4676"]');searchBackground=document.createElement('div');searchBackground.className='emotion-background search-emotion-background';canvas.prepend(searchBackground);canvas.appendChild(peopleLayer);
  emotionChips=document.createElement('div');emotionChips.className='search-selected-emotions';emotionChips.setAttribute('role','list');emotionChips.setAttribute('aria-label','Выбранные эмоции');emotionChips.hidden=true;
  peopleChips=document.createElement('div');peopleChips.className='search-selected-people';peopleChips.hidden=true;peopleChips.setAttribute('aria-label','Выбранные люди');
  const filterStack=document.createElement('div');filterStack.className='search-filter-stack';bar.before(filterStack);filterStack.append(bar,emotionChips,peopleChips);
 }
 // Keep the original navigation assets; repair their exported group coordinates.
 if(mode==='random'){
  memory.querySelector('.source-memory-date')?.remove();
  memory.querySelector('.source-return')?.remove();
  const nav=memory.querySelector('[data-node-id="531:8548"]');
  nav.classList.add('source-memory-nav');
  function navButton(nodeId,className,label){const slot=nav.querySelector(`[data-node-id="${nodeId}"]`),old=slot.querySelector('[data-name="Home"]'),button=document.createElement('button');button.type='button';button.disabled=true;button.tabIndex=-1;button.className=old.className+' '+className;button.setAttribute('aria-label',label);button.innerHTML=old.innerHTML;old.replaceWith(button);return button;}
  navButton('I531:8548;635:11364','source-return','Вернуться к выбору эмоций');
  navButton('I531:8548;635:11366','source-change-emotions','Изменить выбранные эмоции').addEventListener('click',()=>{stop();setState('menu');announceText('Выбранные эмоции сохранены. Можно изменить выбор');});
  const peopleButton=navButton('I531:8548;635:11365','source-show-people','Показать людей из воспоминания');
  peopleButton.setAttribute('aria-pressed','false');
  peopleButton.addEventListener('click',()=>{const active=root.classList.toggle('highlight-memory-people');peopleButton.setAttribute('aria-pressed',String(active));announceText(active?'Люди из воспоминания: Миша, Таня, Семён':'Подсветка людей выключена');});
  const pins=memory.querySelector('[data-node-id="672:10548"]');pins.classList.add('source-pinned-emotions');pins.setAttribute('role','list');pins.setAttribute('aria-label','Эмоции этого воспоминания');
 }
 function applyMemoryEmotions(){
  const chosen=[...selection];
  const pins=memory.querySelector('.source-pinned-emotions');
  pins.hidden=chosen.length===0;
  const columns=Math.max(1,Math.min(chosen.length,4)),rows=Math.max(1,Math.ceil(chosen.length/4));
  pins.style.width=(83+(columns-1)*42.5)+'px';pins.style.height=(82+(rows-1)*70)+'px';pins.style.left=(columns===4?904.5:923.5)+'px';
  pins.innerHTML=chosen.map((i,n)=>`<span class="source-pinned-emotion" role="listitem" aria-label="${emotions[i]}" data-emotion="${emotions[i]}" style="left:${(n%4)*42.5}px;top:${Math.floor(n/4)*70}px;z-index:${n+1}"><span class="source-pinned-art" aria-hidden="true">${emotionStates[i].click}</span><span class="source-pinned-label">${emotions[i]}</span></span>`).join('');
  // Match the reference's warm upper, violet lower and blue left blooms.
  const positions=[[46.44,23.81],[46.44,73.85],[22.89,47.76],[69.99,47.76],[22.89,23.81],[69.99,73.85],[22.89,73.85],[69.99,23.81]];
  memory.querySelector('.emotion-background').innerHTML=chosen.map((i,n)=>`<span data-emotion="${emotions[i]}" style="--color:${tones[i]};--x:${positions[n][0]}%;--y:${positions[n][1]}%;--strength:${chosen.length>4?.28:.4}"></span>`).join('');
  root.classList.toggle('has-emotions',chosen.length>0);root.dataset.emotionCount=String(chosen.length);
  return chosen;
 }
 function applyMemoryStory(){
  lastMemory=chooseMemory(memoryCases,selection,lastMemory);let story=memoryCases[lastMemory];
  if(selectedPeople.size){const available=matchingYears();if(!available.length){announceText('Нет воспоминаний с выбранной комбинацией людей. Измените фильтры.');setState('menu');return null;}current=available[Math.floor(Math.random()*available.length)];searchRevision++;const chosen=pickYearStory(current);story={...chosen,photoSrc:chosen.src,rotation:(photoRotations[chosen.src]||0)-135,paragraphs:[chosen.description,''],people:[]};}

  const photo=memory.querySelector('.source-network-photo[data-source-node="I531:8157;530:7495;508:8322;422:13918"]');
  photo.querySelector('img').src=story.photoSrc||img('75:249',story.photo);photo.querySelector('img').alt=story.place;
  photo.style.setProperty('--memory-photo',`url("${story.photoSrc||img('75:249',story.photo)}")`);photo.style.setProperty('--memory-photo-rotation',story.rotation+'deg');
  memory.querySelector('[data-node-id="I635:11690;635:11623"] p').textContent=story.title;
  memory.querySelector('[data-node-id="I635:11690;635:11628"]').textContent=story.place;
  const paragraphs=memory.querySelectorAll('[data-node-id="I635:11690;635:11637"] p');paragraphs[0].textContent=story.paragraphs[0];paragraphs[2].textContent=story.paragraphs[1];
  ['Миша','Таня','Семён'].forEach((name,i)=>{const person=memory.querySelector(`[data-node-id="I635:11690;635:116${33+i}"]`);person.style.display=story.people.includes(i)?'':'none';});
  const members=memory.querySelector('[data-node-id="I635:11690;635:11632"]');members.querySelectorAll('.random-selected-member').forEach(n=>n.remove());
  if(selectedPeople.size){const template=members.querySelector('[data-name="Name-satellite"]');for(const person of selectedPeople.values()){const member=template.cloneNode(true);member.classList.add('random-selected-member');member.style.display='flex';for(const element of [member,...member.querySelectorAll('[data-node-id]')])element.removeAttribute('data-node-id');member.querySelector('img').src=person.src;member.querySelector('p').textContent=person.name;members.appendChild(member);}}
  memory.querySelector('[data-node-id="531:8178"] p').textContent=story.temperature;
  memory.querySelector('[data-node-id="531:8181"] p').textContent=story.time;
  memory.querySelector('[data-node-id="I531:8548;635:11371"] p').textContent=story.date;
  return story;
 }
 const cards=yearData.map(d=>`<button type="button" class="year-card" data-year="${d.year}" aria-label="Выбрать ${d.year} год"><span class="year-card-invitation" aria-hidden="true"><span></span><span></span></span><span class="memory-orb"><img alt="" src="${d.src}" loading="lazy"></span><span class="year-label">${d.year}</span></button>`).join('');
 years.innerHTML=`<div class="demo-filters">${(control.querySelector('.demo-filters')?.innerHTML||'')}</div><div class="year-track" role="group" aria-label="Годы жизни">${cards}</div><div class="year-navigation"><button type="button" class="year-prev" aria-label="Предыдущий год">‹</button><button type="button" class="year-open">Открыть <span>2022</span></button><button type="button" class="year-next" aria-label="Следующий год">›</button></div><div class="demo-timeline year-native-timeline"><img alt="" src="assets/year-timeline-home.svg" width="2313" height="253">${home}</div>`;
 if(mode!=='random') memory.innerHTML=`<div class="memory-network" aria-hidden="true">${[0,45,90,135].map(a=>`<img class="demo-branch" style="--angle:${a}deg" src="${img('75:249','imgNeuron')}">`).join('')}${[0,1,2,3,4].map((v)=>`<span class="satellite satellite-${v} memory-orb"><img alt="" src="${img('75:249',`imgImage${[14,18,22,34,36][v]}`)}"></span>`).join('')}</div><div class="memory-focus memory-orb"><img alt="Горнолыжный курорт Эльбрус" src="${img('75:249','imgImage16')}"><span class="memory-weather">+2°C ☀</span><span class="memory-time">09:15</span></div><article class="memory-detail"><h3>Первая поездка<br>на горнолыжку Эльбруса</h3><p class="memory-location">Горнолыжный курорт Эльбрус</p><div class="memory-people">${['Миша','Таня','Семён'].map((name,i)=>`<span><img alt="" src="${img('75:249',`imgImage${38+i}`)}">${name}</span>`).join('')}</div><p>Мой мучительный получасовой спуск с горы, с падениями и бесконечным дрожанием ног, страхом, что собьют другие сноубордисты или лыжники.</p><p>Для меня это была маленькая победа, которая закончилась дикой болью в ногах и лёгким нежеланием повторять это снова в ближайшее время…</p><div class="memory-emotions"><span>Страх</span><span>Боль</span><span>Победы</span></div></article><div class="demo-memory-date">28.05.2022</div><div class="demo-timeline">${home}</div><button type="button" class="demo-again">Ещё воспоминание ↗</button>`;
 if(mode==='search'){years.querySelector('.demo-filters').innerHTML=['emotion','people'].map((kind,i)=>`<button type="button" class="${kind}-filter native-year-filter" aria-label="${i?'Выбрать людей':'Выбрать эмоции'}"><img alt="" width="150" height="150" src="assets/year-filter-${i}.svg"></button>`).join('');}
 if(mode==='search'){const summary=document.createElement('p');summary.className='search-filter-summary';summary.setAttribute('aria-live','polite');years.appendChild(summary);}
 const yearOrbitStarted=Date.now();
 let yearShowEmotions=false,yearShowPeople=false,yearOrbitTemplate=null,yearOrbitTemplateYear=null;
 function renderYearFilters(){
  if(mode!=='search'||!years.querySelector('.year-track'))return;
  years.querySelector('.year-filter-scene')?.remove();
  root.classList.toggle('years-have-people',selectedPeople.size>0);
  yearShowEmotions=yearShowEmotions||selection.size>0;yearShowPeople=yearShowPeople||selectedPeople.size>0;
  if((!yearShowEmotions&&!yearShowPeople)||!matchingYears().length)return;
  root.classList.toggle('years-have-people',selectedPeople.size>0);
  const scene=document.createElement('div');scene.className='year-filter-scene';scene.setAttribute('aria-label','Фильтры выбранного года');
  const backdrop=searchBackground.cloneNode(true);backdrop.className='emotion-background search-emotion-background year-emotion-background';scene.appendChild(backdrop);
  const petals=document.createElement('div');petals.className='year-emotion-petals';petals.hidden=!yearShowEmotions;
  petals.innerHTML=emotions.map((name,i)=>`<div class="year-emotion-slot" style="rotate:${i*45}deg"><div class="year-emotion-art" data-emotion="${name}" data-selected="${selection.has(i)}" style="--year-tone:${tones[i]}" aria-label="${name}"><div><img alt="" width="160" height="78" src="assets/year-medium-${selection.has(i)?i:8}.svg"></div></div></div>`).join('');scene.appendChild(petals);
  petals.querySelectorAll('.year-emotion-art').forEach((art,i)=>{const button=document.createElement('button');button.type='button';button.className='year-emotion-remove';button.setAttribute('aria-pressed',String(selection.has(i)));button.setAttribute('aria-label',(selection.has(i)?'Убрать эмоцию: ':'Добавить эмоцию: ')+emotions[i]);button.addEventListener('click',e=>{e.stopPropagation();const removing=selection.has(i);if(removing)selection.delete(i);else selection.add(i);updatePetals();chooseYear(current);announceText('Эмоция '+emotions[i]+(removing?' убрана из поиска':' добавлена в поиск'));});while(art.firstChild)button.appendChild(art.firstChild);art.appendChild(button);});
  if(yearOrbitTemplateYear!==current){yearOrbitTemplate=null;yearOrbitTemplateYear=current;}
  const orbit=(yearOrbitTemplate||peopleLayer.querySelector('.search-orbit-inner')).cloneNode(true);orbit.className='year-people-orbit';orbit.hidden=!yearShowPeople;orbit.style.animationDelay=String(-(Date.now()-yearOrbitStarted)/1000)+'s';
  if(!yearOrbitTemplate){
   const slots=[...orbit.querySelectorAll('.search-person')];
   const rank=person=>{let value=2166136261;for(const c of String(current)+':roster:'+person.id)value=Math.imul(value^c.charCodeAt(0),16777619)>>>0;return value;};
   const chosen=[...selectedPeople.keys()].map(id=>peopleGeometry.find(p=>p.id===id));
   const count=Math.min(slots.length,Math.max(chosen.length,Math.min(6+(current-2018)%4,peopleGeometry.filter(p=>p.memoryYears.includes(current)).length)));
   const roster=chosen.concat(peopleGeometry.filter(p=>!selectedPeople.has(p.id)&&p.memoryYears.includes(current)).sort((a,b)=>rank(a)-rank(b))).slice(0,count);
   const positions=new Map(Array.from({length:count},(_,i)=>[Math.floor(i*slots.length/count),i]));
   slots.forEach((slot,i)=>{if(!positions.has(i)){slot.remove();return;}const person=roster[positions.get(i)],replacement=peopleLayer.querySelector(`.search-person[data-person="${person.id}"]`).cloneNode(true),cx=parseFloat(slot.style.left)+parseFloat(slot.style.width)/2,cy=parseFloat(slot.style.top)+parseFloat(slot.style.height)/2;replacement.style.left=(cx-person.w/2)+'px';replacement.style.top=(cy-person.w/2)+'px';slot.replaceWith(replacement);});
  }
  const slots=[...orbit.querySelectorAll('.search-person')];
  const missing=[...selectedPeople.keys()].filter(id=>!slots.some(c=>c.dataset.person===id));
  for(const id of missing){
   const slot=slots.find(c=>!selectedPeople.has(c.dataset.person)&&c.parentNode);
   if(!slot)break;
   const replacement=peopleLayer.querySelector(`.search-person[data-person="${id}"]`).cloneNode(true);
   replacement.style.left=slot.style.left;replacement.style.top=slot.style.top;slot.replaceWith(replacement);
  }
  // Allocate the full circle to this year's roster, rather than placing large
  // portraits in tightly spaced slots originally drawn for small portraits.
  const spacedCards=[...orbit.querySelectorAll('.search-person')];
  spacedCards.forEach((card,i)=>{
   const person=peopleGeometry.find(p=>p.id===card.dataset.person),count=personMemoryCount(person,current);
   const w=count<=1?31.25:count<=3?46.875:count<=5?50:count<=8?62.5:count<=12?68.25:75;
   card.style.width=w+'px';card.style.height=w+'px';card.style.setProperty('--person-width',w+'px');card.dataset.width=String(w);card.dataset.memoryCount=String(count);
   const native=card.querySelector('.person-details-native'),nativeWidth=parseFloat(native.style.getPropertyValue('--native-width')),scale=w/nativeWidth;
   native.style.transform='scale('+scale+')';native.style.setProperty('--detail-text-size',Math.max(16,w*.2133)/scale+'px');native.style.setProperty('--detail-name-gap',4/scale+'px');
   const angle=(-110+i*360/spacedCards.length)*Math.PI/180;
   card.style.left=(1027.42+278*Math.cos(angle)-w/2)+'px';
   card.style.top=(508.42+278*Math.sin(angle)-w/2)+'px';
  });
  if(!yearOrbitTemplate)yearOrbitTemplate=orbit.cloneNode(true);
  for(const card of orbit.querySelectorAll('.search-person')){
   const person=peopleGeometry.find(p=>p.id===card.dataset.person),expanded=selectedPeople.has(person.id);
   card.classList.remove('details-above');card.classList.toggle('year-person-expanded',expanded);if(expanded)card.classList.add('details-pending');
   card.querySelector('.person-details').addEventListener('click',e=>{e.stopPropagation();card.querySelector('.search-person-hit').click();});
   const hit=card.querySelector('.search-person-hit');hit.disabled=false;hit.setAttribute('aria-pressed',String(expanded));
   card.style.animationDelay=orbit.style.animationDelay;
   card.dataset.detailSide=parseFloat(card.style.left)+parseFloat(card.style.width)/2>=1027.42?'right':'left';
   const orient=()=>positionPersonDetails(card,years);card.addEventListener('pointerenter',orient);card.addEventListener('focusin',orient);
   hit.disabled=!expanded&&selectedPeople.size>=MAX_SEARCH_PEOPLE;
   hit.setAttribute('aria-label',(expanded?'Убрать из поиска: ':'Добавить в поиск: ')+person.name);
   hit.addEventListener('click',e=>{e.stopPropagation();const removing=selectedPeople.has(person.id);if(removing)selectedPeople.delete(person.id);else{if(selectedPeople.size>=MAX_SEARCH_PEOPLE)return;selectedPeople.set(person.id,{name:person.name,src:person.src});}updateSearchFilters();layoutYears();for(const other of orbit.querySelectorAll('.search-person')){const selected=selectedPeople.has(other.dataset.person),button=other.querySelector('.search-person-hit'),data=peopleGeometry.find(p=>p.id===other.dataset.person);other.classList.toggle('year-person-expanded',selected);button.setAttribute('aria-pressed',String(selected));button.disabled=!selected&&selectedPeople.size>=MAX_SEARCH_PEOPLE;button.setAttribute('aria-label',(selected?'Убрать из поиска: ':'Добавить в поиск: ')+data.name);}if(!removing)positionPersonDetails(card,years);announceText(person.name+(removing?' убран из поиска':' добавлен в поиск'));});
   card.querySelector('.person-count-value').textContent=String(personMemoryCount(person,current));
  }
  scene.appendChild(orbit);years.prepend(scene);requestAnimationFrame(()=>{if(scene.parentNode)orbit.querySelectorAll('.year-person-expanded').forEach(card=>positionPersonDetails(card,years));});
 }
 function matchingYears(){return yearData.filter(d=>[...selectedPeople.keys()].every(id=>peopleGeometry.find(p=>p.id===id).memoryYears.includes(d.year))).map(d=>d.year);}
 function layoutYears(){
  const available=matchingYears(),index=available.indexOf(current);
  years.querySelectorAll('.year-card').forEach(el=>{const year=Number(el.dataset.year),position=available.indexOf(year);el.hidden=position<0;el.disabled=position<0;if(mode==='search'){const photo=el.querySelector('img');photo.src=yearData.find(d=>d.year===year).src;photo.style.transform='none';}const distance=position-index,abs=Math.abs(distance);el.style.setProperty('--offset',Math.sign(distance)*(abs===0?0:(mode==='search'&&yearShowPeople?515:mode==='search'&&yearShowEmotions?350:315)+(abs-1)*230)+'px');el.style.setProperty('--size',abs===0?'330px':abs===1?'215px':abs===2?'190px':'165px');el.style.setProperty('--opacity',abs===0?'1':abs===1?'.8':abs===2?'.45':'.18');el.style.setProperty('--blur',abs===0?'0px':abs===1?'2px':'5px');el.classList.toggle('active',position>=0&&!distance);el.setAttribute('aria-pressed',String(position>=0&&!distance));});
  years.querySelector('.year-open span').textContent=current;years.querySelector('.year-prev').disabled=index<=0;years.querySelector('.year-next').disabled=index<0||index===available.length-1;
  let empty=years.querySelector('.year-empty');if(!empty){empty=document.createElement('p');empty.className='year-empty';empty.textContent='Нет воспоминаний с выбранной комбинацией людей. Измените фильтры.';years.appendChild(empty);}empty.hidden=available.length>0;
  return available;
 }
 function chooseYear(year){const available=matchingYears();current=available.includes(year)?year:available.reduce((best,value)=>Math.abs(value-year)<Math.abs(best-year)?value:best,available[0]??year);layoutYears();if(mode==='search'){refreshPersonCounts();renderYearFilters();}}

 function openRandom(user=false){setState('memory');if(mode==='random'){if(!applyMemoryStory())return;const chosen=applyMemoryEmotions();if(user)announceText(chosen.length?'Открыто случайное воспоминание. Эмоции: '+chosen.map(i=>emotions[i]).join(', '):'Открыто случайное воспоминание без выбранных эмоций');return;}root.classList.remove('year-result');memory.querySelector('.memory-detail').hidden=false;memory.querySelector('.memory-focus>img').src=img('75:249','imgImage16');memory.querySelector('.memory-focus>img').alt='Горнолыжный курорт Эльбрус';memory.querySelector('.memory-weather').hidden=false;memory.querySelector('.memory-time').hidden=false;memory.querySelector('.demo-memory-date').textContent='28.05.2022';memory.querySelector('.demo-again').hidden=false;if(user)announceText('Воспоминание: первая поездка на горнолыжку Эльбруса, 28 мая 2022 года');}
 function openYear(){
  root.classList.add('year-result');setState('memory');
  const mainStory=pickYearStory(current);
  const chosenPeople=[...selectedPeople].map(([id,p])=>({id,...p}));
  const pool=[mainStory.src,...yearData.filter(d=>d.year!==current).map(d=>d.src),...Array.from({length:36},(_,i)=>i+1).filter(i=>i!==11&&i!==34).map(i=>yearPhoto(i))];
  window.createYearEvents({host:memory,geometry:yearEventGeometry,year:current,emotionIds:selection,people:chosenPeople,photos:pool,photoRotations,mainStory,emotionStates,variant:searchRevision,eligibleYears:matchingYears(),peopleCatalog:peopleGeometry,photoPeople:Object.fromEntries(memoryCases.map(c=>[img('75:249',c.photo),peopleGeometry.filter(p=>c.people.map(i=>['Миша','Таня','Семён'][i]).includes(p.name))])),onEditFilter:view=>showSearchView(view,true),onRemoveFilter:(kind,id)=>{if(kind==='people')selectedPeople.delete(id);else selection.delete(id);updatePetals();chooseYear(current);if(matchingYears().length)openYear();else setState('years');},onBack:()=>{setState('years');chooseYear(current);announceText('Выбор года');}});
  announceText('События '+current+' года. По горизонтали — события этого года, радиально — ассоциации разных лет');
 }

 menu.querySelector('.demo-find').addEventListener('click',()=>{if(mode==='random')return;stop();yearShowEmotions=selection.size>0;yearShowPeople=selectedPeople.size>0;yearOrbitTemplate=null;searchRevision++;const destination=filterReturn;filterReturn=null;chooseYear(destination?destination.year:2022);if(destination?.state==='memory'&&matchingYears().length)openYear();else setState('years');announceText(matchingYears().length?'Выбран '+current+' год':'Нет воспоминаний с выбранными людьми');});
 menu.querySelector('.demo-random').addEventListener('click',()=>{if(mode!=='random')return;stop();openRandom(true);});
 root.querySelectorAll('.emotion-filter').forEach(el=>el.addEventListener('click',()=>showSearchView('emotions')));
 root.querySelectorAll('.people-filter').forEach(el=>el.addEventListener('click',()=>showSearchView('people')));
 years.querySelectorAll('.year-card').forEach(el=>el.addEventListener('click',()=>{if(Date.now()<suppressClickUntil)return;stop();const year=Number(el.dataset.year);if(year===current)openYear();else{chooseYear(year);announceText(`Выбран ${year} год`);}}));
 function moveYear(delta){stop();const available=matchingYears(),index=available.indexOf(current),target=available[index+delta];if(target===undefined)return;chooseYear(target);announceText(`Выбран ${current} год`);}
 years.querySelector('.year-prev').addEventListener('click',()=>moveYear(-1));years.querySelector('.year-next').addEventListener('click',()=>moveYear(1));years.querySelector('.year-open').hidden=true;
 years.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveYear(e.key==='ArrowLeft'?-1:1);}});
 let pointerStart=null;years.addEventListener('pointerdown',e=>{pointerStart=e.target.closest('.year-filter-scene,.demo-filters,.year-navigation')?null:e.clientX;});years.addEventListener('pointerup',e=>{if(pointerStart!==null&&Math.abs(e.clientX-pointerStart)>35){suppressClickUntil=Date.now()+400;moveYear(e.clientX<pointerStart?1:-1);}pointerStart=null;});years.addEventListener('pointercancel',()=>pointerStart=null);
 root.querySelectorAll('.demo-home').forEach(el=>el.addEventListener('click',()=>{stop();setState('menu');announceText('Стартовый экран');}));memory.querySelector('.demo-again')?.addEventListener('click',()=>{stop();setState('menu');});
 memory.querySelector('.source-return')?.addEventListener('click',()=>{stop();setState('menu');announceText('Выбранные эмоции сохранены');});
 function reset(){filterReturn=null;yearShowEmotions=false;yearShowPeople=false;yearOrbitTemplate=null;root.dataset.filterVisited='false';selectedPeople.clear();if(peopleLayer){peopleLayer.hidden=true;root.dataset.searchView='emotions';root.querySelectorAll('.emotion-filter').forEach(b=>b.setAttribute('aria-pressed','false'));root.querySelectorAll('.people-filter').forEach(b=>b.setAttribute('aria-pressed','false'));}root.classList.remove('has-interacted');clock=0;autoStep=-1;selection.clear();updatePetals();chooseYear(2022);setState('menu');}
 toolbar.querySelector('.demo-restart').addEventListener('click',()=>{stop();reset();announceText('Демонстрация возвращена в начало');});
 play.addEventListener('click',()=>{if(mode==='random'){networkMotion=!networkMotion;renderPlay();return;}auto=!auto;if(auto&&mode!=='random')reset();renderPlay();});
 // One shared clock per scene, suspended offscreen. User interaction stops auto playback.
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;root.classList.toggle('demo-visible',visible);last=null;},{threshold:.15});observer.observe(root);
 function tick(now){if(auto&&visible&&!document.hidden){if(last!==null)clock+=(now-last)/1000;const t=clock%18;const step=Math.floor(t);if(step!==autoStep){autoStep=step;if(mode==='random'){/* Only the random button changes this screen. */}else{if(t<2)setState('menu');else if(t<15){setState('years');chooseYear(t<5?2022:t<8?2023:t<11?2024:t<13?2025:2022);}else setState('menu');}}}last=now;requestAnimationFrame(tick);}
 reset();renderPlay();requestAnimationFrame(tick);
 reduce.addEventListener('change',()=>{if(reduce.matches){networkMotion=false;stop();}});
}
})().catch(error=>console.error('Memory demo:',error));
