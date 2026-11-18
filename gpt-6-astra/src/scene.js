import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBLIQUITY, positionFromLongitude } from './geometry.js';
import { terms } from './data/terms.js';
import { translate } from './i18n/messages.js';

const EARTH_RADIUS=0.68;
const seasonColors={'春':0x83bfa8,'夏':0xe2ba74,'秋':0xc18762,'冬':0x93b6d0};
const vector = p => new THREE.Vector3(...p);
function orbitRadius(longitude) {
  // Near-circular visual guide; actual Earth and marker radii use Astronomy Engine.
  const e=0.0167;
  return 7.3*(1-e*e)/(1+e*Math.cos((longitude-282.94)*Math.PI/180));
}
function pointsForArc(from,to,radiusFn=orbitRadius,count=128) {
  return Array.from({length:count+1},(_,i)=>{
    const angle=from+(to-from)*i/count;
    return vector(positionFromLongitude(angle,radiusFn(angle)));
  });
}
function glowTexture() {
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(128,128,10,128,128,128);
  g.addColorStop(0,'rgba(255,222,158,.6)');g.addColorStop(.25,'rgba(246,167,70,.25)');g.addColorStop(.6,'rgba(206,112,42,.06)');g.addColorStop(1,'rgba(196,90,30,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function makeLine(points,color,opacity=1) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));
}

export class SolarScene {
  constructor(host,getState,options,onSelect,onStatus) {
    this.host=host;this.getState=getState;this.options=options;this.onStatus=onStatus;
    this.locale='zh';this.localizedTerms=terms;
    this.disposed=false;this.inView=true;this.mode='default';this.lastYear=0;this.lastTerm=-1;this.lastRender=0;
    this.textures=new Set();this.markers=[];this.width=1;this.height=1;
    this.low=matchMedia('(max-width: 700px)').matches;
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(38,1,.05,160);
    this.renderer=new THREE.WebGLRenderer({antialias:!this.low,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.low?1.25:1.75));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.15;
    this.renderer.domElement.setAttribute('role','img');
    this.renderer.domElement.tabIndex=0;
    this.renderer.domElement.setAttribute('aria-label',this.text('scene.canvas'));
    host.appendChild(this.renderer.domElement);
    this.overlay=document.createElement('div');this.overlay.className='scene-label-layer';host.appendChild(this.overlay);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.enableDamping=true;this.controls.dampingFactor=.075;
    this.controls.enablePan=false;this.controls.minDistance=2.1;this.controls.maxDistance=58;
    this.controls.minPolarAngle=.05;this.controls.maxPolarAngle=Math.PI*.48;
    this.onKey=event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;
      event.preventDefault();
      const spherical=new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target));
      if(event.key==='ArrowLeft')spherical.theta-=.12;
      if(event.key==='ArrowRight')spherical.theta+=.12;
      if(event.key==='ArrowUp')spherical.phi-=.1;
      if(event.key==='ArrowDown')spherical.phi+=.1;
      if(['+','='].includes(event.key))spherical.radius*=.88;
      if(event.key==='-')spherical.radius*=1.12;
      spherical.phi=THREE.MathUtils.clamp(spherical.phi,this.controls.minPolarAngle,this.controls.maxPolarAngle);
      spherical.radius=THREE.MathUtils.clamp(spherical.radius,this.controls.minDistance,this.controls.maxDistance);
      this.camera.position.setFromSpherical(spherical).add(this.controls.target);this.controls.update();
    };
    this.renderer.domElement.addEventListener('keydown',this.onKey);
    this.scene.add(new THREE.AmbientLight(0x91b6dc,.17));
    this.sunLight=new THREE.PointLight(0xfff3df,130,0,2);this.scene.add(this.sunLight);
    this.createSun();this.createEarth();this.createOrbit(onSelect);this.createStars();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
    this.intersection=new IntersectionObserver(([entry])=>{this.inView=entry.isIntersecting;this.restart();},{threshold:0});this.intersection.observe(host);
    this.onVisibility=()=>this.restart();document.addEventListener('visibilitychange',this.onVisibility);
    this.onLost=event=>{event.preventDefault();cancelAnimationFrame(this.frame);onStatus('scene.contextLost','error');};
    this.renderer.domElement.addEventListener('webglcontextlost',this.onLost);
    this.resize();this.view('default');this.loadTextures();this.restart();
  }
  text(key,params) {return translate(this.locale,key,params);}
  setLanguage(locale,localizedTerms) {
    this.locale=locale;this.localizedTerms=localizedTerms;this.overlay.dataset.locale=locale;
    this.renderer.domElement.setAttribute('aria-label',this.text('scene.canvas'));
    [[this.sunLabel,'sun'],[this.earthLabel,'earth'],[this.northLabel,'north'],[this.equatorLabel,'equator'],[this.northTropicLabel,'northTropic'],[this.southTropicLabel,'southTropic']].forEach(([el,key])=>{el.textContent=this.text(`scene.${key}`);});
    this.updateMarkerLabels();
  }
  updateMarkerLabels() {
    const illustration=this.getState().mode==='illustration';
    this.markers.forEach(marker=>{
      const term=this.localizedTerms[marker.term.id];
      marker.button.textContent=this.locale==='en'?(this.width<700?String(term.id+1).padStart(2,'0'):term.pinyin):term.name;
      marker.button.setAttribute('aria-label',this.text(illustration?'scene.termIllustrate':'scene.termJump',{name:term.name,longitude:term.longitude}));
      marker.button.title=`${term.name}${term.chineseName?` · ${term.chineseName}`:''} · ${term.longitude}°`;
    });
  }
  createSun() {
    const material=new THREE.ShaderMaterial({
      uniforms:{uTime:{value:0}},
      vertexShader:'varying vec3 vPos; varying vec3 vNormal; void main(){vPos=position;vNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec3 vPos; varying vec3 vNormal; uniform float uTime;
        float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
        float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
        void main(){vec3 p=vPos*18.+vec3(uTime*.02);float n=noise(p)*.55+noise(p*2.)*.28+noise(p*4.)*.17;vec3 c=mix(vec3(.55,.16,.025),vec3(1.4,.87,.31),n);gl_FragColor=vec4(c*1.75,1.);}`,
    });
    this.sun=new THREE.Mesh(new THREE.SphereGeometry(1.04,64,32),material);this.scene.add(this.sun);
    const texture=glowTexture();this.textures.add(texture);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(6.8,6.8,1);this.scene.add(glow);
    this.sunLabel=this.label(this.text('scene.sun'),'body-label sun-label');
  }
  createEarth() {
    this.earth=new THREE.Group();this.scene.add(this.earth);
    this.tilt=new THREE.Group();this.tilt.rotation.x=-OBLIQUITY;this.earth.add(this.tilt);
    this.spinGroup=new THREE.Group();this.tilt.add(this.spinGroup);
    const segments=this.low?48:80;
    this.surface=new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS,segments,segments/2),new THREE.MeshPhongMaterial({color:0x295d83,shininess:16,specular:0x16303e}));
    this.spinGroup.add(this.surface);
    this.fallback=new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS*1.002,20,12),new THREE.MeshBasicMaterial({color:0x649699,wireframe:true,transparent:true,opacity:.18}));this.spinGroup.add(this.fallback);
    this.clouds=new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS*1.018,segments,segments/2),new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false}));this.clouds.visible=false;this.spinGroup.add(this.clouds);
    const atmosphere=new THREE.ShaderMaterial({
      uniforms:{sunDir:{value:new THREE.Vector3(1,0,0)}},
      vertexShader:'varying vec3 n; varying vec3 w; void main(){w=(modelMatrix*vec4(position,1.)).xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}',
      fragmentShader:'varying vec3 n; varying vec3 w; uniform vec3 sunDir; void main(){vec3 v=normalize(cameraPosition-w);float rim=pow(1.-max(0.,dot(normalize(n),v)),3.);float light=smoothstep(-.2,.8,dot(normalize(n),sunDir));gl_FragColor=vec4(.24,.58,.92,rim*(.12+.52*light));}',
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
    });
    this.atmosphere=new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS*1.07,segments,segments/2),atmosphere);this.earth.add(this.atmosphere);
    this.axis=makeLine([new THREE.Vector3(0,-1.17,0),new THREE.Vector3(0,1.3,0)],0xddcfaa,.85);this.tilt.add(this.axis);
    this.equator=this.latitude(0,0xf1cf8d);this.tilt.add(this.equator);
    this.tropics=new THREE.Group();this.tropics.add(this.latitude(23.44,0x81bcc7),this.latitude(-23.44,0x81bcc7));this.tilt.add(this.tropics);
    this.northLabel=this.label(this.text('scene.north'),'body-label north-label');
    this.earthLabel=this.label(this.text('scene.earth'),'body-label earth-label');
    this.equatorLabel=this.label(this.text('scene.equator'),'body-label latitude-label');
    this.northTropicLabel=this.label(this.text('scene.northTropic'),'body-label latitude-label');
    this.southTropicLabel=this.label(this.text('scene.southTropic'),'body-label latitude-label');
  }
  latitude(degrees,color) {
    const a=degrees*Math.PI/180,r=EARTH_RADIUS*1.027;
    const points=Array.from({length:97},(_,i)=>new THREE.Vector3(r*Math.cos(a)*Math.cos(i/96*Math.PI*2),r*Math.sin(a),r*Math.cos(a)*Math.sin(i/96*Math.PI*2)));
    return makeLine(points,color,.66);
  }
  createOrbit(onSelect) {
    this.orbit=new THREE.Group();this.scene.add(this.orbit);
    ['春','夏','秋','冬'].forEach((season,i)=>{
      this.orbit.add(makeLine(pointsForArc(315+i*90,405+i*90),seasonColors[season],.45));
    });
    this.orbit.add(makeLine(pointsForArc(0,360,()=>8.65),0x526576,.15));
    this.activeArc=makeLine([],0xe4c88f,.95);this.orbit.add(this.activeArc);
    this.angleArc=makeLine(pointsForArc(0,0,()=>2,64),0xbf9e69,.58);this.orbit.add(this.angleArc);
    this.reference=makeLine([new THREE.Vector3(),vector(positionFromLongitude(0,7.3))],0x87929a,.15);this.orbit.add(this.reference);
    this.sunRay=makeLine([new THREE.Vector3(),new THREE.Vector3(1,0,0)],0xe6c180,.22);this.orbit.add(this.sunRay);
    this.direction=new THREE.Group();
    [20,110,200,290].forEach(a=>{
      const rad=a*Math.PI/180;
      this.direction.add(new THREE.ArrowHelper(new THREE.Vector3(Math.sin(rad),0,Math.cos(rad)),vector(positionFromLongitude(a,orbitRadius(a))),.58,0x70828d,.19,.12));
    });this.orbit.add(this.direction);
    terms.forEach(term=>{
      const button=document.createElement('button');button.type='button';button.className=`orbit-label${term.longitude%90===0?' cardinal':''}`;
      button.textContent=term.name;button.setAttribute('aria-label',this.text('scene.termJump',{name:term.name,longitude:term.longitude}));
      button.addEventListener('click',()=>onSelect(term.id));this.overlay.appendChild(button);
      const dot=new THREE.Mesh(new THREE.SphereGeometry(term.longitude%90===0?.072:.045,8,6),new THREE.MeshBasicMaterial({color:seasonColors[term.season]}));
      dot.position.copy(vector(positionFromLongitude(term.longitude,orbitRadius(term.longitude))));this.orbit.add(dot);
      this.markers.push({term,button,dot,anchor:vector(positionFromLongitude(term.longitude,8.65))});
    });
  }
  createStars() {
    let seed=75123;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const points=[];
    for(let i=0;i<(this.low?280:650);i++) {
      const y=random()*2-1,a=random()*Math.PI*2,r=45+random()*25;
      points.push(Math.sqrt(1-y*y)*Math.cos(a)*r,y*r,Math.sqrt(1-y*y)*Math.sin(a)*r);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    this.scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:0xa9bdd0,size:.045,transparent:true,opacity:.5,sizeAttenuation:true})));
  }
  label(text,className) {const el=document.createElement('span');el.className=className;el.textContent=text;this.overlay.appendChild(el);return el;}
  async loadTextures() {
    this.onStatus('scene.loading','loading');
    const loader=new THREE.TextureLoader();
    const results=await Promise.allSettled([
      loader.loadAsync(`${import.meta.env.BASE_URL}textures/earth-day-2048.jpg`),loader.loadAsync(`${import.meta.env.BASE_URL}textures/earth-clouds-2048.jpg`),
    ]);
    if(this.disposed) {results.forEach(r=>{if(r.status==='fulfilled')r.value.dispose();});return;}
    results.forEach(r=>{if(r.status==='fulfilled')this.textures.add(r.value);});
    if(results[0].status==='fulfilled') {
      const texture=results[0].value;texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(this.renderer.capabilities.getMaxAnisotropy(),this.low?2:8);
      this.surface.material.map=texture;this.surface.material.color.set(0xffffff);this.surface.material.needsUpdate=true;this.fallback.visible=false;
    }
    if(results[1].status==='fulfilled') {this.clouds.material.alphaMap=results[1].value;this.clouds.material.needsUpdate=true;this.clouds.visible=true;}
    this.onStatus(results.every(r=>r.status==='fulfilled')?'scene.ready':results[0].status==='rejected'?'scene.textureFailed':'scene.cloudFailed',results.every(r=>r.status==='fulfilled')?'ready':'fallback');
  }
  resize() {
    this.width=this.host.clientWidth;this.height=this.host.clientHeight;
    if(!this.width||!this.height)return;
    const previousAspect=this.camera.aspect;
    this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.renderer.setSize(this.width,this.height);
    if(this.mode!=='earth') {
      // Refit distance while preserving the user's rotation/zoom when translated
      // text changes the available space. Do not reset the camera on language switches.
      const ratio=Math.max(1,1.23/this.camera.aspect)/Math.max(1,1.23/previousAspect);
      this.camera.position.sub(this.controls.target).multiplyScalar(ratio).add(this.controls.target);this.controls.update();
    }
    this.updateMarkerLabels();
  }
  view(mode) {
    this.mode=mode;
    this.orbit.visible=mode!=='earth';
    const state=this.getState();
    if(mode==='earth') {
      const earth=vector(state.position);this.controls.target.copy(earth);
      // Observer at quadrature sees the day/night boundary; keep north up.
      const sun=earth.clone().negate().normalize();
      const side=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),sun).normalize();
      this.camera.position.copy(earth).add(sun.multiplyScalar(1.65)).add(side.multiplyScalar(2.65)).add(new THREE.Vector3(0,1.05,0));
      this.camera.position.sub(earth).multiplyScalar(this.low?1.18:1.12).add(earth);
      this.previousEarth=earth.clone();
    } else {
      this.controls.target.set(0,0,0);
      const scale=Math.max(1,1.23/Math.max(this.camera.aspect,.3));
      this.camera.position.copy((mode==='overview'?new THREE.Vector3(0,32.5,.1):new THREE.Vector3(0,18,21)).multiplyScalar(scale));
    }
    this.controls.update();
  }
  quality(mode) {
    const low=mode==='low'||(mode==='auto'&&this.low);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.75));
    this.atmosphere.visible=!low;this.lowQuality=low;
  }
  project(el,position,visible=true) {
    const p=position.clone().project(this.camera);
    const show=visible&&p.z>-1&&p.z<1&&Math.abs(p.x)<1.04&&Math.abs(p.y)<1.03;
    el.hidden=!show;
    if(show)el.style.transform=`translate(${(p.x+1)*this.width/2}px,${(1-p.y)*this.height/2}px) translate(-50%,-50%)`;
  }
  render = now => {
    if(this.disposed||document.hidden||!this.inView)return;
    this.frame=requestAnimationFrame(this.render);
    if(this.lowQuality&&now-this.lastRender<32)return;
    this.lastRender=now;
    const s=this.getState();if(!s)return;
    this.earth.position.fromArray(s.position);
    if(this.mode==='earth'&&this.previousEarth) {
      const delta=this.earth.position.clone().sub(this.previousEarth);this.camera.position.add(delta);this.controls.target.add(delta);this.previousEarth.copy(this.earth.position);
    }
    this.spinGroup.rotation.y=s.spinAngle;
    this.sun.material.uniforms.uTime.value=now/1000;
    this.atmosphere.material.uniforms.sunDir.value.copy(this.earth.position).negate().normalize();
    this.axis.visible=this.options.axis;this.equator.visible=this.options.equator;this.tropics.visible=this.options.tropics;this.direction.visible=this.options.direction;
    if(this.lastYear!==s.year||this.lastMode!==s.mode) {
      this.lastYear=s.year;this.lastMode=s.mode;
      this.markers.forEach(m=>{
        const event=s.events.find(e=>e.id===m.term.id);
        m.dot.position.fromArray(event?.position??positionFromLongitude(m.term.longitude,orbitRadius(m.term.longitude)));
      });
      this.updateMarkerLabels();
    }
    if(this.lastTerm!==s.current.id) {
      this.lastTerm=s.current.id;
      this.activeArc.geometry.dispose();this.activeArc.geometry=new THREE.BufferGeometry().setFromPoints(pointsForArc(s.current.longitude,s.current.longitude+15));
      this.markers.forEach(m=>{m.button.classList.toggle('selected',m.term.id===s.current.id);m.button.setAttribute('aria-pressed',String(m.term.id===s.current.id));});
    }
    const anglePositions=this.angleArc.geometry.attributes.position;
    for(let i=0;i<=64;i++)anglePositions.setXYZ(i,...positionFromLongitude(s.longitude*i/64,2));
    anglePositions.needsUpdate=true;
    const attr=this.sunRay.geometry.attributes.position;attr.setXYZ(1,...s.position);attr.needsUpdate=true;
    this.controls.update();this.scene.updateMatrixWorld();
    this.renderer.render(this.scene,this.camera);
    this.markers.forEach(m=>this.project(m.button,m.anchor,this.mode!=='earth'));
    this.project(this.sunLabel,new THREE.Vector3(0,-1.55,0),this.mode!=='earth');
    this.project(this.earthLabel,this.earth.position.clone().add(new THREE.Vector3(0,-1.12,0)),this.mode!=='earth');
    this.project(this.northLabel,this.tilt.localToWorld(new THREE.Vector3(0,1.05,0)),this.options.axis&&this.mode==='earth');
    const close=this.mode==='earth';
    [ [this.equatorLabel,0], [this.northTropicLabel,23.44], [this.southTropicLabel,-23.44] ].forEach(([el,lat])=>{
      const a=lat*Math.PI/180;
      this.project(el,this.tilt.localToWorld(new THREE.Vector3(-EARTH_RADIUS*Math.cos(a)-.15,EARTH_RADIUS*Math.sin(a),0)),close&&(lat===0?this.options.equator:this.options.tropics));
    });
  };
  restart() {cancelAnimationFrame(this.frame);if(!document.hidden&&this.inView&&!this.disposed)this.frame=requestAnimationFrame(this.render);}
  dispose() {
    this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.intersection.disconnect();
    document.removeEventListener('visibilitychange',this.onVisibility);this.renderer.domElement.removeEventListener('webglcontextlost',this.onLost);this.renderer.domElement.removeEventListener('keydown',this.onKey);this.controls.dispose();
    this.scene.traverse(object=>{object.geometry?.dispose();const materials=object.material?(Array.isArray(object.material)?object.material:[object.material]):[];materials.forEach(m=>m.dispose());});
    this.textures.forEach(t=>t.dispose());this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();this.overlay.remove();
  }
}
