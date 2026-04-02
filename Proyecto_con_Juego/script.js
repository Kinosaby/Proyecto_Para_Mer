/* ═══════════════════════════════════════
   CURSOR + TRAIL
   ═══════════════════════════════════════ */
const cur = document.getElementById('cursor');
let lastTrail = 0;

function moveCursor(x, y) {
    if (!cur) return;
    cur.style.left = x + 'px';
    cur.style.top  = y + 'px';
    const now = Date.now();
    if (now - lastTrail > 90) {
        lastTrail = now;
        const t = document.createElement('div');
        t.className = 'cursor-trail';
        t.textContent = ['💕','✨','⭐'][Math.floor(Math.random()*3)];
        t.style.cssText = `left:${x}px;top:${y}px;`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 600);
    }
}
document.addEventListener('mousemove', e => moveCursor(e.clientX, e.clientY));
document.addEventListener('touchmove', e => moveCursor(e.touches[0].clientX, e.touches[0].clientY), {passive:true});

/* ═══════════════════════════════════════
   STARFIELD
   ═══════════════════════════════════════ */
const cnv = document.getElementById('star-canvas');
const ctx = cnv.getContext('2d');
let stars = [];

function resizeCnv() {
    cnv.width  = window.innerWidth;
    cnv.height = window.innerHeight;
}
function mkStars() {
    stars = [];
    const n = Math.floor(cnv.width * cnv.height / 5500);
    for (let i = 0; i < n; i++)
        stars.push({
            x: Math.random() * cnv.width,
            y: Math.random() * cnv.height,
            r: Math.random() * 1.4 + 0.2,
            tw: Math.random() * Math.PI * 2,
            sp: Math.random() * 0.025 + 0.005
        });
}
function drawStars() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    stars.forEach(s => {
        s.tw += s.sp;
        const a = (Math.sin(s.tw) + 1) / 2 * 0.65 + 0.08;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,220,230,${a})`;
        ctx.fill();
    });
    requestAnimationFrame(drawStars);
}
resizeCnv(); mkStars(); drawStars();
window.addEventListener('resize', () => { resizeCnv(); mkStars(); });

/* ═══════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════ */
let curScreen = 1;

function goTo(n) {
    const from = document.getElementById('s' + curScreen);
    const to   = document.getElementById('s' + n);
    if (!to || n === curScreen) return;

    from.classList.add('out');
    from.classList.remove('active');

    setTimeout(() => {
        from.classList.remove('out');
        curScreen = n;
        to.classList.add('active');
        initScreen(n);
    }, 380);
}

function initScreen(n) {
    if (n === 2) initScan();
    if (n === 3) initGame();
    if (n === 4) initReasons();
    if (n === 5) initTypewriter();
    if (n === 6) initFinale();
}

/* ═══════════════════════════════════════
   S2 – FINGERPRINT SCANNER
   ═══════════════════════════════════════ */
let scanDone = false;
let scanIntervalId = null;

function initScan() {
    scanDone = false;
    document.getElementById('scanStatus').textContent = 'Toca para verificar';
    document.getElementById('scannerWrap').classList.remove('scanning');
}

function startScan() {
    if (scanDone) return;
    scanDone = true;

    const wrap   = document.getElementById('scannerWrap');
    const status = document.getElementById('scanStatus');
    wrap.classList.add('scanning');
    status.textContent = 'Verificando ADN emocional...';

    scanIntervalId = setInterval(() => {
        const rect = wrap.getBoundingClientRect();
        burst(rect.left + rect.width/2, rect.top + rect.height/2, 1);
    }, 280);

    setTimeout(() => {
        clearInterval(scanIntervalId);
        wrap.classList.remove('scanning');
        status.textContent = '¡Identidad confirmada! ❤️';
        flash();
        setTimeout(() => goTo(3), 1400);
    }, 3000);
}

function flash() {
    const f = document.createElement('div');
    f.style.cssText = 'position:fixed;inset:0;background:rgba(255,77,109,0.14);z-index:999;pointer-events:none;transition:opacity 0.5s;';
    document.body.appendChild(f);
    requestAnimationFrame(() => { f.style.opacity = '0'; });
    setTimeout(() => f.remove(), 500);
}

/* ═══════════════════════════════════════
   S3 – MEMORY GAME
   ═══════════════════════════════════════ */
const EMOJIS = ['💕','⭐','🌹','💫','🦋','🌙'];
let flipped = [], matchCount = 0, canFlip = true;

function initGame() {
    const grid = document.getElementById('memGrid');
    grid.innerHTML = '';
    flipped = []; matchCount = 0; canFlip = true;
    document.getElementById('progFill').style.width = '0%';
    document.getElementById('pairsLabel').textContent = '0 / 6 PAREJAS';

    const deck = shuffle([...EMOJIS, ...EMOJIS]);
    deck.forEach(emoji => {
        const mc = document.createElement('div');
        mc.className = 'mc';
        mc.dataset.e = emoji;
        mc.innerHTML = `<div class="mc-inner"><div class="mc-front"></div><div class="mc-back">${emoji}</div></div>`;
        mc.addEventListener('click', () => flipCard(mc));
        grid.appendChild(mc);
    });
}

function shuffle(a) {
    for (let i = a.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function flipCard(mc) {
    if (!canFlip) return;
    if (mc.classList.contains('flipped') || mc.classList.contains('matched')) return;
    if (flipped.length >= 2) return;

    mc.classList.add('flipped');
    flipped.push(mc);

    if (flipped.length === 2) {
        canFlip = false;
        const [a, b] = flipped;

        if (a.dataset.e === b.dataset.e) {
            setTimeout(() => {
                a.classList.replace('flipped','matched');
                b.classList.replace('flipped','matched');
                matchCount++;
                const rect = a.getBoundingClientRect();
                burst(rect.left + rect.width/2, rect.top + rect.height/2, 7);
                const pct = (matchCount / 6) * 100;
                document.getElementById('progFill').style.width = pct + '%';
                document.getElementById('pairsLabel').textContent = `${matchCount} / 6 PAREJAS`;
                flipped = []; canFlip = true;

                if (matchCount === 6) {
                    setTimeout(() => {
                        [0,200,400].forEach(d => setTimeout(() => burst(innerWidth/2, innerHeight/2, 18), d));
                        setTimeout(() => goTo(4), 1600);
                    }, 400);
                }
            }, 280);
        } else {
            setTimeout(() => {
                a.classList.add('wrong'); b.classList.add('wrong');
                setTimeout(() => {
                    a.classList.remove('flipped','wrong');
                    b.classList.remove('flipped','wrong');
                    flipped = []; canFlip = true;
                }, 430);
            }, 650);
        }
    }
}

/* ═══════════════════════════════════════
   S4 – REASONS
   ═══════════════════════════════════════ */
function initReasons() {
    const items = document.querySelectorAll('.reason');
    const btn   = document.getElementById('btn4');
    btn.classList.add('hidden');
    items.forEach(i => i.classList.remove('show'));

    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('show');
            if (i === items.length - 1)
                setTimeout(() => btn.classList.remove('hidden'), 400);
        }, (i+1) * 1100);
    });
}

/* ═══════════════════════════════════════
   S5 – TYPEWRITER
   ═══════════════════════════════════════ */
function initTypewriter() {
    const el  = document.getElementById('tw-text');
    const btn = document.getElementById('btn5');
    btn.classList.add('hidden');

    const msg = "A veces me pregunto cómo tuve la suerte de cruzarme en tu camino... Eres más de lo que jamás soñé. Cada detalle de ti me fascina y me enamora un poco más cada día. Quiero que sepas que, sea lo que sea que pase, siempre estaré aquí para ti.";
    let i = 0;
    el.innerHTML = '<span class="cur"></span>';

    function type() {
        if (i < msg.length) {
            el.innerHTML = msg.slice(0, ++i) + '<span class="cur"></span>';
            setTimeout(type, 42);
        } else {
            setTimeout(() => btn.classList.remove('hidden'), 500);
        }
    }
    setTimeout(type, 800);
}

/* ═══════════════════════════════════════
   S6 – FINALE
   ═══════════════════════════════════════ */
function initFinale() {
    document.getElementById('yesBtn').onclick = () => {
        confetti();
        setTimeout(() => document.getElementById('modal').classList.add('show'), 600);
    };

    const noB = document.getElementById('noBtn');
    function runAway(e) {
        const maxX = innerWidth  - noB.offsetWidth  - 30;
        const maxY = innerHeight - noB.offsetHeight - 30;
        noB.style.cssText = `
            position:fixed;
            left:${Math.random()*maxX}px;
            top:${Math.random()*maxY}px;
            z-index:50;
            background:transparent;color:rgba(255,255,255,0.5);
            border:1px solid rgba(255,255,255,0.13);
            font-family:'Josefin Sans',sans-serif;
            font-size:0.75rem;letter-spacing:2.5px;text-transform:uppercase;
            padding:10px 24px;border-radius:100px;cursor:pointer;
            transition:left 0.15s,top 0.15s;
        `;
    }
    noB.addEventListener('mouseover', runAway);
    noB.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runAway(e);
    });
}

/* ═══════════════════════════════════════
   PARTICLES & CONFETTI
   ═══════════════════════════════════════ */
const EMOJIS_PT = ['💕','✨','⭐','🌹','💫'];

function burst(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
        const p   = document.createElement('div');
        const ang = (Math.PI*2/n)*i + Math.random()*0.4;
        const d   = 50 + Math.random()*70;
        p.className = 'pt';
        p.textContent = EMOJIS_PT[Math.floor(Math.random()*EMOJIS_PT.length)];
        p.style.cssText = `
            left:${x}px;top:${y}px;
            font-size:${0.75+Math.random()*0.65}rem;
            --tx:${Math.cos(ang)*d}px;
            --ty:${Math.sin(ang)*d - 50}px;
            --d:${0.55+Math.random()*0.55}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

function confetti() {
    const colors = ['#ff4d6d','#ffb3c1','#ffffff','#ffd700','#ff8fa3','#c9184a'];
    const shapes = ['●','■','▲','★','♥','✦'];
    for (let i = 0; i < 170; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confPiece';
            c.textContent = shapes[Math.floor(Math.random()*shapes.length)];
            const sz = 6 + Math.random()*10;
            c.style.cssText = `
                left:${Math.random()*100}vw;
                font-size:${sz}px;
                color:${colors[Math.floor(Math.random()*colors.length)]};
                --d:${2+Math.random()*3.5}s;
                --dl:${Math.random()*0.8}s;
                --r:${360+Math.random()*720}deg;
            `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 7000);
        }, Math.random()*900);
    }
}
