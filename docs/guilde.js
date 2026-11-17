/* Avalon - page La Guilde : totaux, objectifs collectifs, courbes (que du positif) */
(function () {
    const AV = window.AV, $ = AV.$, C = AV.C, esc = AV.esc;
    if (!AV.DATA) return;

    const JALONS = {
        xp: [10000, 25000, 50000, 100000, 150000, 250000, 500000, 1000000],
        quetes: [100, 250, 500, 750, 1000, 2000, 5000],
    };
    const somme = (type) => { const t = {}; AV.joueurs.forEach(j => Object.entries(j[type]).forEach(([l, v]) => { t[l] = (t[l] || 0) + v; })); return t; };
    // Semaines "complètes" : on écarte en fin de série une semaine où presque personne n'a encore de données
    const nbPar = (type) => { const t = {}; AV.joueurs.forEach(j => Object.keys(j[type]).forEach(l => { t[l] = (t[l] || 0) + 1; })); return t; };
    function completes(type, ws) {
        const n = nbPar(type), mx = Math.max(0, ...Object.values(n)), r = ws.slice();
        while (r.length > 1 && n[r[r.length - 1]] < 0.5 * mx) r.pop();
        return r;
    }
    const prochain = (liste, v) => liste.find(x => x > v) || null;

    function afficher() {
        const X = somme('xp'), Q = somme('quetes');
        const wxAll = Object.keys(X).sort(), wqAll = Object.keys(Q).sort(), wx = completes('xp', wxAll), wq = completes('quetes', wqAll);
        const totX = Object.values(X).reduce((a, b) => a + b, 0), totQ = Object.values(Q).reduce((a, b) => a + b, 0);
        const tuiles = [{ i: 'fa-users', l: 'Chevaliers actifs', v: String(AV.actifs.length), s: `${AV.joueurs.length} au total depuis le début` }];
        if (wx.length) {
            const d = wx[wx.length - 1], p = X[AV.addJ(d, -7)];
            tuiles.push({ i: 'fa-bolt', l: 'XP cumulées', v: AV.fmtN(totX), s: `${wxAll.length} semaines suivies` });
            tuiles.push({ i: 'fa-calendar-week', l: 'XP, dernière semaine', v: AV.fmtN(X[d]), s: p && X[d] >= p ? `+${Math.round(100 * (X[d] - p) / p)} % vs semaine d'avant` : `semaine du ${AV.fmtCourt(d)}` });
            const nb = AV.joueurs.filter(j => j.xp[d] !== undefined).length;
            tuiles.push({ i: 'fa-person-running', l: 'Chevaliers en action', v: String(nb), s: 'avec de l\'XP cette semaine' });
        }
        if (wq.length) tuiles.push({ i: 'fa-scroll', l: 'Quêtes cumulées', v: AV.fmtN(totQ), s: `${AV.fmtN(Q[wq[wq.length - 1]])} la dernière semaine` });
        $('gu-tiles').innerHTML = AV.tuilesHTML(tuiles);

        const goals = [['xp', 'XP', totX, 'fa-bolt'], ['quetes', 'quêtes', totQ, 'fa-scroll']].filter(g => g[2] > 0).map(([k, u, v, ic]) => {
            const lis = JALONS[k], cible = prochain(lis, v), passe = lis.filter(x => x <= v);
            const pct = cible ? Math.min(99, Math.round(100 * v / cible)) : 100;
            return `<div class="goal"><div class="goal-top"><i class="fa-solid ${ic}"></i><b>${cible ? `Prochain palier : ${AV.fmtN(cible)} ${u}` : 'Tous les paliers atteints'}</b></div>
                <div class="sc-bar"><i style="width:${pct}%"></i></div>
                <span class="sc-next">${AV.fmtN(v)} ${u} · encore ${cible ? AV.fmtN(cible - v) : 0}${passe.length ? ` · dernier palier franchi : ${AV.fmtN(passe[passe.length - 1])}` : ''}</span></div>`;
        });
        $('gu-goals').innerHTML = goals.join('');

        const barres = (cle, id, T, col, couleurTxt) => AV.chart(cle, id, { type: 'bar', data: { labels: T.map(x => AV.fmtCourt(x[0])), datasets: [{ data: T.map(x => x[1]), backgroundColor: col, borderRadius: 4, maxBarThickness: 30 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (it) => `Semaine du ${it[0].label}`, label: (c) => `${AV.fmtN(c.parsed.y)} ${couleurTxt}` } } },
                scales: { y: { beginAtZero: true, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } } } } });
        barres('gx', 'gu-c-xp', wx.map(l => [l, X[l]]), AV.C.A, 'XP');
        barres('gq', 'gu-c-q', wq.map(l => [l, Q[l]]), C.GOLD, 'quêtes');
        $('gu-c-xp').closest('.panel').hidden = !wx.length; $('gu-c-q').closest('.panel').hidden = !wq.length;
    }
    AV.routes.guilde = () => { afficher(); return { page: 'page-guilde', nav: 'page-guilde' }; };
})();
