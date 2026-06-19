// Lightweight synthesized sound (no asset files). Kept deliberately soft + low
// — synth blips grate easily, so volumes are low, waveforms gentle, and the
// reel is a quiet low tick rather than a bright ratchet. A master toggle lets
// the player mute it entirely.
let ctx = null
let master = null
let ambGain = null
let reelAccum = 0
let enabled = true
const MASTER = 0.28

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume()
    return
  }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = enabled ? MASTER : 0
    master.connect(ctx.destination)
    startAmbient()
  } catch (e) {
    ctx = null
  }
}

export function setSoundEnabled(on) {
  enabled = on
  if (master) master.gain.value = on ? MASTER : 0
}

function noise(dur) {
  const n = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  return buf
}

// very soft looping water-lap ambience
function startAmbient() {
  if (!ctx) return
  const src = ctx.createBufferSource()
  src.buffer = noise(2)
  src.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 380
  ambGain = ctx.createGain()
  ambGain.gain.value = 0.018
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.1
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.008
  lfo.connect(lfoGain)
  lfoGain.connect(ambGain.gain)
  src.connect(lp)
  lp.connect(ambGain)
  ambGain.connect(master)
  src.start()
  lfo.start()
}

function blip(freq, dur, type = 'sine', vol = 0.2, slideTo = null) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  const t = ctx.currentTime
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function burst(dur, freq, vol = 0.25, type = 'lowpass', q = 1) {
  if (!ctx) return
  const src = ctx.createBufferSource()
  src.buffer = noise(dur)
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx.createGain()
  const t = ctx.currentTime
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start(t)
  src.stop(t + dur)
}

export const sfx = {
  cast() {
    if (!ctx) return
    const src = ctx.createBufferSource()
    src.buffer = noise(0.35)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.2
    const t = ctx.currentTime
    bp.frequency.setValueAtTime(500, t)
    bp.frequency.linearRampToValueAtTime(1800, t + 0.15)
    bp.frequency.linearRampToValueAtTime(450, t + 0.35)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.1, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    src.connect(bp)
    bp.connect(g)
    g.connect(master)
    src.start(t)
    src.stop(t + 0.37)
  },
  splash() {
    burst(0.3, 700, 0.22, 'lowpass', 0.7)
  },
  bigSplash() {
    burst(0.45, 600, 0.3, 'lowpass', 0.7)
  },
  bite() {
    blip(360, 0.13, 'sine', 0.12, 200)
  },
  // soft low reel tick; the drag-slip variant (fast) is a touch brighter but still gentle
  reelTick(dt, fast = false) {
    if (!ctx) return
    reelAccum += dt
    const interval = fast ? 0.06 : 0.14
    if (reelAccum >= interval) {
      reelAccum = 0
      blip(fast ? 520 : 230, 0.025, 'sine', fast ? 0.05 : 0.022)
    }
  },
  catch() {
    blip(523, 0.14, 'sine', 0.13)
    setTimeout(() => blip(784, 0.22, 'sine', 0.13), 130)
  },
  snap() {
    burst(0.1, 2600, 0.26, 'bandpass', 1.2)
  },
  reset() {
    reelAccum = 0
  },
}
