'use strict';
// ── MESSAGES ────────────────────────────────────────────────────────────────
const MSGS = [
  { t:"Brillas incluso en la oscuridad más profunda", e:"💜" },
  { t:"Fluyes con gracia por cada corriente de la vida", e:"🌊" },
  { t:"Eres mágica, única e irrepetible en todo el universo", e:"✨" },
  { t:"Tu suavidad es tu mayor fortaleza", e:"🌸" },
  { t:"Tocas los corazones sin siquiera proponértelo", e:"🫧" },
  { t:"En la oscuridad más profunda, tú eres la luz", e:"💫" },
  { t:"Bailas con las olas y el mundo se detiene a mirarte", e:"🌙" },
  { t:"Eres pura magia que nació del mar", e:"🪼" },
  { t:"Llevas dentro de ti la calma del océano entero", e:"🫐" },
  { t:"Cada vez que apareces, el abismo entero se ilumina", e:"⭐" },
  { t:"Eres tan hermosa como la luna reflejada en el agua", e:"🌕" },
  { t:"Tu presencia hace el mundo más bello y más suave", e:"🌸" },
  { t:"Nadas libre, poderosa y absolutamente increíble", e:"💎" },
  { t:"El océano te envidia por lo luminosa que eres", e:"🌊" },
  { t:"Eres la medusa más especial de todo el universo", e:"💜" },
  { t:"Donde hay oscuridad tú prefieres llevar luz, siempre", e:"🌟" },
  { t:"Eres la canción que el mar canta cuando nadie escucha", e:"🎵" },
  { t:"Tienes la profundidad del océano y la ternura de la espuma", e:"🤍" },
  { t:"Flotas con elegancia que ninguna corriente puede romper", e:"🩵" },
  { t:"El mar te hizo de estrellas y de sueños olvidados", e:"🌠" },
  { t:"Eres refugio, calma y maravilla al mismo tiempo", e:"🐚" },
  { t:"Tu corazón late como las mareas: suave, constante, infinito", e:"💙" },
  { t:"Nadie brilla como tú cuando decides brillar", e:"✨" },
  { t:"Incluso los peces se detienen a admirarte cuando pasas", e:"🐠" },
  { t:"Eres poesía escrita con agua y luz de luna", e:"🌙" },
  { t:"El universo entero se alegra de que existas", e:"💫" },
  { t:"Nada ni nadie puede apagar la luz que llevas dentro", e:"🕯️" },
  { t:"Eres el tipo de persona que hace que la vida valga la pena", e:"🌸" },
  { t:"Eres delicada como la espuma y fuerte como las mareas", e:"🌊" },
  { t:"Tu alma tiene el color exacto del atardecer sobre el mar", e:"🌅" },
  { t:"Hasta las estrellas te envidian por lo que iluminas aquí abajo", e:"⭐" },
  { t:"Llevas magia en cada movimiento, en cada suspiro", e:"💜" },
  { t:"El mar te conoce por nombre y sonríe cuando te ve nadar", e:"🐋" },
  { t:"Eres tan especial que el océano te guardó solo para él", e:"🌊" },
  { t:"Donde hay oscuridad tú prefieres llevar luz, siempre", e:"🌟" },
];

// ── CANVAS SETUP ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
let W, H;
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
window.addEventListener('resize', resize);
resize();

// ── CURSOR ───────────────────────────────────────────────────────────────────
const cur = document.getElementById('cursor');
let mx = -999, my = -999;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

// ── JELLYFISH ────────────────────────────────────────────────────────────────
function makeJelly(id) {
  const size = 38 + Math.random() * 52;
  return {
    id, x: 60 + Math.random() * (innerWidth - 120),
    y: innerHeight + 100 + Math.random() * 200,
    vy: -(0.45 + Math.random() * 0.55),
    vx: (Math.random() - 0.5) * 0.4,
    size, phase: Math.random() * Math.PI * 2,
    pSpeed: 0.8 + Math.random() * 0.5,
    wobble: Math.random() * Math.PI * 2,
    wSpeed: 0.3 + Math.random() * 0.3,
    hue: 270 + Math.random() * 40,
    tentCount: 8 + Math.floor(Math.random() * 7),
    lastMsg: -1, clicked: 0,
  };
}

