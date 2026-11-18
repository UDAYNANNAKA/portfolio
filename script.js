/**
 * Nannaka Uday Portfolio — Engineering Systems & Interactive Lab Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTerminalTabs();
    initInteractiveLab();
    initCommandPalette();
    initClipboard();
    initContactForm();
    initWeatherCanvas();
    initSensorCanvas();
});

/* ==========================================================================
   1. Theme Management
   ========================================================================== */
function initTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('uday_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('uday_theme', next);
            // Redraw canvases with proper theme colors
            drawWeatherChart(activeWeatherModel);
        });
    }
}

/* ==========================================================================
   2. Hero Terminal Simulator
   ========================================================================== */
function initTerminalTabs() {
    const tabs = document.querySelectorAll('.term-tab');
    const bodies = document.querySelectorAll('.terminal-body');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            bodies.forEach(b => b.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `term-${tab.dataset.tab}`;
            const targetBody = document.getElementById(targetId);
            if (targetBody) targetBody.classList.add('active');
        });
    });
}

/* ==========================================================================
   3. Interactive Laboratory Engine
   ========================================================================== */
const RAG_KNOWLEDGE_BASE = {
    "What primary efficacy endpoints were achieved in Phase 3?": {
        chunks: [
            { id: "Chunk #42 (Page 7, Sec 3.2)", score: 0.914, text: "The Phase 3 primary efficacy endpoint demonstrated a statistically significant 38.4% reduction in annualized relapse rate (ARR) compared to standard-of-care (p < 0.001)..." },
            { id: "Chunk #45 (Page 8, Sec 3.4)", score: 0.887, text: "Secondary endpoints demonstrated a 42.1% reduction in newly active MRI lesions over 48 weeks, meeting key neuro-protective biomarker benchmarks..." },
            { id: "Chunk #51 (Page 9, Sec 3.6)", score: 0.832, text: "Composite disability progression at 24 weeks was sustained in 82.3% of treated patients vs 67.1% in the comparator arm..." }
        ],
        answer: "In Phase 3, the primary efficacy endpoint was met with a <strong>38.4% reduction in annualized relapse rate (ARR)</strong> vs. standard-of-care (p < 0.001) [Page 7, Sec 3.2]. Secondary endpoints showed a <strong>42.1% reduction in new MRI lesions</strong> over 48 weeks [Page 8, Sec 3.4] and sustained disability progression in 82.3% of patients [Page 9, Sec 3.6]."
    },
    "What were the reported adverse side effects and safety profile?": {
        chunks: [
            { id: "Chunk #78 (Page 14, Sec 5.1)", score: 0.931, text: "Adverse events were predominantly mild to moderate (Grade 1-2). Transient injection site reactions occurred in 14.2% of participants and mild upper respiratory tract infections in 8.7%..." },
            { id: "Chunk #82 (Page 15, Sec 5.3)", score: 0.865, text: "Discontinuation due to adverse events was low at 2.1% compared to 3.4% in the placebo group. No opportunistic infections or drug-induced liver injuries were recorded..." }
        ],
        answer: "The safety profile demonstrated favorable tolerability with predominantly <strong>Grade 1–2 mild events</strong> [Page 14, Sec 5.1]. Most frequent adverse events were transient injection-site erythema (14.2%) and mild respiratory infections (8.7%). Discontinuation rates were low at <strong>2.1%</strong> with zero drug-induced liver injuries recorded [Page 15, Sec 5.3]."
    },
    "What was the dosage regimen and sample size of the patient cohort?": {
        chunks: [
            { id: "Chunk #12 (Page 3, Sec 1.4)", score: 0.926, text: "A multi-center cohort of n = 1,420 randomized adult patients (aged 18-65) across 48 clinical research facilities across North America and Europe was enrolled..." },
            { id: "Chunk #15 (Page 4, Sec 1.6)", score: 0.892, text: "Patients were administered 120 mg subcutaneous injections bi-weekly for the initial 8 weeks, transitioning to a monthly 80 mg maintenance regimen thereafter..." }
        ],
        answer: "The cohort comprised <strong>n = 1,420 randomized adult patients</strong> across 48 centers [Page 3, Sec 1.4]. The dosing regimen consisted of <strong>120 mg subcutaneous injections bi-weekly</strong> for the first 8 weeks, followed by <strong>80 mg monthly maintenance</strong> [Page 4, Sec 1.6]."
    },
    "Who is the CEO of Apple Inc.?": {
        chunks: [
            { id: "Chunk #04 (Page 1, Header)", score: 0.312, text: "Clinical study identifier: NCT-0492819. Sponsor: AlphaBio Therapeutics AG, Basel, Switzerland. Clinical trial protocol version 3.4..." },
            { id: "Chunk #11 (Page 2, Scope)", score: 0.285, text: "Scope of investigated molecular target: Monoclonal antibody targeting CD20+ cell surface markers in autoimmune pathology..." }
        ],
        answer: "⚠️ <strong>Hallucination Fallback Triggered:</strong> Cosine similarity score fell below strict threshold (max score: 0.312 < 0.750). The provided knowledge document (<em>AlphaBio_Clinical_Trial_Phase3.pdf</em>) contains no factual information regarding Apple Inc. or its leadership. The model refrains from generating ungrounded responses."
    }
};

