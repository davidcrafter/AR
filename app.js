/* ============================================================
   AR Drawing Pro — camera overlay + tracing + video recording
   ============================================================ */

(() => {
  'use strict';

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const startScreen  = $('start-screen');
  const startBtn     = $('start-btn');
  const stage        = $('stage');
  const cameraEl     = $('camera');
  const overlayImg   = $('overlay-img');
  const recIndicator = $('rec-indicator');
  const recTimeEl    = $('rec-time');
  const closeBtn     = $('close-btn');
  const flipCamBtn   = $('flip-cam-btn');
  const lockBtn      = $('lock-btn');
  const pickImageBtn = $('pick-image-btn');
  const opacitySlider= $('opacity-slider');
  const opacityValue = $('opacity-value');
  const flipHBtn     = $('flip-h-btn');
  const rotateBtn    = $('rotate-btn');
  const recordBtn    = $('record-btn');
  const resetBtn     = $('reset-btn');
  const gridBtn      = $('grid-btn');
  const gridOverlay  = $('grid-overlay');
  const imagePicker  = $('image-picker');
  const sampleGrid   = $('sample-grid');
  const fileInput    = $('file-input');
  const closePicker  = $('close-picker');
  const videoModal   = $('video-modal');
  const previewVideo = $('preview-video');
  const downloadLink = $('download-link');
  const discardBtn   = $('discard-btn');
  const toast        = $('toast');

  // ---------- State ----------
  const state = {
    stream: null,
    facing: 'environment', // "user" or "environment"
    locked: false,
    // Overlay transform (in stage CSS pixels, centered origin)
    tx: 0, ty: 0,
    scale: 1,
    rotation: 0, // degrees
    flipH: false,
    baseW: 0, baseH: 0, // natural size of image applied to CSS width
    opacity: 0.4,
    // Recording
    recording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordStart: 0,
    recordTimer: null,
    lastBlobUrl: null,
  };

  // ---------- Sample images (inline SVG data URLs) ----------
  const SAMPLES = [
    {
      name: 'Cat',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M60 60 L45 30 L70 55'/>
        <path d='M140 60 L155 30 L130 55'/>
        <ellipse cx='100' cy='105' rx='55' ry='50'/>
        <circle cx='82' cy='95' r='4' fill='black'/>
        <circle cx='118' cy='95' r='4' fill='black'/>
        <path d='M100 110 L95 118 L105 118 Z' fill='black'/>
        <path d='M100 118 Q90 130 80 122'/>
        <path d='M100 118 Q110 130 120 122'/>
        <path d='M70 100 L45 95 M70 105 L45 108 M70 110 L45 118'/>
        <path d='M130 100 L155 95 M130 105 L155 108 M130 110 L155 118'/>
      </svg>`
    },
    {
      name: 'Dog',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <ellipse cx='100' cy='110' rx='55' ry='52'/>
        <path d='M55 75 Q40 90 50 115 Q60 120 65 110'/>
        <path d='M145 75 Q160 90 150 115 Q140 120 135 110'/>
        <circle cx='85' cy='100' r='4' fill='black'/>
        <circle cx='115' cy='100' r='4' fill='black'/>
        <ellipse cx='100' cy='125' rx='8' ry='6' fill='black'/>
        <path d='M100 131 L100 140 M100 140 Q92 145 88 140 M100 140 Q108 145 112 140'/>
      </svg>`
    },
    {
      name: 'Rose',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <circle cx='100' cy='80' r='8'/>
        <path d='M100 72 Q88 74 88 84 Q88 94 100 96'/>
        <path d='M100 72 Q112 74 112 84 Q112 94 100 96'/>
        <path d='M85 82 Q75 76 72 90 Q75 100 90 96'/>
        <path d='M115 82 Q125 76 128 90 Q125 100 110 96'/>
        <path d='M78 92 Q65 94 68 108 Q80 112 92 102'/>
        <path d='M122 92 Q135 94 132 108 Q120 112 108 102'/>
        <path d='M100 100 L100 165'/>
        <path d='M100 130 Q80 115 70 130 Q80 140 100 135'/>
        <path d='M100 145 Q120 130 130 145 Q120 155 100 150'/>
      </svg>`
    },
    {
      name: 'Butterfly',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <line x1='100' y1='60' x2='100' y2='150'/>
        <path d='M100 70 Q60 40 40 70 Q30 100 70 110 Q95 105 100 90'/>
        <path d='M100 70 Q140 40 160 70 Q170 100 130 110 Q105 105 100 90'/>
        <path d='M100 100 Q65 105 55 130 Q65 155 100 135'/>
        <path d='M100 100 Q135 105 145 130 Q135 155 100 135'/>
        <circle cx='60' cy='80' r='4'/>
        <circle cx='140' cy='80' r='4'/>
        <path d='M100 60 L95 50 M100 60 L105 50'/>
      </svg>`
    },
    {
      name: 'Car',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M25 130 L40 100 Q45 90 55 90 L145 90 Q155 90 160 100 L175 130 L175 145 L25 145 Z'/>
        <path d='M55 90 L65 70 Q70 65 80 65 L120 65 Q130 65 135 70 L145 90'/>
        <line x1='100' y1='65' x2='100' y2='90'/>
        <circle cx='60' cy='150' r='14'/>
        <circle cx='140' cy='150' r='14'/>
      </svg>`
    },
    {
      name: 'Star',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <polygon points='100,25 122,80 180,85 135,120 150,178 100,145 50,178 65,120 20,85 78,80'/>
      </svg>`
    },
    {
      name: 'Anime eye',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M20 100 Q100 40 180 100 Q100 130 20 100 Z'/>
        <ellipse cx='100' cy='100' rx='32' ry='36'/>
        <circle cx='100' cy='100' r='14' fill='black'/>
        <circle cx='108' cy='92' r='5' fill='white'/>
        <path d='M25 95 L15 85 M40 80 L35 68 M60 72 L58 58 M100 60 L100 46 M140 72 L142 58 M160 80 L165 68 M175 95 L185 85'/>
      </svg>`
    },
    {
      name: 'Heart',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M100 165 L40 105 Q20 80 40 55 Q65 35 100 70 Q135 35 160 55 Q180 80 160 105 Z'/>
      </svg>`
    },
    {
      name: 'House',
      svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M30 100 L100 40 L170 100'/>
        <path d='M45 90 L45 165 L155 165 L155 90'/>
        <rect x='85' y='115' width='30' height='50'/>
        <rect x='55' y='105' width='20' height='20'/>
        <rect x='125' y='105' width='20' height='20'/>
        <path d='M135 60 L135 80 L150 80 L150 70'/>
      </svg>`
    },
  ];

  // ---------- Utilities ----------
  const svgToDataUrl = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  function showToast(msg, ms = 1800) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), ms);
  }

  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ---------- Sample thumbnails ----------
  function buildSampleGrid() {
    sampleGrid.innerHTML = '';
    SAMPLES.forEach((s) => {
      const div = document.createElement('div');
      div.className = 'sample-thumb';
      div.title = s.name;
      div.innerHTML = s.svg;
      div.addEventListener('click', () => {
        setOverlayImage(svgToDataUrl(s.svg));
        hidePicker();
      });
      sampleGrid.appendChild(div);
    });
  }

  // ---------- Overlay image ----------
  function setOverlayImage(src) {
    overlayImg.onload = () => {
      // Fit to a reasonable initial size (60% of the shorter viewport side)
      const shorter = Math.min(window.innerWidth, window.innerHeight);
      const target = shorter * 0.6;
      const nw = overlayImg.naturalWidth || 200;
      const nh = overlayImg.naturalHeight || 200;
      const ratio = nh / nw;
      state.baseW = target;
      state.baseH = target * ratio;
      overlayImg.style.width  = state.baseW + 'px';
      overlayImg.style.height = state.baseH + 'px';
      resetTransform();
      overlayImg.classList.remove('hidden-img');
      applyTransform();
    };
    overlayImg.onerror = () => showToast('Could not load image');
    overlayImg.src = src;
  }

  function resetTransform() {
    state.tx = 0; state.ty = 0;
    state.scale = 1; state.rotation = 0; state.flipH = false;
  }

  function applyTransform() {
    const sx = state.flipH ? -state.scale : state.scale;
    overlayImg.style.transform =
      `translate(-50%, -50%) translate(${state.tx}px, ${state.ty}px) ` +
      `rotate(${state.rotation}deg) scale(${sx}, ${state.scale})`;
    overlayImg.style.opacity = state.opacity;
  }

  // ---------- Gestures on the overlay image ----------
  const pointers = new Map();
  let gestureStart = null;

  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function angle(a, b)    { return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }

  overlayImg.addEventListener('pointerdown', (e) => {
    if (state.locked) return;
    overlayImg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      gestureStart = {
        kind: 'pan',
        startTx: state.tx, startTy: state.ty,
        px: e.clientX, py: e.clientY,
      };
    } else if (pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      gestureStart = {
        kind: 'pinch',
        startScale: state.scale,
        startRotation: state.rotation,
        startTx: state.tx, startTy: state.ty,
        startDist: distance(p1, p2),
        startAngle: angle(p1, p2),
        startCenter: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      };
    }
    e.preventDefault();
  });

  overlayImg.addEventListener('pointermove', (e) => {
    if (state.locked || !pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1 && gestureStart?.kind === 'pan') {
      state.tx = gestureStart.startTx + (e.clientX - gestureStart.px);
      state.ty = gestureStart.startTy + (e.clientY - gestureStart.py);
      applyTransform();
    } else if (pointers.size >= 2 && gestureStart?.kind === 'pinch') {
      const [p1, p2] = [...pointers.values()];
      const d = distance(p1, p2);
      const a = angle(p1, p2);
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const scaleFactor = d / gestureStart.startDist;
      state.scale    = Math.max(0.1, Math.min(10, gestureStart.startScale * scaleFactor));
      state.rotation = gestureStart.startRotation + (a - gestureStart.startAngle);
      state.tx = gestureStart.startTx + (center.x - gestureStart.startCenter.x);
      state.ty = gestureStart.startTy + (center.y - gestureStart.startCenter.y);
      applyTransform();
    }
  });

  const endPointer = (e) => {
    if (pointers.has(e.pointerId)) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) gestureStart = null;
    }
  };
  overlayImg.addEventListener('pointerup', endPointer);
  overlayImg.addEventListener('pointercancel', endPointer);
  overlayImg.addEventListener('pointerleave', endPointer);

  // Mouse wheel = scale on desktop
  overlayImg.addEventListener('wheel', (e) => {
    if (state.locked) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    state.scale = Math.max(0.1, Math.min(10, state.scale * (1 + delta)));
    applyTransform();
  }, { passive: false });

  // ---------- Camera ----------
  async function startCamera(facing = state.facing) {
    stopCamera();
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      cameraEl.srcObject = state.stream;
      // On some browsers we need to explicitly play
      await cameraEl.play().catch(() => {});
      state.facing = facing;
    } catch (err) {
      console.error(err);
      showToast('Camera access denied or unavailable');
      throw err;
    }
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
  }

  // ---------- Recording ----------
  // We record the RAW camera stream directly. The overlay stays on-screen as a
  // tracing guide but is NOT included in the recorded video — only what the
  // back camera sees (i.e. your paper and hand) is captured.
  function pickMimeType() {
    // Prefer MP4 on Safari/iOS, WebM elsewhere. First supported wins.
    const candidates = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    for (const t of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  }

  async function startRecording() {
    if (state.recording) return;
    if (!window.MediaRecorder) {
      showToast('Recording not supported in this browser');
      return;
    }
    if (!state.stream) {
      showToast('Camera is not ready yet');
      return;
    }

    // Feed the camera MediaStream straight into MediaRecorder.
    // The on-screen overlay is a DOM element on top of the video and never
    // touches the recorded pixels.
    const mime = pickMimeType();
    try {
      state.mediaRecorder = new MediaRecorder(state.stream,
        mime ? { mimeType: mime, videoBitsPerSecond: 6_000_000 } : undefined);
    } catch (err) {
      console.error(err);
      showToast('Could not start recorder');
      return;
    }

    state.recordedChunks = [];
    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) state.recordedChunks.push(e.data);
    };
    state.mediaRecorder.onstop = () => {
      const type = state.mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(state.recordedChunks, { type });
      openPreview(blob, type);
    };
    state.mediaRecorder.onerror = (e) => {
      console.error('Recorder error', e);
      showToast('Recorder error — stopping');
      stopRecording();
    };

    state.mediaRecorder.start(200);
    state.recording = true;
    state.recordStart = Date.now();
    recIndicator.classList.remove('hidden');
    recordBtn.classList.add('recording');
    recTimeEl.textContent = '00:00';
    state.recordTimer = setInterval(() => {
      recTimeEl.textContent = fmtTime(Date.now() - state.recordStart);
    }, 250);
    // Disable buttons that would kill the camera stream mid-recording
    flipCamBtn.disabled = true;
    closeBtn.disabled = true;
    showToast('Recording camera only — overlay is guide only');
  }

  function stopRecording() {
    if (!state.recording) return;
    state.recording = false;
    clearInterval(state.recordTimer);
    recIndicator.classList.add('hidden');
    recordBtn.classList.remove('recording');
    flipCamBtn.disabled = false;
    closeBtn.disabled = false;
    try { state.mediaRecorder.stop(); } catch (_) {}
  }

  function openPreview(blob, type) {
    if (state.lastBlobUrl) URL.revokeObjectURL(state.lastBlobUrl);
    const url = URL.createObjectURL(blob);
    state.lastBlobUrl = url;
    previewVideo.src = url;
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadLink.href = url;
    downloadLink.download = `ar-drawing-${ts}.${ext}`;
    videoModal.classList.remove('hidden');
  }

  function closePreview() {
    videoModal.classList.add('hidden');
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewVideo.load();
  }

  // ---------- UI wiring ----------
  startBtn.addEventListener('click', async () => {
    try {
      await startCamera('environment');
      startScreen.classList.add('hidden');
      stage.classList.remove('hidden');
      // Kick off picker on first launch
      showPicker();
    } catch (_) {}
  });

  closeBtn.addEventListener('click', () => {
    if (state.recording) stopRecording();
    stopCamera();
    stage.classList.add('hidden');
    startScreen.classList.remove('hidden');
  });

  flipCamBtn.addEventListener('click', async () => {
    const next = state.facing === 'environment' ? 'user' : 'environment';
    try { await startCamera(next); } catch (_) {}
  });

  lockBtn.addEventListener('click', () => {
    state.locked = !state.locked;
    lockBtn.textContent = state.locked ? '🔒' : '🔓';
    lockBtn.classList.toggle('active', state.locked);
    overlayImg.classList.toggle('locked', state.locked);
    showToast(state.locked ? 'Overlay locked — trace freely' : 'Overlay unlocked');
  });

  pickImageBtn.addEventListener('click', showPicker);
  closePicker.addEventListener('click', hidePicker);

  function showPicker() { imagePicker.classList.remove('hidden'); }
  function hidePicker() { imagePicker.classList.add('hidden'); }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOverlayImage(reader.result);
      hidePicker();
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  opacitySlider.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    state.opacity = v / 100;
    opacityValue.textContent = v + '%';
    applyTransform();
  });

  flipHBtn.addEventListener('click', () => { state.flipH = !state.flipH; applyTransform(); });
  rotateBtn.addEventListener('click', () => { state.rotation = (state.rotation + 90) % 360; applyTransform(); });
  resetBtn.addEventListener('click', () => { resetTransform(); applyTransform(); showToast('Overlay reset'); });
  gridBtn.addEventListener('click', () => {
    gridOverlay.classList.toggle('hidden');
    gridBtn.classList.toggle('active');
  });

  recordBtn.addEventListener('click', () => {
    if (state.recording) stopRecording();
    else startRecording();
  });

  discardBtn.addEventListener('click', () => {
    closePreview();
    if (state.lastBlobUrl) URL.revokeObjectURL(state.lastBlobUrl);
    state.lastBlobUrl = null;
    showToast('Recording discarded');
  });



  // Prevent iOS scroll bounce when interacting with stage
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // Warn if the browser lacks core APIs
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    startBtn.disabled = true;
    startBtn.textContent = 'Camera not supported';
  }

  // ---------- Init ----------
  buildSampleGrid();
})();
