'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const cur = document.getElementById('cursor');
let W, H;
function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });

let stars = [];
function initStars() {
  stars = [];
  const n = Math.floor(W*H/5000);
  for (let i = 0; i < n; i++) stars.push({x:Math.random()*W, y:Math.random()*H*0.7, r:Math.random()*1.2+0.2, ph:Math.random()*Math.PI*2, spd:Math.random()*0.008+0.003});
}
initStars();

let flies = [];
for (let i = 0; i < 22; i++) flies.push({x:Math.random()*W, y:H*0.3+Math.random()*H*0.65, vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.4, ph:Math.random()*Math.PI*2, spd:Math.random()*.03+.01, r:Math.random()*2.5+1.2});

let flowers = [], flowerCount = 0;
const FLOWER_COLORS = [
  {p:'#f5b8c4',s:'#e8728a',c:'#ffe090'},
  {p:'#c8b8ff',s:'#9060e0',c:'#fff090'},
  {p:'#b8f0c8',s:'#40b060',c:'#ffe090'},
  {p:'#ffd0a0',s:'#e08030',c:'#ffffa0'},
  {p:'#ffb8d8',s:'#e060a0',c:'#fff0a0'}
];

function plantFlower(x, y) {
  const col = FLOWER_COLORS[Math.floor(Math.random()*FLOWER_COLORS.length)];
  const petals = Math.floor(Math.random()*3)+4;
  flowers.push({x,y,col,petals,grow:0,scale:Math.random()*0.5+0.5,sway:Math.random()*Math.PI*2,swaySpd:Math.random()*.02+.008,stemH:Math.random()*40+25});
  flowerCount++;
  document.getElementById('flower-count').textContent = `🌸 ${flowerCount} flores plantadas`;
}

function drawFlower(f) {
  const prog = Math.min(f.grow/0.8, 1); if (prog <= 0) return;
  ctx.save(); ctx.translate(f.x, f.y);
  f.sway += f.swaySpd; ctx.rotate(Math.sin(f.sway)*0.04*prog);
  const s = f.scale*prog;
  ctx.strokeStyle = `rgba(60,120,40,${prog*0.8})`; ctx.lineWidth = 2*s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(4*s,-f.stemH*0.5*s,0,-f.stemH*s); ctx.stroke();
  if (prog > 0.5) {
    const lp = (prog-0.5)*2;
    ctx.fillStyle = `rgba(60,150,50,${lp*0.7})`;
    ctx.save(); ctx.translate(3*s,-f.stemH*0.4*s); ctx.rotate(0.6);
    ctx.beginPath(); ctx.ellipse(0,0,8*s*lp,4*s*lp,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  if (prog > 0.3) {
    const pp = Math.min((prog-0.3)/0.4, 1);
    ctx.translate(0,-f.stemH*s);
    for (let i = 0; i < f.petals; i++) {
      ctx.save(); ctx.rotate((Math.PI*2/f.petals)*i);
      ctx.fillStyle = f.col.p; ctx.globalAlpha = pp*0.9;
      ctx.beginPath(); ctx.ellipse(0,-9*s,4*s*pp,7*s*pp,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = pp; ctx.fillStyle = f.col.c; ctx.beginPath(); ctx.arc(0,0,4*s*pp,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = f.col.s; ctx.globalAlpha = pp*0.5; ctx.beginPath(); ctx.arc(0,0,2.5*s*pp,0,Math.PI*2); ctx.fill();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}

let sparks = [];
function addSparks(x, y) {
  const cols = ['#ffe090','#f5b8c4','#c8b8ff','#b8f0c8','#fff'];
  for (let i = 0; i < 18; i++) {
    const ang = Math.random()*Math.PI*2, spd = Math.random()*4+1;
    const s = {x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-2,r:Math.floor(Math.random()*3+1),col:cols[Math.floor(Math.random()*cols.length)],life:Math.floor(Math.random()*30+15)};
    s.maxLife = s.life; sparks.push(s);
  }
}

let t = 0;
function draw() {
  t++;
  ctx.clearRect(0,0,W,H);
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#05080a'); g.addColorStop(0.5,'#0c1418'); g.addColorStop(0.75,'#0f1a10'); g.addColorStop(1,'#151a08');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const hg = ctx.createLinearGradient(0,H*0.6,0,H);
  hg.addColorStop(0,'transparent'); hg.addColorStop(1,'rgba(40,60,20,0.4)');
  ctx.fillStyle = hg; ctx.fillRect(0,0,W,H);
  stars.forEach(s => {
    const gl = (Math.sin(t*s.spd+s.ph)+1)/2;
    ctx.globalAlpha = 0.15+gl*0.75; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(0.8+gl*0.3),0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  flies.forEach(f => {
    f.x += f.vx; f.y += f.vy; f.ph += f.spd;
    if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
    if (f.y < H*0.25) f.vy = Math.abs(f.vy); if (f.y > H-10) f.vy = -Math.abs(f.vy);
    const gl = (Math.sin(f.ph)+1)/2;
    const rg = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*6);
    rg.addColorStop(0,'rgba(220,255,150,0.9)'); rg.addColorStop(0.3,'rgba(180,240,80,0.4)'); rg.addColorStop(1,'transparent');
    ctx.globalAlpha = gl*0.7; ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(f.x,f.y,f.r*6,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0d1a08'; ctx.beginPath(); ctx.moveTo(0,H);
  for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H-(Math.sin(x*.04+t*.005)*8+Math.sin(x*.08)*5+18));
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  flowers.forEach(f => { if (f.grow < 1) f.grow += 0.018; drawFlower(f); });
  sparks = sparks.filter(s => s.life > 0);
  sparks.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life--;
    const prog = s.life/s.maxLife;
    ctx.globalAlpha = prog; ctx.fillStyle = s.col;
    ctx.beginPath(); ctx.arc(s.x,s.y,Math.max(0,s.r*prog),0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

document.addEventListener('click', e => { plantFlower(e.clientX,e.clientY); addSparks(e.clientX,e.clientY); });
document.addEventListener('touchstart', e => { const touch = e.touches[0]; plantFlower(touch.clientX,touch.clientY); addSparks(touch.clientX,touch.clientY); }, {passive:true});

function show(id, d) { setTimeout(() => document.getElementById(id).classList.add('on'), d); }
show('eyebrow',1000); show('main',2000); show('sub',3200);
setTimeout(() => ['ng1','ng2','ng3'].forEach((id,i) => setTimeout(() => document.getElementById(id).classList.add('on'), i*350)), 4200);
show('msg-g',5500); show('date-g',7000);
setTimeout(() => { document.getElementById('hint-g').style.opacity = '1'; }, 8500);
