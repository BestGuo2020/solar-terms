import test from 'node:test';
import assert from 'node:assert/strict';
import { eventsForYear, intervalAt, solarLongitude, longitudeText, formatTime, orbitPosition, northAxis, subsolarLatitude, yearStart, yearOf, parseInputDate, inputDate, DAY } from '../src/astronomy.ts';
import { terms, song } from '../src/data.ts';
import { Simulation } from '../src/time.ts';

test('all supported years: 24 ordered roots, correct longitude, non-uniform intervals', () => {
  let shortest=Infinity, longest=0;
  for(let year=2000;year<=2050;year++) {
    const events=eventsForYear(year);
    assert.equal(events.length,24);
    assert.equal(new Set(events.map(e=>e.term.id)).size,24);
    for(let i=0;i<events.length;i++) {
      const event=events[i];
      assert.equal(yearOf(event.time),year);
      const residual=((solarLongitude(event.time)-event.term.longitude+540)%360)-180;
      assert.ok(Math.abs(residual)<.00001,`${year} ${event.term.name.en}: ${residual}`);
      assert.equal(intervalAt(event.time-1).next.term.id,event.term.id);
      assert.equal(intervalAt(event.time).current.term.id,event.term.id);
      assert.equal(intervalAt(event.time+1).current.term.id,event.term.id);
      if(i){const days=(event.time-events[i-1].time)/DAY;assert.ok(days>14.5&&days<16);shortest=Math.min(shortest,days);longest=Math.max(longest,days);}
    }
  }
  assert.ok(longest-shortest>.8);
  console.log(`Checked 1,224 events; intervals ${shortest.toFixed(4)}–${longest.toFixed(4)} days.`);
});

test('independent 2026 HKO published major-term times (UTC+8) agree within 90 seconds', () => {
  // Source: https://www.hko.gov.hk/en/gts/astron2026/files/2026SolarTerms24.pdf
  // Published to the minute; this fixture never drives the application.
  const reference: [number,string][]=[
    [300,'2026-01-20T09:45'],[330,'2026-02-18T23:52'],[0,'2026-03-20T22:46'],
    [30,'2026-04-20T09:39'],[60,'2026-05-21T08:37'],[90,'2026-06-21T16:25'],
    [120,'2026-07-23T03:13'],[150,'2026-08-23T10:19'],[180,'2026-09-23T08:05'],
    [210,'2026-10-23T17:38'],[240,'2026-11-22T15:23'],[270,'2026-12-22T04:50']
  ];
  let max=0;
  for(const [longitude,date] of reference){
    const actual=eventsForYear(2026).find(e=>e.term.longitude===longitude)!.time;
    const difference=Math.abs(actual-parseInputDate(date))/1000;max=Math.max(max,difference);
    assert.ok(difference<=90,`${longitude}° differs by ${difference}s`);
  }
  console.log(`HKO 2026 independent comparison: maximum difference ${max.toFixed(3)} seconds from the printed minute.`);
});

test('cross-year winter intervals and leap-day Beijing conversions', () => {
  for(const year of [2000,2001,2024,2027,2050]) {
    const start=yearStart(year), current=intervalAt(start).current;
    assert.equal(current.term.name.zh,'冬至');
    assert.equal(yearOf(current.time),year-1);
    assert.equal(intervalAt(start-1).current.time,current.time);
  }
  assert.equal(inputDate(parseInputDate('2024-02-29T00:00:00')),'2024-02-29T00:00:00');
  assert.equal(new Date(yearStart(2026)).toISOString(),'2025-12-31T16:00:00.000Z');
  assert.match(formatTime(yearStart(2027)-1,'zh',true,false),/2026/);
  assert.equal(longitudeText(359.999999999),'0.00');
});

test('the fixed axis gives opposite solstice illumination and equinoctial alignment', () => {
  for(const [longitude,expected] of [[0,0],[90,23.44],[180,0],[270,-23.44]]) {
    const earth=orbitPosition(longitude,1);
    const sunwardDot=-(earth.x*northAxis.x+earth.y*northAxis.y+earth.z*northAxis.z);
    assert.ok(Math.abs(Math.asin(sunwardDot)*180/Math.PI-expected)<1e-10);
    assert.ok(Math.abs(subsolarLatitude(longitude)-expected)<1e-10);
    assert.ok(Math.abs(Math.hypot(earth.x,earth.z)-1)<1e-12);
  }
  assert.equal(terms[3].longitude,0);assert.equal(terms[9].longitude,90);
  assert.equal(terms[15].longitude,180);assert.equal(terms[21].longitude,270);
});

test('simulation selection pauses playback, independent spin, year transitions, range clamp', () => {
  const sim=new Simulation();sim.set(parseInputDate('2026-12-31T23:00'));
  sim.daysPerSecond=1;sim.toggle();sim.advance(1);
  assert.equal(sim.year,2027);assert.equal(sim.live,false);
  const spin=sim.spin;sim.set(eventsForYear(2027)[3].time);sim.advance(1);
  assert.equal(sim.playing,false);assert.ok(sim.spin>spin);
  const stopped=sim.spin;sim.spinning=false;sim.advance(1);assert.equal(sim.spin,stopped);
  sim.set(yearStart(1999));assert.equal(sim.time,yearStart(2000));
  sim.set(yearStart(2051)-10);sim.toggle();sim.advance(1);
  assert.equal(sim.time,yearStart(2051)-1);assert.equal(sim.playing,false);
});

test('complete bilingual editorial data and positional song mapping', () => {
  for(const term of terms){for(const field of ['name','meaning','nature','farming','culture'] as const){assert.ok(term[field].zh.length>1);assert.ok(term[field].en.length>2);}}
  assert.equal(song[0].ids[0],0);assert.equal(song[0].ids[3],3);
  assert.equal(song[3].ids[1],19);assert.equal(song[3].ids[2],20);
  const represented=[...song.flatMap(line=>line.ids.filter((id):id is number=>id!==null)),10,11];
  assert.equal(new Set(represented).size,24);
  assert.equal(new Set(terms.map(term=>term.culture.zh)).size,24);
});
