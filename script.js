'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ACCENT = '#0e6566';
const FONT_FAMILY = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

// =========================================================
// 1. ТОПОГРАФИЧЕСКИЙ ФОН
// =========================================================
const topoCanvas = document.getElementById('topo-canvas');
const topoCtx = topoCanvas.getContext('2d');

const RENDER_SCALE = 0.5;
const CELL = 10;
const THRESHOLDS = [0.2, 0.35, 0.5, 0.65, 0.8];
const TOPO_FRAME_MS = 1000 / 30;

let bgWidth = 0, bgHeight = 0, cols = 0, rows = 0;
let grid = new Float32Array(0);
let bgTime = 0;

function resizeTopo() {
    bgWidth = window.innerWidth;
    bgHeight = window.innerHeight;

    topoCanvas.width = Math.round(bgWidth * RENDER_SCALE);
    topoCanvas.height = Math.round(bgHeight * RENDER_SCALE);
    topoCtx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);

    topoCtx.strokeStyle = 'rgba(14, 101, 102, 0.95)';
    topoCtx.lineWidth = 2;

    cols = Math.floor(bgWidth / CELL) + 1;
    rows = Math.floor(bgHeight / CELL) + 1;
    grid = new Float32Array(cols * rows);

    if (reduceMotion) drawTopoMap();
}

class FastNoise {
    constructor() {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
        }
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }

    noise3D(x, y, z) {
        const perm = this.perm;
        const fx = Math.floor(x), fy = Math.floor(y), fz = Math.floor(z);
        const X = fx & 255, Y = fy & 255, Z = fz & 255;
        x -= fx; y -= fy; z -= fz;
        const u = x * x * x * (x * (x * 6 - 15) + 10);
        const v = y * y * y * (y * (y * 6 - 15) + 10);
        const w = z * z * z * (z * (z * 6 - 15) + 10);

        const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
        const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u, this.grad(perm[AA], x, y, z), this.grad(perm[BA], x - 1, y, z)),
                this.lerp(u, this.grad(perm[AB], x, y - 1, z), this.grad(perm[BB], x - 1, y - 1, z))
            ),
            this.lerp(v,
                this.lerp(u, this.grad(perm[AA + 1], x, y, z - 1), this.grad(perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(perm[AB + 1], x, y - 1, z - 1), this.grad(perm[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }

    lerp(t, a, b) { return a + t * (b - a); }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}

const noise = new FastNoise();

const EDGES = [
    [], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0],
    [3, 0], [0, 2], [0, 1, 3, 2], [0, 1], [3, 1], [2, 1], [3, 2], []
];
const pts = new Float32Array(8);

function mu(v1, v2, t) {
    const d = v2 - v1;
    return Math.abs(d) < 1e-5 ? 0 : (t - v1) / d;
}

function drawTopoMap() {
    topoCtx.fillStyle = '#050811';
    topoCtx.fillRect(0, 0, bgWidth, bgHeight);

    bgTime += 0.005;

    for (let r = 0; r < rows; r++) {
        const rowOff = r * cols;
        for (let c = 0; c < cols; c++) {
            grid[rowOff + c] = (noise.noise3D(c * 0.025, r * 0.025, bgTime) + 1) * 0.5;
        }
    }

    for (let t = 0; t < THRESHOLDS.length; t++) {
        const th = THRESHOLDS[t];
        topoCtx.beginPath();

        for (let r = 0; r < rows - 1; r++) {
            const y = r * CELL;
            const i0 = r * cols;
            const i1 = i0 + cols;
            for (let c = 0; c < cols - 1; c++) {
                const v1 = grid[i0 + c];
                const v2 = grid[i0 + c + 1];
                const v3 = grid[i1 + c + 1];
                const v4 = grid[i1 + c];

                const idx = (v1 >= th ? 8 : 0) | (v2 >= th ? 4 : 0) | (v3 >= th ? 2 : 0) | (v4 >= th ? 1 : 0);
                if (idx === 0 || idx === 15) continue;

                const x = c * CELL;
                pts[0] = x + mu(v1, v2, th) * CELL; pts[1] = y;
                pts[2] = x + CELL;                  pts[3] = y + mu(v2, v3, th) * CELL;
                pts[4] = x + mu(v4, v3, th) * CELL; pts[5] = y + CELL;
                pts[6] = x;                         pts[7] = y + mu(v1, v4, th) * CELL;

                const e = EDGES[idx];
                for (let k = 0; k < e.length; k += 2) {
                    topoCtx.moveTo(pts[e[k] * 2], pts[e[k] * 2 + 1]);
                    topoCtx.lineTo(pts[e[k + 1] * 2], pts[e[k + 1] * 2 + 1]);
                }
            }
        }
        topoCtx.stroke();
    }
}

// =========================================================
// 2. ИНТЕРАКТИВНЫЙ ТЕКСТ ИЗ ЧАСТИЦ
// =========================================================
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d');

let particles = [];
let tW = 0, tH = 0;
let textVisible = true;
const mouse = { x: -10000, y: -10000, radius: 65, r2: 65 * 65 };

function fitFont(ctx, text, weight, maxSize, maxWidth) {
    ctx.font = `${weight} ${maxSize}px ${FONT_FAMILY}`;
    const w = ctx.measureText(text).width;
    return w > maxWidth ? Math.floor(maxSize * maxWidth / w) : maxSize;
}

const WHITE_RGB = '255,255,255';
const ACCENT_RGB = '14,101,102';

function initTextMap() {
    const rect = textCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        setTimeout(initTextMap, 100);
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    tW = rect.width;
    tH = rect.height;

    textCanvas.width = Math.round(tW * dpr);
    textCanvas.height = Math.round(tH * dpr);
    textCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const compact = tW < 600;
    mouse.radius = compact ? 45 : 65;
    mouse.r2 = mouse.radius * mouse.radius;

    const offscreen = document.createElement('canvas');
    offscreen.width = Math.round(tW);
    offscreen.height = Math.round(tH);
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    const maxW = tW * 0.94;

    const nameSize = fitFont(offCtx, 'Александр', 800, 96, maxW);
    const subSize = fitFont(offCtx, 'Python Web Developer', 700, Math.min(46, nameSize * 0.48), maxW);

    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    offCtx.font = `800 ${nameSize}px ${FONT_FAMILY}`;
    offCtx.fillStyle = '#ffffff';
    offCtx.fillText('Александр', offscreen.width / 2, offscreen.height * 0.32);

    offCtx.font = `700 ${subSize}px ${FONT_FAMILY}`;
    offCtx.fillStyle = ACCENT;
    offCtx.fillText('Python Web Developer', offscreen.width / 2, offscreen.height * 0.74);

    const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
    const step = compact ? 2 : 3;
    const next = [];

    for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
            const i = (y * offscreen.width + x) * 4;
            const alpha = data[i + 3];
            if (alpha > 40) {
                const a = Math.ceil(alpha / 64) / 4;
                next.push({
                    x, y,
                    baseX: x, baseY: y,
                    vx: 0, vy: 0,
                    size: step,
                    color: `rgba(${data[i] > 128 ? WHITE_RGB : ACCENT_RGB},${a})`
                });
            }
        }
    }

    next.sort((p1, p2) => (p1.color < p2.color ? -1 : p1.color > p2.color ? 1 : 0));
    particles = next;
}