function initInteractiveLab() {
    // Lab Tab switcher
    const navBtns = document.querySelectorAll('.lab-nav-btn');
    const panels = document.querySelectorAll('.lab-panel');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`lab-${btn.dataset.lab}`);
            if (targetPanel) targetPanel.classList.add('active');

            if (btn.dataset.lab === 'weather-sim') {
                setTimeout(() => drawWeatherChart(activeWeatherModel), 50);
            }
        });
    });

    // RAG Simulator
    const chips = document.querySelectorAll('.q-chip');
    const input = document.getElementById('rag-query-input');
    const runBtn = document.getElementById('run-rag-btn');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            input.value = chip.dataset.q;
            executeRagSimulation(chip.dataset.q);
        });
    });

    if (runBtn) {
        runBtn.addEventListener('click', () => {
            executeRagSimulation(input.value.trim());
        });
    }

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') executeRagSimulation(input.value.trim());
        });
    }
}

function executeRagSimulation(query) {
    const chunksContainer = document.getElementById('chunks-output');
    const answerContainer = document.getElementById('rag-answer-output');
    const latencyEl = document.getElementById('rag-sim-time');

    if (!chunksContainer || !answerContainer) return;

    // Simulate search
    chunksContainer.innerHTML = `<div class="chunk-card"><span class="term-dim">Searching vector space with all-MiniLM-L6-v2...</span></div>`;
    answerContainer.innerHTML = `<span class="term-dim">Synthesizing grounded citations...</span>`;

    const randomLatency = Math.floor(Math.random() * 15) + 12;
    if (latencyEl) latencyEl.textContent = `Latency: ${randomLatency}ms`;

    setTimeout(() => {
        const match = RAG_KNOWLEDGE_BASE[query] || {
            chunks: [
                { id: "Chunk #33 (Page 6, Sec 2.9)", score: 0.742, text: "General cohort evaluation across multi-center demographics demonstrated consistency with baseline clinical indicators..." }
            ],
            answer: `Context retrieved with moderate relevance score (0.742). Information addressing <em>"${query}"</em> is partially represented in clinical trial logs [Page 6, Sec 2.9].`
        };

        chunksContainer.innerHTML = match.chunks.map(c => `
            <div class="chunk-card">
                <div class="chunk-meta">
                    <span class="chunk-id">${c.id}</span>
                    <span class="chunk-score" style="color: ${c.score > 0.75 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">Cosine: ${c.score}</span>
                </div>
                <p class="chunk-text">"${c.text}"</p>
            </div>
        `).join('');

        answerContainer.innerHTML = match.answer;
    }, 280);
}

/* ==========================================================================
   4. Weather Time-Series Interactive Canvas
   ========================================================================== */
let activeWeatherModel = 'lstm';

const MODEL_SPECS = {
    lstm: { rmse: '1.14 °C', mae: '0.89 °C', latency: '18 ms', r2: '0.924', color: '#6366f1' },
    rf: { rmse: '1.83 °C', mae: '1.42 °C', latency: '5 ms', r2: '0.828', color: '#38bdf8' },
    arima: { rmse: '2.41 °C', mae: '1.94 °C', latency: '12 ms', r2: '0.742', color: '#f59e0b' }
};

