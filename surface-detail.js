// Seam-free, object-space detail resolves below the finite canvas albedo maps.
// Derivative filtering suppresses subpixel octaves, and overview fragments skip
// this work entirely. Existing albedo, palette, lighting and roughness are retained.
export function addSurfaceDetail(material, gas = false) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 surfacePoint;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsurfacePoint=position;');
    shader.fragmentShader = `varying vec3 surfacePoint;
      float detailHash(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
      float detailNoise(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(detailHash(i),detailHash(i+vec3(1,0,0)),f.x),mix(detailHash(i+vec3(0,1,0)),detailHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(detailHash(i+vec3(0,0,1)),detailHash(i+vec3(1,0,1)),f.x),mix(detailHash(i+vec3(0,1,1)),detailHash(i+vec3(1,1,1)),f.x),f.y),f.z)*2.-1.;
      }
      float detailOctave(vec3 p,float frequency,float footprint){return detailNoise(p*frequency)*(1.-smoothstep(.25,.75,frequency*footprint));}
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      vec3 detailPoint=normalize(surfacePoint);
      ${gas ? 'detailPoint.y*=4.;' : ''}
      float detailFootprint=max(length(dFdx(detailPoint)),length(dFdy(detailPoint)));
      float detailNear=1.-smoothstep(.001,.008,detailFootprint);
      if(detailNear>0.){
        float grain=.35*detailOctave(detailPoint,32.,detailFootprint)+.4*detailOctave(detailPoint,256.,detailFootprint)+.5*detailOctave(detailPoint,2048.,detailFootprint)+.65*detailOctave(detailPoint,16384.,detailFootprint)+detailOctave(detailPoint,131072.,detailFootprint);
        diffuseColor.rgb*=1.+clamp(grain,-.7,.7)*detailNear*${gas ? '.28' : '.45'};
      }
    `);
  };
  material.customProgramCacheKey = () => gas ? 'gas-surface-detail-v1' : 'rock-surface-detail-v1';
  return material;
}

export function createFallbackDetail(context) {
  const tile=document.createElement('canvas');tile.width=tile.height=256;
  const tileContext=tile.getContext('2d'),pixels=tileContext.createImageData(256,256);
  let seed=481;
  for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const value=80+(seed>>>24)*.38;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;}
  tileContext.putImageData(pixels,0,0);
  const pattern=context.createPattern(tile,'repeat');
  return function paintDetail({x,y,radius,shift,latitude,stretch,width,gas}) {
    if(!pattern||radius<width*.8)return;
    context.save();
    context.globalCompositeOperation='soft-light';context.globalAlpha=Math.min(gas ? .24 : .4,(radius/width-.8)*.035);
    context.translate(x-radius-shift,y-radius*stretch+latitude*radius*.35);
    context.scale(radius*2/16384,radius*2*stretch/8192);
    context.fillStyle=pattern;context.fillRect(0,0,32768,8192);
    context.restore();
  };
}
