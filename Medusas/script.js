'use strict';

const C = document.getElementById('c');
const X = C.getContext('2d');
let W, H;

function resize() { W = C.width = window.innerWidth; H = C.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function n1(x, s = 0) {
  return Math.sin(x * .713 + s) * .5 + Math.sin(x * 1.979 + s * 1.3) * .3 + Math.sin(x * 4.321 + s * 2.7) * .2;
}

/* ── COLOR PALETTES ── */
const PALETTES = [
  { bell:'#0a28a0', bell2:'#1840c8', bell3:'#0818d0', rim:'#4878ff', inner:'#6090ff',
    glow:'rgba(40,80,255,',   tent:'#2048e0', tent2:'#3060f0', dots:'#80b0ff',  label:'Azul Abismo' },
  { bell:'#380878', bell2:'#5010a8', bell3:'#280560', rim:'#9040e0', inner:'#a860f8',
    glow:'rgba(120,40,220,',  tent:'#6018b0', tent2:'#7828c8', dots:'#c080ff',  label:'Violeta Profundo' },
  { bell:'#050514', bell2:'#0c0a28', bell3:'#08061c', rim:'#2020a0', inner:'#3030c8',
    glow:'rgba(20,20,140,',   tent:'#101048', tent2:'#181870', dots:'#4040d0',  label:'Negro Abismal' },
  { bell:'#041848', bell2:'#082870', bell3:'#021030', rim:'#1878c8', inner:'#28a0e0',
    glow:'rgba(20,120,220,',  tent:'#0848a0', tent2:'#1060b8', dots:'#60c0ff',  label:'Azul Glacial' },
  { bell:'#1a0430', bell2:'#2c0848', bell3:'#120220', rim:'#6010a0', inner:'#8020c0',
    glow:'rgba(80,10,150,',   tent:'#380860', tent2:'#500880', dots:'#9040c0',  label:'Umbra' },
];

/* ── PARTICLES (bioluminescent) ── */
const PARTS = Array.from({ length: 180 }, () => newPart());

function newPart(fromClick = false, cx = 0, cy = 0) {
  return {
    x:       fromClick ? cx : Math.random() * 100,
    y:       fromClick ? cy / H * 100 : Math.random() * 100,
    vx:      (Math.random() - .5) * .12,
    vy:      -(Math.random() * .08 + .02),
    r:       Math.random() * 2.2 + .5,
    a:       Math.random() * .6 + .2,
    ph:      Math.random() * Math.PI * 2,
    sp:      .012 + Math.random() * .02,
    col:     Math.random() < .45 ? 'rgba(60,100,255,' : 'rgba(120,50,220,',
    drift:   Math.random() * Math.PI * 2,
    life:    0,
    maxLife: 200 + Math.random() * 400,
  };
}

function drawParts() {
  PARTS.forEach((p, i) => {
    p.life++; p.drift += .008;
    p.x += p.vx + Math.sin(p.drift) * .08;
    p.y += p.vy;
    p.ph += p.sp;
    if (p.y < -3 || p.life > p.maxLife) { PARTS[i] = newPart(); return; }
    const a = p.a * (.4 + .6 * Math.sin(p.ph)) * (1 - p.life / p.maxLife * .5);
    X.globalAlpha = a * .55;
    const pg = X.createRadialGradient(p.x / 100 * W, p.y / 100 * H, 0, p.x / 100 * W, p.y / 100 * H, p.r * 3);
    pg.addColorStop(0, p.col + '.8)'); pg.addColorStop(1, 'transparent');
    X.fillStyle = pg; X.beginPath(); X.arc(p.x / 100 * W, p.y / 100 * H, p.r * 3, 0, Math.PI * 2); X.fill();
    X.globalAlpha = a; X.fillStyle = p.col + '1)';
    X.beginPath(); X.arc(p.x / 100 * W, p.y / 100 * H, p.r, 0, Math.PI * 2); X.fill();
    X.globalAlpha = 1;
  });
}

/* ── CAUSTICS ── */
const CAUSTICS = Array.from({ length: 20 }, () => ({
  x:  Math.random() * 100,
  y:  Math.random() * 100,
  r:  60 + Math.random() * 100,
  sp: .0012 + Math.random() * .002,
  ph: Math.random() * Math.PI * 2,
}));

function drawCaustics(t) {
  X.save(); X.globalCompositeOperation = 'screen';
  CAUSTICS.forEach(c => {
    const a  = .012 + .008 * Math.sin(t * c.sp + c.ph);
    const cg = X.createRadialGradient(c.x / 100 * W, c.y / 100 * H, 0, c.x / 100 * W, c.y / 100 * H, c.r);
    cg.addColorStop(0, `rgba(30,60,180,${a})`); cg.addColorStop(1, 'transparent');
    X.fillStyle = cg; X.beginPath(); X.arc(c.x / 100 * W, c.y / 100 * H, c.r, 0, Math.PI * 2); X.fill();
  });
  X.globalCompositeOperation = 'source-over'; X.restore();
}

/* ── JELLYFISH CLASS ── */
class Jellyfish {
  constructor(x, y, size, pal, depth = 1) {
    this.x = x; this.y = y; this.tx = x; this.ty = y;
    this.size = size; this.pal = pal;
    this.ph        = Math.random() * Math.PI * 2;
    this.pulseSp   = .012 + Math.random() * .018;
    this.driftSp   = .003 + Math.random() * .005;
    this.driftPh   = Math.random() * Math.PI * 2;
    this.driftAmt  = size * .18 + Math.random() * size * .12;
    this.riseSp    = .08 + Math.random() * .12;
    this.depth     = depth;
    this.rotation  = 0;
    this.rotSp     = (Math.random() - .5) * .004;
    this.alpha     = clamp(depth * .85 + .15, 0.18, 1);
    this.tentCount = 8 + Math.floor(Math.random() * 6);
    this.tentLens  = Array.from({ length: this.tentCount }, (_, i) => size * (1.8 + Math.abs(Math.sin(i * 1.7)) * .9 + Math.random() * .6));
    this.tentWave  = Array.from({ length: this.tentCount }, () => Math.random() * Math.PI * 2);
    this.tentSp    = Array.from({ length: this.tentCount }, () => (.015 + Math.random() * .02) * (Math.random() < .5 ? 1 : -1));
    this.filCount  = 5 + Math.floor(Math.random() * 4);
    this.dots      = Array.from({ length: 12 }, (_, i) => ({ angle: (i / 12) * Math.PI * 2, r: Math.random() * .8 + .3 }));
  }

  update() {
    this.ph     += this.pulseSp;
    this.driftPh += this.driftSp;
    this.rotation += this.rotSp;
    this.x = this.tx + Math.sin(this.driftPh) * this.driftAmt;
    this.y -= this.riseSp;
    if (this.y < -this.size * 3) this.y = H + this.size * 2;
    this.tentWave = this.tentWave.map((w, i) => w + this.tentSp[i]);
  }

  draw(t) {
    const pulse = .5 + .5 * Math.sin(this.ph);
    const S = this.size * (1 + pulse * .08);
    const x = this.x, y = this.y, P = this.pal;
    X.save(); X.translate(x, y); X.rotate(this.rotation); X.globalAlpha = this.alpha;

    // Outer glow
    const gr = S * 2.8 * (1 + pulse * .15);
    const gg = X.createRadialGradient(0, 0, 0, 0, 0, gr);
    gg.addColorStop(0, P.glow + (pulse * .12) + ')');
    gg.addColorStop(.45, P.glow + (pulse * .05) + ')');
    gg.addColorStop(1, 'transparent');
    X.fillStyle = gg; X.beginPath(); X.ellipse(0, 0, gr, gr * .7, 0, 0, Math.PI * 2); X.fill();

    this.drawTentacles(S, pulse, P, t);
    this.drawBell(S, pulse, P);
    this.drawFilaments(S, pulse, P, t);

    X.globalAlpha = 1; X.restore();
  }

  drawBell(S, pulse, P) {
    X.globalAlpha = this.alpha * .5;
    X.fillStyle = 'rgba(0,0,0,.25)';
    X.beginPath(); X.ellipse(S * .06, S * .08, S * .88, S * .55, 0, 0, Math.PI * 2); X.fill();

    const bg = X.createRadialGradient(-S * .22, -S * .28, S * .05, -S * .1, -S * .1, S);
    bg.addColorStop(0, P.inner); bg.addColorStop(.42, P.bell2); bg.addColorStop(.78, P.bell); bg.addColorStop(1, P.bell3);
    X.globalAlpha = this.alpha * .95; X.fillStyle = bg;
    X.beginPath(); X.moveTo(-S * .85, 0);
    X.bezierCurveTo(-S * .85, -S * .82, -S * .5, -S * 1.1, 0, -S * 1.1);
    X.bezierCurveTo(S * .5, -S * 1.1, S * .85, -S * .82, S * .85, 0);
    const scallops = 8;
    for (let sc = 0; sc < scallops; sc++) {
      const a1 = (sc / scallops) * Math.PI, a2 = ((sc + .5) / scallops) * Math.PI, a3 = ((sc + 1) / scallops) * Math.PI;
      const ix1 = Math.cos(Math.PI - a1) * S * .85, iy1 = Math.sin(a1) * S * .22;
      const cx1 = Math.cos(Math.PI - a2) * S * .88 * (1 + pulse * .04), cy1 = Math.sin(a2) * S * .38 * (1 + pulse * .04);
      const ix2 = Math.cos(Math.PI - a3) * S * .85, iy2 = Math.sin(a3) * S * .22;
      if (sc === 0) X.lineTo(ix1, iy1);
      X.quadraticCurveTo(cx1, cy1, ix2, iy2);
    }
    X.closePath(); X.fill();

    const ih = X.createRadialGradient(-S * .3, -S * .55, S * .02, -S * .15, -S * .35, S * .55);
    ih.addColorStop(0, 'rgba(255,255,255,.18)'); ih.addColorStop(.45, 'rgba(180,200,255,.06)'); ih.addColorStop(1, 'transparent');
    X.fillStyle = ih; X.beginPath(); X.ellipse(-S * .18, -S * .38, S * .42, S * .45, .15, 0, Math.PI * 2); X.fill();

    X.strokeStyle = P.rim; X.lineWidth = .8; X.globalAlpha = this.alpha * .3;
    for (let rib = 0; rib < 8; rib++) {
      const ra = (rib / 8) * Math.PI * 2, rLen = S * (rib % 2 === 0 ? .75 : .62);
      X.beginPath(); X.moveTo(0, -S * .1);
      X.quadraticCurveTo(Math.cos(ra) * rLen * .5, Math.sin(ra) * rLen * .5 - S * .5, Math.cos(ra) * rLen * .85, Math.sin(ra) * rLen * .25); X.stroke();
    }

    X.globalAlpha = this.alpha * (.45 + pulse * .25); X.strokeStyle = P.rim; X.lineWidth = S * .035;
    X.beginPath();
    for (let sc = 0; sc < 8; sc++) {
      const a2 = ((sc + .5) / 8) * Math.PI;
      const cx1 = Math.cos(Math.PI - a2) * S * .88 * (1 + pulse * .04), cy1 = Math.sin(a2) * S * .38 * (1 + pulse * .04);
      sc === 0 ? X.moveTo(cx1, cy1) : X.lineTo(cx1, cy1);
    }
    X.stroke();

    X.globalAlpha = this.alpha * (.6 + pulse * .3);
    this.dots.forEach(d => {
      const dx = Math.cos(d.angle) * S * .82, dy = Math.sin(d.angle) * S * .2 - S * .05;
      const dg = X.createRadialGradient(dx, dy, 0, dx, dy, S * .06);
      dg.addColorStop(0, P.dots); dg.addColorStop(1, 'transparent');
      X.fillStyle = dg; X.beginPath(); X.arc(dx, dy, S * .06, 0, Math.PI * 2); X.fill();
    });

    X.globalAlpha = this.alpha * .7;
    const org = X.createRadialGradient(0, -S * .18, S * .02, 0, -S * .2, S * .22);
    org.addColorStop(0, P.inner); org.addColorStop(.5, P.bell2); org.addColorStop(1, 'transparent');
    X.fillStyle = org; X.beginPath(); X.ellipse(0, -S * .2, S * .18, S * .28, 0, 0, Math.PI * 2); X.fill();
    X.strokeStyle = P.rim; X.lineWidth = S * .018; X.globalAlpha = this.alpha * .35;
    for (let st = 0; st < 4; st++) {
      const sa = (st / 4) * Math.PI * 2;
      X.beginPath(); X.moveTo(0, -S * .05);
      X.bezierCurveTo(Math.cos(sa) * S * .12, -S * .02 + Math.sin(sa) * S * .12, Math.cos(sa) * S * .16, S * .08 + Math.sin(sa) * S * .06, Math.cos(sa) * S * .12, S * .15); X.stroke();
    }
  }

  drawTentacles(S, pulse, P, t) {
    X.globalAlpha = this.alpha * .7;
    for (let ti = 0; ti < this.tentCount; ti++) {
      const angle  = ((ti / this.tentCount) - 0.5) * Math.PI * .95;
      const startX = Math.cos(angle) * S * .78, startY = Math.sin(angle) * S * .18;
      const tLen   = this.tentLens[ti], wave = this.tentWave[ti];
      const segs   = 14;

      X.strokeStyle = P.tent; X.lineWidth = S * .025 * (1 - ti * .02 + .5); X.lineCap = 'round';
      X.beginPath(); X.moveTo(startX, startY);
      for (let seg = 0; seg < segs; seg++) {
        const pct = (seg + 1) / segs;
        const wx = Math.sin(wave + seg * .6 + t * .02) * S * (0.12 + pct * .18) * (1 + pulse * .15);
        const wy = Math.sin(wave * 1.3 + seg * .4 + t * .015) * S * .06;
        X.lineTo(startX + Math.cos(angle) * tLen * pct * .3 + wx, startY + tLen * pct + wy);
      }
      X.stroke();

      X.globalAlpha = this.alpha * .35; X.strokeStyle = P.tent2; X.lineWidth = S * .01;
      X.beginPath(); X.moveTo(startX, startY);
      for (let seg = 0; seg < segs; seg++) {
        const pct = (seg + 1) / segs;
        const wx = Math.sin(wave + seg * .6 + t * .02) * S * (0.12 + pct * .18) * (1 + pulse * .15);
        const wy = Math.sin(wave * 1.3 + seg * .4 + t * .015) * S * .06;
        X.lineTo(startX + Math.cos(angle) * tLen * pct * .3 + wx, startY + tLen * pct + wy);
      }
      X.stroke();

      X.globalAlpha = this.alpha * (.4 + pulse * .3);
      for (let nd = 1; nd < segs; nd += 2) {
        const pct = nd / segs;
        const wx  = Math.sin(wave + nd * .6 + t * .02) * S * (0.12 + pct * .18) * (1 + pulse * .15);
        const wy  = Math.sin(wave * 1.3 + nd * .4 + t * .015) * S * .06;
        const nx  = startX + Math.cos(angle) * tLen * pct * .3 + wx;
        const ny  = startY + tLen * pct + wy;
        const ng  = X.createRadialGradient(nx, ny, 0, nx, ny, S * .05);
        ng.addColorStop(0, P.dots); ng.addColorStop(1, 'transparent');
        X.fillStyle = ng; X.beginPath(); X.arc(nx, ny, S * .05, 0, Math.PI * 2); X.fill();
      }
      X.globalAlpha = this.alpha * .7;
    }
  }

  drawFilaments(S, pulse, P, t) {
    X.globalAlpha = this.alpha * .28; X.strokeStyle = P.tent2; X.lineWidth = .6;
    for (let fi = 0; fi < this.filCount * 2; fi++) {
      const fa   = ((fi / (this.filCount * 2)) - .5) * Math.PI * .9;
      const fx   = Math.cos(fa) * S * .72, fy = Math.sin(fa) * S * .16;
      const fLen = S * (2.5 + Math.abs(Math.sin(fi * 1.3)) * .8);
      X.beginPath(); X.moveTo(fx, fy);
      for (let fs = 1; fs <= 10; fs++) {
        const fp = fs / 10;
        const fw = Math.sin(t * .025 + fi * .7 + fs * .5) * S * .07 * fp;
        X.lineTo(fx + Math.cos(fa) * fLen * fp * .25 + fw, fy + fLen * fp);
      }
      X.stroke();
    }
    X.globalAlpha = 1;
  }
}

/* ── POPULATION ── */
let jellies = [];
function populateOcean() {
  jellies = [];
  const palOrder = [0, 1, 2, 3, 4, 0, 1, 2, 3, 1, 0, 4, 2];
  const count    = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    const size  = Math.min(W, H) * (0.055 + Math.abs(Math.sin(i * 2.3)) * .065) * (depth * .5 + .65);
    const pal   = PALETTES[palOrder[i % palOrder.length]];
    jellies.push(new Jellyfish(W * (.05 + Math.random() * .9), H * (.2 + Math.random() * .9), size, pal, depth));
  }
  jellies.sort((a, b) => a.depth - b.depth);
}
populateOcean();

