import { SearchSunLongitude, SunPosition } from 'astronomy-engine';
import { terms, type Term, type Lang } from './data';
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2050;
export const DAY = 86_400_000;
export const OBLIQUITY = 23.44 * Math.PI / 180;
export interface Event { term: Term; time: number }
const cache = new Map<number, Event[]>();
export const yearOf = (time: number) => new Date(time + 8 * 3_600_000).getUTCFullYear();
export const yearStart = (year: number) => Date.UTC(year, 0, 1) - 8 * 3_600_000;
export function eventsForYear(year: number): Event[] {
  if (cache.has(year)) return cache.get(year)!;
  // The dates only bracket a root. They never supply the event time.
  const events = Array.from({ length: 24 }, (_, i) => {
    const term = terms[(i + 22) % 24];
    const start = new Date(Date.UTC(year, Math.floor(i / 2), i % 2 ? 16 : 1));
    const result = SearchSunLongitude(term.longitude, start, 12);
    if (!result) throw new Error(`Solar longitude search failed: ${year} / ${term.name.en}`);
    return { term, time: result.date.getTime() };
  });
  cache.set(year, events);
  return events;
}
export function intervalAt(time: number): { current: Event; next: Event } {
  const year = yearOf(time);
  const all = [...eventsForYear(year - 1).slice(-1), ...eventsForYear(year), eventsForYear(year + 1)[0]];
  const nextIndex = all.findIndex(event => event.time > time);
  return { current: all[nextIndex - 1], next: all[nextIndex] };
}
export const solarLongitude = (time: number) => SunPosition(new Date(time)).elon;
export const longitudeText = (longitude: number) => (((Math.round(longitude * 100) / 100) % 360 + 360) % 360).toFixed(2);
// Physical ecliptic (x,y,z) -> scene (x,z,-y). Earth is opposite the apparent Sun.
// At λ=90° Earth is at +z and the fixed north axis tilts toward the Sun (-z).
export function orbitPosition(longitude: number, radius = 7) {
  const angle = longitude * Math.PI / 180;
  return { x: -radius * Math.cos(angle), y: 0, z: radius * Math.sin(angle) };
}
export const northAxis = { x: 0, y: Math.cos(OBLIQUITY), z: -Math.sin(OBLIQUITY) };
export function subsolarLatitude(longitude: number) {
  return Math.asin(Math.sin(OBLIQUITY) * Math.sin(longitude * Math.PI / 180)) * 180 / Math.PI;
}
export function inputDate(time: number) {
  return new Date(time + 8 * 3_600_000).toISOString().slice(0, 19);
}
export function parseInputDate(value: string) { return Date.parse(`${value}+08:00`); }
export function formatTime(time: number, lang: Lang, full = true, withSeconds = true) {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    timeZone: 'Asia/Shanghai', year: full ? 'numeric' : undefined, month: full ? '2-digit' : 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: withSeconds ? '2-digit' : undefined, hourCycle: 'h23'
  }).format(new Date(time));
}
