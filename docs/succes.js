/* Avalon - succès permanents (paliers) et Chevalier du mois : que des récompenses, rien ne se perd */
(function () {
    const AV = window.AV;
    if (!AV.DATA) return;

    const NIV = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    // Chaque succès : une valeur mesurée + des paliers. On garde le plus haut palier atteint.
    const DEFS = [
        { cle: 'xp', nom: 'Forge d\'XP', icone: 'fa-bolt', unite: 'XP cumulées', pal: [1000, 5000, 10000, 25000, 50000, 100000], val: s => s.xp && s.xp.total },
        { cle: 'xpsem', nom: 'Grosse semaine d\'XP', icone: 'fa-fire-flame-curved', unite: 'XP sur une semaine', pal: [500, 1000, 2000, 3000, 5000], val: s => s.xp && s.xp.meilleureSemaine.valeur },
        { cle: 'q', nom: 'Chasseur de quêtes', icone: 'fa-scroll', unite: 'quêtes cumulées', pal: [10, 25, 50, 100, 250, 500], val: s => s.quetes && s.quetes.total },
        { cle: 'reg', nom: 'Pilier de la guilde', icone: 'fa-calendar-check', unite: 'semaines d\'affilée', pal: [4, 8, 12, 26, 52], val: s => s.presence.serieMax },
        { cle: 'anc', nom: 'Ancienneté', icone: 'fa-hourglass-half', unite: 'semaines suivies', pal: [4, 12, 26, 52, 104], val: s => s.presence.semaines },
        { cle: 'pod', nom: 'Habitué du podium', icone: 'fa-medal', unite: 'podiums XP / quêtes', pal: [1, 3, 5, 10, 20], val: s => (s.xp ? s.xp.podiums : 0) + (s.quetes ? s.quetes.podiums : 0) },
        { cle: 'rem', nom: 'Remontée', icone: 'fa-arrow-trend-up', unite: 'places gagnées', pal: [25, 100, 250, 500, 1000], val: s => s.rang && s.rang.gainTotal },
        { cle: 'hausse', nom: 'Série de hausses', icone: 'fa-fire', unite: 'semaines de hausse d\'affilée', pal: [2, 3, 5, 8, 12], val: s => s.rang && s.rang.serieHausse },
        { cle: 'som', nom: 'Sommet mondial', icone: 'fa-mountain', unite: 'meilleur rang', pal: [250, 100, 50, 10, 1], inverse: true, val: s => s.rang && s.rang.record.rang },
    ];
    AV.SUCCES_DEFS = DEFS;

    const cache = new Map();
    AV.succes = (j) => {
        if (cache.has(j.pseudo)) return cache.get(j.pseudo);
        const s = AV.statsMembre(j), out = [];
        DEFS.forEach(d => {
            const v = d.val(s);
            if (v === null || v === undefined || v === false) return;
            const ok = d.pal.filter(p => (d.inverse ? v <= p : v >= p)).length;
            const prochain = d.pal[ok] === undefined ? null : d.pal[ok];
            const pct = prochain === null ? 100 : (d.inverse ? 0 : Math.min(99, Math.round(100 * v / prochain)));
            out.push({ cle: d.cle, nom: d.nom, icone: d.icone, unite: d.unite, valeur: v, niveau: ok, max: d.pal.length, prochain, pct, inverse: !!d.inverse,
                palier: ok ? d.pal[ok - 1] : null });
        });
        cache.set(j.pseudo, out);
        return out;
    };
    // Calendrier d'activité : une ligne par type de donnée, une case par semaine
    AV.calendrier = (j) => {
        const lundis = [...j.historique.map(x => AV.lundiDe(x.date)), ...Object.keys(j.xp), ...Object.keys(j.quetes)].sort();
        const el = AV.$('pf-heat'), pan = AV.$('pf-heat-panel');
        pan.hidden = !lundis.length; if (!lundis.length) return;
        const semaines = []; for (let l = lundis[0]; l <= AV.lundiDe(AV.ref); l = AV.addJ(l, 7)) semaines.push(l);
        const rel = new Set(j.historique.map(x => AV.lundiDe(x.date)));
        const niveau = (v, mx) => (v === undefined ? 0 : Math.max(1, Math.min(4, Math.ceil(4 * v / (mx || 1)))));
        const ligne = (nom, f) => `<div class="heat-row"><span class="heat-lbl">${nom}</span>${semaines.map(l => { const n = f(l); return `<i class="h${n}" title="${AV.fmtCourt(l)}"></i>`; }).join('')}</div>`;
        const mxX = Math.max(0, ...Object.values(j.xp)), mxQ = Math.max(0, ...Object.values(j.quetes));
        let h = '';
        if (j.historique.length) h += ligne('Rang', l => (rel.has(l) ? 3 : 0));
        if (Object.keys(j.xp).length) h += ligne('XP', l => niveau(j.xp[l], mxX));
        if (Object.keys(j.quetes).length) h += ligne('Quêtes', l => niveau(j.quetes[l], mxQ));
        el.innerHTML = h;
    };
    AV.nbSucces = (j) => AV.succes(j).reduce((n, x) => n + x.niveau, 0);
    AV.romain = (n) => NIV[n - 1] || n;

    // ---------- Chevalier du mois : XP + quêtes du mois, chacun comparé au meilleur de la guilde ----------
    const moisDe = (lundi) => AV.moisCle(AV.addJ(lundi, 3));
    function totauxMois(type) {
        const t = {};
        AV.joueurs.forEach(j => Object.entries(j[type]).forEach(([l, v]) => { const m = moisDe(l); (t[m] = t[m] || {})[j.pseudo] = (t[m][j.pseudo] || 0) + v; }));
        return t;
    }
    AV.chevaliers = () => {
        if (AV.__chev) return AV.__chev;
        const X = totauxMois('xp'), Q = totauxMois('quetes'), courant = AV.moisCle(AV.ref);
        const mois = [...new Set([...Object.keys(X), ...Object.keys(Q)])].sort(), res = [];
        mois.forEach(m => {
            const x = X[m] || {}, q = Q[m] || {}, mx = Math.max(0, ...Object.values(x)), mq = Math.max(0, ...Object.values(q));
            const parts = (mx ? 1 : 0) + (mq ? 1 : 0); if (!parts) return;
            const sc = {};
            new Set([...Object.keys(x), ...Object.keys(q)]).forEach(p => { sc[p] = ((mx ? (x[p] || 0) / mx : 0) + (mq ? (q[p] || 0) / mq : 0)) / parts; });
            const L = Object.entries(sc).sort((a, b) => b[1] - a[1]);
            res.push({ mois: m, enCours: m >= courant, gagnant: L[0][0], xp: x[L[0][0]] || 0, quetes: q[L[0][0]] || 0, top: L.slice(0, 3).map(a => a[0]) });
        });
        return (AV.__chev = res);
    };
    AV.titresMois = (pseudo) => AV.chevaliers().filter(c => !c.enCours && c.gagnant === pseudo).length;
})();
