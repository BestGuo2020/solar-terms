import test from "node:test";
import assert from "node:assert/strict";
import { pole, positionAt } from "../src/scene.js";
import { terms, song, history, culture, science } from "../src/content.js";
import { termLongitude } from "../src/astronomy.js";

test("fixed pole gives equal equinox illumination and opposite solstice declinations", () => {
  const declination = (longitude) => {
    const sunward = positionAt(longitude).normalize().negate();
    return (Math.asin(pole.dot(sunward)) * 180) / Math.PI;
  };
  for (const [longitude, expected] of [
    [0, 0],
    [90, 23.44],
    [180, 0],
    [270, -23.44],
  ]) {
    assert.ok(Math.abs(declination(longitude) - expected) < 1e-9);
  }
});

test("orbit markers, bilingual term records and positional song links cover the same 24 terms", () => {
  assert.equal(terms.length, 24);
  terms.forEach((term, i) => {
    assert.equal(term.longitude, termLongitude(i));
    assert.equal(term.season, Math.floor(i / 6));
    for (const key of ["meaning", "nature", "farm", "custom"]) {
      assert.equal(term[key].length, 2);
      assert.ok(term[key].every((s) => s.length > 8));
    }
  });
  song.forEach((line, i) => {
    const ids = line.flatMap(
      (token) => token.indices ?? (token.index === null ? [] : [token.index]),
    );
    assert.deepEqual(
      ids,
      Array.from({ length: 6 }, (_, j) => i * 6 + j),
    );
  });
  assert.equal(
    song.map((line) => line.map((t) => t.char).join("")).join("，"),
    "春雨惊春清谷天，夏满芒夏暑相连，秋处露秋寒霜降，冬雪雪冬小大寒",
  );
  for (const section of [...history, ...culture, ...science])
    assert.ok(section.text.every((t) => t.length > 15));
});
