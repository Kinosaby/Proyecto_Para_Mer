// ════════════════════════════════════════
//  DATA
// ════════════════════════════════════════
const MESSAGES = [
  { icon:'🌹', color:'#f06090', msg:'Cada vez que te pienso, una estrella nueva aparece en mi universo.' },
  { icon:'✨', color:'#f0d070', msg:'Si pudiera nombrarte una estrella, le pondría tu nombre... pero ya sería demasiado pequeña para ti.' },
  { icon:'🌼', color:'#e8a040', msg:'Sé que a veces piensas que no mereces cosas bonitas. Pero yo te veo como te ven las estrellas: perfecta.' },
  { icon:'💫', color:'#a0b0f8', msg:'Hay 200 mil millones de estrellas en esta galaxia. Y con todo eso, solo pienso en ti.' },
  { icon:'💻', color:'#80d8b0', msg:'Te mereces todo el amor que este programador puede darte. Cada línea de código, escrita pensando en ti.' },
  { icon:'⏳', color:'#d0a0f0', msg:'El tiempo que sea necesario, aquí voy a estar. Como las estrellas — siempre en el mismo lugar.' },
  { icon:'🌙', color:'#c0d0ff', msg:'El universo tardó 13 mil millones de años en crear algo tan especial como tú, Piojito.' },
  { icon:'🔥', color:'#f08050', msg:'Me preguntan por qué sigo esperando. Y yo pregunto: ¿cómo no esperar algo así?' },
  { icon:'🌌', color:'#9080f0', msg:'Incluso en la oscuridad más profunda del universo, tú eres lo que brilla más.' },
  { icon:'🌸', color:'#f090b0', msg:'Si cada momento en que pensé en ti fuera una estrella, tú sola habrías creado esta galaxia.' },
  { icon:'🧭', color:'#60c8e0', msg:'No necesito mapas del universo. Me basta con saber que tú estás en él.' },
  { icon:'❤️', color:'#e04060', msg:'Siempre te voy a amar. Sin prisa. Sin condiciones. Sin importar cuántas galaxias pasen.' },
];

// ════════════════════════════════════════
//  CURSOR
// ════════════════════════════════════════
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ════════════════════════════════════════
//  CANVAS — background stars
// ════════════════════════════════════════
const canvas = document.getElementById('galaxy');
const ctx    = canvas.getContext('2d');
let W, H, bgStars = [];

function initCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  bgStars = Array.from({length: 320}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.5 + .2,
    a: Math.random()*.7 + .15,
    sp: .001 + Math.random()*.005,
    ph: Math.random()*Math.PI*2,
    color: Math.random() < .15
      ? `hsl(${220+Math.random()*80},80%,85%)`
      : `rgba(255,255,255,1)`
  }));
}