textCanvas.addEventListener('pointermove', (e) => {
    const rect = textCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
['pointerleave', 'pointercancel', 'pointerup'].forEach((ev) => {
    textCanvas.addEventListener(ev, () => {
        mouse.x = -10000;
        mouse.y = -10000;
    });
});

function animateText() {
    textCtx.clearRect(0, 0, tW, tH);

    const mx = mouse.x, my = mouse.y;
    const R = mouse.radius, R2 = mouse.r2;
    let lastColor = '';

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mx - p.x;
        const dy = my - p.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < R2) {
            const dist = Math.sqrt(d2) || 1;
            const f = (1 - dist / R) * 12;
            p.vx -= (dx / dist) * f;
            p.vy -= (dy / dist) * f;
        } else {
            const k = Math.min(Math.sqrt(d2) / R, 4.0);
            p.vx += (p.baseX - p.x) * 0.2 * k;
            p.vy += (p.baseY - p.y) * 0.2 * k;
        }

        p.vx += (p.baseX - p.x) * 0.25;
        p.vy += (p.baseY - p.y) * 0.25;

        p.vx *= 0.65;
        p.vy *= 0.65;

        p.x += p.vx;
        p.y += p.vy;

        if (p.color !== lastColor) {
            textCtx.fillStyle = lastColor = p.color;
        }
        textCtx.fillRect(p.x, p.y, p.size, p.size);
    }
}

if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
        textVisible = entries[0].isIntersecting;
    }).observe(textCanvas);
}

// =========================================================
// 3. ЕДИНЫЙ ЦИКЛ АНИМАЦИИ
// =========================================================
let lastTopo = 0;

function frame(now) {
    requestAnimationFrame(frame);

    if (!reduceMotion && now - lastTopo >= TOPO_FRAME_MS) {
        lastTopo = now;
        drawTopoMap();
    }
    if (textVisible) animateText();
}

// =========================================================
// 4. RESIZE
// =========================================================
let resizeTimer;
let lastW = window.innerWidth;
let lastH = window.innerHeight;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const widthChanged = w !== lastW;

        if (widthChanged) initTextMap();
        if (widthChanged || Math.abs(h - lastH) > 100) {
            resizeTopo();
            lastH = h;
        }
        lastW = w;
    }, 150);
});

// =========================================================
// 5. АНИМАЦИЯ СМЕНЫ СИМВОЛА ЛОГОТИПА
// =========================================================
const matrixChars = [
    'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ',
    'ﾀ', 'ﾂ', 'ﾃ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾊ', 'ﾐ', 'ﾑ',
    '∀', '∃', '∈', '∉', '∋', '∏', '∑', '√', '∝', '∞', 
    '∠', '∧', '∨', '∩', '∪', '∫', '∬', '∭', '∴', '∵',
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 
    'ξ', 'π', 'σ', 'φ', 'ψ',
    '≠', '≡', '≤', '≥', '⊂', '⊃', '⊆', '⊇', '⊕', '⊗', 
    '⊥', '▲', '◆', '■', '●',
    '←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙',
    '/', '\\', '|', '-', '+', '*', '#', '$', '%', '&', 
    '@', '{', '}', '<', '>'
];

function initMatrixSlash() {
    const logoEl = document.querySelector('.logo');
    if (!logoEl) return;

    let slashEl = logoEl.querySelector('.matrix-slash');
    if (!slashEl) {
        logoEl.innerHTML = 'Cibitka<span class="matrix-slash">/</span>';
        slashEl = logoEl.querySelector('.matrix-slash');
    }

    function triggerMatrixEffect() {
        if (document.hidden) return;

        const randomIndex = Math.floor(Math.random() * matrixChars.length);
        const nextChar = matrixChars[randomIndex];

        slashEl.classList.add('animating');
        slashEl.textContent = nextChar;

        setTimeout(() => {
            slashEl.classList.remove('animating');
        }, 200);
    }

    setInterval(triggerMatrixEffect, 3000);
}

// =========================================================
// 6. СТАРТ
// =========================================================
resizeTopo();
initMatrixSlash();
requestAnimationFrame(frame);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(initTextMap);