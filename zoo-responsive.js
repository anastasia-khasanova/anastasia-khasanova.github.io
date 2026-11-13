/* Move the existing live nodes, never clone phone controls or their event handlers. */
(()=>{
 const breakpoint=matchMedia('(max-width:1024px)'),node=id=>document.querySelector(id.startsWith('.')?id:'[data-node-id="'+id+'"]');
 const holder=document.querySelector('.zc-holder'),moves=[],frames=[];
 const mobile=document.createElement('main');mobile.className='zc-mobile';mobile.id='zoo-mobile-case';mobile.hidden=true;mobile.setAttribute('aria-label','Мобильная система контроля зоопарка');holder.before(mobile);
 let built=false;
 function group(className=''){const el=document.createElement('section');el.className='zc-mobile-group '+className;mobile.append(el);return el;}
 function move(id,parent){const el=node(id);if(!el)throw Error('Missing responsive zoo node '+id);const anchor=document.createComment('Original zoo node '+id);el.before(anchor);moves.push({el,anchor,parent});parent.append(el);return el;}
 function readText(n){return typeof n==='string'?n:n.childNodes?.length?Array.from(n.childNodes,readText).join(' '):n.textContent||'';}
 function copy(id,parent,heading=false){const source=node(id),el=document.createElement(heading?'h2':'p');el.className=heading?'zc-mobile-heading':'zc-mobile-description';el.textContent=readText(source).replace(/([.!?—])(?=[А-ЯЁ])/g,'$1 ').replace(/\s+/g,' ').trim();parent.append(el);return el;}
 function intro(id){const s=group('zc-mobile-intro'),source=node(id);[...source.children].forEach((el,i)=>copy(el.dataset.nodeId,s,i===0));return s;}
 function frame(id,width,height,maxWidth=width,parent=mobile,extra=''){
  const slot=document.createElement('section');slot.className='zc-mobile-frame '+extra;slot.style.maxWidth=maxWidth+'px';const stage=document.createElement('div');stage.className='zc-mobile-stage';stage.style.width=width+'px';stage.style.minHeight=height+'px';slot.append(stage);parent.append(slot);
  const el=move(id,stage);el.classList.add('zc-mobile-root');el.style.setProperty('--mobile-native-width',width+'px');el.style.setProperty('--mobile-native-height',height+'px');frames.push({slot,stage,width,height});return slot;
 }
 function build(){
  const header=group('zc-mobile-header');move('820:327',header);
  const lead=intro('820:453');lead.querySelector('h2').outerHTML=lead.querySelector('h2').outerHTML.replaceAll('h2','h1');
  frame('822:1330',1920,1080,1024,mobile,'zc-mobile-film');
  const caption=group();copy('846:2131',caption);
  const taskIntro=intro('872:863'),taskDescription=taskIntro.querySelector('.zc-mobile-description');
  frame('846:2127',712,989,470);group().append(taskDescription);
  const tasks=group('zc-mobile-task-layout');frame('898:2466',426,898,340,tasks);move('898:4720',tasks).classList.add('zc-mobile-task-copy');
  intro('898:6508');
  frame('898:10043',426,898,340,mobile,'zc-mobile-map-phone');
  const mapScreen=document.createElement('div');mapScreen.className='zc-mobile-map-screen';node('898:11117').prepend(mapScreen);move('898:9927',mapScreen);
  move('898:11809',group('zc-mobile-legend'));
  const modes=group('zc-mobile-intro');copy('913:5897',modes,true);copy('913:5898',modes);
  const pair=group('zc-mobile-phone-pair');
  const tabs=document.createElement('div');tabs.className='zc-mobile-mode-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Способ поиска вольера');pair.append(tabs);
  const panels=[frame('913:5899',560,1000,380,pair),frame('913:5929',560,1000,380,pair)],buttons=[];
  function showMode(index,focus=false){panels.forEach((panel,i)=>{panel.hidden=i!==index;panel.inert=i!==index;buttons[i].setAttribute('aria-selected',String(i===index));buttons[i].tabIndex=i===index?0:-1;});size();if(focus)buttons[index].focus();}
  ['Карта','Список'].forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.id='zoo-mobile-mode-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls','zoo-mobile-mode-panel-'+i);panels[i].id='zoo-mobile-mode-panel-'+i;panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',button.id);button.addEventListener('click',()=>showMode(i));button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();showMode(e.key==='Home'?0:e.key==='End'?1:1-i,true);}});tabs.append(button);buttons.push(button);});showMode(0);
  intro('898:11818');frame('913:6720',1920,954,1024,mobile,'zc-mobile-film');
  intro('926:6893');
  const metrics=group('zc-mobile-metrics');for(const id of ['922:6775','922:6777','922:6776','922:6778'])move(id,metrics);
  frame('922:6732',678.75,590,700);const healthCaption=group('zc-mobile-health-caption');copy('926:6898',healthCaption);
  const update=group('zc-mobile-intro');const title=document.createElement('h2');title.className='zc-mobile-heading';title.textContent='Обновление данных прямо во время обхода';update.append(title);copy('930:7234',update);
  const animalPhone=frame('.zc-animal-demo',426,898,340,mobile,'zc-mobile-animal-phone');
  const hardware=node('898:10044').cloneNode(true);hardware.classList.add('zc-mobile-animal-hardware');hardware.setAttribute('aria-hidden','true');
  function anonymizeHardware(el){const id=el.getAttribute('data-node-id');if(id){el.setAttribute('data-phone-hardware-node',id);el.removeAttribute('data-node-id');}el.removeAttribute('id');for(const child of el.children)anonymizeHardware(child);}anonymizeHardware(hardware);animalPhone.querySelector('.zc-mobile-stage').prepend(hardware);
  move('930:7291',group('zc-mobile-care'));const dailyCaption=group('zc-mobile-care-caption');copy('930:7293',dailyCaption);
  const ending=group('zc-mobile-intro');copy('930:7803',ending,true);copy('930:7804',ending);
  const notes=group('zc-mobile-notes');move('930:7805',notes);
  const footer=group('zc-mobile-ending');move('930:7966',footer);
  built=true;
 }
 function size(){if(!breakpoint.matches)return;for(const f of frames){if(f.slot.hidden)continue;const scale=f.slot.clientWidth/f.width;f.stage.style.zoom=window.portfolioIPad?1:scale;f.stage.style.transform=window.portfolioIPad?'scale('+scale+')':'none';f.stage.style.setProperty('--mobile-scale',scale);f.slot.style.height=Math.max(f.height,f.stage.scrollHeight)*scale+'px';}}
 function sync(){
  document.documentElement.classList.toggle('zoo-mobile',breakpoint.matches);mobile.hidden=!breakpoint.matches;
  if(breakpoint.matches){if(!built)build();else for(const {el,parent}of moves)parent.append(el);holder.setAttribute('aria-hidden','true');}
  else if(built){for(const {el,anchor}of moves)anchor.after(el);holder.removeAttribute('aria-hidden');}
  document.querySelector('.zc-skip').setAttribute('href',breakpoint.matches?'#zoo-mobile-case':'#zoo-case');size();dispatchEvent(new Event('zoo:notes-layout'));dispatchEvent(new Event('zoo:responsive'));
 }
 sync();breakpoint.addEventListener('change',sync);addEventListener('resize',size,{passive:true});document.fonts.ready.then(size);
 const observer=new ResizeObserver(size);observer.observe(mobile);for(const {stage}of frames)observer.observe(stage);
})();
