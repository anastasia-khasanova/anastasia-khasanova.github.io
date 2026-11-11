// Choose the opening direction using the actual on-screen neighbouring circles.
window.fitPersonDetails=function({x,y,w,frame,obstacles,preferred,nameLength,textSize}){
 const angles=[...new Set([preferred,preferred-45,preferred+45,0,180,-preferred,...Array.from({length:16},(_,i)=>i*22.5)])],scales=[1,.85,.7];
 let best=null;
 for(const scale of scales)for(const angle of angles){
  const radians=angle*Math.PI/180,dx=-Math.sin(radians),dy=Math.cos(radians),distance=w*1.144*scale;
  const samples=[{x:x+dx*distance,y:y+dy*distance,r:w*.5*scale}];
  for(const t of [.4,.65,.85])samples.push({x:x+dx*distance*t,y:y+dy*distance*t,r:w*.22*scale});
  const labelDistance=w*1.644*scale+Math.max(w*.5,nameLength*(textSize||w*.2133)*.62)/2+5;
  const nameX=x+dx*labelDistance,nameY=y+dy*labelDistance,nameWidth=Math.max(w*.5,nameLength*(textSize||w*.2133)*.62),nameHeight=textSize||w*.24*scale;
  for(const offset of [-.5,-.25,0,.25,.5])samples.push({x:nameX+offset*nameWidth,y:nameY,r:nameHeight*.6});
  let penalty=0;
  for(const sample of samples){
   for(const other of obstacles){const overlap=sample.r+other.r+8-Math.hypot(sample.x-other.x,sample.y-other.y);if(overlap>0)penalty+=overlap*overlap;}
   for(const gap of [sample.x-sample.r-frame.left,frame.right-sample.x-sample.r,sample.y-sample.r-frame.top,frame.bottom-sample.y-sample.r])if(gap<5)penalty+=(5-gap)**2;
  }
  const result={angle,scale,penalty};if(!best||penalty<best.penalty)best=result;if(penalty===0)return result;
 }
 return best;
};
