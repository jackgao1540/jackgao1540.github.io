import * as THREE from './assets/vendor/three.module.js';
import { MOONS } from './moons.js';

export const MOON_DAYS_PER_SECOND = 1 / 8;
export const MOON_LAYOUT_VERSION = 'log-distance-75-rank-25-v1';
const TAU = Math.PI * 2;
const AXIS_X = new THREE.Vector3(1,0,0);
const AXIS_Y = new THREE.Vector3(0,1,0);
const AXIS_Z = new THREE.Vector3(0,0,1);

// This presentation compresses separation and enlarges small satellites while
// keeping semimajor-axis order and recognizable relative sizes within each host.
export function moonDisplayLayout(parent) {
  const moons=MOONS.filter(m=>m.parent===parent.id).sort((a,b)=>a.semiMajorAxisKm-b.semiMajorAxisKm);
  const layouts=moons.map((moon,index)=>{
    let radius=parent.radius*Math.max(.055,.1*Math.pow(moon.radiusKm/1000,.6));
    let orbit=parent.radius*(1.8+index*.45);
    if(parent.id==='earth'){radius=parent.radius*.273;orbit=parent.radius*2.8;}
    if(parent.id==='mars'){radius=parent.radius*(index===0?.125:.09);orbit=parent.radius*(1.8+index*.85);}
    if(parent.id==='jupiter')orbit=parent.radius*(1.82+index*.42);
    if(parent.id==='saturn')orbit=parent.radius*2.67+index*.54;
    if(parent.id==='uranus'){radius*=1.65;orbit=parent.radius*(1.85+index*.57);}
    if(parent.id==='neptune'){radius*=1.8;orbit=parent.radius*(1.85+index*1.3);}
    if(parent.id==='pluto'){radius=parent.radius*.52;orbit=parent.radius*3.05;}
    return {...moon,displayRadius:radius,displayOrbit:orbit,phase:moon.id==='charon'?4.1:moon.id==='titan'?3.9:(.6+index*2.23+parent.id.length*.41)%TAU,nodeDeg:(37+index*61+parent.id.length*19)%360};
  });
  if(layouts.length>2){
    const first=layouts[0],last=layouts.at(-1),min=first.displayOrbit,span=last.displayOrbit-min;
    const logSpan=Math.log(last.semiMajorAxisKm/first.semiMajorAxisKm);
    for(let i=1;i<layouts.length-1;i++){
      const measured=Math.log(layouts[i].semiMajorAxisKm/first.semiMajorAxisKm)/logSpan;
      const rank=i/(layouts.length-1);
      layouts[i].displayOrbit=min+span*(.75*measured+.25*rank);
    }
  }
  return layouts;
}

// The period is always positive. A full physical inclination >90° encodes
// retrograde motion; a negative direction must never also be applied to Triton.
export function moonPosition(moon,days,parentTilt=0,meanAnomalyOverride) {
  const mean=meanAnomalyOverride??moon.phase+days*TAU/moon.periodDays*(moon.direction??1);
  const e=moon.eccentricity||0;let E=mean;
  for(let n=0;n<6;n++)E-=(E-e*Math.sin(E)-mean)/(1-e*Math.cos(E));
  const r=moon.displayOrbit;
  const position=new THREE.Vector3(r*(Math.cos(E)-e),0,-r*Math.sqrt(1-e*e)*Math.sin(E));
  position.applyAxisAngle(AXIS_X,(moon.inclinationDeg||0)*Math.PI/180);
  position.applyAxisAngle(AXIS_Y,(moon.nodeDeg||0)*Math.PI/180);
  if(moon.referencePlane==='host-equator')position.applyAxisAngle(AXIS_Z,parentTilt);
  if(moon.referencePlane==='laplace'){
    // JPL's plane tilt and the local orbital inclination are separate rotations.
    // The illustrative ascending node is separate; no epoch orientation is claimed.
    position.applyAxisAngle(AXIS_X,(moon.planeTiltDeg||0)*Math.PI/180);
    position.applyAxisAngle(AXIS_Z,parentTilt);
  }
  return position;
}