/* ── INPUT ── */
C.addEventListener('click', e => {
  const depth = Math.random() * .5 + .5;
  const size  = Math.min(W, H) * (0.07 + Math.random() * .07) * depth;
  const pal   = PALETTES[~~(Math.random() * PALETTES.length)];
  jellies.push(new Jellyfish(e.clientX, e.clientY + size * 2, size, pal, depth));
  if (jellies.length > 20) jellies.shift();
  for (let i = 0; i < 8; i++) {
    PARTS.push(newPart(true, e.clientX / W * 100, e.clientY));
    if (PARTS.length > 220) PARTS.shift();
  }
});
C.addEventListener('touchstart', e => {
  e.preventDefault();
  const t2 = e.touches[0];
  C.dispatchEvent(new MouseEvent('click', { clientX: t2.clientX, clientY: t2.clientY }));
}, { passive: false });

/* ── BACKGROUND ── */
function drawBackground() {
  const bg = X.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#000510'); bg.addColorStop(.22, '#010820');
  bg.addColorStop(.5, '#010618'); bg.addColorStop(.8, '#000410'); bg.addColorStop(1, '#000208');
  X.fillStyle = bg; X.fillRect(0, 0, W, H);
  const dl = X.createRadialGradient(W * .5, 0, 0, W * .5, 0, H * .7);
  dl.addColorStop(0, 'rgba(20,40,180,.12)'); dl.addColorStop(.4, 'rgba(10,20,120,.06)'); dl.addColorStop(1, 'transparent');
  X.fillStyle = dl; X.fillRect(0, 0, W, H);
  const sg1 = X.createRadialGradient(0, H * .3, 0, 0, H * .3, W * .45);
  sg1.addColorStop(0, 'rgba(60,20,150,.07)'); sg1.addColorStop(1, 'transparent');
  X.fillStyle = sg1; X.fillRect(0, 0, W, H);
  const sg2 = X.createRadialGradient(W, H * .6, 0, W, H * .6, W * .45);
  sg2.addColorStop(0, 'rgba(20,40,180,.06)'); sg2.addColorStop(1, 'transparent');
  X.fillStyle = sg2; X.fillRect(0, 0, W, H);
}

