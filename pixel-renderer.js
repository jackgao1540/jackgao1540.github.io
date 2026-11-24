// One logical pixel grid for the moving scene, photographed sky and birth burst.
// UI stays in the DOM at native resolution; devicePixelRatio never multiplies
// the scene's fill rate. CSS nearest-neighbor scaling supplies the pixel edges.
export function pixelSize(width, height) {
  const step = width <= 700 ? 3 : 4;
  return {width: Math.max(1, Math.ceil(width / step)), height: Math.max(1, Math.ceil(height / step))};
}

export function createPixelSky(canvas) {
  const host = canvas.parentElement;
  if (!host?.classList.contains('universe')) return {resize() {}, destroy() {}};
  const sky = document.createElement('canvas');
  sky.className = 'pixel-sky'; sky.setAttribute('aria-hidden', 'true');
  host.prepend(sky);
  const context = sky.getContext('2d'), image = new Image();
  let width = 1, height = 1, disposed = false;
  function draw() {
    if (disposed || !context || !image.naturalWidth) return;
    const size = pixelSize(width, height);
    sky.width = size.width; sky.height = size.height;
    // Match the original centered cover photograph, sampled onto our grid once.
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sw = width / scale, sh = height / scale;
    context.drawImage(image, (image.naturalWidth-sw)/2, (image.naturalHeight-sh)/2,
      sw, sh, 0, 0, sky.width, sky.height);
    // Slightly lift the dust lane and reduce the photo to stepped color blocks.
    // This runs only on image load/resize, never in the animation loop.
    const pixels=context.getImageData(0,0,sky.width,sky.height);
    for(let i=0;i<pixels.data.length;i+=4)for(let channel=0;channel<3;channel++){
      pixels.data[i+channel]=Math.round(Math.pow(pixels.data[i+channel]/255,.9)*255/8)*8;
    }
    context.putImageData(pixels,0,0);
    host.classList.add('has-pixel-sky');
  }
  image.onload = draw; image.src = './assets/space/sky.webp';
  return {
    resize(w, h) {width = w; height = h; draw();},
    destroy() {disposed = true; image.onload = null; sky.remove(); host.classList.remove('has-pixel-sky');}
  };
}

// Blend a narrow strip on each longitude edge before repeat filtering. Terrain
// features and random grain must join too, not only the gas-band phase.
export function sealLongitude(context,width,height,edgeWidth=16) {
  const pixels=context.getImageData(0,0,width,height),data=pixels.data;
  for(let y=0;y<height;y++)for(let x=0;x<edgeWidth;x++){
    const left=(y*width+x)*4,right=(y*width+width-1-x)*4,mix=(1-x/(edgeWidth-1))*.5;
    for(let channel=0;channel<3;channel++){
      const a=data[left+channel],b=data[right+channel];
      data[left+channel]=a*(1-mix)+b*mix;data[right+channel]=b*(1-mix)+a*mix;
    }
  }
  context.putImageData(pixels,0,0);
}
