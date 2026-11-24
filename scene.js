import {addSurfaceDetail,createFallbackDetail} from './surface-detail.js';
import * as THREE from './assets/vendor/three.module.js';
import {bindOrbitGestures} from './controls.js';
import {pixelSize,createPixelSky,sealLongitude} from './pixel-renderer.js';
import {createMoonSystems,createMoonTexture,moonColor,moonDisplayLayout,moonPosition,MOON_DAYS_PER_SECOND} from './moon-renderer.js';

const TAU = Math.PI * 2;
const MOTION_RATE = 2; // Orbital and axial motion only; camera, gestures and twinkle keep their original timing.
// Radius and orbital distances are deliberately compressed for legibility.
// Periods preserve the real ratios, while a user-controlled clock advances them.
export const PLANETS = [
  { id:'mercury', eccentricity:.2056, inclination:7.0, radius:.39, orbit:5.3, period:.241, phase:2.30, color:'#a8a09a', tilt:.01 },
  { id:'venus', eccentricity:.0068, inclination:3.39, radius:.70, orbit:7.5, period:.615, phase:3.43, color:'#e0bc7e', tilt:3.09 },
  { id:'earth', eccentricity:.0167, inclination:0, radius:.76, orbit:10.0, period:1, phase:1.0, color:'#4c9fce', tilt:.409 },
  { id:'mars', eccentricity:.0934, inclination:1.85, radius:.52, orbit:12.4, period:1.881, phase:4.0, color:'#cc7753', tilt:.44 },
  { id:'jupiter', eccentricity:.0489, inclination:1.30, radius:1.90, orbit:18.1, period:11.86, phase:4.90, color:'#d9b89a', tilt:.054 },
  { id:'saturn', eccentricity:.0565, inclination:2.49, radius:1.63, orbit:24.8, period:29.46, phase:.64, color:'#e9cf99', tilt:.467 },
  { id:'uranus', eccentricity:.0457, inclination:.77, radius:1.06, orbit:30.5, period:84.01, phase:4.6, color:'#9ed5da', tilt:1.706 },
  { id:'neptune', eccentricity:.0113, inclination:1.77, radius:1.02, orbit:35.3, period:164.8, phase:5.42, color:'#476fd0', tilt:.494 },
  { id:'pluto', type:'dwarf planet', eccentricity:.2488, inclination:17.16, radius:.29, orbit:42, period:248, phase:5.9, color:'#cfbca7', tilt:2.13 },
];

