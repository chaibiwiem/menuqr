// Web Audio API — singleton AudioContext, unlocked on first user interaction

let _ctx = null;

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _ctx;
}

// Call once on any user click to unlock the context (autoplay policy)
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx && ctx.state !== 'running') {
    ctx.resume().catch(() => {});
  }
}

function playTone(ctx, freq, startTime, duration, type = 'sine', volume = 0.35) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function withCtx(fn) {
  const ctx = getCtx();
  if (!ctx) return;
  // Always resume in case browser suspended the context
  if (ctx.state === 'running') {
    fn(ctx);
  } else {
    ctx.resume().then(() => fn(ctx)).catch(() => {});
  }
}

// ─── Nouvelle commande — 3 notes montantes (C5 → E5 → G5)
export function playOrderSound() {
  withCtx((ctx) => {
    const now = ctx.currentTime;
    playTone(ctx, 523.25, now,        0.18, 'sine', 0.32);
    playTone(ctx, 659.25, now + 0.18, 0.18, 'sine', 0.34);
    playTone(ctx, 783.99, now + 0.36, 0.28, 'sine', 0.36);
  });
}

// ─── Appel serveur — 2 notes graves (F4 → D4) + résonance
export function playCallWaiterSound() {
  withCtx((ctx) => {
    const now = ctx.currentTime;
    playTone(ctx, 349.23, now,        0.22, 'triangle', 0.45);
    playTone(ctx, 293.66, now + 0.25, 0.22, 'triangle', 0.45);
    playTone(ctx, 349.23, now + 0.52, 0.18, 'triangle', 0.28);
    playTone(ctx, 293.66, now + 0.72, 0.18, 'triangle', 0.28);
  });
}

// ─── Nouvelle réservation — 2 notes douces montantes (C5 → E5 → G5, fade court)
export function playReservationSound() {
  withCtx((ctx) => {
    const now = ctx.currentTime;
    playTone(ctx, 523.25, now,        0.15, 'sine', 0.28); // C5
    playTone(ctx, 659.25, now + 0.17, 0.15, 'sine', 0.26); // E5
    playTone(ctx, 783.99, now + 0.34, 0.30, 'sine', 0.20); // G5 (long, soft)
  });
}

// ─── Répète un son toutes les intervalMs pendant durationMs.
// Retourne stop() pour couper immédiatement.
export function startRepeatingSound(playFn, intervalMs = 6000, durationMs = 60000) {
  playFn();
  const intervalId = setInterval(playFn, intervalMs);
  const timeoutId  = setTimeout(() => clearInterval(intervalId), durationMs);
  return function stop() {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  };
}