const jellies = Array.from({length: 9}, (_, i) => {
  const j = makeJelly(i);
  j.y = -200 + (Math.random() * (innerHeight + 400));
  return j;
});

function drawJelly(j, t) {
  const { x, y, size, phase, pSpeed, hue, tentCount, clicked } = j;
  const pulse     = 1 + 0.06 * Math.sin(t * pSpeed + phase);
  const clickScale = clicked > 0 ? 1 + 0.12 * Math.sin(clicked * 15) * Math.max(0, clicked) : 1;
  const rBell     = size * pulse * clickScale;
  const rBellH    = rBell * 0.65;

  ctx.save(); ctx.translate(x, y);

  const glowR = ctx.createRadialGradient(0, 0, rBell * 0.2, 0, 0, rBell * 2.2);
  glowR.addColorStop(0,   `hsla(${hue},90%,65%,0.35)`);
  glowR.addColorStop(0.5, `hsla(${hue},80%,55%,0.12)`);
  glowR.addColorStop(1,   'transparent');
  ctx.fillStyle = glowR;
  ctx.beginPath(); ctx.ellipse(0, 0, rBell * 2.2, rBell * 1.6, 0, 0, Math.PI * 2); ctx.fill();

  for (let i = 0; i < tentCount; i++) {
    const spread = (rBell * 1.6) / (tentCount + 1);
    const tx     = -rBell * 0.8 + spread * (i + 1);
    const sway   = Math.sin(t * 1.2 + phase + i * 0.7) * rBell * 0.28;
    const sway2  = Math.sin(t * 0.7 + i * 1.1) * rBell * 0.12;
    const alpha  = 0.55 + 0.25 * Math.sin(t * 0.8 + i);
    const tL     = j._tentLens ? j._tentLens[i] : (rBell * (0.85 + (i%3)*0.25));
    ctx.beginPath(); ctx.moveTo(tx, rBellH * 0.9);
    ctx.bezierCurveTo(tx + sway, rBellH * 0.9 + tL * 0.35, tx + sway2, rBellH * 0.9 + tL * 0.7, tx + sway * 1.3, rBellH * 0.9 + tL);
    const tg = ctx.createLinearGradient(0, rBellH, 0, rBellH + tL);
    tg.addColorStop(0, `hsla(${hue},85%,70%,${alpha})`);
    tg.addColorStop(1, `hsla(${hue},75%,60%,0)`);
    ctx.strokeStyle = tg; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.stroke();
  }

  ctx.beginPath(); ctx.ellipse(0, 0, rBell, rBellH, 0, Math.PI, Math.PI * 2);
  const bellGrad = ctx.createRadialGradient(-rBell*0.25, -rBellH*0.35, rBell*0.05, 0, 0, rBell);
  bellGrad.addColorStop(0,    `hsla(${hue-10},70%,82%,0.88)`);
  bellGrad.addColorStop(0.35, `hsla(${hue},80%,60%,0.82)`);
  bellGrad.addColorStop(0.7,  `hsla(${hue+15},85%,40%,0.85)`);
  bellGrad.addColorStop(1,    `hsla(${hue+20},90%,22%,0.9)`);
  ctx.fillStyle = bellGrad; ctx.fill();
  ctx.strokeStyle = `hsla(${hue},90%,75%,0.6)`; ctx.lineWidth = 1.2; ctx.stroke();

  ctx.beginPath(); ctx.ellipse(0, 0, rBell, rBellH * 0.18, 0, 0, Math.PI * 2);
  const rimG = ctx.createLinearGradient(0, -rBellH*0.18, 0, rBellH*0.18);
  rimG.addColorStop(0, `hsla(${hue},90%,72%,0.6)`);
  rimG.addColorStop(1, `hsla(${hue},80%,55%,0.2)`);
  ctx.fillStyle = rimG; ctx.fill();

  for (let r = 0; r < 5; r++) {
    const angle = (r / 5) * Math.PI + Math.PI;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * rBell * 0.7, Math.sin(angle) * rBellH * 0.7);
    ctx.strokeStyle = `hsla(${hue+10},70%,78%,0.15)`; ctx.lineWidth = 0.8; ctx.stroke();
  }

  const shineG = ctx.createRadialGradient(-rBell*0.3, -rBellH*0.4, 0, -rBell*0.3, -rBellH*0.4, rBell*0.45);
  shineG.addColorStop(0, 'rgba(255,255,255,0.55)'); shineG.addColorStop(1, 'transparent');
  ctx.fillStyle = shineG;
  ctx.beginPath(); ctx.ellipse(-rBell*0.28, -rBellH*0.38, rBell*0.38, rBellH*0.22, -0.3, 0, Math.PI*2); ctx.fill();

  ctx.restore();
  if (!j._tentLens) {
    j._tentLens = Array.from({length: tentCount}, (_, i) => rBell * (0.85 + (i%3)*0.25));
  }
}

