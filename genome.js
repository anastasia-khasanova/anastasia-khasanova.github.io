
(()=>{const q=s=>document.querySelector(s);const canvas=q('.gc-canvas'),holder=q('.gc-holder');
const riskMotion=matchMedia('(prefers-reduced-motion:reduce)');let riskState=null,riskRaf=0;
// Keep the introduction above the pinned tablet without fading it.
const riskCopyFlow=document.createElement('div');riskCopyFlow.className='gc-risk-copy-flow';q('.gc-risk-scroll').append(riskCopyFlow);riskCopyFlow.append(q('[data-node-id="770:2479"]'));
// CSSOM rounds fractional style coordinates; retain the exact Figma positions
// independently so section-boundary comparisons do not silently skip a block.
const fixedSections=[...document.querySelectorAll('.gc-section')].map(n=>({n,y:Number(n.dataset.layoutY)}));
const introLift=1101.829834-967.5;
function riskSceneHeight(){return Math.max(1137,991+q('[data-node-id="771:2502"]').offsetHeight+6)+(riskMotion.matches?380:0);}
const compactCase=matchMedia('(max-width:1100px)');
const flowMedia=[['.gc-intro-bleed','748-242'],['.gc-clinic-bleed','757-245'],['.gc-risk-scroll','768-1824']].map(([selector,after])=>{const node=q(selector),slot=document.createComment('desktop media position');node.before(slot);return {node,slot,after};});
function fitCompactCase(){
 for(const {node,after} of flowMedia){const target=q('[data-section="'+after+'"]');if(target.nextElementSibling!==node)target.after(node);}
 const width=canvas.clientWidth-parseFloat(getComputedStyle(canvas).paddingLeft)-parseFloat(getComputedStyle(canvas).paddingRight);
 q('.gc-config').style.zoom=Math.min(1,width/868.32);
 riskState=null;
}
function restoreCaseMedia(){for(const {node,slot} of flowMedia)if(slot.nextSibling!==node)slot.after(node);q('.gc-config').style.zoom='';}
function fit(){if(compactCase.matches){fitCompactCase();return;}restoreCaseMedia();const scale=Math.min(1924,document.documentElement.clientWidth)/1924;document.documentElement.style.setProperty('--case-scale',scale);
 const intro=q('[data-node-id="761:250"]'),introHeight=intro.offsetTop+intro.offsetHeight;
 const mechanicsHeight=introHeight+1214.721;
 const ratio=Math.min(1,Math.max(200,innerHeight-144)/(mechanicsHeight*scale)),delta=1510.721-(mechanicsHeight*ratio+80/scale);
 const configTop=3354.829834+introHeight*ratio+80/scale;
 const descriptionGap=Math.max(20,40*scale);
 const detailsTop=configTop+1055*ratio+descriptionGap/scale,detailsLift=(4945.830078-delta)-detailsTop;
 const descriptionExtra=Math.max(0,q('.gc-category-details').scrollHeight-233);
 const riskTravel=riskMotion.matches?0:Math.max(480,innerHeight*.9),riskExtra=Math.max(0,innerHeight+riskTravel-1297*scale);
 const riskNativeHeight=riskSceneHeight(),riskScale=Math.min(scale,Math.max(100,innerHeight-64)/riskNativeHeight);
 const riskEndY=Math.max(32,(innerHeight-riskNativeHeight*riskScale)/2);
 const captionEnd=(riskMotion.matches?1371:991)+q('[data-node-id="771:2502"]').offsetHeight;
 const riskTail=240-(innerHeight-riskEndY-captionEnd*riskScale);
 for(const {n,y} of fixedSections){n.style.top=y+'px';const id=n.dataset.section;if(id==='761-248'||id==='761-281'){n.style.top=(id==='761-281'?configTop:3354.829834)+'px';n.style.transform='scale('+ratio+')';n.style.transformOrigin='50% 0';}else if(id==='771-2510')n.style.top=(y-delta-detailsLift)+'px';else if(y>=4945.830078)n.style.top=(y-delta-detailsLift+(y>=6635.830078?(riskExtra+riskTail)/scale:0))+'px';if(y>4945.830078)n.style.top=(parseFloat(n.style.top)+descriptionExtra)+'px';if(y>=1597.829834)n.style.top=(parseFloat(n.style.top)-introLift)+'px';if(y>=6779.830292)n.style.top=(parseFloat(n.style.top)-40)+'px';if(y>=8818.609375)n.style.top=(parseFloat(n.style.top)+180+q('[data-node-id="775:2527"]').offsetHeight-450.145)+'px';if(y>=7723.830529)n.style.top=(parseFloat(n.style.top)+(q('.gc-base-demo').offsetHeight-714))+'px';}
 holder.style.height=((10782-delta-detailsLift)*scale+riskExtra+riskTail)+'px';
 fitRiskScene(scale,delta+detailsLift+introLift-descriptionExtra,riskTravel,riskExtra);
 // End at the actual copyright row, rather than the old fixed Figma page height.
 const footerEnd=q('[data-node-id="734:4228"]').getBoundingClientRect().bottom-holder.getBoundingClientRect().top;
 canvas.style.height=footerEnd/scale+'px';holder.style.height=(footerEnd+24)+'px';
 q('.gc-category-hint').style.top=(1055+40/(scale*ratio))+'px';
 updateGeneRail(scale);
}
function fitRiskScene(caseScale,lift,travel,extra){
 const scene=q('.gc-risk-scroll'),stage=q('.gc-risk-stage'),nativeHeight=riskSceneHeight();
 const top=holder.getBoundingClientRect().top+scrollY+(5338.830078-lift)*caseScale;
 const scale=Math.min(caseScale,Math.max(100,innerHeight-64)/nativeHeight);
 scene.style.top=top+'px';scene.style.height=(1297*caseScale+extra)+'px';
 const left=(document.documentElement.clientWidth-1924*scale)/2,stageY=Math.max(32,(innerHeight-nativeHeight*scale)/2);
 stage.style.left=left+'px';stage.style.transform='scale('+scale+')';stage.style.top=stageY+'px';
 riskCopyFlow.style.left=left+'px';riskCopyFlow.style.top=(stageY+(riskMotion.matches?0:327*scale))+'px';riskCopyFlow.style.transform='scale('+scale+')';
 riskState={top,travel,scale};updateRiskScene();
}
function updateRiskScene(){
 if(!riskState)return;const {top,travel,scale}=riskState,clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
 const progress=travel?clamp((scrollY-top)/travel):1,move=smooth((progress-.4)/.55),reveal=smooth((progress-.48)/.42);
 const stage=q('.gc-risk-stage'),tablet=q('[data-node-id="768:1829"]'),copy=q('[data-node-id="770:2479"]'),caption=q('[data-node-id="771:2502"]');
 q('.gc-risk-scroll').dataset.progress=progress.toFixed(4);
 if(riskMotion.matches){stage.style.top=Math.max(32,(innerHeight-riskSceneHeight()*scale)/2)+'px';tablet.style.transform='translate(-709.8489px,380px)';copy.style.left='617.5px';copy.style.top='0px';copy.style.transform='none';copy.style.opacity='1';caption.style.transform='translate(-709.5px,380px)';caption.style.opacity='1';caption.removeAttribute('aria-hidden');return;}
 // The sticky tablet keeps a constant vertical coordinate; only its X position changes.
 stage.style.top=Math.max(32,(innerHeight-riskSceneHeight()*scale)/2)+'px';
 tablet.style.transform='translateX('+(-709.8489*move)+'px)';
 copy.style.left='234px';copy.style.top='0px';copy.style.transform='none';copy.style.opacity='1';
 caption.style.transform='translateX('+(-709.5*move)+'px)';caption.style.opacity=String(reveal);caption.setAttribute('aria-hidden',String(reveal===0));
}
function queueRiskScene(){if(!riskRaf)riskRaf=requestAnimationFrame(()=>{riskRaf=0;updateRiskScene();});}
addEventListener('scroll',queueRiskScene,{passive:true});riskMotion.addEventListener('change',()=>fit());
function updateGeneRail(scale){const rail=q('.gc-gene-rail'),start=q('[data-section="776-2569"]').getBoundingClientRect(),end=q('[data-section="775-2527"]').getBoundingClientRect();
 rail.style.top=(scrollY+start.top-14*scale)+'px';rail.style.height=(end.bottom-start.top+14*scale)+'px';rail.style.width=Math.max(0,start.left-60*scale)+'px';rail.style.setProperty('--gene-scale',Math.min(scale,Math.max(1,innerHeight-96)/798));
}
fit();addEventListener('resize',fit,{passive:true});document.fonts?.ready.then(fit);
function followCaseAnchor(){if(['#base-range','#prototype','#mechanics','#risks','#monetization','#monetization-end'].includes(location.hash))requestAnimationFrame(()=>scrollTo({top:scrollY+q(location.hash).getBoundingClientRect().top-32,behavior:'instant'}));}addEventListener('hashchange',followCaseAnchor);addEventListener('pageshow',followCaseAnchor);followCaseAnchor();
function clickable(id,label,action){const n=q('[data-node-id="'+id+'"]');if(!n)return;n.tabIndex=0;n.setAttribute('role','button');n.setAttribute('aria-label',label);n.addEventListener('click',action);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});}

