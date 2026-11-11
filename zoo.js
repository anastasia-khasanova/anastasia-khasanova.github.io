(()=>{'use strict';
const q=s=>document.querySelector(s),node=id=>q('[data-node-id="'+id+'"]'),reduced=matchMedia('(prefers-reduced-motion:reduce)'),dialog=q('#zc-dialog'),content=q('.zc-dialog-content'),announce=q('.zc-announcer');
function fit(){if(document.documentElement.classList.contains('zoo-mobile')){q('.zc-holder').style.height='0px';return;}const viewport=document.documentElement.clientWidth,scale=Math.min(1920,viewport)/1920;document.documentElement.style.setProperty('--zoo-scale',scale);document.documentElement.style.setProperty('--zoo-centre-adjust',Math.max(0,innerWidth-viewport)/(2*scale)+'px');document.documentElement.style.setProperty('--zoo-bleed-width',viewport/scale+'px');const filmHeight=Math.min(1080,innerHeight/scale),trim=1080-filmHeight;document.documentElement.style.setProperty('--zoo-film-height',filmHeight+'px');document.documentElement.style.setProperty('--zoo-film-trim',trim+'px');q('.zc-holder').style.height=(12110-trim-40+(parseFloat(document.documentElement.style.getPropertyValue('--zoo-notes-extra'))||0))*scale+'px';}fit();addEventListener('zoo:notes-layout',fit);addEventListener('resize',fit,{passive:true});document.fonts.ready.then(fit);
function open(html){content.innerHTML=html;dialog.showModal();}q('.zc-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
function control(el,label,action){if(!el||el.closest('[data-node-id="898:2466"]'))return;el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',label);el.addEventListener('click',action);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action(e);}});}
const top=q('.zc-top');function sync(){top.classList.toggle('visible',scrollY>600);}sync();addEventListener('scroll',sync,{passive:true});top.onclick=()=>scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
// Play only the film currently visible, and use its poster for reduced motion.
const movies=[...document.querySelectorAll('video')];const videoObserver=new IntersectionObserver(entries=>{for(const entry of entries){const v=entry.target;if(entry.isIntersecting&&!document.hidden&&!reduced.matches)v.play().catch(()=>{});else v.pause();}},{threshold:.12});movies.forEach(v=>videoObserver.observe(v));document.addEventListener('visibilitychange',()=>{movies.forEach(v=>{if(document.hidden||reduced.matches)v.pause();else if(v.getBoundingClientRect().bottom>0&&v.getBoundingClientRect().top<innerHeight)v.play().catch(()=>{});});});reduced.addEventListener('change',()=>{for(const v of movies){if(reduced.matches){v.pause();v.currentTime=0;}}});
// Task actions share the first phone, with the exact copy provided by Figma.
const handPhone=node('846:2127');
if(handPhone){
 let visible=false,paused=false;
 const syncHand=()=>handPhone.classList.toggle('zc-hand-running',visible&&!paused&&!document.hidden&&!reduced.matches);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;handPhone.classList.toggle('zc-hand-visible',visible);syncHand();},{threshold:[0,.2]}).observe(handPhone);
 control(handPhone,'Приостановить анимацию панели задач',()=>{paused=!paused;handPhone.setAttribute('aria-label',paused?'Продолжить анимацию панели задач':'Приостановить анимацию панели задач');handPhone.setAttribute('aria-pressed',String(paused));syncHand();});
 handPhone.setAttribute('aria-pressed','false');
 document.addEventListener('visibilitychange',syncHand);reduced.addEventListener('change',syncHand);
}
const taskCopy=[['<< СВАЙП ВЛЕВО','Принять и выполнить','Свайп влево закрепляет задачу за смотрителем — коллеги видят, кто взял её в работу. Кнопка «Завершить» позволяет записать итог и закрыть задачу.'],['СВАЙП ВПРАВО >>','Отложить задачу','Свайп вправо открывает перенос срока. Срочную задачу можно отложить до трёх часов, плановую — на другую дату.'],['НОВАЯ ЗАДАЧА','Создать новую','Кнопка «Новая задача» открывает форму для всего вольера или отдельного животного. Можно указать срок, назначить ответственного и настроить повтор для регулярных дел.']];
const taskIds=['898:5857','898:5882','898:5887'],taskRows=taskIds.map(node),taskColumn=node('898:4720');let taskIndex=2;
if(taskColumn){const separators=['898:4728','898:5883','898:5888'].map(node);[2,0,1].forEach((i,k)=>{if(taskRows[i])taskColumn.append(taskRows[i]);if(separators[k])taskColumn.append(separators[k]);});}
function selectTask(i){
 if(i===taskIndex)return;
 taskIndex=i;
 taskRows.forEach((el,k)=>{if(!el)return;const active=k===i;el.classList.toggle('is-open',active);el.setAttribute('aria-expanded',String(active));el.querySelector('.zc-task-expanded').setAttribute('aria-hidden',String(!active));if(active)el.setAttribute('aria-describedby','zc-task-copy-'+k);else el.removeAttribute('aria-describedby');});
 runPostponeDemo();
}
taskRows.forEach((el,i)=>{
 if(!el)return;
 el.className='zc-task-item'+(i===2?' is-open':'');el.dataset.zcAction=String(i);
 el.innerHTML='<p class="zc-task-collapsed" aria-hidden="true">'+taskCopy[i][1]+'</p><span class="zc-task-plus" aria-hidden="true">+</span><div class="zc-task-expanded" id="zc-task-panel-'+i+'" aria-hidden="'+String(i!==2)+'"><p class="zc-action-kicker">'+taskCopy[i][0]+'</p><p class="zc-action-title">'+taskCopy[i][1]+'</p><p class="zc-action-copy" id="zc-task-copy-'+i+'">'+taskCopy[i][2]+'</p></div>';
 control(el,taskCopy[i][1],()=>selectTask(i));el.setAttribute('aria-controls','zc-task-panel-'+i);el.setAttribute('aria-expanded',String(i===2));if(i===2)el.setAttribute('aria-describedby','zc-task-copy-2');
});
function sizeTasks(){
 let maxHeight=0;
 taskRows.forEach(el=>{if(!el)return;const h=el.querySelector('.zc-task-expanded').offsetHeight;el.style.setProperty('--task-open-height',h+'px');maxHeight=Math.max(maxHeight,h);});
 // Keep the original column's vertical anchor while rows exchange their open state.
 if(taskColumn)taskColumn.style.height=(maxHeight+2*90+5*28+3)+'px';
}
sizeTasks();document.fonts.ready.then(sizeTasks);addEventListener('resize',sizeTasks,{passive:true});addEventListener('zoo:responsive',sizeTasks);
const taskPhone=node('898:2466'),postponeLayer=taskPhone?.querySelector('.zc-postpone-layer'),newTaskLayer=taskPhone?.querySelector('.zc-new-task-screen'),finishLayer=taskPhone?.querySelector('.zc-finish-layer'),acceptedActions=taskPhone?.querySelector('.zc-accepted-actions'),sceneTimers=new Set();let sceneEpoch=0;let taskPhoneVisible=false,postponeMinutes=30,touchCue=null;
const completionRow=node('I898:3223;233:6144'),voiceText=node('506:4681'),voiceMic=node('506:4682'),voicePhrase='Аппетит вернулся, всё хорошо',acceptedStatus=acceptedActions?.querySelector('p');
const postponeText=node('418:3616'),postponeMic=node('418:3617'),taskStart=node('I898:3223;233:6144;396:7983'),postponePhrase='Оформляю допуск к спец-препаратам в ветсейфе и жду подтверждения дозировок от главврача для лечения отравления у льва. Готовлю лекарство в приманке.';
const newTitle=node('418:5167'),newComment=node('418:5202'),newLeon=node('494:4657'),newUrgent=node('418:5199'),newDescription='На утреннем обходе увидели, что не проявлял интерес к пище.',newName='Проверить льва Леона';
const initialTaskStart=taskStart?.textContent;
const initialAcceptedStatus=acceptedStatus?.textContent,initialUrgentCount=node('I898:3223;471:7964')?.textContent;
function clearSceneTimers(){sceneEpoch++;sceneTimers.forEach(clearTimeout);sceneTimers.clear();}
function sceneVisible(){if(!taskPhone||document.hidden)return false;const r=taskPhone.getBoundingClientRect();return Math.min(r.bottom,innerHeight)-Math.max(r.top,0)>=Math.min(r.height,innerHeight)*.35;}
function sceneLater(action,ms){const epoch=sceneEpoch;const timer=setTimeout(()=>{if(epoch!==sceneEpoch)return;sceneTimers.delete(timer);if(sceneVisible())action();else resetPostpone();},ms);sceneTimers.add(timer);}
function newTaskVisible(visible){taskPhone?.classList.toggle('zc-task-demo-new',visible);newTaskLayer?.setAttribute('aria-hidden',String(!visible));if(newTaskLayer)newTaskLayer.inert=!visible;}
function acceptedVisible(visible){taskPhone?.classList.toggle('zc-task-demo-accepted',visible);acceptedActions?.setAttribute('aria-hidden',String(!visible));if(acceptedActions)acceptedActions.inert=!visible;const hint=node('I898:3223;233:6144;436:6086');if(hint){hint.inert=visible;hint.setAttribute('aria-hidden',String(visible));}}
function finishVisible(visible){taskPhone?.classList.toggle('zc-task-demo-finish',visible);finishLayer?.setAttribute('aria-hidden',String(!visible));if(finishLayer)finishLayer.inert=!visible;}
function resetPostpone(){taskPhone?.classList.add('zc-scene-reset');clearSceneTimers();taskPhone?.classList.remove('zc-task-demo-swiping','zc-task-demo-modal','zc-task-demo-tap','zc-task-demo-accepting','zc-task-demo-finish-tap','zc-task-demo-recording','zc-task-demo-transcribed','zc-task-demo-confirm-tap','zc-task-demo-completed','zc-task-demo-collapsing','zc-postpone-dictating','zc-postpone-recording','zc-postpone-confirm-tap','zc-postpone-time-changed');if(postponeText)postponeText.textContent='Введите комментарий…';postponeMic?.setAttribute('aria-pressed','false');if(taskStart)taskStart.textContent=initialTaskStart;postponeLayer?.setAttribute('aria-hidden','true');newTaskVisible(false);acceptedVisible(false);finishVisible(false);if(touchCue)touchCue.className='zc-touch-cue';if(voiceText)voiceText.textContent='Введите комментарий…';voiceMic?.setAttribute('aria-pressed','false');if(completionRow){completionRow.style.height='';completionRow.inert=false;completionRow.removeAttribute('aria-hidden');}if(acceptedStatus)acceptedStatus.textContent=initialAcceptedStatus;const count=node('I898:3223;471:7964');if(count)count.textContent=initialUrgentCount;resetNewTaskForm();taskPhone?.classList.toggle('zc-task-absent',taskIndex===2);if(completionRow)completionRow.inert=taskIndex===2;if(taskIndex===2&&count)count.textContent='Срочно · 1';if(taskPhone){taskPhone.dataset.scenePhase='idle';const surface=node('I898:3223;233:6144;396:7977');if(surface)void getComputedStyle(surface,'::before').transform;taskPhone.classList.remove('zc-scene-reset');}}
function resetNewTaskForm(){
 taskPhone?.classList.remove('zc-new-leon-selected','zc-new-urgent-selected','zc-new-description','zc-new-submit-tap','zc-new-created','zc-new-editing','zc-new-recording','zc-new-saving');
 if(newTitle)newTitle.textContent='Создать задачу';if(newComment)newComment.textContent='Введите комментарий…';newLeon?.setAttribute('aria-pressed','false');newUrgent?.setAttribute('aria-checked','false');node('418:5203')?.setAttribute('aria-pressed','false');if(node('418:5207'))node('418:5207').textContent='Создать задачу';
}
function chooseNewLeon(){taskPhone.classList.add('zc-new-leon-selected');newLeon.setAttribute('aria-pressed','true');}
function chooseNewUrgent(){taskPhone.classList.add('zc-new-urgent-selected');newUrgent.setAttribute('aria-checked','true');}
function fillNewDescription(){taskPhone.classList.add('zc-new-description');newComment.textContent=newDescription;}
function createNewTaskDemo(){
 clearSceneTimers();newTaskVisible(false);if(touchCue)touchCue.className='zc-touch-cue';taskPhone.classList.remove('zc-task-absent','zc-new-submit-tap','zc-new-editing');taskPhone.classList.add('zc-new-created');completionRow.inert=false;node('I898:3223;471:7964').textContent='Срочно · 2';taskPhone.dataset.scenePhase='new-created-hold';announce.textContent='Срочная задача «Проверить льва Леона» создана на06:00';if(!reduced.matches)sceneLater(runPostponeDemo,6500);
}
function recordNewTaskNote(){
 taskPhone.classList.add('zc-new-description','zc-new-recording');node('418:5203').setAttribute('aria-pressed','true');newComment.textContent='Запись…';taskPhone.dataset.scenePhase='new-voice-recording';
 if(reduced.matches){fillNewDescription();taskPhone.classList.remove('zc-new-recording');node('418:5203').setAttribute('aria-pressed','false');return;}
 for(let i=1;i<=newDescription.length;i++)sceneLater(()=>{newComment.textContent=newDescription.slice(0,i);taskPhone.dataset.scenePhase='new-description-typing';},450+i*45);
 sceneLater(()=>{taskPhone.classList.remove('zc-new-recording');node('418:5203').setAttribute('aria-pressed','false');taskPhone.dataset.scenePhase='new-description-hold';},3350);
}
function animateNewTaskForm(){
 newTaskVisible(true);taskPhone.dataset.scenePhase='new-form-empty';
 sceneLater(()=>{showTouch(newTitle,'tap');taskPhone.dataset.scenePhase='new-title-touch';},900);
 sceneLater(()=>{newTitle.textContent='';taskPhone.classList.add('zc-new-editing');},1500);
 for(let i=1;i<=newName.length;i++)sceneLater(()=>{newTitle.textContent=newName.slice(0,i);taskPhone.dataset.scenePhase='new-title-typing';},1500+i*65);
 sceneLater(()=>{taskPhone.classList.remove('zc-new-editing');showTouch(newLeon,'tap');taskPhone.dataset.scenePhase='new-leon-touch';},3900);
 sceneLater(()=>{chooseNewLeon();taskPhone.dataset.scenePhase='new-leon-selected';},4400);
 sceneLater(()=>{showTouch(newUrgent,'tap');taskPhone.dataset.scenePhase='new-urgent-touch';},5200);
 sceneLater(()=>{chooseNewUrgent();taskPhone.dataset.scenePhase='new-urgent-selected';},5700);
 sceneLater(()=>{showTouch(node('418:5203'),'tap');taskPhone.dataset.scenePhase='new-voice-touch';},6600);
 sceneLater(recordNewTaskNote,7050);
 sceneLater(()=>{showTouch(node('418:5206'),'tap');taskPhone.dataset.scenePhase='new-create-touch';},12700);
 sceneLater(()=>taskPhone.classList.add('zc-new-submit-tap'),13150);
 sceneLater(()=>{taskPhone.classList.remove('zc-new-submit-tap');taskPhone.classList.add('zc-new-saving');node('418:5207').textContent='Создаём…';taskPhone.dataset.scenePhase='new-saving';},13400);
 sceneLater(createNewTaskDemo,14200);
}
function showPostpone(){taskPhone?.classList.add('zc-task-demo-modal');postponeLayer?.setAttribute('aria-hidden','false');}
function showTouch(el,gesture){if(!el||!touchCue)return;const screen=node('898:3220').getBoundingClientRect(),target=el.getBoundingClientRect(),scale=402/screen.width;touchCue.style.left=(target.left-screen.left+target.width*(gesture==='swipe'?.8:gesture==='swipe-right'?.2:.5))*scale+'px';touchCue.style.top=(target.top-screen.top+target.height*.5)*scale+'px';touchCue.className='zc-touch-cue is-'+gesture;}
function completeTaskDemo(){
 clearSceneTimers();finishVisible(false);taskPhone.classList.remove('zc-task-demo-recording','zc-task-demo-confirm-tap');voiceMic?.setAttribute('aria-pressed','false');if(touchCue)touchCue.className='zc-touch-cue';
 acceptedVisible(true);completionRow.style.height=completionRow.offsetHeight+'px';taskPhone.classList.add('zc-task-demo-completed');completionRow.inert=true;if(acceptedStatus)acceptedStatus.textContent='Завершено';taskPhone.dataset.scenePhase='completed-green';announce.textContent='Задача «Проверить льва Леона» завершена. '+voicePhrase;
 const collapse=()=>{taskPhone.classList.add('zc-task-demo-collapsing');completionRow.style.height='0px';completionRow.setAttribute('aria-hidden','true');const count=node('I898:3223;471:7964');if(count)count.textContent='Срочно · 1';taskPhone.dataset.scenePhase='completed-collapse';};
 if(reduced.matches){collapse();taskPhone.dataset.scenePhase='completed-hold';return;}
 sceneLater(collapse,1100);sceneLater(()=>taskPhone.dataset.scenePhase='completed-hold',1850);sceneLater(runPostponeDemo,5200);
}
function confirmPostponeDemo(){
 clearSceneTimers();taskPhone.classList.remove('zc-task-demo-modal','zc-task-demo-swiping','zc-postpone-recording','zc-postpone-confirm-tap');postponeLayer.setAttribute('aria-hidden','true');postponeMic.setAttribute('aria-pressed','false');if(touchCue)touchCue.className='zc-touch-cue';
 const minutes=6*60+postponeMinutes;taskStart.textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');taskPhone.classList.add('zc-postpone-time-changed');taskPhone.dataset.scenePhase='postponed-hold';announce.textContent='Начало задачи перенесено на '+taskStart.textContent;
 if(!reduced.matches)sceneLater(runPostponeDemo,4200);
}
function recordPostponeNote(){
 clearSceneTimers();taskPhone.classList.add('zc-postpone-dictating','zc-postpone-recording');postponeMic.setAttribute('aria-pressed','true');postponeText.textContent='Запись…';taskPhone.dataset.scenePhase='postpone-recording';
 if(reduced.matches){postponeText.textContent=postponePhrase;taskPhone.classList.remove('zc-postpone-recording');postponeMic.setAttribute('aria-pressed','false');return;}
 const duration=450+postponePhrase.length*45;
 for(let i=1;i<=postponePhrase.length;i++)sceneLater(()=>{postponeText.textContent=postponePhrase.slice(0,i);taskPhone.dataset.scenePhase='postpone-transcribing';},450+i*45);
 sceneLater(()=>{taskPhone.classList.remove('zc-postpone-recording');postponeMic.setAttribute('aria-pressed','false');taskPhone.dataset.scenePhase='postpone-transcript-hold';announce.textContent='Причина переноса: '+postponePhrase;},duration+250);
 sceneLater(()=>{showTouch(node('418:3619'),'tap');taskPhone.dataset.scenePhase='postpone-confirm-touch';},duration+1750);
 sceneLater(()=>taskPhone.classList.add('zc-postpone-confirm-tap'),duration+2200);
 sceneLater(confirmPostponeDemo,duration+2500);
}
function recordFinishNote(){
 taskPhone.classList.add('zc-task-demo-recording');taskPhone.classList.remove('zc-task-demo-transcribed');voiceMic.setAttribute('aria-pressed','true');voiceText.textContent='Запись…';taskPhone.dataset.scenePhase='voice-recording';
 for(let i=1;i<=voicePhrase.length;i++)sceneLater(()=>{voiceText.textContent=voicePhrase.slice(0,i);taskPhone.classList.add('zc-task-demo-transcribed');taskPhone.dataset.scenePhase='voice-transcribing';},400+i*45);
 sceneLater(()=>{taskPhone.classList.remove('zc-task-demo-recording');voiceMic.setAttribute('aria-pressed','false');voiceText.textContent=voicePhrase;taskPhone.dataset.scenePhase='transcript-hold';announce.textContent='Комментарий: '+voicePhrase;},2800);
 sceneLater(()=>{showTouch(node('433:4041'),'tap');taskPhone.dataset.scenePhase='confirm-touch';},3600);
 sceneLater(()=>taskPhone.classList.add('zc-task-demo-confirm-tap'),4050);
 sceneLater(completeTaskDemo,4350);
}
function runPostponeDemo(){
 resetPostpone();if(!sceneVisible())return;
 taskPhone.dataset.sceneCycle=String(Number(taskPhone.dataset.sceneCycle||0)+1);
 if(reduced.matches){if(taskIndex===0){acceptedVisible(true);taskPhone.classList.add('zc-task-demo-accepting');finishVisible(true);}else if(taskIndex===1)showPostpone();else newTaskVisible(true);return;}
 if(taskIndex===0){
  sceneLater(()=>{taskPhone.dataset.scenePhase='swipe-left';showTouch(node('I898:3223;233:6144;396:7977'),'swipe');taskPhone.classList.add('zc-task-demo-accepting');},800);
  sceneLater(()=>{acceptedVisible(true);taskPhone.dataset.scenePhase='accepted-hold';},2350);
  sceneLater(()=>{showTouch(node('I482:8320;482:8446'),'tap');taskPhone.dataset.scenePhase='finish-touch';},3500);
  sceneLater(()=>taskPhone.classList.add('zc-task-demo-finish-tap'),3950);
  sceneLater(()=>{taskPhone.classList.remove('zc-task-demo-finish-tap');finishVisible(true);taskPhone.dataset.scenePhase='finish-hold';},4250);
  sceneLater(()=>{showTouch(voiceMic,'tap');taskPhone.dataset.scenePhase='voice-touch';},5250);
  sceneLater(recordFinishNote,5700);
 }else if(taskIndex===1){
  postponeMinutes=30;node('418:3608').textContent='30 мин';
  sceneLater(()=>{taskPhone.dataset.scenePhase='swipe-right';showTouch(node('I898:3223;233:6144;396:7977'),'swipe-right');taskPhone.classList.add('zc-task-demo-swiping');},800);
  sceneLater(()=>{showPostpone();taskPhone.dataset.scenePhase='modal-hold';},2350);
  sceneLater(()=>{showTouch(postponeMic,'tap');taskPhone.dataset.scenePhase='postpone-voice-touch';},3350);
  sceneLater(recordPostponeNote,3800);
 }else if(taskIndex===2){
  sceneLater(()=>{showTouch(node('I898:3223;233:6205'),'tap');taskPhone.dataset.scenePhase='touch';},1500);
  sceneLater(()=>taskPhone.classList.add('zc-task-demo-tap'),1950);
  sceneLater(()=>{taskPhone.classList.remove('zc-task-demo-tap');animateNewTaskForm();},2350);
 }
}
if(taskPhone){
 const wave=document.createElement('span');wave.className='zc-recording-wave';wave.setAttribute('aria-hidden','true');for(let i=0;i<5;i++)wave.append(document.createElement('i'));node('506:4683')?.append(wave);node('418:3618')?.append(wave.cloneNode(true));node('418:5204')?.append(wave.cloneNode(true));
 touchCue=document.createElement('span');touchCue.className='zc-touch-cue';touchCue.setAttribute('aria-hidden','true');node('898:3220').append(touchCue);
 resetPostpone();
 new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;if(visible!==taskPhoneVisible){taskPhoneVisible=visible;runPostponeDemo();}},{threshold:[0,.35]}).observe(taskPhone);
 // The phone is a visual-only timeline; text selection never cancels its timers.
 taskPhone.classList.add('zc-task-visual-only');taskPhone.setAttribute('aria-label','Автоматическая демонстрация работы с задачами');
 for(const el of taskPhone.querySelectorAll('button,input,select,textarea,a,[tabindex],[contenteditable]')){el.tabIndex=-1;if(el.matches('button,input,select,textarea'))el.disabled=true;el.removeAttribute('contenteditable');}
 for(const type of ['click','submit','beforeinput','input','change'])taskPhone.addEventListener(type,event=>{event.preventDefault();event.stopImmediatePropagation();},{capture:true});
 postponeMic?.setAttribute('aria-pressed','false');voiceMic?.setAttribute('aria-pressed','false');node('418:5203')?.setAttribute('aria-pressed','false');
 finishLayer?.setAttribute('role','group');finishLayer?.setAttribute('aria-label','Демонстрация завершения задачи');postponeLayer?.setAttribute('role','group');postponeLayer?.setAttribute('aria-label','Демонстрация переноса задачи');
 document.addEventListener('visibilitychange',runPostponeDemo);reduced.addEventListener('change',runPostponeDemo);
}
// Both modes remain visible; the selected phone is highlighted just as in the source design.
const mapSide=node('913:5899'),listSide=node('913:5929');function mode(which){mapSide?.classList.toggle('zc-preview-dim',which!=='map');listSide?.classList.toggle('zc-preview-dim',which!=='list');mapSide?.classList.toggle('zc-preview-active',which==='map');listSide?.classList.toggle('zc-preview-active',which==='list');mapSide?.setAttribute('aria-pressed',String(which==='map'));listSide?.setAttribute('aria-pressed',String(which==='list'));}control(mapSide,'Показать карту вольеров',()=>mode('map'));control(listSide,'Показать список вольеров',()=>mode('list'));for(const [side,which] of [[mapSide,'map'],[listSide,'list']]){side?.addEventListener('mouseenter',()=>mode(which));side?.addEventListener('focusin',()=>mode(which));}mode('map');
const enclosureNames=['Львы — Старший прайд','Львы — Младший прайд','Ягуары','Медведи — Бурые','Медведи — Гималайские'];
for(const el of document.querySelectorAll('[data-name="Подпись объекта карты"]')){if(el.closest('[data-node-id="898:9927"]'))continue;const name=[...el.querySelectorAll('p')].map(p=>p.textContent.trim()).join(' — ')||el.textContent.trim();control(el,'Открыть вольер: '+name,()=>open('<h2>'+name+'</h2><p>Информация о вольере доступна в карточке справа: животные, задачи и показатели состояния.</p>'));el.dataset.zcEnclosure='true';}
// Health history is controlled by zoo-health.js; metric cards remain informational.
// Enlarge the actual note attachments instead of substituting imagery.
const notes=node('930:7805');if(notes){for(const parent of notes.querySelectorAll('[data-name="Миниатюра фото заметки"]')){const img=parent.querySelector('img');if(img)control(parent,'Открыть фото из заметки',()=>open('<img src="'+img.getAttribute('src')+'" alt="Фото из заметки смотрителя">'));}}
control(node('930:7999'),'Связаться по электронной почте',()=>{location.href='mailto:nelldubrovina@yandex.ru';});
const gallery=node('930:7970');
control(node('930:8002'),'Предыдущие проекты',()=>{if(gallery)gallery.prepend(gallery.lastElementChild);});control(node('930:8004'),'Следующие проекты',()=>{if(gallery)gallery.append(gallery.firstElementChild);});
})();
