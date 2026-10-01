// ═══════════════════════════════════════════════════════════
//  ui3d.js — interfaz 3D de Neural Academy (clara, con efecto tecnológico)
//
//  Qué hace
//   · Crea el ambiente (cielo, suelo con rejilla, partículas) y las pantallas principales.
//   · Conserva los mismos ids y acciones que usa world.html, así la lógica no cambia.
//   · Los avatares son modelos 3D (GLB) y su cara cambia según el ánimo y el habla.
//
//  Se carga ANTES del script principal de world.html (construye la escena)
//  y ahí mismo se llama a UI3D.installOverrides() DESPUÉS de ese script.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var C = { navy: '#14224a', muted: '#5b6b8c', white: '#ffffff', teal: '#00bfa6', coral: '#ff6b6b',
            sun: '#ffb703', violet: '#7b5cff', blue: '#2f7bff', green: '#2fbf71', sky: '#1f3f8f' };
  var FONT = '"Segoe UI",system-ui,Arial,sans-serif';
  var SCENE = document.querySelector('a-scene');
  var FX = { sheen: [], beams: [], motes: null, floor: null };
  var UI3D = window.UI3D = { stage: 'agent', talkTimers: {}, baseFace: { juan: 'happy', ajo: 'neutral' } };

  // ───────────────────────── Dibujo en canvas ─────────────────────────
  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function shadow(g, col, b) { g.shadowColor = col; g.shadowBlur = b; g.shadowOffsetY = b / 3; }

  // Parte un texto en líneas que caben en maxW; si sobra, la última termina en "…"
  function lines(g, text, maxW, maxLines) {
    var words = String(text || '').replace(/\s+/g, ' ').trim().split(' '), out = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(t).width > maxW && line) { out.push(line); line = words[i]; } else line = t;
    }
    if (line) out.push(line);
    if (out.length > maxLines) {
      out = out.slice(0, maxLines);
      var l = out[maxLines - 1];
      while (g.measureText(l + '…').width > maxW && l.length > 1) l = l.slice(0, -1);
      out[maxLines - 1] = l.replace(/\s+$/, '') + '…';
    }
    return out;
  }
  function drawLines(g, text, x, y, maxW, lh, maxLines) {
    var ls = lines(g, text, maxW, maxLines);
    for (var i = 0; i < ls.length; i++) g.fillText(ls[i], x, y + i * lh);
    return y + ls.length * lh;
  }

  // Borde de neón degradado y esquinas tipo HUD
  function neon(g, W, H, p, rad, lw) {
    var gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#19e3ff'); gr.addColorStop(.5, '#7b5cff'); gr.addColorStop(1, '#ff5cc8');
    g.lineWidth = lw || 5; g.strokeStyle = gr; g.shadowColor = 'rgba(25,227,255,.7)'; g.shadowBlur = 10;
    rr(g, p, p, W - 2 * p, H - 2 * p, rad); g.stroke(); g.shadowBlur = 0;
    var L = Math.min(W, H) * .1; g.strokeStyle = '#19e3ff'; g.lineWidth = 4;
    [[p, p, 1, 1], [W - p, p, -1, 1], [p, H - p, 1, -1], [W - p, H - p, -1, -1]].forEach(function (c) {
      g.beginPath(); g.moveTo(c[0] + c[2] * L, c[1]); g.lineTo(c[0], c[1]); g.lineTo(c[0], c[1] + c[3] * L); g.stroke();
    });
  }

  // ───────────────────────── Efectos (baratos para Quest) ─────────────────────────
  function sheenMaterial(tex) {
    var m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { map: { value: tex }, time: { value: 0 }, phase: { value: Math.random() * 5 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform sampler2D map;uniform float time;uniform float phase;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv);float p=fract((time+phase)*.16+vUv.x*.6-vUv.y*.35);float band=smoothstep(0.0,.05,p)*(1.0-smoothstep(.05,.14,p));c.rgb+=vec3(.45,.95,1.0)*band*.5*c.a;gl_FragColor=c;\n#include <colorspace_fragment>\n}'
    });
    FX.sheen.push(m); return m;
  }
  function glowTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.45, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ── Animaciones suaves (entradas, vuelos) sin depender de componentes ──
  var TW = [], FLOAT = [];
  var EASE = {
    out: function (k) { return 1 - Math.pow(1 - k, 3); },
    in: function (k) { return k * k * k; },
    io: function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    back: function (k) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
  };
  // to: {x,y,z,s,ry}; arranca desde el estado que tenga el objeto cuando llega su turno (delay)
  function tween(o, to, dur, delay, ease, done) {
    for (var i = TW.length - 1; i >= 0; i--) if (TW[i].o === o) TW.splice(i, 1);
    TW.push({ o: o, to: to, dur: dur || 600, t0: performance.now() + (delay || 0), ease: EASE[ease || 'out'], done: done, from: null });
  }
  function stepTweens(now) {
    for (var i = TW.length - 1; i >= 0; i--) {
      var t = TW[i]; if (now < t.t0) continue;
      var o = t.o, to = t.to;
      if (!t.from) t.from = { x: o.position.x, y: o.position.y, z: o.position.z, s: o.scale.x, ry: o.rotation.y };
      var f = t.from, k = Math.min(1, (now - t.t0) / t.dur), e = t.ease(k);
      if (to.x !== undefined) o.position.x = f.x + (to.x - f.x) * e;
      if (to.y !== undefined) o.position.y = f.y + (to.y - f.y) * e;
      if (to.z !== undefined) o.position.z = f.z + (to.z - f.z) * e;
      if (to.s !== undefined) { var s = Math.max(.001, f.s + (to.s - f.s) * e); o.scale.set(s, s, s); }
      if (to.ry !== undefined) o.rotation.y = f.ry + (to.ry - f.ry) * e;
      if (k >= 1) { TW.splice(i, 1); if (t.done) t.done(); }
    }
  }

  // Reloj de los efectos: se registra como componente (los sistemas no se pueden añadir tarde)
  AFRAME.registerComponent('fx-clock', {
    tick: function (t) {
      var s = t / 1000, i;
      for (i = 0; i < FX.sheen.length; i++) FX.sheen[i].uniforms.time.value = s;
      stepTweens(performance.now());
      for (i = 0; i < FLOAT.length; i++) { var m = FLOAT[i].getObject3D('mesh'); if (m) m.position.y = Math.sin(s * 1.1 + FLOAT[i]._ph) * .028; }
      if (FX.sky) {
        FX.sky.rotation.y = s * .01;
        for (i = 0; i < FX.bokeh.length; i++) { var b = FX.bokeh[i]; b.position.y = b.userData.y0 + Math.sin(s * b.userData.sp + b.userData.ph) * b.userData.amp; }
        for (i = 0; i < FX.rings.length; i++) { FX.rings[i].rotation.x += .0016; FX.rings[i].rotation.y += .0022; }
      }
      if (FX.motes) {
        var p = FX.motes.geometry.attributes.position;
        for (i = 0; i < p.count; i++) { var y = p.getY(i) + .004 + (i % 5) * .0009; if (y > 4.8) y = -.6; p.setY(i, y); }
        p.needsUpdate = true; FX.motes.rotation.y = s * .015;
      }
    }
  });

  // ───────────────────────── Paneles y botones ─────────────────────────
  function isActive(e) {
    var o = e.object3D;
    while (o) { if (o.visible === false || (o.scale && o.scale.x === 0)) return false; o = o.parent; }
    return true;
  }

  // Posición en arco: a = grados alrededor de ti (0 = al frente), r = distancia; el panel mira hacia ti
  function placed(o) {
    if (o.a !== undefined) { var t = o.a * Math.PI / 180, r = o.r || 3; o.x = Math.sin(t) * r; o.z = -Math.cos(t) * r; o.ry = -o.a; }
    return o;
  }

  // o: {w,h,x,y,z,ry,px,id,sheen,state,draw(g,W,H,state),action,onClick}
  function panel(o) {
    placed(o);
    var PX = Math.max(o.px || 0, 260), cw = Math.round(o.w * PX), ch = Math.round(o.h * PX);   // alta resolución: el texto se lee bien en el visor
    var c = document.createElement('canvas'); c.width = cw; c.height = ch; var g = c.getContext('2d');
    var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    var mat = o.sheen ? sheenMaterial(tex) : new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false });
    var e = document.createElement('a-entity');
    if (o.id) e.setAttribute('id', o.id);
    e.setAttribute('position', (o.x || 0) + ' ' + (o.y || 0) + ' ' + (o.z || 0));
    if (o.ry) e.setAttribute('rotation', '0 ' + o.ry + ' 0');
    e.setObject3D('mesh', new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), mat));
    e._st = o.state || {}; e._base = { x: o.x || 0, y: o.y || 0, z: o.z || 0 }; e._noFly = !!o.noFly; e._ph = Math.random() * 6; if (o.float) FLOAT.push(e);
    e.redraw = function () { g.clearRect(0, 0, cw, ch); g.shadowBlur = 0; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; o.draw(g, cw, ch, e._st); tex.needsUpdate = true; };
    e.upd = function (patch) { for (var k in patch) e._st[k] = patch[k]; e.redraw(); };
    e.redraw();
    if (o.action || o.onClick || o.clickable) wireClick(e, o);
    return e;
  }

  function wireClick(e, o) {
    e.classList.add('clickable');
    e.addEventListener('mouseenter', function () { if (isActive(e)) e.setAttribute('scale', '1.05 1.05 1.05'); });
    e.addEventListener('mouseleave', function () { e.setAttribute('scale', '1 1 1'); });
    e.addEventListener('click', function (evt) {
      if (!isActive(e)) return;
      if (typeof unlockAudio === 'function') unlockAudio();
      if (o.action) { evt.stopImmediatePropagation(); evt.stopPropagation(); if (typeof ejecutarFuncionPorTecnica === 'function') ejecutarFuncionPorTecnica(o.action); }
      else if (o.onClick) { evt.stopImmediatePropagation(); evt.stopPropagation(); o.onClick(evt); }
      // sin acción ni onClick: los listeners por id de world.html se encargan
    });
  }

  // Cristal: translúcido, con brillo arriba, reflejos diagonales y borde de neón (texto blanco encima)
  function glass(g, W, H, p, rad, accent) {
    shadow(g, 'rgba(10,20,70,.35)', 26); rr(g, p, p, W - 2 * p, H - 2 * p, rad);
    var f = g.createLinearGradient(0, 0, W, H); f.addColorStop(0, 'rgba(34,70,190,.64)'); f.addColorStop(1, 'rgba(96,58,205,.58)');
    g.fillStyle = f; g.fill(); shadow(g, 'transparent', 0);
    g.save(); rr(g, p, p, W - 2 * p, H - 2 * p, rad); g.clip();
    var sh = g.createLinearGradient(0, 0, 0, H * .5); sh.addColorStop(0, 'rgba(255,255,255,.32)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H * .5);
    g.fillStyle = 'rgba(255,255,255,.07)';
    g.beginPath(); g.moveTo(W * .08, H); g.lineTo(W * .42, 0); g.lineTo(W * .58, 0); g.lineTo(W * .24, H); g.fill();
    g.beginPath(); g.moveTo(W * .5, H); g.lineTo(W * .78, 0); g.lineTo(W * .86, 0); g.lineTo(W * .58, H); g.fill();
    if (accent) { g.fillStyle = accent; g.globalAlpha = .95; g.fillRect(p + rad, H - p - 9, W - 2 * p - 2 * rad, 6); g.globalAlpha = 1; }
    g.restore(); neon(g, W, H, p, rad, 4);
  }
  function glowIcon(g, cx, cy, R, color, icon) {
    var rg = g.createRadialGradient(cx, cy, 2, cx, cy, R * 1.8); rg.addColorStop(0, color); rg.addColorStop(.5, color + '88'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, R * 1.8, 0, 7); g.fill();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = (R * 1.5) + 'px ' + FONT; g.fillText(icon || '', cx, cy + R * .08); g.textBaseline = 'alphabetic';
  }

  function card(o) {
    placed(o);
    return panel({
      float: true, x: o.x, y: o.y, z: o.z, ry: o.ry, w: o.w, h: o.h, id: o.id, action: o.action, onClick: o.onClick, sheen: true, state: o.state,
      draw: function (g, W, H) {
        var p = 14; glass(g, W, H, p, 34, o.color);
        glowIcon(g, W / 2, H * .22, H * .105, o.color, o.icon);
        if (o.chip) { g.font = '800 ' + (H * .06) + 'px ' + FONT; var tw = g.measureText(o.chip).width + 26; rr(g, W - p - tw - 12, p + 12, tw, H * .1, H * .05); g.fillStyle = o.color; g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(o.chip, W - p - tw / 2 - 12, p + 12 + H * .07); }
        g.textAlign = 'center'; g.fillStyle = '#fff'; var fs = H * .12; g.font = '800 ' + fs + 'px ' + FONT; var maxW = W * .84;
        g.shadowColor = 'rgba(10,20,70,.6)'; g.shadowBlur = 8;
        if (g.measureText(o.title).width > maxW) {
          var ws = o.title.split(' ');
          if (ws.length > 1) {
            var mid = Math.ceil(ws.length / 2), l1 = ws.slice(0, mid).join(' '), l2 = ws.slice(mid).join(' ');
            fs = Math.min(H * .105, fs); g.font = '800 ' + fs + 'px ' + FONT;
            while (Math.max(g.measureText(l1).width, g.measureText(l2).width) > maxW && fs > H * .06) { fs -= 2; g.font = '800 ' + fs + 'px ' + FONT; }
            g.fillText(l1, W / 2, H * (o.sub ? .52 : .6)); g.fillText(l2, W / 2, H * (o.sub ? .52 : .6) + fs * 1.05);
          } else {
            while (g.measureText(o.title).width > maxW && fs > H * .06) { fs -= 2; g.font = '800 ' + fs + 'px ' + FONT; }
            g.fillText(o.title, W / 2, H * .6);
          }
        } else g.fillText(o.title, W / 2, H * (o.sub ? .55 : .62));
        g.shadowBlur = 0;
        if (o.sub) { g.fillStyle = '#d5e1ff'; g.font = (H * (o.subSize || .072)) + 'px ' + FONT; g.textAlign = 'center'; drawLines(g, o.sub, W / 2, H * .76, W * .82, H * .085, 2); }
      }
    });
  }

  // Color más claro/oscuro (solo para #rrggbb; otros formatos se dejan igual)
  function shade(col, k) {
    var m = /^#([0-9a-f]{6})$/i.exec(col || ''); if (!m) return col;
    var n = parseInt(m[1], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { return Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); });
    return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }
  // Losa con forma de píldora: da grosor al botón (se ve el borde al mirarlo de lado)
  function slab(w, h, depth, color) {
    var r = h / 2, sh = new THREE.Shape();
    sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    sh.lineTo(-w / 2 + r, h / 2); sh.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 20 }); g.translate(0, 0, -depth);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: color, toneMapped: false }));
  }

  function pill(o) {
    placed(o);
    var e = panel({
      x: o.x, y: o.y, z: o.z, w: o.w, h: o.h, id: o.id, action: o.action, onClick: o.onClick, clickable: o.clickable, sheen: !!o.sheen, state: { label: o.label },
      draw: function (g, W, H, s) {
        var p = 10, base = s.bg || o.bg || C.navy, rad = (H - 2 * p) / 2;
        var gr = g.createLinearGradient(0, p, 0, H - p); gr.addColorStop(0, shade(base, .28)); gr.addColorStop(.55, base); gr.addColorStop(1, shade(base, -.22));
        rr(g, p, p, W - 2 * p, H - 2 * p, rad); g.fillStyle = typeof shade(base, .1) === 'string' && /^#/.test(base) ? gr : base; g.fill();
        g.save(); rr(g, p, p, W - 2 * p, H - 2 * p, rad); g.clip(); var hl = g.createLinearGradient(0, p, 0, H * .55); hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(p, p, W - 2 * p, (H - 2 * p) * .5); g.restore();
        g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.7)'; rr(g, p + 1.5, p + 1.5, W - 2 * p - 3, H - 2 * p - 3, rad); g.stroke();
        g.fillStyle = o.fg || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + (H * (o.fs || .38)) + 'px ' + FONT;
        if (!o.fg) { g.shadowColor = 'rgba(10,20,70,.45)'; g.shadowBlur = 6; }
        g.fillText(s.label, W / 2, H / 2 + 2); g.shadowBlur = 0;
      }
    });
    var base0 = o.bg || C.navy, side = /^#/.test(base0) ? shade(base0, -.42) : '#2b3a66';
    e.setObject3D('slab', slab(o.w - .05, o.h - .05, .09, side));
    return e;
  }

  function label(o) {
    placed(o);
    return panel({
      x: o.x, y: o.y, z: o.z, w: o.w, h: o.h, px: o.px || 180, id: o.id, state: { text: o.text, sub: o.sub, color: o.color },
      draw: function (g, W, H, s) {
        g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
        var X = o.align === 'left' ? 8 : o.align === 'right' ? W - 8 : W / 2;
        g.fillStyle = s.color || o.color || C.navy; g.font = (o.weight || 800) + ' ' + (H * (o.size || .5)) + 'px ' + FONT;
        if (o.shadow !== false) { g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 12; }
        g.fillText(s.text || '', X, H * (s.sub ? .36 : .5));
        if (s.sub) { g.shadowBlur = 0; g.fillStyle = o.subColor || C.muted; g.font = '600 ' + (H * .26) + 'px ' + FONT; g.fillText(s.sub, X, H * .78); }
      }
    });
  }

  // ───────────────────────── Avatares 3D ─────────────────────────
  var FACE_CACHE = {};
  var FACE_LOADER = new THREE.TextureLoader();
  function faceTexture(who, face, cb) {
    var key = who + '_' + face;
    if (FACE_CACHE[key]) { if (FACE_CACHE[key].image) cb(FACE_CACHE[key]); else FACE_CACHE[key].waiters.push(cb); return; }
    var holder = { waiters: [cb] }; FACE_CACHE[key] = holder;
    FACE_LOADER.load('assets/ajolotes/' + who + '_' + face + '.png', function (t) {
      t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
      FACE_CACHE[key] = t; holder.waiters.forEach(function (w) { w(t); });
    });
  }

  // Dos personajes únicos que se mueven entre pantallas (a veces aparece uno, a veces el otro, a veces ambos)
  var ACT = {};
  function polar(a, r, y) { var t = a * Math.PI / 180; return { x: Math.sin(t) * r, y: y, z: -Math.cos(t) * r }; }

  function makeActor(who) {
    var w = document.createElement('a-entity');
    w.setAttribute('position', '0 -2 -4'); w.setAttribute('scale', '0.001 0.001 0.001');
    var e = document.createElement('a-entity');
    e.setAttribute('gltf-model', 'assets/ajolotes/' + who + '.glb');
    e.setAttribute('animation', 'property:position;from:0 0 0;to:0 .1 0;dir:alternate;loop:true;dur:2400;easing:easeInOutSine');
    w._who = who; w._face = UI3D.baseFace[who] || 'neutral'; w.shown = false;
    w.setFace = function (face) {
      w._face = face;
      faceTexture(who, face, function (t) {
        if (w._face !== face) return;
        e.object3D.traverse(function (o) { if (o.isMesh && o.material) { o.material.map = t; o.material.needsUpdate = true; } });
      });
    };
    e.addEventListener('model-loaded', function () { w.setFace(w._face); });
    w.appendChild(e);
    (UI3D.avatars = UI3D.avatars || {})[who] = [w];
    ACT[who] = w; return w;
  }

  // spec: { juan: {a,r,y,s}, ajo: {...} } — lo que no aparece en spec sale de escena
  UI3D.cast = function (spec) {
    spec = spec || {};
    ['juan', 'ajo'].forEach(function (who) {
      var A = ACT[who]; if (!A) return;
      var p = spec[who], o = A.object3D;
      if (!p) { if (A.shown) { A.shown = false; tween(o, { s: .001, y: o.position.y - .4 }, 260, 0, 'in'); } return; }
      var pos = polar(p.a, p.r || 2.7, p.y === undefined ? .5 : p.y), sc = p.s || 1.15, ry = p.a * .15 * Math.PI / 180;
      if (!A.shown) {
        A.shown = true; var side = p.a < 0 ? -1 : 1;
        o.position.set(pos.x + side * 1.2, pos.y - .9, pos.z - 1.6); o.scale.set(.001, .001, .001); o.rotation.y = ry;
        tween(o, { x: pos.x, y: pos.y, z: pos.z, s: sc, ry: ry }, 950, 120, 'back');
      } else tween(o, { x: pos.x, y: pos.y, z: pos.z, s: sc, ry: ry }, 750, 0, 'io');
    });
  };

  // Habla: alterna caras de boca mientras suena el audio
  UI3D.talk = function (who, on) {
    clearInterval(UI3D.talkTimers[who]); UI3D.talkTimers[who] = null;
    var list = (UI3D.avatars && UI3D.avatars[who]) || [];
    if (!on) { list.forEach(function (a) { a.setFace(UI3D.baseFace[who]); }); return; }
    var seq = ['talk_mid', 'talk_open', 'talk_mid', UI3D.baseFace[who], 'talk_open', 'talk_mid'], i = 0;
    UI3D.talkTimers[who] = setInterval(function () { i = (i + 1 + Math.floor(Math.random() * 2)) % seq.length; list.forEach(function (a) { a.setFace(seq[i] === UI3D.baseFace[who] ? UI3D.baseFace[who] : seq[i]); }); }, 130);
  };
  UI3D.setFace = function (who, face) {
    UI3D.baseFace[who] = face;
    if (!UI3D.talkTimers[who]) ((UI3D.avatars && UI3D.avatars[who]) || []).forEach(function (a) { a.setFace(face); });
  };

  // ───────────────────────── Pantallas ─────────────────────────
  var ROOT = document.createElement('a-entity'); ROOT.setAttribute('id', 'ui3d-root');
  var screens = {};
  function add(p, c) { p.appendChild(c); return c; }
  function screen(id, visible) {
    var r = document.createElement('a-entity'); r.setAttribute('id', id);
    r.setAttribute('visible', visible ? 'true' : 'false'); r.setAttribute('scale', visible ? '1 1 1' : '0 0 0');
    ROOT.appendChild(r); screens[id] = r; return r;
  }
  // Elemento invisible con id que "captura" los setAttribute del código existente
  function stub(parent, id, onSet) {
    var e = document.createElement('a-entity'); e.setAttribute('id', id); e.setAttribute('visible', 'false');
    var orig = e.setAttribute.bind(e);
    e.setAttribute = function (name, a, b) {
      if (name === 'text' && a === 'value') onSet && onSet(b);
      else if (name === 'value') onSet && onSet(a);
      else if (name === 'text' && a && typeof a === 'object' && 'value' in a) onSet && onSet(a.value);
      // el resto (color, width, position…) se ignora
    };
    parent.appendChild(e); return e;
  }

  var S = UI3D.state = { agentName: '', agentRole: '', agentTrait: '', agentEmoji: '', speaker: '', text: '', you: '', mood: 30, status: 'ready', statusLabel: 'Tap the mic to talk',
                         briefing: { title: '', trap: '', raw: '' }, evalRaw: '' };
  var P = UI3D.p = {};      // paneles dinámicos
  var PV = UI3D.pv = { phase: 'bad', title: '', msg: null, insight: '', moves: [], roleA: 'Coach', last: { A: 'neutral', B: 'neutral' } };   // estado del ejemplo
  var TECH_PAGE = 0, TECH_CARDS = [], TECH_PER_PAGE = 8;

  function techList() {
    var ids = ['active-listening', 'powerful-questions', 'motivational-interviewing', 'nonviolent-communication', 'radical-candor', 'crucial-conversations',
               'tactical-empathy', 'scarf-model', 'immunity-to-change', 'drama-triangle', 'grow-model', 'strengths-based-coaching', 'growth-mindset', 'solution-focused-coaching'];
    var colors = [C.teal, C.blue, C.violet, C.coral, C.sun, C.green];
    var FALLBACK = { 'tactical-empathy': 'Tactical Empathy', 'scarf-model': 'SCARF Model', 'immunity-to-change': 'Immunity to Change', 'drama-triangle': 'Drama Triangle', 'grow-model': 'GROW Model',
                     'strengths-based-coaching': 'Strengths-Based Coaching', 'growth-mindset': 'Growth Mindset', 'solution-focused-coaching': 'Solution-Focused Coaching' };
    return ids.map(function (action, i) {
      var key = action.replace(/-/g, '_'), t = (typeof TECHNIQUES !== 'undefined' && TECHNIQUES[key]) || {};
      return { action: action, title: t.label || FALLBACK[action] || action, icon: t.icon || '✨', color: colors[i % colors.length] };
    });
  }

  // Posiciones de los personajes por pantalla (a = grados alrededor de ti; 0 = al frente)
  var JL = { juan: { a: 0, r: 2.3, y: .25, s: .8 } };
  var AJR = { ajo: { a: 0, r: 2.3, y: .25, s: .8 } };
  var CASTS = {};
  var CRUMB = { 'screen-welcome': 'HOME', 'screen-interventions': 'HOME  ›  INTERVENTIONS', 'screen-technique-list': 'HOME  ›  TECHNIQUES', 'screen-learn-work-practice': 'CHOOSE A MODE',
                'screen-level-selector': 'CHOOSE A LEVEL', 'screen-intervention-briefing': 'BRIEFING', 'screen-active-listening-activity': 'QUICK EXAMPLE', 'screen-eval': 'RESULTS' };

  function head(parent, a, title, sub) {
    add(parent, label({ a: a, r: 3.0, y: 3.2, w: 5, h: .55, text: title, size: .6 }));
    if (sub) add(parent, label({ a: a, r: 3.0, y: 2.82, w: 5.6, h: .34, text: sub, size: .5, weight: 600, color: C.sky }));
  }
  // Globo de texto junto a un personaje (cristal)
  function tip(parent, a, y, text, col, r) {
    var left = a < 0;
    return add(parent, panel({
      a: a, r: r || 3.4, y: y, w: 1.9, h: .78, px: 220, float: true, state: { text: text }, noFly: false,
      draw: function (g, W, H, s) {
        var p = 10, bh = H - 16; shadow(g, 'rgba(10,20,70,.3)', 16); rr(g, p, p, W - 2 * p, bh - p, 26);
        var f = g.createLinearGradient(0, 0, W, H); f.addColorStop(0, 'rgba(34,70,190,.7)'); f.addColorStop(1, 'rgba(96,58,205,.65)'); g.fillStyle = f; g.fill();
        var tx = W * (left ? .72 : .28); g.beginPath(); g.moveTo(tx - 16, bh - p - 2); g.lineTo(tx + (left ? 14 : -14), H - 3); g.lineTo(tx + 16, bh - p - 2); g.fill(); shadow(g, 'transparent', 0);
        g.lineWidth = 4; g.strokeStyle = col; rr(g, p, p, W - 2 * p, bh - p, 26); g.stroke();
        g.fillStyle = '#fff'; g.font = '700 ' + (H * .15) + 'px ' + FONT; g.textAlign = 'center'; var ls = lines(g, s.text, W - 60, 3);
        var y0 = (bh) / 2 - (ls.length - 1) * H * .09 + H * .04; ls.forEach(function (l, i) { g.fillText(l, W / 2, y0 + i * H * .18); });
      }
    }));
  }
  // Fila de ruta (HUD) en la parte baja
  function hud(parent) {
    P.hud = add(parent, panel({
      a: 0, r: 2.6, y: -.4, w: 2.8, h: .26, px: 180, state: { text: '' }, noFly: true,
      draw: function (g, W, H, s) {
        if (!s.text) return; var p = 6; shadow(g, 'rgba(20,34,74,.25)', 12); rr(g, p, p, W - 2 * p, H - 2 * p, (H - 2 * p) / 2); g.fillStyle = 'rgba(20,34,74,.82)'; g.fill(); shadow(g, 'transparent', 0);
        g.strokeStyle = '#19e3ff'; g.lineWidth = 3; rr(g, p, p, W - 2 * p, H - 2 * p, (H - 2 * p) / 2); g.stroke();
        g.fillStyle = '#19e3ff'; g.beginPath(); g.arc(34, H / 2, 7, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.font = '800 ' + (H * .4) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NEURAL ACADEMY  ·  ' + s.text, W / 2 + 10, H / 2 + 2);
      }
    }));
  }
  // Ficha en relieve (cristal), controlada por estado (la usa la presentación)
  function chip(o) {
    return panel({
      a: o.a || 0, r: o.r || 3, y: o.y || 1.6, w: 1.05, h: 1.2, sheen: true, float: true, state: {},
      draw: function (g, W, H, s) {
        if (!s.title) return; var p = 12; glass(g, W, H, p, 30, s.color);
        glowIcon(g, W / 2, H * .22, H * .1, s.color, s.icon);
        g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '800 ' + (H * .105) + 'px ' + FONT; g.shadowColor = 'rgba(10,20,70,.6)'; g.shadowBlur = 8;
        var ls = lines(g, s.title, W * .86, 2); ls.forEach(function (l, i) { g.fillText(l, W / 2, H * .55 + i * H * .115); }); g.shadowBlur = 0;
        if (s.sub) { g.fillStyle = '#d5e1ff'; g.font = '600 ' + (H * .075) + 'px ' + FONT; drawLines(g, s.sub, W / 2, H * (ls.length > 1 ? .83 : .74), W * .86, H * .09, 2); }
        if (s.tag) { g.font = '800 ' + (H * .06) + 'px ' + FONT; var tw = g.measureText(s.tag).width + 22; rr(g, W - p - tw - 10, p + 10, tw, H * .09, H * .045); g.fillStyle = s.color; g.fill(); g.fillStyle = '#fff'; g.fillText(s.tag, W - p - tw / 2 - 10, p + 10 + H * .066); }
      }
    });
  }
  // Panel holográfico grande a los lados (como los módulos de la referencia)
  function holo(o) {
    return panel({
      a: o.a, r: o.r || 3, y: o.y || 2.1, w: 1.6, h: 1.5, sheen: true, float: true, state: o.state || {},
      draw: function (g, W, H, s) {
        if (!s.title) return; var p = 12; glass(g, W, H, p, 28, s.color);
        g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '800 ' + (H * .095) + 'px ' + FONT; g.shadowColor = 'rgba(10,20,70,.6)'; g.shadowBlur = 8; g.fillText((s.icon || '') + '  ' + s.title, 38, H * .16); g.shadowBlur = 0;
        g.fillStyle = '#d5e1ff'; g.font = '600 ' + (H * .07) + 'px ' + FONT; drawLines(g, s.sub || '', 38, H * .29, W - 76, H * .085, 2);
        (s.bullets || []).slice(0, 4).forEach(function (b, i) { var y = H * .46 + i * H * .125; rr(g, 38, y, W - 76, H * .098, H * .049); g.fillStyle = 'rgba(255,255,255,.16)'; g.fill(); g.fillStyle = s.color; g.beginPath(); g.arc(38 + H * .049, y + H * .049, H * .022, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 ' + (H * .06) + 'px ' + FONT; g.fillText(b, 38 + H * .1, y + H * .068); });
      }
    });
  }

  // ───────────────────────── Presentación de bienvenida ─────────────────────────
  var HELLO = function () {
    var gid = ''; try { gid = localStorage.getItem('ldr_game_id') || ''; } catch (e) {}
    var n = gid.split('.')[1]; return 'Hi' + (n && n !== 'VISOR' ? ' ' + n : '') + '! I am Juanjolote, your coach. Welcome to Neural Academy.';
  };
  var INTRO = [
    { title: true },
    { kicker: 'HELLO', head: 'I\'m Juanjolote', body: 'Your coach at Neural Academy.', voice: HELLO, juan: 'happy' },
    { kicker: 'THE GOAL', head: 'Spot attrition risk early', body: 'Notice the signs that someone may leave — then follow up the right way.', voice: 'Here you learn to notice when someone on your team may be thinking of leaving, and how to follow up well.', juan: 'open',
      items: [['👀', 'Notice', 'Spot the signals', C.teal], ['💬', 'Ask', 'Open the conversation', C.blue], ['🗓', 'Follow up', 'Keep the thread alive', C.violet]] },
    { kicker: 'FOUR CHECK-INS', head: 'One check-in per stage', body: 'Each one has its own goal.', voice: 'We use four check-ins: at day thirty, one hundred, one twenty one, and three sixty five. Each one has its own goal.', juan: 'happy',
      items: [['💓', 'Pulse Check', 'First impressions', C.teal, 'DAY 30'], ['⚓', 'Anchoring', 'Engagement and belonging', C.blue, 'DAY 100'], ['🗣️', 'Stay Interview', 'Risks and unmet needs', C.violet, 'DAY 121'], ['🏅', 'Tenure Renewal', 'Long-term retention', C.coral, 'DAY 365']] },
    { kicker: 'THE HOW', head: '14 techniques, 3 ways to learn', body: 'And Ajolín plays the employee you will talk to.', voice: 'Techniques are the how. You can learn each one, work through a real case, or practice live. And this is Ajolín. He plays the employee you will talk to.', juan: 'happy', ajo: true,
      items: [['📖', 'Learn', 'With your own experience', C.teal], ['🧩', 'Work Together', 'Bring a real case', C.blue], ['🎭', 'Practice', 'Role-play and feedback', C.coral]] },
    { title: true, ready: true, voice: 'Ready? Let us go.', juan: 'happy', ajo: true }
  ];
  var I = UI3D.intro = { n: 0 };

  function introStep(n) {
    var d = INTRO[n], last = INTRO.length - 1; I.n = n;
    var showSlide = !d.title;
    I.gTitle.setAttribute('visible', d.title ? 'true' : 'false');
    P.slide.setAttribute('visible', showSlide ? 'true' : 'false');
    function pillShow(p, on) { p.setAttribute('visible', on ? 'true' : 'false'); p.setAttribute('scale', on ? '1 1 1' : '0 0 0'); p.classList.toggle('clickable', on); }
    pillShow(I.begin, n === 0); pillShow(I.start, n === last); pillShow(I.next, n > 0 && n < last); pillShow(I.skip, n > 0 && n < last);
    I.hint.setAttribute('visible', n === 0 ? 'true' : 'false');
    if (typeof refreshAllRaycasters === 'function') refreshAllRaycasters();
    if (showSlide) {
      P.slide.upd({ kicker: d.kicker, head: d.head, body: d.body });
      P.slide.object3D.scale.set(.6, .6, .6); P.slide.object3D.position.y = P.slide._base.y - .3; tween(P.slide.object3D, { s: 1, y: P.slide._base.y }, 700, 0, 'back');
    }
    // fichas (relieve): se reparten en arco con distinta profundidad
    var items = d.items || [], cnt = items.length;
    I.chips.forEach(function (c, i) {
      var o = c.object3D;
      if (i >= cnt) { c.setAttribute('visible', 'false'); o.scale.set(.001, .001, .001); return; }
      var it = items[i], a = (i - (cnt - 1) / 2) * 34, r = i % 2 ? 2.9 : 3.15, pos = polar(a, r, 1.95 + (i % 2 ? -.08 : .1));
      c.upd({ icon: it[0], title: it[1], sub: it[2], color: it[3], tag: it[4] || '' });
      c.setAttribute('visible', 'true'); c._base = pos; o.rotation.y = -a * Math.PI / 180;
      o.position.set(pos.x * 1.4, pos.y - .7, pos.z - 1.2); o.scale.set(.001, .001, .001);
      tween(o, { x: pos.x, y: pos.y, z: pos.z, s: 1 }, 800, 250 + i * 130, 'back');
    });
    // paneles holográficos de los lados en la pantalla final
    I.holos.forEach(function (h, i) {
      var o = h.object3D, on = !!d.ready; h.setAttribute('visible', on ? 'true' : 'false');
      if (!on) { o.scale.set(.001, .001, .001); return; }
      var a = (i ? 1 : -1) * 52, pos = polar(a, 3.4, 2.15); o.rotation.y = -a * Math.PI / 180;
      o.position.set(pos.x * 1.5, pos.y - .5, pos.z - 1.4); o.scale.set(.001, .001, .001); tween(o, { x: pos.x, y: pos.y, z: pos.z, s: 1 }, 900, 200 + i * 150, 'back');
    });
    // personajes
    var cast = {};
    if (d.juan) cast.juan = { a: n === last ? -28 : -40, r: 2.4, y: .2, s: .85 };
    if (d.ajo) cast.ajo = { a: n === last ? 28 : 40, r: 2.4, y: .2, s: .85 };
    UI3D.cast(cast);
    if (d.juan) UI3D.setFace('juan', d.juan === 'happy' ? 'happy' : d.juan);
    if (d.ajo) UI3D.setFace('ajo', 'happy');
    var v = typeof d.voice === 'function' ? d.voice() : d.voice;
    if (v && typeof speakVR === 'function') speakVR(v, 'daniel');
  }
  UI3D.introStep = introStep;

  function buildScreens() {
    // ── INTRO (presentación) ──
    var intro = screen('screen-intro', true);
    I.gTitle = add(intro, document.createElement('a-entity'));
    add(I.gTitle, label({ a: 0, r: 3.2, y: 3.55, w: 5, h: .3, text: '// ATTRITION DETECTION TRAINING', size: .5, weight: 700, color: '#0a9bd8' }));
    add(I.gTitle, label({ a: 0, r: 3.2, y: 3.1, w: 5, h: .8, text: 'Neural Academy', size: .62 }));
    add(I.gTitle, label({ a: 0, r: 3.2, y: 2.62, w: 5.4, h: .4, text: 'Learn to spot attrition risk — and follow up well', size: .5, weight: 600, color: C.sky }));
    P.slide = add(intro, panel({
      a: 0, r: 3.0, y: 3.15, w: 3.3, h: 1.3, px: 190, sheen: true, float: true, state: { kicker: '', head: '', body: '' }, noFly: true,
      draw: function (g, W, H, s) {
        var p = 12; glass(g, W, H, p, 32);
        g.textAlign = 'left'; g.fillStyle = '#7cf0ff'; g.font = '800 ' + (H * .085) + 'px ' + FONT; g.fillText('//  ' + (s.kicker || ''), 44, H * .2);
        g.fillStyle = '#fff'; g.font = '800 ' + (H * .17) + 'px ' + FONT; g.shadowColor = 'rgba(10,20,70,.6)'; g.shadowBlur = 8; drawLines(g, s.head, 44, H * .46, W - 88, H * .19, 1); g.shadowBlur = 0;
        g.fillStyle = '#d5e1ff'; g.font = '600 ' + (H * .094) + 'px ' + FONT; drawLines(g, s.body, 44, H * .66, W - 88, H * .12, 2);
      }
    }));
    P.slide.setAttribute('visible', 'false');
    I.chips = []; for (var k = 0; k < 4; k++) { var ch = add(intro, chip({ a: 0, r: 3, y: 1.6 })); ch._noFly = true; ch.setAttribute('visible', 'false'); I.chips.push(ch); }
    I.holos = [
      add(intro, holo({ a: -40, state: { icon: '🎯', title: 'INTERVENTIONS', sub: 'Practice real check-in conversations', color: C.teal, color2: C.blue, bullets: ['Day 30 · Pulse Check', 'Day 100 · Anchoring', 'Day 121 · Stay Interview', 'Day 365 · Tenure Renewal'] } })),
      add(intro, holo({ a: 40, state: { icon: '🧠', title: 'TECHNIQUES', sub: '14 tools to run them well', color: C.violet, color2: '#ff5cc8', bullets: ['Active Listening', 'Powerful Questions', 'Motivational Interviewing', '+ 11 more tools'] } }))
    ];
    I.holos.forEach(function (h) { h._noFly = true; h.setAttribute('visible', 'false'); });
    I.begin = add(intro, pill({ a: 0, r: 2.5, y: 1.7, w: 2.2, h: .5, label: 'Tap to begin  ▶', bg: C.violet, sheen: true, fs: .4, onClick: function () { introStep(1); } }));
    I.start = add(intro, pill({ a: 0, r: 2.5, y: 1.7, w: 1.9, h: .55, label: 'START', bg: C.violet, action: 'start-app', fs: .44, sheen: true }));
    I.next = add(intro, pill({ a: 6, r: 2.4, y: .7, w: 1.4, h: .4, label: 'Next  ▶', bg: C.violet, sheen: true, fs: .4, onClick: function () { introStep(Math.min(INTRO.length - 1, I.n + 1)); } }));
    I.skip = add(intro, pill({ a: 34, r: 2.4, y: .7, w: 1.0, h: .3, label: 'Skip ›', bg: 'rgba(20,34,74,.55)', fs: .38, onClick: function () { if (typeof stopVoice === 'function') stopVoice(); introStep(INTRO.length - 1); } }));
    [I.begin, I.start, I.next, I.skip].forEach(function (p) { p._noFly = true; });
    I.hint = add(intro, document.createElement('a-entity'));
    add(I.hint, label({ a: 0, r: 2.5, y: 1.2, w: 3.4, h: .3, text: 'Drag to look around · click to select', size: .5, weight: 600, color: C.muted }));
    add(I.hint, label({ a: 0, r: 2.5, y: .92, w: 3.4, h: .3, text: 'In VR: point and pull the trigger', size: .5, weight: 600, color: C.muted }));
    I.skip.setAttribute('visible', 'false'); I.next.setAttribute('visible', 'false'); I.start.setAttribute('visible', 'false');
    I.start.setAttribute('scale', '0 0 0'); I.next.setAttribute('scale', '0 0 0'); I.skip.setAttribute('scale', '0 0 0');

    // ── BIENVENIDA (Juanjolote presenta) ──
    var wel = screen('screen-welcome', false); CASTS['screen-welcome'] = JL;
    add(wel, label({ a: 0, r: 3.4, y: 3.85, w: 5, h: .3, text: '// ATTRITION DETECTION TRAINING', size: .5, weight: 700, color: '#0a9bd8' }));
    add(wel, label({ a: 0, r: 3.4, y: 3.4, w: 5, h: .8, text: 'Neural Academy', size: .62 }));
    add(wel, label({ a: 0, r: 3.4, y: 2.92, w: 5.4, h: .4, text: 'Where do you want to start?', size: .5, weight: 600, color: C.sky }));
    add(wel, card({ a: -42, r: 3.0, y: 1.85, w: 1.7, h: 2.0, color: C.teal, icon: '🎯', title: 'Interventions', sub: 'Practice real check-in conversations', action: 'interventions', subSize: .06 }));
    add(wel, card({ a: 42, r: 3.0, y: 1.85, w: 1.7, h: 2.0, color: C.violet, icon: '🧠', title: 'Techniques', sub: '14 tools to run them well', action: 'techniques', subSize: .06 }));
    add(wel, pill({ a: -42, r: 2.7, y: .55, w: 1.5, h: .42, label: 'My progress', bg: '#ffffff', fg: C.navy, action: 'progress' }));
    var back = add(wel, pill({ id: 'btn-back-activity-previous', a: 42, r: 2.7, y: .55, w: 2.3, h: .42, label: 'Back to previous activity', bg: C.sun, fs: .34, action: 'replay-previous-flow' }));
    back.setAttribute('visible', 'false');
    add(wel, pill({ id: 'btn-logout', a: -78, r: 2.6, y: .9, w: 1.25, h: .34, label: 'Unpair device', bg: '#5b6b8c', fs: .34, clickable: true }));
    tip(wel, 0, 1.75, 'Pick a path — I\'ll guide you.', C.teal, 2.7);

    // ── INTERVENCIONES (aparece Ajolín) ──
    var iv = screen('screen-interventions', false); CASTS['screen-interventions'] = AJR;
    head(iv, 0, 'Interventions', 'Check-ins that help you spot attrition early');
    var IV = [['💓', 'Pulse Check', 'First impressions and onboarding', C.teal, 'interv-retencion', 'DAY 30'],
              ['⚓', 'Anchoring', 'Engagement and belonging', C.blue, 'interv-soporte-critico', 'DAY 100'],
              ['🗣️', 'Stay Interview', 'Retention risks and unmet needs', C.violet, 'interv-reclamaciones', 'DAY 121'],
              ['🏅', 'Tenure Renewal', 'Long-term retention', C.coral, 'interv-tenure-renewal', 'DAY 365']];
    var IVA = [-58, -24, 24, 58];
    IV.forEach(function (d, i) {
      add(iv, card({ a: IVA[i], r: 3.0, y: 2.1 + (i % 2 ? -.08 : .08), w: 1.2, h: 1.75, color: d[3], icon: d[0], title: d[1], sub: d[2], chip: d[5], action: d[4], subSize: .07 }));
    });
    add(iv, pill({ a: -40, r: 2.6, y: .5, w: 1.1, h: .4, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'close-history' }));

    // ── MODO (Learn / Work Together / Practice) ──
    var md = screen('screen-learn-work-practice', false); CASTS['screen-learn-work-practice'] = JL;
    P.modeTitle = add(md, label({ a: 0, r: 3.4, y: 3.7, w: 5.6, h: .55, text: 'Choose a mode', size: .6 }));
    P.modeSub = add(md, label({ a: 0, r: 3.4, y: 3.3, w: 5.6, h: .34, text: '', size: .5, weight: 600, color: C.sky }));
    var MD = [['📖', 'Learn', 'Juanjolote teaches using your own experience', C.teal, 'learn-intervention'],
              ['🧩', 'Work Together', 'Bring a real case and find the answer yourself', C.blue, 'work-together-intervention'],
              ['🎭', 'Practice', 'Role-play with an agent and get feedback', C.coral, 'practice-intervention']];
    MD.forEach(function (d, i) { add(md, card({ a: (i - 1) * 38, r: 3.1, y: 2.2 + (i === 1 ? .1 : 0), w: 1.5, h: 1.7, color: d[3], icon: d[0], title: d[1], sub: d[2], action: d[4], subSize: .062 })); });
    add(md, pill({ a: -40, r: 2.6, y: .5, w: 1.1, h: .4, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-technicas' }));

    // ── TÉCNICAS (Juanjolote) ──
    var tl = screen('screen-technique-list', false); CASTS['screen-technique-list'] = { juan: { a: 0, r: 2.3, y: .15, s: .72 } };
    add(tl, label({ a: 0, r: 3.4, y: 3.95, w: 5, h: .55, text: 'Choose a technique', size: .6 }));
    add(tl, label({ a: 0, r: 3.4, y: 3.55, w: 5.6, h: .34, text: 'Quick example · guided lesson · practice', size: .5, weight: 600, color: C.sky }));
    var TCOL = [-52, -18, 18, 52];
    techList().forEach(function (t, i) {
      var pg = Math.floor(i / TECH_PER_PAGE), k = i % TECH_PER_PAGE, col = k % 4, row = Math.floor(k / 4);
      var cd = card({ a: TCOL[col], r: 3.1, y: 2.65 - row * 1.3 + (col % 2 ? .05 : 0), w: 1.5, h: 1.1, color: t.color, icon: t.icon, title: t.title, action: t.action });
      cd._page = pg; add(tl, cd); TECH_CARDS.push(cd);
    });
    add(tl, pill({ id: 'btn-tech-list-back', a: -40, r: 2.6, y: .5, w: 1.1, h: .4, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-technicas' }));
    P.techPage = add(tl, label({ id: 'tech-page-indicator', a: 84, r: 3.0, y: 1.45, w: 1.0, h: .3, text: '1 / 2', size: .5, weight: 700, color: C.navy }));
    // El código antiguo le escribe un 'text' a este id; se ignora para que no aparezca un texto duplicado
    (function (el) { var orig = el.setAttribute.bind(el); el.setAttribute = function (n) { if (n === 'text') return; return orig.apply(null, arguments); }; })(P.techPage);
    add(tl, pill({ a: -84, r: 3.0, y: 2.1, w: .8, h: .8, label: '‹', bg: C.violet, fs: .6, onClick: function () { UI3D.techPage(-1); } }));
    add(tl, pill({ a: 84, r: 3.0, y: 2.1, w: .8, h: .8, label: '›', bg: C.violet, fs: .6, onClick: function () { UI3D.techPage(1); } }));

    // ── NIVEL (Ajolín) ──
    var lv = screen('screen-level-selector', false); CASTS['screen-level-selector'] = AJR;
    add(lv, label({ a: 0, r: 3.4, y: 3.7, w: 5, h: .55, text: 'Select your level', size: .6 }));
    add(lv, label({ a: 0, r: 3.4, y: 3.3, w: 5.6, h: .34, text: 'Choose how challenging I will be', size: .5, weight: 600, color: C.sky }));
    var LV = [['🌱', 'Beginner', 'Guides on screen · open, receptive agent', C.green, 'level-novice'],
              ['⚖️', 'Intermediate', 'Less help · realistic reactions', C.sun, 'level-intermediate'],
              ['🔥', 'Expert', 'No help · guarded or emotional agent', C.coral, 'level-expert']];
    LV.forEach(function (d, i) { add(lv, card({ a: (i - 1) * 38, r: 3.1, y: 2.2 + (i === 1 ? .1 : 0), w: 1.5, h: 1.7, color: d[3], icon: d[0], title: d[1], sub: d[2], action: d[4], subSize: .062 })); });
    add(lv, pill({ id: 'btn-level-back', a: -40, r: 2.6, y: .5, w: 1.1, h: .4, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-to-learn-work' }));

    // ── BRIEFING (Ajolín, con misterio) ──
    var br = screen('screen-intervention-briefing', false); CASTS['screen-intervention-briefing'] = { ajo: { a: 50, r: 2.6, y: .3, s: .9 } };
    P.briefing = add(br, panel({
      a: -8, r: 3.0, y: 2.15, w: 3.3, h: 2.3, px: 150, sheen: true, state: { title: '', trap: '', level: '', scenario: '', tags: [] },
      draw: function (g, W, H, s) {
        var p = 14; shadow(g, 'rgba(20,34,74,.3)', 26); rr(g, p, p, W - 2 * p, H - 2 * p, 36); g.fillStyle = '#fff'; g.fill(); shadow(g, 'transparent', 0); neon(g, W, H, p, 36, 4);
        g.textAlign = 'left'; g.fillStyle = C.blue; g.font = '800 ' + (H * .05) + 'px ' + FONT; g.fillText('BRIEFING' + (s.level ? '  ·  ' + s.level : ''), 46, H * .105);
        g.fillStyle = C.navy; g.font = '800 ' + (H * .085) + 'px ' + FONT; g.fillText(String(s.title || '').replace(/\s*-?\s*BRIEFING$/i, ''), 46, H * .205);
        g.fillStyle = C.muted; g.font = '700 ' + (H * .04) + 'px ' + FONT; g.fillText('THE SITUATION', 46, H * .3);
        g.fillStyle = C.navy; g.font = '600 ' + (H * .057) + 'px ' + FONT; drawLines(g, s.scenario, 46, H * .37, W - 92, H * .068, 4);
        var x = 46, y = H * .655; g.font = '700 ' + (H * .04) + 'px ' + FONT;
        (s.tags || []).slice(0, 6).forEach(function (t) { var w = g.measureText(t).width + 30; if (x + w > W - 46) { x = 46; y += H * .085; } rr(g, x, y, w, H * .066, H * .033); g.fillStyle = '#eef2fb'; g.fill(); g.fillStyle = C.sky; g.fillText(t, x + 15, y + H * .047); x += w + 12; });
        rr(g, 46, H - H * .165, W - 92, H * .105, 20); g.fillStyle = '#fff4e0'; g.fill(); g.fillStyle = '#9a5b00'; g.font = '700 ' + (H * .04) + 'px ' + FONT;
        drawLines(g, '⚠  ' + String(s.trap || '').replace(/^TRAP:\s*/i, 'Watch out: '), 66, H - H * .118, W - 132, H * .045, 2);
      }
    }));
    add(br, pill({ a: -34, r: 2.6, y: .5, w: 1.1, h: .4, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-to-learn-work' }));
    add(br, pill({ a: 0, r: 2.6, y: .5, w: 2.1, h: .44, label: 'Start practice  ➔', bg: C.teal, action: 'start-briefed-practice', sheen: true }));
    tip(br, 50, 1.6, 'Read the case… then meet me.', C.blue, 2.7);
    stub(br, 'briefing-title', function (v) { S.briefing.title = v; refreshBriefing(); });
    stub(br, 'briefing-trap', function (v) { S.briefing.trap = v; refreshBriefing(); });
    stub(br, 'briefing-tags', function (v) { S.briefing.raw = v; refreshBriefing(); });

    // ── EJEMPLO "CÓMO NO / CÓMO SÍ" (reemplaza la pantalla vieja, que usaba el mismo id) ──
    var pv = screen('screen-active-listening-activity', false);
    CASTS['screen-active-listening-activity'] = { juan: { a: -52, r: 2.8, y: .3, s: .9 }, ajo: { a: 52, r: 2.8, y: .3, s: .9 } };
    hud(ROOT);
    // Aviso temporal (por ejemplo cuando la voz no está disponible)
    P.toast = add(ROOT, panel({
      a: 0, r: 2.5, y: .02, w: 3.4, h: .32, px: 200, state: { text: '' }, noFly: true,
      draw: function (g, W, H, s) {
        if (!s.text) return; var p = 6; shadow(g, 'rgba(20,34,74,.3)', 14); rr(g, p, p, W - 2 * p, H - 2 * p, (H - 2 * p) / 2); g.fillStyle = 'rgba(255,183,3,.95)'; g.fill(); shadow(g, 'transparent', 0);
        g.fillStyle = '#3a2500'; g.font = '800 ' + (H * .4) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.text, W / 2, H / 2 + 2);
      }
    }));
    // Botón para salir de VR: solo se ve dentro del visor
    P.exitVR = add(ROOT, pill({ a: 62, r: 2.5, y: .55, w: 1.2, h: .38, label: 'Exit VR', bg: C.coral, fs: .4, onClick: function () { try { SCENE.exitVR(); } catch (e) {} } }));
    P.exitVR._noFly = true; P.exitVR.setAttribute('visible', 'false'); P.exitVR.setAttribute('scale', '0 0 0');
    SCENE.addEventListener('enter-vr', function () { P.exitVR.setAttribute('visible', 'true'); P.exitVR.setAttribute('scale', '1 1 1'); if (typeof refreshAllRaycasters === 'function') refreshAllRaycasters(); });
    SCENE.addEventListener('exit-vr', function () { P.exitVR.setAttribute('visible', 'false'); P.exitVR.setAttribute('scale', '0 0 0'); });
    P.pvHead = add(pv, panel({
      x: 0, y: 3.12, z: -3.0, w: 5.4, h: .85, px: 200, state: PV,
      draw: function (g, W, H, s) {
        var bad = s.phase === 'bad' || s.phase === 'insight_bad', moves = s.phase === 'moves', col = moves ? C.violet : (bad ? C.coral : C.green);
        var chip = moves ? 'THE MOVES' : (s.phase.indexOf('insight') === 0 ? 'INSIGHT' : (bad ? '✗  HOW NOT TO DO IT' : '✓  HOW TO DO IT'));
        g.font = '800 ' + (H * .3) + 'px ' + FONT; var tw = g.measureText(chip).width + 50;
        shadow(g, 'rgba(20,34,74,.25)', 14); rr(g, W / 2 - tw / 2, 8, tw, H * .5, H * .25); g.fillStyle = col; g.fill(); shadow(g, 'transparent', 0);
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(chip, W / 2, 8 + H * .26);
        g.textBaseline = 'alphabetic'; g.fillStyle = C.navy; g.font = '800 ' + (H * .2) + 'px ' + FONT; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 10;
        g.fillText(s.title || '', W / 2, H * .83); g.shadowBlur = 0;
      }
    }));
    P.pvBubble = add(pv, panel({
      x: 0, y: 2.1, z: -2.9, w: 3.5, h: 1.05, px: 170, sheen: true, state: PV,
      draw: function (g, W, H, s) {
        if (!s.msg) return;
        var bad = s.phase === 'bad', col = bad ? C.coral : C.green, left = s.msg.speaker === 'A';
        var p = 12; shadow(g, 'rgba(20,34,74,.25)', 20); rr(g, p, p, W - 2 * p, H - 2 * p - 18, 30); g.fillStyle = '#fff'; g.fill();
        var tx = left ? W * .22 : W * .78; g.beginPath(); g.moveTo(tx - 18, H - 22); g.lineTo(tx + (left ? -34 : 34), H - 2); g.lineTo(tx + 18, H - 22); g.fill(); shadow(g, 'transparent', 0);
        g.lineWidth = 4; g.strokeStyle = col; rr(g, p, p, W - 2 * p, H - 2 * p - 18, 30); g.stroke();
        g.textAlign = 'left'; g.fillStyle = left ? C.teal : C.blue; g.font = '800 ' + (H * .1) + 'px ' + FONT;
        g.fillText((left ? (s.roleA || 'Coach') : 'Agent').toUpperCase(), 34, H * .23);
        g.fillStyle = C.navy; g.font = '600 ' + (H * .14) + 'px ' + FONT; drawLines(g, s.msg.text, 34, H * .44, W - 68, H * .165, 4);
      }
    }));
    P.pvInsight = add(pv, panel({
      x: 0, y: 1.75, z: -2.8, w: 3.6, h: 1.5, px: 170, sheen: true, state: PV,
      draw: function (g, W, H, s) {
        var p = 12; shadow(g, 'rgba(20,34,74,.28)', 24); rr(g, p, p, W - 2 * p, H - 2 * p, 34); g.fillStyle = '#fff'; g.fill(); shadow(g, 'transparent', 0); neon(g, W, H, p, 34, 4);
        g.textAlign = 'left'; g.font = (H * .16) + 'px ' + FONT; g.fillStyle = C.sun; g.fillText('💡', 36, H * .24);
        g.fillStyle = C.sun; g.font = '800 ' + (H * .11) + 'px ' + FONT; g.fillText('INSIGHT', 36 + H * .2, H * .21);
        g.fillStyle = C.navy; g.font = '600 ' + (H * .125) + 'px ' + FONT; drawLines(g, s.insight, 36, H * .46, W - 72, H * .15, 4);
      }
    }));
    P.pvMoves = add(pv, panel({
      x: 0, y: 1.7, z: -2.7, w: 4.2, h: 2.1, px: 170, sheen: true, state: PV,
      draw: function (g, W, H, s) {
        var mv = s.moves || [], cw = (W - 3 * 20) / 2, ch = (H - 3 * 16) / 2, cols = [C.teal, C.blue, C.violet, C.coral];
        mv.slice(0, 4).forEach(function (m, i) {
          var x = 20 + (i % 2) * (cw + 20), y = 16 + Math.floor(i / 2) * (ch + 16);
          shadow(g, 'rgba(20,34,74,.22)', 16); rr(g, x, y, cw, ch, 26); g.fillStyle = '#fff'; g.fill(); shadow(g, 'transparent', 0);
          g.save(); rr(g, x, y, cw, ch, 26); g.clip(); g.fillStyle = cols[i % 4]; g.fillRect(x, y, 14, ch); g.restore();
          g.textAlign = 'left'; g.font = (ch * .32) + 'px ' + FONT; g.fillStyle = C.navy; g.fillText(m.icon || '•', x + 28, y + ch * .4);
          g.font = '800 ' + (ch * .17) + 'px ' + FONT; g.fillText(m.label || '', x + 28 + ch * .42, y + ch * .33);
          g.fillStyle = C.muted; g.font = '600 ' + (ch * .125) + 'px ' + FONT; drawLines(g, m.desc || '', x + 28, y + ch * .66, cw - 52, ch * .16, 3);
        });
      }
    }));
    P.pvNext = add(pv, pill({ x: .55, y: .55, z: -2.3, w: 2.2, h: .4, label: 'Next  ▶', bg: C.violet, sheen: true, fs: .36, onClick: function () { UI3D.pvAdvance(); } }));
    add(pv, pill({ x: -1.35, y: .55, z: -2.3, w: 1.0, h: .34, label: '‹ Back', bg: '#ffffff', fg: C.navy, onClick: function () { if (typeof cambiarPantallaVR === 'function') cambiarPantallaVR('screen-technique-list'); } }));
    ['activity-juan', 'activity-ajolin', 'speaker-name', 'listening-session-content', 'moves-container', 'text-btn-toggle-listening', 'btn-next-conversation'].forEach(function (id) { stub(pv, id, function () {}); });
    stub(pv, 'btn-toggle-active-listening', function () {});

    // ── PRÁCTICA ──
    var pr = screen('screen-practice', false);
    P.bubble = add(pr, panel({
      id: 'dialog-panel', x: 0, y: 2.55, z: -2.9, w: 3.3, h: 1.0, px: 160, sheen: true, state: S,
      draw: function (g, W, H, s) {
        var p = 12; shadow(g, 'rgba(20,34,74,.25)', 20); rr(g, p, p, W - 2 * p, H - 2 * p - 16, 30); g.fillStyle = '#fff'; g.fill();
        g.beginPath(); g.moveTo(W / 2 - 18, H - 20); g.lineTo(W / 2, H - 2); g.lineTo(W / 2 + 18, H - 20); g.fill(); shadow(g, 'transparent', 0); neon(g, W, H - 16, 12, 30, 3);
        var coach = UI3D.stage === 'coach';
        var head = coach ? 'JUANJOLOTE  ·  YOUR COACH' + (s.stageLabel ? '  ·  ' + s.stageLabel : '') : (String(s.agentName || 'AGENT') + (s.agentRole ? '  ·  ' + s.agentRole : '')).toUpperCase();
        g.fillStyle = coach ? C.teal : C.blue; g.font = '800 ' + (H * .095) + 'px ' + FONT; g.textAlign = 'left'; g.fillText(head, 34, H * .23);
        g.fillStyle = C.navy; g.font = '600 ' + (H * .135) + 'px ' + FONT; drawLines(g, s.text || '…', 34, H * .43, W - 68, H * .16, 4);
      }
    }));
    stub(pr, 'dialog-speaker', function () {}); stub(pr, 'dialog-text', function () {});
    stub(pr, 'agent-name', function (v) { S.agentName = v; P.bubble.redraw(); });
    stub(pr, 'agent-role', function (v) { S.agentRole = v; P.bubble.redraw(); });
    stub(pr, 'agent-trait', function (v) { S.agentTrait = v; });
    stub(pr, 'agent-emoji', function () {}); stub(pr, 'agent-img', function () {}); stub(pr, 'agent-halo', function () {}); stub(pr, 'agent-ring', function () {});
    P.gauge = add(pr, panel({
      id: 'openness-panel', x: -1.95, y: 1.4, z: -2.5, w: .8, h: 1.75, ry: 14, px: 170, sheen: true, state: S,
      draw: function (g, W, H, s) {
        var p = 10; shadow(g, 'rgba(20,34,74,.25)', 16); rr(g, p, p, W - 2 * p, H - 2 * p, 26); g.fillStyle = '#fff'; g.fill(); shadow(g, 'transparent', 0);
        g.textAlign = 'center'; g.fillStyle = C.navy; g.font = '800 ' + (W * .16) + 'px ' + FONT; g.fillText('MOOD', W / 2, H * .085);
        var x = W * .38, y = H * .13, w = W * .24, h = H * .55; rr(g, x, y, w, h, w / 2); g.fillStyle = '#eef2fb'; g.fill();
        var lv = Math.max(.04, Math.min(1, s.mood / 100)), gr = g.createLinearGradient(0, y + h, 0, y); gr.addColorStop(0, C.coral); gr.addColorStop(.5, C.sun); gr.addColorStop(1, C.green);
        g.save(); rr(g, x, y, w, h, w / 2); g.clip(); g.fillStyle = gr; g.fillRect(x, y + h * (1 - lv), w, h * lv); g.restore();
        var m = s.mood, face = m < 20 ? '😠' : m < 35 ? '😟' : m < 50 ? '😐' : m < 65 ? '🙂' : '😄';
        g.font = (W * .3) + 'px ' + FONT; g.fillStyle = C.navy; g.fillText(face, W / 2, H * .79); g.fillStyle = C.muted; g.font = '800 ' + (W * .15) + 'px ' + FONT; g.fillText(Math.round(m) + '%', W / 2, H * .88);
        var used = (typeof appState !== 'undefined' && appState.agentHistory) ? appState.agentHistory.filter(function (h) { return h.role === 'user'; }).length : 0;
        var max = (typeof MAX_PRACTICE_TURNS !== 'undefined') ? MAX_PRACTICE_TURNS : 10;
        g.fillStyle = C.sky; g.font = '700 ' + (W * .125) + 'px ' + FONT; g.fillText('Turn ' + Math.min(used + 1, max) + '/' + max, W / 2, H * .965);
      }
    }));
    P.you = add(pr, panel({
      x: 1.95, y: 1.4, z: -2.5, w: 1.6, h: .95, ry: -14, px: 160, state: S,
      draw: function (g, W, H, s) {
        var p = 10; shadow(g, 'rgba(20,34,74,.22)', 16); rr(g, p, p, W - 2 * p, H - 2 * p, 24); g.fillStyle = 'rgba(255,255,255,.93)'; g.fill(); shadow(g, 'transparent', 0);
        g.fillStyle = C.violet; g.font = '800 ' + (H * .11) + 'px ' + FONT; g.textAlign = 'left'; g.fillText('YOU', 26, H * .2);
        g.fillStyle = s.you ? C.navy : C.muted; g.font = (s.you ? '600 ' : 'italic 600 ') + (H * .125) + 'px ' + FONT; drawLines(g, s.you || 'Tap the mic and speak…', 26, H * .4, W - 52, H * .15, 4);
      }
    }));
    P.mic = add(pr, panel({
      id: 'vr-mic', x: 1.5, y: .75, z: -2.1, w: .62, h: .62, state: S, clickable: true,
      draw: function (g, W, H, s) {
        var rec = s.status === 'rec', col = rec ? C.coral : C.violet; shadow(g, rec ? 'rgba(255,107,107,.7)' : 'rgba(123,92,255,.55)', 22);
        g.beginPath(); g.arc(W / 2, H / 2, W * .36, 0, 7); g.fillStyle = col; g.fill(); shadow(g, 'transparent', 0);
        g.font = (W * .34) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(rec ? '⏹' : '🎤', W / 2, H / 2 + 4);
      }
    }));
    P.mic.addEventListener('click', function (e) {
      if (!isActive(P.mic)) return; e.stopPropagation();
      if (typeof appState !== 'undefined' && appState.screen === 'practice') {
        if (!isRecording && !isProcessing) startRecording(); else if (isRecording) stopRecording();
      }
    });
    P.status = add(pr, label({ id: 'vr-voice-bar', x: 1.5, y: .3, z: -2.1, w: 1.7, h: .28, text: 'Tap the mic to talk', size: .5, weight: 700, color: C.navy }));
    var endBtn = add(pr, pill({ id: 'btn-end-practice', x: -1.5, y: .28, z: -2.1, w: .9, h: .3, label: 'Finish', bg: C.coral, clickable: true }));
    stub(pr, 'vr-voice-dot', function () {}); stub(pr, 'vr-voice-label', function () {});

    // ── EVALUACIÓN ──
    var ev = screen('screen-eval', false);
    P.eval = add(ev, panel({
      x: .5, y: 1.62, z: -2.7, w: 3.5, h: 2.75, px: 150, sheen: true, state: { rows: null, text: 'Analyzing your conversation…' },
      draw: function (g, W, H, s) {
        var p = 14; shadow(g, 'rgba(20,34,74,.3)', 26); rr(g, p, p, W - 2 * p, H - 2 * p, 36); g.fillStyle = '#fff'; g.fill(); shadow(g, 'transparent', 0); neon(g, W, H, 14, 36, 4);
        g.textAlign = 'left'; g.fillStyle = C.navy; g.font = '800 ' + (H * .075) + 'px ' + FONT; g.fillText('How it went', 44, H * .11);
        if (!s.rows) { g.fillStyle = C.muted; g.font = '600 ' + (H * .05) + 'px ' + FONT; drawLines(g, s.text, 44, H * .3, W - 88, H * .065, 8); return; }
        var META = { 'COMPANY GOAL': ['🎯', C.teal], 'TECHNIQUE': ['🧩', C.blue], 'RISK SIGNALS': ['📡', C.coral], 'FOLLOW-UP': ['🗓', C.sun], 'TRY NEXT TIME': ['💡', C.violet] };
        var n = s.rows.length, rowH = Math.min(H * .145, (H * .78) / n);
        s.rows.forEach(function (r, i) {
          var y = H * .17 + i * (rowH + H * .007), m = META[r.key] || ['•', C.blue];
          rr(g, 44, y, W - 88, rowH, 22); g.fillStyle = '#f4f7fd'; g.fill();
          g.fillStyle = m[1]; g.beginPath(); g.arc(44 + rowH / 2 + 8, y + rowH / 2, rowH * .36, 0, 7); g.fill(); g.font = (rowH * .38) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(m[0], 44 + rowH / 2 + 8, y + rowH / 2 + 2);
          g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = C.muted; g.font = '800 ' + (rowH * .2) + 'px ' + FONT; g.fillText(r.key, 44 + rowH + 14, y + rowH * .27);
          var chipW = r.verdict ? 170 : 0; g.fillStyle = C.navy; g.font = '600 ' + (rowH * .27) + 'px ' + FONT; drawLines(g, r.text, 44 + rowH + 14, y + rowH * .56, W - 88 - rowH - 30 - chipW, rowH * .27, 2);
          if (r.verdict) { rr(g, W - 44 - 150, y + rowH * .2, 134, rowH * .42, 16); g.fillStyle = r.verdict === 'MET' ? C.green : r.verdict === 'PARTLY' ? C.sun : C.coral; g.fill(); g.fillStyle = '#fff'; g.font = '800 ' + (rowH * .2) + 'px ' + FONT; g.textAlign = 'center'; g.fillText(r.verdict, W - 44 - 83, y + rowH * .48); }
        });
      }
    }));
    stub(ev, 'eval-feedback', function (v) { S.evalRaw = v; refreshEval(); });
    stub(ev, 'eval-mood', function () {}); stub(ev, 'juan-eval-img', function () {});
    add(ev, pill({ id: 'btn-practice-again', x: -.35, y: .32, z: -2.3, w: 1.45, h: .36, label: 'Practice again', bg: C.teal, clickable: true, sheen: true }));
    add(ev, pill({ id: 'btn-new-session', x: 1.35, y: .32, z: -2.3, w: 1.45, h: .36, label: 'Back to menu', bg: C.navy, clickable: true }));
    CASTS['screen-eval'] = { juan: { a: -50, r: 2.6, y: .3, s: .95 } };
    stub(ev, 'juan-img', function () {});
  }

  // ───────────────────────── Actualizadores ─────────────────────────
  function refreshBriefing() {
    var raw = S.briefing.raw || '';
    var lvl = (/LEVEL:\s*([A-Za-z]+)/i.exec(raw) || [])[1] || '';
    var sc = (/(?:Scenery|Scenario):\s*"([\s\S]*?)"\s*(?:\n|$)/i.exec(raw) || [])[1] || (raw.indexOf('Scenario') < 0 && raw.indexOf('Scenery') < 0 ? raw : '');
    var tg = (/Tags:\s*([\s\S]*)$/i.exec(raw) || [])[1] || '';
    var tags = (tg.match(/\[([^\]]+)\]/g) || []).map(function (t) { return t.slice(1, -1); });
    if (P.briefing) P.briefing.upd({ title: S.briefing.title, trap: S.briefing.trap, level: lvl.toUpperCase(), scenario: sc, tags: tags });
  }

  function refreshEval() {
    var raw = String(S.evalRaw || '').trim(), keys = ['COMPANY GOAL', 'TECHNIQUE', 'RISK SIGNALS', 'FOLLOW-UP', 'TRY NEXT TIME'], rows = [];
    keys.forEach(function (k, i) {
      var re = new RegExp(k.replace('-', '[- ]') + '\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:' + keys.map(function (x) { return x.replace('-', '[- ]'); }).join('|') + ')\\s*:|$)', 'i');
      var m = re.exec(raw); if (m && m[1].trim()) {
        var t = m[1].trim().replace(/^["“]|["”]$/g, ''), row = { key: k, text: t };
        if (k === 'COMPANY GOAL') row.verdict = /^not met|^no\b/i.test(t) ? 'NOT YET' : /^partly|^partial/i.test(t) ? 'PARTLY' : /^met|^yes/i.test(t) ? 'MET' : '';
        rows.push(row);
      }
    });
    if (P.eval) P.eval.upd({ rows: rows.length >= 2 ? rows : null, text: raw || 'Analyzing your conversation…' });
  }

  // ───────────────────────── Ejemplo "cómo no / cómo sí" ─────────────────────────
  var PV_FACE = { neutral: 'neutral', talking: 'talk_mid', thinking: 'thinking', open: 'open', sad: 'sad', angry: 'angry', happy: 'happy', surprised: 'surprised' };

  function pvRender() {
    var ph = PV.phase, insight = ph.indexOf('insight') === 0, talking = (ph === 'bad' || ph === 'good') && PV.msg;
    P.pvBubble.setAttribute('visible', talking ? 'true' : 'false');
    P.pvInsight.setAttribute('visible', insight ? 'true' : 'false');
    P.pvMoves.setAttribute('visible', ph === 'moves' ? 'true' : 'false');
    UI3D.setFace('juan', insight ? 'thinking' : ph === 'moves' ? 'happy' : (PV_FACE[PV.last.A] || 'neutral'));
    UI3D.setFace('ajo', (insight || ph === 'moves') ? 'neutral' : (PV_FACE[PV.last.B] || 'neutral'));
    var lbl = talking ? 'Next  ▶' : ph === 'insight_bad' ? 'See it done right  →' : ph === 'insight_good' ? 'See the moves  →' : "I'm ready — let's go  →";
    P.pvNext.upd({ label: lbl, bg: ph === 'moves' ? C.teal : C.violet });
    P.pvHead.redraw(); P.pvBubble.redraw(); P.pvInsight.redraw(); P.pvMoves.redraw();
  }

  UI3D.pvStart = function (id) {
    var d = (typeof TECHNIQUE_PREVIEWS !== 'undefined') && TECHNIQUE_PREVIEWS[id];
    if (!d) { console.error('Sin ejemplo para la técnica', id); return; }
    PV.data = d; PV.id = id; PV.phase = 'bad'; PV.list = d.bad.exchanges; PV.idx = 0; PV.last = { A: 'neutral', B: 'neutral' };
    PV.title = d.title || ''; PV.roleA = d.roleA || 'Coach'; PV.moves = d.moves || []; PV.msg = null; PV.insight = '';
    UI3D.pvAdvance();   // muestra el primer mensaje
  };

  UI3D.pvAdvance = function () {
    var d = PV.data; if (!d) return;
    var ph = PV.phase;
    function show() { PV.msg = PV.list[PV.idx++]; PV.msg.speaker === 'A' ? (PV.last.A = PV.msg.mood || 'neutral') : (PV.last.B = PV.msg.mood || 'neutral'); }
    if (ph === 'bad' || ph === 'good') {
      if (PV.idx < PV.list.length) show();
      else { PV.phase = 'insight_' + ph; PV.msg = null; PV.insight = d[ph].insight; }
    } else if (ph === 'insight_bad') { PV.phase = 'good'; PV.list = d.good.exchanges; PV.idx = 0; show(); }
    else if (ph === 'insight_good') { PV.phase = 'moves'; PV.msg = null; }
    else if (ph === 'moves') { if (typeof cambiarPantallaVR === 'function') cambiarPantallaVR('screen-learn-work-practice'); return; }
    pvRender();
  };

  UI3D.techPage = function (delta) {
    var pages = Math.ceil(TECH_CARDS.length / TECH_PER_PAGE);
    TECH_PAGE = ((TECH_PAGE + (delta || 0)) % pages + pages) % pages;
    TECH_CARDS.forEach(function (c) {
      var on = c._page === TECH_PAGE; c.setAttribute('visible', on ? 'true' : 'false');
      c.classList.toggle('clickable', on); c.classList.toggle('sub-tecnica', on);
    });
    if (P.techPage) P.techPage.upd({ text: (TECH_PAGE + 1) + ' / ' + pages });
    if (typeof refreshAllRaycasters === 'function') refreshAllRaycasters();
  };

  UI3D.setStage = function (mode) {
    UI3D.stage = mode; var coach = mode === 'coach';
    UI3D.cast(coach ? { juan: { a: 0, r: 2.7, y: .35, s: 1.65 } } : { ajo: { a: 0, r: 2.7, y: .35, s: 1.65 } });
    P.gauge.setAttribute('visible', coach ? 'false' : 'true'); P.you.setAttribute('visible', 'true');
    if (P.bubble) P.bubble.redraw();
  };

  // Etapa de la lección ("STEP 2/4 · WHAT IT IS") que se muestra en la burbuja de Juanjolote
  var toastTimer = null;
  UI3D.toast = function (text, ms) {
    if (!P.toast) return; P.toast.upd({ text: text }); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { P.toast.upd({ text: '' }); }, ms || 7000);
  };

  UI3D.setLearnStage = function (label) { S.stageLabel = label || ''; if (P.bubble) P.bubble.redraw(); };

  // Los elementos de la pantalla llegan volando, uno tras otro (da relieve y sensación de movimiento)
  function flyIn(list) {
    var n = 0;
    list.forEach(function (k) {
      if (!k._base || k._noFly) return; var o = k.object3D, b = k._base;
      if (o.visible === false || o.scale.x === 0) return;
      o.position.set(b.x * 1.35, b.y - .5, b.z * 1.35 - .6); o.scale.set(.01, .01, .01);
      tween(o, { x: b.x, y: b.y, z: b.z, s: 1 }, 700, n++ * 65, 'back');
    });
  }
  UI3D.enter = function (id) { var sc = screens[id]; if (sc) flyIn(Array.prototype.slice.call(sc.children)); };

  UI3D.onShow = function (id) {
    if (id === 'screen-learn-work-practice') {
      var sel = (typeof appState !== 'undefined' && appState.tecnicaSeleccionada) || '', t = '', sub = '';
      if (String(sel).indexOf('interv_') === 0 && typeof INTERVENTIONS !== 'undefined') {
        var iv = INTERVENTIONS[sel.replace('interv_', '')]; if (iv) { t = iv.label; sub = 'Day ' + iv.day + ' check-in'; }
      } else if (typeof TECHNIQUES !== 'undefined' && TECHNIQUES[sel]) { t = TECHNIQUES[sel].label; sub = TECHNIQUES[sel].tagline || ''; }
      P.modeTitle.upd({ text: t || 'Choose a mode' }); P.modeSub.upd({ text: sub });
    } else if (id === 'screen-technique-list') { UI3D.techPage(0); }
    else if (id === 'screen-practice') {
      var inPractice = typeof appState !== 'undefined' && (appState.sessionMode ? appState.sessionMode === 'practice' : !!appState.currentArchetype);
      UI3D.setStage(inPractice ? 'agent' : 'coach'); P.gauge.redraw(); P.you.upd({ you: '' });
    } else if (id === 'screen-welcome' || id === 'screen-intro') { UI3D.setFace('juan', 'happy'); UI3D.setFace('ajo', 'neutral');
    } else if (id === 'screen-eval') { S.evalRaw = ''; P.eval.upd({ rows: null, text: 'Analyzing your conversation…' }); UI3D.setFace('juan', 'happy'); }
    if (id === 'screen-intro') introStep(0);
    else if (id !== 'screen-practice') UI3D.cast(CASTS[id] || {});
    if (P.hud) P.hud.upd({ text: CRUMB[id] || '' });
    UI3D.enter(id);
  };

  // ───────────────────────── Ambiente ─────────────────────────
  // Cielo de amanecer con nebulosa y estrellas, nubes abajo (sin piso: flotas entre nubes) y esferas de luz en distintas profundidades
  function buildEnvironment() {
    var c = document.createElement('canvas'); c.width = 2048; c.height = 1024; var g = c.getContext('2d'), W = c.width, H = c.height, i, x, y, r, rg;
    var gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#0f1a68'); gr.addColorStop(.28, '#2c4acb'); gr.addColorStop(.46, '#5a74ec'); gr.addColorStop(.53, '#9a8cf4'); gr.addColorStop(.62, '#eaa8ec'); gr.addColorStop(.74, '#ffd6ee'); gr.addColorStop(1, '#f4e8ff');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    function blob(x, y, r, col, a, sx) { var q = g.createRadialGradient(x, y, 2, x, y, r); q.addColorStop(0, col.replace('A', a)); q.addColorStop(1, col.replace('A', 0)); g.fillStyle = q; g.beginPath(); g.ellipse(x, y, r * (sx || 1), r, 0, 0, 7); g.fill(); }
    for (i = 0; i < 22; i++) blob(Math.random() * W, H * (.08 + Math.random() * .42), 120 + Math.random() * 230, ['rgba(25,227,255,A)', 'rgba(255,92,200,A)', 'rgba(123,92,255,A)'][i % 3], .32, 1.6);
    for (i = 0; i < 520; i++) { x = Math.random() * W; y = Math.random() * H * .52; r = Math.random() < .06 ? 3.2 : Math.random() * 1.4 + .4; g.fillStyle = 'rgba(255,255,255,' + (.35 + Math.random() * .6) + ')'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    for (i = 0; i < 46; i++) blob(Math.random() * W, H * (.58 + Math.random() * .3), 70 + Math.random() * 130, 'rgba(255,255,255,A)', .85, 2.1);
    for (i = 0; i < 10; i++) blob(Math.random() * W, H * (.42 + Math.random() * .1), 50 + Math.random() * 70, 'rgba(255,255,255,A)', .55, 2.4);
    var env = document.createElement('a-entity'); env.setAttribute('id', 'ui3d-env'); env.setAttribute('fx-clock', '');
    var sky = document.createElement('a-sky'); sky.setAttribute('src', c.toDataURL('image/jpeg', .92)); sky.setAttribute('material', 'fog:false'); env.appendChild(sky);
    SCENE.appendChild(env);
    function fx() {
      var sc = SCENE.object3D, grp = new THREE.Group(), glow = glowTexture(), pal = [0x19e3ff, 0x7b5cff, 0xff5cc8, 0xffffff, 0xffd166];
      FX.bokeh = []; FX.rings = [];
      for (var i = 0; i < 28; i++) {
        var a = Math.random() * 6.283, rad = 5 + Math.random() * 7, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: pal[i % 5], transparent: true, opacity: .25 + Math.random() * .3, depthWrite: false, toneMapped: false }));
        var s = .6 + Math.random() * 1.9; sp.scale.set(s, s, 1); sp.position.set(Math.cos(a) * rad, -.5 + Math.random() * 6.5, Math.sin(a) * rad);
        sp.userData = { y0: sp.position.y, sp: .3 + Math.random() * .5, ph: Math.random() * 6, amp: .15 + Math.random() * .4 }; grp.add(sp); FX.bokeh.push(sp);
      }
      for (i = 0; i < 6; i++) {
        var a2 = i / 6 * 6.283 + Math.random(), rad2 = 6 + Math.random() * 3;
        var rg2 = new THREE.Mesh(new THREE.TorusGeometry(.5 + Math.random() * .8, .012, 8, 64), new THREE.MeshBasicMaterial({ color: pal[i % 3], transparent: true, opacity: .55, toneMapped: false }));
        rg2.position.set(Math.cos(a2) * rad2, 1 + Math.random() * 4, Math.sin(a2) * rad2); grp.add(rg2); FX.rings.push(rg2);
      }
      sc.add(grp); FX.sky = grp;
      var n = 190, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), pl = [[.1, .89, 1], [.48, .36, 1], [1, .36, .78], [1, 1, 1]];
      for (i = 0; i < n; i++) { var aa = Math.random() * 6.283, r = 1.5 + Math.random() * 7; pos[i * 3] = Math.cos(aa) * r; pos[i * 3 + 1] = Math.random() * 5; pos[i * 3 + 2] = Math.sin(aa) * r - 1; col.set(pl[i % 4], i * 3); }
      var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      var pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .85, depthWrite: false, toneMapped: false })); sc.add(pts); FX.motes = pts;
    }
    if (SCENE.hasLoaded) fx(); else SCENE.addEventListener('loaded', fx);
  }

  // ───────────────────────── Integración con world.html ─────────────────────────
  // Se llama DESPUÉS del script principal: reemplaza las funciones que dibujaban lo viejo
  UI3D.installOverrides = function () {
    window.setDialog = function (speaker, text) {
      var sp = String(speaker || '');
      if (sp === 'YOU') { P.you.upd({ you: text }); return; }
      S.speaker = sp; S.text = text;
      UI3D.setStage(sp.toUpperCase() === 'JUANJOLOTE' ? 'coach' : 'agent');
      P.bubble.redraw(); P.gauge.redraw();
    };
    window.updateVRMood = function (val) {
      appState.vrMood = Math.max(0, Math.min(100, val)); S.mood = appState.vrMood; P.gauge.redraw();
      if (UI3D.stage === 'agent') {
        var m = S.mood, face = m < 18 ? 'angry' : m < 35 ? 'sad' : m < 62 ? 'neutral' : 'happy';
        // Si le faltaron al respeto, la cara reacciona según la personalidad (los más duros se enojan; los demás se ven heridos)
        var tone = appState.lastTone, who = appState.currentArchetype && appState.currentArchetype.id;
        if (tone === 'hostile') face = (who === 'carlos' || who === 'sandra') ? 'angry' : 'sad';
        else if (tone === 'dismissive' && m < 55) face = (who === 'carlos' || who === 'sandra') ? 'angry' : 'sad';
        UI3D.setFace('ajo', face);
      }
    };
    window.setJuanMood = function (mood) { UI3D.setFace('juan', ({ neutral: 'neutral', happy: 'happy', talking: 'neutral', sad: 'sad', thinking: 'thinking', open: 'open' })[mood] || 'neutral'); };
    window.setAjolinMood = function (mood) { UI3D.setFace('ajo', ({ neutral: 'neutral', happy: 'happy', talking: 'neutral', sad: 'sad', surprised: 'surprised', angry: 'angry', thinking: 'thinking', open: 'open' })[mood] || 'neutral'); };
    window.updateAgentAvatar = function (arch) { /* el avatar 3D ya es el mismo para todos; el nombre llega por 'agent-name' */ };
    var origHUD = window.setHUD;
    window.setHUD = function (state, lbl) {
      if (origHUD) origHUD(state, lbl);
      var text = state === 'ready' ? (/Ready/i.test(lbl) ? 'Tap the mic to talk' : lbl) : state === 'rec' ? 'Listening… tap to send' : state === 'thinking' ? 'Thinking…' : lbl;
      S.status = state; P.status.upd({ text: text, color: state === 'rec' ? C.coral : C.navy }); P.mic.upd({ status: state });
    };
    window.applyTechniquePage = function () { UI3D.techPage(0); };
    // Ejemplo "cómo no / cómo sí": reemplaza la lógica de la pantalla vieja
    window.selectAndPreviewVR = function (id) { if (typeof cambiarPantallaVR === 'function') cambiarPantallaVR('screen-active-listening-activity'); UI3D.pvStart(id); };
    window.initActiveListeningConversation = function () {}; window.avanzarConversacionActiva = function () {}; window.toggleListeningMoves = function () {};
    window.techniquePageNext = function () { UI3D.techPage(1); }; window.techniquePagePrev = function () { UI3D.techPage(-1); };
    // La boca del avatar se mueve mientras suena el audio
    var origSpeak = window.speakVR;
    window.speakVR = function (text, voice, cb) {
      var who = voice === 'daniel' ? 'juan' : 'ajo';
      var token = UI3D.talkToken = (UI3D.talkToken || 0) + 1;
      // Primero arranca speakVR (que corta el audio anterior) y DESPUÉS se enciende la boca
      var p = origSpeak(text, voice, function () { if (UI3D.talkToken === token) UI3D.talk(who, false); if (cb) cb(); });
      UI3D.talk(who, true);
      return p;
    };
    var origStop = window.stopVoice;
    window.stopVoice = function () { if (origStop) origStop(); UI3D.talk('juan', false); UI3D.talk('ajo', false); };
    // Al mostrar cada pantalla
    var origCambiar = window.cambiarPantallaVR;
    window.cambiarPantallaVR = function (id) { var r = origCambiar(id); UI3D.onShow(id); return r; };
  };

  // Construcción inmediata (antes del script principal de world.html)
  buildEnvironment();
  buildScreens();
  ROOT.appendChild(makeActor('juan')); ROOT.appendChild(makeActor('ajo'));
  // Todo (menos el cielo) se aleja 1.45 veces desde la posición de los ojos (1.6 m): se ve igual de grande pero más cómodo en el visor
  ROOT.setAttribute('scale', '1.45 1.45 1.45'); ROOT.setAttribute('position', '0 ' + (1.6 * (1 - 1.45)).toFixed(3) + ' 0');
  SCENE.appendChild(ROOT);
  UI3D.techPage(0);
  introStep(0);
})();
