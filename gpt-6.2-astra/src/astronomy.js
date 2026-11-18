import { SearchSunLongitude, SunPosition } from "astronomy-engine";

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2050;
export const TIME_ZONE = "Asia/Shanghai";

const HOUR = 3_600_000;
const SHANGHAI_OFFSET = 8 * HOUR;
const annualEvents = new Map();

// Beijing has used UTC+8 without daylight saving throughout the supported range.
export function yearBounds(year) {
  return [
    Date.UTC(year, 0, 1) - SHANGHAI_OFFSET,
    Date.UTC(year + 1, 0, 1) - SHANGHAI_OFFSET,
  ];
}

export function termLongitude(index) {
  return (315 + 15 * index) % 360;
}

export function solarLongitude(ms) {
  return SunPosition(new Date(ms)).elon;
}

function signedOffset(ms, target) {
  return ((solarLongitude(ms) - target + 540) % 360) - 180;
}

function crossing(year, slot) {
  // In a civil year Minor Cold and Major Cold precede the traditional first term.
  const index = (slot + 22) % 24;
  const target = termLongitude(index);
  const month = Math.floor(slot / 2);
  const searchDay = slot % 2 === 0 ? 1 : 15;
  const from = new Date(Date.UTC(year, month, searchDay) - SHANGHAI_OFFSET);
  const root = SearchSunLongitude(target, from, 11);
  if (!root)
    throw new Error(`Cannot locate solar longitude ${target}° in ${year}.`);

  // Select the first whole millisecond on the new side of the computed crossing.
  // This also handles the wrap from 359.999...° to 0° at the March equinox.
  const estimate = root.date.getTime();
  let lower = estimate - 2_000;
  let upper = estimate + 2_000;
  while (upper - lower > 1) {
    const middle = Math.floor((lower + upper) / 2);
    if (signedOffset(middle, target) < 0) lower = middle;
    else upper = middle;
  }
  return Object.freeze({ index, ms: upper });
}

function events(year) {
  if (!annualEvents.has(year)) {
    annualEvents.set(
      year,
      Object.freeze(
        Array.from({ length: 24 }, (_, slot) => crossing(year, slot)),
      ),
    );
  }
  return annualEvents.get(year);
}

export function termsForYear(year) {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`Supported calendar years: ${MIN_YEAR}–${MAX_YEAR}`);
  }
  return events(year);
}

export function stateAt(ms) {
  const year = new Date(ms + SHANGHAI_OFFSET).getUTCFullYear();
  const list = termsForYear(year);
  const following = list.findIndex((event) => event.ms > ms);
  // Use the adjacent ephemeris year, including at the edges of the selectable range.
  const current =
    following === 0
      ? events(year - 1)[23]
      : list[following < 0 ? 23 : following - 1];
  const next = following < 0 ? events(year + 1)[0] : list[following];
  return {
    index: current.index,
    start: current.ms,
    next: next.ms,
    longitude: solarLongitude(ms),
    year,
  };
}
