// One media element survives every hash route. Audible autoplay is requested;
// browsers that require activation can resume it on the first trusted gesture.
const audio=document.getElementById('background-music');
const button=document.getElementById('sound-toggle');
const preferenceKey='orbit-soundtrack';
const gestures=['pointerdown','pointerup','touchend','keydown','wheel','click'];
let enabled=true,attempt=null,listening=false,unavailable=false;
try {enabled=localStorage.getItem(preferenceKey)!=='off';} catch {}
audio.volume=.45;

function update() {
  const playing=enabled&&!audio.paused&&!audio.muted&&!unavailable;
  button.textContent=playing?'Sound: on':'Sound: off';
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-label',unavailable?'Soundtrack unavailable':playing?'Turn soundtrack off':'Turn soundtrack on');
  button.disabled=unavailable;
}

function listen(value) {
  if(listening===value)return;
  listening=value;
  for(const type of gestures){
    if(value)window.addEventListener(type,resume,{capture:true,passive:true});
    else window.removeEventListener(type,resume,true);
  }
}

function requestPlay() {
  if(!enabled||unavailable||!audio.paused||attempt)return;
  const pending=audio.play();attempt=pending;
  pending.catch(()=>{
    // Autoplay denial and interrupted attempts are recoverable without alerts.
    if(enabled&&!unavailable)listen(true);
  }).finally(()=>{
    if(attempt===pending)attempt=null;
    update();
  });
}

function resume(event) {
  // The toggle owns its complete interaction: capture must not start playback
  // just before its click handler interprets that same click as an off request.
  if(!event.isTrusted||event.target?.closest?.('#sound-toggle'))return;
  if(event.type==='keydown'&&(event.repeat||event.ctrlKey||event.altKey||event.metaKey))return;
  requestPlay();
}

button.addEventListener('click',()=>{
  enabled=!enabled||audio.paused||audio.muted;
  try {localStorage.setItem(preferenceKey,enabled?'on':'off');} catch {}
  if(enabled){audio.muted=false;listen(true);requestPlay();}
  else {attempt=null;listen(false);audio.pause();}
  update();
});
audio.addEventListener('play',()=>{listen(false);update();});
audio.addEventListener('pause',()=>{if(enabled&&!unavailable)listen(true);update();});
audio.addEventListener('volumechange',update);
audio.addEventListener('error',()=>{unavailable=true;listen(false);update();});
window.addEventListener('pageshow',event=>{if(event.persisted&&enabled)requestPlay();});
update();
if(enabled){listen(true);requestPlay();}
