(()=>{'use strict';
const node=id=>document.querySelector('[data-node-id="'+id+'"]');
const chart=node('922:6752'),selector=node('922:6766');
if(!chart||!selector)return;
// One illustrative history: the final month retains the original 145/112/126 kg story.
// Intermediate and earlier readings are demo data, not additional medical records.
const monthAnchors=[[0,132],[8.4,145],[19.6,112],[31,126]];
function monthWeight(day){
 const i=Math.min(monthAnchors.length-2,Math.max(0,monthAnchors.findIndex((p,k)=>k<3&&day<=monthAnchors[k+1][0])));
 const [a,b]=[monthAnchors[i],monthAnchors[i+1]],t=Math.max(0,Math.min(1,(day-a[0])/(b[0]-a[0])));
 return a[1]+(b[1]-a[1])*t*t*(3-2*t);
}
// Illustrative scenario requested for this case: a summer dip, followed by the October event.
const previousMonths=[133,135,136,135,134,132,128,122,118,123,132];
const history=[...previousMonths.map((weight,i)=>({day:-365+i*30.4,weight})),...Array.from({length:32},(_,i)=>({day:i-31,weight:monthWeight(i)}))];
// Keep the final month and its exact critical readings; annual averaging must not erase them.
const annualHistory=[...history,...monthAnchors.slice(1,-1).map(([day,weight])=>({day:day-31,weight}))].sort((a,b)=>a.day-b.day);
function smoothPath(points){
 // Natural cubic spline: both slope and curvature remain continuous at every join.
 const n=points.length,h=points.slice(1).map((p,i)=>p.x-points[i].x),second=Array(n).fill(0),upper=Array(n).fill(0),rhs=Array(n).fill(0);
 for(let i=1;i<n-1;i++){
  const diagonal=2*(h[i-1]+h[i])-h[i-1]*upper[i-1];
  upper[i]=h[i]/diagonal;
  rhs[i]=(6*((points[i+1].y-points[i].y)/h[i]-(points[i].y-points[i-1].y)/h[i-1])-h[i-1]*rhs[i-1])/diagonal;
 }
 for(let i=n-2;i>0;i--)second[i]=rhs[i]-upper[i]*second[i+1];
 return points.map((p,i)=>{
  if(!i)return 'M'+f(p.x)+' '+f(p.y);
  const prev=points[i-1],width=h[i-1],slope=(p.y-prev.y)/width;
  const left=slope-width*(2*second[i-1]+second[i])/6,right=slope+width*(second[i-1]+2*second[i])/6;
  return 'C'+f(prev.x+width/3)+' '+f(prev.y+left*width/3)+' '+f(p.x-width/3)+' '+f(p.y-right*width/3)+' '+f(p.x)+' '+f(p.y);
 }).join(' ');
}
const referenceDate=Date.UTC(2026,10,2),dayMs=86400000;
const dateLabel=(offset,year)=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',...(year?{year:'numeric'}:{}),timeZone:'UTC'}).format(referenceDate+offset*dayMs).replace(/\s*г\.$/,'');
const periods=[{name:'Год',days:365},{name:'Месяц',days:31},{name:'Неделя',days:7}].map((p,i)=>({...p,start:dateLabel(-p.days,i===0),end:dateLabel(0,i===0)}));
const original=[...chart.children];
const layer=document.createElement('div');layer.className='zc-weight-history';chart.append(layer);
const buttons=['922:6767','922:6769','922:6771'].map(node);
selector.setAttribute('role','group');selector.setAttribute('aria-label','Период динамики веса');
chart.setAttribute('role','img');
let selected=1;
const point=p=>({x:8+(p.day+periods[selected].days)/periods[selected].days*612,y:64+(145-p.weight)/33*168});
const f=n=>Number(n.toFixed(6));
function weightColor(weight){
 const deviation=Math.max((124-weight)/12,(weight-136)/9,0),t=Math.min(1,deviation),blend=t*t*(3-2*t);
 return [139,193,79].map((channel,i)=>Math.round(channel+([255,188,101][i]-channel)*blend));
}
function render(index,notify=false){
 selected=index;const period=periods[index],data=(index===0?annualHistory:history).filter(p=>p.day>=-period.days),points=data.map(point);
 buttons.forEach((button,i)=>{button.classList.toggle('zc-period-active',i===index);button.setAttribute('aria-pressed',String(i===index));});
 node('922:6748').textContent=period.start;node('922:6750').textContent=period.end;
 original.forEach(el=>el.hidden=index!==1);layer.hidden=index===1;
 if(index!==1){
  const path=smoothPath(points);
  const min=data.reduce((a,b)=>a.weight<b.weight?a:b),max=data.reduce((a,b)=>a.weight>b.weight?a:b);
  const extrema=[max,min].filter((p,i,a)=>!i||p.weight!==a[0].weight);
  const labels=extrema.map(p=>{const pos=point(p),value=Math.round(p.weight*10)/10,critical=value<120||value>140,color=critical?'#ffbc65':'#8bc14f';return '<circle cx="'+f(pos.x)+'" cy="'+f(pos.y)+'" r="7" fill="'+color+'" stroke="white" stroke-width="2"/><text x="'+f(Math.max(45,Math.min(585,pos.x)))+'" y="'+f(pos.y+(p===min?36:-24))+'" text-anchor="middle" fill="'+color+'">'+String(value).replace('.',',')+' кг</text>';}).join('');
  const last=points[points.length-1];
  // Colour follows weight vertically, with an eased blend rather than binary daily stops.
  const stops=Array.from({length:67},(_,i)=>'<stop offset="'+f(i/66*100)+'%" stop-color="rgb('+weightColor(145-i/2).join(',')+')"/>').join('');
  layer.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 632 319" aria-hidden="true"><defs><linearGradient id="zc-history-line" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="232">'+stops+'</linearGradient><linearGradient id="zc-history-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8bc14f" stop-opacity=".27"/><stop offset="1" stop-color="#8bc14f" stop-opacity="0"/></linearGradient></defs><path d="'+path+' L'+f(last.x)+' 318 L'+f(points[0].x)+' 318 Z" fill="url(#zc-history-fill)"/><path d="'+path+'" fill="none" stroke="url(#zc-history-line)" stroke-width="4.7" stroke-linecap="round"/>'+labels+'<circle cx="'+f(last.x)+'" cy="'+f(last.y)+'" r="5.5" fill="#8bc14f"/></svg>';
 }
 chart.setAttribute('aria-label','Динамика веса, '+period.name.toLowerCase()+': '+period.start+' — '+period.end+'. Текущий вес 126 кг.');
 if(notify){const status=document.querySelector('.zc-announcer');if(status)status.textContent='График веса: '+period.name.toLowerCase()+', '+period.start+' — '+period.end;}
}
buttons.forEach((button,i)=>{
 button.tabIndex=0;button.setAttribute('role','button');button.setAttribute('aria-label',periods[i].name);
 button.addEventListener('click',()=>render(i,true));
 button.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();render(i,true);}
  else if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowDown'?1:2))%3;render(next,true);buttons[next].focus();}
 });
});
render(1);
})();