const projects=q('[data-node-id="734:4192"]');
clickable('734:4224','Предыдущие проекты',()=>projects.prepend(projects.lastElementChild));clickable('734:4226','Следующие проекты',()=>projects.append(projects.firstElementChild));
const dialog=q('#gc-project-dialog');q('.gc-close').onclick=()=>dialog.close();
const top=q('.gc-top');let footerVisible=false;function sync(){top.classList.toggle('visible',scrollY>600&&!footerVisible);}addEventListener('scroll',sync,{passive:true});new IntersectionObserver(entries=>{footerVisible=entries[0].isIntersecting;sync();}).observe(q('[data-node-id="734:4215"]'));top.onclick=()=>scrollTo({top:0,behavior:'smooth'});sync();
// The overview has its own positive illustrations; the full prototype retains risk states.
const categoryNames={intelligence:'Интеллект',longevity:'Долголетие',appearance:'Внешность',strength:'Телосложение',immune:'Иммунитет',neuro:'Психика'};
function keepShortWords(text){return text.replace(/(?<![\p{L}\p{N}_])((?:без|в|во|для|до|за|из|из-за|из-под|к|ко|между|на|над|о|об|обо|от|перед|по|под|при|про|ради|с|со|у|через|и|а|но|или|не|ни))[ \t]+(?=\S)/giu,'$1\u00a0');}
const categoryCopy={
 intelligence:'Память, внимание и обучаемость. Интерфейс показывает, как их усиление влияет на психику и общий баланс настроек.',
 longevity:'Продолжительность жизни и восстановление организма. Увеличивая срок жизни, важно сохранить защиту клеток и устойчивость психики.',
 immune:'Защита от заболеваний и восстановление. Настройки помогают согласовать иммунитет с продолжительностью жизни и нагрузкой на организм.',
 neuro:'Реакция, концентрация и устойчивость к стрессу. Их баланс зависит от настроек памяти и продолжительности жизни.',
 appearance:'Цвет кожи, волос и глаз. Можно выбрать форму волос и настроить разный цвет левого и правого глаза.',
 strength:'Рост, пропорции тела и физические возможности. Выбранные параметры определяют силу, выносливость и способность к восстановлению.'
};
const details=q('.gc-category-details');
function syncCategoryDetails(){
 const visible=!!demoCategory;details.dataset.visible=String(visible);details.setAttribute('aria-hidden',String(!visible));
 q('.gc-category-title').textContent=categoryNames[demoCategory]||'';
 q('.gc-category-copy').textContent=keepShortWords(categoryCopy[demoCategory]||'');
}
const iconsDefault={intelligence:'e249b.svg',longevity:'19e9c.svg',appearance:'44e6b.svg',strength:'a67cf.svg',immune:'6c37e.svg',neuro:'b405b.svg'};
const iconsActive={intelligence:'65429.svg',longevity:'e9e29.svg',appearance:'790cd.svg',strength:'444c3.svg',immune:'f4c51.svg',neuro:'01e59.svg'};
const opposites={intelligence:'neuro',neuro:'intelligence',longevity:'immune',immune:'longevity',appearance:'strength',strength:'appearance'};
let demoGender='boy',demoCategory=null;
function selectDemoCategory(key){if(!Object.hasOwn(categoryNames,key))return;demoCategory=key;showCategory();}
// Calibrate the visible body, not the differing transparent PNG canvases.
// [native width, native height, head top, sole bottom, body axis]
const demoFrames={"boy":{"intelligence":[1024,1536,119,1428,480.5],"longevity":[1024,1536,81,1457,488.0],"strength":[1024,1536,84,1419,509.0],"immune":[1024,1536,67,1440,512.5],"neuro":[1024,1536,77,1485,511.5],"appearance":[1024,1536,52,1469,528.0],"neutral":[720,1200,113,1169,400]},"girl":{"intelligence":[1208,1302,92,1243,618.5],"longevity":[1078,1459,65,1381,529.5],"strength":[1208,1302,52,1241,607.0],"immune":[1208,1302,91,1244,617.5],"neuro":[1086,1448,96,1387,552.0],"appearance":[1086,1448,96,1382,538.5],"neutral":[971,1619,125,1534,509]}};
function placeDemoAvatar(img,kind){const [w,h,head,sole,axis]=demoFrames[demoGender][kind],scale=(demoGender==='boy'?760:697)/(sole-head);
 img.style.width=w*scale+'px';img.style.height=h*scale+'px';img.style.left=(434.16-axis*scale)+'px';img.style.top=(800-sole*scale)+'px';
 img.dataset.bodyHeight=demoGender==='boy'?'760':'697';img.dataset.sole='800';
}
let avatarRevision=0,currentDemoAvatar=null,currentAvatarKey='';
async function transitionDemoAvatar(kind){
 const key=demoGender+':'+kind;if(key===currentAvatarKey)return;
 currentAvatarKey=key;const revision=++avatarRevision;
 const neutralBoy=kind==='neutral'&&demoGender==='boy';
 const next=neutralBoy?q('.gc-demo-boy-reference'):new Image();
 if(!neutralBoy){next.className='gc-demo-avatar';next.src=kind==='neutral'?'assets/genome-case/girl-neutral-white-v2.png':'assets/genome-case/avatars-20261109/'+demoGender+'-'+kind+'.png';next.alt=(demoGender==='boy'?'Мальчик':'Девочка')+(demoCategory?' — '+categoryNames[demoCategory]:' — начальное состояние');}
 placeDemoAvatar(next,kind);
 if(!neutralBoy){try{await next.decode();}catch{if(revision===avatarRevision)currentAvatarKey='';return;}}
 if(revision!==avatarRevision)return;
 const old=currentDemoAvatar;next.getAnimations().forEach(a=>a.cancel());next.style.display='block';next.style.visibility='visible';next.style.opacity='1';
 if(neutralBoy)next.pause();else q('.gc-demo-stage').append(next);
 currentDemoAvatar=next;
 const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
 if(old&&old!==next){
  const from=getComputedStyle(old).opacity;old.setAttribute('aria-hidden','true');old.getAnimations().forEach(a=>a.cancel());old.style.opacity='0';
  const remove=()=>{if(old===currentDemoAvatar)return;if(old.tagName==='VIDEO')old.style.display='none';else old.remove();};
  if(still)remove();else old.animate([{opacity:from},{opacity:0}],{duration:420,easing:'ease-in-out'}).finished.then(remove).catch(remove);
 }
 next.removeAttribute('aria-hidden');
 if(old&&!still)next.animate([{opacity:0},{opacity:1}],{duration:520,easing:'ease-in-out'});
}
function showCategory(){q('.gc-config').dataset.demoState=demoCategory?'category':demoGender==='boy'?'neutral-boy':'neutral-girl';for(const b of document.querySelectorAll('[data-demo-category]')){const key=b.dataset.demoCategory;b.setAttribute('aria-pressed',String(key===demoCategory));b.dataset.opposite=String(opposites[demoCategory]===key);b.querySelector('img').src='assets/genome-app/'+(key===demoCategory?iconsActive[key]:opposites[demoCategory]===key?'opposite-'+iconsActive[key]:iconsDefault[key]);}
 for(const b of document.querySelectorAll('[data-demo-gender]'))b.setAttribute('aria-pressed',String(b.dataset.demoGender===demoGender));
 const kind=demoCategory||'neutral';
 transitionDemoAvatar(kind);syncCategoryDetails();fit();}