function randomSource(id){let s=[...id].reduce((a,c)=>a+c.charCodeAt(0),921);return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const PALETTES={moon:'#aaa9a3',phobos:'#857465',deimos:'#a38f79',io:'#e7c76e',europa:'#ddd6ba',ganymede:'#aaa395',callisto:'#847e74',mimas:'#b8b9b7',enceladus:'#e4e8e4',tethys:'#ced0cc',dione:'#c1c6c7',rhea:'#c7c9c5',titan:'#c99347',iapetus:'#beb3a0',miranda:'#afb6b4',ariel:'#c2c7c6',umbriel:'#727775',titania:'#b2b6b2',oberon:'#a3a49d',proteus:'#858c88',triton:'#d3cac1',charon:'#aaa5a3'};

export function createMoonTexture(moon){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const c=canvas.getContext('2d'),w=512,h=256,r=randomSource(moon.id);
  c.fillStyle=PALETTES[moon.id]||'#b6b4aa';c.fillRect(0,0,w,h);
  // Irregular overlapping albedo terrains, rather than identical smooth beads.
  for(let i=0;i<520;i++){
    c.fillStyle=`rgba(${r()>.5?'241,235,214':'47,41,39'},${.015+r()*.08})`;
    c.beginPath();c.ellipse(r()*w,r()*h,2+r()*35,1+r()*17,r()*3,0,TAU);c.fill();
  }
  if(['moon','callisto','ganymede','charon','umbriel','oberon'].includes(moon.id)){
    for(let i=0;i<70;i++){const x=r()*w,y=r()*h,rad=2+r()*12;c.fillStyle='rgba(49,49,47,.13)';c.beginPath();c.ellipse(x,y,rad,rad*.68,0,0,TAU);c.fill();c.strokeStyle='rgba(238,234,217,.18)';c.lineWidth=.8;c.stroke();}
  }
  if(moon.id==='moon'){
    c.fillStyle='rgba(57,65,65,.34)';for(const [x,y,rx,ry] of [[133,100,45,27],[177,92,34,36],[194,147,22,18],[98,130,21,29]]){c.beginPath();c.ellipse(x,y,rx,ry,.3,0,TAU);c.fill();}
    c.strokeStyle='rgba(241,238,222,.24)';c.lineWidth=1;for(let i=0;i<15;i++){const a=i/15*TAU;c.beginPath();c.moveTo(284,178);c.lineTo(284+Math.cos(a)*43,178+Math.sin(a)*24);c.stroke();}
  }
  if(moon.id==='io'){
    for(let i=0;i<100;i++){c.fillStyle=i%3?'rgba(146,69,24,.35)':'rgba(40,37,24,.7)';c.beginPath();c.ellipse(r()*w,r()*h,1+r()*12,1+r()*5,r()*3,0,TAU);c.fill();}
  }
  if(['europa','enceladus','ariel','miranda','triton'].includes(moon.id)){
    c.lineWidth=moon.id==='europa'?1.15:.6;c.strokeStyle=moon.id==='europa'?'rgba(120,69,43,.49)':'rgba(87,120,130,.25)';
    for(let i=0;i<35;i++){const x=r()*w,y=r()*h;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+20,y-25,x+40,y+25,x+80+r()*70,y-10);c.stroke();}
  }
  if(moon.id==='titan'){
    for(let y=0;y<h;y++){c.fillStyle=`rgba(244,196,112,${.06+Math.sin(y*.05)*.04})`;c.fillRect(0,y,w,1);}
  }
  if(moon.id==='iapetus'){c.fillStyle='rgba(44,35,27,.75)';c.beginPath();c.ellipse(w*.7,h*.5,w*.3,h*.65,0,0,TAU);c.fill();}
  if(moon.id==='charon'){c.fillStyle='rgba(104,57,44,.62)';c.fillRect(0,0,w,42);c.fillStyle='rgba(213,212,204,.3)';c.fillRect(0,h*.55,w,h*.16);}
  if(moon.id==='mimas'){c.strokeStyle='rgba(61,65,64,.5)';c.lineWidth=4;c.beginPath();c.ellipse(w*.32,h*.48,28,23,0,0,TAU);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=2;return map;
}

export function createMoonSystems(planets){
  const systems=new Map(),pickables=[];
  for(const [id,parent] of planets){
    if(id==='sun')continue;
    const records=moonDisplayLayout({...parent.config,radius:parent.radius});
    const group=new THREE.Group();group.name=`${id}-satellites`;group.visible=false;
    parent.group.add(group);const bodies=[];
    for(const moon of records){
      const map=createMoonTexture(moon),mesh=new THREE.Mesh(new THREE.SphereGeometry(moon.displayRadius,32,24),new THREE.MeshStandardMaterial({map,roughness:.97,metalness:0}));
      mesh.userData.moon=moon;group.add(mesh);pickables.push(mesh);
      if(moon.id==='phobos'||moon.id==='deimos')mesh.scale.set(1.22,.84,.88);
      if(moon.id==='titan'){
        const haze=new THREE.Mesh(new THREE.SphereGeometry(moon.displayRadius*1.045,24,16),new THREE.MeshBasicMaterial({color:0xe4b367,transparent:true,opacity:.10,side:THREE.BackSide,depthWrite:false}));mesh.add(haze);
      }
      const points=[];for(let i=0;i<=128;i++)points.push(moonPosition(moon,0,parent.config.tilt,i/128*TAU));
      const track=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:moon.id==='titan'?0xc6aa71:0x8da9b1,transparent:true,opacity:.11,depthWrite:false}));group.add(track);
      bodies.push({moon,mesh,track});
    }
    const extent=records.reduce((max,m)=>Math.max(max,m.displayOrbit*(1+(m.eccentricity||0))+m.displayRadius),0);
    systems.set(id,{group,bodies,extent});
  }
  return {
    systems,pickables,
    extent(id){return systems.get(id)?.extent||0;},
    update(days,selected,transition){
      for(const [id,system] of systems){system.group.visible=id===selected&&transition>.15;
        if(!system.group.visible)continue;
        const parent=planets.get(id);
        for(const body of system.bodies){body.mesh.position.copy(moonPosition(body.moon,days,parent.config.tilt));body.mesh.rotation.y=Math.atan2(body.mesh.position.x,body.mesh.position.z)+Math.PI;}
      }
    },
    labels(camera,width,height){
      const labels=[],world=new THREE.Vector3(),projected=new THREE.Vector3();
      for(const [parent,system] of systems){if(!system.group.visible)continue;
        for(const {moon,mesh} of system.bodies){mesh.getWorldPosition(world);const distance=camera.position.distanceTo(world);projected.copy(world).project(camera);labels.push({id:moon.id,name:moon.name,parent,x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,radius:moon.displayRadius*height/(2*Math.tan(camera.fov*Math.PI/360)*distance),visible:projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1&&Math.abs(projected.y)<1});}
      }return labels;
    },
    hit(raycaster,selected){
      const system=systems.get(selected);if(!system?.group.visible)return null;
      const moon=raycaster.intersectObjects(system.bodies.map(b=>b.mesh),false)[0];if(!moon)return null;
      const parent=raycaster.intersectObject(planets.get(selected).mesh,false)[0];
      return parent&&parent.distance<moon.distance?null:moon.object.userData.moon;
    }
  };
}