function drawSurface(t) {
  X.save(); X.globalAlpha = .18;
  X.strokeStyle = 'rgba(60,100,255,.6)'; X.lineWidth = 1.2;
  for (let wx = 0; wx < W; wx += W / 40) {
    const wy = H * .04 + Math.sin(wx / W * 8 + t * .015) * H * .018 + Math.sin(wx / W * 12 + t * .022) * H * .008;
    X.beginPath(); X.moveTo(wx, wy - 8);
    X.lineTo(wx + W / 40, wy + Math.sin((wx + W / 40) / W * 8 + t * .015) * H * .018 - 8); X.stroke();
  }
  X.globalAlpha = .06;
  const surf = X.createLinearGradient(0, 0, 0, H * .12);
  surf.addColorStop(0, 'rgba(80,140,255,.8)'); surf.addColorStop(1, 'transparent');
  X.fillStyle = surf; X.fillRect(0, 0, W, H * .1);
  X.restore();
}

function drawVignette() {
  const vg = X.createRadialGradient(W * .5, H * .5, H * .12, W * .5, H * .5, H * .9);
  vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,12,.75)');
  X.fillStyle = vg; X.fillRect(0, 0, W, H);
}

/* ── MAIN LOOP ── */
let _t = 0;
function frame() {
  _t++;
  drawBackground();
  drawCaustics(_t);
  drawSurface(_t);
  drawParts();
  jellies.sort((a, b) => a.depth - b.depth);
  jellies.forEach(j => { j.update(); j.draw(_t); });
  drawVignette();
  requestAnimationFrame(frame);
}
frame();
