import * as THREE from './assets/vendor/three.module.js';

const TAU = Math.PI * 2;
const MOTION_RATE = 2; // Orbital and axial motion only; camera, gestures and twinkle keep their original timing.
const DESTINATIONS={mercury:'Posts',venus:'Favourite pictures',earth:'Diep Genie',mars:'Work experience',jupiter:'Starred projects',saturn:'Favourites',uranus:'About Uranus',neptune:'About Neptune',pluto:'About Pluto'};
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
// Shared by WebGL and 2D so momentum has identical navigation semantics.
export function createWheelNavigator({isActive,height,pick,selected,onEnter,onExit,onZoom,now=()=>performance.now()}) {
  const gesture={last:-Infinity,lastAction:-Infinity,action:false,total:0,direction:0,mode:null,candidate:null};
  return function wheel(event){
    if(!isActive())return;
    const raw=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height():1);
    if(!Number.isFinite(raw)||raw===0)return;
    event.preventDefault();
    const time=now(),delta=Math.max(-160,Math.min(160,raw)),direction=Math.sign(delta),focused=selected();
    if(time-gesture.last>240){gesture.action=false;gesture.total=0;gesture.direction=direction;gesture.mode=null;gesture.candidate=null;}
    gesture.last=time;
    if(direction!==gesture.direction){
      gesture.total=0;gesture.direction=direction;
      // A deliberate reverse away from an established close-up can return home.
      // The short guard rejects trackpad bounce immediately after entering it.
      if(focused&&delta>0&&time-gesture.lastAction>=650){gesture.action=false;gesture.mode='return';}
    }
    if(gesture.action||time-gesture.lastAction<650)return;
    if(!gesture.mode){
      const id=pick(event);
      gesture.mode=focused?(delta>0?'return':'zoom'):(delta<0&&id?'focus':'zoom');
      gesture.candidate=gesture.mode==='focus'?id:null;
    }
    gesture.total+=Math.abs(delta);
    if(gesture.mode==='return'&&focused&&delta>0){
      if(gesture.total>=28){gesture.action=true;gesture.lastAction=time;onExit();}return;
    }
    if(gesture.mode==='focus'&&!focused&&delta<0){
      if(gesture.total>=18){gesture.action=true;gesture.lastAction=time;onEnter(gesture.candidate);}return;
    }
    // A sky-started stream stays free zoom, even as a body passes under it.
    onZoom(delta);
  };
}
function seeded(seed=718) { return () => { seed = (seed*1664525 + 1013904223) >>> 0; return seed/4294967296; }; }
function canvasTexture(w,h,draw) {
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function glowTexture() {
  return canvasTexture(256,256,(c,w,h)=>{
    const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'rgba(255,244,196,1)');g.addColorStop(.12,'rgba(255,221,138,.8)');
    g.addColorStop(.3,'rgba(255,166,64,.24)');g.addColorStop(.65,'rgba(255,129,45,.06)');g.addColorStop(1,'rgba(255,99,20,0)');
    c.fillStyle=g;c.fillRect(0,0,w,h);
  });
}
function surfaceTexture(id) {
  const random=seeded(id.split('').reduce((n,c)=>n+c.charCodeAt(0),0));
  return canvasTexture(1024,512,(c,w,h)=>{
    const bases={mercury:'#807c77',venus:'#bd955a',earth:'#124f83',mars:'#a45435',jupiter:'#b69a7d',saturn:'#c8ad78',uranus:'#7cbac5',neptune:'#2859b0',pluto:'#b4a494',sun:'#ffb53e'};
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
        c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+30,y-9,x+70,y+9,x+120,y);c.stroke();
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
      const image=c.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,g=(Math.sin(x*2.1+Math.sin(y*.8))*Math.cos(y*1.8+Math.sin(x*.9))+random()-.5)*9;image.data[i]=250+g*.3;image.data[i+1]=194+g;image.data[i+2]=99+g*1.2;}c.putImageData(image,0,0);
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
        const wave=(Math.sin(x*.023+y*.017)*2.2+Math.sin(x*.061-y*.04)*1.1)*(id==='jupiter'?2:1);
        const sy=Math.max(0,Math.min(h-1,Math.round(y+wave))),a=(y*w+x)*4,b=(sy*w+x)*4;
        for(let k=0;k<3;k++)out.data[a+k]=source.data[b+k];out.data[a+3]=255;
      }c.putImageData(out,0,0);
    }
    // Fine-scale surface detail remains visible when a planet is approached.
    const pixels=c.getImageData(0,0,w,h);for(let i=0;i<pixels.data.length;i+=4){const grain=(random()-.5)*11;pixels.data[i]+=grain;pixels.data[i+1]+=grain;pixels.data[i+2]+=grain;}c.putImageData(pixels,0,0);
  });
}
function atmosphere(radius,color,intensity=.7) {
  const mat=new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{glowColor:{value:new THREE.Color(color)},intensity:{value:intensity}},
    vertexShader:`varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 n; varying vec3 v; uniform vec3 glowColor;uniform float intensity;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.5);gl_FragColor=vec4(glowColor,rim*intensity);}`});
  return new THREE.Mesh(new THREE.SphereGeometry(radius*1.018,48,32),mat);
}
function makeRing(inner,outer,seed=6) {
  const random=seeded(seed),geo=new THREE.RingGeometry(inner,outer,192,1);
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
  try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});} catch(error) {return createFallback(canvas,options);}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 700px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));renderer.setClearColor(0x020711,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.1,600);
  const system=new THREE.Group();system.position.x=-2;scene.add(system);
  scene.add(new THREE.AmbientLight(0x8c9eb2,.32));scene.add(new THREE.HemisphereLight(0xa5bdd0,0x28394b,.72));
  const sunlight=new THREE.PointLight(0xffe2aa,1400,0,2);sunlight.position.copy(system.position);scene.add(sunlight);
  // A faint cool environmental fill keeps the night hemispheres sculptural.
  const fill=new THREE.DirectionalLight(0x9bb9d6,.85);fill.position.set(10,16,30);scene.add(fill);
  const planets=new Map(),pickables=[],orbitLines=[];
  const sunMap=surfaceTexture('sun');
  const sun=new THREE.Mesh(new THREE.SphereGeometry(3.13,64,48),new THREE.ShaderMaterial({uniforms:{surface:{value:sunMap}},vertexShader:'varying vec2 vUv; varying vec3 n; varying vec3 v; void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform sampler2D surface;varying vec2 vUv;varying vec3 n;varying vec3 v;void main(){float limb=.63+.37*pow(max(0.,dot(normalize(n),normalize(v))),.45);vec3 color=texture2D(surface,vUv).rgb;gl_FragColor=vec4(color*limb*1.12,1.);}'}));sun.userData.id='sun';system.add(sun);pickables.push(sun);planets.set('sun',{mesh:sun,group:sun,radius:3.13,config:{id:'sun'}});
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:0xffa940,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(22,22,1);system.add(glow);
  const corona=atmosphere(3.13,0xffb45b,.44);system.add(corona);
  const sunHalo=new THREE.Mesh(new THREE.SphereGeometry(3.18,48,32),new THREE.MeshBasicMaterial({color:0xffc55b,transparent:true,opacity:.015,side:THREE.BackSide}));system.add(sunHalo);
  for(const p of PLANETS){
    const group=new THREE.Group();system.add(group);
    const axis=new THREE.Group();axis.rotation.z=p.tilt;group.add(axis);
    const texture=surfaceTexture(p.id);
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(p.radius,64,40),new THREE.MeshStandardMaterial({map:texture,roughness:p.id==='earth'?.78:.96,metalness:0}));
    mesh.userData.id=p.id;axis.add(mesh);pickables.push(mesh);
    if(p.id==='earth'){
      axis.add(atmosphere(p.radius,0x4ca5ff,.95));
      new THREE.TextureLoader().load('./assets/space/earth-nasa.webp',map=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mesh.material.map.dispose();mesh.material.map=map;mesh.material.needsUpdate=true;},undefined,()=>{});
      const clouds=canvasTexture(1024,512,(c,w,h)=>{const r=seeded(411);for(let i=0;i<170;i++){const x=r()*w,y=r()*h;c.fillStyle=`rgba(255,255,255,${r()*.16})`;c.beginPath();c.ellipse(x,y,r()*85+10,r()*6+2,-.2,0,TAU);c.fill();}});
      const cloudMesh=new THREE.Mesh(new THREE.SphereGeometry(p.radius*1.012,48,32),new THREE.MeshStandardMaterial({map:clouds,transparent:true,opacity:.55,depthWrite:false}));axis.add(cloudMesh);
    }
    if(['venus','uranus','neptune'].includes(p.id))axis.add(atmosphere(p.radius,p.color,.3));
    if(p.id==='saturn'){const rings=makeRing(p.radius*1.27,p.radius*2.4);rings.userData.id=p.id;axis.add(rings);pickables.push(rings);}
    if(p.id==='uranus'){const rings=makeRing(p.radius*1.5,p.radius*1.63,99);rings.material.opacity=.2;axis.add(rings);}
    planets.set(p.id,{mesh,group,axis,radius:p.radius,config:p});
    const points=[];for(let i=0;i<=240;i++){const a=i/240*TAU;points.push(orbitPosition(p,a));}
    const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x7ca2ba,transparent:true,opacity:.18,depthWrite:false}));system.add(orbit);orbitLines.push(orbit);
  }
  // Thousands of individually positioned main-belt rocks, between Mars and Jupiter.
  const rand=seeded(153),count=mobile?1250:2500;
  const rockGeo=new THREE.IcosahedronGeometry(1,0),rockMat=new THREE.MeshStandardMaterial({color:0x807d78,roughness:1});
  const belt=new THREE.InstancedMesh(rockGeo,rockMat,count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){const a=rand()*TAU,r=14.0+rand()*2.1;dummy.position.set(Math.cos(a)*r,(rand()-.5)*.55,Math.sin(a)*r);const s=.016+rand()*.045;dummy.scale.set(s,s*(.6+rand()),s);dummy.rotation.set(rand()*3,rand()*3,rand()*3);dummy.updateMatrix();belt.setMatrixAt(i,dummy.matrix);}system.add(belt);
  // A sparse depth star field gives parallax without competing with the sky photograph.
  const trailPositions=[];
  for(let i=0;i<140;i++){const a=rand()*TAU,r=32+rand()*75,x=Math.cos(a)*r,y=Math.sin(a)*r*.7;trailPositions.push(x,y,-40,x*1.11,y*1.11,-10);}
  const trails=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(trailPositions,3)),new THREE.LineBasicMaterial({color:0x8cbccc,transparent:true,opacity:reduced?0:.7,depthWrite:false}));scene.add(trails);
  const starCount=mobile?650:1500,starPositions=new Float32Array(starCount*3),starColors=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){const a=rand()*TAU,z=rand()*2-1,r=120+rand()*150,q=Math.sqrt(1-z*z);starPositions.set([Math.cos(a)*q*r,z*r,Math.sin(a)*q*r],i*3);const cool=rand();starColors.set([.65+cool*.35,.72+cool*.25,.85],i*3);}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));starGeo.setAttribute('color',new THREE.BufferAttribute(starColors,3));
  const starPhase=new Float32Array(starCount);for(let i=0;i<starCount;i++)starPhase[i]=rand()*TAU;
  starGeo.setAttribute('phase',new THREE.BufferAttribute(starPhase,1));
  const starMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{time:{value:0}},vertexShader:'attribute float phase;uniform float time;varying vec3 tint;varying float alpha;void main(){tint=color;alpha=.38+.22*sin(phase+time*(.7+phase*.08));vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=1.1+.8*abs(sin(phase));gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 tint;varying float alpha;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint,alpha*smoothstep(.5,.05,d));}'});
  const stars=new THREE.Points(starGeo,starMaterial);scene.add(stars);
  // Cassiopeia's restrained W: a real recognizable asterism, set apart from navigation.
  const asterismPoints=[[-36,40,-150],[-29,46,-150],[-22,39,-150],[-15,45,-150],[-8,41,-150]].map(v=>new THREE.Vector3(...v));
  const asterism=new THREE.Line(new THREE.BufferGeometry().setFromPoints(asterismPoints),new THREE.LineBasicMaterial({color:0x8ab6ca,transparent:true,opacity:.13,depthWrite:false}));
  camera.add(asterism);scene.add(camera);
  const asterismStars=new THREE.Points(new THREE.BufferGeometry().setFromPoints(asterismPoints),new THREE.PointsMaterial({color:0xb4d7dc,size:.24,transparent:true,opacity:.7,depthWrite:false}));camera.add(asterismStars);
  let onScreen=true,userYaw=0,userPitch=0,overviewZoom=1,focusZoom=1;
  let width=1,height=1,selected=null,hovered=null,paused=false,disposed=false,elapsed=0,frame=0,raf=0,last=performance.now(),introStart=last,intro=!reduced;
  let transition=1,transitionStart=last;
  const look=new THREE.Vector3(1,0,0),cameraStart=new THREE.Vector3(),lookStart=new THREE.Vector3();
  const overviewPos=new THREE.Vector3(),overviewLook=new THREE.Vector3();
  function size(){const bounds=canvas.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();const portrait=width/height<1.1;overviewPos.set(portrait?20:4,portrait?66:33,portrait?111:52);overviewLook.set(portrait?3:1,0,0);}
  size();const resizeObserver=new ResizeObserver(size);resizeObserver.observe(canvas);
  camera.position.copy(overviewPos).multiplyScalar(intro?1.38:1);camera.position.y*=intro?1.25:1;look.copy(overviewLook);
  const entryCard=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false}));entryCard.visible=false;entryCard.renderOrder=100;scene.add(entryCard);
  let cardId=null;
  function updateCard(){
    entryCard.visible=!!(selected&&DESTINATIONS[selected]&&transition>.98&&!intro);
    if(!entryCard.visible)return;
    if(cardId!==selected){
      cardId=selected;entryCard.material.map?.dispose();
      entryCard.material.map=canvasTexture(1024,224,(c,w,h)=>{
        c.fillStyle='rgba(4,16,25,.94)';c.beginPath();c.roundRect(6,6,w-12,h-12,5);c.fill();
        c.strokeStyle='rgba(185,205,192,.44)';c.lineWidth=1.2;c.stroke();
        c.textAlign='left';c.fillStyle='#9cc8ce';c.font='400 18px monospace';c.fillText(selected==='pluto'?'DWARF PLANET · DISCOVER PLUTO':DESTINATIONS[selected].startsWith('About ')?'PLANET · EXPLORE THE FACTS':'EXPLORE THIS WORLD',54,64);
        c.fillStyle='#f0f5ef';c.font='400 56px Georgia';c.fillText(DESTINATIONS[selected],54,146);
        c.font='400 55px system-ui';c.fillStyle='#bceee5';c.fillText('↗',w-105,141);
      });entryCard.material.needsUpdate=true;entryCard.userData.id=selected;entryCard.userData.entry=true;
    }
    planets.get(selected).group.getWorldPosition(world);
    const dist=camera.position.distanceTo(world),downVector=new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion);
    entryCard.position.copy(world).addScaledVector(downVector,dist*.245);
    const cardWidth=dist*(width<700?.32:.32);entryCard.scale.set(cardWidth,cardWidth*224/1024,1);
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),world=new THREE.Vector3(),projected=new THREE.Vector3();
  const cameraGoal=new THREE.Vector3(),lookGoal=new THREE.Vector3();
  function target(){
    if(selected&&planets.has(selected)){const p=planets.get(selected);p.group.getWorldPosition(lookGoal);const radius=selected==='saturn'?p.radius*2.45:p.radius;const dist=Math.max(5.7,radius*5.3);const sunward=selected==='sun'?new THREE.Vector3(.2,0,1):system.position.clone().sub(lookGoal).setY(0).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),.65);cameraGoal.copy(lookGoal).addScaledVector(sunward,dist*(width<700?1.15:1));cameraGoal.y+=dist*.34;}
    else {cameraGoal.copy(overviewPos);lookGoal.copy(overviewLook);}
    cameraGoal.sub(lookGoal).multiplyScalar(selected?focusZoom:overviewZoom).applyAxisAngle(new THREE.Vector3(0,1,0),userYaw);cameraGoal.y*=1+userPitch;cameraGoal.add(lookGoal);
  }
  function pick(event){
    const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    pointer.set(x/rect.width*2-1,-y/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    const active=selected&&transition>.5?pickables.filter(object=>object.userData.id===selected):pickables;
    const hit=raycaster.intersectObjects(entryCard.visible?[entryCard,...active]:active,false)[0];if(hit)return hit.object.userData.id;
    // A minimum CSS-pixel target keeps small Mercury and Pluto genuinely usable.
    let nearest=null,best=Infinity;
    for(const [id,body] of planets){if(!body.group.visible||(selected&&transition>.5&&id!==selected))continue;
      body.group.getWorldPosition(world);const distance=camera.position.distanceTo(world);projected.copy(world).project(camera);
      if(projected.z<-1||projected.z>1)continue;const px=(projected.x*.5+.5)*width,py=(-projected.y*.5+.5)*height;
      const radius=body.radius*height/(2*Math.tan(camera.fov*Math.PI/360)*distance),padding=Math.max(14,radius+5),d=Math.hypot(x-px,y-py);
      if(d<padding&&d/padding<best){nearest=id;best=d/padding;}
    }return nearest;
  }
  function move(event){if(down&&event.buttons===1){const dx=event.clientX-down.lastX,dy=event.clientY-down.lastY;down.lastX=event.clientX;down.lastY=event.clientY;if(Math.hypot(event.clientX-down.x,event.clientY-down.y)>7){down.dragged=true;userYaw-=dx*.004;userPitch=Math.max(-.65,Math.min(1.3,userPitch+dy*.005));canvas.style.cursor='grabbing';}return;}const id=pick(event);if(id!==hovered){hovered=id;canvas.style.cursor=id?'pointer':'grab';options.onHover?.(id);}}
  let down=null;
  function pointerdown(e){down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,dragged:false};}
  function click(e){if(down?.dragged){down=null;return;}down=null;const id=pick(e);if(id){raycaster.setFromCamera(pointer,camera);const hit=entryCard.visible&&raycaster.intersectObject(entryCard)[0];if(hit)options.onEnter?.(id);else options.onSelect?.(id);}}
  function leave(){hovered=null;options.onHover?.(null);}
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointerup',click);canvas.addEventListener('pointerleave',leave);
  function beginTransition(){trails.material.opacity=0;cameraStart.copy(camera.position);lookStart.copy(look);transition=0;transitionStart=performance.now();intro=false;}
  function focus(id){if(!planets.has(id))return;userYaw=0;userPitch=0;selected=id;focusZoom=1;beginTransition();}
  function overview(){userYaw=0;userPitch=0;selected=null;overviewZoom=1;beginTransition();}
  function skipIntro(){intro=false;beginTransition();}
  const wheel=createWheelNavigator({
    isActive:()=>!disposed&&onScreen&&!document.hidden&&width>1&&height>1,
    height:()=>height,pick,selected:()=>selected,
    onEnter:id=>{if(options.onSelect)options.onSelect(id);else focus(id);},
    onExit:()=>{if(options.onOverview)options.onOverview();else overview();},
    onZoom:delta=>{
      if(intro)skipIntro();const factor=Math.exp(delta*.0014);
      if(selected)focusZoom=Math.max(.67,Math.min(1.45,focusZoom*factor));
      else overviewZoom=Math.max(.66,Math.min(1.55,overviewZoom*factor));
    }
  });
  canvas.addEventListener('wheel',wheel,{passive:false});
  function visibility(){last=performance.now();if(!document.hidden&&!raf&&!disposed)raf=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',visibility);
  const intersectionObserver=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(onScreen)visibility();});intersectionObserver.observe(canvas);
  function tick(now){
    raf=0;if(disposed||document.hidden||!onScreen)return;
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!paused&&!reduced)elapsed+=dt;
    for(const p of PLANETS){const body=planets.get(p.id),a=p.phase+elapsed*.045*MOTION_RATE/p.period;body.group.position.copy(orbitPosition(p,a));if(!paused&&!reduced)body.mesh.rotation.y+=dt*MOTION_RATE*(p.id==='venus'?-.014:.035);}
    if(!paused&&!reduced){sun.rotation.y+=dt*.013*MOTION_RATE;belt.rotation.y+=dt*.002*MOTION_RATE;}
    starMaterial.uniforms.time.value=elapsed;asterismStars.material.opacity=.52+.12*Math.sin(elapsed*.8);
    target();
    if(intro){const t=Math.min(1,(now-introStart)/2300),e=1-Math.pow(1-t,3);camera.position.lerpVectors(new THREE.Vector3(27,8,31),overviewPos,e);look.lerpVectors(new THREE.Vector3(8,0,2),overviewLook,e);trails.material.opacity=.65*Math.pow(1-t,2);if(t===1)intro=false;}
    else if(transition<1){transition=Math.min(1,(now-transitionStart)/(reduced?1:1250));const e=transition*transition*(3-2*transition);camera.position.lerpVectors(cameraStart,cameraGoal,e);look.lerpVectors(lookStart,lookGoal,e);}
    else if(reduced){camera.position.copy(cameraGoal);look.copy(lookGoal);}
    else {camera.position.lerp(cameraGoal,1-Math.exp(-dt*5));look.lerp(lookGoal,1-Math.exp(-dt*7));}
    const contextAlpha=selected?Math.max(0,1-transition*2.1):1;
    for(const [id,body] of planets){
      const alpha=selected&&id!==selected?contextAlpha:1;body.group.visible=alpha>.01;
      body.group.traverse(object=>{if(!object.material)return;const mat=object.material;
        if(mat.userData.baseOpacity===undefined){mat.userData.baseOpacity=mat.opacity;mat.userData.baseTransparent=mat.transparent;}
        const transparent=alpha<1||mat.userData.baseTransparent;if(mat.transparent!==transparent){mat.transparent=transparent;mat.needsUpdate=true;}
        mat.opacity=mat.userData.baseOpacity*alpha;
      });
    }
    glow.visible=!selected||selected==='sun'||contextAlpha>.05;glow.material.opacity=selected&&selected!=='sun'?contextAlpha:1;
    corona.visible=sun.visible;sunHalo.visible=sun.visible;belt.visible=contextAlpha>.1;
    for(const orbit of orbitLines)orbit.material.opacity=.18*(selected?contextAlpha:1);
    camera.lookAt(look);updateCard();renderer.render(scene,camera);
    if(frame++%2===0){const labels=[];for(const [id,p] of planets){p.group.getWorldPosition(world);const distance=camera.position.distanceTo(world);projected.copy(world).project(camera);labels.push({id,x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,radius:p.radius*height/(2*Math.tan(camera.fov*Math.PI/360)*distance),visible:p.group.visible&&projected.z<1&&projected.z>-1&&Math.abs(projected.x)<1.1&&Math.abs(projected.y)<1.1});}options.onFrame?.({labels,focus:selected,paused,intro,transition,spatialLink:entryCard.visible});}
    raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);options.onReady?.({webgl:true});
  return {focus,overview,skipIntro,setPaused(value){paused=!!value;},destroy(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerdown',pointerdown);canvas.removeEventListener('pointerup',click);canvas.removeEventListener('pointerleave',leave);scene.traverse(obj=>{obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats){mat?.map?.dispose();mat?.dispose();}});renderer.dispose();}};
}

function createFallback(canvas,options) {
  // A matching, fully navigable orbital map when WebGL is unavailable.
  const c=canvas.getContext('2d');if(!c){options.onReady?.({webgl:false});return {focus(){},overview(){},skipIntro(){},setPaused(){},destroy(){}};}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected=null,points=[],zoom=1,paused=false,disposed=false,elapsed=0,last=performance.now(),raf=0,panX=0,panY=0,down=null;
  const maps=new Map(PLANETS.map(p=>[p.id,surfaceTexture(p.id).image]));
  function draw(){
    const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,1.5);if(r.width<1||r.height<1)return;
    const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
    c.setTransform(dpr,0,0,dpr,0,0);const w=r.width,h=r.height;c.clearRect(0,0,w,h);
    const scale=Math.min(w/100,h/68)/zoom,ox=w*.48+panX,oy=h*.52+panY;
    const screen=v=>({x:ox+v.x*scale,y:oy+(v.z*.42-v.y*.8-v.x*.14)*scale});
    const focusPlanet=PLANETS.find(p=>p.id===selected);points=[];
    if(!selected){
      const sunR=3.13*scale,g=c.createRadialGradient(ox,oy,0,ox,oy,sunR*3.6);g.addColorStop(0,'#fff0b0');g.addColorStop(.25,'#ffb94c');g.addColorStop(.32,'#ff9e32');g.addColorStop(1,'rgba(255,120,20,0)');c.fillStyle=g;c.beginPath();c.arc(ox,oy,sunR*3.6,0,TAU);c.fill();points.push({id:'sun',x:ox,y:oy,r:sunR});
    }
    for(const p of PLANETS){
      if(selected&&selected!==p.id)continue;
      if(!selected){c.strokeStyle=p.id==='pluto'?'rgba(196,191,173,.28)':'rgba(146,185,210,.2)';c.lineWidth=.7;c.beginPath();for(let i=0;i<=180;i++){const v=screen(orbitPosition(p,i/180*TAU));if(i)c.lineTo(v.x,v.y);else c.moveTo(v.x,v.y);}c.stroke();}
      const v=selected?{x:w*.5,y:h*.43}:screen(orbitPosition(p,p.phase+elapsed*.045*MOTION_RATE/p.period));
      const pr=selected?Math.min(w*.23,h*.15)/(zoom):Math.max(2.7,p.radius*scale),{x,y}=v;
      if(p.id==='saturn'){c.strokeStyle='#cbb88d';c.lineWidth=pr*.4;c.beginPath();c.ellipse(x,y,pr*2.2,pr*.6,-.4,0,TAU);c.stroke();}
      c.save();c.beginPath();c.arc(x,y,pr,0,TAU);c.clip();c.drawImage(maps.get(p.id),x-pr,y-pr,pr*2,pr*2);
      const shade=c.createLinearGradient(x-pr,y-pr,x+pr,y+pr);shade.addColorStop(0,'rgba(255,248,217,.08)');shade.addColorStop(.55,'rgba(0,7,16,.04)');shade.addColorStop(1,'rgba(0,7,16,.86)');c.fillStyle=shade;c.fillRect(x-pr,y-pr,pr*2,pr*2);c.restore();points.push({id:p.id,x,y,r:pr});
    }
    options.onFrame?.({labels:points.map(p=>({id:p.id,x:p.x,y:p.y,radius:p.r,visible:true})),focus:selected,paused,intro:false,transition:1,spatialLink:false});
  }
  const ro=new ResizeObserver(draw);ro.observe(canvas);
  function pick(e){const r=canvas.getBoundingClientRect();return points.map(p=>({...p,d:Math.hypot(e.clientX-r.left-p.x,e.clientY-r.top-p.y)})).filter(p=>p.d<Math.max(p.r+5,14)).sort((a,b)=>a.d-b.d)[0]?.id||null;}
  function click(e){if(down?.dragged){down=null;return;}down=null;const id=pick(e);if(id)options.onSelect?.(id);}
  function pointerdown(e){down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,dragged:false};}
  function move(e){if(down&&e.buttons===1&&!selected){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)down.dragged=true;if(down.dragged){panX+=e.clientX-down.lastX;panY+=e.clientY-down.lastY;draw();}down.lastX=e.clientX;down.lastY=e.clientY;return;}const id=pick(e);canvas.style.cursor=id?'pointer':'grab';options.onHover?.(id);}
  function focus(id){if(!PLANETS.some(p=>p.id===id))return;selected=id;zoom=1;draw();}
  function overview(){selected=null;zoom=1;panX=0;panY=0;draw();}
  const wheel=createWheelNavigator({
    isActive:()=>!disposed&&!document.hidden&&canvas.getBoundingClientRect().width>1&&canvas.getBoundingClientRect().height>1,
    height:()=>canvas.getBoundingClientRect().height,pick,selected:()=>selected,
    onEnter:id=>{if(options.onSelect)options.onSelect(id);else focus(id);},
    onExit:()=>{if(options.onOverview)options.onOverview();else overview();},
    onZoom:delta=>{zoom=Math.max(.66,Math.min(1.55,zoom*Math.exp(delta*.0014)));draw();}
  });
  function tick(now){if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden&&!paused&&!reduced){elapsed+=dt;draw();}raf=requestAnimationFrame(tick);}
  canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointerup',click);canvas.addEventListener('pointermove',move);canvas.addEventListener('wheel',wheel,{passive:false});draw();raf=requestAnimationFrame(tick);options.onReady?.({webgl:false});
  return {focus,overview,skipIntro(){},setPaused(value){paused=!!value;draw();},destroy(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener('pointerdown',pointerdown);canvas.removeEventListener('pointerup',click);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('wheel',wheel);}};
}