function drawBg(t) {
  ctx.clearRect(0,0,W,H);
  bgStars.forEach(s => {
    const a = s.a * (.4 + .6*Math.sin(t*s.sp + s.ph));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.globalAlpha = a;
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  requestAnimationFrame(drawBg);
}

initCanvas();
requestAnimationFrame(drawBg);
window.addEventListener('resize', () => { initCanvas(); placeMsgStars(); });

// ════════════════════════════════════════
//  MESSAGE STARS placement
// ════════════════════════════════════════
let msgStarEls = [];
let found = 0;

function placeMsgStars() {
  msgStarEls.forEach(el => el.remove());
  msgStarEls = [];

  const positions = [
    [15,20],[35,12],[60,18],[82,22],[92,42],
    [88,65],[72,82],[50,88],[28,82],[10,62],
    [8,38],[48,48]
  ];

  MESSAGES.forEach((m, i) => {
    const [xp, yp] = positions[i];
    const x = xp/100 * window.innerWidth;
    const y = yp/100 * window.innerHeight;

    const el = document.createElement('div');
    el.className = 'msg-star';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.color= m.color;
    el.style.animationDuration = (2.5 + Math.random()*2) + 's';
    el.style.animationDelay   = (Math.random()*2) + 's';

    const size = 14 + Math.floor(Math.random()*8);

    el.innerHTML = `
      <div class="ring" style="animation-delay:${Math.random()*2}s"></div>
      <div class="ring" style="animation-delay:${Math.random()*2 + 1}s; width:8px;height:8px;"></div>
      <svg width="${size}" height="${size}" viewBox="0 0 20 20">
        <polygon points="10,1 12.4,7.3 19,7.3 13.7,11.4 15.8,17.9 10,14 4.2,17.9 6.3,11.4 1,7.3 7.6,7.3"
          fill="${m.color}"
          filter="url(#glow${i})"/>
        <defs>
          <filter id="glow${i}" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
    `;

    el.dataset.idx = i;
    document.body.appendChild(el);
    msgStarEls.push(el);

    el.addEventListener('mouseenter', () => document.body.classList.add('on-star'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('on-star'));
    el.addEventListener('click', () => openMessage(i, el));
  });
}

// ════════════════════════════════════════
//  HUD dots
// ════════════════════════════════════════
const hudDots = document.getElementById('hud-dots');
const dots = [];
for(let i=0;i<12;i++){
  const d=document.createElement('div');
  d.className='hud-dot';
  hudDots.appendChild(d);
  dots.push(d);
}

// ════════════════════════════════════════
//  PARTICLES on click
// ════════════════════════════════════════
function spawnParticles(x, y, color) {
  for(let i=0;i<20;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const angle  = Math.random()*Math.PI*2;
    const dist   = 40 + Math.random()*80;
    const tx     = Math.cos(angle)*dist;
    const ty     = Math.sin(angle)*dist;
    const size   = 2 + Math.random()*4;
    p.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background:${color};
      box-shadow:0 0 6px ${color};
      --tx:translate(${tx}px,${ty}px);
      animation-duration:${.6+Math.random()*.6}s;
      animation-delay:${Math.random()*.1}s;
    `;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 1200);
  }
}

// ════════════════════════════════════════
//  MODAL
// ════════════════════════════════════════
const overlay  = document.getElementById('modal-overlay');
const modalNum = document.getElementById('modal-star-num');
const modalIco = document.getElementById('modal-icon');
const modalMsg = document.getElementById('modal-msg');
let foundSet   = new Set();

function openMessage(idx, el) {
  if(foundSet.has(idx)) return;
  foundSet.add(idx);

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top  + rect.height/2;
  spawnParticles(cx, cy, MESSAGES[idx].color);

  el.classList.add('found');
  found++;
  dots[idx].classList.add('lit');

  modalNum.textContent = `Estrella ${idx+1} de 12`;
  modalIco.textContent = MESSAGES[idx].icon;
  modalIco.style.animation = 'none';
  void modalIco.offsetWidth;
  modalIco.style.animation = '';
  modalMsg.textContent = MESSAGES[idx].msg;
  overlay.classList.add('open');

  document.body.classList.remove('on-star');

  if(found === 12) {
    setTimeout(showFinal, 600);
  }
}

document.getElementById('modal-close').addEventListener('click', () => {
  overlay.classList.remove('open');
});
overlay.addEventListener('click', e => {
  if(e.target === overlay) overlay.classList.remove('open');
});

// ════════════════════════════════════════
//  FINAL
// ════════════════════════════════════════
function showFinal() {
  overlay.classList.remove('open');
  setTimeout(() => {
    document.getElementById('final-overlay').classList.add('open');
    document.body.style.animation = 'rainbowPulse 2s ease-out';
    setTimeout(()=>document.body.style.animation='',2000);
  }, 500);
}

// ════════════════════════════════════════
//  SHOOTING STARS
// ════════════════════════════════════════
function shootStar() {
  const el = document.createElement('div');
  el.className = 'shoot';
  const y    = Math.random() * window.innerHeight * .7;
  const len  = 80 + Math.random()*180;
  const dur  = 1.2 + Math.random()*1.5;
  const dist = window.innerWidth * .6 + Math.random()*200;
  el.style.cssText = `
    top:${y}px; left:${Math.random()*window.innerWidth*.3}px;
    width:${len}px; --dist:${dist}px;
    animation-duration:${dur}s;
    animation-delay:0s;
    transform:rotate(${-5-Math.random()*15}deg);
  `;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),(dur+.2)*1000);
}

setInterval(shootStar, 3500 + Math.random()*2000);
setTimeout(shootStar, 1500);

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
placeMsgStars();