for(const b of document.querySelectorAll('[data-demo-category]'))b.onclick=()=>{selectDemoCategory(b.dataset.demoCategory);};
for(const b of document.querySelectorAll('[data-demo-gender]'))b.onclick=()=>{demoGender=b.dataset.demoGender;showCategory();};
q('.gc-demo-avatar').remove();showCategory();
const slides=[...document.querySelectorAll('.gc-clinic-slide')],dots=[...document.querySelectorAll('[data-clinic-slide]')];let slide=0,timer,inView=false,userInteracted=false;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function schedule(){clearTimeout(timer);if(inView&&!document.hidden&&!reduced.matches)timer=setTimeout(()=>selectSlide((slide+1)%slides.length),userInteracted?10000:4000);}
function selectSlide(i){slide=i;slides.forEach((n,k)=>{n.classList.toggle('is-current',i===k);n.setAttribute('aria-hidden',String(i!==k));});dots.forEach((n,k)=>n.setAttribute('aria-pressed',String(i===k)));schedule();}
dots.forEach((n,i)=>n.onclick=()=>{userInteracted=true;selectSlide(i);});new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(q('.gc-clinic-bleed'));document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
// The final tablet embeds the complete existing app; the opening film is a visual demo.
const introFilm=q('.gc-intro-film video');
let introVisible=false;
function syncIntro(){if(!introFilm)return;if(reduced.matches||document.hidden||!introVisible){introFilm.pause();if(reduced.matches)introFilm.currentTime=0;}else introFilm.play().catch(()=>{});}
new IntersectionObserver(entries=>{introVisible=entries[0].isIntersecting;syncIntro();},{threshold:.1}).observe(introFilm);
document.addEventListener('visibilitychange',syncIntro);reduced.addEventListener('change',syncIntro);

