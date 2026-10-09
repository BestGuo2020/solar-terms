import { terms } from './data/terms.js';
import { beijingParts } from './calendar.js';
import { geometryAtLongitude, normalizeLongitude } from './geometry.js';
import { ephemeris } from './ephemeris.js';
export * from './calendar.js';
export * from './geometry.js';
export { MODEL_INFO, createEphemeris } from './ephemeris.js';
export const yearEvents=year=>ephemeris.events(year);
export const intervalAt=ms=>ephemeris.intervalAt(ms);
export const solarLongitude=ms=>ephemeris.longitude(ms);
export const earthState=ms=>ephemeris.stateAt(ms);

/** Never substitute another date/year when computation is unavailable. */
export function astronomyView(ms,illustrationLongitude=315,provider=ephemeris) {
  const year=beijingParts(ms).year;
  let reason='outside-model';
  if(provider.supportsYear(year)) {
    try {
      const events=provider.events(year),interval=provider.intervalAt(ms),state=provider.stateAt(ms);
      const sampled=provider.info.sampleYears.includes(year);
      return {...state,...interval,events,mode:'calculated',quality:sampled?'sample-checked':'prediction',
      };
    } catch {reason='calculation-failed';}
  }
  const longitude=normalizeLongitude(illustrationLongitude);
  const current=terms.find(term=>term.longitude===Math.floor(longitude/15)*15);
  return {...geometryAtLongitude(longitude),current:{...current,time:null,year:null},next:{...terms[(current.id+1)%24],time:null,year:null},events:[],
    mode:'illustration',quality:'unavailable',reason,
  };
}
