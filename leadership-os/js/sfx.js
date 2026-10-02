// ═══════════════════════════════════════════════════════════
//  sfx.js — sonidos y música ambiental, generados por código (sin archivos, costo $0)
//
//  · Efectos: clic, pasar el rayo por encima, cambio de pantalla, acorde final.
//  · Música: fondo suave y generativo; baja sola cuando habla Juanjolote (duck).
//  · Se activa con el primer toque (los navegadores lo exigen) y se puede silenciar.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  var KEY = 'ldr_sfx';
  var S = window.SFX = { ctx: null, musicOn: true, ducked: false, started: false };
  try { if (JSON.parse(localStorage.getItem(KEY) || '{}').music === false) S.musicOn = false; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ music: S.musicOn })); } catch (e) {} }

  S.unlock = function () {
    try {
      if (!S.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        S.ctx = new AC();
        S.master = S.ctx.createGain(); S.master.gain.value = .9; S.master.connect(S.ctx.destination);
        S.sfxBus = S.ctx.createGain(); S.sfxBus.gain.value = .5; S.sfxBus.connect(S.master);
        S.musicBus = S.ctx.createGain(); S.musicBus.gain.value = 0; S.musicBus.connect(S.master);
      }
      if (S.ctx.state === 'suspended') S.ctx.resume();
      if (S.musicOn) S.startMusic();
    } catch (e) {}
  };

  function ready() { return S.ctx && S.ctx.state === 'running'; }
  function tone(freq, t0, dur, type, gain, bus, slideTo) {
    var c = S.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + .01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || S.sfxBus); o.start(t0); o.stop(t0 + dur + .03);
  }

  S.click = function () { if (!ready()) return; var t = S.ctx.currentTime; tone(740, t, .1, 'sine', .38, null, 1180); tone(1480, t + .02, .09, 'triangle', .12); };
  S.back = function () { if (!ready()) return; tone(560, S.ctx.currentTime, .12, 'sine', .3, null, 340); };
  var lastHover = 0;
  S.hover = function () { if (!ready()) return; var n = performance.now(); if (n - lastHover < 140) return; lastHover = n; tone(1320, S.ctx.currentTime, .05, 'sine', .07); };
  S.whoosh = function () {
    if (!ready()) return; var c = S.ctx, t = c.currentTime, len = Math.floor(c.sampleRate * .45), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(2600, t + .4);
    var g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .12); g.gain.exponentialRampToValueAtTime(0.0001, t + .45);
    src.connect(f); f.connect(g); g.connect(S.sfxBus); src.start(t);
  };
  S.chime = function () { if (!ready()) return; var t = S.ctx.currentTime; [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, t + i * .1, .9, 'sine', .22); }); };

  // Música ambiental: acordes lentos (Cmaj7 → Am7 → Fmaj7 → G6) con notas sueltas
  var CH = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 261.63, 329.63, 440], [196, 246.94, 293.66, 329.63]];
  S.startMusic = function () {
    if (S.started || !S.ctx) return; S.started = true;
    var c = S.ctx, lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(S.musicBus);
    var step = 0;
    (function chord() {
      var t = c.currentTime, ch = CH[step++ % CH.length];
      ch.forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1.5) * 7;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.12, t + 2.4); g.gain.linearRampToValueAtTime(0.0001, t + 7.6);
        o.connect(g); g.connect(lp); o.start(t); o.stop(t + 7.7);
      });
      for (var k = 0; k < 3; k++) tone(ch[(k * 2 + 1) % 4] * 2, t + 1.2 + k * 1.5, 1.6, 'sine', .035, lp);
      setTimeout(chord, 6200);
    })();
    S.applyMusicGain();
  };
  S.applyMusicGain = function () { if (S.musicBus) S.musicBus.gain.setTargetAtTime(S.musicOn ? (S.ducked ? .03 : .13) : 0, S.ctx.currentTime, .5); };
  S.duck = function (on) { S.ducked = !!on; S.applyMusicGain(); };
  S.toggleMusic = function () { S.musicOn = !S.musicOn; save(); if (S.ctx) { if (S.musicOn) S.startMusic(); S.applyMusicGain(); } return S.musicOn; };
})();
