import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { orbitPoint, TILT } from './astronomy.js';
import { seasons, terms } from './terms.js';

const RADIUS = 6.2;
const EARTH = 0.57;
const RAD = Math.PI / 180;
const OVERVIEW = new THREE.Vector3(0, 17, 20);
const texturePath = (name) => import.meta.env.BASE_URL + 'textures/' + name + '.webp';
const place = (angle, radius = RADIUS) => new THREE.Vector3(...orbitPoint(angle, radius));
const vertexShader = `
  varying vec2 tex;
  varying vec3 normalWorld;
  varying vec3 positionWorld;
  void main() {
    tex = uv;
    normalWorld = normalize(mat3(modelMatrix) * normal);
    positionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(positionWorld, 1.0);
  }`;

function makeLine(points, color, opacity = 1, dashed = false) {
  const options = { color, transparent: opacity < 1, opacity };
  const material = dashed
    ? new THREE.LineDashedMaterial({ ...options, dashSize: 0.055, gapSize: 0.085 })
    : new THREE.LineBasicMaterial(options);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  if (dashed) line.computeLineDistances();
  return line;
}

function arc(radius, start = 0, length = 360, color = '#a398c4', opacity = 1, dashed = false) {
  const steps = Math.ceil(length / 2);
  return makeLine(Array.from({ length: steps + 1 }, (_, i) => place(start + length * i / steps, radius)),
    color, opacity, dashed);
}

function latitude(angle, color, opacity) {
  const radius = (EARTH + 0.021) * Math.cos(angle * RAD);
  const y = (EARTH + 0.021) * Math.sin(angle * RAD);
  return makeLine(Array.from({ length: 73 }, (_, i) => place(i * 5, radius).setY(y)), color, opacity);
}

function canvasTexture(width, height, paint) {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function fallbackEarth() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    ['#d1e9f6', '#1b5995', '#12406d', '#1c6298', '#deeaf4'].forEach((color, i) => gradient.addColorStop(i / 4, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    const land = [
      [[.08,.24],[.17,.16],[.26,.20],[.28,.33],[.23,.38],[.20,.46],[.16,.40],[.14,.33],[.09,.31]],
      [[.23,.45],[.31,.47],[.34,.54],[.31,.65],[.27,.78],[.24,.70],[.25,.61],[.21,.53]],
      [[.44,.32],[.47,.22],[.55,.17],[.60,.23],[.73,.15],[.87,.20],[.91,.28],[.82,.35],[.76,.46],[.69,.38],[.64,.48],[.61,.39],[.53,.35],[.48,.40]],
      [[.45,.38],[.52,.38],[.58,.45],[.56,.58],[.51,.68],[.47,.57],[.44,.48]],
      [[.80,.54],[.90,.57],[.92,.66],[.88,.72],[.80,.65],[.78,.60]],
      [[.27,.16],[.35,.11],[.39,.16],[.34,.25],[.30,.22]],
    ];
    ctx.fillStyle = '#6e8b61';
    for (const polygon of land) {
      ctx.beginPath();
      polygon.forEach(([x, y], i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](x * w, y * h));
      ctx.closePath();
      ctx.fill();
    }
  });
}

