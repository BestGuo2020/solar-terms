import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_YEAR,
  MIN_YEAR,
  solarLongitude,
  stateAt,
  termLongitude,
  termsForYear,
  yearBounds,
} from "../src/astronomy.js";

const DAY = 86_400_000;

test("all supported years contain 24 ordered crossings and switch terms at the computed instant", () => {
  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    const [begin, end] = yearBounds(year);
    const terms = termsForYear(year);
    assert.equal(terms.length, 24);
    const intervals = [];
    terms.forEach(({ index, ms }, slot) => {
      assert.equal(index, (slot + 22) % 24);
      assert.ok(ms >= begin && ms < end);
      const target = termLongitude(index);
      const diff = ((solarLongitude(ms) - target + 540) % 360) - 180;
      assert.ok(
        diff >= -1e-12 && diff < 2e-8,
        `${year} ${target}° residual ${diff}°`,
      );
      const before = stateAt(ms - 1);
      const at = stateAt(ms);
      assert.equal(before.index, (index + 23) % 24);
      assert.equal(before.next, ms);
      assert.equal(at.index, index);
      assert.equal(at.start, ms);
      const days = (at.next - at.start) / DAY;
      assert.ok(days > 14 && days < 16);
      intervals.push(days);
    });
    assert.ok(Math.max(...intervals) - Math.min(...intervals) > 0.9);
    assert.equal(stateAt(begin).index, 21);
    assert.equal(stateAt(end - 1).index, 21);
    if (year < MAX_YEAR) {
      assert.equal(stateAt(end).year, year + 1);
      assert.equal(stateAt(end - 1).start, stateAt(end).start);
    }
  }
});

test("2026 predictions agree with all 24 published Hong Kong Observatory times within one minute", () => {
  // HKT is UTC+8. The independently published comparison is rounded to the minute.
  // https://www.hko.gov.hk/en/gts/astronomy/data/files/24SolarTerms_2026.xml
  const reference = [
    "01-05T16:23",
    "01-20T09:45",
    "02-04T04:02",
    "02-18T23:52",
    "03-05T21:59",
    "03-20T22:46",
    "04-05T02:40",
    "04-20T09:39",
    "05-05T19:49",
    "05-21T08:37",
    "06-05T23:48",
    "06-21T16:25",
    "07-07T09:57",
    "07-23T03:13",
    "08-07T19:43",
    "08-23T10:19",
    "09-07T22:41",
    "09-23T08:05",
    "10-08T14:29",
    "10-23T17:38",
    "11-07T17:52",
    "11-22T15:23",
    "12-07T10:53",
    "12-22T04:50",
  ];
  termsForYear(2026).forEach(({ ms, index }, slot) => {
    const official = Date.parse(`2026-${reference[slot]}:00+08:00`);
    assert.ok(Math.abs(ms - official) < 60_000, `term #${index + 1}`);
  });
});

test("range limits use midnight in Shanghai and include leap days", () => {
  assert.equal(yearBounds(2000)[0], Date.parse("2000-01-01T00:00:00+08:00"));
  assert.equal(yearBounds(2050)[1], Date.parse("2051-01-01T00:00:00+08:00"));
  assert.equal(yearBounds(2000)[1] - yearBounds(2000)[0], 366 * DAY);
  assert.throws(() => stateAt(yearBounds(MIN_YEAR)[0] - 1), RangeError);
  assert.throws(() => stateAt(yearBounds(MAX_YEAR)[1]), RangeError);
  assert.throws(() => termsForYear(2026.5), RangeError);
});