// ── HIT TEST ─────────────────────────────────────────────────────────────────
function jellyHit(j, px, py) {
  const dx = px - j.x, dy = py - j.y, rBellH = j.size * 0.65;
  if (dy > rBellH * 0.3) return false;
  return (dx*dx)/(j.size*j.size) + (dy*dy)/(rBellH*rBellH) < 1.1;
}

// ── FISH ─────────────────────────────────────────────────────────────────────
const fishCols = [
  {b:'#4ecdc4',f:'#2cb5ad'},{b:'#a8edea',f:'#5bc8c4'},{b:'#f9a8d4',f:'#e062a0'},
  {b:'#6ee7b7',f:'#2fb87a'},{b:'#93c5fd',f:'#4a90e0'},{b:'#fcd34d',f:'#e8a020'},
  {b:'#c4b5fd',f:'#8b5cf6'},{b:'#f0abfc',f:'#c026d3'},{b:'#86efac',f:'#4ade80'},
];
const fish = Array.from({length: 14}, (_, i) => {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const col = fishCols[i % fishCols.length];
  return {
    x: dir===1 ? -80 : innerWidth+80,
    y: innerHeight*0.12 + Math.random()*innerHeight*0.76,
    sz: 10 + Math.random()*20, speed: (0.5 + Math.random()*1.3) * dir,
    dir, col, ph: Math.random()*Math.PI*2,
    wob: Math.random()*Math.PI*2, ws: 0.5 + Math.random()*0.9, lantern: i < 2,
  };
});

