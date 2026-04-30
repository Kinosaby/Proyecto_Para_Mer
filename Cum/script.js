'use strict';
// ─── CANVAS SKY ───────────────────────────────────────────
const sky    = document.getElementById('sky-canvas');
const sCtx   = sky.getContext('2d');
const burst  = document.getElementById('burst-canvas');
const bCtx   = burst.getContext('2d');
const cursor = document.getElementById('custom-cursor');

let W, H;
function resize() {
  W = sky.width = burst.width = window.innerWidth;
  H = sky.height = burst.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initStars(); });

// Stars
let stars = [];
function initStars() {
  stars = [];
  const count = Math.floor((W * H) / 4800);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H * 0.75,
      r: Math.random() * 1.4 + 0.2, alpha: Math.random(),
      speed: Math.random() * 0.006 + 0.002, phase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.15 ? '#ffd8aa' : (Math.random() < 0.2 ? '#b8c8ff' : '#ffffff')
    });
  }
}
initStars();

// Petals
const PETAL_COLORS = ['#f5b8c4','#e8728a','#fde8ef','#d4687e','#f9d0db','#c8334a'];
let petals = [];
function spawnPetal() {
  petals.push({
    x: Math.random() * (W + 200) - 100, y: -30,
    r: Math.random() * 8 + 5, vx: Math.random() * 1.5 - 0.4,
    vy: Math.random() * 1.2 + 0.5, angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05, alpha: Math.random() * 0.5 + 0.4,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    wobble: Math.random() * Math.PI * 2, wobbleSpeed: Math.random() * 0.03 + 0.01
  });
}
for (let i = 0; i < 40; i++) {
  petals.push({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*8+5, vx: Math.random()*1.5-0.4,
    vy: Math.random()*1.2+0.5, angle: Math.random()*Math.PI*2,
    spin: (Math.random()-0.5)*0.05, alpha: Math.random()*0.5+0.4,
    color: PETAL_COLORS[Math.floor(Math.random()*PETAL_COLORS.length)],
    wobble: Math.random()*Math.PI*2, wobbleSpeed: Math.random()*0.03+0.01
  });
}

function drawPetal(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
  ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
}

// Fireflies
let flies = [];
for (let i = 0; i < 18; i++) {
  flies.push({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*2+1, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
    phase: Math.random()*Math.PI*2, speed: Math.random()*0.025+0.01
  });
}

// Burst particles
let bursts = [];
function addBurst(x, y) {
  const colors = ['#f5b8c4','#e8728a','#ffd080','#ffffff','#d4687e','#fde8ef'];
  for (let i = 0; i < 38; i++) {
    const ang = Math.random()*Math.PI*2, spd = Math.random()*5+1.5;
    const b = {
      x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd - 2,
      r: Math.random()*5+2, color: colors[Math.floor(Math.random()*colors.length)],
      alpha: 1, life: Math.floor(Math.random()*40+30),
      spin: (Math.random()-0.5)*0.15, angle: Math.random()*Math.PI*2,
      isPetal: Math.random() < 0.6
    };
    b.maxLife = b.life;
    bursts.push(b);
  }
}

let t = 0, spawnTimer = 0;

