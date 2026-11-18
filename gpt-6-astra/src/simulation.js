import { DAY, validTime } from './calendar.js';
import { normalizeLongitude } from './geometry.js';

/** UTC timestamp never becomes a reference-year substitute. Illustration phase
 * has its own explicit meaning and never claims to describe the selected date. */
export class SimulationClock {
  constructor(now=Date.now()) {
    if(!validTime(now))throw new RangeError('日期超出浏览器可表示的完整年份范围');
    this.time=now;this.live=true;this.playing=false;this.daysPerSecond=3;
    this.spin=true;this.spinAngle=0;this.illustrationLongitude=315;this.boundary=false;
  }
  seek(ms) {
    if(!validTime(ms))return false;
    this.time=ms;this.live=false;this.playing=false;this.boundary=false;return true;
  }
  today(now=Date.now()) {if(!this.seek(now))return false;this.live=true;return true;}
  illustrate(longitude) {this.illustrationLongitude=normalizeLongitude(longitude);this.playing=false;return true;}
  togglePlay(mode='calculated') {if(mode==='calculated')this.live=false;this.playing=!this.playing;this.boundary=false;}
  tick(seconds,now=Date.now(),mode='calculated') {
    if(this.live) {
      if(validTime(now))this.time=now;
      else {this.live=false;this.playing=false;this.boundary=true;}
    }
    if(this.playing) {
      if(mode==='illustration')this.illustrationLongitude=normalizeLongitude(this.illustrationLongitude+seconds*this.daysPerSecond);
      else {
        const next=this.time+seconds*this.daysPerSecond*DAY;
        if(validTime(next))this.time=next;
        else {this.playing=false;this.boundary=true;}
      }
    }
    if(this.spin)this.spinAngle=(this.spinAngle+seconds*Math.PI/10)%(Math.PI*2);
  }
}
