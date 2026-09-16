/* ============================================================
   AR Drawing Pro — main app logic
   Runs in browser (as PWA) and inside Capacitor (native iOS/Android).
   ============================================================ */

(() => {
  'use strict';

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const startScreen  = $('start-screen');
  const startBtn     = $('start-btn');
  const seeTutorial  = $('see-tutorial-btn');
  const installBtn   = $('install-app-btn');
  const footerNote   = $('footer-note');
  const installModal = $('install-modal');
  const closeInstall = $('close-install');
  const iosBody      = $('install-ios');
  const androidBody  = $('install-android');
  const desktopBody  = $('install-desktop');
  const androidInstallBtn = $('android-install-btn');
  const onboarding   = $('onboarding');
  const onbSlides    = $('onb-slides');
  const onbNext      = $('onb-next');
  const onbSkip      = $('onb-skip');
  const onbDots      = onboarding.querySelectorAll('.onb-dot');

  const stage        = $('stage');
  const cameraEl     = $('camera');
  const overlayImg   = $('overlay-img');
  const gridOverlay  = $('grid-overlay');
  const recIndicator = $('rec-indicator');
  const recTimeEl    = $('rec-time');

  const closeBtn     = $('close-btn');
  const flipCamBtn   = $('flip-cam-btn');
  const gridBtn      = $('grid-btn');
  const lockBtn      = $('lock-btn');
  const lockIcon     = $('lock-icon');
  const pickImageBtn = $('pick-image-btn');

  const opacitySlider= $('opacity-slider');
  const opacityValue = $('opacity-value');
  const flipHBtn     = $('flip-h-btn');
  const rotateBtn    = $('rotate-btn');
  const recordBtn    = $('record-btn');
  const resetBtn     = $('reset-btn');
  const sparklesBtn  = $('sparkles-btn');

  const imagePicker  = $('image-picker');
  const sampleGrid   = $('sample-grid');
  const categoryTabs = $('category-tabs');
  const fileInput    = $('file-input');
  const closePicker  = $('close-picker');

  const videoModal   = $('video-modal');
  const previewVideo = $('preview-video');
  const saveBtn      = $('save-btn');
  const shareBtn     = $('share-btn');
  const discardBtn   = $('discard-btn');
  const closePreview = $('close-preview');

  const toast        = $('toast');
  const countdown    = $('countdown');
  const countdownNum = $('countdown-num');

  // ---------- Capacitor detection ----------
  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const nativePlatform = isNative && window.Capacitor.getPlatform ? window.Capacitor.getPlatform() : 'web';

  // ---------- State ----------
  const state = {
    stream: null,
    facing: 'environment',
    locked: false,
    tx: 0, ty: 0, scale: 1, rotation: 0, flipH: false,
    baseW: 0, baseH: 0,
    opacity: 0.4,
    selectedSampleId: null,
    activeCategory: 'All',
    recording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordStart: 0,
    recordTimer: null,
    lastBlob: null,
    lastBlobUrl: null,
    lastBlobType: '',
  };

  // ---------- Utils ----------
  const svgToDataUrl = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function showToast(msg, kind, ms = 2000) {
    toast.textContent = msg;
    toast.classList.remove('hidden', 'success');
    if (kind === 'success') toast.classList.add('success');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), ms);
  }

  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  // Haptic feedback (native via Capacitor if available)
  async function haptic(style = 'light') {
    try {
      if (isNative && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        await window.Capacitor.Plugins.Haptics.impact({ style });
        return;
      }
      // Web fallback: vibration API
      if (navigator.vibrate) navigator.vibrate(style === 'heavy' ? 20 : 10);
    } catch (_) {}
  }

  // ---------- Onboarding ----------
  let onbIndex = 0;
  const hasSeenOnboarding = () => {
    try { return localStorage.getItem('ar-onboarded') === '1'; } catch (_) { return false; }
  };
  const markOnboarded = () => {
    try { localStorage.setItem('ar-onboarded', '1'); } catch (_) {}
  };

  function showOnboarding() {
    onboarding.classList.remove('hidden');
    onbIndex = 0;
    scrollToSlide(0);
  }
  function scrollToSlide(idx) {
    onbIndex = clamp(idx, 0, 2);
    onbSlides.scrollTo({ left: onbSlides.clientWidth * onbIndex, behavior: 'smooth' });
    onbDots.forEach((d, i) => d.classList.toggle('active', i === onbIndex));
    onbNext.innerHTML = onbIndex === 2
      ? `<svg class="icon"><use href="#i-camera"/></svg> Get Started`
      : `Next`;
  }
  onbNext.addEventListener('click', () => {
    haptic('light');
    if (onbIndex < 2) scrollToSlide(onbIndex + 1);
    else { markOnboarded(); onboarding.classList.add('hidden'); }
  });
  onbSkip.addEventListener('click', () => { markOnboarded(); onboarding.classList.add('hidden'); });
  onbSlides.addEventListener('scroll', () => {
    const idx = Math.round(onbSlides.scrollLeft / onbSlides.clientWidth);
    if (idx !== onbIndex) {
      onbIndex = idx;
      onbDots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  });
  seeTutorial.addEventListener('click', () => showOnboarding());

  // ---------- Image picker ----------
  function buildCategoryTabs() {
    const cats = ['All', ...new Set(window.AR_SAMPLES.map(s => s.category))];
    categoryTabs.innerHTML = '';
    cats.forEach(c => {
      const el = document.createElement('button');
      el.className = 'tab' + (c === state.activeCategory ? ' active' : '');
      el.textContent = c;
      el.addEventListener('click', () => {
        state.activeCategory = c;
        categoryTabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.textContent === c));
        renderSamples();
        haptic('light');
      });
      categoryTabs.appendChild(el);
    });
  }
  function renderSamples() {
    const filtered = state.activeCategory === 'All'
      ? window.AR_SAMPLES
      : window.AR_SAMPLES.filter(s => s.category === state.activeCategory);
    sampleGrid.innerHTML = '';
    filtered.forEach(s => {
      const div = document.createElement('div');
      div.className = 'sample-thumb' + (state.selectedSampleId === s.id ? ' selected' : '');
      div.innerHTML = s.svg + `<span class="sample-name">${s.name}</span>`;
      div.addEventListener('click', () => {
        state.selectedSampleId = s.id;
        setOverlayImage(svgToDataUrl(s.svg));
        haptic('medium');
        hidePicker();
      });
      sampleGrid.appendChild(div);
    });
  }
  function showPicker() { imagePicker.classList.remove('hidden'); }
  function hidePicker() { imagePicker.classList.add('hidden'); }

  // ---------- Overlay image ----------
  function setOverlayImage(src) {
    overlayImg.onload = () => {
      const shorter = Math.min(window.innerWidth, window.innerHeight);
      const target = shorter * 0.6;
      const nw = overlayImg.naturalWidth || 200;
      const nh = overlayImg.naturalHeight || 200;
      state.baseW = target;
      state.baseH = target * (nh / nw);
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
      `translate(-50%, -50%) translate(${state.tx}px, ${state.ty}px) rotate(${state.rotation}deg) scale(${sx}, ${state.scale})`;
    overlayImg.style.opacity = state.opacity;
  }

  // ---------- Gestures ----------
  const pointers = new Map();
  let gestureStart = null;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ang  = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

  overlayImg.addEventListener('pointerdown', (e) => {
    if (state.locked) return;
    overlayImg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      gestureStart = { kind: 'pan', startTx: state.tx, startTy: state.ty, px: e.clientX, py: e.clientY };
    } else if (pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      gestureStart = {
        kind: 'pinch',
        startScale: state.scale, startRotation: state.rotation,
        startTx: state.tx, startTy: state.ty,
        startDist: dist(p1, p2), startAngle: ang(p1, p2),
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
      const d = dist(p1, p2), a = ang(p1, p2);
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      state.scale    = clamp(gestureStart.startScale * (d / gestureStart.startDist), 0.1, 10);
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

  overlayImg.addEventListener('wheel', (e) => {
    if (state.locked) return;
    e.preventDefault();
    state.scale = clamp(state.scale * (1 + (-e.deltaY * 0.0015)), 0.1, 10);
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
      await cameraEl.play().catch(() => {});
      state.facing = facing;
    } catch (err) {
      console.error(err);
      showToast('Camera access denied or unavailable', null, 3000);
      throw err;
    }
  }
  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(t => t.stop());
      state.stream = null;
    }
  }

  // ---------- Recording ----------
  function pickMimeType() {
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

  function runCountdown(cb) {
    countdown.classList.remove('hidden');
    let n = 3;
    countdownNum.textContent = n;
    countdownNum.style.animation = 'none';
    // Trigger reflow to restart animation
    void countdownNum.offsetWidth;
    countdownNum.style.animation = '';
    haptic('medium');
    const tick = () => {
      n--;
      if (n <= 0) {
        countdown.classList.add('hidden');
        cb();
      } else {
        countdownNum.textContent = n;
        countdownNum.style.animation = 'none';
        void countdownNum.offsetWidth;
        countdownNum.style.animation = 'countdown-anim 1s ease-out forwards';
        haptic('medium');
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }

  async function startRecording() {
    if (state.recording) return;
    if (!window.MediaRecorder) { showToast('Recording not supported'); return; }
    if (!state.stream) { showToast('Camera is not ready'); return; }

    runCountdown(() => {
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
      state.mediaRecorder.onerror = () => stopRecording();

      state.mediaRecorder.start(500);
      state.recording = true;
      state.recordStart = Date.now();
      recIndicator.classList.remove('hidden');
      recordBtn.classList.add('recording');
      recTimeEl.textContent = '00:00';
      state.recordTimer = setInterval(() => {
        recTimeEl.textContent = fmtTime(Date.now() - state.recordStart);
      }, 250);
      flipCamBtn.disabled = true;
      closeBtn.disabled = true;
      haptic('heavy');
    });
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
    haptic('medium');
  }

  function openPreview(blob, type) {
    if (state.lastBlobUrl) URL.revokeObjectURL(state.lastBlobUrl);
    state.lastBlob = blob;
    state.lastBlobType = type;
    state.lastBlobUrl = URL.createObjectURL(blob);
    previewVideo.src = state.lastBlobUrl;
    videoModal.classList.remove('hidden');
  }
  function closePreviewFn() {
    videoModal.classList.add('hidden');
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewVideo.load();
  }

  // ---------- Save video ----------
  // On native: use Capacitor Filesystem to write to app cache, then Media plugin
  //   (if present) to save to the device Photos/Gallery.
  // On web: create a download link fallback.
  async function saveVideo() {
    if (!state.lastBlob) return;
    const type = state.lastBlobType || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `ar-drawing-${ts}.${ext}`;

    if (isNative) {
      try {
        const b64 = await blobToBase64(state.lastBlob);
        const P = window.Capacitor.Plugins;

        // Write file into the app's Documents/Cache folder
        if (P.Filesystem) {
          await P.Filesystem.writeFile({
            path: filename,
            data: b64,
            directory: 'CACHE',
            recursive: true,
          });
        }

        // Save to Photos / Gallery (community plugin — see README)
        if (P.Media && P.Media.savePhoto) {
          await P.Media.savePhoto({ path: filename });
          showToast('Saved to Photos', 'success');
          return;
        }
        if (P.Media && P.Media.saveVideo) {
          await P.Media.saveVideo({ path: filename });
          showToast('Saved to Gallery', 'success');
          return;
        }

        // Fallback: use Share sheet so user can pick "Save Video"
        if (P.Share) {
          const uri = await P.Filesystem.getUri({ path: filename, directory: 'CACHE' });
          await P.Share.share({
            title: 'AR Drawing',
            url: uri.uri,
            dialogTitle: 'Save your drawing video',
          });
          return;
        }

        showToast('Saved to app cache');
      } catch (err) {
        console.error('Native save failed', err);
        // Fall through to browser download
        browserDownload(filename);
      }
    } else {
      browserDownload(filename);
    }
  }

  function browserDownload(filename) {
    const a = document.createElement('a');
    a.href = state.lastBlobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Video downloaded', 'success');
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        // Strip the "data:...;base64," prefix
        const s = String(r.result);
        resolve(s.slice(s.indexOf(',') + 1));
      };
      r.readAsDataURL(blob);
    });
  }

  async function shareVideo() {
    if (!state.lastBlob) return;
    const type = state.lastBlobType || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const filename = `ar-drawing.${ext}`;
    const file = new File([state.lastBlob], filename, { type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My AR Drawing' });
        return;
      } catch (_) { /* user canceled */ }
    }
    // Fallback
    saveVideo();
  }

  // ---------- Wiring ----------
  startBtn.addEventListener('click', async () => {
    haptic('medium');
    try {
      await startCamera('environment');
      startScreen.classList.add('hidden');
      stage.classList.remove('hidden');
      if (!hasSeenOnboarding()) showOnboarding();
      if (!state.selectedSampleId) showPicker();
    } catch (_) {}
  });

  closeBtn.addEventListener('click', () => {
    haptic('light');
    if (state.recording) stopRecording();
    stopCamera();
    stage.classList.add('hidden');
    startScreen.classList.remove('hidden');
  });

  flipCamBtn.addEventListener('click', async () => {
    haptic('light');
    const next = state.facing === 'environment' ? 'user' : 'environment';
    try { await startCamera(next); } catch (_) {}
  });

  gridBtn.addEventListener('click', () => {
    haptic('light');
    gridOverlay.classList.toggle('hidden');
    gridBtn.classList.toggle('active');
  });

  lockBtn.addEventListener('click', () => {
    state.locked = !state.locked;
    lockBtn.classList.toggle('active', state.locked);
    overlayImg.classList.toggle('locked', state.locked);
    lockIcon.innerHTML = `<use href="#${state.locked ? 'i-lock' : 'i-lock-open'}"/>`;
    showToast(state.locked ? 'Overlay locked — trace freely ✏️' : 'Overlay unlocked');
    haptic('medium');
  });

  pickImageBtn.addEventListener('click', () => { haptic('light'); showPicker(); });
  closePicker.addEventListener('click', hidePicker);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.selectedSampleId = null;
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

  flipHBtn.addEventListener('click', () => { haptic('light'); state.flipH = !state.flipH; applyTransform(); });
  rotateBtn.addEventListener('click', () => { haptic('light'); state.rotation = (state.rotation + 90) % 360; applyTransform(); });
  resetBtn.addEventListener('click', () => { haptic('medium'); resetTransform(); applyTransform(); showToast('Overlay reset'); });
  sparklesBtn.addEventListener('click', () => {
    haptic('medium');
    // Pick a random sample as suggestion
    const s = window.AR_SAMPLES[Math.floor(Math.random() * window.AR_SAMPLES.length)];
    state.selectedSampleId = s.id;
    setOverlayImage(svgToDataUrl(s.svg));
    showToast(`✨ ${s.name}`);
  });

  recordBtn.addEventListener('click', () => {
    if (state.recording) stopRecording();
    else startRecording();
  });

  saveBtn.addEventListener('click', () => saveVideo());
  shareBtn.addEventListener('click', () => shareVideo());
  discardBtn.addEventListener('click', () => {
    closePreviewFn();
    if (state.lastBlobUrl) URL.revokeObjectURL(state.lastBlobUrl);
    state.lastBlob = null; state.lastBlobUrl = null; state.lastBlobType = '';
    showToast('Recording discarded');
    haptic('light');
  });
  closePreview.addEventListener('click', closePreviewFn);

  // Prevent iOS pinch-to-zoom of the whole page
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    startBtn.disabled = true;
    startBtn.innerHTML = 'Camera not supported';
  }

  // ---------- PWA install flow ----------
  //
  // Detect platform so we can show the right instructions. iOS never fires
  // beforeinstallprompt; the only way to install is Safari's Share sheet.
  // Android Chrome/Edge fire beforeinstallprompt; we capture it and show
  // an in-app "Install" button that calls prompt() directly.
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installBtn.classList.add('hidden');
    showToast('Installed! Launch from your home screen.', 'success', 3000);
  });

  // Always offer the Install button on iOS Safari (before install prompt is impossible)
  if (isIOS && !isStandalone) {
    installBtn.classList.remove('hidden');
  }
  // Hide it if we're already running installed
  if (isStandalone) {
    installBtn.classList.add('hidden');
    footerNote.textContent = 'Installed · Works offline';
    footerNote.classList.add('ready');
  }

  function openInstallSheet() {
    installModal.classList.remove('hidden');
    iosBody.classList.toggle('hidden',      !isIOS);
    androidBody.classList.toggle('hidden',   isIOS || !('ontouchstart' in window));
    desktopBody.classList.toggle('hidden',   isIOS || ('ontouchstart' in window));
    // Toggle the actual install button visibility
    androidInstallBtn.classList.toggle('hidden', !deferredInstallPrompt);
  }
  installBtn.addEventListener('click', () => { haptic('light'); openInstallSheet(); });
  closeInstall.addEventListener('click', () => installModal.classList.add('hidden'));
  androidInstallBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') installModal.classList.add('hidden');
    deferredInstallPrompt = null;
  });

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        // If the SW updates while the page is open, prompt to reload
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('New version available — tap to reload', null, 5000);
              toast.addEventListener('click', () => {
                nw.postMessage('skipWaiting');
                window.location.reload();
              }, { once: true });
            }
          });
        });
      }).catch((err) => console.warn('SW registration failed', err));
      // Show offline-ready indicator once SW controls the page
      navigator.serviceWorker.ready.then(() => {
        if (!isStandalone) {
          footerNote.textContent = 'Ready for offline · Camera permission required';
          footerNote.classList.add('ready');
        }
      });
    });
  }

  // ---------- Init ----------
  buildCategoryTabs();
  renderSamples();

  // Wait for Capacitor to be ready if native (for status bar hide, etc.)
  if (isNative) {
    document.addEventListener('deviceready', configureNative);
    // Also fire immediately in case event already dispatched
    setTimeout(configureNative, 100);
  }

  async function configureNative() {
    try {
      const P = window.Capacitor.Plugins;
      if (P.StatusBar) {
        await P.StatusBar.setStyle({ style: 'DARK' });
        await P.StatusBar.setOverlaysWebView({ overlay: true });
      }
      if (P.SplashScreen) {
        await P.SplashScreen.hide();
      }
    } catch (_) {}
  }
})();