function orbitPosition(p,meanAnomaly){
  // Kepler's equation gives genuine period ratios and variable orbital speed.
  let E=meanAnomaly;for(let n=0;n<5;n++)E-=(E-p.eccentricity*Math.sin(E)-meanAnomaly)/(1-p.eccentricity*Math.cos(E));
  const x=p.orbit*(Math.cos(E)-p.eccentricity),z=p.orbit*Math.sqrt(1-p.eccentricity*p.eccentricity)*Math.sin(E),inc=p.inclination*Math.PI/180;
  return new THREE.Vector3(x,z*Math.sin(inc),z*Math.cos(inc));
}
// Horizontal silhouette of a sphere in CSS pixels, including off-axis perspective.
export function projectedGlobeWidth(radius,x,depth,fov,height){
  if(depth<=radius)return Infinity;
  return radius*Math.sqrt(depth*depth+x*x-radius*radius)/(depth*depth-radius*radius)*height/Math.tan(fov*Math.PI/360);
}
let finePointerQuery;
const desktopPointer=()=>(finePointerQuery??=matchMedia('(pointer: fine)')).matches;
// A wheel stream may select an anchor and keep zooming without a gesture lockout.
export function createWheelNavigator({isActive,height,pick,selected,onEnter,onZoom}) {
  return function wheel(event){
    if(!isActive())return;
    const raw=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height():1);
    if(!Number.isFinite(raw)||raw===0)return;
    event.preventDefault();
    const delta=Math.max(-160,Math.min(160,raw));
    if(delta<0&&!selected()){const id=pick(event);if(id&&id!=='sun')onEnter(id);}
    onZoom(delta,event);
  };
}
function seeded(seed=718) { return () => { seed = (seed*1664525 + 1013904223) >>> 0; return seed/4294967296; }; }
function canvasTexture(w,h,draw) {
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=1;return t;
}
function glowTexture() {
  return canvasTexture(256,256,(c,w,h)=>{
    const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'rgba(255,249,215,1)');g.addColorStop(.12,'rgba(255,235,169,.8)');
    g.addColorStop(.3,'rgba(255,210,112,.24)');g.addColorStop(.65,'rgba(255,192,83,.06)');g.addColorStop(1,'rgba(255,179,66,0)');
    c.fillStyle=g;c.fillRect(0,0,w,h);
  });
}
function surfaceTexture(id) {
  const random=seeded(id.split('').reduce((n,c)=>n+c.charCodeAt(0),0));
  const texture=canvasTexture(1024,512,(c,w,h)=>{
    const bases={mercury:'#807c77',venus:'#bd955a',earth:'#124f83',mars:'#a45435',jupiter:'#b69a7d',saturn:'#c8ad78',uranus:'#7cbac5',neptune:'#2859b0',pluto:'#b4a494',sun:'#fcd882'};
    c.fillStyle=bases[id];c.fillRect(0,0,w,h);
    if(['jupiter','saturn','venus','uranus','neptune'].includes(id)) {
      for(let y=0;y<h;y++) {
        const band=Math.sin(y*.17)+.55*Math.sin(y*.05)+.25*Math.sin(y*.7);
        const tint=id==='jupiter'?26:id==='saturn'?17:id==='venus'?13:8;
        c.fillStyle=`rgba(${band>0?'255,236,196':'51,35,22'},${Math.abs(band)*tint/100})`;
        c.fillRect(0,y,w,1);
      }
      for(let n=0;n<600;n++) {
        const y=random()*h,x=random()*w;
        c.strokeStyle=`rgba(255,239,207,${random()*.08})`;c.lineWidth=random()*2;
        // Draw neighboring tiles too, so edge-crossing cloud wisps continue around longitude zero.
        for(const offset of [-w,0,w]){c.beginPath();c.moveTo(x+offset,y);c.bezierCurveTo(x+offset+30,y-9,x+offset+70,y+9,x+offset+120,y);c.stroke();}
      }
      if(id==='jupiter') {
        const x=w*.33,y=h*.64;
        for(let n=25;n>0;n--){const t=n/25;c.fillStyle=`rgb(${Math.round(154+t*57)},${Math.round(77+t*63)},${Math.round(54+t*40)})`;c.beginPath();c.ellipse(x,y,n*2.3,n*1.03,-.1+Math.sin(n*.4)*.1,0,TAU);c.fill();}c.strokeStyle='rgba(244,214,163,.7)';c.lineWidth=3;c.beginPath();c.ellipse(x,y,61,29,-.1,0,TAU);c.stroke();
      }
    } else if(id==='earth') {
      // Immediate procedural fallback while the local NASA Blue Marble map decodes.
      const land=[[[.05,.27],[.13,.17],[.25,.2],[.3,.32],[.24,.43],[.17,.42],[.16,.53],[.1,.42]],[[.25,.49],[.32,.53],[.34,.64],[.29,.81],[.26,.73],[.23,.58]],[[.46,.25],[.56,.19],[.67,.21],[.75,.14],[.9,.24],[.88,.4],[.76,.45],[.67,.4],[.6,.5],[.53,.41],[.46,.38]],[[.49,.4],[.6,.42],[.62,.57],[.56,.73],[.5,.66],[.46,.51]],[[.78,.67],[.86,.62],[.92,.68],[.91,.77],[.82,.78]]];
      c.fillStyle='#587348';for(const polygon of land){c.beginPath();polygon.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();c.fill();}
      c.fillStyle='#dae8de';c.fillRect(0,0,w,15);c.fillRect(0,h-24,w,24);
    } else if(id==='sun') {
      const image=c.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,g=(Math.sin(x*2.1+Math.sin(y*.8))*Math.cos(y*1.8+Math.sin(x*.9))+random()-.5)*9;image.data[i]=252+g*.3;image.data[i+1]=216+g;image.data[i+2]=130+g*1.2;}c.putImageData(image,0,0);
    } else {
      for(let n=0;n<3800;n++) {
        const x=random()*w,y=random()*h,r=random()*(id==='mercury'?11:18)+.5;
        c.fillStyle=`rgba(${random()>.5?'230,209,178':'46,27,18'},${random()*.21})`;c.beginPath();c.ellipse(x,y,r,r*.64,0,0,TAU);c.fill();
        if(id==='mercury'&&r>5){c.strokeStyle='rgba(225,220,203,.12)';c.lineWidth=1.4;c.stroke();}
      }
      if(id==='pluto'){
        // A subdued Tombaugh-Regio-like icy heart, deliberately illustrative.
        c.fillStyle='rgba(234,226,201,.88)';const x=w*.33,y=h*.52;
        c.beginPath();c.moveTo(x,y+58);c.bezierCurveTo(x-110,y-8,x-73,y-75,x-10,y-31);c.bezierCurveTo(x+61,y-85,x+116,y-16,x,y+58);c.fill();
      }
      if(id==='mars'){c.fillStyle='rgba(240,228,206,.78)';c.beginPath();c.ellipse(w*.5,5,130,14,0,0,TAU);c.fill();}
    }
    if(['jupiter','saturn','venus'].includes(id)){
      const source=c.getImageData(0,0,w,h),out=c.createImageData(w,h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        // Integer cycles around longitude keep displaced bands continuous across the UV seam.
        const u=x/w*TAU,wave=(Math.sin(u*4+y*.017)*2.2+Math.sin(u*10-y*.04)*1.1)*(id==='jupiter'?2:1);
        const sy=Math.max(0,Math.min(h-1,Math.round(y+wave))),a=(y*w+x)*4,b=(sy*w+x)*4;
        for(let k=0;k<3;k++)out.data[a+k]=source.data[b+k];out.data[a+3]=255;
      }c.putImageData(out,0,0);
    }
    // Fine-scale surface detail remains visible when a planet is approached.
    const pixels=c.getImageData(0,0,w,h);for(let i=0;i<pixels.data.length;i+=4){const grain=(random()-.5)*11;pixels.data[i]+=grain;pixels.data[i+1]+=grain;pixels.data[i+2]+=grain;}c.putImageData(pixels,0,0);
  });
  sealLongitude(texture.image.getContext('2d'),texture.image.width,texture.image.height);
  texture.wrapS=THREE.RepeatWrapping;
  return texture;
}
function atmosphere(radius,color,intensity=.7) {
  const mat=new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{glowColor:{value:new THREE.Color(color)},intensity:{value:intensity}},
    vertexShader:`varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 n; varying vec3 v; uniform vec3 glowColor;uniform float intensity;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.5);gl_FragColor=vec4(glowColor,rim*intensity);}`});
  return new THREE.Mesh(new THREE.SphereGeometry(radius*1.018,32,20),mat);
}
function makeRing(inner,outer,seed=6) {
  const random=seeded(seed),geo=new THREE.RingGeometry(inner,outer,96,1);
  const pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-inner)/(outer-inner),.5);}
  const map=canvasTexture(1024,4,(c,w,h)=>{
    for(let x=0;x<w;x++){const t=x/w;const cassini=t>.65&&t<.69;const alpha=cassini?.03:.32+random()*.55;const tone=Math.floor(145+Math.sin(t*26)*25+random()*45);c.fillStyle=`rgba(${tone+20},${tone+9},${tone-18},${alpha})`;c.fillRect(x,0,1,h);}
  });
  const ring=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map,transparent:true,side:THREE.DoubleSide,roughness:1,metalness:0,opacity:.94,depthWrite:false}));
  ring.rotation.x=Math.PI/2;return ring;
}

