/* Avalon - décors illustrés des thèmes (SVG dessinés en code, aucune image à charger).
   AVDecor.monter(nom, annee) crée un calque fixe derrière le site ; il se redessine si l'écran change d'orientation. */
(function () {
    'use strict';
    const mk = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const f = (n) => Math.round(n * 10) / 10;
    const T = (x, y, s, inner) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${inner}</g>`;
    const hill = (W, H, y0, amp, seed, fill) => { let d = `M0 ${H} L0 ${f(y0)}`; for (let x = 0; x <= W + 20; x += 20) d += ` L${x} ${f(y0 + amp * (Math.sin(x * 0.004 + seed) + 0.5 * Math.sin(x * 0.011 + seed * 2)))}`; return `<path d="${d} L${W} ${H} Z" fill="${fill}"/>`; };
    const star5 = (r) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; p += `${f(Math.cos(a) * q)},${f(Math.sin(a) * q)} `; } return `<polygon points="${p}"/>`; };

    /* ---------- éléments communs ---------- */
    const etoiles = (W, H, rnd, n, col, haut) => { let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * H * haut)}" r="${f(0.8 + rnd() * 1.8)}" fill="${col}" opacity="${f(0.35 + rnd() * 0.5)}"${i % 4 === 0 ? ` class="tw" style="animation-delay:${f(rnd() * 4)}s"` : ''}/>`; return o; };
    const chauve = (x, y, s, c = '#120804') => T(x, y, s, `<path d="M0 -4 Q6 -14 10 -8 Q22 -14 34 -4 Q28 -2 26 8 Q20 2 14 8 Q8 2 0 10 Q-8 2 -14 8 Q-20 2 -26 8 Q-28 -2 -34 -4 Q-22 -14 -10 -8 Q-6 -14 0 -4Z" fill="${c}"/>`);
    const bouquet = (n) => n;

    /* ---------- Halloween ---------- */
    const citrouille = (x, y, s, anim) => T(x, y, s, `<ellipse cx="-27" cy="0" rx="30" ry="36" fill="#e8620c"/><ellipse cx="27" cy="0" rx="30" ry="36" fill="#e8620c"/><ellipse cx="0" cy="0" rx="33" ry="40" fill="#ff7a1a"/>
        <path d="M-15 -38 Q-26 0 -15 38 M15 -38 Q26 0 15 38" stroke="#c94f05" stroke-width="2.5" fill="none"/><path d="M-4 -38 Q-2 -54 10 -58 L14 -50 Q6 -48 6 -37Z" fill="#4a6b1f"/>
        <g${anim ? ' class="flick"' : ''}><ellipse cx="0" cy="6" rx="44" ry="36" fill="url(#hFace)"/><path d="M-26 -4 L-17 -20 L-8 -4Z M8 -4 L17 -20 L26 -4Z M-4 4 L0 -3 L4 4Z" fill="#ffe27a"/>
        <path d="M-25 12 L-15 8 L-9 18 L0 10 L9 18 L15 8 L25 12 Q0 38 -25 12Z" fill="#ffe27a"/></g>`);
    const fantome = (x, y, s, op) => T(x, y, s, `<g class="bob" style="animation-delay:${f((x % 7) / 3)}s"><path d="M-30 42 L-30 -8 C-30 -52 30 -52 30 -8 L30 42 L20 31 L10 44 L0 31 L-10 44 L-20 31Z" fill="url(#hGhost)" opacity="${op}"/>
        <ellipse cx="-10" cy="-8" rx="5" ry="8" fill="#2a1a40" opacity="${op}"/><ellipse cx="10" cy="-8" rx="5" ry="8" fill="#2a1a40" opacity="${op}"/><ellipse cx="0" cy="14" rx="6" ry="8" fill="#2a1a40" opacity="${op}"/>
        <ellipse cx="-20" cy="6" rx="5" ry="3" fill="#ff9ec0" opacity="${f(op * 0.5)}"/><ellipse cx="20" cy="6" rx="5" ry="3" fill="#ff9ec0" opacity="${f(op * 0.5)}"/></g>`);
    function arbreMort(x, y, s, rnd, col) {
        const niv = [[], [], [], [], []];
        (function b(px, py, a, l, d) { if (d >= 5) return; const x2 = px + Math.cos(a) * l, y2 = py + Math.sin(a) * l; niv[d].push(`M${f(px)} ${f(py)}L${f(x2)} ${f(y2)}`);
            b(x2, y2, a - 0.4 - rnd() * 0.35, l * 0.74, d + 1); b(x2, y2, a + 0.35 + rnd() * 0.4, l * 0.74, d + 1); if (rnd() < 0.4) b(x2, y2, a + (rnd() - 0.5) * 0.3, l * 0.6, d + 1); })(0, 0, -Math.PI / 2, 78, 0);
        return T(x, y, s, `<g stroke="${col}" stroke-linecap="round" fill="none">${niv.map((p, i) => `<path d="${p.join('')}" stroke-width="${[13, 9, 6, 4, 2.4][i]}"/>`).join('')}</g>`);
    }
    const maison = (x, y, s) => T(x, y, s, `<g fill="#140803"><rect x="-95" y="-120" width="190" height="120"/><polygon points="-115,-118 0,-205 115,-118"/><rect x="55" y="-215" width="48" height="215"/><polygon points="48,-212 79,-290 110,-212"/><rect x="-70" y="-190" width="20" height="60"/></g>
        <g fill="#ffb23c"><rect x="-72" y="-96" width="26" height="34" class="flick"/><rect x="-18" y="-96" width="26" height="34"/><rect x="66" y="-180" width="22" height="30" class="flick" style="animation-delay:.7s"/><rect x="66" y="-110" width="22" height="30"/><path d="M26 0 L26 -50 Q39 -64 52 -50 L52 0Z" fill="#ff8a1a"/><circle cx="0" cy="-160" r="18" fill="#ffcf7a" class="flick"/></g>
        <g stroke="#140803" stroke-width="3"><path d="M-72 -79H-46M-59 -96V-62M-18 -79H8M-5 -96V-62M66 -165H88M77 -180V-150"/></g>`);
    const pierre = (x, y, s) => T(x, y, s, `<path d="M-18 0 L-18 -34 Q-18 -52 0 -52 Q18 -52 18 -34 L18 0Z" fill="#1a0c06"/><path d="M0 -42 V-22 M-8 -34 H8" stroke="#3a1c0c" stroke-width="3"/>`);
    function halloween(W, H, u, por) {
        const rnd = mk(11), base = H * (por ? 0.83 : 0.9);
        let o = `<defs><radialGradient id="hMoon"><stop offset="0" stop-color="#fff4d6"/><stop offset="1" stop-color="#ffc66b"/></radialGradient><radialGradient id="hGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".5"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
            <radialGradient id="hFace"><stop offset="0" stop-color="#ffe27a" stop-opacity=".85"/><stop offset="1" stop-color="#ff9a1a" stop-opacity="0"/></radialGradient><linearGradient id="hGhost" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d9ccff"/></linearGradient></defs>`;
        o += etoiles(W, H, rnd, por ? 26 : 44, '#ffe9c7', 0.5);
        o += `<g opacity="${por ? 0.55 : 1}">`;
        const mx = W * (por ? 0.72 : 0.8), my = H * (por ? 0.27 : 0.2), mr = (por ? 78 : 112) * u;
        o += `<circle cx="${f(mx)}" cy="${f(my)}" r="${f(mr * 2)}" fill="url(#hGlow)"/><circle cx="${f(mx)}" cy="${f(my)}" r="${f(mr)}" fill="url(#hMoon)"/><g fill="#f0b25a" opacity=".45"><circle cx="${f(mx - mr * 0.3)}" cy="${f(my - mr * 0.25)}" r="${f(mr * 0.18)}"/><circle cx="${f(mx + mr * 0.35)}" cy="${f(my + mr * 0.15)}" r="${f(mr * 0.24)}"/><circle cx="${f(mx - mr * 0.1)}" cy="${f(my + mr * 0.5)}" r="${f(mr * 0.12)}"/></g>`;
        o += `<ellipse cx="${f(mx - mr * 0.5)}" cy="${f(my + mr * 0.55)}" rx="${f(mr * 1.5)}" ry="${f(mr * 0.1)}" fill="#1c0b04" opacity=".6"/><ellipse cx="${f(mx + mr * 0.7)}" cy="${f(my - mr * 0.55)}" rx="${f(mr * 1.1)}" ry="${f(mr * 0.08)}" fill="#1c0b04" opacity=".5"/>`;
        o += chauve(mx - mr * 0.2, my - mr * 0.3, 1.1 * u) + chauve(mx + mr * 0.5, my + mr * 0.2, 0.8 * u) + chauve(mx - mr * 0.9, my + mr * 0.7, 0.6 * u) + '</g>';
        o += hill(W, H, base - 40 * u, 26 * u, 1, '#1d0d05') + hill(W, H, base - 6 * u, 16 * u, 3, '#110703');
        o += arbreMort(W * (por ? 0.1 : 0.012), base + 4, 1.5 * u, rnd, '#0c0502') + arbreMort(W * (por ? 0.93 : 0.985), base + 4, 1.3 * u, rnd, '#0c0502');
        o += maison(W * (por ? 0.3 : 0.075), base - 22 * u, (por ? 0.9 : 1.05) * u);
        const nst = por ? 4 : 9; for (let i = 0; i < nst; i++) { const x = W * (por ? 0.45 : 0.3) + i * (W * (por ? 0.1 : 0.05)) + rnd() * 20; o += pierre(x, base - 8 * u + rnd() * 10, (0.7 + rnd() * 0.5) * u); }
        const np = por ? 5 : 11; for (let i = 0; i < np; i++) { const x = W * (0.04 + 0.92 * i / (np - 1)) + (rnd() - 0.5) * 50, s = (0.55 + rnd() * 0.6) * u * (i % 3 === 0 ? 1.25 : 1); o += citrouille(x, base + 8 * u + rnd() * 26 * u, s, i % 2 === 0); }
        o += citrouille(W * (por ? 0.62 : 0.93), base - 4 * u, 1.55 * u, true);
        const gh = por ? [[0.1, 0.12, 0.8, 0.7], [0.93, 0.38, 0.7, 0.55], [0.06, 0.58, 0.7, 0.45]] : [[0.09, 0.4, 1.5, 0.8], [0.93, 0.52, 1.2, 0.75], [0.2, 0.14, 0.9, 0.6], [0.06, 0.66, 0.8, 0.5]];
        gh.forEach(([a, b, s, op]) => { o += fantome(W * a, H * b, s * u, op); });
        o += `<g stroke="#ffe9c7" stroke-width="1.2" fill="none" opacity=".4"><path d="M0 0 Q90 20 150 150 M0 0 Q40 50 20 160 M0 40 Q40 60 70 110 M0 90 Q30 100 50 140"/></g><g class="sway"><path d="M${f(W * 0.9)} 0 V${f(H * 0.1)}" stroke="#ffe9c7" stroke-width="1" opacity=".5"/><g transform="translate(${f(W * 0.9)} ${f(H * 0.1)})"><ellipse rx="9" ry="11" fill="#120804"/><circle cy="-12" r="6" fill="#120804"/><path d="M-8 -2 L-22 -12 M-9 2 L-24 4 M-8 6 L-20 18 M8 -2 L22 -12 M9 2 L24 4 M8 6 L20 18" stroke="#120804" stroke-width="2"/></g></g>`;
        return o;
    }

    /* ---------- Noël ---------- */
    const sapin = (x, y, s, rnd, lum) => { let o = `<rect x="-8" y="-4" width="16" height="22" fill="#5a3418"/>`; const E = [[0, -150, 74, 70], [0, -110, 92, 66], [0, -66, 112, 70], [0, -18, 134, 72]];
        E.forEach(([cx, ty, w, h], i) => { o += `<polygon points="${cx},${ty - h * 0.7} ${cx + w / 2},${ty + h * 0.3} ${cx - w / 2},${ty + h * 0.3}" fill="${['#1f8a52', '#19764a', '#146342', '#105438'][i]}"/><path d="M${-w / 2 + 6} ${ty + h * 0.3 - 3} Q${-w / 4} ${ty + h * 0.3 - 18} 0 ${ty + h * 0.3 - 4} Q${w / 4} ${ty + h * 0.3 - 18} ${w / 2 - 6} ${ty + h * 0.3 - 3} L${w / 2} ${ty + h * 0.3} L${-w / 2} ${ty + h * 0.3}Z" fill="#f4faff" opacity=".9"/>`; });
        if (lum) for (let i = 0; i < 14; i++) { const yy = -140 + rnd() * 150, ww = 28 + (yy + 140) * 0.38; o += `<circle cx="${f((rnd() - 0.5) * ww)}" cy="${f(yy)}" r="3.6" fill="${['#ff4d5a', '#ffd166', '#5ec7ff', '#8cf07a'][i % 4]}" class="tw" style="animation-delay:${f(rnd() * 3)}s"/>`; }
        o += `<g fill="#ffd166" class="tw">${T(0, -224, 1, star5(18))}</g>`; return T(x, y, s, o); };
    const cadeau = (x, y, w, h, c, r) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${c}"/><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h * 0.16}" fill="#000" opacity=".15"/><rect x="${-w * 0.07}" y="${-h}" width="${w * 0.14}" height="${h}" fill="${r}"/><rect x="${-w / 2}" y="${-h * 0.58}" width="${w}" height="${h * 0.14}" fill="${r}"/>
        <ellipse cx="${-w * 0.16}" cy="${-h - 7}" rx="${w * 0.17}" ry="9" fill="${r}"/><ellipse cx="${w * 0.16}" cy="${-h - 7}" rx="${w * 0.17}" ry="9" fill="${r}"/><circle cx="0" cy="${-h - 3}" r="5" fill="${r}"/></g>`;
    const bonhomme = (x, y, s) => T(x, y, s, `<circle cy="-34" r="40" fill="#f4faff"/><circle cy="-92" r="30" fill="#f4faff"/><circle cy="-136" r="22" fill="#f4faff"/><path d="M-30 -80 Q0 -66 30 -80 L30 -70 Q0 -56 -30 -70Z" fill="#e63946"/><path d="M18 -72 l6 28 l12 -3 l-6 -26Z" fill="#e63946"/>
        <rect x="-17" y="-172" width="34" height="26" fill="#1a1a22"/><rect x="-26" y="-150" width="52" height="7" fill="#1a1a22"/><rect x="-17" y="-155" width="34" height="6" fill="#e63946"/><circle cx="-8" cy="-139" r="2.6" fill="#111"/><circle cx="8" cy="-139" r="2.6" fill="#111"/><path d="M0 -133 l22 4 l-22 4Z" fill="#ff8a1a"/>
        <circle cy="-100" r="3.6" fill="#222"/><circle cy="-84" r="3.6" fill="#222"/><circle cy="-30" r="4" fill="#222"/><circle cy="-48" r="4" fill="#222"/><path d="M-30 -92 L-70 -118 M30 -92 L70 -120" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>`);
    const lutin = (x, y, s, flip) => T(x, y, s, `<g transform="scale(${flip ? -1 : 1} 1)"><g class="bob" style="animation-duration:3s"><path d="M-14 -22 L-10 0 M14 -22 L10 0" stroke="#2a1a10" stroke-width="7" stroke-linecap="round"/><ellipse cx="-12" cy="2" rx="10" ry="5" fill="#8b3a1e"/><ellipse cx="12" cy="2" rx="10" ry="5" fill="#8b3a1e"/>
        <path d="M-22 -26 L22 -26 L18 -62 L-18 -62Z" fill="#1fa354"/><rect x="-22" y="-44" width="44" height="7" fill="#e63946"/><rect x="-4" y="-45" width="8" height="9" fill="#ffd166"/><path d="M-18 -58 L-34 -78 M18 -58 L34 -88" stroke="#1fa354" stroke-width="8" stroke-linecap="round"/><circle cx="-34" cy="-80" r="5" fill="#f1c9a5"/><circle cx="34" cy="-90" r="5" fill="#f1c9a5"/>
        <g transform="translate(34 -104)"><rect x="-9" y="-9" width="18" height="16" fill="#e63946"/><rect x="-2" y="-9" width="4" height="16" fill="#ffd166"/></g>
        <circle cy="-76" r="15" fill="#f1c9a5"/><path d="M-15 -80 L-24 -84 L-14 -74Z M15 -80 L24 -84 L14 -74Z" fill="#f1c9a5"/><path d="M-17 -86 Q0 -96 17 -86 L8 -124 L0 -120Z" fill="#1fa354"/><rect x="-17" y="-90" width="34" height="7" rx="3" fill="#e63946"/><circle cx="8" cy="-122" r="6" fill="#fff"/>
        <circle cx="-5" cy="-76" r="1.8" fill="#222"/><circle cx="5" cy="-76" r="1.8" fill="#222"/><path d="M-5 -69 Q0 -65 5 -69" stroke="#a33" stroke-width="1.6" fill="none"/><circle cx="-9" cy="-71" r="2.6" fill="#ff9ec0" opacity=".7"/><circle cx="9" cy="-71" r="2.6" fill="#ff9ec0" opacity=".7"/></g></g>`);
    const renne = (x, y, s, nez) => T(x, y, s, `<g class="gallop"><path d="M-30 6 L-46 34 M-18 8 L-26 36 M24 6 L40 30 M34 4 L52 22" stroke="#7a4524" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="42" ry="19" fill="#9a5b2e"/><ellipse cx="2" cy="9" rx="30" ry="9" fill="#d9b38c"/><path d="M28 -6 L52 -34 L62 -26 L40 6Z" fill="#9a5b2e"/><ellipse cx="62" cy="-30" rx="14" ry="9" transform="rotate(-25 62 -30)" fill="#9a5b2e"/>
        <path d="M-40 -4 Q-52 -14 -50 -24 Q-42 -14 -34 -10Z" fill="#7a4524"/><path d="M56 -38 Q54 -62 44 -74 M52 -46 Q38 -52 34 -64 M60 -40 Q70 -60 82 -66 M64 -42 Q78 -46 84 -56" stroke="#e8d3a8" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="58" cy="-33" r="2" fill="#111"/>
        ${nez ? '<circle cx="74" cy="-26" r="6.5" fill="#ff3b3b"/><circle cx="74" cy="-26" r="14" fill="#ff3b3b" opacity=".3" class="tw"/>' : '<circle cx="74" cy="-26" r="4" fill="#3a2414"/>'}<rect x="22" y="-20" width="8" height="12" fill="#e63946" opacity=".9"/></g>`);
    const traineau = (x, y, s) => T(x, y, s, `<path d="M-60 18 Q-70 44 -40 44 L70 44 Q90 44 84 22" stroke="#ffd166" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-50 20 Q-54 -6 -20 -8 L60 -8 Q86 -8 84 18Z" fill="#d62839"/><path d="M-50 20 H84" stroke="#ffd166" stroke-width="5"/>
        <path d="M-20 -8 Q-10 -46 22 -42 Q40 -40 44 -8Z" fill="#8b5a2b"/><path d="M-4 -40 L-2 -50 L12 -42Z" fill="#8b5a2b"/><g transform="translate(34 -12)"><rect x="-14" y="-18" width="28" height="22" fill="#2fb86a"/><rect x="-3" y="-18" width="6" height="22" fill="#ffd166"/></g><g transform="translate(-8 -10)"><rect x="-13" y="-16" width="26" height="20" fill="#5ec7ff"/><rect x="-3" y="-16" width="6" height="20" fill="#fff"/></g>
        <path d="M-60 18 L-190 -4" stroke="#ffd166" stroke-width="2" opacity=".8"/>`);
    function noel(W, H, u, por) {
        const rnd = mk(23), base = H * (por ? 0.84 : 0.9);
        let o = `<defs><linearGradient id="nSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eef7"/><stop offset="1" stop-color="#7f9fbc"/></linearGradient></defs>`;
        o += etoiles(W, H, rnd, por ? 30 : 50, '#fff', 0.5);
        o += `<circle cx="${f(W * (por ? 0.2 : 0.14))}" cy="${f(H * 0.14)}" r="${f(46 * u)}" fill="#fff6dc" opacity="${por ? 0.5 : 0.92}"/><circle cx="${f(W * (por ? 0.2 : 0.14) + 14 * u)}" cy="${f(H * 0.14 - 6 * u)}" r="${f(40 * u)}" fill="#0f3a28" opacity=".35"/>`;
        o += `<g class="fly" style="--fw:${f(W + 700)}px;--fy:${f(H * 0.2)}px">${traineau(0, 0, 0.8 * u)}${[0, 1, 2, 3].map(i => renne(-190 * u * 0.8 - 56 * i * u * 0.9, 6 + (i % 2) * 4, 0.5 * u, i === 3)).join('')}</g>`;
        o += hill(W, H, base - 70 * u, 30 * u, 2, '#8fb0cc') + hill(W, H, base - 25 * u, 22 * u, 5, 'url(#nSnow)');
        const fond = por ? [[0.08, 1.2], [0.92, 1.1]] : [[0.01, 1.5], [0.2, 0.9], [0.62, 1.0], [0.52, 0.8], [0.82, 1.0], [0.99, 1.3]];
        fond.forEach(([a, s]) => { o += sapin(W * a, base - 30 * u, s * u * 0.85, rnd, false); });
        const gx0 = W * (por ? 0.3 : 0.075);
        o += sapin(gx0, base - 10 * u, 1.55 * u, rnd, true);
        const g = [[-60, 22, 44, '#e63946', '#ffd166'], [-18, 34, 54, '#2f8cff', '#fff'], [-96, 18, 36, '#2fb86a', '#ffd166'], [30, 18, 36, '#ffd166', '#e63946'], [-130, 24, 40, '#a259ff', '#fff']];
        g.forEach(([dx, w, h, c, r]) => { o += cadeau(gx0 + (dx + 110) * u * 1.15, base + 4 * u, w * 1.3 * u, h * 1.3 * u, c, r); });
        o += lutin(W * (por ? 0.5 : 0.155), base + 6 * u, 1.15 * u, false);
        if (!por) { o += lutin(W * 0.865, base + 8 * u, 1.0 * u, true); o += cadeau(W * 0.82, base + 6 * u, 40 * u, 40 * u, '#e63946', '#ffd166') + cadeau(W * 0.84, base + 6 * u, 30 * u, 28 * u, '#2fb86a', '#fff'); }
        o += bonhomme(W * (por ? 0.75 : 0.935), base + 6 * u, 1.25 * u);
        if (!por) { o += `<g transform="translate(${f(W * 0.44)} ${f(base - 14 * u)}) scale(${f(0.9 * u)})"><rect x="-70" y="-70" width="140" height="70" fill="#5b3a21"/><polygon points="-86,-68 0,-130 86,-68" fill="#f4faff"/><rect x="-52" y="-52" width="28" height="26" fill="#ffd166" class="flick"/><rect x="24" y="-52" width="28" height="26" fill="#ffd166" class="flick" style="animation-delay:.9s"/><rect x="-10" y="-40" width="22" height="40" fill="#3a2414"/><rect x="40" y="-128" width="18" height="40" fill="#5b3a21"/><circle cx="48" cy="-146" r="12" fill="#fff" opacity=".4" class="bob"/></g>`; }
        [[0.35, 70, '#e63946'], [0.5, 110, '#ffd166'], [0.66, 60, '#2f8cff'], [0.8, 90, '#2fb86a'], [0.94, 120, '#e63946'], [0.2, 90, '#ffd166']].forEach(([a, l, c], i) => { if (por && i > 3) return;
            o += `<g transform="translate(${f(W * a)} 0)"><line x1="0" y1="0" x2="0" y2="${l}" stroke="#ffd166" stroke-width="1.4" opacity=".7"/><g transform="translate(0 ${l})" class="pend" style="animation-delay:${f(i * 0.4)}s"><rect x="-4" y="0" width="8" height="6" fill="#ffd166"/><circle cy="20" r="15" fill="${c}"/><ellipse cx="-5" cy="14" rx="4" ry="6" fill="#fff" opacity=".45"/></g></g>`; });
        return o;
    }

    /* ---------- Nouvel An ---------- */
    const feu = (x, y, r, c, d) => `<g transform="translate(${f(x)} ${f(y)})"><g class="burst" style="animation-delay:${d}s"><g stroke="${c}" stroke-width="3" stroke-linecap="round">${Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<line x1="${f(Math.cos(a) * r * 0.45)}" y1="${f(Math.sin(a) * r * 0.45)}" x2="${f(Math.cos(a) * r)}" y2="${f(Math.sin(a) * r)}"/>`; }).join('')}</g><g fill="#fff">${Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<circle cx="${f(Math.cos(a) * r * 1.12)}" cy="${f(Math.sin(a) * r * 1.12)}" r="3"/>`; }).join('')}</g></g></g>`;
    const flute = (x, y, s, rot) => T(x, y, s, `<g transform="rotate(${rot})"><path d="M-22 -150 L22 -150 L16 -40 Q0 -22 -16 -40Z" fill="#fff" opacity=".18"/><path d="M-20 -110 L20 -110 L16 -40 Q0 -22 -16 -40Z" fill="#ffd166" opacity=".8"/><rect x="-2.5" y="-30" width="5" height="62" fill="#e8d9a8" opacity=".7"/><ellipse cx="0" cy="34" rx="22" ry="5" fill="#e8d9a8" opacity=".7"/><g fill="#fff" opacity=".7"><circle cx="-6" cy="-60" r="2.4" class="bul"/><circle cx="5" cy="-80" r="2" class="bul" style="animation-delay:1s"/><circle cx="0" cy="-95" r="2.6" class="bul" style="animation-delay:2s"/></g></g>`);
    function nouvelan(W, H, u, por, an) {
        const rnd = mk(31), base = H * (por ? 0.84 : 0.9);
        let o = etoiles(W, H, rnd, por ? 40 : 70, '#fff', 0.6);
        o += `<text x="${f(W / 2)}" y="${f(H * (por ? 0.34 : 0.46))}" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="${f((por ? 190 : 330) * u)}" fill="#ffd166" opacity=".07" letter-spacing="10">${an}</text>`;
        const cols = ['#ffd166', '#ff6bcb', '#5ec7ff', '#ff8a5c', '#8cf07a', '#c9a8ff'];
        const pos = por ? [[0.25, 0.18, 120], [0.75, 0.3, 140], [0.4, 0.46, 100]] : [[0.12, 0.2, 150], [0.3, 0.38, 120], [0.78, 0.18, 170], [0.92, 0.42, 120], [0.58, 0.14, 110], [0.5, 0.42, 90]];
        pos.forEach(([a, b, r], i) => { o += feu(W * a, H * b, r * u, cols[i % cols.length], f(i * 0.9)); });
        let x = 0, i = 0; const bw = []; while (x < W + 60) { const w = 46 + rnd() * 70, h = (por ? 120 : 130) + rnd() * (por ? 220 : 300); bw.push([x, w, h]); x += w - 4; }
        bw.forEach(([bx, w, h], k) => { o += `<rect x="${f(bx)}" y="${f(base + 20 * u - h)}" width="${f(w)}" height="${f(h + 600)}" fill="${k % 2 ? '#0b0b24' : '#0e0e2e'}"/>`;
            for (let wy = base + 36 * u - h; wy < base + 10 * u; wy += 26) for (let wx = bx + 8; wx < bx + w - 12; wx += 18) if (rnd() < 0.3) o += `<rect x="${f(wx)}" y="${f(wy)}" width="8" height="12" fill="#ffd166" opacity="${f(0.5 + rnd() * 0.5)}"/>`; });
        o += flute(W * (por ? 0.72 : 0.86), base + 40 * u, 1.35 * u, 12) + flute(W * (por ? 0.84 : 0.91), base + 40 * u, 1.35 * u, -12);
        return o;
    }

    /* ---------- Saint-Valentin ---------- */
    const coeur = (x, y, s, fill, op, anim) => T(x, y, s, `<g${anim ? ' class="bob" style="animation-duration:' + f(4 + (x % 5)) + 's"' : ''}><path d="M0 34 C-46 4 -34 -34 0 -14 C34 -34 46 4 0 34Z" fill="${fill}" opacity="${op}"/><ellipse cx="-14" cy="-10" rx="6" ry="4" fill="#fff" opacity="${f(op * 0.4)}" transform="rotate(-30 -14 -10)"/></g>`);
    const rose = (x, y, s, c) => T(x, y, s, `<path d="M0 0 Q-6 70 2 150" stroke="#2c8a4f" stroke-width="6" fill="none"/><path d="M0 70 Q-34 50 -40 64 Q-20 84 0 74Z M2 100 Q36 80 42 94 Q22 112 2 104Z" fill="#2c8a4f"/>
        <circle r="30" fill="${c}"/><path d="M-20 -6 Q0 -30 20 -6 M-14 4 Q0 -14 14 4 M-8 10 Q0 -2 8 10 M-22 10 Q0 30 22 10" stroke="#00000044" stroke-width="2.4" fill="none"/><path d="M-30 4 Q-34 30 0 34 Q34 30 30 4 Q20 22 0 22 Q-20 22 -30 4Z" fill="#00000033"/>`);
    const lettre = (x, y, s, rot) => T(x, y, s, `<g transform="rotate(${rot})"><g class="bob"><rect x="-34" y="-24" width="68" height="48" rx="4" fill="#ffe3ec"/><path d="M-34 -22 L0 6 L34 -22" stroke="#e8708f" stroke-width="3" fill="none"/>${coeur(0, 6, 0.28, '#e11d48', 1)}</g></g>`);
    const fleche = (x, y, s, rot) => T(x, y, s, `<g transform="rotate(${rot})"><line x1="-90" y1="0" x2="60" y2="0" stroke="#e8c99b" stroke-width="5" stroke-linecap="round"/><path d="M60 -12 L96 0 L60 12 Q66 0 60 -12Z" fill="#ff3d6e"/><path d="M-90 0 L-108 -14 M-90 0 L-108 14 M-76 0 L-94 -14 M-76 0 L-94 14" stroke="#ff9ec0" stroke-width="4" stroke-linecap="round"/></g>`);
    function valentin(W, H, u, por) {
        const rnd = mk(47), base = H * (por ? 0.84 : 0.9);
        let o = '';
        const hx = W * (por ? 0.5 : 0.8), hy = H * (por ? 0.2 : 0.3), hs = (por ? 3.6 : 5.2) * u;
        o += `<g transform="translate(${f(hx)} ${f(hy)}) scale(${hs})"><path d="M0 34 C-46 4 -34 -34 0 -14 C34 -34 46 4 0 34Z" fill="none" stroke="#ff3d6e" stroke-width="7" opacity=".25"/><path d="M0 34 C-46 4 -34 -34 0 -14 C34 -34 46 4 0 34Z" fill="rgba(255,61,110,.08)" stroke="#ff9ec0" stroke-width="1.6" class="tw"/></g>`;
        for (let i = 0; i < (por ? 12 : 22); i++) o += coeur(rnd() * W, rnd() * H * 0.82, (0.4 + rnd() * 1.4) * u, ['#ff4d6d', '#ff7aa8', '#ffb3c8', '#e11d48'][i % 4], f(0.16 + rnd() * 0.4), true);
        o += fleche(W * (por ? 0.3 : 0.2), H * 0.24, 1.2 * u, -18) + (por ? '' : fleche(W * 0.62, H * 0.12, 0.9 * u, 160));
        o += lettre(W * (por ? 0.18 : 0.1), H * 0.5, 1.3 * u, -10) + lettre(W * (por ? 0.85 : 0.92), H * 0.55, 1.1 * u, 12) + (por ? '' : lettre(W * 0.45, H * 0.3, 0.9 * u, 6));
        o += hill(W, H, base + 10 * u, 20 * u, 4, '#2a0b18');
        [[0.04, '#e11d48', 1.5], [0.1, '#ff4d6d', 1.2], [0.16, '#ff7aa8', 1.0], [0.96, '#e11d48', 1.5], [0.9, '#ff4d6d', 1.2], [0.84, '#ffb3c8', 1.0]].forEach(([a, c, s], i) => { if (por && (i === 2 || i === 5)) return; o += rose(W * a, base - 150 * s * u + 20 * u, s * u, c); });
        o += coeur(W * 0.5, base - 10 * u, 2.4 * u, '#e11d48', 0.55, true);
        return o;
    }

    /* ---------- Pâques ---------- */
    const oeuf = (x, y, s, c1, c2, m) => T(x, y, s, `<g class="bob" style="animation-duration:${f(5 + (x % 4))}s"><clipPath id="ce${Math.round(x)}${Math.round(y)}"><ellipse cx="0" cy="0" rx="26" ry="34"/></clipPath><ellipse cx="0" cy="0" rx="26" ry="34" fill="${c1}"/><g clip-path="url(#ce${Math.round(x)}${Math.round(y)})" fill="${c2}">${m === 0 ? '<rect x="-30" y="-6" width="60" height="9"/><rect x="-30" y="12" width="60" height="5"/>' : m === 1 ? '<path d="M-30 -8 L-20 -18 L-10 -8 L0 -18 L10 -8 L20 -18 L30 -8 L30 4 L-30 4Z"/>' : '<circle cx="-10" cy="-14" r="5"/><circle cx="10" cy="-2" r="5"/><circle cx="-8" cy="14" r="5"/><circle cx="12" cy="20" r="3"/>'}</g><ellipse cx="-10" cy="-16" rx="5" ry="9" fill="#fff" opacity=".3" transform="rotate(20 -10 -16)"/></g>`);
    const lapin = (x, y, s, flip) => T(x, y, s, `<g transform="scale(${flip ? -1 : 1} 1)"><ellipse cx="0" cy="-30" rx="32" ry="30" fill="#fbf4ea"/><circle cx="-34" cy="-14" r="12" fill="#fff"/><ellipse cx="22" cy="-62" rx="22" ry="20" fill="#fbf4ea"/><g class="sway"><path d="M14 -76 Q6 -130 20 -128 Q28 -112 26 -78Z" fill="#fbf4ea"/><path d="M24 -78 Q26 -130 40 -124 Q42 -106 34 -76Z" fill="#fbf4ea"/><path d="M16 -80 Q12 -118 20 -120 Q22 -104 22 -80Z M28 -80 Q30 -116 36 -116 Q36 -102 32 -78Z" fill="#f7a8c4"/></g>
        <circle cx="30" cy="-66" r="2.8" fill="#222"/><ellipse cx="40" cy="-58" rx="3.4" ry="2.4" fill="#f7a8c4"/><ellipse cx="14" cy="-2" rx="16" ry="7" fill="#fff"/><ellipse cx="-12" cy="-2" rx="14" ry="7" fill="#fff"/></g>`);
    const tulipe = (x, y, s, c) => T(x, y, s, `<path d="M0 0 Q-3 -40 0 -70" stroke="#2c8a4f" stroke-width="4" fill="none"/><path d="M0 -10 Q-26 -30 -30 -50 Q-10 -30 0 -22Z M0 -10 Q26 -30 30 -50 Q10 -30 0 -22Z" fill="#2c8a4f"/><path d="M-14 -68 Q-18 -94 -6 -100 L0 -86 L6 -100 Q18 -94 14 -68 Q0 -58 -14 -68Z" fill="${c}"/>`);
    function paques(W, H, u, por) {
        const rnd = mk(59), base = H * (por ? 0.84 : 0.9);
        const sx = W * (por ? 0.78 : 0.86), sy = H * (por ? 0.14 : 0.18);
        let o = `<g transform="translate(${f(sx)} ${f(sy)})"><circle r="${f(130 * u)}" fill="#ffe27a" opacity=".16"/><g class="spin">${Array.from({ length: 14 }, (_, i) => `<path d="M-6 ${-70 * u} L0 ${-118 * u} L6 ${-70 * u}Z" fill="#ffe27a" opacity=".7" transform="rotate(${i * 360 / 14})"/>`).join('')}</g><circle r="${f(58 * u)}" fill="#ffe27a"/></g>`;
        [[0.2, 0.12, 1.2], [0.5, 0.2, 0.9], [0.1, 0.34, 0.8]].forEach(([a, b, s]) => { o += `<g opacity=".13" fill="#fff"><ellipse cx="${f(W * a)}" cy="${f(H * b)}" rx="${f(120 * s * u)}" ry="${f(26 * s * u)}"/><ellipse cx="${f(W * a + 50 * s * u)}" cy="${f(H * b - 18 * s * u)}" rx="${f(70 * s * u)}" ry="${f(26 * s * u)}"/></g>`; });
        o += hill(W, H, base - 90 * u, 34 * u, 2, '#3c8f55') + hill(W, H, base - 40 * u, 28 * u, 6, '#2f7a46') + hill(W, H, base + 4 * u, 20 * u, 9, '#256a3b');
        const cols = ['#f78fc3', '#ffd966', '#8be9b1', '#a99bff', '#ff9a8b'];
        const ne = por ? 7 : 16; for (let i = 0; i < ne; i++) o += oeuf(W * (0.04 + 0.92 * i / (ne - 1)) + (rnd() - 0.5) * 40, base - 10 * u + rnd() * 50 * u, (0.8 + rnd() * 0.7) * u, cols[i % 5], cols[(i + 2) % 5], i % 3);
        o += lapin(W * (por ? 0.3 : 0.18), base - 6 * u, 1.3 * u, false) + lapin(W * (por ? 0.72 : 0.7), base + 8 * u, 1.0 * u, true) + (por ? '' : lapin(W * 0.4, base + 16 * u, 0.7 * u, false));
        const nt = por ? 9 : 20; for (let i = 0; i < nt; i++) o += tulipe(W * (i / (nt - 1)) + (rnd() - 0.5) * 30, base + 30 * u + rnd() * 30 * u, (0.6 + rnd() * 0.6) * u, ['#ff6b9a', '#ffd966', '#ffffff', '#c9a8ff', '#ff8a5c'][i % 5]);
        for (let i = 0; i < 3; i++) o += `<g transform="translate(${f(W * (0.25 + i * 0.25))} ${f(H * (0.3 + i * 0.07))})"><g class="flutter" style="animation-delay:${i * 0.7}s"><ellipse cx="-10" cy="0" rx="11" ry="16" fill="${['#f78fc3', '#ffd966', '#8be9b1'][i]}" opacity=".85" transform="rotate(-20 -10 0)"/><ellipse cx="10" cy="0" rx="11" ry="16" fill="${['#f78fc3', '#ffd966', '#8be9b1'][i]}" opacity=".85" transform="rotate(20 10 0)"/><rect x="-1.5" y="-10" width="3" height="20" fill="#3a2414"/></g></g>`;
        return o;
    }

    /* ---------- Anniversaire / événement ---------- */
    const ballon = (x, y, s, c) => T(x, y, s, `<g class="bob" style="animation-duration:${f(5 + (x % 4))}s"><path d="M0 52 Q-6 90 4 140 Q-4 190 2 230" stroke="#ffffff88" stroke-width="1.6" fill="none"/><ellipse cx="0" cy="0" rx="36" ry="46" fill="${c}"/><path d="M-5 46 L0 54 L5 46Z" fill="${c}"/><ellipse cx="-12" cy="-16" rx="7" ry="13" fill="#fff" opacity=".35" transform="rotate(20 -12 -16)"/></g>`);
    const gateau = (x, y, s) => T(x, y, s, `<rect x="-80" y="-40" width="160" height="40" rx="6" fill="#f7c6a3"/><rect x="-80" y="-40" width="160" height="12" fill="#fff"/><rect x="-60" y="-80" width="120" height="40" rx="6" fill="#ff9ec0"/><rect x="-60" y="-80" width="120" height="11" fill="#fff"/><rect x="-40" y="-116" width="80" height="36" rx="6" fill="#ffd166"/><rect x="-40" y="-116" width="80" height="10" fill="#fff"/>
        ${[-24, 0, 24].map((dx, i) => `<rect x="${dx - 3}" y="-140" width="6" height="24" fill="#5ec7ff"/><path d="M${dx} -158 Q${dx - 7} -148 ${dx} -142 Q${dx + 7} -148 ${dx} -158Z" fill="#ffb347" class="flick" style="animation-delay:${i * 0.3}s"/>`).join('')}`);
    function fete(W, H, u, por, an, nom) {
        const rnd = mk(71), base = H * (por ? 0.84 : 0.9), n = nom === 'anniversaire' ? Math.max(1, an - 2026) : 0;
        let o = `<defs><linearGradient id="fBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd166" stop-opacity=".22"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></linearGradient></defs>`;
        o += etoiles(W, H, rnd, por ? 24 : 40, '#fff6d0', 0.6);
        [[0.15, 0.4], [0.5, 0], [0.85, -0.4]].forEach(([a, k]) => { o += `<polygon points="${f(W * a - 30)},${f(H)} ${f(W * a + 30)},${f(H)} ${f(W * a + 30 + k * W * 0.35 + 120)},0 ${f(W * a - 30 + k * W * 0.35 - 120)},0" fill="url(#fBeam)" class="tw" style="animation-delay:${f(rnd() * 3)}s"/>`; });
        if (n) o += `<text x="${f(W / 2)}" y="${f(H * (por ? 0.36 : 0.48))}" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="${f((por ? 300 : 440) * u)}" fill="#ffd166" opacity=".08">${n}</text>`;
        const fc = ['#ff4d6d', '#ffd166', '#5ec7ff', '#8cf07a', '#a259ff', '#ff8a5c'];
        let d = `M0 ${f(H * 0.05)}`; for (let x = 0; x <= W; x += 40) d += ` L${x} ${f(H * 0.05 + 40 * Math.sin(x / W * Math.PI))}`;
        o += `<path d="${d}" stroke="#ffffff66" stroke-width="2" fill="none"/>`;
        for (let x = 30, i = 0; x < W; x += 56, i++) { const y = H * 0.05 + 40 * Math.sin(x / W * Math.PI); o += `<polygon points="${f(x - 20)},${f(y)} ${f(x + 20)},${f(y)} ${f(x)},${f(y + 46)}" fill="${fc[i % 6]}"/>`; }
        const nb = por ? 5 : 11; for (let i = 0; i < nb; i++) { const left = i % 2 === 0, x = por ? W * (0.1 + 0.8 * i / (nb - 1)) : (left ? W * (0.03 + 0.14 * (i / 2) / (nb / 2)) : W * (0.97 - 0.14 * ((i - 1) / 2) / (nb / 2))); o += ballon(x, H * (0.3 + rnd() * 0.3), (0.8 + rnd() * 0.6) * u, fc[i % 6]); }
        o += hill(W, H, base + 6 * u, 14 * u, 2, '#1a1004');
        o += cadeau(W * (por ? 0.1 : 0.05), base + 14 * u, 80 * u, 68 * u, '#e63946', '#ffd166') + cadeau(W * (por ? 0.24 : 0.115), base + 14 * u, 58 * u, 50 * u, '#2f8cff', '#fff') + cadeau(W * (por ? 0.86 : 0.86), base + 14 * u, 64 * u, 54 * u, '#2fb86a', '#ffd166') + cadeau(W * (por ? 0.74 : 0.8), base + 14 * u, 44 * u, 38 * u, '#a259ff', '#fff');
        if (nom === 'anniversaire') o += gateau(W * (por ? 0.5 : 0.905), base + 16 * u, (por ? 1.2 : 1.1) * u);
        else o += T(W * (por ? 0.5 : 0.905), base + 14 * u, 1.2 * u, `<path d="M-50 0 L50 0 L40 -20 L-40 -20Z" fill="#8b5a1a"/><path d="M-26 -20 H26 L20 -70 Q40 -80 46 -110 H-46 Q-40 -80 -20 -70Z" fill="#ffd166"/><path d="M-46 -90 Q-70 -90 -70 -60 Q-70 -40 -34 -40 M46 -90 Q70 -90 70 -60 Q70 -40 34 -40" stroke="#ffd166" stroke-width="7" fill="none"/><g fill="#fff6d0" class="tw">${T(0, -62, 1, star5(14))}</g>`);
        return o;
    }

    /* ---------- Nouveaux objectifs ---------- */
    const halt = (x, y, s, rot) => T(x, y, s, `<g transform="rotate(${rot})"><rect x="-70" y="-5" width="140" height="10" fill="#cfe0e6"/><rect x="-86" y="-30" width="22" height="60" rx="4" fill="#4f7b84"/><rect x="-104" y="-22" width="18" height="44" rx="4" fill="#4f7b84"/><rect x="64" y="-30" width="22" height="60" rx="4" fill="#4f7b84"/><rect x="86" y="-22" width="18" height="44" rx="4" fill="#4f7b84"/><rect x="-86" y="-30" width="22" height="8" fill="#35e0c0" opacity=".6"/><rect x="64" y="-30" width="22" height="8" fill="#35e0c0" opacity=".6"/></g>`);
    const medaille = (x, y, s) => T(x, y, s, `<path d="M-22 -110 L0 -58 L22 -110Z" fill="#e63946"/><path d="M-4 -110 L14 -66 L34 -110Z" fill="#2f8cff"/><circle cy="-34" r="38" fill="#ffd166"/><circle cy="-34" r="28" fill="none" stroke="#e8a92a" stroke-width="4"/><g fill="#e8a92a">${T(0, -34, 1, star5(18))}</g><ellipse cx="-14" cy="-48" rx="6" ry="10" fill="#fff" opacity=".4" transform="rotate(25 -14 -48)"/>`);
    function resolutions(W, H, u, por) {
        const rnd = mk(83), base = H * (por ? 0.84 : 0.9), sx = W * (por ? 0.5 : 0.84), sy = base - 70 * u;
        let o = `<defs><radialGradient id="rSun"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#ffb347"/></radialGradient><radialGradient id="rGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>`;
        o += etoiles(W, H, rnd, por ? 24 : 36, '#d8fff7', 0.4);
        o += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(340 * u)}" fill="url(#rGlow)"/><g transform="translate(${f(sx)} ${f(sy)})"><g class="spin">${Array.from({ length: 18 }, (_, i) => `<path d="M-9 ${-120 * u} L0 ${-250 * u} L9 ${-120 * u}Z" fill="#ffd166" opacity=".16" transform="rotate(${i * 20})"/>`).join('')}</g><circle r="${f(110 * u)}" fill="url(#rSun)"/></g>`;
        const mont = (y0, h, seed, fill) => { let d = `M0 ${H} L0 ${f(y0)}`; const r = mk(seed); let x = 0; while (x < W) { x += 60 + r() * 90; d += ` L${f(x - 30)} ${f(y0 - h * (0.4 + r() * 0.6))} L${f(x)} ${f(y0)}`; } return `<path d="${d} L${W} ${H}Z" fill="${fill}"/>`; };
        o += mont(base - 20 * u, 300 * u, 5, '#0b3f3a') + mont(base + 10 * u, 200 * u, 9, '#08302e') + hill(W, H, base + 30 * u, 14 * u, 3, '#061f20');
        const px = W * (por ? 0.7 : 0.12), py = base - 250 * u;
        o += `<polygon points="${f(px - 190)},${f(base + 40 * u)} ${f(px)},${f(py + 14)} ${f(px + 190)},${f(base + 40 * u)}" fill="#0e4f48"/><polygon points="${f(px - 38)},${f(py + 70)} ${f(px)},${f(py + 14)} ${f(px + 38)},${f(py + 70)} ${f(px + 14)},${f(py + 62)} ${f(px)},${f(py + 76)} ${f(px - 14)},${f(py + 62)}" fill="#d8fff7" opacity=".85"/>`;
        o += `<path d="M${f(W * (por ? 0.2 : 0.5))} ${f(base + 40 * u)} Q${f(W * (por ? 0.45 : 0.3))} ${f(base - 30 * u)} ${f(W * (por ? 0.55 : 0.2))} ${f(base - 120 * u)} T${f(px)} ${f(py + 10)}" stroke="#ffd166" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" fill="none" opacity=".8"/>`;
        o += T(px, py, 1.1 * u, `<line y1="0" y2="-80" stroke="#ddd" stroke-width="4"/><path d="M2 -80 L56 -66 L2 -52Z" fill="#ffd166" class="sway"/>`);
        o += halt(W * (por ? 0.2 : 0.1), base + 26 * u, 1.1 * u, -6) + medaille(W * (por ? 0.36 : 0.2), base + 46 * u, 1.3 * u) + medaille(W * (por ? 0.88 : 0.93), base + 44 * u, 1.1 * u) + (por ? '' : halt(W * 0.84, base + 30 * u, 1.0 * u, 5));
        for (let i = 0; i < 5; i++) o += `<g transform="translate(${f(W * (0.15 + i * 0.17))} ${f(H * (0.3 + rnd() * 0.25))})"><path d="M0 12 L10 0 L20 12 M0 26 L10 14 L20 26" stroke="#35e0c0" stroke-width="3" fill="none" opacity=".5" class="rise" style="animation-delay:${f(i * 0.7)}s"/></g>`;
        return o;
    }

    const SCENES = { halloween, noel, nouvelan, valentin, paques, anniversaire: (...a) => fete(...a, 'anniversaire'), exceptionnel: (...a) => fete(...a, 'exceptionnel'), resolutions };

    const CSS = `#decor{position:fixed;inset:0;z-index:-2;pointer-events:none;overflow:hidden}#decor svg{position:absolute;inset:0;width:100%;height:100%}
#decor .bob{animation:dBob 6s ease-in-out infinite}#decor .tw{animation:dTw 3.4s ease-in-out infinite}#decor .flick{animation:dFlick 2.6s ease-in-out infinite}
#decor .sway{transform-box:fill-box;transform-origin:50% 0;animation:dSway 5s ease-in-out infinite}#decor .pend{transform-origin:0 0;animation:dPend 4.6s ease-in-out infinite}
#decor .spin{animation:dSpin 90s linear infinite}#decor .burst{transform-box:fill-box;transform-origin:50% 50%;animation:dBurst 5.4s ease-out infinite;opacity:0}
#decor .rise{animation:dRise 3.2s ease-in-out infinite}#decor .bul{animation:dBul 3s linear infinite}#decor .flutter{transform-box:fill-box;transform-origin:50% 50%;animation:dFlut 2.4s ease-in-out infinite}
#decor .gallop{animation:dGal .9s ease-in-out infinite}#decor .fly{animation:dFly 52s linear infinite 4s;transform:translate(-700px,0)}
@keyframes dBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}@keyframes dTw{0%,100%{opacity:.35}50%{opacity:1}}@keyframes dFlick{0%,100%{opacity:1}35%{opacity:.7}60%{opacity:.95}80%{opacity:.6}}
@keyframes dSway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}@keyframes dPend{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}@keyframes dSpin{to{transform:rotate(360deg)}}
@keyframes dBurst{0%{transform:scale(.1);opacity:0}8%{opacity:1}70%{opacity:.7}100%{transform:scale(1);opacity:0}}@keyframes dRise{0%{transform:translateY(16px);opacity:0}50%{opacity:.8}100%{transform:translateY(-22px);opacity:0}}
@keyframes dBul{0%{transform:translateY(20px);opacity:0}30%{opacity:.9}100%{transform:translateY(-60px);opacity:0}}@keyframes dFlut{0%,100%{transform:scaleX(1) translateY(0)}50%{transform:scaleX(.45) translateY(-10px)}}
@keyframes dGal{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}
@keyframes dFly{0%{transform:translate(-700px,var(--fy,0))}72%{transform:translate(var(--fw),calc(var(--fy,0px) - 70px))}100%{transform:translate(var(--fw),calc(var(--fy,0px) - 70px))}}
#decor.fige *{animation:none!important}#decor.fige .burst{opacity:.55}#decor.fige .fly{display:none}
@media (prefers-reduced-motion:reduce){#decor *{animation:none!important}#decor .burst{opacity:.55}#decor .fly{display:none}}`;

    let courant = null;
    function dessiner(nom, an) {
        const por = innerWidth / innerHeight < 0.95, W = por ? 600 : 1600, H = por ? 1200 : 1000, u = por ? 0.8 : 1;
        const fn = SCENES[nom]; if (!fn) return;
        const box = document.getElementById('decor'); if (!box) return;
        box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${fn(W, H, u, por, an)}</svg>`;
        courant = por;
    }
    // thèmes qui ont de vraies illustrations (themes/<nom>-wide.webp et -tall.webp) ; sinon on garde les dessins en code
    const IMAGES = { halloween: 1, noel: 1, nouvelan: 1, valentin: 1, paques: 2, anniversaire: 2 };   // 2 = voile renforcé (image claire au centre)
    const CSS_IMG = `#decor .bg{position:absolute;inset:0;background-size:cover;background-position:center bottom;background-repeat:no-repeat}#decor .bg.tall{display:none}
@media (max-aspect-ratio:19/20){#decor .bg.wide{display:none}#decor .bg.tall{display:block}}
#decor .voile{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0,rgba(0,0,0,0) 26%),radial-gradient(ellipse 62% 58% at 50% 46%,rgba(0,0,0,.4),rgba(0,0,0,0) 100%)}
#decor .voile.fort{background:linear-gradient(180deg,rgba(0,0,0,.62) 0,rgba(0,0,0,.34) 42%,rgba(0,0,0,.22) 100%),radial-gradient(ellipse 72% 66% at 50% 48%,rgba(0,0,0,.6),rgba(0,0,0,0) 100%)}`;
    window.AVDecor = {
        aImage: (nom) => !!IMAGES[nom],
        monter(nom, an, anime) {
            if (!SCENES[nom] && !IMAGES[nom]) return false;
            const st = document.createElement('style'); st.textContent = CSS + CSS_IMG; document.head.appendChild(st);
            const box = document.createElement('div'); box.id = 'decor'; box.setAttribute('aria-hidden', 'true'); document.body.insertBefore(box, document.body.firstChild);
            if (anime === false) box.classList.add('fige');
            const svg = () => { try { dessiner(nom, an); } catch (e) { box.remove(); return; } let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const por = innerWidth / innerHeight < 0.95; if (por !== courant) { try { dessiner(nom, an); } catch (e) { /* ignore */ } } }, 200); }); };
            if (!IMAGES[nom]) { svg(); return true; }
            const por = innerWidth / innerHeight < 0.95, src = `themes/${nom}-${por ? 'tall' : 'wide'}.webp`, sonde = new Image();
            sonde.onload = () => {
                box.innerHTML = `<div class="bg wide" style="background-image:url('themes/${nom}-wide.webp')"></div><div class="bg tall" style="background-image:url('themes/${nom}-tall.webp')"></div><div class="voile${IMAGES[nom] > 1 ? ' fort' : ''}"></div>`;
                box.classList.add('img');
            };
            sonde.onerror = svg;
            sonde.src = src;
            return true;
        }
    };
})();
