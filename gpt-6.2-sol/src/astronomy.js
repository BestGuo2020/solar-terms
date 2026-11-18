import { SearchSunLongitude, SiderealTime, SunPosition } from 'astronomy-engine';
import { terms } from './terms.js';

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2050;
export const DAY = 86_400_000;
export const ZONE = 'Asia/Shanghai';
export const TILT = 23.4;
const offset = 8 * 3_600_000; // Shanghai uses UTC+08:00 throughout the supported range.
const calendar = new Map();
const formats = new Map();

export const yearStart = (year) => Date.UTC(year, 0, 1) - offset;
export const yearOf = (time) => new Date(time + offset).getUTCFullYear();
export const minTime = yearStart(MIN_YEAR);
export const maxTime = yearStart(MAX_YEAR + 1) - 1;
export const clampTime = (time) => Math.min(maxTime, Math.max(minTime, time));
export const localInput = (time) => new Date(time + offset).toISOString().slice(0, 19);
export const parseLocalInput = (input) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(input)) return NaN;
  const time = Date.parse(input + '+08:00');
  return Number.isFinite(time) && localInput(time).startsWith(input) ? time : NaN;
};

export const chronology = [...terms.slice(22), ...terms.slice(0, 22)];

export function getCalendar(year) {
  if (!calendar.has(year)) {
    const beginning = yearStart(year);
    const events = [];
    let start = beginning;
    for (const term of chronology) {
      // After each crossing, the next one is between about 14.7 and 15.8 days away.
      const event = SearchSunLongitude(term.longitude, new Date(start), 10);
      if (!event || yearOf(+event.date) !== year) throw new Error('Unable to resolve solar term');
      events.push({ term, time: Math.round(+event.date / 1000) * 1000 });
      start = +event.date + 11 * DAY;
    }
    calendar.set(year, events);
  }
  return calendar.get(year);
}

export function snapshot(time) {
  const year = yearOf(time);
  const events = getCalendar(year);
  const nextIndex = events.findIndex((event) => event.time > time);
  const active = nextIndex === 0 ? getCalendar(year - 1).at(-1) : events[nextIndex < 0 ? events.length - 1 : nextIndex - 1];
  const next = nextIndex === -1 ? getCalendar(year + 1)[0] : events[nextIndex];
  const date = new Date(time);
  const startLongitude = active.term.longitude;
  const angularOffset = (SunPosition(date).elon - startLongitude + 540) % 360 - 180;
  // The event is rounded to a whole second. Keep the rendered angle in the corresponding
  // interval when rounding puts it a fraction of a second on the other side of the root.
  const longitude = startLongitude + (time === active.time ? 0 : Math.max(0, Math.min(15 - 1e-8, angularOffset)));
  return {
    time, year, events, active, next, longitude,
    sidereal: SiderealTime(date) * 15,
  };
}

export function orbitPoint(longitude, radius = 1) {
  // Scene +Y is its orbital north. At λ=0 the Earth is on +X; the Sun is seen toward −X.
  const angle = longitude * Math.PI / 180;
  return [radius * Math.cos(angle), 0, -radius * Math.sin(angle)];
}

export function solarDeclination(longitude) {
  const radians = Math.PI / 180;
  return Math.asin(Math.sin(TILT * radians) * Math.sin(longitude * radians)) / radians;
}

export function formatTime(time, lang, { dateOnly = false, minute = false } = {}) {
  const key = lang + ':' + (dateOnly ? 'date' : minute ? 'minute' : 'second');
  if (!formats.has(key)) {
    const opts = { timeZone: ZONE, year: 'numeric', month: 'short', day: 'numeric' };
    if (!dateOnly) Object.assign(opts, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    if (!dateOnly && !minute) opts.second = '2-digit';
    formats.set(key, new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', opts));
  }
  return formats.get(key).format(time);
}
