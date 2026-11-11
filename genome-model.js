(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GenomeModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
  const defaults=()=>({version:1,protectionInputs:true,gender:'boy',name:'',boyName:'',girlName:'',started:false,body:38,height:163,heterochromia:false,leftEye:'#7a5946',rightEye:'#7a5946',leftContrast:28,rightContrast:28,hair:'Вьющиеся',hairColor:'#574a40',skinColor:'#d9ad90',palette:{},selected:{},muscleVolume:29,fatigueResistance:28,cardioPotential:28,contractionSpeed:48,reaction:225,logic:34,creativity:34,memory:39,learning:1,immuneBase:44,cancerBase:44,recognition:false,attack:false,psycheBase:62,concentrationBase:56,stress:77,age:70,regeneration:0,agingTempo:0,accepted:false});
  const namePools={boy:['Антон','Артём','Марк','Миша','Лёва'],girl:['София','Мира','Ева','Алиса','Анна']};
  const randomName=gender=>{const names=namePools[gender];return names[Math.floor(Math.random()*names.length)];};
  const numbers={body:[0,100],height:[150,200],leftContrast:[0,100],rightContrast:[0,100],muscleVolume:[0,100],fatigueResistance:[0,100],cardioPotential:[0,100],contractionSpeed:[0,100],reaction:[90,250],logic:[0,100],creativity:[0,100],memory:[0,100],learning:[0,2],immuneBase:[0,100],cancerBase:[0,100],psycheBase:[0,100],concentrationBase:[0,100],stress:[0,100],age:[60,120],regeneration:[0,2],agingTempo:[0,1]};
  // One source for natural intervals, both the UI's grey zones and paid modifications.
  const baseRanges={body:[21,54,38],height:[158,173,163],muscleVolume:[15,50,29],fatigueResistance:[19,37,28],cardioPotential:[24,33,28],contractionSpeed:[40,57,48],reaction:[205,226,225],memory:[30,47,39],age:[70,85,70],immune:[35,54,44],cancer:[40,54,44],psyche:[50,74,62],concentration:[50,65,56],stress:[59,85,77],leftContrast:[20,37,28],rightContrast:[20,37,28],logic:[20,48,34],creativity:[20,48,34]};
  const isOutside=(key,value)=>key in baseRanges&&(value<baseRanges[key][0]||value>baseRanges[key][1]);
  const physicalKeys=['body','height','muscleVolume','fatigueResistance','cardioPotential','contractionSpeed'];
  const physicalCritical=(key,value)=>key==='height'?value<=154||value>=190:key==='body'?value<=10||value>=90:physicalKeys.includes(key)&&(value<=10||value>=85);
  function physicalConflicts(s){
    const low={
      body:['body','Нагрузка на суставы','Плотная комплекция увеличивает нагрузку на суставы при движении.',0,0,0],
      height:['body','Ограниченный размах движений','Минимальный рост сокращает длину шага и размах движений.',0,0,0],
      muscleVolume:['strength','Недостаток силового резерва','Малый объём мышц ограничивает силу и взрывную мощность.',0,0,0],
      fatigueResistance:['muscle-properties','Быстрая утомляемость','Мышцы быстро устают при повторных усилиях. На фоне усталости снижается концентрация.',0,0,15],
      cardioPotential:['cardio-potential','Недостаток аэробного резерва','При длительной нагрузке не хватает аэробного резерва: падают выносливость и концентрация.',0,0,20],
      contractionSpeed:['muscle-properties','Замедленный мышечный отклик','Медленное сокращение мышц ограничивает резкое ускорение и прыжки. Скорость реакции сама по себе это не компенсирует.',0,0,0]
    },high={
      body:['body','Недостаток опоры для нагрузки','Крайне хрупкая комплекция ограничивает силовой резерв. Большой объём мышц при такой комплекции создаёт несогласованную нагрузку.',0,0,0],
      height:['body','Сложность координации','Большой рост увеличивает размах движений и требования к координации.',0,0,0],
      muscleVolume:['strength','Дефицит восстановления мышц','Большой объём мышц требует больше ресурсов для восстановления. В игровой модели это уменьшает иммунный резерв.',30,0,0],
      fatigueResistance:['muscle-properties','Накопление нагрузки','Высокая устойчивость к утомлению позволяет дольше продолжать усилие, но восстановление не ускоряется. Накопленная нагрузка уменьшает иммунный резерв.',20,0,0],
      cardioPotential:['cardio-potential','Несогласованная выносливость','Кардиовыносливость опережает устойчивость мышц к утомлению. Мышцы устают раньше, чем исчерпывается аэробный резерв: снижается концентрация.',0,0,15],
      contractionSpeed:['muscle-properties','Потеря точности движений','Предельная скорость сокращений оставляет меньше времени на коррекцию движения. Для точности требуется больше внимания: снижается концентрация.',0,0,25]
    };
    return physicalKeys.filter(key=>physicalCritical(key,s[key])).map(key=>{
      const isLow=s[key]<(key==='height'?170:50),row=(isLow?low:high)[key],depth=key==='height'?(isLow?(154-s[key])/4:(s[key]-190)/10):isLow?(10-s[key])/10:(s[key]-(key==='body'?90:85))/(key==='body'?10:15),severity=.65+.35*clamp(depth,0,1);
      let [block,label,description,immune,psyche,concentration]=row;
      if(key==='cardioPotential'&&!isLow&&s.fatigueResistance>=70){label='Высокая потребность в восстановлении';description='Высокая кардиовыносливость вместе с устойчивыми к утомлению мышцами допускает очень длительные нагрузки. Их восстановление расходует иммунный резерв.';immune=20;concentration=0;}
      const advice='Выберите более умеренное значение — избегайте крайних положений ползунка.';
      return {key,block,label,description,advice,value:s[key],immune:Math.round(immune*severity),psyche:Math.round(psyche*severity),concentration:Math.round(concentration*severity)};
    });
  }

  const protectionKeys={immune:'immuneBase',cancer:'cancerBase',psyche:'psycheBase',concentration:'concentrationBase'};
  function selectedValue(s,key){return s[protectionKeys[key]];}
  function controlValue(s,key){return key in protectionKeys?s[protectionKeys[key]]:s[key];}
  function systemConflicts(s){
    const advice={logic:'Уменьшите долю логики и сместите точку мышления к центру.',creativity:'Уменьшите долю творчества и сместите точку мышления к центру.',memory:'Выберите более умеренное значение — избегайте крайних положений ползунка.',learning:'Выберите среднюю скорость обучения или уменьшите объём памяти.',age:'Выберите более умеренное значение — избегайте крайних положений ползунка.',regeneration:'Выберите среднюю регенерацию или отключите замедленное старение.',stress:s.stress<=20?'Выберите более умеренное значение — избегайте крайних положений ползунка.':'Выберите более умеренное значение — избегайте крайних положений ползунка.',psyche:'Выберите более умеренное значение — избегайте крайних положений ползунка.',concentration:'Выберите более умеренное значение — избегайте крайних положений ползунка.',immune:'Выберите более умеренное значение — избегайте крайних положений ползунка.',cancer:'Выберите более умеренное значение — избегайте крайних положений ползунка.'};
    const out=[],add=(key,section,block,label,description,immune=0,psyche=0,concentration=0,cancer=0)=>out.push({key,section,block,label,description,advice:advice[key],value:protectionKeys[key]?selectedValue(s,key):s[key],immune,psyche,concentration,cancer});
    if(s.logic>=85)add('logic','intelligence','mind','Ригидность мышления','Доминирование логики оставляет мало гибкости для смены подхода. Переключение между задачами требует больше внимания: снижается концентрация.',0,0,20);
    if(s.creativity>=85)add('creativity','intelligence','mind','Избыток ассоциаций','Доминирование творчества создаёт слишком много конкурирующих идей. Удерживать одну задачу сложнее: снижается концентрация.',0,0,25);
    if(s.memory>=85)add('memory','intelligence','memory','Перегрузка памяти','Большой объём воспоминаний усложняет отбор нужной информации. Повышается нагрузка на психику, снижается концентрация.',0,0,20);
    if(s.learning===2&&s.memory>=70)add('learning','intelligence','learning','Перегрузка обучения','Поток нового материала при большой памяти оставляет мало времени на его усвоение. Возникает перегрузка психики.',0,20);
    if(s.age>=105)add('age','longevity','age','Предельное долголетие','Предельное долголетие повышает нагрузку на клеточную защиту и психику.');
    if(s.regeneration===2&&s.agingTempo===1)add('regeneration','longevity','regeneration','Клеточная перегрузка','Высокая регенерация вместе с замедленным старением повышает нагрузку на клеточную защиту.',15,0,0,25);
    if(s.stress<=20)add('stress','neuro','stress','Высокая стрессовая нагрузка','Постоянная тревожность мешает отдыху и восстановлению. Снижаются устойчивость психики и иммунный резерв.',15,25);
    if(s.stress>=95)add('stress','neuro','stress','Сниженная чувствительность к сигналам','Полное подавление стресса ослабляет реакцию на важные сигналы. Их легче пропустить: снижается концентрация.',0,0,25);
    if(selectedValue(s,'psyche')>=95)add('psyche','neuro','psyche','Подавление реакций','Чрезмерная защита приглушает не только тревогу, но и значимые стимулы. Удерживать внимание сложнее: снижается концентрация.',0,0,20);
    if(selectedValue(s,'concentration')>=95)add('concentration','neuro','concentration','Слишком узкий фокус','Слишком узкий фокус затрудняет переключение и отдых от задачи. Повышается нагрузка на психику.',0,25);
    if(selectedValue(s,'immune')>=85)add('immune','immune','immune','Гиперреактивность защиты','Чрезмерная активность защиты вызывает избыточные реакции на раздражители. Они отвлекают от задач: снижается концентрация.',0,0,20);
    if(selectedValue(s,'cancer')>=95)add('cancer','immune','cancer','Перенапряжение клеточной защиты','Слишком строгий клеточный контроль увеличивает объём обновления тканей. Восстановление расходует иммунный резерв.',25,0);
    return out;
  }
  function isCritical(key,value,s){return physicalCritical(key,value)||(key==='reaction'&&value<=130)||(key==='memory'&&value>=85)||(['logic','creativity'].includes(key)&&value>=85)||(key==='stress'&&(value<=20||value>=95))||(key==='age'&&value>=105)||(key==='immune'&&(value<35||value>=85))||(key==='cancer'&&(value<40||value>=95))||(key==='psyche'&&(value<45||value>=95))||(key==='concentration'&&(value<50||value>=95));}
  function restore(raw){const s=defaults();if(!raw||raw.version!==1)return s;for(const k of Object.keys(s)){if(k in numbers){s[k]=clamp(raw[k]??s[k],...numbers[k]);if(['learning','regeneration','agingTempo'].includes(k))s[k]=Math.round(s[k]);}else if(typeof s[k]==='boolean')s[k]=typeof raw[k]==='boolean'?raw[k]:s[k];else if(k==='gender')s[k]=raw[k]==='girl'?'girl':'boy';else if(/Color|Eye$/.test(k))s[k]=/^#[0-9a-f]{6}$/i.test(raw[k])?raw[k]:s[k];else if(['name','boyName','girlName'].includes(k))s[k]=String(raw[k]||'').slice(0,36);else if(k==='selected'){if(raw.selected&&typeof raw.selected==='object')for(const key of Object.keys(protectionKeys))if(Number.isFinite(raw.selected[key]))s.selected[key]=clamp(raw.selected[key]);}else if(k==='palette'){if(raw.palette&&typeof raw.palette==='object')for(const key of ['hairColor','skinColor','leftEye','rightEye']){const point=raw.palette[key];if(point&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&typeof point.inBase==='boolean')s.palette[key]={x:clamp(point.x,0,314),y:clamp(point.y,0,key.includes('Eye')?312:189),inBase:point.inBase};}}else if(k==='hair')s[k]=['Прямые','Вьющиеся','Кудрявые'].includes(raw[k])?raw[k]:s[k];}const legacy=!('boyName' in raw)&&!('girlName' in raw),other=s.gender==='boy'?'girl':'boy';
 if(legacy&&['boy','girl'].includes(raw.gender)&&namePools[other].includes(s.name)){s[other+'Name']=s.name;s.name=randomName(s.gender);}
 if(raw.protectionInputs!==true)for(const [key,baseKey] of Object.entries(protectionKeys))if(Number.isFinite(raw.selected?.[key]))s[baseKey]=clamp(raw.selected[key]);s.protectionInputs=true;s[s.gender+'Name']=s.name;s.logic=clamp(s.logic);s.creativity=clamp(s.creativity,0,100-s.logic);return s;}
  // Illustrative adult-body potential, not a validated physiological prediction.
  // Scores are independent indices, not percentages or a fixed-sum distribution.
  function physicalCapabilities(s){
    const mass=clamp(50+(50-s.body)*.3+(s.height-170)*.2);
    const score=n=>Math.round(clamp(n));
    return {
      maxStrength:score(.8*s.muscleVolume+.2*mass),
      powerEndurance:score(.7*s.fatigueResistance+.2*s.muscleVolume+.1*s.cardioPotential),
      cardioEndurance:score(.9*s.cardioPotential+.1*s.fatigueResistance),
      explosivePower:score(.6*s.contractionSpeed+.35*s.muscleVolume+.05*mass)
    };
  }
  function derive(s){
    const agePenalty=Math.max(0,s.age-85),memoryPenalty=Math.max(0,s.memory-45),reactionPenalty=Math.max(0,205-s.reaction),physicalCauses=physicalConflicts(s),systemCauses=systemConflicts(s),allCauses=[...physicalCauses,...systemCauses],penalty=key=>Math.min(100,allCauses.reduce((sum,c)=>sum+(c[key]||0),0)),physicalImmunePenalty=penalty('immune'),physicalPsychePenalty=penalty('psyche'),physicalConcentrationPenalty=penalty('concentration'),cellPenalty=penalty('cancer');
    const immune=Math.round(clamp(s.immuneBase-agePenalty-physicalImmunePenalty)),cancer=Math.round(clamp(s.cancerBase-agePenalty*3+(s.recognition?25:0)+(s.attack?45:0)-cellPenalty)),psyche=Math.round(clamp(s.psycheBase-agePenalty*1.6-memoryPenalty*.7-reactionPenalty*.3-physicalPsychePenalty)),concentration=Math.round(clamp(s.concentrationBase-reactionPenalty*1.2-physicalConcentrationPenalty));
    return {...physicalCapabilities(s),immune,cancer,psyche,concentration,speed:Math.max(0,100-s.logic-s.creativity),weight:Math.round((s.height/100)**2*(30-s.body*.096)),bodyLabel:s.body<30?'Плотная':s.body>70?'Хрупкая':'Стройная',stressLabel:s.stress<35?'Тревожный':s.stress>65?'Спокойный':'Баланс',agePenalty,memoryPenalty,reactionPenalty,physicalCauses,systemCauses,allCauses,cellPenalty,physicalImmunePenalty,physicalPsychePenalty,physicalConcentrationPenalty};
  }
  function set(s,key,value){const next={...s,accepted:false};const d=derive(s);if(key in protectionKeys)next.selected={...s.selected,[key]:clamp(value)};if(key==='gender'){const gender=value==='girl'?'girl':'boy';if(gender!==s.gender){next[s.gender+'Name']=String(s.name||'').slice(0,36);next.gender=gender;next.name=next[gender+'Name']||randomName(gender);next[gender+'Name']=next.name;}return next;}if(key==='name'){next.name=String(value||'').slice(0,36);next[s.gender+'Name']=next.name;return next;}if(key in protectionKeys)next[protectionKeys[key]]=clamp(value);else if(key in numbers)next[key]=['learning','regeneration','agingTempo'].includes(key)?Math.round(clamp(value,...numbers[key])):clamp(value,...numbers[key]);else if(key in next)next[key]=value;if(key==='logic')next.creativity=Math.min(next.creativity,100-next.logic);if(key==='creativity')next.logic=Math.min(next.logic,100-next.creativity);return next;}
  function setPalette(s,key,value,point){const next=set(s,key,value);next.palette={...s.palette,[key]:{x:point.x,y:point.y,inBase:point.inBase}};return next;}
  function services(s){
    const list=[],d=derive(s),fresh=defaults(),labels={body:['Комплекция',45,'%'],height:['Рост',90,' см'],muscleVolume:['Объём мышц',35,' / 100'],fatigueResistance:['Устойчивость к утомлению',30,' / 100'],cardioPotential:['Кардиореспираторный потенциал',40,' / 100'],contractionSpeed:['Скорость сокращения мышц',35,' / 100'],reaction:['Реакция',25,' мс'],memory:['Память',7.5,'%'],age:['Долголетие',100,' лет'],immune:['Базовый иммунитет',30,'%'],cancer:['Защита клеток',40,'%'],psyche:['Защита психики',35,'%'],concentration:['Концентрация',25,'%'],stress:['Реакция на стресс',25,'%'],leftContrast:[s.heterochromia?'Контрастность левого глаза':'Контрастность глаз',10,'%'],rightContrast:['Контрастность правого глаза',10,'%'],logic:['Логика',20,'%'],creativity:['Творчество',20,'%']};
    for(const [key,[label,rate,unit]] of Object.entries(labels)){
      if(key==='rightContrast'&&!s.heterochromia)continue;
      const value=key in protectionKeys?selectedValue(s,key):key in d?d[key]:s[key];
      // A penalty caused by another modification is not itself a purchased service.
      const baseKey={immune:'immuneBase',cancer:'cancerBase',psyche:'psycheBase',concentration:'concentrationBase'}[key];if(baseKey&&!s.selected?.hasOwnProperty(key)&&s[baseKey]===fresh[baseKey])continue;
      if(!isOutside(key,value))continue;const [lo,hi]=baseRanges[key],distance=Math.max(lo-value,value-hi);
      list.push({key,label:label+' · '+value+unit,price:Math.max(50,Math.round(distance*rate))});
    }
    const choice=(key,label,price)=>list.push({key,label,price});
    if(s.regeneration)choice('regeneration','Регенерация · '+['низкая','средняя','высокая'][s.regeneration],[0,100,500][s.regeneration]);
    if(s.learning===2)choice('learning','Быстрое обучение',400);
    if(s.agingTempo)choice('agingTempo','Замедленное старение',900);
    if(s.recognition)choice('recognition','Усилить распознавание',1200);
    if(s.attack)choice('attack','Адресная атака',2800);
    if(s.heterochromia)choice('heterochromia','Гетерохромия',400);
    for(const [key,label,price] of [['hairColor','Цвет волос',350],['skinColor','Оттенок кожи',450],['leftEye',s.heterochromia?'Цвет левого глаза':'Цвет глаз',300],['rightEye','Цвет правого глаза',300]])if((key!=='rightEye'||s.heterochromia)&&s.palette?.[key]?.inBase===false)choice(key,label+' · выбранный оттенок',price);
    return list.length?[{key:'base',label:'Базовая модификация ДНК',price:5000,required:true},...list]:list;
  }
  function remove(s,key){
    const fresh=defaults();if(baseRanges[key]){const baseKey={immune:'immuneBase',cancer:'cancerBase',psyche:'psycheBase',concentration:'concentrationBase'}[key];if(baseKey){const selected={...s.selected};delete selected[key];return {...s,[baseKey]:fresh[baseKey],selected,accepted:false};}return set(s,key,fresh[key]);}
    if(['hairColor','skinColor','leftEye','rightEye'].includes(key)){const next=set(s,key,fresh[key]);next.palette={...s.palette};delete next.palette[key];return next;}
    return ['regeneration','learning','agingTempo','recognition','attack','heterochromia'].includes(key)?set(s,key,fresh[key]):s;
  }
  function problems(s){const d=derive(s),items=[];
    for(const c of d.physicalCauses)items.push({key:'physical-'+c.key,label:c.label,value:c.value,section:'strength',block:c.block,description:c.description});
    for(const c of d.systemCauses)items.push({key:c.section+'-'+c.key+'-load',label:c.label,value:c.value,section:c.section,block:c.block,description:c.description});
    if(d.immune<35)items.push({key:'immune',label:'Базовый иммунитет',value:d.immune,section:'immune'});
    if(d.cancer<40)items.push({key:'cancer',label:'Защита от опухолей',value:d.cancer,section:'immune'});
    if(d.psyche<45)items.push({key:'psyche',label:'Защита психики',value:d.psyche,section:'neuro'});
    if(d.concentration<50)items.push({key:'concentration',label:'Концентрация',value:d.concentration,section:'neuro'});return items;
  }
  return {clamp,defaults,restore,derive,controlValue,set,setPalette,baseRanges,isOutside,isCritical,physicalCritical,physicalConflicts,systemConflicts,services,remove,problems,total:s=>services(s).reduce((sum,item)=>sum+item.price,0)};
});
