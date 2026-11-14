/* Avalon - Classement, Rapport de Bataille (rangs), Armurerie, Panthéon */
(function () {
    const AV = window.AV, $ = AV.$, esc = AV.esc, C = AV.C;
    if (!AV.DATA) return;

    // ---------- Composants communs ----------
    // Podium : items = [{ pseudo, valeur (texte), sub }] déjà triés (1er en premier)
    AV.podium = (el, items) => {
        const top = items.slice(0, 3);
        if (!top.length) { el.innerHTML = ''; return; }
        const ordre = top.length === 3 ? [1, 0, 2] : top.map((_, i) => i);
        el.innerHTML = ordre.map(i => {
            const p = top[i];
            return `<a class="pod pod-${i + 1}" href="${AV.lienProfil(p.pseudo)}">
                <span class="pod-medal"><i class="fa-solid fa-medal"></i></span>
                <span class="pod-name">${esc(p.pseudo)}</span><span class="pod-val">${esc(p.valeur)}</span>
                ${p.sub ? `<span class="pod-sub">${esc(p.sub)}</span>` : ''}</a>`;
        }).join('');
    };
    // Cartes de résumé : [{ icone, titre, valeur, sub, href, or, cls }]
    AV.cartes = (el, cartes) => {
        el.innerHTML = cartes.map((c, i) => {
            const tag = c.href ? 'a' : 'div';
            return `<${tag} class="stat-card${c.or ? ' mvp-card' : ''}" ${c.href ? `href="${c.href}"` : ''} style="animation-delay:${i * 0.08}s">
                <div class="stat-icon"><i class="fa-solid ${c.icone}"></i></div><h3>${esc(c.titre)}</h3>
                <div class="stat-value">${esc(c.valeur)}</div><div class="stat-sub ${c.cls || 'accent'}">${esc(c.sub || '')}</div></${tag}>`;
        }).join('');
    };
    // Barres horizontales (un chevalier par ligne)
    AV.barresH = (cle, canvasId, wrapId, emptyId, lignes, couleur, fmt) => {
        const vide = !lignes.length;
        if (emptyId) $(emptyId).hidden = !vide;
        $(wrapId).hidden = vide;
        if (vide) return;
        $(wrapId).style.height = `${lignes.length * 34 + 56}px`;
        AV.chart(cle, canvasId, {
            type: 'bar',
            data: { labels: lignes.map(l => l.pseudo), datasets: [{ data: lignes.map(l => l.v), backgroundColor: lignes.map(l => couleur(l.v)), borderRadius: 6, barThickness: 20 }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmt(c.parsed.x) } } },
                scales: { x: { ticks: { color: C.SLATE, precision: 0 }, grid: { color: C.GRID } }, y: { ticks: { color: '#e2e8f0' }, grid: { display: false } } } }
        });
    };
    AV.pager = (prevId, nextId, prev, next, lien) => {
        [[prevId, prev], [nextId, next]].forEach(([id, v]) => { const a = $(id); a.classList.toggle('off', !v); a.href = v ? lien(v) : '#'; });
    };

    // ---------- Classement ----------
    const membresRang = AV.actifs.filter(AV.avecRang).map(j => ({ j, der: j.historique[j.historique.length - 1] }))
        .sort((a, b) => a.der.rang - b.der.rang);
    const Sref = AV.semaineRef();
    $('date-maj').textContent = AV.DATA.derniere_mise_a_jour;
    $('cl-periode').textContent = Sref ? `Progression : semaine du ${AV.libSemaine(AV.addJ(Sref, -6))}` : '';

    function tableau(filtre = '') {
        const q = AV.norm(filtre.trim()), tb = $('table-body');
        tb.innerHTML = ''; let n = 0;
        membresRang.forEach(({ j, der }, i) => {
            if (q && !AV.norm(j.pseudo).includes(q)) return;
            const pos = i + 1, d = Sref ? AV.deltaSem(j, Sref) : null;
            const vieux = AV.diffJ(AV.ref, der.date) > 9 ? ` <small class="old">${AV.fmtCourt(der.date)}</small>` : '';
            const tr = document.createElement('tr');
            tr.tabIndex = 0; tr.setAttribute('role', 'link');
            tr.style.animationDelay = `${Math.min(n, 15) * 0.04}s`;
            tr.innerHTML = `<td><span class="place ${pos <= 3 ? 'medal-' + pos : ''}">${pos}</span></td>
                <td class="pseudo">${esc(j.pseudo)}</td><td class="world-rank">#${der.rang}${vieux}</td>
                <td>${d ? AV.prog(d.delta) : '<span class="flat">-</span>'}</td>`;
            const ouvrir = () => AV.go(AV.lienProfil(j.pseudo));
            tr.addEventListener('click', ouvrir);
            tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') ouvrir(); });
            tb.appendChild(tr); n++;
        });
        $('empty-search').hidden = n !== 0;
    }
    tableau();
    $('search-input').addEventListener('input', (e) => tableau(e.target.value));
    AV.routes.classement = () => ({ page: 'page-classement', nav: 'page-classement' });

    // ---------- Rapport de Bataille (rangs, périodes comparables) ----------
    const dimanches = AV.dimanchesRang().filter(S => AV.entreesRang(S).length > 0);

    function rapport(S) {
        const entrees = AV.entreesRang(S).sort((a, b) => b.variation - a.variation || a.rang - b.rang);
        const gagnants = entrees.filter(e => e.variation > 0);
        const total = gagnants.reduce((s, e) => s + e.variation, 0);
        const enCours = S > AV.ref;
        $('st-titre').textContent = `Semaine du ${AV.libSemaine(AV.addJ(S, -6))}`;
        $('st-sub').textContent = `${entrees.length} chevalier${entrees.length > 1 ? 's' : ''} comparable${entrees.length > 1 ? 's' : ''}${enCours ? ' · semaine en cours' : ''}`;
        const i = dimanches.indexOf(S);
        AV.pager('st-prev', 'st-next', dimanches[i - 1], dimanches[i + 1], (v) => '#stats/' + v);

        const mvp = gagnants[0];
        AV.cartes($('st-cards'), [
            { icone: 'fa-crown', titre: 'MVP', valeur: mvp ? mvp.pseudo : '-', sub: mvp ? `+${mvp.variation} places` : 'à venir', href: mvp ? AV.lienProfil(mvp.pseudo) : '', or: true, cls: 'up' },
            { icone: 'fa-arrow-trend-up', titre: 'En progression', valeur: `${gagnants.length} / ${entrees.length}`, sub: AV.plur(gagnants.length, 'chevalier en hausse', 'chevaliers en hausse') },
            { icone: 'fa-people-group', titre: 'Gagné ensemble', valeur: `+${total}`, sub: 'places en tout' }]);
        AV.podium($('st-podium'), gagnants.map(e => ({ pseudo: e.pseudo, valeur: `+${e.variation}`, sub: `#${e.rang}` })));
        $('st-podium-wrap').hidden = !gagnants.length;

        AV.barresH('rapport', 'st-chart', 'st-wrapper', 'st-empty',
            entrees.map(e => ({ pseudo: e.pseudo, v: e.variation })), (v) => v > 0 ? C.GREEN : v < 0 ? C.RED : '#64748b',
            (v) => `${v > 0 ? '+' : ''}${v} places`);
        $('st-table').innerHTML = [...entrees].sort((a, b) => a.rang - b.rang).map(e => `<tr>
            <td class="pseudo"><a class="plain-link" href="${AV.lienProfil(e.pseudo)}">${esc(e.pseudo)}</a></td>
            <td class="world-rank">#${e.rang}</td><td>${AV.prog(e.variation)}</td></tr>`).join('');
        $('st-share').onclick = () => AV.partager && AV.partager({
            titre: 'Rapport de Bataille', sous: `Semaine du ${AV.libSemaine(AV.addJ(S, -6))}`, canvasId: 'st-chart',
            tuiles: [{ l: 'MVP', v: mvp ? `${mvp.pseudo} +${mvp.variation}` : '-' }, { l: 'En hausse', v: `${gagnants.length}/${entrees.length}` }, { l: 'Gagné ensemble', v: `+${total}` }],
            fichier: `rapport-${S}` });
    }

    const semainesArch = [...dimanches].reverse().map(S => {
        const e = AV.entreesRang(S), tot = e.filter(x => x.variation > 0).reduce((s, x) => s + x.variation, 0);
        const lun = AV.addJ(S, -6);
        return { annee: S.slice(0, 4), titre: `Semaine du ${AV.libSemaine(lun)}`, sous: `${e.length} chevalier${e.length > 1 ? 's' : ''} comparable${e.length > 1 ? 's' : ''}`,
                 badge: tot > 0 ? `+${tot} places` : '', href: '#stats/' + S,
                 haystack: AV.norm(`semaine ${AV.libSemaine(lun)} ${S} ${AV.textesMois(lun.slice(0, 7))} ${AV.textesMois(S.slice(0, 7))}`) };
    });
    if (semainesArch.length) AV.archive($('st-archive'), semainesArch, 'Rechercher une semaine...');

    AV.routes.stats = ([S]) => {
        const cible = dimanches.includes(S) ? S : (Sref || dimanches[dimanches.length - 1]);
        const vide = !cible;
        $('st-contenu').hidden = vide; $('st-aucun').hidden = !vide;
        if (!vide) rapport(cible);
        return { page: 'page-stats', nav: 'page-stats' };
    };

    // ---------- Armurerie ----------
    const grid = $('armory-grid'), norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cartes = AV.joueurs.slice().sort((a, b) => a.pseudo.localeCompare(b.pseudo, 'fr')).map((j, i) => {
        const st = AV.statsMembre(j), a = document.createElement('a');
        a.className = 'armory-card' + (j.actif ? '' : ' inactive');
        a.href = AV.lienProfil(j.pseudo);
        a.innerHTML = `<div class="armory-head"><span class="armory-name">${esc(j.pseudo)}</span>
            <span class="badge ${j.actif ? '' : 'off'}">${j.actif ? 'Actif' : 'Ancien'}</span></div>
            <div class="armory-stats">
            <div><span class="as-label">Rang</span><span class="as-value">${st.rang ? '#' + st.rang.dernier.rang : '-'}</span></div>
            <div><span class="as-label">XP</span><span class="as-value">${st.xp ? AV.fmtN(st.xp.total) : '-'}</span></div>
            <div><span class="as-label">Quêtes</span><span class="as-value">${st.quetes ? AV.fmtN(st.quetes.total) : '-'}</span></div></div>`;
        return { j, a, n: norm(j.pseudo), rang: st.rang ? st.rang.dernier.rang : 1e9 };
    });
    let groupe = 'actifs';
    function filtrerArmurerie() {
        const q = norm($('arm-search').value.trim()), hint = $('arm-hint');
        const nA = cartes.filter(c => c.j.actif).length;
        $('arm-n1').textContent = `(${nA})`; $('arm-n2').textContent = `(${cartes.length - nA})`;
        let L = cartes.filter(c => (q ? true : (groupe === 'actifs') === !!c.j.actif) && c.n.includes(q));
        L.sort((x, y) => (y.j.actif - x.j.actif) || (x.rang - y.rang) || x.j.pseudo.localeCompare(y.j.pseudo, 'fr'));
        grid.innerHTML = ''; L.forEach((c, i) => { c.a.style.animationDelay = `${Math.min(i, 15) * 0.04}s`; grid.appendChild(c.a); });
        hint.hidden = !(q && !L.length) && !(!q && !L.length);
        hint.textContent = q ? 'Aucun chevalier trouvé.' : 'Rien ici pour le moment.';
        document.querySelectorAll('#arm-tabs .tab').forEach(t => t.classList.toggle('active', !q && t.dataset.g === groupe));
    }
    document.querySelectorAll('#arm-tabs .tab').forEach(t => t.addEventListener('click', () => { groupe = t.dataset.g; $('arm-search').value = ''; filtrerArmurerie(); }));
    $('arm-search').addEventListener('input', filtrerArmurerie);
    filtrerArmurerie();
    AV.routes.armurerie = () => ({ page: 'page-armurerie', nav: 'page-armurerie' });

    // ---------- Panthéon (que du positif) ----------
    function pantheon() {
        const R = [];
        const all = AV.joueurs.map(j => ({ j, st: AV.statsMembre(j) }));
        const meilleur = (liste, f) => liste.reduce((m, x) => (!m || f(x) > f(m) ? x : m), null);
        const rk = all.filter(x => x.st.rang);
        let r = meilleur(rk, x => -x.st.rang.record.rang);
        if (r) R.push({ i: 'fa-mountain', t: 'Sommet absolu', v: `#${r.st.rang.record.rang}`, s: `${r.j.pseudo} · ${AV.fmtDate(r.st.rang.record.date)}`, p: r.j.pseudo, or: true });
        r = meilleur(rk.filter(x => x.st.rang.meilleureSemaine), x => x.st.rang.meilleureSemaine.valeur);
        if (r) R.push({ i: 'fa-arrow-trend-up', t: 'Plus grosse ascension', v: `+${r.st.rang.meilleureSemaine.valeur} places`, s: `${r.j.pseudo} · semaine du ${AV.fmtCourt(AV.addJ(r.st.rang.meilleureSemaine.S, -6))}`, p: r.j.pseudo });
        r = meilleur(rk.filter(x => x.st.rang.gainTotal > 0), x => x.st.rang.gainTotal);
        if (r) R.push({ i: 'fa-flag-checkered', t: 'Plus grande remontée', v: `+${r.st.rang.gainTotal} places`, s: `${r.j.pseudo} · depuis son 1er relevé`, p: r.j.pseudo });
        for (const [cle, titre, ic, unite] of [['xp', 'XP', 'fa-bolt', 'XP'], ['quetes', 'Quêtes', 'fa-scroll', 'quêtes']]) {
            const L = all.filter(x => x.st[cle]);
            r = meilleur(L, x => x.st[cle].meilleureSemaine.valeur);
            if (r) R.push({ i: ic, t: `Record ${titre} sur une semaine`, v: `${AV.fmtN(r.st[cle].meilleureSemaine.valeur)} ${unite}`, s: `${r.j.pseudo} · semaine du ${AV.fmtCourt(r.st[cle].meilleureSemaine.lundi)}`, p: r.j.pseudo });
            r = meilleur(L, x => x.st[cle].total);
            if (r) R.push({ i: ic, t: `${titre} cumulés`, v: `${AV.fmtN(r.st[cle].total)} ${unite}`, s: `${r.j.pseudo} · depuis le début`, p: r.j.pseudo });
        }
        r = meilleur(all, x => x.st.presence.serieMax);
        if (r && r.st.presence.serieMax > 1) R.push({ i: 'fa-calendar-check', t: 'Le plus régulier', v: `${r.st.presence.serieMax} semaines`, s: `${r.j.pseudo} · d'affilée`, p: r.j.pseudo });
        r = meilleur(rk.filter(x => x.st.rang.serieHausse), x => x.st.rang.serieHausse);
        if (r) R.push({ i: 'fa-fire', t: 'Série de hausses', v: `${r.st.rang.serieHausse} semaines`, s: `${r.j.pseudo} · en hausse d'affilée`, p: r.j.pseudo });
        // Badges en cours, par type
        const G = new Map();
        AV.actifs.forEach(j => AV.badges(j).forEach(b => { if (!G.has(b.cle)) G.set(b.cle, { b, l: [] }); G.get(b.cle).l.push(j.pseudo); }));
        $('pt-badges-panel').hidden = !G.size;
        $('pt-badges').innerHTML = [...G.values()].map(({ b, l }) => `<div class="badge-group"><div class="badge-row"><i class="fa-solid ${b.icone}"></i><div><b>${esc(b.nom.replace(/ ×\d+$/, ''))}</b><span>${esc(b.desc.replace(/^\d+ /, ''))}</span></div></div><div class="mini-badges">${l.map(p => `<a class="mini-badge" href="${AV.lienProfil(p)}">${esc(p)}</a>`).join('')}</div></div>`).join('');
        AV.cartes($('pantheon-grid'), R.map(x => ({ icone: x.i, titre: x.t, valeur: x.v, sub: x.s, href: AV.lienProfil(x.p), or: x.or })));
    }
    AV.routes.pantheon = () => { if (!$('pantheon-grid').children.length) pantheon(); return { page: 'page-pantheon', nav: 'page-pantheon' }; };
})();