export function createSolarScene(canvas, options={}) {
  let renderer;
  try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});} catch(error) {return createFallback(canvas,options);}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 700px)').matches;
  renderer.setPixelRatio(1);renderer.setClearColor(0x020711,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
  const pixelSky=createPixelSky(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.005,600);
  const system=new THREE.Group();system.position.x=-2;scene.add(system);
  scene.add(new THREE.AmbientLight(0x8c9eb2,.32));scene.add(new THREE.HemisphereLight(0xa5bdd0,0x28394b,.72));
  const sunlight=new THREE.PointLight(0xffedbd,1600,0,2);sunlight.position.copy(system.position);scene.add(sunlight);
  // A faint cool environmental fill keeps the night hemispheres sculptural.
  const fill=new THREE.DirectionalLight(0xa8bfd6,.92);fill.position.set(10,16,30);scene.add(fill);
  const planets=new Map(),pickables=[],orbitLines=[];
  const sunMap=surfaceTexture('sun');
  const sun=new THREE.Mesh(new THREE.SphereGeometry(3.13,40,28),new THREE.ShaderMaterial({uniforms:{surface:{value:sunMap}},vertexShader:'varying vec2 vUv; varying vec3 n; varying vec3 v; void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform sampler2D surface;varying vec2 vUv;varying vec3 n;varying vec3 v;void main(){float limb=.63+.37*pow(max(0.,dot(normalize(n),normalize(v))),.45);vec3 color=texture2D(surface,vUv).rgb;gl_FragColor=vec4(color*limb*1.12,1.);}'}));sun.userData.id='sun';system.add(sun);pickables.push(sun);planets.set('sun',{mesh:sun,group:sun,radius:3.13,config:{id:'sun'}});
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:0xffdf91,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(22,22,1);system.add(glow);
  const corona=atmosphere(3.13,0xffe5a0,.44);system.add(corona);
  const sunHalo=new THREE.Mesh(new THREE.SphereGeometry(3.18,32,20),new THREE.MeshBasicMaterial({color:0xffe8ae,transparent:true,opacity:.015,side:THREE.BackSide}));system.add(sunHalo);
  for(const p of PLANETS){
    const group=new THREE.Group();system.add(group);
    const axis=new THREE.Group();axis.rotation.z=p.tilt;group.add(axis);
    const texture=surfaceTexture(p.id);
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(p.radius,40,28),addSurfaceDetail(new THREE.MeshStandardMaterial({map:texture,roughness:p.id==='earth'?.78:.96,metalness:0}),['venus','jupiter','saturn','uranus','neptune'].includes(p.id)));
    mesh.userData.id=p.id;axis.add(mesh);pickables.push(mesh);
    if(p.id==='earth'){
      axis.add(atmosphere(p.radius,0x4ca5ff,.95));
      new THREE.TextureLoader().load('./assets/space/earth-nasa.webp',map=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=1;map.wrapS=THREE.RepeatWrapping;mesh.material.map.dispose();mesh.material.map=map;mesh.material.needsUpdate=true;},undefined,()=>{});
      const clouds=canvasTexture(1024,512,(c,w,h)=>{const r=seeded(411);for(let i=0;i<170;i++){const x=r()*w,y=r()*h;c.fillStyle=`rgba(255,255,255,${r()*.16})`;c.beginPath();c.ellipse(x,y,r()*85+10,r()*6+2,-.2,0,TAU);c.fill();}});
      const cloudMesh=new THREE.Mesh(new THREE.SphereGeometry(p.radius*1.012,32,20),new THREE.MeshStandardMaterial({map:clouds,transparent:true,opacity:.55,depthWrite:false}));axis.add(cloudMesh);
    }
    if(['venus','uranus','neptune'].includes(p.id))axis.add(atmosphere(p.radius,p.color,.3));
    if(p.id==='saturn'){const rings=makeRing(p.radius*1.27,p.radius*2.4);rings.userData.id=p.id;axis.add(rings);pickables.push(rings);}
    if(p.id==='uranus'){const rings=makeRing(p.radius*1.5,p.radius*1.63,99);rings.material.opacity=.2;axis.add(rings);}
    planets.set(p.id,{mesh,group,axis,radius:p.radius,config:p});
    const points=[];for(let i=0;i<=240;i++){const a=i/240*TAU;points.push(orbitPosition(p,a));}
    const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x7ca2ba,transparent:true,opacity:.18,depthWrite:false}));system.add(orbit);orbitLines.push(orbit);
  }
  const satellites=createMoonSystems(planets);
  // Thousands of individually positioned main-belt rocks, between Mars and Jupiter.
  const rand=seeded(153),count=mobile?1250:2500;
  const rockGeo=new THREE.IcosahedronGeometry(1,0),rockMat=new THREE.MeshStandardMaterial({color:0x807d78,roughness:1});
  const belt=new THREE.InstancedMesh(rockGeo,rockMat,count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){const a=rand()*TAU,r=14.0+rand()*2.1;dummy.position.set(Math.cos(a)*r,(rand()-.5)*.55,Math.sin(a)*r);const s=.016+rand()*.045;dummy.scale.set(s,s*(.6+rand()),s);dummy.rotation.set(rand()*3,rand()*3,rand()*3);dummy.updateMatrix();belt.setMatrixAt(i,dummy.matrix);}system.add(belt);
  // A sparse depth star field gives parallax without competing with the sky photograph.
  const starCount=mobile?650:1500,starPositions=new Float32Array(starCount*3),starColors=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){const a=rand()*TAU,z=rand()*2-1,r=120+rand()*150,q=Math.sqrt(1-z*z);starPositions.set([Math.cos(a)*q*r,z*r,Math.sin(a)*q*r],i*3);const cool=rand();starColors.set([.65+cool*.35,.72+cool*.25,.85],i*3);}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));starGeo.setAttribute('color',new THREE.BufferAttribute(starColors,3));
  const starPhase=new Float32Array(starCount);for(let i=0;i<starCount;i++)starPhase[i]=rand()*TAU;
  starGeo.setAttribute('phase',new THREE.BufferAttribute(starPhase,1));
  const starMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{time:{value:0}},vertexShader:'attribute float phase;uniform float time;varying vec3 tint;varying float alpha;void main(){tint=color;alpha=.38+.22*sin(phase+time*(.7+phase*.08));vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=1.1+.8*abs(sin(phase));gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 tint;varying float alpha;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint,alpha*smoothstep(.5,.05,d));}'});
  const stars=new THREE.Points(starGeo,starMaterial);scene.add(stars);
  let onScreen=true,suspended=!!options.suspended,userYaw=0,userPitch=0,overviewZoom=1,focusZoom=1;
  let width=1,height=1,selected=null,hovered=null,paused=false,disposed=false,elapsed=0,frame=0,raf=0,last=performance.now(),introElapsed=0,intro=false,introRendered=false,introResolve=null;
  let transition=1,transitionStart=last,outwardArmed=false,freeViewAnchored=false;
  const look=new THREE.Vector3(1,0,0),cameraStart=new THREE.Vector3(),lookStart=new THREE.Vector3();
  const overviewPos=new THREE.Vector3(),overviewLook=new THREE.Vector3(),freeLook=new THREE.Vector3();
  function size(){const bounds=canvas.getBoundingClientRect();if(width!==Math.max(1,bounds.width)||height!==Math.max(1,bounds.height))outwardArmed=false;width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);const pixels=pixelSize(width,height);renderer.setSize(pixels.width,pixels.height,false);pixelSky.resize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();const portrait=width/height<1.1;overviewPos.set(portrait?20:4,portrait?66:33,portrait?111:52);overviewLook.set(portrait?3:1,0,0);if(!freeViewAnchored)freeLook.copy(overviewLook);}
  size();const resizeObserver=new ResizeObserver(size);resizeObserver.observe(canvas);
  camera.position.copy(overviewPos);look.copy(overviewLook);freeLook.copy(overviewLook);
  const introLook=new THREE.Vector3(),introOffset=new THREE.Vector3();
  function playIntro(){
    if(reduced){camera.position.copy(overviewPos);look.copy(overviewLook);return Promise.resolve();}
    introResolve?.();selected=null;transition=1;intro=true;introRendered=false;introElapsed=0;
    introLook.copy(system.position);introOffset.copy(overviewPos).sub(overviewLook).normalize().multiplyScalar(8.6);
    camera.position.copy(introLook).add(introOffset);look.copy(introLook);
    return new Promise(resolve=>{introResolve=resolve;});
  }
  let hoveredMoon=null;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),world=new THREE.Vector3(),projected=new THREE.Vector3();
  const cameraGoal=new THREE.Vector3(),lookGoal=new THREE.Vector3(),focusOffset=new THREE.Vector3(),trackedCenter=new THREE.Vector3();
  const surfaceRotation=new THREE.Quaternion(),surfaceStep=new THREE.Quaternion(),spinAxis=new THREE.Vector3();
  let focusBaseDistance=1,anchorTheta=0,anchorPhi=1,fovGoal=43,continuousSelection=false;
  let keepReleaseView=false;
  const minFocusDistance=()=>{const radius=planets.get(selected)?.radius||1;return radius*1.0025+.0001;};
  function framingDistance(p){
    const moonExtent=satellites.extent(p.config.id);
    return Math.max(p.radius*4.8,moonExtent/(Math.tan(43*Math.PI/360)*Math.min(1,camera.aspect)*.8));
  }
  function target(){
    let spherical;
    if(selected&&planets.has(selected)){
      const p=planets.get(selected);p.group.getWorldPosition(lookGoal);focusBaseDistance=framingDistance(p);
      const requested=focusBaseDistance*focusZoom,min=minFocusDistance();
      spherical=new THREE.Spherical(Math.max(min,requested),anchorPhi,anchorTheta);
      const optical=Math.min(1,Math.max(.06,requested/min));
      fovGoal=2*Math.atan(Math.tan(43*Math.PI/360)*optical)*180/Math.PI;
    }else{
      lookGoal.copy(freeLook);spherical=new THREE.Spherical().setFromVector3(overviewPos.clone().sub(overviewLook));
      spherical.radius*=overviewZoom;fovGoal=43;
    }
    spherical.theta+=userYaw;spherical.phi=Math.max(.08,Math.min(Math.PI-.08,spherical.phi+userPitch));
    cameraGoal.setFromSpherical(spherical);
    if(selected)cameraGoal.applyQuaternion(surfaceRotation);
    cameraGoal.add(lookGoal);
    const near=selected?Math.max(.00001,planets.get(selected).radius*.0001):.005;
    if(camera.near!==near){camera.near=near;camera.updateProjectionMatrix();}
  }
  function pick(event){
    const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    pointer.set(x/rect.width*2-1,-y/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    const active=pickables;
    const hit=raycaster.intersectObjects(active,false)[0];if(hit)return hit.object.userData.id;
    // A minimum CSS-pixel target keeps small Mercury and Pluto genuinely usable.
    let nearest=null,best=Infinity;
    for(const [id,body] of planets){if(!body.group.visible)continue;
      body.group.getWorldPosition(world);const distance=camera.position.distanceTo(world);projected.copy(world).project(camera);
      if(projected.z<-1||projected.z>1)continue;const px=(projected.x*.5+.5)*width,py=(-projected.y*.5+.5)*height;
      const radius=body.radius*height/(2*Math.tan(camera.fov*Math.PI/360)*distance),padding=Math.max(14,radius+5),d=Math.hypot(x-px,y-py);
      if(d<padding&&d/padding<best){nearest=id;best=d/padding;}
    }return nearest;
  }
  function move(event){const id=pick(event);const moon=satellites.hit(raycaster,selected);if(moon?.id!==hoveredMoon?.id){hoveredMoon=moon;options.onHoverMoon?.(moon);}if(moon){canvas.style.cursor='help';return;}if(id!==hovered){hovered=id;canvas.style.cursor=id&&id!==selected?'pointer':'grab';options.onHover?.(id===selected?null:id);}}
  function click(e){const id=pick(e);const moon=satellites.hit(raycaster,selected);if(moon){hoveredMoon=moon;options.onHoverMoon?.(moon);return;}if(id&&id!==selected)options.onSelect?.(id);}
  function leave(){hovered=null;hoveredMoon=null;options.onHover?.(null);options.onHoverMoon?.(null);}
  const inputActive=()=>!disposed&&!suspended&&!document.body.classList.contains('entering')&&!document.body.classList.contains('contents-open')&&!document.body.classList.contains('is-page');
  function approach(id){continuousSelection=true;try{if(options.onSelect)options.onSelect(id);else focus(id);}finally{continuousSelection=false;}}
  function releaseAnchor(keepView=false){
    keepReleaseView=keepView;continuousSelection=true;
    try{if(options.onOverview)options.onOverview();else overview();}finally{continuousSelection=false;keepReleaseView=false;}
  }
  function globeWidth(body){
    body.group.getWorldPosition(world);projected.copy(world).applyMatrix4(camera.matrixWorldInverse);
    return projectedGlobeWidth(body.radius,projected.x,-projected.z,camera.fov,height);
  }
  function releaseIfSmall(){
    if(!selected||!outwardArmed||!desktopPointer())return;
    const body=planets.get(selected),cutoff=width*.1;
    if(globeWidth(body)<cutoff){releaseAnchor(true);return;}
    const requested=Math.max(minFocusDistance(),focusBaseDistance*focusZoom);
    const targetWidth=projectedGlobeWidth(body.radius,0,requested,fovGoal,height);
    const settled=Math.abs(camera.position.distanceTo(trackedCenter)-requested)<requested*.00001&&Math.abs(camera.fov-fovGoal)<.001&&transition>=1;
    // A completed zoom above the cutoff must not arm an unrelated later resize.
    if(settled&&targetWidth>=cutoff)outwardArmed=false;
  }
  function zoomBy(delta,event){
    if(intro)skipIntro();
    if(delta<0)outwardArmed=false;
    if(!selected&&delta<0&&event){const id=pick(event);if(id&&id!=='sun')approach(id);}
    const factor=Math.exp(delta*.002);
    if(selected){
      if(delta>0)outwardArmed=desktopPointer();
      if(outwardArmed&&globeWidth(planets.get(selected))<width*.1){
        // Cancel a pending fly-in before releasing an already-small selection.
        const center=planets.get(selected).group.getWorldPosition(new THREE.Vector3());
        cameraGoal.copy(camera.position).sub(center).multiplyScalar(factor).add(center);
        releaseAnchor(true);return;
      }
      focusZoom=Math.max(minFocusDistance()/focusBaseDistance*.06,focusZoom*factor);
      const center=planets.get(selected).group.getWorldPosition(new THREE.Vector3());
      const outer=Math.max(overviewPos.distanceTo(center),focusBaseDistance*1.25);
      if(delta>0){target();if(desktopPointer())releaseIfSmall();else if(focusZoom*focusBaseDistance>outer)releaseAnchor();}
    }else overviewZoom=Math.max(freeViewAnchored ? .0001 : .12,Math.min(Math.max(4,overviewZoom),overviewZoom*factor));
  }
  function dragGain(){
    if(!selected)return 1;
    const radius=planets.get(selected).radius,distance=camera.position.distanceTo(trackedCenter),altitude=Math.max(.00001,distance-radius);
    const oldClearance=radius*.035+.008;
    const blend=1-THREE.MathUtils.smoothstep(altitude,radius*.01,oldClearance);
    const footprint=2*altitude/radius*Math.tan(camera.fov*Math.PI/360);
    const inspection=Math.min(1,footprint*2/(Math.max(width,height)*.008));
    return THREE.MathUtils.lerp(1,inspection,blend);
  }
  const unbindGestures=bindOrbitGestures({canvas,isActive:inputActive,onDrag:(dx,dy)=>{const gain=dragGain();userYaw-=dx*.008*gain;userPitch=Math.max(-1.5,Math.min(1.5,userPitch-dy*.006*gain));},onZoom:zoomBy,onTap:click,onHover:move,onLeave:leave});
  function beginTransition(){introResolve?.();introResolve=null;cameraStart.copy(camera.position);lookStart.copy(look);transition=0;transitionStart=performance.now();intro=false;}
  function focus(id){
    if(!planets.has(id))return;
    selected=id;outwardArmed=false;const p=planets.get(id);p.group.getWorldPosition(trackedCenter);
    const offset=new THREE.Spherical().setFromVector3(camera.position.clone().sub(trackedCenter));
    anchorTheta=offset.theta;anchorPhi=offset.phi;userYaw=0;userPitch=0;surfaceRotation.identity();
    focusBaseDistance=framingDistance(p);focusZoom=continuousSelection?offset.radius/focusBaseDistance:1;
    hoveredMoon=null;options.onHoverMoon?.(null);
    if(continuousSelection){intro=false;transition=1;}else beginTransition();
  }
  function overview(){
    selected=null;outwardArmed=false;hoveredMoon=null;options.onHoverMoon?.(null);
    if(continuousSelection){
      freeViewAnchored=keepReleaseView;freeLook.copy(keepReleaseView?look:overviewLook);
      const desired=new THREE.Spherical().setFromVector3(cameraGoal.clone().sub(freeLook));
      const base=new THREE.Spherical().setFromVector3(overviewPos.clone().sub(overviewLook));
      overviewZoom=desired.radius/base.radius;userYaw=desired.theta-base.theta;userPitch=desired.phi-base.phi;
      transition=1;intro=false;
    }else{freeViewAnchored=false;freeLook.copy(overviewLook);userYaw=0;userPitch=0;overviewZoom=1;beginTransition();}
  }
  function skipIntro(){intro=false;beginTransition();}
  const wheel=createWheelNavigator({
    isActive:()=>inputActive()&&onScreen&&!document.hidden&&width>1&&height>1,
    height:()=>height,pick,selected:()=>selected,onEnter:approach,onZoom:zoomBy
  });
  const wheelTarget=event=>{if(event.target===canvas||event.target.closest?.('.planet-popup'))wheel(event);};
  window.addEventListener('wheel',wheelTarget,{passive:false});
  function visibility(){last=performance.now();if(!suspended&&!document.hidden&&!raf&&!disposed)raf=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',visibility);
  const intersectionObserver=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(onScreen)visibility();});intersectionObserver.observe(canvas);
  function tick(now){
    raf=0;if(disposed||suspended||document.hidden||!onScreen)return;
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(intro&&introRendered)introElapsed+=dt*1000;
    if(!paused&&!reduced)elapsed+=dt;
    for(const p of PLANETS){const body=planets.get(p.id),a=p.phase+elapsed*.045*MOTION_RATE/p.period;body.group.position.copy(orbitPosition(p,a));if(!paused&&!reduced)body.mesh.rotation.y+=dt*MOTION_RATE*(p.id==='venus'?-.014:.035);}
    if(!paused&&!reduced){sun.rotation.y+=dt*.013*MOTION_RATE;belt.rotation.y+=dt*.002*MOTION_RATE;}
    satellites.update(elapsed*MOON_DAYS_PER_SECOND,selected,camera,height);
    starMaterial.uniforms.time.value=elapsed;
    surfaceStep.identity();
    if(selected&&!paused&&!reduced){
      const p=planets.get(selected),altitude=camera.position.distanceTo(trackedCenter)/p.radius-1;
      const follow=1-THREE.MathUtils.smoothstep(altitude,.025,.06);
      if(follow>0){
        spinAxis.set(-Math.sin(p.config.tilt||0),Math.cos(p.config.tilt||0),0);
        const spin=dt*MOTION_RATE*(selected==='venus'?-.014:.035)*follow;
        surfaceStep.setFromAxisAngle(spinAxis,spin);surfaceRotation.premultiply(surfaceStep).normalize();
      }
    }
    target();
    if(intro){const t=introRendered?Math.max(0,Math.min(1,(introElapsed-360)/2600)):0,e=1-Math.pow(1-t,4);look.lerpVectors(introLook,overviewLook,e);camera.position.copy(introLook).add(introOffset).lerp(overviewPos,e);if(t===1){intro=false;introResolve?.();introResolve=null;}}
    else if(transition<1){transition=Math.min(1,(now-transitionStart)/(reduced?1:1250));const e=transition*transition*(3-2*transition);camera.position.lerpVectors(cameraStart,cameraGoal,e);look.lerpVectors(lookStart,lookGoal,e);}
    else if(selected){focusOffset.copy(camera.position).sub(trackedCenter).applyQuaternion(surfaceStep);focusOffset.lerp(cameraGoal.clone().sub(lookGoal),reduced?1:1-Math.exp(-dt*12));focusOffset.setLength(Math.max(minFocusDistance(),focusOffset.length()));look.lerp(lookGoal,reduced?1:1-Math.exp(-dt*9));camera.position.copy(lookGoal).add(focusOffset);}
    else if(reduced){camera.position.copy(cameraGoal);look.copy(lookGoal);}
    else {camera.position.lerp(cameraGoal,1-Math.exp(-dt*5));look.lerp(lookGoal,1-Math.exp(-dt*7));}
    if(selected){focusOffset.copy(camera.position).sub(lookGoal);if(focusOffset.length()<minFocusDistance()){if(focusOffset.lengthSq()<1e-10)focusOffset.set(0,0,1);focusOffset.setLength(minFocusDistance());camera.position.copy(lookGoal).add(focusOffset);}if(focusOffset.length()<planets.get(selected).radius*3)look.copy(lookGoal);}
    if(selected)trackedCenter.copy(lookGoal);
    const nextFov=camera.fov+(fovGoal-camera.fov)*(reduced?1:1-Math.exp(-dt*12));
    if(Math.abs(nextFov-camera.fov)>.00001){camera.fov=nextFov;camera.updateProjectionMatrix();}
    // Selection changes the camera and popup, never the surrounding solar system.
    camera.lookAt(look);renderer.render(scene,camera);
    releaseIfSmall();
    // Count the close-up hold from its first finished render, including cold shader compilation.
    if(intro&&!introRendered){introRendered=true;introElapsed=0;last=performance.now();}
    if(frame++%2===0){
      const labels=[];
      for(const [id,p] of planets){
        p.group.getWorldPosition(world);
        const distance=camera.position.distanceTo(world),radius=p.radius*height/(2*Math.tan(camera.fov*Math.PI/360)*distance);
        projected.copy(world).project(camera);
        const x=(projected.x*.5+.5)*width,y=(-.5*projected.y+.5)*height;
        const intersectsViewport=x+radius>0&&x-radius<width&&y+radius>0&&y-radius<height;
        const visible=p.group.visible&&projected.z<1&&projected.z>-1&&intersectsViewport;
        labels.push({id,x,y,radius,visible,globeWidth:globeWidth(p)});
      }
      options.onFrame?.({labels,focus:selected,paused,intro,transition,moons:satellites.labels(camera,width,height)});
    }
    raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);options.onReady?.({webgl:true});
  return {focus,overview,skipIntro,playIntro,setSuspended(value){suspended=!!value;if(suspended){cancelAnimationFrame(raf);raf=0;}else visibility();},setPaused(value){paused=!!value;},destroy(){introResolve?.();disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();pixelSky.destroy();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('wheel',wheelTarget);unbindGestures();scene.traverse(obj=>{obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats){mat?.map?.dispose();mat?.dispose();}});renderer.dispose();}};
}

