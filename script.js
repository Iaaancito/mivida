(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $('audio'), playButton = $('playButton'), seekBar = $('seekBar');
  const currentTimeEl = $('currentTime'), durationEl = $('duration');
  const lyricLine = $('lyricLine'), lyricHint = $('lyricHint'), lyricKicker = $('lyricKicker');
  const audioBars = $('audioBars');
  let lyrics = [], activeIndex = -1, raf = null, audioContext = null, analyser = null, sourceNode = null, dataArray = null;
  let reducedMotion = false;

  const originalDemo = [
    {start:0,end:5,text:"Hay historias que comienzan con una mirada.",hint:"Todo empieza con algo pequeño."},
    {start:5,end:10,text:"Y personas que despiertan ganas de descubrir.",hint:"Sin prisa. Sin tener que fingir."},
    {start:10,end:15,text:"La noche guarda secretos que aún no conocemos.",hint:"Algunas cosas merecen tiempo."},
    {start:15,end:20,text:"Me gusta la idea de conocerte poco a poco.",hint:"Una frase original para esta experiencia."},
    {start:20,end:25,text:"Como una rosa que florece en la oscuridad.",hint:"La belleza también puede ser misteriosa."},
    {start:25,end:30,text:"Que lo bonito sea sincero, y que nos haga bien.",hint:"Sin promesas que pesen."},
    {start:30,end:35,text:"Quizá el destino solo nos haya presentado.",hint:"Lo demás todavía está por escribir."},
    {start:35,end:40,text:"Karen Nicol, esta noche tiene algo de ti.",hint:"Una dedicatoria hecha para ti."}
  ];
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (s) => { if(!Number.isFinite(s)) return "00:00"; s=Math.max(0,Math.floor(s)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  function setLyric(line, index) {
    if(!line) {
      lyricLine.classList.add('changing');
      window.setTimeout(() => { lyricLine.textContent = ""; lyricHint.textContent = "Deja que la música respire."; lyricLine.classList.remove('changing'); }, 280);
      lyricKicker.textContent = "UN INSTANTE ENTRE PALABRAS"; return;
    }
    if(index === activeIndex) return;
    activeIndex = index;
    lyricLine.classList.add('changing');
    window.setTimeout(() => {
      const words = escapeHTML(line.text).split(/\s+/);
      const midpoint = Math.max(1, Math.floor(words.length * .66));
      lyricLine.innerHTML = words.map((w,i) => i >= midpoint ? `<span class="glow">${w}</span>` : w).join(' ');
      lyricHint.textContent = line.hint || "Frase original de la experiencia";
      lyricKicker.textContent = "UNA DEDICATORIA EN MOVIMIENTO";
      lyricLine.classList.remove('changing');
    }, 260);
  }
  function syncLyrics() {
    if(!lyrics.length || !Number.isFinite(audio.currentTime)) return;
    const t = audio.currentTime;
    const idx = lyrics.findIndex(l => t >= Number(l.start) && t < Number(l.end));
    if(idx >= 0) setLyric(lyrics[idx], idx);
    else if(t >= (lyrics[lyrics.length-1]?.end || 0)) setLyric(null, -1);
    else if(idx < 0 && activeIndex !== -1) { activeIndex = -1; setLyric(null, -1); }
  }
  function loadDefaultLyrics() { lyrics = originalDemo; activeIndex = -1; syncLyrics(); }
  function initAudioAnalysis() {
    if(audioContext || !audio) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .8;
      sourceNode = audioContext.createMediaElementSource(audio); sourceNode.connect(analyser); analyser.connect(audioContext.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch(e) { /* El reproductor sigue funcionando sin visualizador reactivo. */ }
  }
  function animateAudio() {
    if(!audio.paused && analyser && dataArray && !reducedMotion) {
      analyser.getByteFrequencyData(dataArray);
      const bars = audioBars.children;
      for(let i=0;i<bars.length;i++){ const val=dataArray[(i*2)%dataArray.length]/255; bars[i].style.height=`${4+val*23}px`; bars[i].style.opacity=String(.35+val*.65); }
    }
    if(!audio.paused) raf = requestAnimationFrame(animateAudio);
  }
  async function togglePlay() {
    if(audio.paused) {
      initAudioAnalysis();
      try { if(audioContext?.state === 'suspended') await audioContext.resume(); await audio.play(); }
      catch(e) { console.error("No se pudo reproducir audio/join-me-in-death.mp3.", e); }
    } else audio.pause();
  }
  playButton.addEventListener('click', togglePlay);
  audio.addEventListener('play', () => { playButton.textContent='Ⅱ'; playButton.setAttribute('aria-label','Pausar canción'); audioBars.classList.add('playing'); cancelAnimationFrame(raf); animateAudio(); });
  audio.addEventListener('pause', () => { playButton.textContent='▶'; playButton.setAttribute('aria-label','Reproducir canción'); audioBars.classList.remove('playing'); cancelAnimationFrame(raf); });
  audio.addEventListener('loadedmetadata', () => { durationEl.textContent=fmt(audio.duration); seekBar.max=String(audio.duration || 100); });
  audio.addEventListener('timeupdate', () => { currentTimeEl.textContent=fmt(audio.currentTime); if(!seekBar.matches(':active')) seekBar.value=String(audio.currentTime); syncLyrics(); });
  ['seeking','seeked','play','pause','ended'].forEach(evt => audio.addEventListener(evt, syncLyrics));
  audio.addEventListener('ended', () => { setLyric(null,-1); audioBars.classList.remove('playing'); });
  audio.addEventListener('error', () => { console.error('No se pudo leer audio/join-me-in-death.mp3.', audio.error); });
  seekBar.addEventListener('input', () => { if(Number.isFinite(audio.duration)) audio.currentTime=Number(seekBar.value); syncLyrics(); });
  $('volumeBar').addEventListener('input', e => audio.volume=Number(e.target.value));
  $('enterButton').addEventListener('click', () => $('destino').scrollIntoView({behavior:reducedMotion?'auto':'smooth'}));
  $('roseButton').addEventListener('click', () => $('roseButton').classList.toggle('open'));
  $('roseReveal').addEventListener('click', () => { $('roseButton').classList.add('open'); $('hiddenMessage').classList.add('visible'); $('roseReveal').innerHTML='MENSAJE DESCUBIERTO <span>♥</span>'; });
  $('motionToggle').addEventListener('click', () => { reducedMotion=!reducedMotion; document.body.classList.toggle('reduced-motion',reducedMotion); $('motionToggle').textContent=reducedMotion?'◉':'◌'; $('motionToggle').title=reducedMotion?'Activar animaciones':'Reducir animaciones'; });
  $('replayButton').addEventListener('click', () => { audio.pause(); try{audio.currentTime=0;}catch(e){} activeIndex=-1; loadDefaultLyrics(); window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'}); });
  loadDefaultLyrics();

  // Partículas ligeras: se adaptan al tamaño de pantalla y respetan movimiento reducido.
  const canvas=$('particles'), ctx=canvas.getContext('2d'); let w=0,h=0,particles=[],mouse={x:-1000,y:-1000};
  function resize(){w=canvas.width=window.innerWidth*devicePixelRatio;h=canvas.height=window.innerHeight*devicePixelRatio;canvas.style.width=window.innerWidth+'px';canvas.style.height=window.innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);const count=window.innerWidth<600?28:58;particles=Array.from({length:count},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:.5+Math.random()*1.6,v:.12+Math.random()*.42,a:.12+Math.random()*.42,p:Math.random()*6.28}));}
  function drawParticles(){ctx.clearRect(0,0,window.innerWidth,window.innerHeight);for(const p of particles){p.y-=reducedMotion?0:p.v;p.p+=.01;let dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);if(d<100&&!reducedMotion){p.x+=dx/(d||1)*.65;p.y+=dy/(d||1)*.65;}if(p.y<-5){p.y=window.innerHeight+5;p.x=Math.random()*window.innerWidth;}ctx.beginPath();ctx.fillStyle=`rgba(190,42,68,${p.a*(.65+.35*Math.sin(p.p))})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}if(!reducedMotion)requestAnimationFrame(drawParticles);}
  window.addEventListener('resize',resize);window.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px');},{passive:true});
  resize();drawParticles();
})();