// The cards are rendered by the actual app, with an isolated read-only animation.
const baseDemo=q('.gc-base-demo'),baseIframe=q('.gc-base-iframe');let baseVisible=false;
function tellBaseDemo(message){baseIframe.contentWindow?.postMessage(message,location.origin);}
new IntersectionObserver(entries=>{baseVisible=entries[0].isIntersecting;tellBaseDemo({type:'genome-range-visible',visible:baseVisible});},{threshold:.15}).observe(baseDemo);
baseIframe.addEventListener('load',()=>tellBaseDemo({type:'genome-range-visible',visible:baseVisible}));
for(const button of document.querySelectorAll('[data-base-select]'))button.addEventListener('click',()=>tellBaseDemo({type:'genome-range-select',step:Number(button.dataset.baseSelect)}));
addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==baseIframe.contentWindow||!['genome-range-step','genome-range-size'].includes(event.data?.type))return;if(event.data.type==='genome-range-size'){const height=Math.max(180,Math.min(900,Number(event.data.height)||340));if(Math.abs(baseIframe.offsetHeight-height)>1){baseIframe.style.height=height+'px';fit();}return;}for(const b of document.querySelectorAll('[data-base-select]'))b.setAttribute('aria-pressed',String(Number(b.dataset.baseSelect)===event.data.step));});

