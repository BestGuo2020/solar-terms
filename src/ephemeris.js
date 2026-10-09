import { SunPosition, SearchSunLongitude, HelioDistance, Body } from 'astronomy-engine';
import { terms } from './data/terms.js';
import { DAY, beijingParts, yearBounds } from './calendar.js';
import { normalizeLongitude, geometryAtLongitude } from './geometry.js';

// Replaceable calculation policy, never a limit on the calendar or page.
// -1999..3000 follows the documented time span of the Delta-T reference, and
// does NOT assert uniform solar/event accuracy over all these years.
export const MODEL_INFO = Object.freeze({
  id:'astronomy-engine',version:'2.1.19',firstYear:-1999,lastYear:3000,
  sampleYears:Object.freeze([2025,2026]),sampleCount:24,
  reference:'https://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html',
  source:'https://github.com/cosinekitty/astronomy',
});
export function createEphemeris({
  info=MODEL_INFO,
  longitudeAt=ms=>SunPosition(new Date(ms)).elon,
  search=(angle,start,days)=>SearchSunLongitude(angle,new Date(start),days)?.date.getTime(),
  distanceAt=ms=>HelioDistance(Body.Earth,new Date(ms)),cacheLimit=32,
}={}) {
  if(!Number.isInteger(cacheLimit)||cacheLimit<3)throw new RangeError('Cache must retain at least three adjacent years');
  const cache=new Map();
  const put=(year,value)=>{cache.delete(year);cache.set(year,value);while(cache.size>cacheLimit)cache.delete(cache.keys().next().value);};
  const touch=year=>{const result=cache.get(year);cache.delete(year);cache.set(year,result);return result;};
  const supportsYear=year=>Number.isInteger(year)&&year>=info.firstYear&&year<=info.lastYear;
  function longitude(ms) {
    const value=longitudeAt(ms);
    if(!Number.isFinite(value))throw new Error('太阳位置不是有效数值');
    return normalizeLongitude(value);
  }
  function stateAt(ms) {
    const year=beijingParts(ms).year;
    try {
      const angle=longitude(ms),distance=distanceAt(ms);
      if(!Number.isFinite(distance)||distance<.9||distance>1.1)throw new Error('日地距离计算异常');
      return geometryAtLongitude(angle,distance);
    } catch(error) {put(year,{error});throw error;}
  }
  function events(year) {
    if(cache.has(year)){const record=touch(year);if(record.error)throw record.error;return record.events;}
    if(!Number.isInteger(year)||year<info.firstYear-1||year>info.lastYear+1)throw new RangeError('超出当前天文模型的计算窗口');
    try {
      const [start,end]=yearBounds(year),found=[];
      // Scan real longitude, not fixed half-month dates. Eight-day root brackets
      // remain well below 180 degrees and follow long-term calendar drift.
      for(let left=start-DAY;left<end;left+=8*DAY){
        const right=Math.min(left+8*DAY,end+DAY),a=longitude(left),b=longitude(right);
        const sweep=normalizeLongitude(b-a);
        if(sweep<=0||sweep>=15)throw new Error('太阳黄经推进异常');
        const target=normalizeLongitude((Math.floor(a/15)+1)*15);
        if(normalizeLongitude(target-a)>sweep+1e-9)continue;
        const time=search(target,left,(right-left)/DAY);
        if(!Number.isFinite(time)||time<left-100||time>right+100)throw new Error('交节求解失败');
        if(time<start||time>=end)continue;
        const residual=Math.abs(normalizeLongitude(longitude(time)-target+180)-180);
        if(residual>1e-5)throw new Error('交节求解残差过大');
        if(found.some(event=>event.longitude===target))throw new Error('交节结果重复');
        const term=terms.find(item=>item.longitude===target);
        found.push(Object.freeze({...term,time,year,position:Object.freeze(stateAt(time).position)}));
      }
      if(found.length!==24)throw new Error('该年未能可靠求得完整的二十四节气');
      const result=Object.freeze(found.sort((a,b)=>a.time-b.time));put(year,{events:result});return result;
    } catch(error) {put(year,{error});throw error;}
  }
  function intervalAt(ms) {
    const year=beijingParts(ms).year,items=events(year),index=items.findIndex(event=>event.time>ms);
    if(index===0)return {current:events(year-1).at(-1),next:items[0]};
    if(index<0)return {current:items.at(-1),next:events(year+1)[0]};
    return {current:items[index-1],next:items[index]};
  }
  return {info,supportsYear,events,intervalAt,stateAt,longitude,
    cacheStats:()=>({size:cache.size,limit:cacheLimit,years:[...cache.keys()]}),clearCache:()=>cache.clear(),
  };
}
export const ephemeris=createEphemeris();
