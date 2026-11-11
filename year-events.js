// The native Figma geometry supplies the shapes; filter values seed the event graph.
window.createYearEvents=function({host,geometry,year,emotionIds,people,photos,onBack,peopleCatalog=[],photoPeople={},photoRotations={},eligibleYears=null,mainStory=null,emotionStates=[],variant=0,onEditFilter=()=>{},onRemoveFilter=()=>{}}){
 const otherYears=eligibleYears?.filter(value=>value!==year);
 const horizontalIds=new Set(['508:6562','508:6575','508:6568']);
 const signature=[year,[...emotionIds].sort().join(','),people.map(p=>p.id).sort().join(','),variant,mainStory?.id||''].join('|');
 function hash(value){let n=2166136261;for(const c of signature+value)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
 function kind(slot){if(horizontalIds.has(slot.id.split(';')[1]))return 'chronology';return /508:7652|508:7055|508:8294|508:8241/.test(slot.id)||slot.w<137||(slot.type==='Image'&&slot.id.split(';').length===3)?'fractal':'association';}
 const branchDensity=people.length?Math.round(35+60*Math.min(...people.map(p=>peopleCatalog.find(person=>person.id===p.id)?.w||50))/91):70;
 const kept=new Set(geometry.layers.filter(s=>s.type==='Union'&&kind(s)!=='chronology').map(s=>s.id.split(';')[1]).filter(id=>!emotionIds.size&&!people.length||hash(id)%100<branchDensity));
 const fractalParents={'508:8203':'508:7040','508:8204':'508:7047','508:8205':'508:7040','516:8734':'514:8604','508:8138':'508:7592'};
 function keep(s){if(otherYears&&!otherYears.length&&kind(s)!=='chronology')return false;const branch=s.id.split(';')[1],parent=fractalParents[branch];if(parent&&!kept.has(parent))return false;return kind(s)==='chronology'||kept.has(branch)||s.id.split(';').length===3;}
 const scene=document.createElement('section');scene.className='year-events';scene.dataset.year=year;scene.dataset.signature=signature;scene.setAttribute('aria-label','События '+year+' года');
 scene.innerHTML='<div class="year-events-world"><div class="year-events-links"></div><div class="year-events-nodes"></div></div><div class="year-events-switcher"><img alt="" width="350" height="150" src="assets/year-event-switcher.svg"><button type="button" aria-label="Все связи" aria-pressed="true"></button><button type="button" aria-label="Хронология выбранного года" aria-pressed="false"></button></div><div class="year-events-footer"><span class="year-events-year"></span><div><button type="button" class="year-event-prev" aria-label="Предыдущее событие этого года">‹</button><button type="button" class="year-events-back" aria-label="Вернуться к выбору года">⌂</button><button type="button" class="year-event-next" aria-label="Следующее событие этого года">›</button></div></div><p class="year-event-caption" aria-live="polite"></p>';
 const world=scene.querySelector('.year-events-world'),links=scene.querySelector('.year-events-links'),nodes=scene.querySelector('.year-events-nodes');
 const graph=[],artwork=[];let timelineIndex=0,zoomLevel=0;scene.dataset.zoom='0';
 const known=peopleCatalog.filter(p=>['Миша','Таня','Семён'].includes(p.name));
 function participantsFor(id,photo,index){const authored=index===0&&mainStory?peopleCatalog.filter(p=>mainStory.peopleNames.includes(p.name)&&(!p.memoryYears||p.memoryYears.includes(year))):photoPeople[photo]||known,chosen=[...people];const count=index===0?authored.length:1+hash(id+'participants')%3;for(const person of authored.slice(0,count))if(!chosen.some(p=>p.id===person.id))chosen.push(person);return chosen.slice(0,6);}
 for(const asset of geometry.links){const slot=geometry.layers.find(s=>s.id===asset.id);if(!keep(slot)||kind(slot)!=='association')continue;artwork.push(asset);const image=document.createElement('img');image.alt='';image.src=asset.src;image.className='year-event-link';image.dataset.branch=slot.id.split(';')[1];image.dataset.kind=kind(slot);image.style.cssText=`left:${asset.x}px;top:${asset.y}px;width:${asset.w}px;height:${asset.h}px;opacity:${slot.opacity}`;links.appendChild(image);}
 // Every horizontal junction uses the complete native shape, including off-frame continuations.
 const mainLink=geometry.links.find(s=>s.id.includes(';508:6562;'));
 if(mainLink)for(const index of [-1,0,1,2]){const asset={...mainLink,x:mainLink.x+index*526};artwork.push(asset);const image=document.createElement('img');image.alt='';image.src=asset.src;image.className='year-event-link';image.dataset.kind='chronology';image.dataset.timelineIndex=index;image.style.cssText=`left:${asset.x}px;top:${asset.y}px;width:${asset.w}px;height:${asset.h}px;opacity:${index===0?1:.4}`;links.appendChild(image);}
 const unique=new Map();
 for(const slot of geometry.layers.filter(s=>s.type==='Image'&&keep(s))){const [a,b,c,d,e,f]=slot.m,x=e+a*slot.w/2+c*slot.h/2,y=f+b*slot.w/2+d*slot.h/2,key=Math.round(x)+':'+Math.round(y);if(!unique.has(key)||unique.get(key).slot.opacity<slot.opacity)unique.set(key,{slot,x,y});}
 const slots=[...unique.values()].filter(s=>kind(s.slot)!=='fractal'&&!(kind(s.slot)==='chronology'&&s.x>2400));slots.push({slot:{id:'preceding-event',w:137.5,opacity:.4},x:498,y:512});
 const parents=slots.map(s=>({...s,r:s.slot.w/2,type:s.slot.id==='preceding-event'?'chronology':kind(s.slot)}));
 const horizontal=parents.filter(s=>s.type==='chronology').sort((a,b)=>a.x-b.x),corridors=[];
 for(let i=1;i<horizontal.length;i++)corridors.push({a:horizontal[i-1],b:horizontal[i]});
 for(const parent of parents.filter(s=>s.type==='association')){const anchor=horizontal.reduce((a,b)=>Math.hypot(a.x-parent.x,a.y-parent.y)<Math.hypot(b.x-parent.x,b.y-parent.y)?a:b);corridors.push({a:anchor,b:parent});}
 const obstacles=parents.map(parent=>({...parent,r:parent.r+16}));
 for(const parent of parents)for(let i=0;i<6;i++){const angle=(-140+i*60)*Math.PI/180;obstacles.push({x:parent.x+Math.cos(angle)*parent.r,y:parent.y+Math.sin(angle)*parent.r,r:16});}
 function clearOfLink(x,y,r,edge){const dx=edge.b.x-edge.a.x,dy=edge.b.y-edge.a.y,length=dx*dx+dy*dy;if(!length)return true;const t=Math.max(0,Math.min(1,((x-edge.a.x)*dx+(y-edge.a.y)*dy)/length)),distance=Math.hypot(x-edge.a.x-t*dx,y-edge.a.y-t*dy),width=12+Math.pow(Math.abs(t-.5)*2,4)*Math.min(edge.a.r,edge.b.r)*.75;return distance>r+width+10;}
 function clearOfArtwork(x,y,r){const padding=r+14;for(const asset of artwork){if(x+padding<asset.x||x-padding>asset.x+asset.w||y+padding<asset.y||y-padding>asset.y+asset.h)continue;const mask=asset.mask;if(!mask)continue;const sx=asset.w/mask.w,sy=asset.h/mask.h;for(const [row,left,right] of mask.rows){const top=asset.y+row*sy,bottom=top+sy;if(top>y+padding||bottom<y-padding)continue;const ax=asset.x+left*sx,bx=asset.x+right*sx,nearX=Math.max(ax,Math.min(x,bx)),nearY=Math.max(top,Math.min(y,bottom));if(Math.hypot(x-nearX,y-nearY)<padding)return false;}}return true;}
 const availablePhotos=[...new Set(photos)].filter(Boolean),photoQueue=availablePhotos.slice(1).sort((a,b)=>hash(a+'photo')-hash(b+'photo'));
 let fractalBudget=otherYears&&!otherYears.length?0:Math.max(0,availablePhotos.length-parents.length);
 for(let i=0;i<3;i++)for(const parent of parents){
  const count=2+hash(parent.slot.id+'count')%2;
  if(i<count&&fractalBudget>0){
   const sizeIndex=hash(parent.slot.id+'radius'+i)%4,radius=[25,37.5,50,68.75][sizeIndex],phase=hash(parent.slot.id+'phase')%360;let found=null;
   for(let ring=0;ring<12&&!found;ring++)for(let step=0;step<96;step++){
    const angle=(phase+i*360/count+step*137.507764)*Math.PI/180,distance=parent.r+radius+18+ring*12,x=parent.x+Math.cos(angle)*distance,y=parent.y+Math.sin(angle)*distance;
    if(obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<radius+o.r+14)||corridors.some(e=>!clearOfLink(x,y,radius,e))||!clearOfArtwork(x,y,radius))continue;
    found={x,y,r:radius};break;
   }
   if(!found)continue;fractalBudget--;obstacles.push(found);slots.push({slot:{id:'fractal:'+parent.slot.id+':'+i,w:radius*2,opacity:.4,type:'fractal',sizeIndex,parent:parent.slot.id},x:found.x,y:found.y});
  }
 }
 for(const {slot,x,y} of slots){
  const type=slot.type==='fractal'?'fractal':slot.id==='preceding-event'?'chronology':kind(slot);if(type==='chronology'&&x>2400)continue;
  const index=type==='chronology'?Math.round((x-1024)/526):null;
  const eventYear=type==='chronology'?year:Math.max(1994,Math.min(2026,year+(hash(slot.id)%2?1:-1)*(1+hash(slot.id+'year')%5)));
  const resolvedYear=type==='chronology'?year:otherYears?.length?otherYears[hash(slot.id+'eligible-year')%otherYears.length]:eventYear===year?year-1:eventYear;
  const photo=type==='chronology'&&index===0?availablePhotos[0]:photoQueue.shift();
  if(!photo)continue;
  const node=document.createElement('button');node.type='button';node.className='year-event-node';node.dataset.kind=type;node.dataset.eventYear=resolvedYear;node.dataset.eventId=slot.id;const month=type==='chronology'?Math.min(12,Math.max(1,(index+2)*2)):1+hash(slot.id+'month')%12;node.dataset.eventDate=resolvedYear+'-'+String(month).padStart(2,'0')+'-'+String(1+hash(slot.id+'day')%27).padStart(2,'0');if(index!==null)node.dataset.timelineIndex=index;
  node.style.cssText=`left:${x-slot.w/2}px;top:${y-slot.w/2}px;width:${slot.w}px;height:${slot.w}px;--node-opacity:${type==='chronology'&&index===0?1:Math.max(.18,slot.opacity)}`;
  const relation=type==='chronology'?'Событие выбранного года':type==='association'?'Ассоциативное воспоминание':'Отдалённое воспоминание';
  node.setAttribute('aria-label',relation+', '+resolvedYear+' год');node.innerHTML=`<span class="year-event-photo"><img alt="" src="${photo}"></span>`;
  node.dataset.photoRotation=String(photoRotations[photo]||0);node.style.setProperty('--memory-photo',`url("${photo}")`);node.style.setProperty('--memory-photo-rotation',(photoRotations[photo]||0)+'deg');node.style.setProperty('--memory-photo-blur',(slot.w*24.5/412.5)+'px');
  const photograph=node.querySelector('.year-event-photo>img');photograph.style.transform=`rotate(${photoRotations[photo]||0}deg)`;photograph.style.animation='none';
  if(type==='fractal'){const glass=document.createElement('img');glass.className='year-fractal-glass';glass.alt='';glass.src='assets/year-fractal-glass-'+slot.sizeIndex+'.svg';glass.width=[400,600,800,1100][slot.sizeIndex];glass.height=glass.width;node.appendChild(glass);node.dataset.size=['XS','S','M','L'][slot.sizeIndex];}
  const participants=participantsFor(slot.id,photo,index),tags=[...new Set([...emotionIds,...(index===0&&mainStory?mainStory.tags:[])])];if(!tags.length)tags.push(hash(slot.id+'emotion')%8);
  node.dataset.participantIds=participants.map(p=>p.id).join(',');node.dataset.emotionIds=tags.join(',');
  if(participants.length){
   const pins=document.createElement('span');pins.className='year-event-people';
   participants.forEach((person,i)=>{const portrait=document.createElement('img');portrait.src=person.src;portrait.alt=person.name;const angle=(-140+i*360/participants.length)*Math.PI/180;portrait.style.left=(50+Math.cos(angle)*50)+'%';portrait.style.top=(50+Math.sin(angle)*50)+'%';pins.appendChild(portrait);});node.appendChild(pins);
  }
  const branch=slot.id.split(';')[1];
  const related=[...links.querySelectorAll('[data-branch]')].filter(link=>link.dataset.branch===branch);
  node.addEventListener('pointerenter',()=>related.forEach(link=>{link.dataset.restingOpacity=link.style.opacity;link.style.opacity='.7';}));
  node.addEventListener('pointerleave',()=>related.forEach(link=>link.style.opacity=link.dataset.restingOpacity||'.4'));
  const main=type==='chronology'&&index===0;
  node.tabIndex=main?0:-1;node.setAttribute('aria-disabled',String(!main));
  if(main){node.setAttribute('aria-label','Приблизить главное воспоминание');node.addEventListener('click',()=>setZoom(Math.min(2,zoomLevel+1)));const glass=document.createElement('img');glass.className='year-active-glass';glass.alt='';glass.src='assets/year-active-glass.svg';glass.width=glass.height=825;node.appendChild(glass);}
  if(!main&&window.applyYearMemoryEffect)window.applyYearMemoryEffect(node);else if(!main&&window.addEventListener)window.addEventListener('year-memory-effect-ready',()=>window.applyYearMemoryEffect(node),{once:true});

  graph.push({type,index,year:resolvedYear,id:slot.id,x,y,r:slot.w/2,parent:slot.parent,participantIds:participants.map(p=>p.id),emotionIds:tags});nodes.appendChild(node);
 }
 const timeline=[...nodes.querySelectorAll('[data-kind="chronology"]')].sort((a,b)=>Number(a.dataset.timelineIndex)-Number(b.dataset.timelineIndex));
 function focus(index){const node=timeline.find(n=>Number(n.dataset.timelineIndex)===index);if(!node)return;timelineIndex=index;links.querySelectorAll('[data-kind="chronology"]').forEach(link=>link.style.opacity=Number(link.dataset.timelineIndex)===index?'1':'.4');world.style.transform=`translateX(${-index*526}px)`;scene.querySelectorAll('.year-event-node').forEach(n=>{const active=n===node;n.classList.toggle('is-current',active);n.classList.remove('is-associated-focus');n.setAttribute('aria-pressed',String(active));});scene.querySelector('.year-event-prev').disabled=node===timeline[0];scene.querySelector('.year-event-next').disabled=node===timeline[timeline.length-1];scene.querySelector('.year-event-caption').textContent='';}
 function setZoom(level){zoomLevel=Math.max(0,Math.min(2,level));scene.dataset.zoom=String(zoomLevel);world.style.transform=zoomLevel===0?'none':zoomLevel===1?'scale(2)':'translateX(-168px) scale(3)';scene.querySelector('.year-event-prev').disabled=zoomLevel===0;scene.querySelector('.year-event-prev').setAttribute('aria-label','Уменьшить приближение');scene.querySelector('.year-event-prev').textContent='−';scene.querySelector('.year-events-year').textContent=zoomLevel===2?(mainStory?.date||'28.05.'+year):year;}
 scene.querySelector('.year-events-year').textContent=year;
 const footer=scene.querySelector('.year-events-footer'),heading=document.createElement('div');heading.className='year-footer-heading';
 const pinned=document.createElement('div');pinned.className='year-footer-filters';
 for(const person of people){const button=document.createElement('button');button.type='button';button.className='year-footer-person';button.setAttribute('aria-label','Убрать из поиска: '+person.name);button.innerHTML=`<img alt="" src="${person.src}">`;button.addEventListener('click',()=>onRemoveFilter('people',person.id));pinned.appendChild(button);}
 const emotions=document.createElement('div');emotions.className='year-footer-emotions';
 for(const i of emotionIds){const button=document.createElement('button');button.type='button';button.className='year-footer-emotion';button.setAttribute('aria-label','Убрать выбранную эмоцию');button.innerHTML=`<img alt="" src="assets/emotion-mini-${i}.svg" style="transform:scale(${i>=6?1/3:.5})">`;button.addEventListener('click',()=>onRemoveFilter('emotions',i));emotions.appendChild(button);}
 pinned.appendChild(emotions);heading.appendChild(pinned);heading.appendChild(scene.querySelector('.year-events-year'));footer.prepend(heading);
 const nativeNav=document.createElement('div');nativeNav.className='year-footer-native';nativeNav.innerHTML='<img class="year-footer-line" alt="" width="1157" height="39" src="assets/year-footer-0.svg"><img class="year-footer-buttons" alt="" width="258" height="103" src="assets/year-footer-1.svg"><button type="button" class="year-footer-edit-emotions" aria-label="Изменить фильтр эмоций"></button><button type="button" class="year-footer-home" aria-label="Вернуться к годам"></button><button type="button" class="year-footer-edit-people" aria-label="Изменить фильтр людей"></button>';footer.appendChild(nativeNav);
 nativeNav.querySelector('.year-footer-home').addEventListener('click',onBack);nativeNav.querySelector('.year-footer-edit-emotions').addEventListener('click',()=>onEditFilter('emotions'));nativeNav.querySelector('.year-footer-edit-people').addEventListener('click',()=>onEditFilter('people'));
 scene.querySelector('.year-event-prev').addEventListener('click',()=>setZoom(zoomLevel-1));scene.querySelector('.year-event-next').hidden=true;scene.querySelector('.year-events-back').addEventListener('click',onBack);
 scene.addEventListener('keydown',e=>{if(e.key==='Escape'&&zoomLevel){e.preventDefault();setZoom(zoomLevel-1);}});
 const mainNode=nodes.querySelector('.year-event-node[data-timeline-index="0"]');
 if(mainNode){
  const invitation=document.createElement('span');invitation.className='year-memory-invitation';invitation.setAttribute('aria-hidden','true');
  for(let i=0;i<2;i++){const wave=document.createElement('span');wave.style.animationDelay=(i*1.8)+'s';invitation.appendChild(wave);}mainNode.prepend(invitation);
  const meta=document.createElement('span');meta.className='year-main-meta';meta.innerHTML='<span class="year-main-weather">'+(mainStory?.temperature||'+26°C')+'<span><img alt="Ночь" src="assets/year-zoom-moon.svg" width="57.516" height="57.516"></span></span><span>'+(mainStory?.time||'23:35')+'</span>';mainNode.appendChild(meta);if(mainStory&&Number(mainStory.time.split(':')[0])>=6&&Number(mainStory.time.split(':')[0])<20){const weather=meta.querySelector('img');weather.src=mainStory.weatherIcon||'assets/year-zoom-moon.svg';weather.alt='День';}
  meta.dataset.tone=mainStory?.textTone||'light';
  const mainPhoto=mainNode.querySelector('.year-event-photo>img');
  const updateMetaContrast=()=>{
   const canvas=document.createElement('canvas');if(typeof canvas.getContext!=='function'||!mainPhoto.naturalWidth)return;
   const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return;canvas.width=canvas.height=64;
   context.translate(32,32);context.rotate(Number(mainNode.dataset.photoRotation||0)*Math.PI/180);
   const scale=Math.max(64/mainPhoto.naturalWidth,64/mainPhoto.naturalHeight);context.drawImage(mainPhoto,-mainPhoto.naturalWidth*scale/2,-mainPhoto.naturalHeight*scale/2,mainPhoto.naturalWidth*scale,mainPhoto.naturalHeight*scale);
   let brightness=0,samples=0;for(const top of [7,49]){const pixels=context.getImageData(20,top,24,9).data;for(let i=0;i<pixels.length;i+=4){brightness+=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;samples++;}}
   meta.dataset.tone=brightness/samples>=148?'dark':'light';
  };
  if(mainPhoto.complete&&mainPhoto.naturalWidth)updateMetaContrast();else mainPhoto.addEventListener('load',updateMetaContrast,{once:true});
  const details=document.createElement('article');details.className='year-zoom-detail';details.setAttribute('aria-label','Описание главного воспоминания');
  details.innerHTML='<button type="button" class="year-zoom-close" aria-label="Закрыть описание"><img alt="" src="assets/year-zoom-close.svg" width="40" height="40"></button><h3></h3><p class="year-zoom-place"><img alt="" src="assets/demo-75-249-imgVector-147bd.svg" width="10.6093" height="13"><span></span></p><div class="year-zoom-members"></div><p class="year-zoom-description"></p>';
  details.querySelector('h3').textContent=mainStory?.title||(year===2022?'Танцы в отеле «Спасское»':'Яркое воспоминание '+year+' года');
  details.querySelector('.year-zoom-place span').textContent=mainStory?.place||(year===2022?'Парк отель «Спасское», Село Спасс':'');
  details.querySelector('.year-zoom-description').textContent=mainStory?.description||(year===2022?'Жестко отжигали на тусовке после прогулки по Рыбинску. Танцуем посреди парка ночью, смеёмся и фотографируем друг друга. Вокруг никого, только свет фонарей и абсолютная свобода!':'Один из ярких моментов этого года, который хочется сохранить.');
  const ids=mainNode.dataset.participantIds.split(',');for(const id of ids){const person=peopleCatalog.find(p=>p.id===id)||people.find(p=>p.id===id);if(!person)continue;const member=document.createElement('span'),portrait=document.createElement('img'),name=document.createElement('span');portrait.src=person.src;portrait.alt='';name.textContent=person.name;member.append(portrait,name);details.querySelector('.year-zoom-members').appendChild(member);}
  details.querySelector('.year-zoom-close').addEventListener('click',()=>setZoom(1));scene.appendChild(details);
  const emotionNames=['Восторг','Стресс','Победы','Уединение','Боль','Любовь','Веселье','Страх'];
  const tags=document.createElement('div');tags.className='year-main-emotions';tags.setAttribute('aria-label','Эмоции воспоминания');
  for(const [n,i] of mainNode.dataset.emotionIds.split(',').map(Number).entries()){
   const petal=document.createElement('span');petal.className='source-pinned-emotion';petal.style.left=(n%4)*42.5+'px';petal.style.top=Math.floor(n/4)*70+'px';petal.style.zIndex=String(n+1);petal.setAttribute('aria-label',emotionNames[i]);
   if(emotionStates[i])petal.innerHTML='<span class="source-pinned-art" aria-hidden="true">'+emotionStates[i].click+'</span><span class="source-pinned-label">'+emotionNames[i]+'</span>';
   tags.appendChild(petal);
  }scene.appendChild(tags);

 }
 scene.querySelector('.year-events-switcher').remove();
 const previous=host.querySelector('.year-events');if(previous){previous.querySelectorAll('[data-shader-state="ready"]').forEach(node=>node.dispatchEvent(new window.Event('year-effect-dispose')));previous.remove();}host.appendChild(scene);focus(0);setZoom(0);return {scene,graph,signature,corridors,artwork};
};
