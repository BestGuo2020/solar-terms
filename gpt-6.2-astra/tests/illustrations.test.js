import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { terms } from "../src/content.js";

test("all 24 terms have distinct local WebP illustrations with bilingual descriptions", () => {
  const fingerprints = new Set();
  for (const term of terms) {
    const path = new URL(`../public/art/${term.illustration}`, import.meta.url);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", term.zh);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", term.zh);
    const hash = createHash("sha256").update(bytes).digest("hex");
    assert.ok(!fingerprints.has(hash), `Repeated artwork at ${term.zh}`);
    fingerprints.add(hash);
    assert.equal(term.illustrationAlt.length, 2);
    assert.ok(term.illustrationAlt.every((description) => description.trim().length > 0));
  }
  assert.equal(fingerprints.size, 24);
});
