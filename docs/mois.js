/* Avalon - archives mensuelles d'un chevalier et page d'un mois */
(function () {
    const AV = window.AV, $ = AV.$, C = AV.C;
    if (!AV.DATA) return;
    const moisSem = (l) => AV.moisCle(AV.addJ(l, 3));      // une semaine d'activité appartient au mois de son jeudi

    function moisDe(j) {
        const m = {};
        const g = (k) => (m[k] = m[k] || { cle: k, rel: [], xp: [], quetes: [] });
        AV.enrichi(j.historique).forEach(x => g(AV.moisCle(x.date)).rel.push(x));
        ['xp', 'quetes'].forEach(t => Object.keys(j[t]).sort().forEach(l => g(moisSem(l))[t].push({ lundi: l, valeur: j[t][l] })));
        return Object.values(m).sort((a, b) => a.cle.localeCompare(b.cle)).map(x => {
            const h = j.historique, deb = h.findIndex(y => AV.moisCle(y.date) === x.cle);
            const avant = deb > 0 ? h[deb - 1].rang : (x.rel[0] ? x.rel[0].rang : null);
            x.fin = x.rel.length ? x.rel[x.rel.length - 1].rang : null;
            x.gain = avant !== null && x.fin !== null ? avant - x.fin : 0;
            x.avant = avant; x.avantExiste = deb > 0;
            x.best = x.rel.length ? Math.min(...x.rel.map(y => y.rang)) : null;
            x.totXp = x.xp.reduce((s, y) => s + y.valeur, 0); x.totQ = x.quetes.reduce((s, y) => s + y.valeur, 0);
            return x;
        });
    }

    AV.archiveMois = (j) => {
        const ms = moisDe(j).reverse();
        AV.archive($('pf-archive'), ms.map(m => ({
            annee: m.cle.slice(0, 4), titre: AV.libMois(m.cle),
            sous: [m.rel.length ? `${m.rel.length} relevé${m.rel.length > 1 ? 's' : ''} · rang #${m.fin}` : '', m.totXp ? `${AV.fmtN(m.totXp)} XP` : '', m.totQ ? `${AV.fmtN(m.totQ)} quêtes` : ''].filter(Boolean).join(' · '),
            badge: m.gain > 0 ? `+${m.gain} places` : '', href: AV.lienProfil(j.pseudo, m.cle), haystack: AV.norm(AV.textesMois(m.cle))
        })), 'Rechercher un mois...');
    };

    const barres = (cle, id, labels, data, col, unite, titre) => AV.chart(cle, id, { type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: col, borderRadius: 4, maxBarThickness: 30 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (it) => `${titre} ${it[0].label}`, label: (c) => `${AV.fmtN(c.parsed.y)} ${unite}` } } },
            scales: { y: { beginAtZero: true, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } } } } });

    AV.afficherMois = (j, cle) => {
        const tous = moisDe(j), i = tous.findIndex(m => m.cle === cle), m = tous[i];
        if (!m) return null;
        $('mo-titre').textContent = AV.libMois(cle); $('mo-sub').textContent = j.pseudo;
        $('mo-back').href = AV.lienProfil(j.pseudo);
        $('mo-back').innerHTML = `<i class="fa-solid fa-arrow-left"></i> Retour au profil de ${AV.esc(j.pseudo)}`;
        AV.pager('mo-prev', 'mo-next', tous[i - 1] && tous[i - 1].cle, tous[i + 1] && tous[i + 1].cle, (v) => AV.lienProfil(j.pseudo, v));

        const t = [];
        if (m.rel.length) {
            t.push({ i: 'fa-ranking-star', l: 'Rang en fin de mois', v: `#${m.fin}`, s: AV.fmtDate(m.rel[m.rel.length - 1].date) });
            t.push({ i: 'fa-mountain', l: 'Meilleur rang du mois', v: `#${m.best}`, s: 'le plus haut atteint' });
            if (m.gain > 0) t.push({ i: 'fa-arrow-trend-up', l: 'Places gagnées', v: `+${m.gain}`, s: 'sur le mois' });
            const gains = m.rel.filter(x => x.gain > 0);
            if (gains.length) { const b = gains.reduce((a, x) => (x.gain > a.gain ? x : a)); t.push({ i: 'fa-rocket', l: 'Meilleur relevé', v: `+${b.gain}`, s: AV.fmtDate(b.date) }); }
            t.push({ i: 'fa-flag', l: 'Rang de départ', v: `#${m.avant}`, s: m.avantExiste ? 'au dernier relevé du mois d\'avant' : 'au premier relevé' });
            t.push({ i: 'fa-calendar-check', l: 'Relevés', v: String(m.rel.length), s: `sur ${new Set(m.rel.map(x => x.date)).size} jour${m.rel.length > 1 ? 's' : ''}` });
        }
        [['xp', 'XP', m.xp, m.totXp], ['quetes', 'Quêtes', m.quetes, m.totQ]].forEach(([k, nom, L, tot]) => {
            if (!L.length) return;
            const b = L.reduce((a, x) => (x.valeur > a.valeur ? x : a));
            t.push({ i: k === 'xp' ? 'fa-bolt' : 'fa-scroll', l: `${nom} du mois`, v: AV.fmtN(tot), s: `sur ${L.length} semaine${L.length > 1 ? 's' : ''}` });
            t.push({ i: 'fa-rocket', l: `Meilleure semaine (${nom})`, v: AV.fmtN(b.valeur), s: `sem. du ${AV.fmtCourt(b.lundi)}` });
        });
        $('mo-tiles').innerHTML = AV.tuilesHTML(t);

        $('mo-p-rang').hidden = $('mo-p-gains').hidden = $('mo-p-table').hidden = !m.rel.length;
        $('mo-p-xp').hidden = !m.xp.length; $('mo-p-q').hidden = !m.quetes.length;
        if (m.rel.length) {
            const xs = m.rel.map(l => AV.toTs(l.date));
            AV.chart('m1', 'mo-c-rank', { type: 'line', data: { datasets: [{ data: m.rel.map(l => ({ x: AV.toTs(l.date), y: l.rang })), borderColor: C.SLATE, backgroundColor: 'rgba(148,163,184,0.15)', borderWidth: 2, pointBackgroundColor: '#fff', pointRadius: 4, pointHoverRadius: 6, tension: 0.3, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: AV.titreDate, label: (c) => `Rang #${c.parsed.y}` } } }, scales: { y: AV.axeRang(m.rel.map(l => l.rang)), x: AV.axeDates(xs) } } });
            const g = m.rel.filter(x => x.gain !== null);
            barres('m2', 'mo-c-gains', g.map(x => AV.fmtCourt(x.date)), g.map(x => Math.max(0, x.gain)), C.GREEN, 'places', 'Relevé du');
            $('mo-table').innerHTML = AV.tableReleves([...m.rel].reverse());
        }
        if (m.xp.length) barres('m3', 'mo-c-xp', m.xp.map(x => AV.fmtCourt(x.lundi)), m.xp.map(x => x.valeur), AV.C.A, 'XP', 'Semaine du');
        if (m.quetes.length) barres('m4', 'mo-c-q', m.quetes.map(x => AV.fmtCourt(x.lundi)), m.quetes.map(x => x.valeur), C.GOLD, 'quêtes', 'Semaine du');
        return { page: 'page-mois', nav: 'page-armurerie' };
    };
})();
