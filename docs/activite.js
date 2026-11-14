/* Avalon - menus XP et Quêtes : semaine, 4 semaines, mois, depuis le début */
(function () {
    const AV = window.AV, $ = AV.$, esc = AV.esc;
    if (!AV.DATA) return;
    const TYPES = {
        xp: { titre: 'Expérience', unite: 'XP', icone: 'fa-bolt', col: '#a78bfa', colPrec: 'rgba(167,139,250,0.32)' },
        quetes: { titre: 'Quêtes', unite: 'quêtes', icone: 'fa-scroll', col: '#e5c07b', colPrec: 'rgba(229,192,123,0.32)' }
    };
    const moisDeSemaine = (lundi) => AV.moisCle(AV.addJ(lundi, 3));        // règle du jeudi : la semaine appartient au mois de son jeudi
    const lundisEntre = (a, b) => { const o = []; for (let l = a; l <= b; l = AV.addJ(l, 7)) o.push(l); return o; };

    // Fenêtre de temps demandée : { mode, semaines, prec, label, prev, next }
    function periode(type, mode, arg) {
        const sem = AV.semainesAct(type);
        if (!sem.length) return null;
        const first = sem[0], last = sem[sem.length - 1], tous = lundisEntre(first, last);
        if (mode === '4s') {
            const w = tous.slice(-4);
            return { mode, semaines: w, prec: lundisEntre(AV.addJ(w[0], -28), AV.addJ(w[0], -7)).slice(-4), label: `4 dernières semaines`, sub: `du ${AV.libSemaine(w[0]).split(' au ')[0]} au ${AV.libSemaine(w[w.length - 1]).split(' au ')[1]}` };
        }
        if (mode === 'tout') return { mode, semaines: tous, prec: [], label: 'Depuis le début', sub: `${sem.length} semaine${sem.length > 1 ? 's' : ''} de données` };
        if (mode === 'mois') {
            const mois = [...new Set(tous.map(moisDeSemaine))];
            const m = mois.includes(arg) ? arg : mois[mois.length - 1], i = mois.indexOf(m);
            const w = tous.filter(l => moisDeSemaine(l) === m);
            const pm = AV.moisCle(AV.addJ(m + '-01', -1));
            const p = lundisEntre(AV.addJ(w[0], -35), AV.addJ(w[0], -7)).filter(l => moisDeSemaine(l) === pm);
            return { mode, semaines: w, prec: p, label: AV.libMois(m), sub: `${w.length} semaines · comparé à ${AV.libMois(pm).toLowerCase()}`, cle: m, mois, prev: mois[i - 1], next: mois[i + 1] };
        }
        const l = sem.includes(arg) ? arg : last, i = sem.indexOf(l);
        return { mode: 'sem', semaines: [l], prec: [AV.addJ(l, -7)], label: `Semaine du ${AV.libSemaine(l)}`, sub: 'comparée à la semaine précédente', cle: l, prev: sem[i - 1], next: sem[i + 1] };
    }
    const total = (j, type, ws) => { let t = null; ws.forEach(w => { const v = j[type][w]; if (v !== undefined) t = (t || 0) + v; }); return t; };

    function afficher(type, mode, arg) {
        const T = TYPES[type], P = periode(type, mode, arg);
        const vide = !P; $('act-contenu').hidden = vide; $('act-aucun').hidden = !vide;
        $('act-h1').textContent = T.titre; $('act-aucun-titre').textContent = T.titre.toLowerCase();
        if (vide) return;
        const lignes = AV.joueurs.map(j => ({ pseudo: j.pseudo, v: total(j, type, P.semaines), p: total(j, type, P.prec) })).filter(x => x.v !== null).sort((a, b) => b.v - a.v);
        const avecPrec = P.prec.length > 0 && lignes.some(x => x.p !== null);
        const somme = lignes.reduce((s, x) => s + x.v, 0);
        const sommeP = lignes.filter(x => x.p !== null).reduce((s, x) => s + x.p, 0);
        const sommeCmp = lignes.filter(x => x.p !== null).reduce((s, x) => s + x.v, 0);
        const pct = avecPrec && sommeP ? Math.round(100 * (sommeCmp - sommeP) / sommeP) : null;

        $('act-titre').textContent = P.label; $('act-sub').textContent = P.sub;
        document.querySelectorAll('#act-modes .range-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === P.mode));
        $('act-mois-wrap').hidden = P.mode !== 'mois';
        if (P.mode === 'mois') { $('act-mois').innerHTML = P.mois.slice().reverse().map(m => `<option value="${m}"${m === P.cle ? ' selected' : ''}>${AV.libMois(m)}</option>`).join(''); }
        $('act-pager').hidden = !(P.mode === 'sem' || P.mode === 'mois');
        const base = `#${type}/${P.mode === 'mois' ? 'mois/' : ''}`;
        AV.pager('act-prev', 'act-next', P.prev, P.next, (v) => base + v);

        const progres = avecPrec ? lignes.filter(x => x.p !== null && x.v > x.p).sort((a, b) => (b.v - b.p) - (a.v - a.p))[0] : null;
        AV.cartes($('act-cards'), [
            { icone: 'fa-crown', titre: 'Meilleur', valeur: lignes[0].pseudo, sub: `${AV.fmtN(lignes[0].v)} ${T.unite}`, href: AV.lienProfil(lignes[0].pseudo), or: true },
            { icone: 'fa-people-group', titre: 'Total de la guilde', valeur: AV.fmtN(somme), sub: pct === null ? T.unite : `${pct > 0 ? '+' : ''}${pct} % ${pct >= 0 ? 'vs' : 'face à'} avant`, cls: pct > 0 ? 'up' : 'accent' },
            progres ? { icone: 'fa-arrow-trend-up', titre: 'Plus belle progression', valeur: progres.pseudo, sub: `+${AV.fmtN(progres.v - progres.p)} ${T.unite}`, href: AV.lienProfil(progres.pseudo), cls: 'up' }
                    : { icone: T.icone, titre: 'Moyenne par chevalier', valeur: AV.fmtN(somme / lignes.length), sub: T.unite },
            { icone: 'fa-users', titre: 'Participants', valeur: String(lignes.length), sub: AV.plur(lignes.length, 'chevalier', 'chevaliers') }]);
        AV.podium($('act-podium'), lignes.slice(0, 3).map(x => ({ pseudo: x.pseudo, valeur: `${AV.fmtN(x.v)} ${T.unite}`, sub: x.p !== null ? `avant : ${AV.fmtN(x.p)}` : '' })));

        // Graphique : barres groupées, une ligne par chevalier
        $('act-wrapper').style.height = `${lignes.length * (avecPrec ? 46 : 32) + 70}px`;
        const sets = [{ label: P.mode === 'sem' ? 'Cette semaine' : 'Période', data: lignes.map(x => x.v), backgroundColor: T.col, borderRadius: 4, barThickness: avecPrec ? 16 : 20 }];
        if (avecPrec) sets.push({ label: 'Période précédente', data: lignes.map(x => x.p), backgroundColor: T.colPrec, borderRadius: 4, barThickness: 16 });
        AV.chart('act', 'act-chart', { type: 'bar', data: { labels: lignes.map(x => x.pseudo), datasets: sets },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: avecPrec, labels: { color: AV.C.SLATE, boxWidth: 12 } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label} : ${AV.fmtN(c.parsed.x)} ${T.unite}` } } },
                scales: { x: { beginAtZero: true, ticks: { color: AV.C.SLATE }, grid: { color: AV.C.GRID } }, y: { ticks: { color: '#e2e8f0' }, grid: { display: false } } } } });

        $('act-th').textContent = T.titre;
        $('act-table').innerHTML = lignes.map((x, i) => `<tr><td>${i + 1}</td><td class="pseudo"><a class="plain-link" href="${AV.lienProfil(x.pseudo)}">${esc(x.pseudo)}</a></td>
            <td class="world-rank">${AV.fmtN(x.v)}</td><td>${x.p === null ? '<span class="flat">-</span>' : (x.v > x.p ? `<span class="prog up">▲ +${AV.fmtN(x.v - x.p)}</span>` : x.v < x.p ? `<span class="prog down">▼ ${AV.fmtN(x.p - x.v)}</span>` : '<span class="prog flat">=</span>')}</td></tr>`).join('');
        $('act-share').onclick = () => AV.partager && AV.partager({ titre: `${T.titre} - Avalon`, sous: P.label, canvasId: 'act-chart', fichier: `${type}-${P.cle || P.mode}`,
            tuiles: [{ l: 'Meilleur', v: `${lignes[0].pseudo} ${AV.fmtN(lignes[0].v)}` }, { l: 'Total guilde', v: AV.fmtN(somme) }, { l: 'Participants', v: String(lignes.length) }] });

        // Archives : une carte par semaine (la plus récente d'abord)
        const sem = AV.semainesAct(type).slice().reverse(), cl = AV.classementAct(type);
        AV.archive($('act-archive'), sem.map(l => {
            const L = cl[l], tot = L.reduce((s, x) => s + x[1], 0);
            return { annee: AV.addJ(l, 3).slice(0, 4), titre: `Semaine du ${AV.libSemaine(l)}`, sous: `${L.length} chevalier${L.length > 1 ? 's' : ''} · meilleur : ${L[0][0]}`,
                badge: `${AV.fmtN(tot)} ${T.unite}`, href: `#${type}/${l}`, haystack: AV.norm(`semaine ${AV.libSemaine(l)} ${l} ${AV.textesMois(moisDeSemaine(l))} ${L.map(x => x[0]).join(' ')}`) };
        }), 'Rechercher une semaine ou un chevalier...');
    }

    // L'archive et les écouteurs sont recréés à chaque affichage : on garde l'état propre
    let courant = 'xp';
    document.querySelectorAll('#act-modes .range-btn').forEach(b => b.addEventListener('click', () => {
        const m = b.dataset.mode; AV.go(m === 'sem' ? courant : `${courant}/${m === 'mois' ? 'mois' : m}`);
    }));
    $('act-mois').addEventListener('change', (e) => AV.go(`${courant}/mois/${e.target.value}`));
    $('act-switch').querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); AV.go(a.dataset.type); }));

    ['xp', 'quetes'].forEach(type => {
        AV.routes[type] = (args) => {
            courant = type;
            $('act-switch').querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.type === type));
            const [a0, a1] = args;
            if (a0 === '4s' || a0 === 'tout') afficher(type, a0);
            else if (a0 === 'mois') afficher(type, 'mois', a1);
            else afficher(type, 'sem', a0);
            return { page: 'page-act', nav: 'page-' + type };
        };
    });
})();
