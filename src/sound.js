const INTERACTIVE = 'a[href], button, summary, [role="button"]';
const FRAME_INTERVAL = 1000 / 30;
const MAX_DPR = 1.75;

/** Opt-in UI sound and lightweight oscilloscope visuals. Returns a cleanup function. */
export function initSound({ button, canvases = [] } = {}) {
  const scopes = [...canvases].map(canvas => {
    const context = canvas?.getContext?.('2d');
    return context ? { canvas, context, width: 0, height: 0, visible: false, color: '#b8eece' } : null;
  }).filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let audioContext;
  let masterGain;
  let enabled = false;
  let enabling = false;
  let animationFrame = 0;
  let lastFrame = 0;
  let lastCue = -Infinity;
  let pulse = 0;
  let pulseStarted = 0;
  let disposed = false;
  let observer;
  const oscillators = new Set();

  const hasVisibleScope = () => scopes.some(scope => scope.visible && scope.width && scope.height);
  const shouldAnimate = () => enabled && !reducedMotion.matches && !document.hidden && hasVisibleScope();

  const drawScope = (scope, now) => {
    const { context: ctx, width, height } = scope;
    if (!width || !height) return;

    ctx.clearRect(0, 0, width, height);
    const mid = height / 2;
    const burst = enabled ? pulse * Math.exp(-(now - pulseStarted) / 300) : 0;
    const amplitude = Math.min(height * 0.32, height * (enabled ? 0.12 + burst * 0.16 : 0.025));
    const phase = enabled && !reducedMotion.matches ? now * 0.003 : 0;

    ctx.strokeStyle = scope.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = enabled ? 0.2 : 0.12;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();

    ctx.globalAlpha = enabled ? 0.9 : 0.5;
    ctx.lineWidth = enabled ? 1.6 : 1.2;
    ctx.beginPath();
    const step = Math.max(2, width / 160);
    for (let x = 0; x <= width + step; x += step) {
      const envelope = Math.pow(Math.sin(Math.PI * Math.min(1, x / width)), 2);
      const wave = Math.sin(x * 0.045 - phase) * 0.72
        + Math.sin(x * 0.099 + phase * 1.4) * 0.28;
      const y = mid + wave * amplitude * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(Math.min(x, width), y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const drawVisible = now => {
    scopes.forEach(scope => {
      if (scope.visible) drawScope(scope, now);
    });
  };

  const tick = now => {
    animationFrame = 0;
    if (!shouldAnimate()) return;
    if (now - lastFrame >= FRAME_INTERVAL) {
      drawVisible(now);
      lastFrame = now;
    }
    animationFrame = window.requestAnimationFrame(tick);
  };

  const refreshAnimation = () => {
    if (shouldAnimate()) {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
    } else {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (!document.hidden) drawVisible(performance.now());
    }
  };

  const resizeScope = scope => {
    const bounds = scope.canvas.getBoundingClientRect();
    const width = Math.max(0, bounds.width);
    const height = Math.max(0, bounds.height);
    const dpr = Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (scope.canvas.width !== pixelWidth || scope.canvas.height !== pixelHeight) {
      scope.canvas.width = pixelWidth;
      scope.canvas.height = pixelHeight;
      scope.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    scope.width = width;
    scope.height = height;
    scope.visible = bounds.bottom > 0 && bounds.top < window.innerHeight
      && bounds.right > 0 && bounds.left < window.innerWidth;
    const style = getComputedStyle(scope.canvas);
    scope.color = style.getPropertyValue('--scope-color').trim() || style.color || '#b8eece';
  };

  const resizeAll = () => {
    scopes.forEach(resizeScope);
    refreshAnimation();
  };

  const syncButton = () => {
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    button.classList.toggle('is-on', enabled);
  };

  const stopOscillators = () => {
    oscillators.forEach(oscillator => {
      try { oscillator.stop(); } catch { /* It may already have ended. */ }
    });
    oscillators.clear();
  };

  const playCue = kind => {
    if (!enabled || !audioContext || audioContext.state !== 'running') return;
    const now = performance.now();
    const minGap = kind === 'click' ? 65 : 150;
    if (now - lastCue < minGap) return;
    lastCue = now;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime;
    const duration = kind === 'click' ? 0.12 : 0.075;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'click' ? 390 : 620, start);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'click' ? 470 : 560, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(kind === 'click' ? 0.035 : 0.018, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.onended = () => {
      oscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillators.add(oscillator);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);

    pulse = kind === 'click' ? 1 : 0.6;
    pulseStarted = now;
    if (reducedMotion.matches) drawVisible(now);
  };

  const toggleSound = async () => {
    if (disposed || enabling) return;
    if (enabled) {
      enabled = false;
      if (masterGain) masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      stopOscillators();
      audioContext?.suspend().catch(() => {});
      syncButton();
      refreshAnimation();
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    enabling = true;
    try {
      if (!audioContext) {
        audioContext = new AudioContextClass();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(audioContext.destination);
      }
      await audioContext.resume();
      if (disposed) return;
      masterGain.gain.setValueAtTime(1, audioContext.currentTime);
      enabled = true;
      syncButton();
      refreshAnimation();
      playCue('click');
    } catch {
      enabled = false;
      syncButton();
    } finally {
      enabling = false;
    }
  };

  const interactiveFrom = target => target instanceof Element ? target.closest(INTERACTIVE) : null;
  const canCue = element => element && element !== button
    && !element.matches(':disabled, [aria-disabled="true"]');

  const onPointerOver = event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const element = interactiveFrom(event.target);
    if (!canCue(element) || element.contains(event.relatedTarget)) return;
    playCue('hover');
  };
  const onFocusIn = event => {
    if (canCue(interactiveFrom(event.target))) playCue('hover');
  };
  const onClick = event => {
    if (canCue(interactiveFrom(event.target))) playCue('click');
  };

  syncButton();
  resizeAll();
  button?.addEventListener('click', toggleSound);
  document.addEventListener('pointerover', onPointerOver, { passive: true });
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', refreshAnimation);
  window.addEventListener('resize', resizeAll);
  reducedMotion.addEventListener('change', refreshAnimation);

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const scope = scopes.find(item => item.canvas === entry.target);
        if (scope) scope.visible = entry.isIntersecting;
      });
      refreshAnimation();
    });
    scopes.forEach(scope => observer.observe(scope.canvas));
  } else {
    window.addEventListener('scroll', resizeAll, { passive: true });
  }

  let resizeObserver;
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resizeAll);
    scopes.forEach(scope => resizeObserver.observe(scope.canvas));
  }

  return () => {
    disposed = true;
    button?.removeEventListener('click', toggleSound);
    document.removeEventListener('pointerover', onPointerOver);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', refreshAnimation);
    window.removeEventListener('resize', resizeAll);
    window.removeEventListener('scroll', resizeAll);
    reducedMotion.removeEventListener('change', refreshAnimation);
    observer?.disconnect();
    resizeObserver?.disconnect();
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    enabled = false;
    stopOscillators();
    audioContext?.close().catch(() => {});
    syncButton();
  };
}
