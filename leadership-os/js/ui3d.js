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
  function holoTexture(col) {
    var c = document.createElement('canvas'); c.width = 8; c.height = 256; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, col + '88'); gr.addColorStop(.5, col + '1c'); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.fillRect(0, 0, 8, 256); g.fillStyle = 'rgba(255,255,255,.28)';
    for (var y = 0; y < 256; y += 10) g.fillRect(0, y, 8, 1);
    var t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function polarGrid() {
    var S = 1024, c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d'); g.translate(S / 2, S / 2);
    g.strokeStyle = 'rgba(0,150,255,.55)'; g.lineWidth = 2;
    for (var i = 1; i <= 12; i++) { g.beginPath(); g.arc(0, 0, i * S / 25, 0, 7); g.stroke(); }
    g.strokeStyle = 'rgba(123,92,255,.4)'; g.lineWidth = 1.5;
    for (var a = 0; a < 48; a++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a * Math.PI / 24) * S / 2, Math.sin(a * Math.PI / 24) * S / 2); g.stroke(); }
    var rg = g.createRadialGradient(0, 0, S * .1, 0, 0, S / 2); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(.62, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = rg; g.fillRect(-S / 2, -S / 2, S, S);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }

  // Reloj de los efectos: se registra como componente (los sistemas no se pueden añadir tarde)
  AFRAME.registerComponent('fx-clock', {
    tick: function (t) {
      var s = t / 1000, i;
      for (i = 0; i < FX.sheen.length; i++) FX.sheen[i].uniforms.time.value = s;
      for (i = 0; i < FX.beams.length; i++) FX.beams[i].offset.y = -s * .18;
      if (FX.floor) FX.floor.rotation.z = s * .012;
      if (FX.motes) {
        var p = FX.motes.geometry.attributes.position;
        for (i = 0; i < p.count; i++) { var y = p.getY(i) + .004 + (i % 5) * .0009; if (y > 4.6) y = .1; p.setY(i, y); }
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

  // o: {w,h,x,y,z,ry,px,id,sheen,state,draw(g,W,H,state),action,onClick}
  function panel(o) {
    var PX = Math.max(o.px || 0, 260), cw = Math.round(o.w * PX), ch = Math.round(o.h * PX);   // alta resolución: el texto se lee bien en el visor
    var c = document.createElement('canvas'); c.width = cw; c.height = ch; var g = c.getContext('2d');
    var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    var mat = o.sheen ? sheenMaterial(tex) : new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    var e = document.createElement('a-entity');
    if (o.id) e.setAttribute('id', o.id);
    e.setAttribute('position', (o.x || 0) + ' ' + (o.y || 0) + ' ' + (o.z || 0));
    if (o.ry) e.setAttribute('rotation', '0 ' + o.ry + ' 0');
    e.setObject3D('mesh', new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), mat));
    e._st = o.state || {};
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
      if (o.action) { evt.stopImmediatePropagation(); evt.stopPropagation(); if (typeof ejecutarFuncionPorTecnica === 'function') ejecutarFuncionPorTecnica(o.action); }
      else if (o.onClick) { evt.stopImmediatePropagation(); evt.stopPropagation(); o.onClick(evt); }
      // sin acción ni onClick: los listeners por id de world.html se encargan
    });
  }

  function card(o) {
    return panel({
      x: o.x, y: o.y, z: o.z, ry: o.ry, w: o.w, h: o.h, id: o.id, action: o.action, onClick: o.onClick, sheen: true, state: o.state,
      draw: function (g, W, H) {
        var p = 14; shadow(g, 'rgba(20,34,74,.28)', 22); rr(g, p, p, W - 2 * p, H - 2 * p, 34); g.fillStyle = C.white; g.fill(); shadow(g, 'transparent', 0);
        g.save(); rr(g, p, p, W - 2 * p, H - 2 * p, 34); g.clip(); g.fillStyle = o.color; g.fillRect(p, p, W - 2 * p, H * .34); g.restore();
        neon(g, W, H, p, 34, 4);
        g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = (H * .2) + 'px ' + FONT; g.fillText(o.icon || '', W / 2, H * .27);
        if (o.chip) { g.font = '800 ' + (H * .06) + 'px ' + FONT; var tw = g.measureText(o.chip).width + 26; rr(g, W - p - tw - 10, p + 10, tw, H * .1, H * .05); g.fillStyle = 'rgba(255,255,255,.28)'; g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(o.chip, W - p - tw / 2 - 10, p + 10 + H * .07); }
        g.textAlign = 'center'; g.fillStyle = C.navy; var fs = H * .12; g.font = '800 ' + fs + 'px ' + FONT; var maxW = W * .84;
        if (g.measureText(o.title).width > maxW) {
          var ws = o.title.split(' ');
          if (ws.length > 1) {
            var mid = Math.ceil(ws.length / 2), l1 = ws.slice(0, mid).join(' '), l2 = ws.slice(mid).join(' ');
            fs = Math.min(H * .105, fs); g.font = '800 ' + fs + 'px ' + FONT;
            while (Math.max(g.measureText(l1).width, g.measureText(l2).width) > maxW && fs > H * .06) { fs -= 2; g.font = '800 ' + fs + 'px ' + FONT; }
            g.fillText(l1, W / 2, H * (o.sub ? .52 : .56)); g.fillText(l2, W / 2, H * (o.sub ? .52 : .56) + fs * 1.05);
          } else {
            while (g.measureText(o.title).width > maxW && fs > H * .06) { fs -= 2; g.font = '800 ' + fs + 'px ' + FONT; }
            g.fillText(o.title, W / 2, H * .6);
          }
        } else g.fillText(o.title, W / 2, H * (o.sub ? .55 : .6));
        if (o.sub) { g.fillStyle = C.muted; g.font = (H * (o.subSize || .072)) + 'px ' + FONT; g.textAlign = 'center'; drawLines(g, o.sub, W / 2, H * .76, W * .82, H * .085, 2); }
      }
    });
  }

  function pill(o) {
    return panel({
      x: o.x, y: o.y, z: o.z, w: o.w, h: o.h, id: o.id, action: o.action, onClick: o.onClick, clickable: o.clickable, sheen: !!o.sheen, state: { label: o.label },
      draw: function (g, W, H, s) {
        var p = 8; shadow(g, 'rgba(20,34,74,.25)', 14); rr(g, p, p, W - 2 * p, H - 2 * p, (H - 2 * p) / 2); g.fillStyle = s.bg || o.bg || C.navy; g.fill(); shadow(g, 'transparent', 0);
        g.fillStyle = o.fg || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + (H * (o.fs || .38)) + 'px ' + FONT; g.fillText(s.label, W / 2, H / 2 + 2);
      }
    });
  }

  function label(o) {
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

  function avatar(who, x, z, scale) {
    var e = document.createElement('a-entity');
    e.setAttribute('gltf-model', 'assets/ajolotes/' + who + '.glb');
    e.setAttribute('position', x + ' 0 ' + z); e.setAttribute('scale', scale + ' ' + scale + ' ' + scale);
    e.setAttribute('look-at', '[camera]');
    e.setAttribute('animation', 'property:position;to:' + x + ' .05 ' + z + ';dir:alternate;loop:true;dur:2600;easing:easeInOutSine');
    e._who = who; e._face = UI3D.baseFace[who] || 'neutral';
    e.setFace = function (face) {
      e._face = face;
      faceTexture(who, face, function (t) {
        if (e._face !== face) return;
        e.object3D.traverse(function (o) { if (o.isMesh && o.material) { o.material.map = t; o.material.needsUpdate = true; } });
      });
    };
    e.addEventListener('model-loaded', function () { e.setFace(e._face); });
    (UI3D.avatars = UI3D.avatars || {})[who] = (UI3D.avatars[who] || []).concat(e);
    return e;
  }

  function pedestal(x, z, col, noBeam) {
    var g = document.createElement('a-entity'); g.setAttribute('position', x + ' 0 ' + z);
    g.innerHTML = '<a-cylinder radius=".8" height=".1" position="0 .05 0" color="#ffffff" material="shader:flat"></a-cylinder>' +
      '<a-torus radius=".8" radius-tubular=".02" rotation="90 0 0" position="0 .11 0" color="' + col + '" material="shader:flat"></a-torus>' +
      '<a-ring rotation="-90 0 0" position="0 .12 0" radius-inner=".78" radius-outer=".82" color="' + col + '" material="shader:flat;transparent:true;opacity:.7" animation="property:scale;from:1 1 1;to:1.55 1.55 1.55;dur:2400;loop:true;easing:easeOutQuad" animation__f="property:material.opacity;from:.7;to:0;dur:2400;loop:true;easing:easeOutQuad"></a-ring>';
    if (!noBeam) {
      var tex = holoTexture(col); tex.repeat.set(1, 3);
      var beam = new THREE.Mesh(new THREE.CylinderGeometry(.62, .8, 1.5, 48, 1, true), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      beam.position.y = .75; var be = document.createElement('a-entity'); be.setObject3D('beam', beam); g.appendChild(be); FX.beams.push(tex);
    }
    return g;
  }

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
  var TECH_PAGE = 0, TECH_CARDS = [], TECH_PER_PAGE = 6;

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

  function buildScreens() {
    // ── INTRO ──
    var intro = screen('screen-intro', true);
    add(intro, label({ x: 0, y: 3.5, z: -3.2, w: 5, h: .3, text: '// ATTRITION DETECTION TRAINING', size: .5, weight: 700, color: '#0a9bd8' }));
    add(intro, label({ x: 0, y: 3.05, z: -3.2, w: 5, h: .8, text: 'Neural Academy', size: .62 }));
    add(intro, label({ x: 0, y: 2.55, z: -3.2, w: 5.4, h: .4, text: 'Learn to spot attrition risk — and follow up well', size: .5, weight: 600, color: C.sky }));
    add(intro, pill({ x: 0, y: 1.6, z: -2.4, w: 1.9, h: .5, label: 'START', bg: C.violet, action: 'start-app', fs: .42, sheen: true }));
    add(intro, label({ x: 0, y: 1.1, z: -2.4, w: 3.4, h: .3, text: 'Drag to look around · click to select', size: .5, weight: 600, color: C.muted }));
    add(intro, label({ x: 0, y: .82, z: -2.4, w: 3.4, h: .3, text: 'In VR: point and pull the trigger', size: .5, weight: 600, color: C.muted }));
    add(intro, pedestal(-2.7, -3.0, C.teal)); add(intro, avatar('juan', -2.7, -3.0, 1.3));
    add(intro, pedestal(2.7, -3.0, C.blue)); add(intro, avatar('ajo', 2.7, -3.0, 1.3));

    // ── BIENVENIDA ──
    var wel = screen('screen-welcome', false);
    add(wel, label({ x: 0, y: 3.5, z: -3.2, w: 5, h: .3, text: '// ATTRITION DETECTION TRAINING', size: .5, weight: 700, color: '#0a9bd8' }));
    add(wel, label({ x: 0, y: 3.05, z: -3.2, w: 5, h: .8, text: 'Neural Academy', size: .62 }));
    add(wel, label({ x: 0, y: 2.58, z: -3.2, w: 5.4, h: .4, text: 'Learn to spot attrition risk — and follow up well', size: .5, weight: 600, color: C.sky }));
    add(wel, card({ x: -.84, y: 1.45, z: -2.4, w: 1.45, h: 1.35, ry: 6, color: C.teal, icon: '🎯', title: 'Interventions', sub: 'Practice real check-in conversations', action: 'interventions' }));
    add(wel, card({ x: .84, y: 1.45, z: -2.4, w: 1.45, h: 1.35, ry: -6, color: C.violet, icon: '🧠', title: 'Techniques', sub: '14 tools to run them well', action: 'techniques' }));
    add(wel, pill({ x: 0, y: .62, z: -2.2, w: 1.3, h: .34, label: 'My progress', bg: '#ffffff', fg: C.navy, action: 'progress' }));
    var back = add(wel, pill({ id: 'btn-back-activity-previous', x: 0, y: .22, z: -2.2, w: 2.1, h: .3, label: 'Back to previous activity', bg: C.sun, fs: .34, action: 'replay-previous-flow' }));
    back.setAttribute('visible', 'false');
    add(wel, pill({ id: 'btn-logout', x: 2.1, y: .28, z: -2.0, w: 1.15, h: .26, label: 'Unpair device', bg: 'rgba(20,34,74,.55)', fs: .34, clickable: true }));
    add(wel, pedestal(-2.7, -3.0, C.teal)); add(wel, avatar('juan', -2.7, -3.0, 1.3));
    add(wel, label({ x: -2.85, y: 1.95, z: -3.0, w: 1.3, h: .5, text: 'Juanjolote', sub: 'Your coach', color: C.teal, size: .55 }));
    add(wel, pedestal(2.7, -3.0, C.blue)); add(wel, avatar('ajo', 2.7, -3.0, 1.3));
    add(wel, label({ x: 2.85, y: 1.95, z: -3.0, w: 1.3, h: .5, text: 'Ajolín', sub: 'The agent', color: C.blue, size: .55 }));

    // ── INTERVENCIONES ──
    var iv = screen('screen-interventions', false);
    add(iv, label({ x: 0, y: 3.0, z: -2.9, w: 5, h: .55, text: 'Interventions', size: .6 }));
    add(iv, label({ x: 0, y: 2.62, z: -2.9, w: 5.6, h: .34, text: 'Check-ins that help you spot attrition early', size: .5, weight: 600, color: C.sky }));
    var IV = [['💓', 'Pulse Check', 'Day 30 · First impressions and onboarding', C.teal, 'interv-retencion', 'DAY 30'],
              ['⚓', 'Anchoring', 'Day 100 · Engagement and belonging', C.blue, 'interv-soporte-critico', 'DAY 100'],
              ['🗣️', 'Stay Interview', 'Day 121 · Retention risks and unmet needs', C.violet, 'interv-reclamaciones', 'DAY 121'],
              ['🏅', 'Tenure Renewal', 'Day 365 · Reflection and long-term retention', C.coral, 'interv-tenure-renewal', 'DAY 365']];
    IV.forEach(function (d, i) {
      var col = i % 2, row = Math.floor(i / 2);
      add(iv, card({ x: (col ? 1 : -1) * 1.0, y: 1.95 - row * 1.12, z: -2.6, ry: (col ? -1 : 1) * 5, w: 1.85, h: 1.0, color: d[3], icon: d[0], title: d[1], sub: d[2], chip: d[5], action: d[4], subSize: .082 }));
    });
    add(iv, pill({ x: 0, y: .28, z: -2.2, w: 1.0, h: .3, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'close-history' }));

    // ── MODO (Learn / Work Together / Practice) ──
    var md = screen('screen-learn-work-practice', false);
    P.modeTitle = add(md, label({ x: 0, y: 3.0, z: -2.9, w: 5.6, h: .55, text: 'Choose a mode', size: .6 }));
    P.modeSub = add(md, label({ x: 0, y: 2.62, z: -2.9, w: 5.6, h: .34, text: '', size: .5, weight: 600, color: C.sky }));
    var MD = [['📖', 'Learn', 'Juanjolote teaches using your own experience', C.teal, 'learn-intervention'],
              ['🧩', 'Work Together', 'Bring a real case and find the answer yourself', C.blue, 'work-together-intervention'],
              ['🎭', 'Practice', 'Role-play with an agent and get feedback', C.coral, 'practice-intervention']];
    MD.forEach(function (d, i) { add(md, card({ x: (i - 1) * 1.62, y: 1.6, z: -2.7, ry: (1 - i) * 7, w: 1.5, h: 1.45, color: d[3], icon: d[0], title: d[1], sub: d[2], action: d[4], subSize: .084 })); });
    add(md, pill({ x: 0, y: .42, z: -2.3, w: 1.0, h: .3, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-technicas' }));

    // ── TÉCNICAS ──
    var tl = screen('screen-technique-list', false);
    add(tl, label({ x: 0, y: 3.0, z: -2.9, w: 5, h: .55, text: 'Choose a technique', size: .6 }));
    add(tl, label({ x: 0, y: 2.62, z: -2.9, w: 5.6, h: .34, text: 'Quick example · guided lesson · practice', size: .5, weight: 600, color: C.sky }));
    techList().forEach(function (t, i) {
      var pg = Math.floor(i / TECH_PER_PAGE), k = i % TECH_PER_PAGE, col = k % 3, row = Math.floor(k / 3);
      var cd = card({ x: (col - 1) * 1.62, y: 1.98 - row * 1.1, z: -2.7, ry: (1 - col) * 7, w: 1.5, h: .98, color: t.color, icon: t.icon, title: t.title, action: t.action });
      cd._page = pg; add(tl, cd); TECH_CARDS.push(cd);
    });
    add(tl, pill({ id: 'btn-tech-list-back', x: -1.1, y: .28, z: -2.2, w: .9, h: .3, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-technicas' }));
    P.techPage = add(tl, label({ id: 'tech-page-indicator', x: 0, y: .28, z: -2.2, w: 1.4, h: .3, text: '1 / 3', size: .5, weight: 700, color: C.navy }));
    // El código antiguo le escribe un 'text' a este id; se ignora para que no aparezca un texto duplicado
    (function (el) { var orig = el.setAttribute.bind(el); el.setAttribute = function (n) { if (n === 'text') return; return orig.apply(null, arguments); }; })(P.techPage);
    add(tl, pill({ x: .55, y: .28, z: -2.2, w: .75, h: .3, label: '‹', bg: C.navy, onClick: function () { UI3D.techPage(-1); } }));
    add(tl, pill({ x: 1.35, y: .28, z: -2.2, w: .75, h: .3, label: '›', bg: C.navy, onClick: function () { UI3D.techPage(1); } }));

    // ── NIVEL ──
    var lv = screen('screen-level-selector', false);
    add(lv, label({ x: 0, y: 3.0, z: -2.9, w: 5, h: .55, text: 'Select your level', size: .6 }));
    add(lv, label({ x: 0, y: 2.62, z: -2.9, w: 5.6, h: .34, text: 'Choose how challenging the agent will be', size: .5, weight: 600, color: C.sky }));
    var LV = [['🌱', 'Beginner', 'Guides on screen · open, receptive agent', C.green, 'level-novice'],
              ['⚖️', 'Intermediate', 'Less help · realistic reactions', C.sun, 'level-intermediate'],
              ['🔥', 'Expert', 'No help · guarded or emotional agent', C.coral, 'level-expert']];
    LV.forEach(function (d, i) { add(lv, card({ x: (i - 1) * 1.62, y: 1.6, z: -2.7, ry: (1 - i) * 7, w: 1.5, h: 1.45, color: d[3], icon: d[0], title: d[1], sub: d[2], action: d[4], subSize: .084 })); });
    add(lv, pill({ id: 'btn-level-back', x: 0, y: .42, z: -2.3, w: 1.0, h: .3, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-to-learn-work' }));

    // ── BRIEFING ──
    var br = screen('screen-intervention-briefing', false);
    P.briefing = add(br, panel({
      x: 0, y: 1.75, z: -2.7, w: 3.7, h: 2.5, px: 150, sheen: true, state: { title: '', trap: '', level: '', scenario: '', tags: [] },
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
    add(br, pill({ x: -.95, y: .36, z: -2.4, w: 1.1, h: .34, label: '‹ Back', bg: '#ffffff', fg: C.navy, action: 'back-to-learn-work' }));
    add(br, pill({ x: .85, y: .36, z: -2.4, w: 2.0, h: .38, label: 'Start practice  ➔', bg: C.teal, action: 'start-briefed-practice', sheen: true }));
    stub(br, 'briefing-title', function (v) { S.briefing.title = v; refreshBriefing(); });
    stub(br, 'briefing-trap', function (v) { S.briefing.trap = v; refreshBriefing(); });
    stub(br, 'briefing-tags', function (v) { S.briefing.raw = v; refreshBriefing(); });

    // ── EJEMPLO "CÓMO NO / CÓMO SÍ" (reemplaza la pantalla vieja, que usaba el mismo id) ──
    var pv = screen('screen-active-listening-activity', false);
    add(pv, pedestal(-2.2, -3.0, C.teal, true)); add(pv, avatar('juan', -2.2, -3.0, 1.25));
    add(pv, pedestal(2.2, -3.0, C.blue, true)); add(pv, avatar('ajo', 2.2, -3.0, 1.25));
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
    P.pvNext = add(pv, pill({ x: .4, y: .42, z: -2.3, w: 2.4, h: .4, label: 'Next  ▶', bg: C.violet, sheen: true, fs: .36, onClick: function () { UI3D.pvAdvance(); } }));
    add(pv, pill({ x: -1.5, y: .42, z: -2.3, w: 1.1, h: .34, label: '‹ Back', bg: '#ffffff', fg: C.navy, onClick: function () { if (typeof cambiarPantallaVR === 'function') cambiarPantallaVR('screen-technique-list'); } }));
    ['activity-juan', 'activity-ajolin', 'speaker-name', 'listening-session-content', 'moves-container', 'text-btn-toggle-listening', 'btn-next-conversation'].forEach(function (id) { stub(pv, id, function () {}); });
    stub(pv, 'btn-toggle-active-listening', function () {});

    // ── PRÁCTICA ──
    var pr = screen('screen-practice', false);
    UI3D.pedAgent = add(pr, pedestal(0, -2.9, C.blue, true)); UI3D.avAgent = add(pr, avatar('ajo', 0, -2.9, 1.35));
    UI3D.pedCoach = add(pr, pedestal(0, -2.9, C.teal, true)); UI3D.avCoach = add(pr, avatar('juan', 0, -2.9, 1.35)); UI3D.pedCoach.setAttribute('visible', 'false'); UI3D.avCoach.setAttribute('visible', 'false');
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
      id: 'vr-mic', x: .75, y: .66, z: -2.1, w: .62, h: .62, state: S, clickable: true,
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
    P.status = add(pr, label({ id: 'vr-voice-bar', x: .75, y: .28, z: -2.1, w: 1.7, h: .28, text: 'Tap the mic to talk', size: .5, weight: 700, color: C.navy }));
    var endBtn = add(pr, pill({ id: 'btn-end-practice', x: -.75, y: .66, z: -2.1, w: .9, h: .3, label: 'Finish', bg: C.coral, clickable: true }));
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
    add(ev, pedestal(-2.2, -2.5, C.teal)); add(ev, avatar('juan', -2.2, -2.5, 1.5));
    add(ev, label({ x: -2.2, y: 2.0, z: -2.5, w: 1.8, h: .5, text: 'Juanjolote', sub: 'Your coach', color: C.teal, size: .55 }));
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
    UI3D.avAgent.setAttribute('visible', coach ? 'false' : 'true'); UI3D.pedAgent.setAttribute('visible', coach ? 'false' : 'true');
    UI3D.avCoach.setAttribute('visible', coach ? 'true' : 'false'); UI3D.pedCoach.setAttribute('visible', coach ? 'true' : 'false');
    P.gauge.setAttribute('visible', coach ? 'false' : 'true'); P.you.setAttribute('visible', 'true');
    if (P.bubble) P.bubble.redraw();
  };

  // Etapa de la lección ("STEP 2/4 · WHAT IT IS") que se muestra en la burbuja de Juanjolote
  UI3D.setLearnStage = function (label) { S.stageLabel = label || ''; if (P.bubble) P.bubble.redraw(); };

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
  };

  // ───────────────────────── Ambiente ─────────────────────────
  function buildEnvironment() {
    var c = document.createElement('canvas'); c.width = 2048; c.height = 1024; var g = c.getContext('2d'), W = c.width, H = c.height;
    var gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#2b6fd6'); gr.addColorStop(.45, '#6ec1ff'); gr.addColorStop(.68, '#bfe6ff'); gr.addColorStop(.8, '#ffe3bd'); gr.addColorStop(1, '#fff1dc');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 14; i++) { var x = Math.random() * W, y = H * (.12 + Math.random() * .38), r = 40 + Math.random() * 70; var rg = g.createRadialGradient(x, y, 2, x, y, r); rg.addColorStop(0, 'rgba(255,255,255,.75)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.ellipse(x, y, r * 1.9, r * .8, 0, 0, 7); g.fill(); }
    var env = document.createElement('a-entity'); env.setAttribute('id', 'ui3d-env'); env.setAttribute('fx-clock', '');
    var sky = document.createElement('a-sky'); sky.setAttribute('src', c.toDataURL('image/jpeg', .92)); sky.setAttribute('material', 'fog:false'); env.appendChild(sky);
    env.insertAdjacentHTML('beforeend',
      '<a-circle rotation="-90 0 0" radius="16" color="#fff1dc" material="shader:flat"></a-circle>' +
      '<a-ring rotation="-90 0 0" position="0 .01 0" radius-inner="3.3" radius-outer="3.36" color="#ffc58a" material="shader:flat;opacity:.9;transparent:true"></a-ring>' +
      '<a-ring rotation="-90 0 0" position="0 .01 0" radius-inner="6.0" radius-outer="6.05" color="#ffd9aa" material="shader:flat;opacity:.8;transparent:true"></a-ring>');
    SCENE.appendChild(env);
    function fx() {
      var sc = SCENE.object3D;
      var fl = new THREE.Mesh(new THREE.CircleGeometry(9, 96), new THREE.MeshBasicMaterial({ map: polarGrid(), transparent: true, opacity: .6, depthWrite: false, toneMapped: false }));
      fl.rotation.x = -Math.PI / 2; fl.position.y = .008; sc.add(fl); FX.floor = fl;
      var n = 170, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), pal = [[.1, .89, 1], [.48, .36, 1], [1, .36, .78], [1, 1, 1]];
      for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, r = 1.5 + Math.random() * 7; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 4.6; pos[i * 3 + 2] = Math.sin(a) * r - 1; col.set(pal[i % 4], i * 3); }
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
  SCENE.appendChild(ROOT);
  UI3D.techPage(0);
})();
