'use strict';
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });

// Timestamp clock
function updateClock() {
  const n = new Date();
  document.getElementById('timestamp').textContent = `30/04/2026   ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;
}
setInterval(updateClock, 1000); updateClock();

// Cassette reel spin
let rAngle = 0;
const reelL = document.getElementById('reel-l');
const reelR = document.getElementById('reel-r');
setInterval(() => {
  rAngle += 3;
  reelL.setAttribute('transform', `rotate(${rAngle},50,40)`);
  reelR.setAttribute('transform', `rotate(${-rAngle},110,40)`);
}, 40);

// BG canvas
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
  const s = document.getElementById('screen');
  W = canvas.width = s.offsetWidth; H = canvas.height = s.offsetHeight;
}
resize();

let particles = [];
function initP() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.3,
      color: Math.random() < 0.33 ? '#ff2d78' : Math.random() < 0.5 ? '#00f5ff' : '#ffe600',
      alpha: Math.random() * 0.5 + 0.2
    });
  }
}
initP();

let bursts = [];
function addBurst(x, y) {
  const colors = ['#ff2d78','#00f5ff','#ffe600','#bf00ff','#ffffff'];
  for (let i = 0; i < 30; i++) {
    const ang = Math.random() * Math.PI * 2, spd = Math.random() * 6 + 1;
    const b = { x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd - 1,
      r: Math.random()*4+1, color: colors[Math.floor(Math.random()*colors.length)],
      life: Math.floor(Math.random()*35+20), alpha: 1 };
    b.maxLife = b.life;
    bursts.push(b);
  }
}

let glitchBars = [], glitchTimer = 0, t = 0;
function draw() {
  t++;
  ctx.fillStyle = 'rgba(4,0,10,0.85)'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,45,120,0.06)'; ctx.lineWidth = 1;
  const spacing = 40;
  for (let x = 0; x < W; x += spacing) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += spacing) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t*0.03 + p.x));
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  glitchTimer++;
  if (glitchTimer > 90 && Math.random() < 0.04) {
    const b = { y: Math.random()*H, h: Math.random()*8+2, life: Math.floor(Math.random()*8+3), maxLife: 10, alpha: 0.35 };
    glitchBars.push(b); glitchTimer = 0;
  }
  glitchBars = glitchBars.filter(b => b.life > 0);
  glitchBars.forEach(b => {
    b.life--;
    ctx.globalAlpha = b.alpha * (b.life / b.maxLife);
    ctx.fillStyle = Math.random() < 0.5 ? '#ff2d78' : '#00f5ff';
    ctx.fillRect(0, b.y, W, b.h);
    ctx.globalAlpha *= 0.5; ctx.fillRect(Math.random()*20-10, b.y, W, b.h*0.5);
  });
  ctx.globalAlpha = 1;
  bursts = bursts.filter(b => b.life > 0);
  bursts.forEach(b => {
    b.x += b.vx; b.y += b.vy; b.vy += 0.15; b.life--;
    const prog = b.life / b.maxLife;
    ctx.globalAlpha = prog; ctx.fillStyle = b.color;
    ctx.shadowColor = b.color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(0, b.r*prog), 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

document.getElementById('screen').addEventListener('click', e => {
  const rect = document.getElementById('screen').getBoundingClientRect();
  addBurst(e.clientX - rect.left, e.clientY - rect.top);
});

function startShow() {
  const ps = document.getElementById('play-screen');
  const ms = document.getElementById('main-screen');
  ps.style.opacity = '0'; ps.style.pointerEvents = 'none';
  setTimeout(() => { ms.style.opacity = '1'; ms.style.pointerEvents = 'auto'; }, 600);
  for (let i = 0; i < 8; i++) setTimeout(() => addBurst(Math.random()*W, Math.random()*H), i*120);
}
window.startShow = startShow;
