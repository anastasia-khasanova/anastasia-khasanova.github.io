/* Runtime colour controls and material recolouring of the original avatar. */
(()=>{'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),rgb=h=>h.slice(1).match(/../g).map(v=>parseInt(v,16)),hex=c=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
 const points=new Map(),pads=new Set(),cache=new Map();
 const eyeOuter=new Path2D('M152.542 27.1936C154.107 27.113 155.674 27.0785 157.242 27.0899C171.042 27.1077 184.285 32.5874 194.124 42.3513C201.852 50.1434 204.765 57.7967 209.571 67.4466L222.343 92.9437L257.542 163.172L280.805 209.295C283.69 214.957 286.527 220.643 289.318 226.352C291.25 230.219 293.443 234.226 295.057 238.216C297.569 244.325 298.842 250.878 298.807 257.492C298.879 271.908 293.258 285.759 283.183 295.983C276.465 302.749 266.106 308.525 256.824 310.595C250.494 312.009 244.728 311.704 238.293 311.699L220.762 311.689L160.63 311.683C138.73 310.986 115.485 311.363 93.4826 311.381L76.4011 311.413C69.7951 311.417 61.8746 311.612 55.5184 309.976C32.2659 303.994 15.9779 284.597 14.3028 260.595C13.7528 253.211 14.858 245.797 17.5364 238.902C18.9597 235.237 20.7817 231.891 22.5227 228.377L32.486 208.578L66.3869 141.173L99.0302 76.0745C104.155 66.0329 109.505 52.7486 116.687 44.5129C125.616 34.2736 139.142 28.1199 152.542 27.1936Z'),eyeSafe=new Path2D('M153.843 39.3055C154.543 39.2694 155.243 39.254 155.944 39.2591C162.115 39.2671 168.036 41.7172 172.435 46.083C175.891 49.567 177.193 52.9891 179.342 57.3038L200.791 100.105L211.193 120.729C212.483 123.26 213.752 125.802 214.999 128.355C215.864 130.084 216.844 131.876 217.565 133.66C218.689 136.391 219.258 139.322 219.242 142.279C219.275 148.724 216.761 154.918 212.256 159.489C209.252 162.514 204.621 165.097 200.471 166.023C197.64 166.655 195.062 166.519 192.184 166.517L157.459 166.509C147.667 166.198 137.274 166.366 127.436 166.374L119.798 166.388C116.844 166.39 113.303 166.478 110.461 165.746C100.064 163.071 92.7808 154.398 92.0319 143.666C91.7859 140.365 92.2801 137.05 93.4777 133.967C94.1141 132.328 94.9288 130.832 95.7072 129.261L115.32 90.2691L129.916 61.1616C132.207 56.6717 134.6 50.7319 137.811 47.0494C141.804 42.4711 147.851 39.7196 153.843 39.3055Z');
 const hit=document.createElement('canvas').getContext('2d');
 function colourRGB(kind,x,y,contrast=32){
  if(kind==='eye'){const t=clamp((y-27)/285),r=clamp((x-14)/285),base=[138,92,64].map((v,i)=>v*(1-t)+([71,145,194][i]*(1-r)+[115,163,92][i]*r)*t),peak=Math.max(...base),gain=Math.pow(2,(clamp(contrast,0,100)-32)/48),level=255*(1-Math.pow(1-peak/255,gain));return base.map(v=>v*level/peak);}
  if(kind==='skin'){
   // Horizontal depth keeps light/mid tones spacious; vertical position selects undertone.
   const depth=Math.pow(clamp(x/314),1.6),warmth=clamp(y/189);
   return [238,211,199].map((v,i)=>{
    const rosy=v+([112,76,65][i]-v)*depth;
    const golden=[237,213,187][i]+([114,82,60][i]-[237,213,187][i])*depth;
    return rosy+(golden-rosy)*warmth;
   });
  }
  return [219,187,140].map((v,i)=>(v+([244,116,20][i]-v)*x/314)*(1-y/220));
 }
 const colour=(...args)=>hex(colourRGB(...args));
 function safe(kind,x,y){return kind==='eye'?hit.isPointInPath(eyeSafe,x,y):kind==='skin'?x>=58&&x<=168&&y>=64&&y<=138:x>=42&&x<=126&&y>=112&&y<=174;}
 function inferPoint(kind,value,contrast=32){const target=rgb(value),h=kind==='eye'?312:189;let best={x:0,y:0},distance=Infinity;for(let y=0;y<=h;y+=3)for(let x=0;x<=314;x+=3){if(kind==='eye'&&!hit.isPointInPath(eyeOuter,x,y))continue;const c=colourRGB(kind,x,y,contrast),error=c.reduce((sum,v,k)=>sum+(v-target[k])**2,0);if(error<distance){distance=error;best={x,y};}}return {...best,inBase:safe(kind,best.x,best.y)};}
 function mount(root,state,eye,onChange){
  pads.clear();
  for(const pad of root.querySelectorAll('.eye-palette,.color-pad')){
   const kind=pad.classList.contains('eye-palette')?'eye':pad.classList.contains('skin')?'skin':'hair',key=kind==='eye'?eye+'Eye':kind==='skin'?'skinColor':'hairColor',h=kind==='eye'?312:189;
   pad.removeAttribute('data-color-pad');pad.classList.add('interactive-palette');pad.tabIndex=0;pad.setAttribute('role','group');pad.setAttribute('aria-label',kind==='eye'?'Палитра: '+(eye==='left'?'левый':'правый')+' глаз':kind==='skin'?'Палитра оттенков кожи':'Палитра цвета волос');
   const p=state.palette?.[key]?{...state.palette[key]}:{x:kind==='eye'?156:kind==='skin'?100:85,y:kind==='eye'?54:kind==='skin'?96:150};points.set(key,p);
   pad.innerHTML='<canvas width="628" height="'+(h*2)+'" aria-hidden="true"></canvas><span class="palette-base" aria-hidden="true"></span><span class="colour-pointer" aria-hidden="true"></span>';
   const note=document.createElement('div');note.className='palette-service';note.setAttribute('role','status');note.innerHTML='<strong>Дополнительная услуга</strong><span>Этот цвет выходит за рамки базового генетического набора. Требуется сторонняя ДНК.</span>';pad.after(note);
   const item={pad,kind,key,p,h,note,eye,state};pads.add(item);
   let dragging=false;
   const move=(x,y)=>{x=clamp(x,0,314);y=clamp(y,0,h);if(kind==='eye'&&!hit.isPointInPath(eyeOuter,x,y)){let a=0,b=1;for(let i=0;i<16;i++){const t=(a+b)/2;if(hit.isPointInPath(eyeOuter,156+(x-156)*t,170+(y-170)*t))a=t;else b=t;}x=156+(x-156)*a;y=170+(y-170)*a;}
    p.x=x;p.y=y;const value=colour(kind,x,y,item.state[eye+'Contrast']);onChange(key,value,{x,y,inBase:safe(kind,x,y)});paint(item,item.state);};
   item.move=move;
   const pointer=e=>{const r=pad.getBoundingClientRect();move((e.clientX-r.left)/r.width*314,(e.clientY-r.top)/r.height*h);};
   pad.onpointerdown=e=>{e.preventDefault();dragging=true;pad.setPointerCapture(e.pointerId);pointer(e);};pad.onpointermove=e=>{if(dragging)pointer(e);};pad.onpointerup=pad.onpointercancel=()=>{dragging=false;};
   pad.onkeydown=e=>{const d={ArrowLeft:[-3,0],ArrowRight:[3,0],ArrowUp:[0,-3],ArrowDown:[0,3]}[e.key];if(!d)return;e.preventDefault();move(p.x+d[0],p.y+d[1]);};paint(item,state);
  }
 }
 function paint(item,state){const {pad,kind,key,p,h,note,eye}=item,c=pad.querySelector('canvas'),ctx=c.getContext('2d'),contrast=state[eye+'Contrast'],signature=kind==='eye'?contrast:'fixed';
  if(c.dataset.paint!==String(signature)){const data=ctx.createImageData(628,h*2);for(let y=0;y<h*2;y++)for(let x=0;x<628;x++){const i=(y*628+x)*4,co=colourRGB(kind,x/2,y/2,contrast);data.data[i]=co[0];data.data[i+1]=co[1];data.data[i+2]=co[2];data.data[i+3]=255;}ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.putImageData(data,0,0);ctx.setTransform(2,0,0,2,0,0);if(kind==='eye'){ctx.globalCompositeOperation='destination-in';ctx.fillStyle='#000';ctx.fill(eyeOuter);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#1313130d';ctx.strokeStyle='#13131318';ctx.fill(eyeSafe);ctx.stroke(eyeSafe);}ctx.restore();c.dataset.paint=String(signature);}
  const dot=pad.querySelector('.colour-pointer');dot.style.left=p.x/314*100+'%';dot.style.top=p.y/h*100+'%';dot.style.background=kind==='eye'?colour(kind,p.x,p.y,contrast):state[key];const extra=!safe(kind,p.x,p.y);pad.classList.toggle('requires-dna',extra);pad.dataset.service=extra?'additional':'base';note.hidden=!extra;dot.style.borderColor=extra?'#0069fb':'#ffffffb3';
 }
 function refresh(state){for(const item of pads){item.state=state;if(state.palette?.[item.key])Object.assign(item.p,state.palette[item.key]);paint(item,state);}const first=[...pads][0];if(first){const included=first.pad.closest('.settings-scroll')?.querySelector('.included');if(included)included.textContent=[...pads].some(i=>!safe(i.kind,i.p.x,i.p.y))?'Доступно с использованием сторонней ДНК':'В базовом диапазоне — без доплаты';}}
 function eyeColour(state,side){const key=side+'Eye',p=state.palette?.[key]||(state[key]==='#7a5946'?{x:156,y:54}:null);return p?colour('eye',p.x,p.y,state[side+'Contrast']):state[key];}
 // Filter only the hair's tonal map; silhouettes and neighbouring skin never enter the blur.
 function smoothHairTone(source,weights,w,h){
  const tone=new Float32Array(weights.length),horizontal=new Float32Array(weights.length),result=new Float32Array(weights.length),kernel=[1,6,15,20,15,6,1];
  for(let i=0;i<weights.length;i++)if(weights[i]>0){const j=i*4;tone[i]=.2126*source.data[j]+.7152*source.data[j+1]+.0722*source.data[j+2];}
  for(let i=0;i<weights.length;i++)if(weights[i]>0){const x=i%w;let sum=0,total=0;for(let d=-3;d<=3;d++){if(x+d<0||x+d>=w)continue;const n=i+d,weight=kernel[d+3]*weights[n];sum+=tone[n]*weight;total+=weight;}horizontal[i]=sum/Math.max(total,.0001);}
  for(let i=0;i<weights.length;i++)if(weights[i]>0){const y=Math.floor(i/w);let sum=0,total=0;for(let d=-3;d<=3;d++){if(y+d<0||y+d>=h)continue;const n=i+d*w,weight=kernel[d+3]*weights[n];sum+=horizontal[n]*weight;total+=weight;}result[i]=sum/Math.max(total,.0001);}
  return result;
 }
 async function prepare(gender){if(cache.has(gender))return cache.get(gender);const pending=(async()=>{const img=new Image();img.src='assets/genome-case/avatars-20261109/'+gender+'-appearance.png';await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const source=ctx.getImageData(0,0,c.width,c.height),regions=new Uint8Array(c.width*c.height),w=c.width;
   // Dedicated hair masks separate hair/skin boundaries; iris bounds stay independent. Alpha is never modified.
   // Iris interiors, inset from the limbal ring and upper/lower eyelids.
   const girl=gender==='girl',eyes=girl?[[466,357,19,18],[603,336,19,18]]:[[429,305,17,17],[552,294,17,17]];
   const maskImage=new Image();maskImage.src='assets/genome-case/avatars-20261109/'+gender+'-hair-mask.png';await maskImage.decode();
   const maskCanvas=document.createElement('canvas');maskCanvas.width=w;maskCanvas.height=c.height;const maskContext=maskCanvas.getContext('2d',{willReadFrequently:true});maskContext.drawImage(maskImage,0,0);
   const maskPixels=maskContext.getImageData(0,0,w,c.height).data,hairWeights=new Float32Array(regions.length);
   for(let i=0;i<regions.length;i++){const j=i*4,[r,g,b,a]=source.data.subarray(j,j+4);if(a<200)continue;const x=i%w,y=Math.floor(i/w);let eye=-1;for(let k=0;k<2;k++){const [ex,ey,rx,ry]=eyes[k];if(((x-ex)/rx)**2+((y-ey)/ry)**2<1&&g>22&&r>g*1.08&&g>b*1.05)eye=k;}
    if(eye>=0){regions[i]=eye+3;continue;}
    const warm=r>g*1.08&&g>b*1.08;
    const hair=maskPixels[j]/255;hairWeights[i]=hair;
    if(hair>0)regions[i]=1;else if(warm&&r>120)regions[i]=2;
   }const hairTone=smoothHairTone(source,hairWeights,w,c.height);return {img,source,regions,hairWeights,hairTone,w,h:c.height};})();cache.set(gender,pending);return pending;}
 function draw(canvas,asset,state){const {source,regions,hairWeights,hairTone,w,h}=asset;if(canvas.width!==w){canvas.width=w;canvas.height=h;}const ctx=canvas.getContext('2d'),out=new ImageData(new Uint8ClampedArray(source.data),w,h),targets=[null,rgb(state.hairColor),rgb(state.skinColor),rgb(eyeColour(state,'left')),rgb(state.heterochromia?eyeColour(state,'right'):eyeColour(state,'left'))],bases=[null,[87,74,64],[217,173,144],[122,89,70],[122,89,70]];
  // Bounded tone transfer preserves material detail instead of multiplying RGB
  // into hard clipping. The selected colour is anchored at the source midtone;
  // highlights approach white smoothly and shadows keep their depth.
  const luminance=c=>.2126*c[0]+.7152*c[1]+.0722*c[2],tables=targets.map((target,m)=>{
   if(!target)return null;
   const peak=Math.max(...target),hairGain=m===1&&peak>180?(180+40*(1-Math.exp(-(peak-180)/75)))/peak:1;
   const contrast=m>=3?.8+clamp(Number(state[(m===3||!state.heterochromia?'left':'right')+'Contrast'])||0,0,100)*.004:m===1?1-clamp((peak-180)/300,0,.25):1;
   const reference=luminance(bases[m]),white=m===1?232:255,shade=(value,l,c)=>{const level=Math.pow(l/reference,c);return level<=1?value*level:value+(white-value)*(1-Math.exp(-(level-1)*.7));};
   const strength=Math.exp(-Math.pow(Math.hypot(...target.map((v,k)=>v-bases[m][k]))/110,2));
   return target.map((value,k)=>{const base=new Float32Array(256),tone=new Float32Array(256);
    for(let l=0;l<256;l++){base[l]=shade(bases[m][k],l,1);tone[l]=shade(value*hairGain,l,contrast);}return {base,tone,strength};});
  });
  const hairSoftness=clamp((Math.max(...targets[1])-155)/60)*.88;
  const transfer=(m,j,l,k)=>{const {base,tone,strength}=tables[m][k],b=base[l],t=tone[l],v=source.data[j+k],detail=v>=b?t+(v-b)*(255-t)/Math.max(.0001,255-b):t*v/Math.max(.0001,b);return t+strength*(detail-t);};
  for(let i=0;i<regions.length;i++){const m=regions[i];if(!m)continue;const j=i*4,raw=.2126*source.data[j]+.7152*source.data[j+1]+.0722*source.data[j+2],l=Math.round(m===1?raw+(hairTone[i]-raw)*hairSoftness:raw);for(let k=0;k<3;k++){const value=transfer(m,j,l,k);out.data[j+k]=m===1&&hairWeights[i]<1&&(source.data[j]-source.data[j+1]>45||source.data[j]-source.data[j+2]>80)?value*hairWeights[i]+transfer(2,j,l,k)*(1-hairWeights[i]):value;}}
  ctx.putImageData(out,0,0);canvas.dataset.appearance=JSON.stringify({hair:state.hairColor,skin:state.skinColor,left:eyeColour(state,'left'),right:state.heterochromia?eyeColour(state,'right'):eyeColour(state,'left')});
 }
 window.GenomeAppearance={mount,inferPoint,refresh,prepare,draw,moveDemoPoint:(key,x,y)=>[...pads].find(item=>item.key===key)?.move(x,y),snapshot:s=>({...s,leftEye:eyeColour(s,"left"),rightEye:eyeColour(s,"right")})};
})();
