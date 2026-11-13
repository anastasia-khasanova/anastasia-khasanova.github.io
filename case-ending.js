(() => {
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  const label=document.createElement('div');
  label.className='project-cursor';label.setAttribute('aria-hidden','true');
  document.body.append(label);
  let current=null,x=0,y=0,pending=false;
  function setLabel(title){
    const style=window.getComputedStyle(label);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const spacing=parseFloat(style.letterSpacing)||0;
    const width=text=>ctx.measureText(text.toUpperCase()).width+Math.max(0,text.length-1)*spacing;
    const limit=Math.min(window.innerWidth-90,window.innerWidth>=1700?344:304);
    const words=title.trim().split(/\s+/);
    let result=title;
    if(width(title)>limit&&words.length>1){
      let best=Infinity;
      for(let i=1;i<words.length;i++){
        const first=words.slice(0,i).join(' '),second=words.slice(i).join(' ');
        const a=width(first),b=width(second);
        const score=Math.max(a,b)+Math.abs(a-b)*.2;
        if(score<best){best=score;result=first+'\n'+second;}
      }
    }
    label.textContent=result;
  }

  function position(){
    pending=false;
    if(!current)return;
    const box=label.getBoundingClientRect(),gap=24;
    let left=x+gap,top=y+gap;
    if(left+box.width>window.innerWidth-18)left=x-box.width-gap;
    if(top+box.height>window.innerHeight-18)top=y-box.height-gap;
    left=Math.max(18,Math.min(left,window.innerWidth-box.width-18));
    top=Math.max(18,Math.min(top,window.innerHeight-box.height-18));
    label.style.transform=`translate3d(${left}px,${top}px,0) rotate(0deg)`;
  }
  function hide(){current=null;label.classList.remove('is-visible');}
  document.querySelectorAll('.related-card:not(.case-related-card)').forEach(card=>{
    card.addEventListener('pointerenter',e=>{
      if(e.pointerType==='touch')return;
      current=card;x=e.clientX;y=e.clientY;
      setLabel(card.querySelector('h3').childNodes[0].textContent.trim());
      position();label.classList.add('is-visible');
    });
    card.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(!pending){pending=true;requestAnimationFrame(position);}});
    card.addEventListener('pointerleave',hide);
    card.addEventListener('click',hide);
  });
  window.addEventListener('blur',hide);
  window.addEventListener('scroll',()=>{
    if(!current)return;
    const hovered=document.elementFromPoint(x,y)?.closest('.related-card');
    if(hovered!==current){
      if(!hovered){hide();return;}
      current=hovered;
      setLabel(current.querySelector('h3').childNodes[0].textContent.trim());
    }
    position();
  },{passive:true});
  window.addEventListener('resize',hide);
  document.fonts?.ready.then(()=>{if(current){setLabel(current.querySelector('h3').childNodes[0].textContent.trim());position();}});
})();
(() => {
const track=document.querySelector('.related-track');if(!track||track.classList.contains('case-related-track'))return;
const prev=document.querySelector('.related-prev'),next=document.querySelector('.related-next'),progress=document.querySelector('.related-progress span');
function update(){const max=track.scrollWidth-track.clientWidth;prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=max-2;const fraction=Math.min(1,track.clientWidth/track.scrollWidth);progress.style.width=`${fraction*100}%`;progress.style.transform=`translateX(${max>0?(track.scrollLeft/max)*(1/fraction-1)*100:0}%)`;}
function move(direction){track.scrollBy({left:direction*(track.querySelector('.related-card').offsetWidth+24),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(track);update();
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
track.querySelectorAll('button.related-card').forEach(card=>card.addEventListener('click',()=>{const dialog=document.querySelector('#project-dialog');dialog.querySelector('h2').textContent=card.querySelector('h3').textContent;dialog.showModal();}));
})();