function glowTexture() {
  return canvasTexture(256, 256, (ctx) => {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    [[0, '#ffbf71'], [.21, '#ffb464bc'], [.36, '#fa8a4f65'], [.51, '#f47b3d26'],
      [.78, '#db59200b'], [1, '#db592000']].forEach(([offset, color]) => gradient.addColorStop(offset, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  });
}

function globeMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    uniforms: {
      dayMap: { value: fallbackEarth() }, cloudMap: { value: null }, nightMap: { value: null },
      hasClouds: { value: false }, hasNight: { value: false },
      lightDirection: { value: new THREE.Vector3(1, 0, 0) },
    },
    fragmentShader: `
      uniform sampler2D dayMap, cloudMap, nightMap;
      uniform bool hasClouds, hasNight;
      uniform vec3 lightDirection;
      varying vec2 tex;
      varying vec3 normalWorld, positionWorld;
      void main() {
        vec3 n = normalize(normalWorld);
        vec3 view = normalize(cameraPosition - positionWorld);
        float sun = dot(n, lightDirection);
        float day = smoothstep(-.16, .15, sun);
        vec3 surface = texture2D(dayMap, tex).rgb;
        float cloud = hasClouds ? texture2D(cloudMap, tex).r : 0.0;
        surface = mix(surface, vec3(.85,.89,.94), smoothstep(.04,.87,cloud) * .78);
        vec3 dark = surface * .11 + vec3(.008,.016,.045);
        if (hasNight) dark += texture2D(nightMap, tex).rgb * .64;
        vec3 color = mix(dark, surface * (.56 + max(0.0,sun) * .84), day);
        float rim = pow(1.0 - max(dot(n, view), 0.0), 3.1);
        color += vec3(.09,.31,.68) * rim * (.57 + .43 * day);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

function sunMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    uniforms: { map: { value: null }, hasMap: { value: false } },
    fragmentShader: `
      uniform sampler2D map;
      uniform bool hasMap;
      varying vec2 tex;
      varying vec3 normalWorld, positionWorld;
      void main() {
        float depth = max(0.0, dot(normalize(normalWorld), normalize(cameraPosition - positionWorld)));
        float pattern = .81 + .08 * sin(167.0 * tex.x + 9.0 * sin(44.0 * tex.y))
          * sin(114.0 * tex.y + 6.0 * sin(58.0 * tex.x));
        vec3 source = hasMap ? texture2D(map, tex).rgb : vec3(pattern, pattern * .43, pattern * .085);
        vec3 color = (source * vec3(1.2, .94, .57) + vec3(.13, .053, .011)) * (.64 + .55 * sqrt(depth));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

function starfield(container) {
  const layer = document.createElement('canvas');
  layer.className = 'stars';
  layer.setAttribute('aria-hidden', 'true');
  container.prepend(layer);
  return (width, height) => {
    layer.width = width;
    layer.height = height;
    const ctx = layer.getContext('2d');
    if (!ctx) return;
    let seed = 31;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 285; i++) {
      const x = random() * width;
      const y = random() * height;
      const light = random();
      const opacity = .14 + random() * .45;
      ctx.beginPath();
      ctx.arc(x, y, light > .97 ? 1.15 : .25 + light * .49, 0, Math.PI * 2);
      ctx.fillStyle = light > .91 ? 'rgba(236,198,169,' + opacity + ')' : 'rgba(195,192,233,' + opacity + ')';
      ctx.fill();
    }
  };
}

export function createOrbit(container, labels, objects, onStatus) {
  const drawStars = starfield(container);
  const mobile = matchMedia('(max-width: 660px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.near = .1;
  camera.far = 100;
  camera.position.copy(OVERVIEW);
  camera.lookAt(0, 0, 0);

  const fallback = document.createElement('canvas');
  fallback.className = 'orbit-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  container.append(fallback);
  let renderer;
  let controls;
  let fallbackMode = false;
  let contextLost = false;
  let disposed = false;
  let textureStatus = 'loading';
  let width = 1;
  let height = 1;
  let frame = 0;
  let close = false;
  let visible = true;
  let layoutDirty = true;
  let guides = { axis: true, equator: false, tropics: false, direction: true };
  let state;
  let lastFrame = 0;
  let spinExtra = 0;
  let spinDemo = false;
  let spinEnabled = true;
  const textures = new Set();
  const projection = new THREE.Vector3();
  const closeTarget = new THREE.Vector3();

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile.matches });
    renderer.domElement.className = 'orbit-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.append(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minPolarAngle = .13;
    controls.maxPolarAngle = 1.51;
    controls.minZoom = .65;
    controls.maxZoom = 8;
    controls.enableDamping = !reduced.matches;
    controls.dampingFactor = .12;
    controls.addEventListener('change', invalidateLayout);
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      contextLost = true;
      onStatus('fallback');
      invalidate();
    });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      contextLost = false;
      onStatus(textureStatus);
      invalidate();
    });
  } catch {
    fallbackMode = true;
    textureStatus = 'fallback';
    if (!controls) {
      controls = new OrbitControls(camera, fallback);
      controls.enablePan = false;
      controls.minPolarAngle = .13;
      controls.maxPolarAngle = 1.51;
      controls.minZoom = .65;
      controls.maxZoom = 8;
      controls.addEventListener('change', invalidateLayout);
    }
  }

  const labelsRoot = labels[0].parentElement;
  const earth = new THREE.Group();
  const tilted = new THREE.Group();
  const spinning = new THREE.Group();
  tilted.rotation.x = TILT * RAD;
  earth.add(tilted);
  tilted.add(spinning);
  scene.add(earth);

  const globe = globeMaterial();
  textures.add(globe.uniforms.dayMap.value);
  spinning.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH, mobile.matches ? 48 : 72, 40), globe));
  const sky = new THREE.Mesh(new THREE.SphereGeometry(EARTH * 1.042, 48, 32), new THREE.ShaderMaterial({
    vertexShader, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    fragmentShader: `
      varying vec3 normalWorld, positionWorld;
      void main() {
        float limb = pow(1.0 - abs(dot(normalize(normalWorld),normalize(cameraPosition-positionWorld))), 3.0);
        gl_FragColor = vec4(.15,.43,.94,limb * .66);
      }`,
  }));
  earth.add(sky);
  const axis = makeLine([new THREE.Vector3(0, -.84, 0), new THREE.Vector3(0, .84, 0)], '#a7d8f7', .91);
  tilted.add(axis);
  const equator = latitude(0, '#a6dacc', .88);
  const tropics = new THREE.Group();
  tropics.add(latitude(TILT, '#f4be78', .9), latitude(-TILT, '#f4be78', .9));
  tilted.add(equator, tropics);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 40), sunMaterial());
  sun.rotation.set(.12, 2.2, -.15);
  scene.add(sun);
  const glow = glowTexture();
  textures.add(glow);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glow, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.set(5.6, 5.6, 1);
  halo.renderOrder = 3;
  scene.add(halo);

  const orbitalPlane = new THREE.Group();
  const guideArrows = new THREE.Group();
  for (const radius of [2.45, 3.65, 4.9, 6.51]) orbitalPlane.add(arc(radius, 0, 360, '#8e7ebd', .17, true));
  for (const angle of [0, 90, 180, 270]) {
    orbitalPlane.add(makeLine([place(angle, 1.15), place(angle, 6.54)], '#b6a0be', .21, true));
  }
  seasons.forEach(({ color }, i) => {
    orbitalPlane.add(arc(RADIUS, 315 + 90 * i, 90, color, .69));
    const angle = 322 + i * 90;
    const arrow = new THREE.ArrowHelper(place(angle + 90, 1), place(angle, RADIUS), .47, color, .21, .15);
    guideArrows.add(arrow);
  });
  orbitalPlane.add(guideArrows);
  const currentArc = arc(RADIUS + .043, 0, 15, '#fff0cf');
  orbitalPlane.add(currentArc);
  const ray = makeLine([place(0, 1.1), place(0, RADIUS - EARTH)], '#f0c087', .54, true);
  orbitalPlane.add(ray);
  scene.add(orbitalPlane);

  function project(world) {
    return projection.copy(world).project(camera);
  }

  function screenPoint(world) {
    const { x, y } = project(world);
    return [(x + 1) * width / 2, (1 - y) * height / 2];
  }

  function position(element, world, hideOutside = true) {
    const [x, y] = screenPoint(world);
    element.hidden = hideOutside && (x < 12 || x > width - 12 || y < 10 || y > height - 10);
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    return [x, y];
  }

  function positionLabels() {
    labelsRoot.hidden = close;
    const [earthX, earthY] = screenPoint(earth.position);
    const earthSize = EARTH * width / (camera.right - camera.left) * camera.zoom;
    if (!close) {
      const [cx, cy] = screenPoint(new THREE.Vector3());
      labels.forEach((label, i) => {
        const [x, y] = position(label, place(terms[i].longitude));
        const dx = x - cx;
        const dy = y - cy;
        const span = Math.max(1, Math.hypot(dx, dy));
        const distanceToEarth = Math.hypot(x - earthX, y - earthY);
        const clearance = Math.max(0, earthSize + 21 - distanceToEarth);
        const horizontal = mobile.matches ? -10 : 10 + clearance * .7;
        const vertical = Math.min(13 + clearance, Math.max(13, Math.min(y, height - y) - 22));
        label.style.setProperty('--dx', (dx / span * horizontal) + 'px');
        label.style.setProperty('--dy', (dy / span * vertical) + 'px');
        label.dataset.anchor = Math.abs(dx) < width * .10 ? 'center' : dx < 0 ? 'left' : 'right';
        label.dataset.half = dy < 0 ? 'top' : 'bottom';
      });
    }
    const [sunX, sunY] = screenPoint(new THREE.Vector3());
    const sunSize = 1.06 * width / (camera.right - camera.left) * camera.zoom;
    const earthLabelY = earthY + (close ? 1 : -1) * (earthSize + (close ? 14 : 12));
    const earthLabelX = earthX + (close ? 0 : (earthX < width / 2 ? 1 : -1) * 15);
    for (const [element, x, y, hide] of [
      [objects.sun, sunX, sunY + sunSize + 9, close],
      [objects.earth, earthLabelX, earthLabelY, false],
    ]) {
      element.hidden = hide || x < 21 || x > width - 21 || y < 14 || y > height - 9;
      element.style.left = x + 'px';
      element.style.top = y + 'px';
    }
  }

  function paintFallback() {
    const ctx = fallback.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    function paintArc(radius, start, length, color, opacity) {
      ctx.beginPath();
      for (let i = 0; i <= length; i += 1) {
        const [x, y] = screenPoint(place(start + i, radius));
        ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y);
      }
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (!close) {
      [2.45, 3.65, 4.9, 6.51].forEach((r) => paintArc(r, 0, 360, '#9587ba', .25));
      seasons.forEach(({ color }, i) => paintArc(RADIUS, 315 + 90 * i, 90, color, .8));
      if (state) paintArc(RADIUS, state.active.term.longitude, 15, '#fff0cf', 1);
      if (guides.direction) {
        seasons.forEach(({ color }, i) => {
          const angle = 322 + i * 90;
          const [x, y] = screenPoint(place(angle + 3));
          const [tailX, tailY] = screenPoint(place(angle));
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.atan2(y - tailY, x - tailX));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-6, -2.5);
          ctx.lineTo(-6, 2.5);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.restore();
        });
      }
    }
    const [sunX, sunY] = screenPoint(new THREE.Vector3());
    const [earthX, earthY] = screenPoint(earth.position);
    const scale = width / (camera.right - camera.left) * camera.zoom;
    const sunR = scale * 1.06;
    const earthR = scale * EARTH;
    const halo = ctx.createRadialGradient(sunX, sunY, sunR * .7, sunX, sunY, sunR * 2.7);
    halo.addColorStop(0, '#ff995c7d'); halo.addColorStop(1, '#ff784500');
    ctx.fillStyle = halo;
    ctx.fillRect(sunX - sunR * 3, sunY - sunR * 3, sunR * 6, sunR * 6);
    const length = Math.max(1, Math.hypot(sunX - earthX, sunY - earthY));
    const dx = (sunX - earthX) / length;
    const dy = (sunY - earthY) / length;
    const lit = ctx.createLinearGradient(earthX + dx * earthR, earthY + dy * earthR,
      earthX - dx * earthR, earthY - dy * earthR);
    lit.addColorStop(0, '#73bde9'); lit.addColorStop(.48, '#296ba9'); lit.addColorStop(.60, '#17365e'); lit.addColorStop(1, '#0c1833');
    for (const [x, y, r, color] of [[sunX, sunY, sunR, '#ffac57'], [earthX, earthY, earthR, lit]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    const latitudes = [
      ...(guides.equator ? [[0, '#a6dacc']] : []),
      ...(guides.tropics ? [[TILT, '#f4be78'], [-TILT, '#f4be78']] : []),
    ];
    for (const [angle, color] of latitudes) {
      const radius = EARTH * Math.cos(angle * RAD);
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const point = place(i * 5, radius).setY(EARTH * Math.sin(angle * RAD))
          .applyEuler(tilted.rotation).add(earth.position);
        ctx[i === 0 ? 'moveTo' : 'lineTo'](...screenPoint(point));
      }
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    if (guides.axis) {
      const a = new THREE.Vector3(0, -.84, 0).applyEuler(tilted.rotation).add(earth.position);
      const b = new THREE.Vector3(0, .84, 0).applyEuler(tilted.rotation).add(earth.position);
      ctx.beginPath();
      ctx.moveTo(...screenPoint(a));
      ctx.lineTo(...screenPoint(b));
      ctx.strokeStyle = '#a7d8f7';
      ctx.stroke();
    }
  }

  function render(now) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const isFallback = fallbackMode || contextLost;
    if (spinDemo && !isFallback) spinExtra = (spinExtra + Math.min(now - (lastFrame || now), 60) * .00025) % (Math.PI * 2);
    lastFrame = now;
    if (state && spinEnabled) spinning.rotation.y = (state.sidereal + 180) * RAD + spinExtra;
    const moving = controls?.update();
    camera.updateMatrixWorld();
    fallback.hidden = !isFallback;
    if (renderer) renderer.domElement.hidden = isFallback;
    if (layoutDirty) {
      positionLabels();
      layoutDirty = false;
    }
    if (isFallback) {
      paintFallback();
    } else {
      renderer.render(scene, camera);
      if (spinDemo || moving) invalidate();
    }
  }

  function invalidate() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function invalidateLayout() {
    layoutDirty = true;
    invalidate();
  }

  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const ratio = width / height;
    const half = Math.max(mobile.matches ? 7.4 : 8.65, ratio * 4.77);
    Object.assign(camera, { left: -half, right: half, bottom: -half / ratio, top: half / ratio });
    camera.updateProjectionMatrix();
    renderer?.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.35 : 1.8));
    renderer?.setSize(width, height, false);
    fallback.width = width;
    fallback.height = height;
    drawStars(width, height);
    if (close) setView('earth');
    invalidateLayout();
  }

  function setView(view) {
    close = view === 'earth';
    orbitalPlane.visible = !close;
    if (close) {
      const outward = earth.position.clone().normalize();
      const towardLight = outward.clone().negate().multiplyScalar(5.5);
      const sideways = new THREE.Vector3(-outward.z, 0, outward.x).multiplyScalar(8);
      const offset = towardLight.add(sideways).setY(3.8);
      // A close-up looks at the planet from a direction with both daylight and night in view.
      closeTarget.copy(earth.position);
      camera.position.copy(closeTarget).add(offset);
      camera.zoom = mobile.matches ? 4.9 : 5.5;
    } else {
      closeTarget.set(0, 0, 0);
      camera.position.copy(view === 'default' ? OVERVIEW : new THREE.Vector3(0, 21, 17));
      camera.zoom = 1;
    }
    camera.lookAt(closeTarget);
    if (controls) {
      controls.target.copy(closeTarget);
      controls.update();
    }
    camera.updateProjectionMatrix();
    invalidateLayout();
  }

  function handleCameraKeys(event) {
    if (event.target !== container || event.ctrlKey || event.metaKey || event.altKey) return;
    const actions = {
      ArrowLeft: [-.095, 0], ArrowRight: [.095, 0], ArrowUp: [0, -.095], ArrowDown: [0, .095],
      '+': [0, 0, 1.14], '=': [0, 0, 1.14], '-': [0, 0, 1 / 1.14],
    };
    const action = actions[event.key];
    if (!Array.isArray(action)) return;
    event.preventDefault();
    const [theta, phi, zoom = 1] = action;
    const angle = new THREE.Spherical().setFromVector3(camera.position.clone().sub(closeTarget));
    angle.theta += theta;
    angle.phi = THREE.MathUtils.clamp(angle.phi + phi, .13, 1.51);
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * zoom, .65, 8);
    camera.position.setFromSpherical(angle).add(closeTarget);
    camera.lookAt(closeTarget);
    camera.updateProjectionMatrix();
    controls?.update();
    invalidateLayout();
  }
  container.addEventListener('keydown', handleCameraKeys);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
    else lastFrame = 0;
  });
  intersection.observe(container);

  if (renderer) {
    const loader = new THREE.TextureLoader();
    const maps = [
      ['2k_earth_daymap', globe, 'dayMap'], ['2k_earth_clouds', globe, 'cloudMap', 'hasClouds'],
      ['2k_earth_nightmap', globe, 'nightMap', 'hasNight'], ['2k_sun', sun.material, 'map', 'hasMap'],
    ];
    Promise.allSettled(maps.map(async ([name, material, sampler, flag]) => {
      const map = await loader.loadAsync(texturePath(name));
      if (disposed) {
        map.dispose();
        return;
      }
      if (sampler !== 'cloudMap') map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      textures.add(map);
      material.uniforms[sampler].value = map;
      if (flag) material.uniforms[flag].value = true;
      invalidate();
    })).then((results) => {
      if (disposed) return;
      textureStatus = results.some((item) => item.status === 'rejected') ? 'textureFallback' : 'ready';
      if (!contextLost) onStatus(textureStatus);
    });
  }
  onStatus(textureStatus);

  return {
    update(value, spin, demo) {
      const previous = earth.position.clone();
      state = value;
      spinEnabled = spin;
      spinDemo = spin && demo && !reduced.matches;
      if (!demo) spinExtra = 0;
      earth.position.copy(place(value.longitude));
      globe.uniforms.lightDirection.value.copy(earth.position).normalize().negate();
      currentArc.rotation.y = value.active.term.longitude * RAD;
      ray.rotation.y = value.longitude * RAD;
      if (close) {
        const change = earth.position.clone().sub(previous);
        camera.position.add(change);
        closeTarget.copy(earth.position);
        if (controls) controls.target.copy(closeTarget);
      }
      invalidateLayout();
    },
    setView,
    setGuides(value) {
      guides = value;
      axis.visible = value.axis;
      equator.visible = value.equator;
      tropics.visible = value.tropics;
      guideArrows.visible = value.direction;
      invalidate();
    },
    show() {
      lastFrame = 0;
      invalidate();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      container.removeEventListener('keydown', handleCameraKeys);
      controls?.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      renderer?.dispose();
    },
  };
}
