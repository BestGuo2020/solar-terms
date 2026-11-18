// Deterministic visual textures keep the star field still while the camera moves.
export function generator(seed = 5231) {
  return () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
}
function hash(x, y) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function noise(x, y) {
  const i = Math.floor(x),
    j = Math.floor(y);
  let a = x - i,
    b = y - j;
  a = a * a * (3 - 2 * a);
  b = b * b * (3 - 2 * b);
  return (
    (hash(i, j) * (1 - a) + hash(i + 1, j) * a) * (1 - b) +
    (hash(i, j + 1) * (1 - a) + hash(i + 1, j + 1) * a) * b
  );
}
export function stars(canvas) {
  const w = (canvas.width = 1400),
    h = (canvas.height = 680),
    ctx = canvas.getContext("2d");
  const low = document.createElement("canvas");
  low.width = 700;
  low.height = 340;
  const lc = low.getContext("2d");
  const pixels = lc.createImageData(700, 340);
  for (let y = 0; y < 340; y++)
    for (let x = 0; x < 700; x++) {
      let v = 0,
        scale = 0.012,
        amp = 0.55;
      for (let n = 0; n < 5; n++) {
        v += noise(x * scale, y * scale) * amp;
        scale *= 2.15;
        amp *= 0.49;
      }
      const band = Math.exp(
        -Math.pow((y - (220 - x * 0.2 + 18 * Math.sin(x / 95))) / 42, 2),
      );
      const f = (Math.max(0, v - 0.26) * 27 + 6) * band + v * 3;
      const k = (y * 700 + x) * 4;
      pixels.data[k] = 6 + f * 0.66;
      pixels.data[k + 1] = 13 + f * 0.94;
      pixels.data[k + 2] = 18 + f * 1.08;
      pixels.data[k + 3] = 255;
    }
  lc.putImageData(pixels, 0, 0);
  ctx.drawImage(low, 0, 0, w, h);
  const rand = generator();
  for (let i = 0; i < 3200; i++) {
    const x = rand() * w,
      y = rand() * h,
      b = rand(),
      r = 0.25 + Math.pow(b, 8) * 1.05;
    ctx.fillStyle =
      "rgba(" +
      (rand() > 0.75 ? "239,216,177" : "201,224,232") +
      "," +
      (0.18 + b * 0.54) +
      ")";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (i % 141 === 0) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
      g.addColorStop(0, "#e7f9ffab");
      g.addColorStop(0.18, "#bddeef60");
      g.addColorStop(1, "#86bdde00");
      ctx.fillStyle = g;
      ctx.fillRect(x - 6, y - 6, 12, 12);
      ctx.strokeStyle = "#d7eeee50";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x - 3.5, y);
      ctx.lineTo(x + 3.5, y);
      ctx.moveTo(x, y - 3.5);
      ctx.lineTo(x, y + 3.5);
      ctx.stroke();
    }
  }
}
export function coronaCanvas() {
  const c = document.createElement("canvas"),
    n = (c.width = c.height = 512),
    ctx = c.getContext("2d"),
    m = n / 2;
  const g = ctx.createRadialGradient(m, m, 0, m, m, m);
  for (const [p, col] of [
    [0, "#fff2b2ff"],
    [0.17, "#ffd67ddb"],
    [0.245, "#ffc358ab"],
    [0.285, "#ffbb5074"],
    [0.335, "#ffab403c"],
    [0.46, "#f59e2822"],
    [0.68, "#e59d2410"],
    [1, "#e7ad2700"],
  ])
    g.addColorStop(p, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, n, n);
  const rand = generator(907);
  for (let i = 0; i < 480; i++) {
    const a = rand() * Math.PI * 2,
      start = m * (0.22 + rand() * 0.06),
      end = m * (0.31 + Math.pow(rand(), 3) * 0.3);
    ctx.beginPath();
    ctx.moveTo(m + start * Math.cos(a), m + start * Math.sin(a));
    ctx.lineTo(m + end * Math.cos(a + 0.014), m + end * Math.sin(a + 0.014));
    ctx.strokeStyle = "rgba(255,195,76," + rand() * 0.04 + ")";
    ctx.lineWidth = rand() * 1.9 + 0.25;
    ctx.stroke();
  }
  return c;
}
export function solarTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d"),
    im = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const twist = noise(x * 0.012, y * 0.012) * 38;
      const f =
        noise((x + twist) * 0.075, (y - twist) * 0.075) * 0.38 +
        noise(x * 0.23, y * 0.23) * 0.26 +
        noise(x * 0.011, y * 0.011) * 0.28 +
        hash(x, y) * 0.08;
      const v = Math.max(0, Math.min(1, (f - 0.21) / 0.61));
      const k = (y * c.width + x) * 4;
      im.data[k] = 251 + 4 * v;
      im.data[k + 1] = 107 + 137 * v;
      im.data[k + 2] = 18 + 119 * v * v;
      im.data[k + 3] = 255;
    }
  ctx.putImageData(im, 0, 0);
  return c;
}