function createFallback(canvas,options) {
  // A matching, fully navigable orbital map when WebGL is unavailable.
  const c=canvas.getContext('2d');if(!c){options.onReady?.({webgl:false,available:false});return {focus(){},overview(){},skipIntro(){},playIntro(){return Promise.resolve();},setPaused(){},destroy(){}};}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pixelSky=createPixelSky(canvas),paintSurfaceDetail=createFallbackDetail(c);
  let selected=null,points=[],moonPoints=[],zoom=1,paused=false,suspended=!!options.suspended,disposed=false,elapsed=0,last=performance.now(),raf=0,panX=0,panY=0,userYaw=0,userPitch=0,introStart=null,introResolve=null;
  const viewLook=new THREE.Vector3(),worldTarget=new THREE.Vector3(),freeLook=new THREE.Vector3();
  let renderZoom=1,continuousSelection=false,outwardArmed=false,keepReleaseView=false,emittingFrame=false;
  let lastViewWidth=0,lastViewHeight=0;
  function playIntro(){
    if(reduced){overview();return Promise.resolve();}
    selected=null;zoom=.12;introStart=performance.now();
    return new Promise(resolve=>{introResolve=resolve;});
  }
  const maps=new Map(PLANETS.map(p=>[p.id,surfaceTexture(p.id).image]));
  const moonMaps=new Map();
  // Static Kepler paths are sampled once, then projected by the current view.
  const orbitSamples=new Map(PLANETS.map(p=>[p.id,Array.from({length:181},(_,i)=>orbitPosition(p,i/180*TAU))]));
  const moonLayouts=new Map(PLANETS.map(p=>[p.id,moonDisplayLayout(p)])),moonTracks=new Map();
  const beltRandom=seeded(153),beltSamples=Array.from({length:400},()=>{const angle=beltRandom()*TAU,r=14+beltRandom()*2.1;return {position:new THREE.Vector3(Math.cos(angle)*r,(beltRandom()-.5)*.55,Math.sin(angle)*r),radius:.016+beltRandom()*.045};});
  function draw(){
    if(disposed||suspended||document.hidden)return;
    const r=canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;
    if(r.width!==lastViewWidth||r.height!==lastViewHeight){outwardArmed=false;lastViewWidth=r.width;lastViewHeight=r.height;}
    const pixels=pixelSize(r.width,r.height),cw=pixels.width,ch=pixels.height;
    if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;pixelSky.resize(r.width,r.height);}
    c.setTransform(cw/r.width,0,0,ch/r.height,0,0);c.imageSmoothingEnabled=false;const w=r.width,h=r.height;c.clearRect(0,0,w,h);
    if(introStart!==null)renderZoom=zoom;else renderZoom+=(zoom-renderZoom)*(reduced?1:.22);
    if(selected){const p=PLANETS.find(p=>p.id===selected);worldTarget.copy(orbitPosition(p,p.phase+elapsed*.045*MOTION_RATE/p.period));}
    else worldTarget.copy(freeLook);
    viewLook.lerp(worldTarget,reduced||renderZoom<.08?1:.16);
    const scale=Math.min(w/100,h/68)/renderZoom,ox=w*.48+panX,oy=h*.52+panY;
    const elevation=Math.max(-1.45,Math.min(1.45,.5-userPitch)),yawCos=Math.cos(userYaw),yawSin=-Math.sin(userYaw),pitchSin=Math.sin(elevation),pitchCos=Math.cos(elevation);
    const rotate=v=>{const x=v.x*yawCos+v.z*yawSin,z=v.z*yawCos-v.x*yawSin;return {x,y:z*pitchSin-v.y*pitchCos-x*.14,z:z*pitchCos+v.y*pitchSin};};
    const screen=v=>{const q=rotate(v.clone().sub(viewLook));return {x:ox+q.x*scale,y:oy+q.y*scale,z:q.z};};
    points=[];moonPoints=[];
    const paint=[],onScreen=(x,y,r)=>x+r>0&&x-r<w&&y+r>0&&y-r<h;
    const beltAngle=elapsed*.002*MOTION_RATE,beltCos=Math.cos(beltAngle),beltSin=Math.sin(beltAngle),rockWorld=new THREE.Vector3();
    for(const rock of beltSamples){
      rockWorld.set(rock.position.x*beltCos+rock.position.z*beltSin,rock.position.y,rock.position.z*beltCos-rock.position.x*beltSin);
      const q=screen(rockWorld),radius=Math.max(.7,rock.radius*scale);
      if(onScreen(q.x,q.y,radius))paint.push({depth:q.z,draw(){c.fillStyle='#807d78';c.fillRect(q.x-radius,q.y-radius,radius*2,radius*2);}});
    }
    const sunPos=screen(new THREE.Vector3()),sunR=3.13*scale;
    points.push({id:'sun',x:sunPos.x,y:sunPos.y,r:sunR,depth:sunPos.z});
    if(onScreen(sunPos.x,sunPos.y,sunR*3.6))paint.push({depth:sunPos.z,draw(){
      const g=c.createRadialGradient(sunPos.x,sunPos.y,0,sunPos.x,sunPos.y,sunR*3.6);
      g.addColorStop(0,'#fff4c7');g.addColorStop(.25,'#ffde8c');g.addColorStop(.32,'#ffd36c');g.addColorStop(1,'rgba(255,183,66,0)');c.fillStyle=g;c.beginPath();c.arc(sunPos.x,sunPos.y,sunR*3.6,0,TAU);c.fill();
    }});
    function drawMoon(m){
      const pixelWidth=w/cw,pixelHeight=h/ch;
      if(m.radius<=(w<=700?1.5:2)){
        c.fillStyle=moonColor(m.moon.id);c.fillRect(Math.floor(m.x/pixelWidth)*pixelWidth,Math.floor(m.y/pixelHeight)*pixelHeight,pixelWidth,pixelHeight);return;
      }
      if(m.radius>=5&&!moonMaps.has(m.moon.id))moonMaps.set(m.moon.id,createMoonTexture(m.moon).image);
      c.save();c.beginPath();c.arc(m.x,m.y,m.radius,0,TAU);c.clip();
      if(moonMaps.has(m.moon.id))c.drawImage(moonMaps.get(m.moon.id),m.x-m.radius,m.y-m.radius,m.radius*2,m.radius*2);
      else{c.fillStyle=moonColor(m.moon.id);c.fillRect(m.x-m.radius,m.y-m.radius,m.radius*2,m.radius*2);}
      const shade=c.createLinearGradient(m.x-m.radius,m.y-m.radius,m.x+m.radius,m.y+m.radius);shade.addColorStop(0,'rgba(255,255,230,.04)');shade.addColorStop(1,'rgba(0,7,16,.7)');c.fillStyle=shade;c.fillRect(m.x-m.radius,m.y-m.radius,m.radius*2,m.radius*2);c.restore();
    }
    for(const p of PLANETS){
      c.strokeStyle=p.id==='pluto'?'rgba(196,191,173,.28)':'rgba(146,185,210,.2)';c.lineWidth=.7;c.beginPath();
      for(let i=0;i<=180;i++){const v=screen(orbitSamples.get(p.id)[i]);if(i)c.lineTo(v.x,v.y);else c.moveTo(v.x,v.y);}c.stroke();
      const parentWorld=orbitPosition(p,p.phase+elapsed*.045*MOTION_RATE/p.period),v=screen(parentWorld);
      const pr=Math.max(.4,p.radius*scale),{x,y}=v;
      points.push({id:p.id,x,y,r:pr,depth:v.z});
      for(const moon of moonLayouts.get(p.id)){
        if(p.id===selected||pr>24){
          if(!moonTracks.has(moon.id))moonTracks.set(moon.id,Array.from({length:97},(_,i)=>moonPosition(moon,0,p.tilt,i/96*TAU)));
          c.strokeStyle='rgba(150,183,190,.17)';c.lineWidth=.6;c.beginPath();
          for(let i=0;i<=96;i++){const q=screen(moonTracks.get(moon.id)[i].clone().add(parentWorld));if(i)c.lineTo(q.x,q.y);else c.moveTo(q.x,q.y);}c.stroke();
        }
        const q=screen(moonPosition(moon,elapsed*MOON_DAYS_PER_SECOND,p.tilt).add(parentWorld));
        const m={moon,x:q.x,y:q.y,radius:Math.max(w<=700?1.5:2,moon.displayRadius*scale),depth:q.z};moonPoints.push(m);
        if(onScreen(m.x,m.y,m.radius))paint.push({depth:m.depth,draw:()=>drawMoon(m)});
      }
      if(!onScreen(x,y,pr*(p.id==='saturn'?2.4:1)))continue;
      paint.push({depth:v.z,draw(){
        if(p.id==='saturn'){c.strokeStyle='#cbb88d';c.lineWidth=pr*.4;c.beginPath();c.ellipse(x,y,pr*2.2,pr*.6,-.4,0,TAU);c.stroke();}
        c.save();c.beginPath();c.arc(x,y,pr,0,TAU);c.clip();
        const map=maps.get(p.id),shift=((userYaw/TAU%1)+1)%1*pr*2,latitude=Math.sin(userPitch),stretch=1+Math.abs(latitude)*.5;
        // Longitude wraps; latitude crops toward a pole instead of joining north to south.
        for(let column=0;column<2;column++)c.drawImage(map,x-pr-shift+column*pr*2,y-pr*stretch+latitude*pr*.35,pr*2,pr*2*stretch);
        paintSurfaceDetail({x,y,radius:pr,shift,latitude,stretch,width:w,gas:['venus','jupiter','saturn','uranus','neptune'].includes(p.id)});
        const shade=c.createLinearGradient(x-pr,y-pr,x+pr,y+pr);shade.addColorStop(0,'rgba(255,248,217,.08)');shade.addColorStop(.55,'rgba(0,7,16,.04)');shade.addColorStop(1,'rgba(0,7,16,.86)');c.fillStyle=shade;c.fillRect(x-pr,y-pr,pr*2,pr*2);c.restore();
      }});
    }
    // One shared depth order lets neighboring worlds occlude each other naturally.
    paint.sort((a,b)=>a.depth-b.depth);for(const item of paint)item.draw();
    const moonVisible=m=>onScreen(m.x,m.y,m.radius)&&!points.some(p=>p.depth>m.depth&&Math.hypot(m.x-p.x,m.y-p.y)<Math.max(0,p.r-m.radius*.6));
    emittingFrame=true;
    releaseIfSmall(w);
    options.onFrame?.({labels:points.map(p=>({id:p.id,x:p.x,y:p.y,radius:p.r,globeWidth:p.r*2,visible:onScreen(p.x,p.y,p.r)})),focus:selected,paused,intro:introStart!==null,transition:1,moons:moonPoints.map(m=>({id:m.moon.id,name:m.moon.name,parent:m.moon.parent,x:m.x,y:m.y,radius:m.radius,visible:moonVisible(m)}))});
    emittingFrame=false;
  }
  const ro=new ResizeObserver(draw);ro.observe(canvas);
  function pick(e){
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const candidates=points.map(p=>({...p,d:Math.hypot(x-p.x,y-p.y)}));
    const disk=candidates.filter(p=>p.d<p.r).sort((a,b)=>b.depth-a.depth)[0];
    if(disk)return disk.id;
    const occluded=p=>points.some(other=>other.depth>p.depth&&Math.hypot(p.x-other.x,p.y-other.y)<Math.max(0,other.r-p.r));
    return candidates.filter(p=>p.d<Math.max(p.r+5,14)&&!occluded(p)).sort((a,b)=>a.d-b.d)[0]?.id||null;
  }
  function hitMoon(e){
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const hits=moonPoints.filter(m=>Math.hypot(x-m.x,y-m.y)<Math.max(3,m.radius)).sort((a,b)=>b.depth-a.depth);
    for(const moon of hits){if(!points.some(p=>p.depth>moon.depth&&Math.hypot(x-p.x,y-p.y)<p.r))return moon.moon;}
    return null;
  }
  function click(e){const moon=hitMoon(e);if(moon){options.onHoverMoon?.(moon);return;}const id=pick(e);if(id&&id!==selected)options.onSelect?.(id);}
  function move(e){const moon=hitMoon(e);options.onHoverMoon?.(moon);if(moon){canvas.style.cursor='help';return;}const id=pick(e);canvas.style.cursor=id&&id!==selected?'pointer':'grab';options.onHover?.(id===selected?null:id);}
  const inputActive=()=>!disposed&&!suspended&&!document.body.classList.contains('entering')&&!document.body.classList.contains('contents-open')&&!document.body.classList.contains('is-page');
  function approach(id){continuousSelection=true;try{if(options.onSelect)options.onSelect(id);else focus(id);}finally{continuousSelection=false;}}
  function releaseAnchor(keepView=false){
    keepReleaseView=keepView;continuousSelection=true;
    try{if(options.onOverview)options.onOverview();else overview();}finally{continuousSelection=false;keepReleaseView=false;}
  }
  function releaseIfSmall(width){
    const body=points.find(p=>p.id===selected);
    if(!body||!outwardArmed||!desktopPointer())return;
    if(body.r*2<width*.1){releaseAnchor(true);return;}
    const targetWidth=body.r*2*renderZoom/zoom;
    if(Math.abs(renderZoom-zoom)<zoom*.00001&&targetWidth>=width*.1)outwardArmed=false;
  }
  function zoomBy(delta,event){
    if(delta<0)outwardArmed=false;
    if(!selected&&delta<0&&event){const id=pick(event);if(id&&id!=='sun')approach(id);}
    const r=canvas.getBoundingClientRect(),base=Math.min(r.width/100,r.height/68),p=PLANETS.find(p=>p.id===selected);
    const minimum=p?p.radius*base/(Math.max(r.width,r.height)*32):.00001;
    const body=points.find(body=>body.id===selected);
    if(delta>0&&desktopPointer()&&body&&body.r*2<r.width*.1)zoom=Math.max(zoom,renderZoom);
    zoom=Math.max(minimum,Math.min(4,zoom*Math.exp(delta*.002)));
    if(selected&&delta>0){outwardArmed=desktopPointer();if(desktopPointer())releaseIfSmall(r.width);else if(zoom>1.1)releaseAnchor();}
    draw();
  }
  function dragGain(){
    const r=canvas.getBoundingClientRect(),p=PLANETS.find(p=>p.id===selected);
    const radius=p?p.radius*Math.min(r.width/100,r.height/68)/renderZoom:0,oldLimit=Math.max(r.width,r.height)*2;
    const blend=THREE.MathUtils.smoothstep(radius,oldLimit,oldLimit*2);
    const inspection=radius?Math.min(1,TAU/(radius*.008)):1;
    return THREE.MathUtils.lerp(1,inspection,blend);
  }
  const unbindGestures=bindOrbitGestures({canvas,isActive:inputActive,onDrag:(dx,dy)=>{
    const gain=dragGain();userYaw-=dx*.008*gain;userPitch=Math.max(-1.4,Math.min(1.4,userPitch-dy*.006*gain));
    options.onHoverMoon?.(null);draw();
  },onZoom:zoomBy,onTap:click,onHover:move,onLeave:()=>options.onHoverMoon?.(null)});
  function stopIntro(){introStart=null;introResolve?.();introResolve=null;}
  function focus(id){
    const p=PLANETS.find(p=>p.id===id);if(!p)return;stopIntro();selected=id;outwardArmed=false;options.onHoverMoon?.(null);
    if(!continuousSelection){const r=canvas.getBoundingClientRect();zoom=Math.min(zoom,Math.min(r.width/100,r.height/68)*p.radius/(Math.min(r.width,r.height)*.16));}
    draw();
  }
  function overview(){
    stopIntro();selected=null;outwardArmed=false;options.onHoverMoon?.(null);
    if(continuousSelection)freeLook.copy(keepReleaseView?viewLook:new THREE.Vector3());
    else{freeLook.set(0,0,0);zoom=1;userYaw=0;userPitch=0;panX=0;panY=0;}
    if(!emittingFrame)draw();
  }
  const wheel=createWheelNavigator({
    isActive:()=>inputActive()&&!document.hidden&&canvas.getBoundingClientRect().width>1&&canvas.getBoundingClientRect().height>1,
    height:()=>canvas.getBoundingClientRect().height,pick,selected:()=>selected,onEnter:approach,onZoom:zoomBy
  });
  function tick(now){raf=0;if(disposed||suspended)return;const dt=Math.min(.05,(now-last)/1000);last=now;let changed=false;if(!document.hidden&&introStart!==null){const t=Math.max(0,Math.min(1,(now-introStart-360)/2600)),e=1-Math.pow(1-t,4);zoom=.12+.88*e;panX=canvas.clientWidth*.02*(1-e);panY=-canvas.clientHeight*.02*(1-e);changed=true;if(t===1)stopIntro();}if(!document.hidden&&!paused&&!reduced){elapsed+=dt;changed=true;}if(changed)draw();raf=requestAnimationFrame(tick);}
  const wheelTarget=event=>{if(event.target===canvas||event.target.closest?.('.planet-popup'))wheel(event);};
  window.addEventListener('wheel',wheelTarget,{passive:false});draw();raf=requestAnimationFrame(tick);options.onReady?.({webgl:false});
  return {focus,overview,skipIntro:stopIntro,playIntro,setSuspended(value){suspended=!!value;if(suspended){cancelAnimationFrame(raf);raf=0;}else if(!raf){last=performance.now();draw();raf=requestAnimationFrame(tick);}},setPaused(value){paused=!!value;draw();},destroy(){stopIntro();disposed=true;cancelAnimationFrame(raf);ro.disconnect();pixelSky.destroy();unbindGestures();window.removeEventListener('wheel',wheelTarget);}};
}