function initWeatherCanvas() {
    const modelBtns = document.querySelectorAll('#weather-model-group .btn-toggle');
    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeWeatherModel = btn.dataset.model;
            updateWeatherStats(activeWeatherModel);
            drawWeatherChart(activeWeatherModel);
        });
    });

    drawWeatherChart(activeWeatherModel);
    window.addEventListener('resize', () => drawWeatherChart(activeWeatherModel));
}

function updateWeatherStats(modelKey) {
    const spec = MODEL_SPECS[modelKey];
    if (!spec) return;
    document.getElementById('stat-rmse').textContent = spec.rmse;
    document.getElementById('stat-mae').textContent = spec.mae;
    document.getElementById('stat-latency').textContent = spec.latency;
    document.getElementById('stat-r2').textContent = spec.r2;
}

function drawWeatherChart(modelKey) {
    const canvas = document.getElementById('weatherCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Scale for Retina/HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 240;
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };

    ctx.clearRect(0, 0, W, H);

    // Draw Grid Lines & Y-axis labels
    const gridRows = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#71717a';

    for (let i = 0; i <= gridRows; i++) {
        const y = padding.top + (i / gridRows) * (H - padding.top - padding.bottom);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();

        const tempVal = Math.round(34 - i * 4);
        ctx.fillText(`${tempVal}°C`, 14, y + 4);
    }

    // Time points (72 hours, step of 3 hours = 25 points)
    const N = 25;
    const groundTruth = [
        24, 25, 28, 32, 33, 31, 28, 25,
        23, 24, 27, 31, 33, 30, 27, 24,
        22, 23, 26, 30, 32, 29, 26, 23, 22
    ];

    const modelPredictions = {
        lstm: groundTruth.map((t, idx) => t + Math.sin(idx * 0.8) * 0.9),
        rf: groundTruth.map((t, idx) => t + Math.cos(idx * 0.9) * 1.6),
        arima: groundTruth.map((t, idx) => t + (idx * 0.08) + Math.sin(idx * 1.2) * 2.2)
    };

    function getY(val) {
        const minT = 18;
        const maxT = 34;
        return padding.top + (1 - (val - minT) / (maxT - minT)) * (H - padding.top - padding.bottom);
    }

    function getX(i) {
        return padding.left + (i / (N - 1)) * (W - padding.left - padding.right);
    }

    // X-axis labels
    ctx.fillStyle = '#71717a';
    for (let i = 0; i < N; i += 4) {
        const x = getX(i);
        ctx.fillText(`+${i * 3}h`, x - 10, H - 12);
    }

    // 1. Draw Ground Truth Curve (Dashed Slate)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let i = 0; i < N; i++) {
        const x = getX(i);
        const y = getY(groundTruth[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Active Model Curve (Smooth colored with gradient shadow)
    const activeColor = MODEL_SPECS[modelKey].color;
    const predData = modelPredictions[modelKey];

    // Shadow area under curve
    ctx.beginPath();
    ctx.moveTo(getX(0), H - padding.bottom);
    for (let i = 0; i < N; i++) {
        ctx.lineTo(getX(i), getY(predData[i]));
    }
    ctx.lineTo(getX(N - 1), H - padding.bottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
    gradient.addColorStop(0, `${activeColor}33`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < N; i++) {
        const x = getX(i);
        const y = getY(predData[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Data points
    for (let i = 0; i < N; i += 2) {
        const x = getX(i);
        const y = getY(predData[i]);
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/* ==========================================================================
   5. Live IMU Sensor Signal Stream (Continuous Animated Canvas)
   ========================================================================== */
let activeMotion = 'walking';
let sensorAnimId = null;

const HAR_SPECS = {
    walking: { freq: 1.8, amp: 26, noise: 4, name: 'WALKING', conf: '95.4%' },
    jogging: { freq: 2.8, amp: 48, noise: 9, name: 'JOGGING', conf: '97.1%' },
    standing: { freq: 0.1, amp: 3, noise: 1.5, name: 'STANDING', conf: '94.8%' },
    sitting: { freq: 0.05, amp: 1.2, noise: 0.8, name: 'SITTING', conf: '98.6%' }
};

function initSensorCanvas() {
    const actBtns = document.querySelectorAll('#har-motion-group .btn-toggle');
    actBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            actBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeMotion = btn.dataset.act;

            const spec = HAR_SPECS[activeMotion];
            document.getElementById('har-pred-val').textContent = spec.name;
            document.getElementById('har-pred-conf').textContent = `${spec.conf} Confidence`;
        });
    });

    startSensorStream();
}

function startSensorStream() {
    const canvas = document.getElementById('sensorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let offset = 0;

    function render() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = 160 * dpr;
            ctx.scale(dpr, dpr);
        }

        const W = rect.width;
        const H = 160;

        ctx.clearRect(0, 0, W, H);

        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        const spec = HAR_SPECS[activeMotion];
        offset += 0.08;

        // Tri-axial Accelerometer: ax (Blue), ay (Purple), az (Amber)
        const channels = [
            { color: '#38bdf8', phase: 0, ampMult: 1.0, label: 'a_x (lateral)' },
            { color: '#a855f7', phase: Math.PI / 3, ampMult: 0.8, label: 'a_y (vertical)' },
            { color: '#f59e0b', phase: Math.PI / 1.5, ampMult: 0.5, label: 'a_z (forward)' }
        ];

        channels.forEach(ch => {
            ctx.beginPath();
            ctx.strokeStyle = ch.color;
            ctx.lineWidth = 1.5;

            for (let x = 0; x < W; x += 3) {
                const t = (x * 0.02) + offset;
                const baseWave = Math.sin(t * spec.freq + ch.phase);
                const harmonic = Math.sin(t * spec.freq * 2) * 0.25;
                const pseudoNoise = (Math.sin(x * 13.5 + offset * 5) * spec.noise);

                const y = (H / 2) + (baseWave + harmonic) * (spec.amp * ch.ampMult) + pseudoNoise;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Legend overlay
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('a_x (lateral)', 14, 20);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('a_y (vertical)', 110, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('a_z (forward)', 205, 20);

        sensorAnimId = requestAnimationFrame(render);
    }

    if (sensorAnimId) cancelAnimationFrame(sensorAnimId);
    sensorAnimId = requestAnimationFrame(render);
}

/* ==========================================================================
   6. Command Palette (Ctrl+K)
   ========================================================================== */
function initCommandPalette() {
    const overlay = document.getElementById('cmd-overlay');
    const btn = document.getElementById('cmd-palette-btn');
    const input = document.getElementById('cmd-input');
    const results = document.getElementById('cmd-results');

    if (!overlay || !btn || !input) return;

    function openPalette() {
        overlay.classList.add('open');
        input.value = '';
        filterPalette('');
        setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
        overlay.classList.remove('open');
    }

    btn.addEventListener('click', openPalette);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePalette();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('open')) closePalette();
            else openPalette();
        } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closePalette();
        }
    });

    input.addEventListener('input', (e) => {
        filterPalette(e.target.value.toLowerCase().trim());
    });

    // Close when clicking an action link
    overlay.querySelectorAll('[data-action="close"]').forEach(link => {
        link.addEventListener('click', closePalette);
    });

    // Copy email shortcut inside palette
    const cmdCopyEmail = document.getElementById('cmd-copy-email');
    if (cmdCopyEmail) {
        cmdCopyEmail.addEventListener('click', () => {
            copyText('udaynannaka999@gmail.com', 'Email copied to clipboard!');
            closePalette();
        });
    }
}

function filterPalette(query) {
    const items = document.querySelectorAll('.cmd-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

/* ==========================================================================
   7. Clipboard & Direct Actions
   ========================================================================== */
function initClipboard() {
    const emailBtn = document.getElementById('copy-email-btn');
    const phoneBtn = document.getElementById('copy-phone-btn');

    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            copyText('udaynannaka999@gmail.com', 'Email copied: udaynannaka999@gmail.com');
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            copyText('+919701276579', 'Phone number copied: +91 97012 76579');
        });
    }
}

function copyText(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast(message));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(message);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ==========================================================================
   8. Contact Form Pre-filled Mailto Handshake
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('real-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value;
        const msg = document.getElementById('form-msg').value.trim();

        const body = `Hi Uday,\n\nMy name is ${name} (${email}).\n\n${msg}\n\nBest regards,\n${name}`;
        const mailtoUrl = `mailto:udaynannaka999@gmail.com?subject=${encodeURIComponent(`[Portfolio Inquiry] ${subject} - ${name}`)}&body=${encodeURIComponent(body)}`;

        showToast('Opening default email client...');
        window.location.href = mailtoUrl;
    });
}
