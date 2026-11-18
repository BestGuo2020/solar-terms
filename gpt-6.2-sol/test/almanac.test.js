import assert from 'node:assert/strict';
import test from 'node:test';
import { SunPosition } from 'astronomy-engine';
import {
  DAY, MIN_YEAR, MAX_YEAR, TILT, getCalendar, snapshot, orbitPoint, solarDeclination,
  localInput, parseLocalInput, yearStart, yearOf, minTime, maxTime, clampTime,
} from '../src/astronomy.js';
import { song, terms } from '../src/terms.js';

test('the twenty-four terms follow the traditional sequence and cardinal longitudes', () => {
  assert.equal(terms.map(({ zh }) => zh).join(' '),
    '立春 雨水 惊蛰 春分 清明 谷雨 立夏 小满 芒种 夏至 小暑 大暑 立秋 处暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至 小寒 大寒');
  assert.deepEqual(terms.filter(({ cardinal }) => cardinal).map(({ longitude }) => longitude), [0, 90, 180, 270]);
  terms.forEach((term, index) => {
    assert.equal(term.longitude, (315 + index * 15) % 360);
    assert.equal(term.season, Math.floor(index / 6));
    for (const key of ['meaning', 'weather', 'farming', 'culture']) {
      assert.equal(term[key].length, 2);
      assert.ok(term[key].every(Boolean));
    }
  });
});

test('every supported year has 24 distinct, unequally spaced longitude crossings', () => {
  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    const events = getCalendar(year);
    assert.equal(events.length, 24);
    assert.equal(new Set(events.map(({ term }) => term.index)).size, 24);
    events.forEach(({ term, time }, index) => {
      assert.equal(yearOf(time), year);
      const model = SunPosition(new Date(time)).elon;
      const error = (model - term.longitude + 540) % 360 - 180;
      assert.ok(Math.abs(error) < .00003, 'computed crossing is close to its target longitude');
      assert.equal(snapshot(time - 1).active.term.index, (term.index + 23) % 24);
      assert.ok((term.longitude - snapshot(time - 1).longitude + 360) % 360 > 0);
      assert.equal(snapshot(time).active.term, term);
      assert.equal(snapshot(time).longitude, term.longitude);
      assert.equal(snapshot(time + 1).active.term, term);
      assert.equal(parseLocalInput(localInput(time)), time);
      if (index > 0) {
        const interval = (time - events[index - 1].time) / DAY;
        assert.ok(interval > 14 && interval < 16);
      }
    });
    assert.notEqual(events[1].time - events[0].time, events[2].time - events[1].time);
  }
});

test('crossings for 2026 agree to within a minute with all 24 HKO almanac entries', () => {
  // Published Hong Kong time, UTC+08:00.
  // https://www.hko.gov.hk/en/gts/astronomy/data/files/24SolarTerms_2026.xml
  const hko = [
    '01-05T16:23', '01-20T09:45', '02-04T04:02', '02-18T23:52',
    '03-05T21:59', '03-20T22:46', '04-05T02:40', '04-20T09:39',
    '05-05T19:49', '05-21T08:37', '06-05T23:48', '06-21T16:25',
    '07-07T09:57', '07-23T03:13', '08-07T19:43', '08-23T10:19',
    '09-07T22:41', '09-23T08:05', '10-08T14:29', '10-23T17:38',
    '11-07T17:52', '11-22T15:23', '12-07T10:53', '12-22T04:50',
  ];
  getCalendar(2026).forEach(({ term, time }, index) => {
    assert.ok(Math.abs(time - parseLocalInput('2026-' + hko[index])) < 60_000, term.en);
  });
});

test('the early January interval belongs to the previous winter solstice', () => {
  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    const beforeNewYear = snapshot(yearStart(year) - 1);
    const afterNewYear = snapshot(yearStart(year));
    assert.equal(beforeNewYear.active, afterNewYear.active);
    assert.equal(afterNewYear.active.term.zh, '冬至');
    assert.equal(yearOf(afterNewYear.active.time), year - 1);
    assert.equal(afterNewYear.next.term.zh, '小寒');
  }
  assert.equal(clampTime(minTime - 1), minTime);
  assert.equal(clampTime(maxTime + 1), maxTime);
  assert.equal(yearOf(snapshot(maxTime).next.time), MAX_YEAR + 1);
  assert.ok(Number.isNaN(parseLocalInput('2025-02-29T12:00')));
  assert.ok(Number.isFinite(parseLocalInput('2024-02-29T12:00')));
});

test('a fixed north axis puts the overhead Sun at the equator and the correct tropics', () => {
  const tilt = TILT * Math.PI / 180;
  const north = [0, Math.cos(tilt), Math.sin(tilt)];
  for (const [longitude, expected] of [[0, 0], [90, TILT], [180, 0], [270, -TILT]]) {
    const earth = orbitPoint(longitude);
    const dot = earth.reduce((sum, component, index) => sum - component * north[index], 0);
    const declination = Math.asin(dot) * 180 / Math.PI;
    assert.ok(Math.abs(declination - expected) < 1e-9);
    assert.ok(Math.abs(solarDeclination(longitude) - expected) < 1e-9);
  }
});

test('the mnemonic keeps its complete text and maps repeated characters by position', () => {
  assert.deepEqual(song.map((line) => line.map(([word]) => word).join('')),
    ['春雨惊春清谷天', '夏满芒夏暑相连', '秋处露秋寒霜降', '冬雪雪冬小大寒']);
  assert.deepEqual(song.flatMap((line) => line.flatMap(([, ids]) => ids ?? [])),
    terms.map(({ index }) => index));
});
