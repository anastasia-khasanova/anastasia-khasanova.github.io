// Shared history for the saved phone comment and the two incoming demo notes.
(()=>{
 const root=document.querySelector('[data-node-id="930:7805"]');if(!root)return;
 const find=id=>root.querySelector('[data-node-id="'+id+'"]'),motion=matchMedia('(prefers-reduced-motion:reduce)'),more=find('I930:7805;487:9691');
 const evgeny=find('I930:7805;487:9631'),anton=find('I930:7805;487:9682');
 const photos={Евгений:evgeny.querySelector('img').getAttribute('src'),Антон:anton.querySelector('img').getAttribute('src')};
 const attachmentPhotos=[...evgeny.querySelectorAll('[data-name="Миниатюра фото заметки"] img')].map(img=>img.getAttribute('src'));
 find('I930:7805;487:9688').textContent='00:40, 04.11.26';
 let expanded=false;
 const list=document.createElement('div');list.className='zc-staff-list';root.insertBefore(list,evgeny);find('I930:7805;488:10211').remove();
 const history=[{author:'Евгений',stamp:Date.UTC(2026,10,4,5,40),time:'05:40, 04.11.26',voice:true,photos:attachmentPhotos,body:find('I930:7805;487:9679').textContent.trim(),node:evgeny},{author:'Антон',stamp:Date.UTC(2026,10,4,0,40),time:'00:40, 04.11.26',body:find('I930:7805;487:9690').textContent.trim(),node:anton}];
 // Keep source cards only as history references; the rendered list owns visible entries.
 evgeny.remove();anton.remove();
 function card(record){
  const el=document.createElement('article');el.className='zc-staff-entry';
  const header=document.createElement('header'),image=document.createElement('img'),person=document.createElement('div'),name=document.createElement('b'),role=document.createElement('span'),time=document.createElement('time'),p=document.createElement('p');
  image.src=photos[record.author]||photos.Антон;image.alt='';name.textContent=record.author;role.textContent='Смотритель';person.append(name,role);time.textContent=record.time.includes(',')?record.time:record.time+', 04.11.26';header.append(image,person,time);p.textContent=record.body;el.append(header);
  if(record.voice){const audio=document.createElement('div'),wave=document.createElement('div'),play=document.createElement('button');audio.className='zc-staff-audio';wave.className='zc-staff-wave';wave.setAttribute('aria-hidden','true');for(let i=0;i<36;i++){const bar=document.createElement('i');bar.style.height=(12+(i*17+11)%38)+'px';wave.append(bar);}play.type='button';play.className='zc-staff-play';play.setAttribute('aria-label','Показать воспроизведение голосовой заметки');play.setAttribute('aria-pressed','false');let timer=0;play.addEventListener('click',()=>{const playing=!audio.classList.contains('is-playing');audio.classList.toggle('is-playing',playing);play.setAttribute('aria-pressed',String(playing));clearTimeout(timer);if(playing)timer=setTimeout(()=>{audio.classList.remove('is-playing');play.setAttribute('aria-pressed','false');},8000);});audio.append(wave,play);el.append(audio);}
  el.append(p);
  if(record.photos?.length){const images=document.createElement('div');images.className='zc-staff-photos';for(const src of record.photos){const button=document.createElement('button'),photo=document.createElement('img');button.type='button';button.setAttribute('aria-label','Открыть фото из заметки');photo.src=src;photo.alt='Фото из заметки смотрителя';button.append(photo);button.addEventListener('click',()=>{const dialog=document.querySelector('#zc-dialog'),body=document.querySelector('.zc-dialog-content'),large=photo.cloneNode();body.replaceChildren(large);dialog.showModal();});images.append(button);}el.append(images);}return el;
 }
 function render(animate=false){
  const next=history.slice(0,expanded?history.length:2),before=new Map([...list.children].map(el=>[el,el.offsetTop])),height=list.offsetHeight;
  list.replaceChildren(...next.map(record=>record.node&&(!document.documentElement.classList.contains('zoo-mobile')||record.node.classList.contains('zc-staff-entry'))?record.node:(record.node=card(record))));root.dataset.visibleNotes=String(list.children.length);syncLayout();
  if(animate&&!motion.matches){
   for(const el of list.children){const old=before.get(el);el.animate(old===undefined?[{opacity:0,transform:'translateY(-18px)'},{opacity:1,transform:'translateY(0)'}]:[{transform:'translateY('+(old-el.offsetTop)+'px)'},{transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});}
   list.animate([{height:height+'px'},{height:list.offsetHeight+'px'}],{duration:650,easing:'ease-in-out'});
  }
 }
 render();
 window.addEventListener('zoo:responsive',()=>render());
 function add(body,author='Антон',media={}){const stamp=history[0].stamp+5*60*60*1000,date=new Date(stamp),pad=n=>String(n).padStart(2,'0'),time=pad(date.getUTCHours())+':'+pad(date.getUTCMinutes())+', '+pad(date.getUTCDate())+'.'+pad(date.getUTCMonth()+1)+'.26';history.unshift({author,time,stamp,body,...media});render(true);}
 window.addEventListener('zoo:staff-note',e=>add(e.detail.body));
 function syncLayout(){if(document.documentElement.classList.contains('zoo-mobile')){dispatchEvent(new Event('zoo:notes-layout'));return;}const extra=Math.max(0,root.offsetTop+root.offsetHeight+100-1200);root.closest('section').style.height=(1200+extra)+'px';document.documentElement.style.setProperty('--zoo-notes-extra',extra+'px');dispatchEvent(new Event('zoo:notes-layout'));}
 function showHistory(){expanded=!expanded;more.querySelector('p').textContent=expanded?'Свернуть':'Ещё';more.setAttribute('aria-expanded',String(expanded));more.setAttribute('aria-label',expanded?'Свернуть историю заметок':'Показать историю заметок');render(true);}

 more.setAttribute('aria-expanded','false');more.tabIndex=0;more.setAttribute('role','button');more.setAttribute('aria-label','Показать историю заметок');more.addEventListener('click',showHistory);more.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showHistory();}});
 const incoming=[{at:3000,author:'Евгений',photos:[attachmentPhotos[1]],body:'Воду заменили. Поилка чистая, уровень воды проверен.'},{at:8000,author:'Антон',voice:true,photos:[attachmentPhotos[0]],body:'Леон проявляет интерес к корму. Продолжаем наблюдение за аппетитом.'}];
 let active=false,interacting=false,elapsed=0,previous=0,index=0,cycle=0;root.dataset.notesCycle='0';
 new IntersectionObserver(entries=>{active=entries[0].intersectionRatio>=.5;previous=0;},{threshold:[0,.5]}).observe(root);
 addEventListener('resize',syncLayout,{passive:true});document.fonts.ready.then(syncLayout);
 root.addEventListener('pointerenter',()=>interacting=true);root.addEventListener('pointerleave',()=>interacting=false);
 const timer=setInterval(()=>{const now=performance.now();if(active&&!expanded&&!document.hidden&&!interacting&&!(root.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))&&!document.querySelector('#zc-dialog[open]')&&!motion.matches){if(previous)elapsed+=Math.min(now-previous,500);previous=now;if(incoming[index]&&elapsed>=incoming[index].at){const note=incoming[index++];add(note.body,note.author,{voice:note.voice,photos:note.photos,demo:true});}if(elapsed>=14000){for(let i=history.length-1;i>=0;i--)if(history[i].demo)history.splice(i,1);elapsed=0;index=0;root.dataset.notesCycle=String(++cycle);render(true);}}else previous=0;},100);
})();
