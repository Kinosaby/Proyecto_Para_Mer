'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const cur = document.getElementById('custom-cursor');
let W, H;
function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });

const PALETTES = [
  ['#c8b8ff','#a8d8ff','#ffb8d8','#b8ffd8','#ffe8b8'],
  ['#e0c8ff','#c8e8ff','#ffc8e0','#c8ffe0','#fff0c8']
];
const messages = ['te quiero','Piojito 💜','eres mágica','MoonCherry','feliz cumple!','Pulga ✨','brilla siempre','30 abril','te adoro','eres especial'];

class Bubble {
  constructor(x, y, big = false) {
    this.x = x ?? Math.random() * W;
    this.y = y ?? (H + 50);
    this.r = big ? (Math.random()*60+30) : (Math.random()*22+8);
    this.vx = (Math.random()-0.5) * (big ? 0.8 : 1.2);
    this.vy = -(Math.random()*(big ? 0.8 : 1.5)+0.4);
    this.alpha = big ? 0.55 : Math.random()*0.4+0.3;
    this.wobble = Math.random()*Math.PI*2;
    this.wobbleSpeed = Math.random()*0.025+0.008;
    this.color = PALETTES[0][Math.floor(Math.random()*PALETTES[0].length)];
    this.msg = big ? messages[Math.floor(Math.random()*messages.length)] : null;
    this.popping = false; this.popFrame = 0;
  }
}

let bubbles = [];
for (let i = 0; i < 55; i++) { const b = new Bubble(); b.y = Math.random()*H; bubbles.push(b); }

let pops = [];
function addBurst(x, y) {
  for (let i = 0; i < 6; i++) {
    const b = new Bubble(x, y, false);
    b.r = Math.random()*18+6; b.vx = (Math.random()-0.5)*3; b.vy = -(Math.random()*4+1);
    bubbles.push(b);
  }
  if (Math.random() < 0.4) {
    const big = new Bubble(x, y, true); big.vy = -(Math.random()*1.5+0.5); bubbles.push(big);
  }
}

let t = 0, spawnT = 0;
function draw() {
  t++;
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#1a0a3a'); g.addColorStop(0.4,'#0a1a50');
  g.addColorStop(0.75,'#0a2840'); g.addColorStop(1,'#1a0a30');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  [[W*0.2,H*0.3,'rgba(180,140,255,0.08)'],[W*0.8,H*0.6,'rgba(100,180,255,0.07)'],[W*0.5,H*0.8,'rgba(255,140,200,0.06)']].forEach(([bx,by,c]) => {
    const rg = ctx.createRadialGradient(bx,by,0,bx,by,280);
    rg.addColorStop(0,c); rg.addColorStop(1,'transparent');
    ctx.fillStyle = rg; ctx.fillRect(0,0,W,H);
  });
  spawnT++; if (spawnT > 35) { spawnT = 0; bubbles.push(new Bubble()); }
  bubbles = bubbles.filter(b => { if (b.popping) { b.popFrame++; return b.popFrame < 12; } return b.y > -b.r - 80; });
  bubbles.forEach(b => {
    if (b.popping) return;
    b.wobble += b.wobbleSpeed; b.x += b.vx + Math.sin(b.wobble)*0.4; b.y += b.vy;
    ctx.save(); ctx.globalAlpha = b.alpha;
    const rg = ctx.createRadialGradient(b.x-b.r*0.3, b.y-b.r*0.3, 0, b.x, b.y, b.r);
    rg.addColorStop(0,'rgba(255,255,255,0.22)'); rg.addColorStop(0.4,'rgba(255,255,255,0.06)'); rg.addColorStop(1, b.color+'44');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = b.color; ctx.lineWidth = 1; ctx.globalAlpha = b.alpha*0.7;
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha = b.alpha*0.7; ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath(); ctx.ellipse(b.x-b.r*0.3,b.y-b.r*0.35,b.r*0.18,b.r*0.1,-0.5,0,Math.PI*2); ctx.fill();
    if (b.msg && b.r > 35) {
      ctx.globalAlpha = b.alpha*0.9; ctx.fillStyle = '#fff';
      ctx.font = `${Math.floor(b.r*0.28)}px 'Quicksand', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.msg, b.x, b.y);
    }
    ctx.restore();
  });
  pops = pops.filter(p => p.life > 0);
  pops.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
    const prog = p.life / p.maxLife;
    ctx.globalAlpha = prog; ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0,p.r*prog),0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

document.addEventListener('click', e => addBurst(e.clientX, e.clientY));
document.addEventListener('touchstart', e => { const t = e.touches[0]; addBurst(t.clientX, t.clientY); }, {passive:true});

function show(id, delay) { setTimeout(() => document.getElementById(id).classList.add('show'), delay); }
show('label',800); show('main-name',1800); show('cumple',2800);
setTimeout(() => document.querySelectorAll('.bubble-nick').forEach((n,i) => setTimeout(() => n.style.cssText += 'opacity:1;transform:none;', i*250)), 3800);
document.querySelectorAll('.bubble-nick').forEach(n => { n.style.opacity = '0'; n.style.transform = 'translateY(10px)'; n.style.transition = 'opacity 1s ease, transform 1s ease'; });
document.getElementById('nicks').style.opacity = '1';
show('msg',5000); show('date',6500);
setTimeout(() => { document.getElementById('hint').style.opacity = '1'; }, 8000);
