import { shallowRef, onMounted, onUnmounted } from 'vue';
import { SimulationClock } from './simulation.js';
import { astronomyView, beijingParts, yearBounds, changeYear, parseYear } from './astronomy.js';
import { terms } from './data/terms.js';

export function useSimulation() {
  const clock=new SimulationClock();
  const snapshot=shallowRef(null);
  let frame=0,last=0,lastPublish=0;
  function publish() {
    const year=beijingParts(clock.time).year;
    const [start,end]=yearBounds(year);
    const view=astronomyView(clock.time,clock.illustrationLongitude);
    if(view.mode==='calculated')clock.illustrationLongitude=view.longitude;
    snapshot.value={...clock,...view,year,start,end,progress:(clock.time-start)/(end-start)};
  }
  function run(now) {
    const delta=last?Math.min((now-last)/1000,0.25):0;
    last=now;
    clock.tick(delta,Date.now(),snapshot.value.mode);
    if(now-lastPublish>=33) {publish();lastPublish=now;}
    frame=requestAnimationFrame(run);
  }
  function visibility() {
    cancelAnimationFrame(frame);last=0;
    if(!document.hidden) {clock.tick(0);publish();frame=requestAnimationFrame(run);}
  }
  function act(fn) {const result=fn();publish();return result;}
  const actions={
    seek:ms=>act(()=>clock.seek(ms)),
    today:()=>act(()=>clock.today()),
    play:()=>act(()=>clock.togglePlay(snapshot.value.mode)),
    speed:value=>act(()=>{clock.daysPerSecond=Number(value);}),
    spin:value=>act(()=>{clock.spin=value;}),
    year:value=>act(()=>clock.seek(changeYear(clock.time,parseYear(value)))),
    term:id=>act(()=>{
      if(!terms[id])return false;
      if(snapshot.value.mode==='illustration')return clock.illustrate(terms[id].longitude);
      return clock.seek(snapshot.value.events.find(event=>event.id===id).time);
    }),
    progress:value=>act(()=>{const [a,b]=yearBounds(snapshot.value.year);clock.seek(Math.min(b-1,a+Number(value)*(b-a)));}),
  };
  publish();
  onMounted(()=>{frame=requestAnimationFrame(run);document.addEventListener('visibilitychange',visibility);});
  onUnmounted(()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);});
  return {snapshot,actions};
}
