import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { terms, seasonColors, type Lang } from './data';
import { orbitPosition, OBLIQUITY } from './astronomy';

export class Observatory {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.05, 150);
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private earth = new THREE.Group();
  private tilted = new THREE.Group();
  private globe: THREE.Mesh;
  private cloud: THREE.Mesh;
  private helpers = new THREE.Group();
  private arrows = new THREE.Group();
  private ray: THREE.Line;
  private active: THREE.Line;
  private labels: HTMLButtonElement[] = [];
  private earthLabel: HTMLDivElement;
  private observer: ResizeObserver;
  private disposed = false;
  private focused = false;
  private lastPosition = new THREE.Vector3();
  private currentId = -1;
  private textures: THREE.Texture[] = [];
  private stars: THREE.Points;
  private keyHandler: (event: KeyboardEvent) => void;
  private lossHandler: (event: Event) => void;
  private w = 1;
  private h = 1;
  private low: boolean;
  private cameraMode: 'default'|'overview'|'earth' = 'default';
  private lang: Lang = 'zh';
  constructor(private host: HTMLElement, select: (id: number) => void, status: (key: string) => void) {
    this.low = window.innerWidth < 700 || navigator.hardwareConcurrency < 5;
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.low, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.low ? 1.25 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x101619, 0);
    this.host.appendChild(this.renderer.domElement);
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute('role', 'img');
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .065;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI * .88;
    this.scene.add(new THREE.AmbientLight(0x8ba4c0, .18));
    const light = new THREE.PointLight(0xfff2da, 2.7, 0, 0);
    this.scene.add(light);
    const sphere = new THREE.SphereGeometry(1, this.low ? 48 : 80, this.low ? 32 : 48);
    const sun = new THREE.Mesh(sphere, new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 p; varying vec3 n; void main(){p=position;n=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec3 p; varying vec3 n;
        float grain(vec3 q){return sin(q.x*63.+sin(q.z*41.))*sin(q.y*71.+sin(q.x*29.))*sin(q.z*83.+q.y*13.);}
        void main(){float g=grain(p)*.10+grain(p*2.3)*.035;float bands=sin(p.y*12.+sin(p.x*10.)*2.)*.025;
        vec3 col=mix(vec3(1.,.38,.06),vec3(1.,.85,.44),.65+g+bands);gl_FragColor=vec4(col,1.);}`
    }));
    sun.scale.setScalar(.96);
    this.scene.add(sun);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128,128,10,128,128,128);
    gradient.addColorStop(0, 'rgba(255,197,92,.65)'); gradient.addColorStop(.3, 'rgba(255,156,51,.22)');
    gradient.addColorStop(.6,'rgba(232,134,42,.065)'); gradient.addColorStop(1,'rgba(210,120,30,0)');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,256,256);
    const haloTexture = new THREE.CanvasTexture(canvas); this.textures.push(haloTexture);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
    glow.scale.set(6.3,6.3,1); this.scene.add(glow);
    this.globe = new THREE.Mesh(new THREE.SphereGeometry(.5, this.low ? 48 : 80, this.low ? 32 : 64), new THREE.MeshPhongMaterial({ color:0x557f9b, shininess:14, specular:0x192c35 }));
    this.tilted.rotation.x = -OBLIQUITY;
    this.tilted.add(this.globe); this.earth.add(this.tilted); this.scene.add(this.earth);
    const loader = new THREE.TextureLoader();
    loader.load(`${import.meta.env.BASE_URL}textures/earth-blue-marble.png`, texture => {
      if (this.disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      this.textures.push(texture);
      const mat = this.globe.material as THREE.MeshPhongMaterial;
      mat.map = texture; mat.color.set(0xffffff); mat.needsUpdate = true; status('ready');
    }, undefined, () => status('fallback'));
    // A separate, procedural cloud veil; the NASA mosaic is a static composite.
    const cloudCanvas = document.createElement('canvas'); cloudCanvas.width=512; cloudCanvas.height=256;
    const cc = cloudCanvas.getContext('2d')!; const pixels = cc.createImageData(512,256);
    for(let y=0;y<256;y++) for(let x=0;x<512;x++) {
      const u=x/512*Math.PI*2, v=y/256*Math.PI;
      const n=Math.sin(u*9+Math.sin(v*13))*Math.sin(v*17+Math.sin(u*7)*2)+Math.sin(u*23+v*11)*.32;
      const idx=(y*512+x)*4; pixels.data[idx]=pixels.data[idx+1]=pixels.data[idx+2]=255;
      pixels.data[idx+3]=Math.max(0,n-.38)*95*Math.sin(v);
    }
    cc.putImageData(pixels,0,0); const cloudTex = new THREE.CanvasTexture(cloudCanvas); this.textures.push(cloudTex);
    this.cloud = new THREE.Mesh(new THREE.SphereGeometry(.508,48,32),new THREE.MeshPhongMaterial({map:cloudTex,transparent:true,depthWrite:false,opacity:.55}));
    this.tilted.add(this.cloud);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(.535,48,32), new THREE.ShaderMaterial({
      transparent:true, side:THREE.BackSide, depthWrite:false, blending:THREE.AdditiveBlending,
      vertexShader:'varying vec3 wn; varying vec3 wp; void main(){vec4 world=modelMatrix*vec4(position,1.);wp=world.xyz;wn=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}',
      fragmentShader:'varying vec3 wn; varying vec3 wp;void main(){float rim=pow(1.-abs(dot(normalize(wn),normalize(cameraPosition-wp))),3.);gl_FragColor=vec4(.2,.55,1.,rim*.5);}'
    }));
    this.earth.add(atmosphere);
    const axis = this.line([new THREE.Vector3(0,-.86,0),new THREE.Vector3(0,.9,0)],0xc8dfdc,.8);
    this.helpers.add(axis);
    for(const lat of [0,23.44,-23.44]) {
      const phi = lat*Math.PI/180;
      const points = Array.from({length:97},(_,i)=>new THREE.Vector3(.518*Math.cos(phi)*Math.cos(i/96*Math.PI*2),.518*Math.sin(phi),.518*Math.cos(phi)*Math.sin(i/96*Math.PI*2)));
      this.helpers.add(this.line(points,lat===0?0xf0d390:0x8fc9c3,.85));
    }
    const pole = new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),new THREE.MeshBasicMaterial({color:0xe4f4ea})); pole.position.y=.91;this.helpers.add(pole);
    this.tilted.add(this.helpers);
    // The orbital circle is deliberately circular; angular speed comes from astronomy.
    this.scene.add(this.line(Array.from({length:257},(_,i)=>this.vector(i/256*360,7)),0x78908c,.27));
    this.scene.add(this.line(Array.from({length:257},(_,i)=>this.vector(i/256*360,7.16)),0x78908c,.08));
    const ticks:THREE.Vector3[]=[];
    for(let i=0;i<120;i++) {
      const a=i*3, major=i%5===0;
      ticks.push(this.vector(a,major?6.84:6.93),this.vector(a,7.03));
    }
    this.scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks),new THREE.LineBasicMaterial({color:0x91ab9b,transparent:true,opacity:.35})));
    for(let i=0;i<24;i++) {
      const term=terms[i]; const dot=new THREE.Mesh(new THREE.SphereGeometry(term.longitude%90===0?.055:.028,8,6),new THREE.MeshBasicMaterial({color:seasonColors[term.season]}));
      dot.position.copy(this.vector(term.longitude,7));this.scene.add(dot);
      const button=document.createElement('button');button.className='orbit-label';
      button.dataset.id=String(i);button.style.setProperty('--term-color',seasonColors[term.season]);button.addEventListener('click',()=>select(i));
      this.host.appendChild(button);this.labels.push(button);
    }
    for(let a=10;a<360;a+=60) {
      const at=this.vector(a,6.65); const direction=this.vector(a+1,6.65).sub(at).normalize();
      this.arrows.add(new THREE.ArrowHelper(direction,at,.32,0x6b8a81,.14,.1));
    }
    this.scene.add(this.arrows);
    this.active = this.line([],0xd1bd82,1);this.scene.add(this.active);
    this.ray=this.line([new THREE.Vector3(),new THREE.Vector3()],0xc9b981,.25);this.scene.add(this.ray);
    const starCount=this.low?170:380;const positions=new Float32Array(starCount*3);
    let seed=107; const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    for(let i=0;i<starCount;i++){const phi=random()*Math.PI*2,cosTheta=random()*2-1,sinTheta=Math.sqrt(1-cosTheta*cosTheta),r=40+random()*20;positions.set([r*sinTheta*Math.cos(phi),r*cosTheta,r*sinTheta*Math.sin(phi)],i*3);}
    const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    this.stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xbac8d2,size:.045,transparent:true,opacity:.55,sizeAttenuation:true}));this.scene.add(this.stars);
    this.earthLabel=document.createElement('div');this.earthLabel.className='earth-label';this.host.appendChild(this.earthLabel);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.host);
    this.keyHandler=event=>{
      const offset=this.camera.position.clone().sub(this.controls.target);
      if(event.key==='ArrowLeft'||event.key==='ArrowRight')offset.applyAxisAngle(new THREE.Vector3(0,1,0),event.key==='ArrowLeft'?.12:-.12);
      else if(event.key==='+'||event.key==='=')offset.multiplyScalar(.9);
      else if(event.key==='-')offset.multiplyScalar(1.1);
      else return;
      event.preventDefault();offset.clampLength(1.2,60);this.camera.position.copy(this.controls.target).add(offset);this.controls.update();
    };
    this.renderer.domElement.addEventListener('keydown',this.keyHandler);
    this.lossHandler=event=>{event.preventDefault();status('webgl');};this.renderer.domElement.addEventListener('webglcontextlost',this.lossHandler);
    this.view('default');this.resize();status('loading');
  }
  private vector(longitude:number,radius:number) { const p=orbitPosition(longitude,radius);return new THREE.Vector3(p.x,p.y,p.z); }
  private line(points:THREE.Vector3[],color:number,opacity:number) {return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
  private resize() {
    this.w=this.host.clientWidth;this.h=this.host.clientHeight;
    this.renderer.setSize(this.w,this.h,false);this.camera.aspect=this.w/this.h;
    this.camera.updateProjectionMatrix();
    if(!this.focused) this.view(this.cameraMode);
  }
  setLang(lang:Lang) {
    this.lang=lang;
    this.labels.forEach((button,i)=>{
      button.innerHTML=`<span class="marker-name">${terms[i].name[lang]}</span><span class="marker-number">${String(i+1).padStart(2,'0')}</span><small>${terms[i].longitude}°</small>`;
      button.setAttribute('aria-label',`${terms[i].name[lang]} · ${terms[i].longitude}°`);
      button.title=`${String(i+1).padStart(2,'0')} · ${terms[i].name[lang]} · ${terms[i].longitude}°`;
      button.classList.toggle('cardinal',terms[i].longitude%90===0);
    });
    this.earthLabel.innerHTML=lang==='zh'?'地球 <span>EARTH</span>':'EARTH';
    this.renderer.domElement.setAttribute('aria-label',lang==='zh'?'地球公转三维场景。左右方向键旋转视角，加减键缩放。':'3D Earth orbit. Use left and right arrows to rotate and plus or minus to zoom.');
    this.resize();
  }
  setHelpers(show:boolean) {this.helpers.visible=show;this.arrows.visible=show;this.host.parentElement?.classList.toggle('guides-off',!show);}
  setQuality(low:boolean) {this.low=low;this.renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.75));this.stars.visible=!low;this.resize();}
  view(kind:'default'|'overview'|'earth') {
    this.cameraMode=kind;
    this.focused=kind==='earth';
    this.host.parentElement?.classList.toggle('closeup',this.focused);
    if(this.focused) {
      const e=this.earth.position;this.controls.target.copy(e);
      const towardSun=e.clone().normalize().multiplyScalar(-1.7);
      const tangent=new THREE.Vector3(-towardSun.z,0,towardSun.x).normalize().multiplyScalar(1.5);
      this.camera.position.copy(e).add(towardSun).add(tangent).add(new THREE.Vector3(0,1.25,0));
    } else {
      this.controls.target.set(0,0,0);
      const fit=this.w<500&&this.lang==='en'?10.2:9.1;
      const distance=Math.max(25.6,fit/(Math.tan(20*Math.PI/180)*Math.max(this.camera.aspect,.5)));
      this.camera.position.set(0,kind==='overview'?distance:distance*.86,kind==='overview'?.01:distance*.51);
    }
    this.controls.update();
  }
  render(longitude:number,spin:number,id:number) {
    const next=this.vector(longitude,7);
    if(this.focused){const delta=next.clone().sub(this.lastPosition);this.camera.position.add(delta);this.controls.target.add(delta);}
    this.earth.position.copy(next);this.lastPosition.copy(next);this.globe.rotation.y=spin;this.cloud.rotation.y=spin*1.035;
    const position=this.ray.geometry.attributes.position as THREE.BufferAttribute;
    position.setXYZ(1,next.x,0,next.z);position.needsUpdate=true;
    if(id!==this.currentId){
      this.currentId=id;this.active.geometry.dispose();
      this.active.geometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:33},(_,i)=>this.vector(terms[id].longitude+i/32*15,7)));
      this.labels.forEach((b,i)=>{b.classList.toggle('selected',i===id);b.setAttribute('aria-pressed',String(i===id));});
    }
    this.controls.update();this.renderer.render(this.scene,this.camera);
    this.labels.forEach((button,i)=>{
      const mobileEnglish=this.w<500&&this.lang==='en';
      const labelRadius=mobileEnglish&&terms[i].longitude===270?10.4:mobileEnglish&&terms[i].longitude===90?9.4:8.05;
      const point=this.vector(terms[i].longitude,labelRadius).project(this.camera);
      button.style.left=`${(point.x*.5+.5)*this.w}px`;button.style.top=`${(-point.y*.5+.5)*this.h}px`;
      button.style.visibility=!this.focused&&Math.abs(point.x)<.98&&Math.abs(point.y)<.95&&point.z<1?'visible':'hidden';
    });
    const point=next.clone().add(new THREE.Vector3(0,.78,0)).project(this.camera);
    this.earthLabel.style.left=`${(point.x*.5+.5)*this.w}px`;this.earthLabel.style.top=`${(-point.y*.5+.5)*this.h}px`;
    this.earthLabel.style.visibility=this.focused||Math.abs(point.x)>.9||Math.abs(point.y)>.9?'hidden':'visible';
  }
  dispose() {
    this.disposed=true;this.observer.disconnect();this.controls.dispose();
    this.renderer.domElement.removeEventListener('keydown',this.keyHandler);this.renderer.domElement.removeEventListener('webglcontextlost',this.lossHandler);
    this.scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(material=>material.dispose());}});
    this.textures.forEach(texture=>texture.dispose());this.renderer.dispose();this.renderer.forceContextLoss();
    this.labels.forEach(label=>label.remove());this.earthLabel.remove();this.renderer.domElement.remove();
  }
}