function draw() {
  t++;
  sCtx.clearRect(0, 0, W, H);
  const grad = sCtx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#04060f'); grad.addColorStop(0.45, '#08101e');
  grad.addColorStop(0.75, '#100a14'); grad.addColorStop(1, '#1a0a10');
  sCtx.fillStyle = grad; sCtx.fillRect(0, 0, W, H);

  stars.forEach(s => {
    const glow = (Math.sin(t * s.speed + s.phase) + 1) / 2;
    sCtx.globalAlpha = 0.2 + glow * 0.8; sCtx.fillStyle = s.color;
    sCtx.beginPath(); sCtx.arc(s.x, s.y, s.r * (0.8 + glow * 0.4), 0, Math.PI * 2); sCtx.fill();
  });
  sCtx.globalAlpha = 1;

  flies.forEach(f => {
    f.x += f.vx; f.y += f.vy; f.phase += f.speed;
    if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
    if (f.y < 0) f.y = H; if (f.y > H) f.y = 0;
    const glow2 = (Math.sin(f.phase)+1)/2;
    sCtx.globalAlpha = glow2 * 0.55;
    const rg = sCtx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*5);
    rg.addColorStop(0,'#ffe8b0'); rg.addColorStop(1,'transparent');
    sCtx.fillStyle = rg; sCtx.beginPath(); sCtx.arc(f.x,f.y,f.r*5,0,Math.PI*2); sCtx.fill();
    sCtx.globalAlpha = 1;
  });

  spawnTimer++;
  if (spawnTimer > 28) { spawnPetal(); spawnTimer = 0; }
  petals.forEach((p, i) => {
    p.wobble += p.wobbleSpeed; p.x += p.vx + Math.sin(p.wobble) * 0.5;
    p.y += p.vy; p.angle += p.spin;
    drawPetal(sCtx, p);
    if (p.y > H + 30) {
      petals[i] = {
        x: Math.random()*(W+200)-100, y:-30,
        r: Math.random()*8+5, vx: Math.random()*1.5-0.4,
        vy: Math.random()*1.2+0.5, angle: Math.random()*Math.PI*2,
        spin: (Math.random()-0.5)*0.05, alpha: Math.random()*0.5+0.4,
        color: PETAL_COLORS[Math.floor(Math.random()*PETAL_COLORS.length)],
        wobble: Math.random()*Math.PI*2, wobbleSpeed: Math.random()*0.03+0.01
      };
    }
  });

  bCtx.clearRect(0,0,W,H);
  bursts = bursts.filter(b => b.life > 0);
  bursts.forEach(b => {
    b.x += b.vx; b.y += b.vy; b.vy += 0.1; b.vx *= 0.97;
    b.life--; b.angle += b.spin;
    const progress = b.life / b.maxLife;
    bCtx.globalAlpha = progress * b.alpha; bCtx.fillStyle = b.color;
    if (b.isPetal) {
      bCtx.save(); bCtx.translate(b.x, b.y); bCtx.rotate(b.angle);
      bCtx.beginPath(); bCtx.ellipse(0,0,b.r,b.r*0.5,0,0,Math.PI*2); bCtx.fill(); bCtx.restore();
    } else {
      bCtx.beginPath(); bCtx.arc(b.x,b.y,Math.max(0,b.r*progress),0,Math.PI*2); bCtx.fill();
    }
  });
  bCtx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

// ─── CURSOR ───────────────────────────────────────────────
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ─── CLICK MAGIC ──────────────────────────────────────────
const phrases = [
  'te quiero','🌙','MoonCherry','✦','feliz cumple',
  'eres mágica','🍒','Piojito','te extraño','Pulga ♥',
  'brilla siempre','✨','te adoro','🌸','eres especial'
];
function spawnText(x, y) {
  const el = document.createElement('div');
  el.className = 'sparkle-text';
  el.textContent = phrases[Math.floor(Math.random()*phrases.length)];
  el.style.left  = (x - 40) + 'px';
  el.style.top   = (y - 20) + 'px';
  el.style.fontSize = (Math.random()*0.35 + 0.7) + 'rem';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
document.addEventListener('click', e => { addBurst(e.clientX, e.clientY); spawnText(e.clientX, e.clientY); });

// ─── REVEAL SEQUENCE ──────────────────────────────────────
function show(id, delay) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  }, delay);
}
setTimeout(() => document.getElementById('moon-svg').classList.add('visible'), 300);
show('label-top', 1000);
show('main-name', 2000);
show('sub-name', 3200);
setTimeout(() => document.getElementById('divider').classList.add('visible'), 4200);
setTimeout(() => {
  ['n1','n2','n3'].forEach((id, i) => {
    setTimeout(() => document.getElementById(id).classList.add('visible'), i*320);
  });
  document.getElementById('nicknames').classList.add('visible');
}, 4600);
show('message', 6000);
show('date-line', 7800);
show('hint', 9200);

// Touch support
document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  addBurst(t.clientX, t.clientY);
  spawnText(t.clientX, t.clientY);
}, {passive: true});
