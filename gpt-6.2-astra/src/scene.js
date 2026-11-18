import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { stars, solarTexture, coronaCanvas } from "./sky.js";

const RAD = Math.PI / 180,
  R = 8,
  RE = 0.62,
  RS = 0.94;
const seasons = ["#91beb0", "#ceab79", "#c49a70", "#819fbd"];
// The Sun's apparent longitude is geocentric. Earth's direction is opposite.
// A fixed rotation of the entire ecliptic sets the default viewing orientation.
export function positionAt(longitude, radius = R) {
  const a = (longitude + 180 - 35) * RAD;
  return new THREE.Vector3(radius * Math.cos(a), 0, -radius * Math.sin(a));
}
export const pole = positionAt(90, -Math.sin(23.44 * RAD)).setY(
  Math.cos(23.44 * RAD),
);
const up = new THREE.Vector3(0, 1, 0);

export function createScene({
  host,
  starCanvas,
  labelLayer,
  terms,
  pick,
  status,
}) {
  stars(starCanvas);
  const canvas = document.createElement("canvas");
  host.prepend(canvas);
  canvas.className = "universe";
  const camera = new THREE.OrthographicCamera(-11, 11, 5, -5, 0.02, 180);
  camera.up.set(0.075, 1, 0).normalize();
  const scene = new THREE.Scene(),
    objects = [],
    labels = [],
    imageData = {};
  const orbitDiagram = new THREE.Group();
  scene.add(orbitDiagram);
  const sunArt = solarTexture(),
    glowArt = coronaCanvas();
  let width = 1,
    height = 1,
    renderer,
    ctx,
    close = false,
    disposed = false,
    lang = 0,
    current = 0,
    longitude = 0,
    spin = -1.9;
  let isEnglishShort = false,
    lastFallback = -1,
    lastDraw = 0,
    surfaceStamp = "",
    viewChanged = false;
  const settings = {
    axis: true,
    equator: false,
    tropics: false,
    direction: true,
    spin: true,
  };
  const globePosition = positionAt(0);
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.innerWidth > 650,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, window.innerWidth < 650 ? 1.4 : 2),
    );
  } catch {
    const fallback = document.createElement("canvas");
    canvas.replaceWith(fallback);
    fallback.className = "universe";
    ctx = fallback.getContext("2d");
  }
  const surface = renderer ? canvas : ctx.canvas;
  const controls = new OrbitControls(camera, surface);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.095;
  controls.minZoom = 0.62;
  controls.maxZoom = 12;
  controls.rotateSpeed = 0.58;
  controls.zoomSpeed = 0.78;
  controls.minPolarAngle = 0.03;
  controls.maxPolarAngle = Math.PI - 0.03;
  controls.addEventListener("start", () => {
    viewChanged = true;
  });
  const own = (x) => (objects.push(x), x);
  const fromCanvas = (c) => {
    const t = own(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  function line(
    points,
    color,
    opacity = 1,
    parent = orbitDiagram,
    dashed = false,
  ) {
    const geometry = own(new THREE.BufferGeometry().setFromPoints(points));
    const material = own(
      dashed
        ? new THREE.LineDashedMaterial({
            color,
            transparent: true,
            opacity,
            dashSize: 0.095,
            gapSize: 0.12,
            depthWrite: false,
          })
        : new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
          }),
    );
    const l = new THREE.Line(geometry, material);
    if (dashed) l.computeLineDistances();
    parent.add(l);
    return l;
  }
  const arc = (r, start, end, num = 240) =>
    Array.from({ length: num + 1 }, (_, i) =>
      positionAt(start + ((end - start) * i) / num, r),
    );
  [R * 0.38, R * 0.59, R * 0.8, R * 0.945, R * 1.057, R * 1.09].forEach(
    (r, i) =>
      line(arc(r, 0, 360), i > 3 ? "#9b9d8e" : "#899697", i > 3 ? 0.23 : 0.12),
  );
  const ticks = [];
  for (let d = 0; d < 360; d += 2) {
    const size = d % 30 === 0 ? 0.24 : d % 10 === 0 ? 0.15 : 0.078;
    ticks.push(positionAt(d, R * 1.09), positionAt(d, R * 1.09 - size));
  }
  const tickLines = new THREE.LineSegments(
    own(new THREE.BufferGeometry().setFromPoints(ticks)),
    own(
      new THREE.LineBasicMaterial({
        color: 0xacaa92,
        transparent: true,
        opacity: 0.37,
      }),
    ),
  );
  orbitDiagram.add(tickLines);
  for (const a of [0, 90, 180, 270])
    line(
      [positionAt(a, 1.4), positionAt(a, R * 1.095)],
      "#909889",
      0.25,
      orbitDiagram,
      true,
    );
  for (let i = 0; i < 4; i++)
    line(arc(R, 315 + i * 90, 405 + i * 90), seasons[i], 0.83);
  const direction = new THREE.Group();
  orbitDiagram.add(direction);
  [48, 141, 222, 310].forEach((d) => {
    const p = positionAt(d),
      tangent = positionAt(d + 90, 1);
    line(
      [
        p
          .clone()
          .addScaledVector(tangent, -0.2)
          .lerp(positionAt(d, R - 0.16), 0.32),
        p.clone().addScaledVector(tangent, 0.13),
        p
          .clone()
          .addScaledVector(tangent, -0.15)
          .lerp(positionAt(d, R + 0.21), 0.35),
      ],
      "#d3c29a",
      0.88,
      direction,
    );
  });
  function sphere(r, material, parent = scene) {
    const mesh = new THREE.Mesh(
      own(new THREE.SphereGeometry(r, 64, 40)),
      own(material),
    );
    parent.add(mesh);
    return mesh;
  }
  const sun = sphere(
    RS,
    new THREE.MeshBasicMaterial({ map: fromCanvas(sunArt) }),
  );
  const glow = new THREE.Sprite(
    own(
      new THREE.SpriteMaterial({
        map: fromCanvas(glowArt),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  glow.scale.setScalar(RS * 7.9);
  scene.add(glow);
  const earthSystem = new THREE.Group(),
    tilted = new THREE.Group();
  scene.add(earthSystem);
  earthSystem.add(tilted);
  tilted.quaternion.setFromUnitVectors(up, pole);
  const land = sphere(
    RE,
    new THREE.MeshPhongMaterial({
      color: 0x3882ab,
      shininess: 7,
      specular: 0x365664,
    }),
    tilted,
  );
  const cloud = sphere(
    RE * 1.014,
    new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    tilted,
  );
  sphere(
    RE * 1.055,
    new THREE.ShaderMaterial({
      uniforms: { tint: { value: new THREE.Color(0x6dbcf2) } },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader:
        "varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
      fragmentShader:
        "varying vec3 n; varying vec3 v; uniform vec3 tint;void main(){float f=pow(clamp(1.+dot(normalize(n),normalize(v)),0.,1.),4.); gl_FragColor=vec4(tint,f*.65);}",
    }),
    tilted,
  );
  scene.add(new THREE.AmbientLight(0xcde5ff, 0.66));
  const sunlight = new THREE.PointLight(0xfff3d6, 2.7, 0, 0);
  scene.add(sunlight);
  const axis = line(
    [new THREE.Vector3(0, -RE * 1.76, 0), new THREE.Vector3(0, RE * 1.9, 0)],
    "#b4d9d4",
    0.84,
    tilted,
  );
  function parallel(deg, color) {
    const a = deg * RAD;
    const pts = Array.from({ length: 121 }, (_, i) =>
      new THREE.Vector3(
        Math.cos((i * Math.PI) / 60) * Math.cos(a),
        Math.sin(a),
        Math.sin((i * Math.PI) / 60) * Math.cos(a),
      ).multiplyScalar(RE * 1.025),
    );
    return line(pts, color, 0.95, tilted);
  }
  const equator = parallel(0, "#95efe0"),
    tropics = [parallel(23.44, "#edcc8c"), parallel(-23.44, "#edcc8c")];
  const highlight = line(arc(R, 0, 15, 20), "#e7e0aa", 1);
  const pointMaterial = own(new THREE.MeshBasicMaterial({ color: 0xdfd8b4 })),
    pointGeo = own(new THREE.SphereGeometry(0.041, 8, 6));
  const markers = terms.map((term, i) => {
    const pin = new THREE.Mesh(pointGeo, pointMaterial);
    pin.position.copy(positionAt(term.longitude));
    if (term.longitude % 90 === 0) pin.scale.setScalar(1.45);
    orbitDiagram.add(pin);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sky-label";
    b.dataset.index = i;
    b.style.setProperty("--season", seasons[term.season]);
    b.onclick = () => pick(i);
    labelLayer.append(b);
    labels.push(b);
    return {
      pin,
      anchor: positionAt(
        term.longitude,
        term.longitude % 90 === 0 ? R * 1.24 : R * 1.175,
      ),
    };
  });
  const sunLabel = document.createElement("span");
  sunLabel.className = "sun-label";
  labelLayer.append(sunLabel);
  const earthLabel = document.createElement("span");
  earthLabel.className = "earth-label";
  labelLayer.append(earthLabel);
  const northLabel = document.createElement("span");
  northLabel.className = "north-label";
  northLabel.textContent = "N";
  labelLayer.append(northLabel);
  const temp = new THREE.Vector3();
  function screen(p) {
    temp.copy(p).project(camera);
    return {
      x: (temp.x * 0.5 + 0.5) * width,
      y: (0.5 - temp.y * 0.5) * height,
    };
  }
  function place(el, p, ox = 0, oy = 0) {
    const { x, y } = screen(p);
    el.style.left = x + ox + "px";
    el.style.top = y + oy + "px";
  }
  function labelText() {
    terms.forEach((t, i) => {
      const title = lang ? t.en : t.zh,
        cardinal = t.longitude % 90 === 0;
      labels[i].className =
        "sky-label" +
        (cardinal ? " cardinal" : "") +
        (i === current ? " selected" : "");
      const abbreviations = [
        "Spring begins",
        "Rain water",
        "Insects stir",
        "Mar. equinox",
        "Clear & bright",
        "Grain rain",
        "Summer begins",
        "Grain buds",
        "Grain in ear",
        "Jun. solstice",
        "Minor heat",
        "Major heat",
        "Autumn begins",
        "End of heat",
        "White dew",
        "Sep. equinox",
        "Cold dew",
        "Frost descends",
        "Winter begins",
        "Minor snow",
        "Major snow",
        "Dec. solstice",
        "Minor cold",
        "Major cold",
      ];
      const compact = [
        "Spring start",
        "Rain water",
        "Insects stir",
        "Mar. eq.",
        "Clear skies",
        "Grain rain",
        "Summer start",
        "Grain buds",
        "Grain ear",
        "Jun. sol.",
        "Minor heat",
        "Major heat",
        "Autumn start",
        "Heat ends",
        "White dew",
        "Sep. eq.",
        "Cold dew",
        "Frost falls",
        "Winter start",
        "Minor snow",
        "Major snow",
        "Dec. sol.",
        "Minor cold",
        "Major cold",
      ];
      const shortEN = lang
        ? isEnglishShort
          ? compact[i]
          : abbreviations[i]
        : title;
      labels[i].innerHTML =
        "<span>" +
        shortEN +
        "</span>" +
        (cardinal ? "<small>" + t.longitude + "°</small>" : "");
      labels[i].title = title + " · " + t.longitude + "°";
      labels[i].setAttribute("aria-label", title + " " + t.longitude + "°");
    });
    sunLabel.textContent = lang ? "SUN" : "太 阳";
    earthLabel.textContent = lang ? "Earth" : "地球";
  }
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const half = Math.max(2.95, (width < 520 ? 10.95 : 10.85) / aspect);
    Object.assign(camera, {
      left: -half * aspect,
      right: half * aspect,
      top: half,
      bottom: -half,
    });
    camera.updateProjectionMatrix();
    if (renderer) renderer.setSize(width, height, false);
    else {
      const d = Math.min(devicePixelRatio, 1.5);
      surface.width = width * d;
      surface.height = height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    isEnglishShort = width < 700;
    labelText();
    lastFallback = -1;
    if (!viewChanged && !close) view("overview");
  }
  function view(mode) {
    close = mode === "close";
    viewChanged = false;
    controls.target.copy(close ? globePosition : new THREE.Vector3());
    // Fit an oblique view to the available plot area, including portrait screens.
    const elevation = Math.asin(
      THREE.MathUtils.clamp((camera.top * 0.85) / (R * 1.24), 0.16, 0.74),
    );
    const toSun = globePosition.clone().normalize().negate();
    const earthView = toSun
      .clone()
      .multiplyScalar(11)
      .addScaledVector(toSun.clone().cross(up), 17)
      .setY(7);
    camera.position
      .copy(controls.target)
      .add(
        close
          ? earthView
          : new THREE.Vector3(
              0,
              28 * Math.sin(elevation),
              28 * Math.cos(elevation),
            ),
      );
    camera.zoom = close ? (camera.top * 0.66) / RE : 1;
    camera.updateProjectionMatrix();
    controls.update();
    orbitDiagram.visible = !close;
    axis.scale.y = close ? 0.71 : 1;
    for (const label of labels) label.hidden = close;
    host.classList.toggle("close-up", close);
    lastFallback = -1;
  }
  function setState(state) {
    if (current !== state.index) {
      current = state.index;
      labelText();
    }
    longitude = state.longitude;
    const previous = globePosition.clone();
    globePosition.copy(positionAt(longitude));
    earthSystem.position.copy(globePosition);
    highlight.geometry.setFromPoints(
      arc(R, terms[current].longitude, terms[current].longitude + 15, 20),
    );
    if (close) {
      camera.position.add(globePosition.clone().sub(previous));
      controls.target.copy(globePosition);
    }
    lastFallback = -1;
  }
  let pending = 2,
    failed = false;
  function loaded(ok) {
    if (disposed) return;
    failed ||= !ok;
    pending--;
    status(
      pending
        ? "loading"
        : failed
          ? "texture-fallback"
          : renderer
            ? "ready"
            : "canvas",
    );
  }
  function texture(url, target, clouds = false) {
    new THREE.TextureLoader().load(
      url,
      (t) => {
        if (disposed) {
          t.dispose();
          return;
        }
        own(t);
        if (!clouds) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer
          ? Math.min(4, renderer.capabilities.getMaxAnisotropy())
          : 1;
        if (clouds) {
          target.material.alphaMap = t;
          target.material.opacity = 0.86;
        } else {
          target.material.map = t;
          target.material.color.set(0xffffff);
        }
        target.material.needsUpdate = true;
        if (ctx) {
          const c = document.createElement("canvas");
          c.width = 1024;
          c.height = 512;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(t.image, 0, 0, 1024, 512);
          imageData[clouds ? "clouds" : "earth"] = x.getImageData(
            0,
            0,
            1024,
            512,
          ).data;
        }
        loaded(true);
      },
      undefined,
      () => loaded(false),
    );
  }
  texture(`${import.meta.env.BASE_URL}art/earth.jpg`, land);
  texture(`${import.meta.env.BASE_URL}art/clouds.jpg`, cloud, true);
  // WebGL-unavailable clients use the same camera, orbit geometry, tilt and light direction.
  const softEarth = document.createElement("canvas");
  function mappedEarth(radius) {
    const n = Math.max(16, Math.min(300, Math.ceil(radius * 2)));
    softEarth.width = softEarth.height = n;
    const c = softEarth.getContext("2d"),
      image = c.createImageData(n, n),
      arr = image.data;
    const light = globePosition.clone().normalize().negate(),
      local = tilted.quaternion.clone().multiply(land.quaternion).invert();
    const v = new THREE.Vector3(),
      normal = new THREE.Vector3();
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const u = (2 * (x + 0.5)) / n - 1,
          b = 1 - (2 * (y + 0.5)) / n,
          z2 = 1 - u * u - b * b;
        if (z2 < 0) continue;
        normal.set(u, b, Math.sqrt(z2)).applyQuaternion(camera.quaternion);
        const l = 0.27 + 0.9 * Math.max(0, normal.dot(light));
        v.copy(normal).applyQuaternion(local);
        const tx = Math.floor(
            ((Math.atan2(v.z, -v.x) / (2 * Math.PI) + 1) % 1) * 1024,
          ),
          ty = Math.min(
            511,
            Math.floor(
              (Math.acos(THREE.MathUtils.clamp(v.y, -1, 1)) / Math.PI) * 512,
            ),
          ),
          j = (ty * 1024 + tx) * 4;
        const cloudAlpha = (imageData.clouds?.[j] || 0) / 320,
          k = (y * n + x) * 4;
        for (let a = 0; a < 3; a++)
          arr[k + a] =
            ((imageData.earth?.[j + a] ?? [39, 108, 150][a]) *
              (1 - cloudAlpha) +
              247 * cloudAlpha) *
            l;
        arr[k + 3] = 255;
      }
    c.putImageData(image, 0, 0);
  }
  function renderFallback(now) {
    if (lastFallback > 0 && now - lastFallback < 70) return;
    lastFallback = now;
    ctx.clearRect(0, 0, width, height);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    const scale = (width / (camera.right - camera.left)) * camera.zoom;
    function drawLine(obj) {
      if (!obj.visible || !obj.parent.visible) return;
      const arr = obj.geometry.getAttribute("position");
      ctx.beginPath();
      ctx.strokeStyle = obj.material.color.getStyle();
      ctx.globalAlpha = obj.material.opacity;
      ctx.setLineDash(obj.material.isLineDashedMaterial ? [3, 5] : []);
      for (let i = 0; i < arr.count; i++) {
        const p = screen(
          new THREE.Vector3()
            .fromBufferAttribute(arr, i)
            .applyMatrix4(obj.matrixWorld),
        );
        if (!i || (obj.isLineSegments && i % 2 === 0)) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }
    orbitDiagram.traverseVisible((o) => {
      if (o.isLine) drawLine(o);
    });
    if (!close)
      markers.forEach(({ pin }) => {
        const p = screen(pin.position);
        ctx.fillStyle = "#d2ceb3";
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          Math.max(1, scale * 0.045 * pin.scale.x),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });
    const s = screen(sun.position),
      r = scale * RS;
    ctx.drawImage(glowArt, s.x - r * 3.95, s.y - r * 3.95, r * 7.9, r * 7.9);
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(sunArt, s.x - r, s.y - r, r * 2, r * 2);
    const warm = ctx.createRadialGradient(
      s.x - r * 0.25,
      s.y - r * 0.2,
      r * 0.25,
      s.x,
      s.y,
      r,
    );
    warm.addColorStop(0, "#fff2a76b");
    warm.addColorStop(0.8, "#ffcf6300");
    warm.addColorStop(1, "#ff931458");
    ctx.fillStyle = warm;
    ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
    ctx.restore();
    const e = screen(globePosition),
      er = scale * RE;
    const stamp = [
      er,
      spin,
      longitude,
      camera.quaternion.toArray(),
      !!imageData.earth,
      !!imageData.clouds,
    ].join(",");
    if (surfaceStamp !== stamp) {
      mappedEarth(er);
      surfaceStamp = stamp;
    }
    ctx.save();
    ctx.shadowColor = "#79b9e0";
    ctx.shadowBlur = er * 0.22;
    ctx.drawImage(softEarth, e.x - er, e.y - er, er * 2, er * 2);
    ctx.restore();
    [axis, equator, ...tropics].forEach(drawLine);
  }
  function update(now) {
    const delta = Math.min(0.1, Math.max(0, now - lastDraw) / 1000);
    lastDraw = now;
    if (settings.spin) spin += delta * 0.034;
    land.rotation.y = spin;
    cloud.rotation.y = spin * 1.014;
    sun.rotation.y += delta * 0.009;
    axis.visible = settings.axis;
    equator.visible = settings.equator;
    tropics.forEach((o) => (o.visible = settings.tropics));
    direction.visible = settings.direction;
    controls.update();
    camera.updateMatrixWorld();
    const px = (width / (camera.right - camera.left)) * camera.zoom;
    const showLabels = !close && camera.zoom < 2;
    for (let i = 0; i < labels.length; i++) {
      labels[i].hidden = !showLabels;
      if (showLabels) place(labels[i], markers[i].anchor);
    }
    place(sunLabel, sun.position, 0, RS * px + 14);
    sunLabel.hidden = close;
    place(earthLabel, globePosition, -RE * px - 34, -RE * px - 5);
    northLabel.hidden = !settings.axis;
    place(
      northLabel,
      globePosition.clone().addScaledVector(pole, RE * (close ? 1.48 : 2.13)),
    );
    if (renderer) renderer.render(scene, camera);
    else renderFallback(now);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  view("overview");
  function keyboard(key) {
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (key === "ArrowLeft") spherical.theta -= 0.1;
    else if (key === "ArrowRight") spherical.theta += 0.1;
    else if (key === "ArrowUp") spherical.phi -= 0.08;
    else if (key === "ArrowDown") spherical.phi += 0.08;
    else if (["+", "=", "-", "_"].includes(key)) {
      camera.zoom = THREE.MathUtils.clamp(
        camera.zoom * (key === "+" || key === "=" ? 1.14 : 1 / 1.14),
        controls.minZoom,
        controls.maxZoom,
      );
      camera.updateProjectionMatrix();
    } else return false;
    viewChanged = true;
    spherical.makeSafe();
    camera.position
      .copy(controls.target)
      .add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
    return true;
  }
  return {
    update,
    setState,
    view,
    settings,
    keyboard,
    setLanguage(v) {
      lang = v;
      labelText();
    },
    get isClose() {
      return close;
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      controls.dispose();
      objects.forEach((o) => o.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
    },
  };
}
