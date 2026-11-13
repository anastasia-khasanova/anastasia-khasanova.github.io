/* The map uses Figma's native geometry and local camera media. */
(()=>{
const root=document.querySelector('[data-node-id="898:9927"]');
const world=document.querySelector('[data-node-id="898:9928"]');
const data=window.ZOO_MAP_DATA;
if(!root||!world||!data)return;
const node=id=>document.querySelector('[data-node-id="'+id+'"]');
const ns='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
const heading=node('898:11154'),row=node('898:11157'),sheet=node('898:11149');
sheet.tabIndex=0;sheet.setAttribute('aria-label','Информация о выбранном вольере');
const animalScroll=row.parentElement;
animalScroll.tabIndex=0;animalScroll.setAttribute('role','region');animalScroll.setAttribute('aria-label','Животные в вольере. Список можно прокручивать вбок');
let animalDrag=null;
function syncAnimalScroll(){animalScroll.classList.toggle('is-scrollable',animalScroll.scrollWidth>animalScroll.clientWidth+1);}
animalScroll.addEventListener('dragstart',e=>e.preventDefault());
animalScroll.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0||animalScroll.scrollWidth<=animalScroll.clientWidth)return;animalDrag={id:e.pointerId,x:e.clientX,y:e.clientY,start:animalScroll.scrollLeft,scale:animalScroll.getBoundingClientRect().width/animalScroll.offsetWidth,moved:false};});
animalScroll.addEventListener('pointermove',e=>{const g=animalDrag;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.moved){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>5){animalDrag=null;return;}if(Math.abs(dx)<5)return;g.moved=true;animalScroll.setPointerCapture(e.pointerId);animalScroll.classList.add('is-dragging');}animalScroll.scrollLeft=g.start-dx/g.scale;e.preventDefault();});
function releaseAnimalDrag(){animalDrag=null;animalScroll.classList.remove('is-dragging');}
animalScroll.addEventListener('pointerup',releaseAnimalDrag);animalScroll.addEventListener('pointercancel',releaseAnimalDrag);animalScroll.addEventListener('lostpointercapture',releaseAnimalDrag);
animalScroll.addEventListener('keydown',e=>{if(e.target!==animalScroll)return;const step=104;if(e.key==='ArrowRight'){e.preventDefault();animalScroll.scrollLeft+=step;}else if(e.key==='ArrowLeft'){e.preventDefault();animalScroll.scrollLeft-=step;}else if(e.key==='Home'){e.preventDefault();animalScroll.scrollLeft=0;}else if(e.key==='End'){e.preventDefault();animalScroll.scrollLeft=animalScroll.scrollWidth;}});
new ResizeObserver(syncAnimalScroll).observe(animalScroll);document.fonts.ready.then(syncAnimalScroll);
const originalAnimals=[...row.children].map(el=>el.cloneNode(true));
const originalPopulation=node('I898:11248;70:1283').textContent;
const cameraImages=[...node('898:11248').querySelectorAll('img')].filter(i=>i.getAttribute('src').endsWith('.png'));
const originalCameras=cameraImages.map(i=>({class:i.className,src:i.getAttribute('src'),style:i.getAttribute('style')}));
const cameraStrip=node('I898:11248;192:5198');
const thirdCamera=node('I898:11248;192:5194');
const thirdCameraLabel=node('I898:11248;334:10001');
const factIds=['I898:11248;70:1275','I898:11248;70:1278','I898:11248;70:1284','I898:11248;70:1287'];
const factValueIds=['I898:11248;70:1277','I898:11248;70:1280','I898:11248;70:1283','I898:11248;70:1286','I898:11248;70:1290','I898:11248;70:1291'];
const originalFacts=factValueIds.map(id=>node(id).textContent);
const boxSection=node('I898:11248;233:2724'),boxCards=[...boxSection.querySelectorAll('[data-name="Enclosure-box"]')];
let selected=15,x=111,y=-832.996,zoom=1,gesture=null,lastDragged=false;
root.classList.add('zc-interactive-map');world.classList.add('zc-map-world');
root.setAttribute('tabindex','0');root.setAttribute('role','region');root.setAttribute('aria-label','Интерактивная карта зоопарка. Перетаскивайте карту; стрелки перемещают, плюс и минус меняют масштаб.');
// Replace only boundary rendering. All native labels, roads and markers stay in place.
const shapeSources=new Set(data.map(d=>d.number===13?'enclosure-mountain-lion-updated.svg':d.number===14?'enclosure-jaguar-updated.svg':null).filter(Boolean));
const boundaryNames=['5adb8','8c537','75501','1a38d','5aa9e','a787c','7b381','acc8d','6e911','2cef8','d2c87','bbde8','f36a9','81d93','ff336','33ec8','62f87','9eb82','63ce6','f21dc','18009','95a03','35014','4ad7b'];
for(const name of boundaryNames)shapeSources.add(name+'.svg');
for(const img of world.querySelectorAll('img'))if(shapeSources.has(img.getAttribute('src').split('/').pop()))img.style.visibility='hidden';
const overlay=svgEl('svg',{viewBox:'0 0 2185.059 1849.346',width:2185.059,height:1849.346,'aria-hidden':'true'});overlay.classList.add('zc-map-boundaries');
const defs=svgEl('defs',{});defs.innerHTML=window.ZOO_MAP_SELECTION_DEFS||'';overlay.append(defs);
const paths=new Map();
for(const d of data){
 const b=d.shape,v=d.viewBox;
 const g=svgEl('g',{transform:`translate(${b.x} ${b.y}) scale(${b.w/v[2]} ${b.h/v[3]})`});
 if(d.clipY){const clip=svgEl('clipPath',{id:'zc-enclosure-clip-'+d.number});clip.append(svgEl('rect',{x:0,y:d.clipY[0],width:v[2],height:d.clipY[1]-d.clipY[0]}));overlay.append(clip);g.setAttribute('clip-path','url(#zc-enclosure-clip-'+d.number+')');}
 const path=svgEl('path',{d:d.path,fill:'#ffffff','fill-opacity':'.5',stroke:'#19402e','stroke-opacity':'.6','stroke-width':1,'stroke-linecap':'round','stroke-dasharray':'2 5','data-enclosure':d.number});
 const hatch=svgEl('path',{d:d.path,fill:'url(#pattern0_537_991)','fill-opacity':'.1'});hatch.classList.add('zc-selected-hatch');
 path.addEventListener('click',()=>{if(!lastDragged)select(d.number);});g.append(path,hatch);overlay.append(g);paths.set(d.number,path);
 const label=node(d.label);if(label){label.classList.add('zc-map-label');label.dataset.enclosure=d.number;label.setAttribute('role','button');label.setAttribute('tabindex','0');label.setAttribute('aria-label','Открыть вольер: '+d.title);label.addEventListener('click',()=>{if(!lastDragged)select(d.number);});label.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(d.number);}});}
}
world.append(overlay);
function select(number,announce=true){
 const d=data.find(d=>d.number===number);if(!d)return;selected=number;
 for(const item of data){const active=item.number===number;paths.get(item.number).classList.toggle('is-selected',active);node(item.label)?.setAttribute('aria-pressed',String(active));}
 heading.textContent=d.title;row.replaceChildren();
 row.classList.toggle('zc-four-animals',number===6);
 if(number===15)for(const card of originalAnimals)row.append(card.cloneNode(true));
 else for(const animal of d.animals){const card=document.createElement('div');card.className='zc-map-animal';card.dataset.name='Карточка животного';const img=document.createElement('img');img.src=animal.src;img.alt=animal.name;const caption=document.createElement('p');caption.textContent=animal.name;card.append(img,caption);if(animal.urgent){const warning=document.createElement('img');warning.className='zc-animal-sos';warning.src='assets/zoo-case/figma/ebf93.svg';warning.alt='Срочная задача: '+animal.name;warning.title=warning.alt;card.append(warning);card.dataset.urgent='true';}row.append(card);}
 cameraImages.forEach((img,i)=>{const original=originalCameras[i];img.className=original.class;img.alt=d.title+' — камера '+(i+1);if(number===15){img.src=original.src;if(original.style)img.setAttribute('style',original.style);else img.removeAttribute('style');}else{img.src=d.photos[i%d.photos.length];img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;max-width:none';}});
 // The second camera's original crop wrapper must also be reset for other enclosures.
 const crop=cameraImages[1]?.parentElement;if(crop)crop.classList.toggle('zc-map-camera-crop',number!==15);
 for(const id of factIds){const fact=node(id);if(fact)fact.hidden=false;}
 const facts=d.facts;
 const values=number===15?originalFacts:[facts.size,facts.capacity,facts.population,facts.surface,...facts.infrastructure];
 factValueIds.forEach((id,i)=>{const el=node(id);el.textContent=values[i]||'';el.hidden=!values[i];});
 boxSection.hidden=d.boxCount===0;boxCards.forEach((card,i)=>card.hidden=i>=d.boxCount);
 sheet.classList.toggle('zc-map-detailed-facts',number!==15);
 if(cameraStrip)cameraStrip.hidden=number!==15&&d.photos.length===1;
 if(thirdCamera)thirdCamera.hidden=number!==15&&d.photos.length<3;
 if(thirdCameraLabel)thirdCameraLabel.hidden=number!==15&&d.photos.length<3;
 cameraStrip?.classList.toggle('zc-map-two-cameras',number!==15&&d.photos.length===2);
 sheet.scrollTop=0;releaseAnimalDrag();animalScroll.scrollLeft=0;syncAnimalScroll();root.dataset.selectedEnclosure=String(number);
 if(announce){window.dispatchEvent(new CustomEvent('zoo:enclosure-selected',{detail:{number}}));const live=document.querySelector('.zc-announcer');if(live)live.textContent='Выбран вольер: '+d.title;}
}
function width(){return root.clientWidth;}
function visibleWidth(){return Math.min(width(),970);}
function clamp(){x=Math.min(visibleWidth()/2,Math.max(visibleWidth()/2-2185.059*zoom,x));y=Math.min(root.clientHeight/2,Math.max(root.clientHeight/2-1849.346*zoom,y));}
function draw(){clamp();world.style.zoom=window.portfolioIPad?'1':String(zoom);world.style.transform=window.portfolioIPad?`translate3d(${x}px,${y}px,0) scale(${zoom})`:`translate(${x/zoom}px,${y/zoom}px)`;root.dataset.mapZoom=zoom.toFixed(2);root.dataset.mapX=x.toFixed(2);root.dataset.mapY=y.toFixed(2);minus.disabled=zoom<=.55;plus.disabled=zoom>=2.4;mapMarkers.render();}
function zoomTo(value){const z=Math.min(2.4,Math.max(.55,value)),cx=visibleWidth()/2,cy=root.clientHeight/2;x=cx-(cx-x)*z/zoom;y=cy-(cy-y)*z/zoom;zoom=z;draw();}
const controls=document.createElement('div');controls.className='zc-map-controls';controls.setAttribute('aria-label','Управление картой');
function button(label,text,fn){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;b.textContent=text;b.addEventListener('click',fn);controls.append(b);return b;}
const plus=button('Приблизить карту','+',()=>zoomTo(zoom+.2));
const minus=button('Отдалить карту','−',()=>zoomTo(zoom-.2));
const locate=button('Моё местоположение','',()=>{zoom=1;x=visibleWidth()/2-299.11;y=root.clientHeight/2-1044.81;draw();});
const locationIcon=document.createElement('img');locationIcon.src='assets/zoo-case/figma/0c1ce.svg';locationIcon.alt='';locate.append(locationIcon);root.append(controls);
root.addEventListener('pointerdown',ev=>{lastDragged=false;if(window.PortfolioTouchPan?.handles(ev))return;if(ev.button!==0||ev.target.closest('.zc-map-controls,.zc-live-urgent'))return;const r=root.getBoundingClientRect();gesture={id:ev.pointerId,startX:ev.clientX,startY:ev.clientY,x,y,scale:r.width/root.clientWidth,moved:false};});
root.addEventListener('pointermove',ev=>{if(!gesture||gesture.id!==ev.pointerId)return;const dx=ev.clientX-gesture.startX,dy=ev.clientY-gesture.startY;if(!gesture.moved&&Math.hypot(dx,dy)>5){gesture.moved=true;root.setPointerCapture(ev.pointerId);root.classList.add('is-dragging');}if(gesture.moved){ev.preventDefault();x=gesture.x+dx/gesture.scale;y=gesture.y+dy/gesture.scale;if(window.portfolioIPad)queueMapDraw();else draw();}});
let mapDrawFrame=0;function queueMapDraw(){if(!mapDrawFrame)mapDrawFrame=requestAnimationFrame(()=>{mapDrawFrame=0;draw();});}
function release(){if(!gesture)return;if(window.portfolioIPad){cancelAnimationFrame(mapDrawFrame);mapDrawFrame=0;draw();}lastDragged=gesture.moved;gesture=null;root.classList.remove('is-dragging');}
root.addEventListener('pointerup',release);root.addEventListener('pointercancel',release);root.addEventListener('lostpointercapture',release);
root.addEventListener('click',ev=>{if(lastDragged){ev.stopPropagation();ev.preventDefault();lastDragged=false;}},true);
root.addEventListener('keydown',ev=>{if(ev.target!==root)return;const moves={ArrowLeft:[100,0],ArrowRight:[-100,0],ArrowUp:[0,100],ArrowDown:[0,-100]};if(moves[ev.key]){ev.preventDefault();x+=moves[ev.key][0];y+=moves[ev.key][1];draw();}else if(ev.key==='+'||ev.key==='='){ev.preventDefault();zoomTo(zoom+.2);}else if(ev.key==='-'){ev.preventDefault();zoomTo(zoom-.2);}else if(ev.key==='Home'){ev.preventDefault();locate.click();}});
root.addEventListener('focusin',ev=>{const label=ev.target.closest('.zc-map-label');if(!label||!label.matches(':focus-visible')||gesture)return;const r=root.getBoundingClientRect(),b=label.getBoundingClientRect(),scale=r.width/root.clientWidth,cx=(b.x+b.width/2-r.x)/scale,cy=(b.y+b.height/2-r.y)/scale;if(cx<60||cx>visibleWidth()-60||cy<60||cy>root.clientHeight-60){x+=visibleWidth()/2-cx;y+=root.clientHeight/2-cy;draw();}});
const mapMarkers=createMapMarkers();
window.PortfolioTouchPan?.attach(root,{get:()=>({x,y}),set:state=>{x=state.x;y=state.y;},draw,exclude:'.zc-map-controls,.zc-live-urgent',finish:moved=>{lastDragged=moved;}});
function fitMapView(){if(document.documentElement.classList.contains('zoo-mobile')){x=-79;y=-649.346;zoom=1;}else{x=111;y=-832.996;zoom=1;}draw();}
select(15,false);fitMapView();window.addEventListener('zoo:responsive',fitMapView);

function createMapMarkers(){
 // Markers live above the whole map, so selected SVG fills can never cover them.
 for(const el of world.querySelectorAll('[id="node-887_1085"],[id="node-887_1099"],[data-node-id="898:10027"],[data-node-id="898:10042"]'))el.hidden=true;
 const layer=document.createElement('div');layer.className='zc-map-live-markers';root.append(layer);
 const routeSvg=svgEl('svg',{'aria-hidden':'true',width:0,height:0});routeSvg.classList.add('zc-map-route-defs');root.append(routeSvg);
 // These curves are segments of the native road SVG 90319, in its own coordinates.
 const routes={
  north:'M31.1791 774.019L148.644 792.464C158.014 793.935 167.602 792.029 175.697 787.085L208.969 766.765C213.794 776.173 222.644 782.866 233.01 784.947L240.303 786.411L520.921 842.735',
  upper:'M399.849 235.194L377.984 441.874',
  central:'M240.303 786.411L219.85 1040',
  east:'M520.921 842.735L604.674 772.453C609.139 768.707 612.731 764.029 615.199 758.749L633.421 719.762C636.185 713.848 637.46 707.347 637.134 700.828L631.086 579.867'
 };
 const people=[
  {name:'Антон',route:'north',period:260,phase:.28},
  {name:'Евгений',route:'upper',period:190,phase:.34},
  {name:'Ирина',route:'central',period:240,phase:.25},
  {name:'Максим',route:'east',period:230,phase:.16},
  {name:'Сергей',vet:true,position:[282.11,1137.11]}
 ];
 for(const person of people){
  const el=document.createElement('div');el.className='zc-live-staff'+(person.vet?' is-vet':'');el.dataset.staff=person.name;el.setAttribute('role','img');el.setAttribute('aria-label',(person.vet?'Ветеринар ':'Смотритель ')+person.name);
  const circle=document.createElement('span');circle.className='zc-staff-disc';const icon=document.createElement('img');icon.alt='';icon.src='assets/zoo-case/figma/'+(person.vet?'2389a.svg':'093cc.svg');circle.append(icon);
  const name=document.createElement('span');name.className='zc-staff-name';name.textContent=person.name;el.append(circle,name);layer.append(el);person.el=el;
  if(person.route){const path=svgEl('path',{d:routes[person.route],fill:'none'});routeSvg.append(path);person.path=path;person.length=path.getTotalLength();}
 }
 const alerts=data.filter(d=>d.animals.some(a=>a.urgent)).map(enclosure=>{
  const number=enclosure.number,b=enclosure.shape;
  const target={x:b.x+b.w/2,y:b.y+b.h*.3};
  const el=document.createElement('button');el.type='button';el.className='zc-live-urgent';el.dataset.urgentEnclosure=number;el.title='Срочная задача — '+enclosure.title;el.setAttribute('aria-label',el.title+'. Показать вольер');
  for(const part of ['body','glyph']){const img=document.createElement('img');img.alt='';img.className='zc-urgent-pin-'+part;img.src='assets/zoo-case/figma/urgent-pin-'+part+'.svg';el.append(img);}
  el.addEventListener('click',()=>{x=visibleWidth()/2-target.x*zoom;y=root.clientHeight/2-target.y*zoom;select(number);draw();});layer.append(el);
  return {number,target,el,icon:node(enclosure.label)?.querySelector('img'),angle:0};
 });
 let elapsed=0,previous=0,frame=0,inView=false,viewportRect=null;
 const invalidateGeometry=()=>{viewportRect=null;};root.addEventListener('pointerdown',invalidateGeometry,{passive:true});window.addEventListener('zoo:responsive',invalidateGeometry);window.addEventListener('resize',invalidateGeometry,{passive:true});window.addEventListener('scroll',invalidateGeometry,{passive:true});
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 function staff(){
  for(const person of people){let point=person.position;
   if(person.path){const progress=(elapsed/person.period+person.phase)%1,part=progress<.5?progress*2:2-progress*2;const p=person.path.getPointAtLength(part*person.length);point=[94.9435+p.x*(1977.05877/1977.29),286.7173+p.y*(1530.64319/1530.54)];}
   const sx=x+point[0]*zoom,sy=y+point[1]*zoom;person.el.hidden=sx<16||sx>visibleWidth()-16||sy<16||sy>root.clientHeight-34;
   person.el.style.transform=`translate(${sx-40}px,${sy-16}px)`;person.el.dataset.worldX=point[0].toFixed(2);person.el.dataset.worldY=point[1].toFixed(2);
  }
 }
 function urgent(){
  const fastGeometry=window.portfolioIPad||matchMedia('(pointer:coarse)').matches,r=fastGeometry?(viewportRect||(viewportRect=root.getBoundingClientRect())):root.getBoundingClientRect(),scale=r.width/root.clientWidth,h=root.clientHeight;
  let top=Math.max(0,-r.top/scale),bottom=Math.min(h,(window.innerHeight-r.top)/scale);
  if(bottom-top<120){top=0;bottom=h;}
  const bounds={left:40,right:visibleWidth()-40,top:top+40,bottom:bottom-40};
  const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
  const projected=alerts.map(a=>{const fast=window.portfolioIPad||matchMedia('(pointer:coarse)').matches,icon=!fast||!a.anchor?a.icon?.getBoundingClientRect():null;let lift=a.anchor?a.anchor.lift*zoom+28:22;if(icon&&icon.width){a.target.x=((icon.left+icon.width/2-r.left)/scale-x)/zoom;a.target.y=((icon.top+icon.height/2-r.top)/scale-y)/zoom;lift=icon.height/(2*scale)+28;if(fast)a.anchor={lift:(lift-28)/zoom};}const tx=x+a.target.x*zoom,ty=y+a.target.y*zoom,px=limit(tx,bounds.left,bounds.right),py=limit(ty-lift,bounds.top,bounds.bottom);return {a,tx,ty,px,py,edge:px!==tx||py!==ty-lift};}).sort((a,b)=>Number(a.edge)-Number(b.edge));
  const placed=[];
  const free=(px,py)=>!(px<104&&Math.abs(py-h/2)<110)&&placed.every(p=>Math.hypot(p.x-px,p.y-py)>55);
  for(const p of projected){let px=p.px,py=p.py;
   if(!free(px,py)){
    const horizontal=Math.abs(py-bounds.top)<1||Math.abs(py-bounds.bottom)<1;
    const candidates=[];
    for(let i=1;i<18;i++)for(const sign of [-1,1])candidates.push(horizontal?[limit(px+sign*i*58,bounds.left,bounds.right),py]:[px,limit(py+sign*i*58,bounds.top,bounds.bottom)]);
    candidates.push([Math.max(110,bounds.left),bounds.top],[bounds.right,bounds.bottom]);
    const candidate=candidates.find(c=>free(c[0],c[1]));if(candidate)[px,py]=candidate;
   }
   placed.push({x:px,y:py});let angle=Math.atan2(p.ty-py,p.tx-px)*180/Math.PI-90;
   while(angle-p.a.angle>180)angle-=360;while(angle-p.a.angle< -180)angle+=360;p.a.angle=angle;
   p.a.el.style.transform=`translate(${px-26}px,${py-26}px)`;p.a.el.style.setProperty('--pin-angle',angle+'deg');
   Object.assign(p.a.el.dataset,{edge:String(p.edge),markerX:px.toFixed(2),markerY:py.toFixed(2),targetX:p.tx.toFixed(2),targetY:p.ty.toFixed(2),angle:angle.toFixed(2)});
  }
 }
 function render(){staff();urgent();}
 function tick(now){frame=0;if(!inView||document.hidden||reduce.matches){previous=0;return;}if(previous)elapsed+=Math.min(now-previous,100)/1000;previous=now;staff();frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);frame=0;previous=0;render();if(inView&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);}
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;resume();},{threshold:.02});observer.observe(root);
 document.addEventListener('visibilitychange',resume);reduce.addEventListener('change',resume);window.addEventListener('scroll',urgent,{passive:true});window.addEventListener('resize',render);
 return {render};
}
})();
