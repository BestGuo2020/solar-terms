import assert from "node:assert/strict";
import test from "node:test";
import * as clock from "../src/time.js";
import { termsForYear } from "../src/astronomy.js";

test("seeking pauses playback and the same clock crosses years and term boundaries", () => {
  clock.seek(Date.parse("2026-12-31T12:00:00+08:00"));
  clock.setSpeed(1);
  clock.setPlayback(true);
  clock.advance(1000);
  assert.equal(clock.minuteStamp(clock.ms), "2027-01-01 12:00");
  assert.equal(clock.model.year, 2027);
  assert.equal(clock.model.index, 21);

  const equinox = termsForYear(2027).find((term) => term.index === 3);
  clock.seek(equinox.ms - 1);
  assert.equal(clock.playing, false);
  assert.equal(clock.model.index, 2);
  clock.seek(equinox.ms);
  assert.equal(clock.model.index, 3);
  assert.equal(clock.model.start, clock.ms);

  clock.seek(clock.maximum - 300);
  clock.setPlayback(true);
  clock.advance(1000);
  assert.equal(clock.playing, false);
  assert.equal(clock.ms, clock.maximum - 1);
});
