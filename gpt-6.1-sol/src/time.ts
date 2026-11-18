import { DAY, MIN_YEAR, MAX_YEAR, yearStart, yearOf } from './astronomy';
export class Simulation {
  time = Date.now();
  live = true;
  playing = false;
  daysPerSecond = 3;
  spinning = true;
  spin = 0;
  get year() { return yearOf(this.time); }
  set(time: number) {
    if (!Number.isFinite(time)) return;
    this.time = Math.min(yearStart(MAX_YEAR + 1) - 1, Math.max(yearStart(MIN_YEAR), time));
    this.live = false;
    this.playing = false;
  }
  today() { this.time = Date.now(); this.live = true; this.playing = false; }
  toggle() { this.live = false; this.playing = !this.playing; }
  advance(seconds: number) {
    if (this.live) this.time = Date.now();
    if (this.playing) {
      this.time += seconds * DAY * this.daysPerSecond;
      if (this.time >= yearStart(MAX_YEAR + 1)) { this.time = yearStart(MAX_YEAR + 1) - 1; this.playing = false; }
    }
    if (this.spinning) this.spin += seconds * Math.PI * 2 / 24;
  }
}
