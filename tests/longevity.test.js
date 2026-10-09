import test from 'node:test';
import assert from 'node:assert/strict';
import { beijingTimestamp, beijingParts, datetimeInput, parseBeijingInput, parseYear, changeYear, yearBounds, MIN_TIME, MAX_TIME } from '../src/calendar.js';
import { astronomyView, createEphemeris } from '../src/astronomy.js';
import { SimulationClock } from '../src/simulation.js';

test('real time after 2050 stays real, without clamping, and playback crosses centuries',()=>{
  for(const year of [2051,2100,2200,4500,10000]){
    const time=beijingTimestamp(year,12,31,23,59,59),clock=new SimulationClock(time);
    assert.equal(clock.time,time);assert.equal(clock.live,true);
    clock.tick(1,time+1000);assert.equal(clock.time,time+1000);assert.equal(beijingParts(clock.time).year,year+1);
    clock.seek(time);clock.togglePlay();clock.tick(1,time);
    assert.equal(beijingParts(clock.time).year,year+1);assert.equal(clock.playing,true);
    clock.today(time);assert.equal(clock.time,time);assert.equal(clock.live,true);
  }
});

test('proleptic calendar preserves astronomical years, leap centuries and expanded years',()=>{
  for(const year of [-1999,-1,0,1,9,99,100,1900,2000,2100,2400,4500,10000,275759]){
    const time=beijingTimestamp(year,3,1,2,3,4);
    assert.equal(beijingParts(time).year,year);
    assert.equal(parseBeijingInput(datetimeInput(time)),time);
    const [start,end]=yearBounds(year);assert.ok(time>=start&&time<end);
  }
  assert.ok(Number.isNaN(parseBeijingInput('2100-02-29T00:00')));
  assert.ok(Number.isFinite(parseBeijingInput('2400-02-29T00:00')));
  assert.ok(Number.isNaN(parseBeijingInput('2026-01-01T24:00')));
  assert.ok(Number.isNaN(parseBeijingInput('2026-13-01T00:00')));
  assert.equal(datetimeInput(changeYear(beijingTimestamp(2000,2,29),2100)),'2100-02-28T00:00:00');
  for(const input of ['', 'Infinity','1e6','1.5','9999999','2050x'])assert.ok(Number.isNaN(parseYear(input)));
  assert.equal(parseYear('-1'),-1);assert.equal(parseYear('10000'),10000);
  assert.equal(parseBeijingInput(datetimeInput(MIN_TIME)),MIN_TIME);
  assert.equal(parseBeijingInput(datetimeInput(MAX_TIME)),MAX_TIME-MAX_TIME%1000);
});

test('quality distinguishes checked samples, predictions and independent illustration',()=>{
  assert.equal(astronomyView(beijingTimestamp(2026,6,1)).quality,'sample-checked');
  for(const year of [2051,2100,2200,3000]){
    const view=astronomyView(beijingTimestamp(year,6,1));assert.equal(view.mode,'calculated');assert.equal(view.quality,'prediction');assert.equal(view.events.length,24);
  }
  for(const year of [-2000,3001,4500,10000]){
    const time=beijingTimestamp(year,6,1),clock=new SimulationClock(time);
    const view=astronomyView(clock.time,90);
    assert.equal(view.mode,'illustration');assert.equal(view.reason,'outside-model');
    assert.equal(view.current.name,'夏至');assert.equal(view.current.time,null);assert.equal(view.next.time,null);assert.deepEqual(view.events,[]);
    assert.equal(clock.time,time);assert.equal(view.longitude,90);assert.ok(Math.abs(view.declination-23.44)<1e-10);
  }
});

test('illustration plays angles and switches terms while retaining the selected date',()=>{
  const time=beijingTimestamp(4500,7,1),clock=new SimulationClock(time);
  clock.seek(time);clock.illustrate(90);clock.daysPerSecond=30;clock.togglePlay('illustration');
  clock.tick(2,time,'illustration');
  assert.equal(clock.time,time);assert.equal(clock.illustrationLongitude,150);
  const view=astronomyView(clock.time,clock.illustrationLongitude);assert.equal(view.current.name,'处暑');
  clock.illustrate(270);assert.equal(clock.time,time);assert.equal(clock.playing,false);
});

test('solver failure produces honest fallback and cached failure avoids repeated work',()=>{
  let calls=0;
  const provider=createEphemeris({longitudeAt:()=>{calls++;throw new Error('Unavailable model');}});
  const time=beijingTimestamp(2026,6,21);
  for(let i=0;i<10;i++){
    const view=astronomyView(time,270,provider);
    assert.equal(view.mode,'illustration');assert.equal(view.reason,'calculation-failed');assert.equal(view.current.time,null);
  }
  assert.equal(calls,1);
  provider.clearCache();astronomyView(time,0,provider);assert.equal(calls,2);
});

test('year cache is bounded and retains recently used years, including failures',()=>{
  const provider=createEphemeris({cacheLimit:3});
  for(const year of [2025,2026,2027])provider.events(year);
  provider.events(2025);provider.events(2028);
  assert.equal(provider.cacheStats().size,3);
  assert.deepEqual(provider.cacheStats().years,[2027,2025,2028]);
  for(let y=2100;y<2140;y++)provider.events(y);
  assert.equal(provider.cacheStats().size,3);
});

test('scanning discovers crossings even outside the former fixed half-month windows',()=>{
  const year=2026,[start]=yearBounds(year),period=365.2422*86400000;
  const longitudeAt=time=>((1+(time-start)/period*360)%360+360)%360;
  const search=(angle,left)=>left+((angle-longitudeAt(left)+360)%360)/360*period;
  const provider=createEphemeris({longitudeAt,search,distanceAt:()=>1});
  const events=provider.events(year);
  assert.equal(events.length,24);assert.equal(events[0].name,'清明');
  assert.equal(beijingParts(events[0].time).month,1);
});
