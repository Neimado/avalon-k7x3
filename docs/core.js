/* Avalon - noyau commun : utilitaires, semaines, graphiques, archives, routeur */
window.AV = (function () {
    const AV = { DATA: window.AVALON_DATA, charts: {}, routes: {}, DAY: 86400000 };
    const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                  'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    AV.MOIS = MOIS;
    AV.C = { GREEN: '#10b981', RED: '#ef4444', GOLD: '#e5c07b', SLATE: '#94a3b8', GRID: 'rgba(255,255,255,0.05)',
             A: '#a78bfa', B: '#e5c07b' };

    // ---------- Utilitaires ----------
    AV.$ = (id) => document.getElementById(id);
    AV.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    AV.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    AV.norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    AV.toTs = (iso) => Date.parse(iso + 'T00:00:00Z');
    AV.isoDe = (ts) => new Date(ts).toISOString().slice(0, 10);
    AV.addJ = (iso, n) => AV.isoDe(AV.toTs(iso) + n * AV.DAY);
    AV.diffJ = (a, b) => Math.round((AV.toTs(a) - AV.toTs(b)) / AV.DAY);
    AV.lundiDe = (iso) => AV.addJ(iso, -((new Date(AV.toTs(iso)).getUTCDay() + 6) % 7));
    AV.dimancheDe = (iso) => AV.addJ(AV.lundiDe(iso), 6);
    AV.fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
    AV.fmtCourt = (iso) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };
    AV.fmtTs = (ts) => AV.fmtCourt(AV.isoDe(ts));
    AV.moisCle = (iso) => iso.slice(0, 7);
    AV.libMois = (cle) => { const [y, m] = cle.split('-'); return `${AV.cap(MOIS[+m - 1])} ${y}`; };
    AV.libSemaine = (lundi) => {
        const [y1, m1, d1] = lundi.split('-').map(Number);
        const [y2, m2, d2] = AV.addJ(lundi, 6).split('-').map(Number);
        if (m1 === m2) return `${d1} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
        if (y1 === y2) return `${d1} ${MOIS[m1 - 1]} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
        return `${d1} ${MOIS[m1 - 1]} ${y1} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
    };
    AV.textesMois = (cle) => { const [y, m] = cle.split('-'); return `${MOIS[+m - 1]} ${y} ${cle} ${m}/${y}`; };
    AV.plur = (n, un, plus) => (Math.abs(n) > 1 ? plus : un);
    AV.fmtN = (n) => Math.round(n).toLocaleString('fr-FR');
    AV.signe = (n) => (n > 0 ? '+' : '') + AV.fmtN(n);

    // ---------- Liens ----------
    const enc = encodeURIComponent;
    AV.lienProfil = (p, ...suite) => '#profil/' + [enc(p), ...suite].join('/');
    AV.go = (hash) => { location.hash = hash.replace(/^#/, ''); };

    // Mouvement de rang : seules les hausses sont mises en valeur
    AV.prog = (v) => v > 0 ? `<span class="prog up">▲ +${v}</span>`
        : v < 0 ? `<span class="prog down">▼ ${Math.abs(v)}</span>` : `<span class="prog flat">=</span>`;

    // ---------- Données ----------
    const D = AV.DATA;
    if (D) {
        D.joueurs.forEach(j => { j.historique = j.historique || []; j.xp = j.xp || {}; j.quetes = j.quetes || {}; });
        AV.joueurs = D.joueurs;
        AV.actifs = D.joueurs.filter(j => j.actif);
        AV.parNom = new Map(D.joueurs.map(j => [j.pseudo, j]));
        AV.ref = D.reference || AV.isoDe(Date.now());
        AV.avecRang = (j) => j.historique.length > 0;
    }

    // Rang connu à une date : dernier relevé <= date, pas plus vieux que `tol` jours
    AV.rangAu = (j, iso, tol = 9) => {
        let best = null;
        for (const x of j.historique) { if (x.date <= iso) best = x; else break; }
        return best && AV.diffJ(iso, best.date) <= tol ? best : null;
    };
    // Mouvement sur la semaine qui finit le dimanche S : rang(S) contre rang(S-7).
    // Deux relevés distincts sont obligatoires, sinon pas de comparaison (jamais de faux "=").
    AV.deltaSem = (j, S) => {
        const a = AV.rangAu(j, S), b = AV.rangAu(j, AV.addJ(S, -7));
        return a && b && a.date !== b.date ? { rang: a.rang, delta: b.rang - a.rang, de: b.date, a: a.date } : null;
    };
    AV.entreesRang = (S) => AV.joueurs.map(j => {
        const d = AV.deltaSem(j, S);
        return d ? { pseudo: j.pseudo, rang: d.rang, variation: d.delta } : null;
    }).filter(Boolean);

    // Dimanches de fin de semaine, du premier relevé de rang à la semaine de référence
    AV.dimanchesRang = () => {
        const dates = AV.joueurs.flatMap(j => j.historique.map(x => x.date)).sort();
        if (!dates.length) return [];
        const out = []; let s = AV.dimancheDe(dates[0]);
        const fin = AV.dimancheDe(AV.ref);
        while (s <= fin) { out.push(s); s = AV.addJ(s, 7); }
        return out;
    };
    AV.semaineRef = () => {   // dernière semaine terminée avec au moins 3 comparaisons, sinon la plus récente
        const liste = AV.dimanchesRang().reverse();
        return liste.find(S => S <= AV.ref && AV.entreesRang(S).length >= 3) || liste.find(S => AV.entreesRang(S).length > 0) || null;
    };

    // Semaines d'activité (xp / quetes) : clef = lundi
    AV.semainesAct = (type) => [...new Set(AV.joueurs.flatMap(j => Object.keys(j[type])))].sort();
    AV.valAct = (j, type, lundi) => (lundi in j[type] ? j[type][lundi] : null);

    // ---------- Graphiques ----------
    AV.noteChart = () => document.querySelectorAll('.chart-note').forEach(n => { n.hidden = typeof Chart !== 'undefined'; });
    AV.chart = (cle, canvasId, config) => {
        if (AV.charts[cle]) { AV.charts[cle].destroy(); delete AV.charts[cle]; }
        if (typeof Chart === 'undefined' || !AV.$(canvasId)) return null;
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = AV.C.SLATE;
        return (AV.charts[cle] = new Chart(AV.$(canvasId).getContext('2d'), config));
    };
    const espacer = (xs, max = 7) => { const p = Math.max(1, Math.ceil(xs.length / max)); return xs.filter((_, i) => i % p === 0); };
    AV.axeRang = (vals) => {
        const mn = Math.min(...vals), mx = Math.max(...vals), m = Math.max(2, Math.round((mx - mn) * 0.15));
        return { reverse: true, min: mn - m, max: mx + m, grid: { color: AV.C.GRID },
                 ticks: { color: AV.C.SLATE, precision: 0, maxTicksLimit: 6, callback: (v) => Number.isInteger(v) && v >= 1 ? `#${v}` : '' } };
    };
    AV.axeDates = (xs) => {
        const m = Math.max(AV.DAY, Math.round((xs[xs.length - 1] - xs[0]) * 0.03));
        return { type: 'linear', min: xs[0] - m, max: xs[xs.length - 1] + m, grid: { display: false },
                 afterBuildTicks: (sc) => { sc.ticks = espacer(xs).map(v => ({ value: v })); },
                 ticks: { color: AV.C.SLATE, callback: (v) => AV.fmtTs(v) } };
    };
    AV.titreDate = (it) => AV.fmtDate(AV.isoDe(it[0].parsed.x));

    // ---------- Archives : recherche + filtre par année + "voir plus" ----------
    // items : { annee, titre, sous, badge, href, haystack } du plus récent au plus ancien
    AV.archive = (root, items, placeholder, pas = 12) => {
        const annees = [...new Set(items.map(i => i.annee))].sort().reverse();
        const etat = { annee: annees[0], q: '', lim: pas };
        root.innerHTML = `<div class="archive-controls"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i>
            <input type="search" placeholder="${AV.esc(placeholder)}" autocomplete="off"></div><div class="year-chips"></div></div>
            <div class="archive-grid"></div><p class="empty" hidden>Aucun résultat.</p><button class="show-all" hidden></button>`;
        const input = root.querySelector('input'), chips = root.querySelector('.year-chips'),
              grille = root.querySelector('.archive-grid'), vide = root.querySelector('.empty'), plus = root.querySelector('.show-all');
        if (annees.length > 1) {
            [...annees, ''].forEach(a => {
                const b = document.createElement('button');
                b.className = 'range-btn'; b.dataset.annee = a; b.textContent = a || 'Toutes';
                b.addEventListener('click', () => { etat.annee = a; etat.lim = pas; maj(); });
                chips.appendChild(b);
            });
        } else { chips.hidden = true; etat.annee = ''; }
        function maj() {
            const q = AV.norm(etat.q.trim());
            const liste = items.filter(i => q ? i.haystack.includes(q) : (!etat.annee || i.annee === etat.annee));
            const vis = liste.slice(0, etat.lim);
            chips.classList.toggle('dim', !!q);
            chips.querySelectorAll('.range-btn').forEach(b => b.classList.toggle('active', !q && b.dataset.annee === etat.annee));
            grille.innerHTML = vis.map(i => `<a class="archive-card" href="${i.href}"><span class="archive-title">${AV.esc(i.titre)}</span>
                <span class="archive-sub">${AV.esc(i.sous)}</span>${i.badge ? `<span class="badge">${AV.esc(i.badge)}</span>` : ''}</a>`).join('');
            vide.hidden = liste.length !== 0;
            const reste = liste.length - vis.length;
            plus.hidden = reste <= 0;
            plus.textContent = `Voir plus (${reste} restant${reste > 1 ? 's' : ''})`;
        }
        plus.addEventListener('click', () => { etat.lim += pas; maj(); });
        input.addEventListener('input', () => { etat.q = input.value; etat.lim = pas; maj(); });
        maj();
    };

    // ---------- Routeur : #page/arg1/arg2 ----------
    const dec = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
    AV.route = () => {
        const parts = location.hash.replace(/^#/, '').split('/').map(dec);
        const h = AV.routes[parts[0]] || AV.routes.classement;
        const r = h(parts.slice(1)) || { page: 'page-classement', nav: 'page-classement' };
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target === r.nav));
        document.querySelectorAll('.page-section').forEach(p => p.classList.toggle('active', p.id === r.page));
        window.scrollTo(0, 0);
        const zone = document.querySelector('main.container'); if (zone) zone.scrollTop = 0;   // téléphone : c'est cette zone qui défile
        AV.noteChart();
    };
    AV.demarrer = () => {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
            const cible = btn.dataset.target.replace('page-', '');
            if (location.hash.replace(/^#/, '') === cible) AV.route(); else AV.go(cible);
        }));
        window.addEventListener('hashchange', AV.route);
        AV.route();
    };
    return AV;
})();
