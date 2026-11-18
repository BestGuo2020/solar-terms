import { MIN_YEAR, MAX_YEAR, stateAt, yearBounds } from "./astronomy.js";

export const [minimum] = yearBounds(MIN_YEAR);
export const [, maximum] = yearBounds(MAX_YEAR);
const bounded = (instant) => Math.max(minimum, Math.min(maximum - 1, instant));
const initialTime = Date.now();

// Consumers read these live bindings after each transition. The globe, controls
// and term card always receive the same instant and its astronomical solution.
export let ms = bounded(initialTime);
export let model = stateAt(ms);
export let live = ms === initialTime;
export let playing = false;
let daysPerSecond = 1;

function moveTo(instant) {
  ms = bounded(instant);
  model = stateAt(ms);
}

export function seek(instant, followRealTime = false) {
  moveTo(instant);
  live = followRealTime && instant === ms;
  playing = false;
}

export function setPlayback(enabled) {
  playing = enabled;
  live = false;
}

export function setSpeed(value) {
  daysPerSecond = value;
}

export function advance(elapsedMs) {
  if (live) {
    seek(Date.now(), true);
  } else if (playing) {
    const elapsedSeconds = Math.min(elapsedMs, 1100) / 1000;
    moveTo(ms + elapsedSeconds * daysPerSecond * 86_400_000);
    if (ms === maximum - 1) playing = false;
  }
}

export const shanghaiISO = (instant) =>
  new Date(instant + 28_800_000).toISOString();
export const clockText = (instant) => shanghaiISO(instant).slice(11, 16);
export const dayText = (instant) => shanghaiISO(instant).slice(0, 10);
export const minuteStamp = (instant) =>
  shanghaiISO(instant).slice(0, 16).replace("T", " ");