// Paid-DNA example: keep the approved receipt design, animate its existing rows.
const serviceExample=q('[data-node-id="775:2527"]'),serviceRows=[...serviceExample.children].slice(0,5),serviceList=document.createElement('div');serviceList.className='gc-services-list';serviceExample.prepend(serviceList);serviceRows.forEach((row,i)=>{serviceList.append(row);if(i)row.classList.add('gc-service-motion');});
const servicePrices=[100,2700,500,150],serviceSequence=[0,1,2,3,4,3,2,1];let servicePhase=0,serviceTimer=0,servicesVisible=false;
function showServiceCount(count){serviceExample.dataset.services=String(count);serviceRows.slice(1).forEach((row,i)=>{row.classList.toggle('is-hidden',i>=count);row.setAttribute('aria-hidden',String(i>=count));});q('[data-node-id="775:2556"]').textContent=(5000+servicePrices.slice(0,count).reduce((a,b)=>a+b,0)).toLocaleString('ru-RU');}
function scheduleServices(){clearTimeout(serviceTimer);if(reduced.matches){showServiceCount(4);return;}if(!servicesVisible||document.hidden)return;serviceTimer=setTimeout(()=>{servicePhase=(servicePhase+1)%serviceSequence.length;showServiceCount(serviceSequence[servicePhase]);scheduleServices();},2200);}
new IntersectionObserver(entries=>{servicesVisible=entries[0].isIntersecting;scheduleServices();},{threshold:.3}).observe(serviceExample);
let receiptFitFrame=0;new ResizeObserver(()=>{if(!receiptFitFrame)receiptFitFrame=requestAnimationFrame(()=>{receiptFitFrame=0;fit();});}).observe(serviceExample);
document.addEventListener('visibilitychange',scheduleServices);reduced.addEventListener('change',scheduleServices);showServiceCount(reduced.matches?4:0);

})();