function drawFish(f, t) {
  const wag = Math.sin(t * 2.8 + f.ph) * 0.38;
  const bob = Math.sin(t * f.ws + f.wob) * 3.5;
  const { sz, col, dir, lantern } = f;
  ctx.save(); ctx.translate(f.x, f.y + bob);
  if (dir === -1) ctx.scale(-1, 1);
  if (lantern) {
    const gr = ctx.createRadialGradient(sz*0.4,0,0,sz*0.4,0,sz*3);
    gr.addColorStop(0, col.b+'99'); gr.addColorStop(1,'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(sz*0.4,0,sz*3,sz*2,0,0,Math.PI*2); ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-sz*0.5,0); ctx.lineTo(-sz*1.3,-sz*0.5+wag*sz*0.7);
  ctx.lineTo(-sz*1.3,sz*0.5+wag*sz*0.7); ctx.closePath();
  ctx.fillStyle = col.f; ctx.globalAlpha = 0.82; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0,0,sz,sz*0.52,0,0,Math.PI*2);
  const bg = ctx.createLinearGradient(-sz,-sz*.5,sz,sz*.5);
  bg.addColorStop(0,col.f); bg.addColorStop(1,col.b);
  ctx.fillStyle = bg; ctx.globalAlpha = 0.88; ctx.fill();
  ctx.beginPath(); ctx.ellipse(sz*0.05,sz*0.15,sz*0.5,sz*0.22,0,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-sz*0.05,-sz*0.5);
  ctx.quadraticCurveTo(sz*0.25,-sz*0.88,sz*0.55,-sz*0.5);
  ctx.fillStyle=col.f; ctx.globalAlpha=0.65; ctx.fill();
  ctx.beginPath(); ctx.arc(sz*0.5,-sz*0.1,sz*0.14,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.globalAlpha=.95; ctx.fill();
  ctx.beginPath(); ctx.arc(sz*0.52,-sz*0.1,sz*0.07,0,Math.PI*2);
  ctx.fillStyle='#111'; ctx.fill();
  ctx.beginPath(); ctx.arc(sz*0.55,-sz*0.14,sz*0.03,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill();
  if (lantern) {
    const p = 0.8 + 0.2*Math.sin(t*4+f.ph);
    ctx.beginPath(); ctx.arc(sz*1.15,-sz*0.75,sz*0.2,0,Math.PI*2);
    ctx.fillStyle='#ffe066'; ctx.globalAlpha=p;
    ctx.shadowColor='#ffe066'; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
  }
  ctx.globalAlpha=1; ctx.restore();
}

// ── SEAWEED ──────────────────────────────────────────────────────────────────
const weeds = Array.from({length:10}, (_, i) => ({
  x: (i/10)*innerWidth + 20 + Math.random()*60,
  segs: 6+Math.floor(Math.random()*5), sl: 18+Math.random()*14,
  ph: Math.random()*Math.PI*2, sp: 0.4+Math.random()*0.5,
  hue: 260+Math.random()*80, thick: 2+Math.random()*2.5,
}));
function drawWeed(w, t) {
  ctx.save(); let cx=w.x, cy=H;
  ctx.lineWidth=w.thick; ctx.lineCap='round';
  for (let s=0; s<w.segs; s++) {
    const sw=Math.sin(t*w.sp+w.ph+s*0.55)*(10+s*3.5);
    const nx=cx+sw, ny=cy-w.sl;
    ctx.strokeStyle=`hsla(${w.hue},75%,55%,${0.28+0.28*(s/w.segs)})`;
    ctx.shadowColor=`hsla(${w.hue},90%,65%,.2)`; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.quadraticCurveTo(cx+sw*0.5,cy-w.sl*0.5,nx,ny);
    ctx.stroke(); cx=nx; cy=ny;
  }
  ctx.shadowBlur=0; ctx.restore();
}

// ── BUBBLES ──────────────────────────────────────────────────────────────────
const bubs = Array.from({length:55}, () => ({
  x:Math.random()*innerWidth, y:Math.random()*innerHeight,
  r:Math.random()*2.2+0.3, sp:Math.random()*0.5+0.15,
  op:Math.random()*0.4+0.08, dr:(Math.random()-.5)*0.45,
}));

// ── CLICK PARTICLES ──────────────────────────────────────────────────────────
let particles = [];
function spawnParticles(x, y) {
  const colors = ['#c46aff','#e0aaff','#7b2fff','#9933ff','#d8a8ff','#fff8'];
  for (let i=0; i<20; i++) {
    const angle=(i/20)*Math.PI*2, spd=1.5+Math.random()*3;
    particles.push({
      x,y, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd,
      r:2+Math.random()*5, color:colors[Math.floor(Math.random()*colors.length)],
      life:1, decay:0.02+Math.random()*0.02,
    });
  }
}

// ── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
let lastMsgIdx = -1;
function showMsg(x, y) {
  document.querySelectorAll('.bubble').forEach(b => b.remove());
  let idx;
  do { idx = Math.floor(Math.random()*MSGS.length); } while(idx===lastMsgIdx);
  lastMsgIdx = idx;
  const m = MSGS[idx];
  const div = document.createElement('div');
  div.className='bubble';
  div.innerHTML=`<p>${m.t} <span class="emo">${m.e}</span></p>`;
  let lx=x+18, ly=y-90;
  if (lx+265>innerWidth) lx=x-265;
  if (ly<10) ly=y+22;
  div.style.left=lx+'px'; div.style.top=ly+'px';
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.animation='popOut .45s ease forwards';
    setTimeout(() => div.remove(), 500);
  }, 3000);
}

// ── MAIN LOOP ────────────────────────────────────────────────────────────────
function loop(ts) {
  const t = ts/1000;
  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#000008'); bg.addColorStop(.35,'#04001a');
  bg.addColorStop(.75,'#0d0030'); bg.addColorStop(1,'#1a003d');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  ctx.save(); ctx.globalAlpha=0.06+0.025*Math.sin(t*0.4);
  for(let i=0;i<7;i++){
    const rx=(i/7)*W+Math.sin(t*0.2+i)*30, rw=50+Math.sin(t*0.15+i*1.3)*20;
    const rg=ctx.createLinearGradient(rx,0,rx,H*0.55);
    rg.addColorStop(0,'#8833ff'); rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg; ctx.beginPath();
    ctx.moveTo(rx-rw,0); ctx.lineTo(rx+rw,0);
    ctx.lineTo(rx+rw*0.5,H*0.55); ctx.lineTo(rx-rw*0.5,H*0.55); ctx.fill();
  }
  ctx.restore();

  weeds.forEach(w => drawWeed(w,t));
  bubs.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(170,90,255,${b.op})`; ctx.lineWidth=.7; ctx.stroke();
    b.y-=b.sp; b.x+=b.dr; if(b.y<-8){b.y=H+8;b.x=Math.random()*W;}
  });
  fish.forEach(f => {
    drawFish(f,t); f.x+=f.speed;
    if(f.dir===1&&f.x>W+90){f.x=-90;f.y=H*0.1+Math.random()*H*0.8;}
    if(f.dir===-1&&f.x<-90){f.x=W+90;f.y=H*0.1+Math.random()*H*0.8;}
  });

  let anyHover=false;
  jellies.forEach(j => {
    j.y+=j.vy; j.x+=j.vx;
    j.x+=Math.sin(t*j.wSpeed+j.wobble)*0.25;
    const margin=j.size+10;
    if(j.x<margin) j.vx=Math.abs(j.vx)*0.5;
    if(j.x>W-margin) j.vx=-Math.abs(j.vx)*0.5;
    if(j.y<-j.size*3){
      j.y=H+j.size*2+Math.random()*150;
      j.x=margin+Math.random()*(W-margin*2);
      j.vx=(Math.random()-.5)*0.4;
    }
    if(j.clicked>0) j.clicked-=0.04; else j.clicked=0;
    drawJelly(j,t);
    if(jellyHit(j,mx,my)) anyHover=true;
  });
  cur.classList.toggle('hover', anyHover);

  particles = particles.filter(p => {
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life-=p.decay;
    if(p.life<=0) return false;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
    ctx.fillStyle=p.color; ctx.globalAlpha=p.life;
    ctx.shadowColor=p.color; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
    return true;
  });

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ── CLICK ────────────────────────────────────────────────────────────────────
canvas.addEventListener('click', e => {
  const {clientX:cx, clientY:cy} = e;
  for(const j of jellies){
    if(jellyHit(j,cx,cy)){ j.clicked=1; spawnParticles(cx,cy); showMsg(cx,cy); break; }
  }
});
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t2=e.touches[0];
  canvas.dispatchEvent(new MouseEvent('click',{clientX:t2.clientX,clientY:t2.clientY}));
},{passive:false});
