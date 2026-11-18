// UTC+8 is an explicit display convention, including for the proleptic calendar.
export const DAY = 86400000;
const OFFSET = 8 * 3600000;
const DATE_LIMIT = 8640000000000000;
// Intrinsic Date limits only; reserve complete years for the annual slider.
export const MIN_CALENDAR_YEAR = new Date(-DATE_LIMIT).getUTCFullYear() + 1;
export const MAX_CALENDAR_YEAR = new Date(DATE_LIMIT).getUTCFullYear() - 1;
const pad = value => String(value).padStart(2, '0');
export function beijingTimestamp(year, month=1, day=1, hour=0, minute=0, second=0) {
  const date = new Date(0);
  // Date.UTC(0..99, ...) silently means 1900..1999; setUTCFullYear avoids this.
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime() - OFFSET;
}
export function yearBounds(year) { return [beijingTimestamp(year), beijingTimestamp(year + 1)]; }
export const MIN_TIME = yearBounds(MIN_CALENDAR_YEAR)[0];
export const MAX_TIME = yearBounds(MAX_CALENDAR_YEAR)[1] - 1;
export function validTime(ms) { return Number.isFinite(ms) && ms >= MIN_TIME && ms <= MAX_TIME; }
export function validYear(year) { return Number.isSafeInteger(year) && year >= MIN_CALENDAR_YEAR && year <= MAX_CALENDAR_YEAR; }
export function parseYear(value) {
  if (!/^[+-]?\d{1,6}$/.test(String(value).trim())) return NaN;
  const year = Number(value);
  return validYear(year) ? year : NaN;
}
export function beijingParts(ms) {
  const date = new Date(ms + OFFSET);
  return {year:date.getUTCFullYear(),month:date.getUTCMonth()+1,day:date.getUTCDate(),hour:date.getUTCHours(),minute:date.getUTCMinutes(),second:date.getUTCSeconds()};
}
export function formatYear(year,locale='zh') { return year > 0 ? String(year) : locale==='en'?`${1-year} BCE`:`公元前${1-year}`; }
function inputYear(year) { return year < 0 ? `-${String(-year).padStart(6,'0')}` : String(year).padStart(4,'0'); }
export function datetimeInput(ms) {
  const p = beijingParts(ms);
  return `${inputYear(p.year)}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
}
export function parseBeijingInput(value) {
  const match = /^([+-]?\d{4,6})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return NaN;
  const [year,month,day,hour,minute,second] = match.slice(1).map(v => Number(v ?? 0));
  if (!validYear(year)) return NaN;
  const ms = beijingTimestamp(year,month,day,hour,minute,second),p = beijingParts(ms);
  if (!validTime(ms) || [year,month,day,hour,minute,second].some((v,i)=>v!==Object.values(p)[i])) return NaN;
  return ms;
}
export function formatDate(ms, seconds=false,locale='zh') {
  if (!Number.isFinite(ms)) return locale==='en'?'No reliable starting time':'暂无可靠交节时刻';
  const p = beijingParts(ms);
  if(locale==='en')return `${pad(p.day)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p.month-1]} ${formatYear(p.year,locale)}, ${pad(p.hour)}:${pad(p.minute)}${seconds?':'+pad(p.second):''}`;
  return `${formatYear(p.year)}.${pad(p.month)}.${pad(p.day)} ${pad(p.hour)}:${pad(p.minute)}${seconds?':'+pad(p.second):''}`;
}
export function changeYear(ms,year) {
  if (!validYear(year)) return NaN;
  const p = beijingParts(ms),leap = year%4===0 && (year%100!==0 || year%400===0);
  const days = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31][p.month-1];
  return beijingTimestamp(year,p.month,Math.min(p.day,days),p.hour,p.minute,p.second);
}
