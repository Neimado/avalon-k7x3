/* Avalon - thèmes de saison : calendrier automatique, palettes, ambiance animée.
   Chargé dans le <head> pour que les couleurs soient en place avant le premier affichage.
   Pour ajouter un événement ponctuel : voir EXCEPTIONNELS plus bas. */
(function () {
    'use strict';
    const root = document.documentElement;
    const lire = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const ecrire = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };

    // ---------- Événements ponctuels, à remplir à la main ----------
    // Exemple : { debut: '2027-03-01', fin: '2027-03-07', msg: 'Semaine spéciale Avalon !' }
    const EXCEPTIONNELS = [];

    // ---------- Palettes ----------
    // bg = fond, top = lueur du haut, panel = cartes, nav = barre, gold = couleur principale (rgb = même couleur en r,g,b),
    // accent = texte secondaire, accent2 = deuxième couleur, orn = liseré sous la barre du haut, fx = animation
    const T = {
        halloween: { nom: 'Halloween', ico: 'fa-ghost', fx: 'halloween', decor: 'halloween', bg: '#0d0603', top: '#4d2008', glow: 'rgba(255,110,10,0.34)', panel: 'rgba(32,15,6,0.72)', nav: 'rgba(18,8,3,0.86)', solid: 'rgba(30,14,6,0.8)',
            card: ['#4a2209', '#170a04'], gold: '#ff7a1a', rgb: '255,122,26', border: 'rgba(255,122,26,0.22)', accent: '#ffb877', accent2: '#a259ff', up: '#9be15d', h1: '#ffe2c4',
            orn: 'linear-gradient(90deg, transparent, #ff7a1a 20%, #a259ff 50%, #ff7a1a 80%, transparent)',
            msg: () => 'Les ombres rôdent sur Avalon… Bon Halloween, chevaliers !' },
        noel: { nom: 'Noël', ico: 'fa-tree', fx: 'neige', decor: 'noel', bg: '#06130d', top: '#1f5a3c', glow: 'rgba(222,40,60,0.3)', panel: 'rgba(10,32,22,0.72)', nav: 'rgba(5,20,13,0.86)', solid: 'rgba(10,32,22,0.8)',
            card: ['#1f5a3c', '#08170f'], gold: '#f6d365', rgb: '246,211,101', border: 'rgba(246,211,101,0.2)', accent: '#bfe9cf', accent2: '#ef4757', up: '#6ee7a0', h1: '#fff5dc',
            orn: 'guirlande', msg: () => 'Joyeux Noël, chevaliers d\'Avalon !' },
        nouvelan: { nom: 'Nouvel An', ico: 'fa-champagne-glasses', fx: 'fete', decor: 'nouvelan', bg: '#04050f', top: '#1d1c52', glow: 'rgba(255,196,70,0.26)', panel: 'rgba(14,14,40,0.72)', nav: 'rgba(6,6,22,0.86)', solid: 'rgba(14,14,40,0.8)',
            card: ['#26256a', '#0a0a1f'], gold: '#ffd166', rgb: '255,209,102', border: 'rgba(255,209,102,0.2)', accent: '#c9c7ff', accent2: '#ff6bcb', up: '#5eead4', h1: '#fff3c9',
            orn: 'linear-gradient(90deg, transparent, #ffd166 20%, #ff6bcb 50%, #ffd166 80%, transparent)',
            msg: (y) => `Bonne année ${y}, Avalon ! Que cette année vous rende encore plus forts.` },
        valentin: { nom: 'Saint-Valentin', ico: 'fa-heart', fx: 'coeurs', decor: 'valentin', bg: '#15060d', top: '#601838', glow: 'rgba(255,64,120,0.34)', panel: 'rgba(40,12,26,0.72)', nav: 'rgba(24,6,15,0.86)', solid: 'rgba(40,12,26,0.8)',
            card: ['#601838', '#1a0811'], gold: '#ff6b9a', rgb: '255,107,154', border: 'rgba(255,107,154,0.22)', accent: '#ffc2d6', accent2: '#ffb347', up: '#ffa6c1', h1: '#ffe3ec',
            orn: 'linear-gradient(90deg, transparent, #ff3d6e 25%, #ffc2d6 50%, #ff3d6e 75%, transparent)',
            msg: () => 'Joyeuse Saint-Valentin, chevaliers !' },
        paques: { nom: 'Pâques', ico: 'fa-egg', fx: 'paques', decor: 'paques', bg: '#0a1610', top: '#2f6a43', glow: 'rgba(255,214,90,0.26)', panel: 'rgba(14,36,24,0.72)', nav: 'rgba(8,22,14,0.86)', solid: 'rgba(14,36,24,0.8)',
            card: ['#2f6a43', '#0c1c13'], gold: '#ffd966', rgb: '255,217,102', border: 'rgba(255,217,102,0.2)', accent: '#c9f2d6', accent2: '#f78fc3', up: '#7ee787', h1: '#fffbe0',
            orn: 'linear-gradient(90deg, #f78fc3, #ffd966, #8be9b1, #a99bff, #f78fc3, #ffd966, #8be9b1)',
            msg: () => 'Joyeuses Pâques, chevaliers !' },
        anniversaire: { nom: 'Anniversaire d\'Avalon', ico: 'fa-cake-candles', fx: 'fete', decor: 'anniversaire', bg: '#050a1c', top: '#16296b', glow: 'rgba(255,200,70,0.3)', panel: 'rgba(10,18,48,0.72)', nav: 'rgba(5,10,30,0.86)', solid: 'rgba(10,18,48,0.8)',
            card: ['#16296b', '#070d26'], gold: '#ffcc33', rgb: '255,204,51', border: 'rgba(255,204,51,0.24)', accent: '#ffe7a6', accent2: '#e0405a', up: '#7ee787', h1: '#fff2c4',
            orn: 'linear-gradient(90deg, transparent, #ffcc33 20%, #e0405a 50%, #ffcc33 80%, transparent)',
            msg: (y) => { const n = Math.max(1, y - 2026); return `Avalon fête ses ${n} an${n > 1 ? 's' : ''} ! Merci à tous les chevaliers.`; } },
        resolutions: { nom: 'Nouveaux objectifs', ico: 'fa-bullseye', fx: 'elan', decor: 'resolutions', bg: '#04110f', top: '#0f4f48', glow: 'rgba(255,160,50,0.34)', panel: 'rgba(8,34,30,0.72)', nav: 'rgba(4,20,18,0.86)', solid: 'rgba(8,34,30,0.8)',
            card: ['#0f4f48', '#06191a'], gold: '#35e0c0', rgb: '53,224,192', border: 'rgba(53,224,192,0.2)', accent: '#a9f0e0', accent2: '#ffb347', up: '#ffd166', h1: '#e0fff8',
            orn: 'linear-gradient(90deg, transparent, #35e0c0 25%, #ffb347 50%, #35e0c0 75%, transparent)',
            msg: () => 'Nouvelle année, nouveaux objectifs : on repart à l\'assaut, chevaliers !' },
        exceptionnel: { nom: 'Événement Avalon', ico: 'fa-star', fx: 'fete', decor: 'exceptionnel', bg: '#0a0710', top: '#3a2270', glow: 'rgba(255,200,90,0.26)', panel: 'rgba(24,16,44,0.72)', nav: 'rgba(12,8,26,0.86)', solid: 'rgba(24,16,44,0.8)',
            card: ['#3a2270', '#110b1f'], gold: '#c9a8ff', rgb: '201,168,255', border: 'rgba(201,168,255,0.2)', accent: '#e0d2fa', accent2: '#ffd166', up: '#7ee787', h1: '#f3eaff',
            orn: 'linear-gradient(90deg, transparent, #c9a8ff 25%, #ffd166 50%, #c9a8ff 75%, transparent)',
            msg: () => 'Un événement spécial a lieu sur Avalon !' },
        // saisons : teinte discrète, sans décor, sans animation ni message
        hiver: { nom: 'Hiver', saison: true, bg: '#08090d', top: '#18222f', gold: '#a8d0ee', rgb: '168,208,238', panel: 'rgba(16,20,28,0.6)', nav: 'rgba(8,11,16,0.8)', solid: 'rgba(18,22,30,0.95)', card: ['#212c3a', '#0e1219'], border: 'rgba(168,208,238,0.1)', accent: '#a9bccf', accent2: '#a78bfa', up: '#10b981', h1: '#ffffff' },
        printemps: { nom: 'Printemps', saison: true, bg: '#08100a', top: '#193020', gold: '#9fdc8a', rgb: '159,220,138', panel: 'rgba(14,24,17,0.6)', nav: 'rgba(8,14,10,0.8)', solid: 'rgba(16,26,19,0.95)', card: ['#223a29', '#0d170f'], border: 'rgba(159,220,138,0.1)', accent: '#aecbb4', accent2: '#f9a8d4', up: '#10b981', h1: '#ffffff' },
        ete: { nom: 'Été', saison: true, bg: '#0c0a06', top: '#33260f', gold: '#ffb85c', rgb: '255,184,92', panel: 'rgba(26,20,10,0.6)', nav: 'rgba(14,10,5,0.8)', solid: 'rgba(28,22,12,0.95)', card: ['#3b2d14', '#150f07'], border: 'rgba(255,184,92,0.1)', accent: '#d6c3a3', accent2: '#38bdf8', up: '#10b981', h1: '#ffffff' },
        automne: { nom: 'Automne', saison: true, bg: '#0c0805', top: '#32190f', gold: '#e0894a', rgb: '224,137,74', panel: 'rgba(28,17,11,0.6)', nav: 'rgba(15,9,5,0.8)', solid: 'rgba(30,19,13,0.95)', card: ['#3b2216', '#150c07'], border: 'rgba(224,137,74,0.1)', accent: '#cdb19b', accent2: '#c2410c', up: '#10b981', h1: '#ffffff' }
    };
    const hexRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');

    // ---------- Calendrier ----------
    function paques(an) {   // algorithme de Meeus / Jones / Butcher
        const a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
            g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
            l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
            mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(an, mois - 1, jour);
    }
    const jourNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    function choisir(d) {
        const an = d.getFullYear(), md = (d.getMonth() + 1) * 100 + d.getDate(), s = iso(d);
        const ex = EXCEPTIONNELS.find(e => s >= e.debut && s <= e.fin);
        if (ex) return { id: 'exceptionnel', an, msg: ex.msg };
        if (md >= 624 && md <= 628 && an >= 2027) return { id: 'anniversaire', an };
        if (md >= 1231) return { id: 'nouvelan', an: an + 1 };
        if (md <= 102) return { id: 'nouvelan', an };
        if (md >= 1201 && md <= 1226) return { id: 'noel', an };
        if (md >= 1020 || md === 1101) { if (md <= 1031 || md === 1101) return { id: 'halloween', an }; }
        if (md >= 210 && md <= 214) return { id: 'valentin', an };
        const dp = jourNum(d) - jourNum(paques(an));
        if (dp >= -6 && dp <= 1) return { id: 'paques', an };
        if (md >= 103 && md <= 131) return { id: 'resolutions', an };
        if (md >= 1221 || md <= 319) return { id: 'hiver', an };
        if (md <= 620) return { id: 'printemps', an };
        if (md <= 921) return { id: 'ete', an };
        return { id: 'automne', an };
    }

    // ---------- Choix du thème (aperçu caché > réglage visiteur > date du jour) ----------
    const qs = new URLSearchParams(location.search);
    if (qs.has('apercu')) {                          // ?apercu=noel · ?apercu=2026-12-10 · ?apercu=liste · ?apercu=off
        const v = qs.get('apercu');
        if (v === 'off') { ecrire('av_apercu', null); ecrire('av_apercu_ui', null); }
        else { ecrire('av_apercu_ui', '1'); if (v !== 'liste') ecrire('av_apercu', v); }
        try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* ignore */ }
    }
    const modeApercu = lire('av_apercu_ui') === '1';
    const apercu = modeApercu ? lire('av_apercu') : null;
    let choix;
    if (apercu && T[apercu]) choix = { id: apercu, an: new Date().getFullYear() };
    else if (apercu && /^\d{4}-\d{2}-\d{2}$/.test(apercu)) choix = choisir(new Date(apercu + 'T12:00:00'));
    else choix = choisir(new Date());
    const th = T[choix.id];
    const evenement = !th.saison;                      // un vrai événement (pas une simple saison)
    const coupe = lire('av_theme_off') === '1' && !apercu;
    const actif = !coupe;
    const reduit = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const fxCoupe = lire('av_fx_off') === '1';

    window.AVTHEME = { id: actif ? choix.id : 'classique', nom: th.nom, evenement: evenement && actif,
        edition: evenement && actif ? `${th.nom} ${choix.an}` : '', gold: actif ? th.gold : '#e5c07b', rgb: actif ? th.rgb : '229,192,123',
        a: actif ? th.accent2 : '#a78bfa', rgbA: actif ? hexRgb(th.accent2) : '167,139,250', up: actif ? th.up : '#10b981', rgbUp: actif ? hexRgb(th.up) : '16,185,129', annee: choix.an };

    function appliquer() {
        const set = (k, v) => root.style.setProperty(k, v);
        root.setAttribute('data-theme', actif ? choix.id : 'classique');
        if (!actif) return;
        set('--bg-dark', th.bg); set('--bg-top', th.top); set('--panel-bg', th.panel); set('--nav-bg', th.nav);
        set('--nav-solid-a', th.nav.replace(/[\d.]+\)$/, '0.96)')); set('--nav-solid-b', th.nav.replace(/[\d.]+\)$/, '0.98)'));
        set('--panel-solid', th.solid); set('--card-a', th.card[0]); set('--card-b', th.card[1]);
        set('--bg-glow', th.glow || 'transparent'); set('--up-color', th.up); set('--up-rgb', hexRgb(th.up)); set('--accent2-rgb', hexRgb(th.accent2)); set('--h1', th.h1);
        set('--gold', th.gold); set('--gold-rgb', th.rgb); set('--border-color', th.border); set('--accent', th.accent); set('--accent2', th.accent2);
        if (th.orn && th.orn !== 'guirlande') set('--ornement', th.orn);
        const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute('content', th.bg);
    }
    appliquer();

    // ---------- Animations (canvas léger, sprites pré-dessinés) ----------
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (t) => t[Math.floor(Math.random() * t.length)];
    function sprite(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
    const lueur = (rgb, r) => sprite(r * 2, r * 2, (x) => { const g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.35, `rgba(${rgb},0.45)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2); });
    const brume = (rgb) => sprite(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });
    const flocon = () => sprite(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });
    const coeur = (col) => sprite(40, 40, (x) => { x.fillStyle = col; x.beginPath(); x.moveTo(20, 35); x.bezierCurveTo(-6, 18, 6, 0, 20, 11); x.bezierCurveTo(34, 0, 46, 18, 20, 35); x.fill(); });
    const etoile = (col) => sprite(40, 40, (x) => { const g = x.createRadialGradient(20, 20, 0, 20, 20, 20); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); x.globalAlpha = 0.35; x.fillStyle = g; x.fillRect(0, 0, 40, 40); x.globalAlpha = 1;
        x.fillStyle = col; x.beginPath(); x.moveTo(20, 1); x.quadraticCurveTo(20, 20, 39, 20); x.quadraticCurveTo(20, 20, 20, 39); x.quadraticCurveTo(20, 20, 1, 20); x.quadraticCurveTo(20, 20, 20, 1); x.fill(); });
    const confetti = (col) => sprite(10, 16, (x) => { x.fillStyle = col; x.fillRect(0, 0, 10, 16); });
    const oeuf = (c1, c2) => sprite(34, 44, (x) => { x.save(); x.beginPath(); x.ellipse(17, 24, 13, 18, 0, 0, Math.PI * 2); x.clip(); x.fillStyle = c1; x.fillRect(0, 0, 34, 44);
        x.fillStyle = c2; x.fillRect(0, 18, 34, 6); x.fillRect(0, 28, 34, 3); x.restore(); });
    const petale = (col) => sprite(24, 14, (x) => { x.fillStyle = col; x.beginPath(); x.ellipse(12, 7, 11, 5.5, 0, 0, Math.PI * 2); x.fill(); });
    const chauveSouris = () => sprite(72, 36, (x) => { x.fillStyle = '#1a0f26'; x.strokeStyle = 'rgba(255,138,42,0.4)'; x.lineWidth = 1;
        const aile = () => { x.beginPath(); x.moveTo(36, 12); x.quadraticCurveTo(46, 0, 70, 6); x.quadraticCurveTo(60, 12, 62, 24); x.quadraticCurveTo(54, 17, 50, 28); x.quadraticCurveTo(44, 20, 38, 30); x.lineTo(36, 22); x.closePath(); x.fill(); x.stroke(); };
        aile(); x.save(); x.translate(72, 0); x.scale(-1, 1); aile(); x.restore();
        x.beginPath(); x.ellipse(36, 18, 4, 8, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(33, 11); x.lineTo(32, 5); x.lineTo(36, 9); x.lineTo(40, 5); x.lineTo(39, 11); x.fill(); });

    // Chaque modèle : liste de "familles" de particules {n: nombre sur grand écran, make(p), vol...}
    function familles(type) {
        const g = (th.rgb || '255,255,255');
        if (type === 'neige') { const s = flocon(); return [
            { n: 70, spr: [s], taille: [3, 8], vy: [18, 46], sway: [8, 22], alpha: [0.35, 0.85] },
            { n: 10, spr: [s], taille: [14, 24], vy: [10, 22], sway: [6, 12], alpha: [0.1, 0.2] }]; }
        if (type === 'halloween') { const f = brume('150,90,220'), b2 = brume('255,138,42'), e = lueur('255,150,50', 16); return [
            { n: 2, spr: [f, b2], taille: [380, 640], vx: [6, 14], sway: [0, 0], alpha: [0.05, 0.1], fixeY: true },
            { n: 30, spr: [e], taille: [6, 16], vy: [-42, -14], sway: [6, 16], alpha: [0.35, 0.9], scint: [1.5, 3.5] },
            { n: 2, spr: [chauveSouris()], chauve: true, taille: [46, 70], alpha: [0.9, 0.9] }]; }
        if (type === 'fete') { const cols = ['#ffd166', '#fff3c4', '#ff6b6b', '#7dd3fc', '#ffffff']; return [
            { n: 38, spr: [etoile('#ffd166'), etoile('#fff3c4')], taille: [8, 20], vy: [-30, -10], sway: [4, 12], alpha: [0.4, 0.95], scint: [2, 5] },
            { n: 34, spr: cols.map(confetti), taille: [7, 11], vy: [24, 60], sway: [14, 34], alpha: [0.7, 1], tourne: [-3, 3] }]; }
        if (type === 'coeurs') { const cs = ['#ff4d6d', '#ff7aa8', '#ffb3c8']; return [
            { n: 24, spr: cs.map(coeur), taille: [10, 28], vy: [-46, -18], sway: [8, 22], alpha: [0.25, 0.6], tourne: [-0.6, 0.6] }]; }
        if (type === 'paques') { const oe = [oeuf('#f9a8d4', '#fde68a'), oeuf('#a7f3d0', '#ffffff'), oeuf('#c4b5fd', '#fde68a'), oeuf('#fde68a', '#f9a8d4')];
            const pe = ['#f9a8d4', '#fde68a', '#ffffff', '#c4b5fd'].map(petale); return [
            { n: 12, spr: oe, taille: [18, 30], vy: [12, 28], sway: [10, 22], alpha: [0.55, 0.85], tourne: [-0.5, 0.5] },
            { n: 34, spr: pe, taille: [10, 18], vy: [18, 42], sway: [16, 34], alpha: [0.5, 0.9], tourne: [-2, 2] }]; }
        if (type === 'elan') { const l = lueur('79,227,193', 16), j = lueur('255,209,102', 16); return [
            { n: 38, spr: [l, l, j], taille: [6, 18], vy: [-64, -24], sway: [4, 14], alpha: [0.3, 0.8], scint: [1.2, 3] }]; }
        return [];
    }

    function demarrerFx() {
        const fams = familles(th.fx);
        if (!fams.length) return;
        const cv = document.createElement('canvas'); cv.id = 'fx';
        cv.setAttribute('aria-hidden', 'true');
        cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none';
        document.body.insertBefore(cv, document.body.firstChild);
        const ctx = cv.getContext('2d');
        let W = 0, H = 0, P = [], facteurPerf = 1, raf = 0, dernier = 0, lent = 0, frames = 0, reductions = 0, mort = false;
        if ((navigator.hardwareConcurrency || 8) <= 4) facteurPerf *= 0.65;
        if ((navigator.deviceMemory || 8) <= 2) facteurPerf *= 0.6;

        function taille() { W = innerWidth; H = innerHeight; if (cv.width !== W) cv.width = W; if (cv.height !== H) cv.height = H; }
        function neuf(f, initial) {
            const s = pick(f.spr), t = rnd(f.taille[0], f.taille[1]);
            const p = { f, s, w: t, h: t * s.height / s.width, x: rnd(0, W), y: rnd(0, H), vx: f.vx ? rnd(f.vx[0], f.vx[1]) : 0, vy: f.vy ? rnd(f.vy[0], f.vy[1]) : 0,
                sw: f.sway ? rnd(f.sway[0], f.sway[1]) : 0, ph: rnd(0, 6.28), fq: rnd(0.4, 1.1), a: rnd(f.alpha[0], f.alpha[1]), rot: f.tourne ? rnd(0, 6.28) : 0,
                vr: f.tourne ? rnd(f.tourne[0], f.tourne[1]) : 0, sc: f.scint ? rnd(f.scint[0], f.scint[1]) : 0, sy: 1, sx: 1 };
            if (f.fixeY) p.y = rnd(-0.1 * H, 1.1 * H);
            if (f.chauve) { p.on = false; p.attente = initial ? rnd(3, 8) : rnd(14, 30); }
            return p;
        }
        function construire() {
            const k = Math.max(0.5, Math.min(1.3, (W * H) / (1280 * 720))) * facteurPerf;
            P = [];
            fams.forEach(f => { const n = f.chauve ? f.n : Math.max(3, Math.round(f.n * k)); for (let i = 0; i < n; i++) P.push(neuf(f, true)); });
        }
        function pas(p, dt) {
            const f = p.f;
            if (f.chauve) {
                if (!p.on) { p.attente -= dt; if (p.attente <= 0) { p.on = true; p.sens = Math.random() < 0.5 ? 1 : -1; p.x = p.sens > 0 ? -90 : W + 90; p.y = rnd(0.08, 0.4) * H; p.vx = p.sens * rnd(55, 85); p.vy = rnd(-6, 6); p.ph = 0; } return; }
                p.ph += dt * 9; p.x += p.vx * dt; p.y += (p.vy + Math.sin(p.ph * 0.35) * 14) * dt; p.sy = 0.6 + 0.4 * Math.sin(p.ph); p.sx = p.sens;
                if ((p.sens > 0 && p.x > W + 100) || (p.sens < 0 && p.x < -100)) { p.on = false; p.attente = rnd(14, 30); }
                return;
            }
            p.ph += dt * p.fq;
            p.x += (p.vx + Math.sin(p.ph * 2) * p.sw) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
            const m = p.w + 20;
            if (p.y > H + m) { p.y = -m; p.x = rnd(0, W); } else if (p.y < -m) { p.y = H + m; p.x = rnd(0, W); }
            if (p.x > W + m) p.x = -m; else if (p.x < -m) p.x = W + m;
        }
        function boucle(t) {
            raf = requestAnimationFrame(boucle);
            const dt = Math.min(0.05, (t - dernier) / 1000); dernier = t;
            if (dt <= 0) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < P.length; i++) {
                const p = P[i]; pas(p, dt);
                if (p.f.chauve && !p.on) continue;
                ctx.globalAlpha = p.sc ? p.a * (0.5 + 0.5 * Math.sin(p.ph * p.sc * 3)) : p.a;
                const c = Math.cos(p.rot), s = Math.sin(p.rot);
                ctx.setTransform(c * p.sx, s * p.sx, -s * p.sy, c * p.sy, p.x, p.y);
                ctx.drawImage(p.s, -p.w / 2, -p.h / 2, p.w, p.h);
            }
            // si l'appareil rame, on allège puis on arrête : la fluidité passe avant la déco
            frames++; if (dt > 0.034) lent++;
            if (frames >= 90) {
                if (lent > 35) { reductions++; if (reductions >= 3) { arreter(); return; } facteurPerf *= 0.5; construire(); }
                frames = 0; lent = 0;
            }
        }
        function arreter() { mort = true; cancelAnimationFrame(raf); cv.remove(); }
        function lancer() { if (mort || raf) return; dernier = performance.now(); raf = requestAnimationFrame(boucle); }
        function pause() { cancelAnimationFrame(raf); raf = 0; }
        taille(); construire(); lancer();
        let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { taille(); }, 150); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else lancer(); });
    }

    // ---------- Habillage de la page (après chargement du DOM) ----------
    function habiller() {
        const $ = (id) => document.getElementById(id);
        if (actif && th.msg) {
            const sub = document.querySelector('#page-classement .hero .subtitle');
            if (sub) { const p = document.createElement('p'); p.className = 'theme-msg';
                p.innerHTML = `<i class="fa-solid ${th.ico}"></i> `; p.appendChild(document.createTextNode(choix.msg || th.msg(choix.an))); sub.insertAdjacentElement('afterend', p); }
            const nom = document.querySelector('.nav-brand span');
            if (nom && th.ico) { const i = document.createElement('i'); i.className = `fa-solid ${th.ico} theme-ico`; nom.insertAdjacentElement('afterend', i); }
        }
        if (actif && th.decor && window.AVDecor) { try { AVDecor.monter(th.decor, choix.an, !fxCoupe); } catch (e) { /* le décor ne doit jamais casser le site */ } }
        if (actif && !reduit && !fxCoupe && th.fx) { try { demarrerFx(); } catch (e) { /* la déco ne doit jamais casser le site */ } }
        // lien discret pour le visiteur : seulement pendant un vrai événement
        if (evenement) {
            const sec = $('page-classement');
            if (sec) { const p = document.createElement('p'); p.className = 'theme-opt'; p.id = 'theme-opt';
                const lien = (txt, fn) => { const a = document.createElement('a'); a.href = '#'; a.textContent = txt; a.onclick = (e) => { e.preventDefault(); fn(); location.reload(); }; return a; };
                p.appendChild(document.createTextNode(`Ambiance ${th.nom} : `));
                p.appendChild(coupe ? lien('la remettre', () => ecrire('av_theme_off', null)) : lien('revenir au thème classique', () => ecrire('av_theme_off', '1')));
                if (actif && th.fx && !reduit) { p.appendChild(document.createTextNode(' · ')); p.appendChild(fxCoupe ? lien('animer', () => ecrire('av_fx_off', null)) : lien('couper les animations', () => ecrire('av_fx_off', '1'))); }
                sec.appendChild(p); }
        }
        if (modeApercu) panneauApercu();
    }

    // ---------- Aperçu caché (visible seulement après ?apercu=liste sur TON appareil) ----------
    function panneauApercu() {
        const box = document.createElement('div'); box.id = 'apercu';
        const bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'apercu-pill';
        bouton.innerHTML = `<i class="fa-solid fa-palette"></i> Aperçu : ${th.nom}`;
        const liste = document.createElement('div'); liste.className = 'apercu-list'; liste.hidden = true;
        const ajout = (txt, fn, cur) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; if (cur) b.className = 'cur'; b.onclick = () => { fn(); location.reload(); }; liste.appendChild(b); };
        ajout('Automatique (date du jour)', () => ecrire('av_apercu', null), !apercu);
        Object.keys(T).forEach(id => ajout(T[id].nom, () => ecrire('av_apercu', id), apercu === id));
        ajout('Quitter l\'aperçu', () => { ecrire('av_apercu', null); ecrire('av_apercu_ui', null); });
        bouton.onclick = () => { liste.hidden = !liste.hidden; };
        box.appendChild(liste); box.appendChild(bouton); document.body.appendChild(box);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', habiller); else habiller();
})();
