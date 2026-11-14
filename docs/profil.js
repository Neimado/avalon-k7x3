/* Avalon - page profil d'un chevalier : onglets Rang / XP / Quêtes, périodes, badges */
(function () {
    const AV = window.AV, $ = AV.$, esc = AV.esc, C = AV.C;
    if (!AV.DATA) return;
    let j = null, onglet = 'rang', duree = 0;

    AV.tuilesHTML = (t) => t.map((x, i) => `<div class="tile" style="animation-delay:${Math.min(i, 14) * 0.04}s">
        <div class="tile-label"><i class="fa-solid ${x.i}"></i><span>${esc(x.l)}</span></div>
        <div class="tile-value">${esc(x.v)}</div><div class="tile-sub">${esc(x.s || '')}</div></div>`).join('');
    AV.tableReleves = (lignes) => lignes.map(l => `<tr><td>${AV.fmtDate(l.date)}</td><td class="world-rank">#${l.rang}</td>
        <td>${l.gain === null ? '<span class="flat">Premier relevé</span>' : AV.prog(l.gain)}</td></tr>`).join('');
    AV.enrichi = (h) => { let rec = Infinity; return h.map((x, i) => { rec = Math.min(rec, x.rang); return { date: x.date, rang: x.rang, record: rec, gain: i ? h[i - 1].rang - x.rang : null }; }); };

    // ---------- Tuiles ----------
    function tuilesRang(s) {
        const p = AV.actifs.filter(AV.avecRang).sort((a, b) => a.historique.slice(-1)[0].rang - b.historique.slice(-1)[0].rang);
        const pos = p.indexOf(j) + 1, t = [];
        t.push({ i: 'fa-ranking-star', l: 'Rang mondial', v: `#${s.dernier.rang}`, s: `au relevé du ${AV.fmtCourt(s.dernier.date)}` });
        t.push({ i: 'fa-mountain', l: 'Record absolu', v: `#${s.record.rang}`, s: AV.fmtDate(s.record.date) });
        if (pos) {
            t.push({ i: 'fa-trophy', l: 'Place dans la guilde', v: `#${pos}`, s: `sur ${p.length} chevaliers actifs` });
            const dev = p[pos - 2];
            t.push(dev ? { i: 'fa-bullseye', l: 'Prochain objectif', v: dev.pseudo, s: `${s.dernier.rang - dev.historique.slice(-1)[0].rang} places à gagner` }
                       : { i: 'fa-crown', l: 'Position', v: 'Tête de la guilde', s: 'Aucun chevalier devant' });
        }
        const der = s.hebdo[s.hebdo.length - 1];
        if (der && der.delta > 0) t.push({ i: 'fa-bolt', l: 'Dernière semaine', v: `+${der.delta}`, s: `places gagnées (sem. du ${AV.fmtCourt(AV.addJ(der.S, -6))})` });
        if (s.gainTotal > 0) t.push({ i: 'fa-arrow-trend-up', l: 'Progression totale', v: `+${s.gainTotal}`, s: 'places depuis le 1er relevé' });
        if (s.meilleureSemaine) t.push({ i: 'fa-rocket', l: 'Meilleure semaine', v: `+${s.meilleureSemaine.valeur}`, s: `sem. du ${AV.fmtCourt(AV.addJ(s.meilleureSemaine.S, -6))}` });
        if (s.meilleurMois) t.push({ i: 'fa-calendar-plus', l: 'Meilleur mois', v: `+${s.meilleurMois.valeur}`, s: AV.libMois(s.meilleurMois.mois) });
        if (s.semainesHausse) t.push({ i: 'fa-chart-simple', l: 'Semaines en hausse', v: `${s.semainesHausse} / ${s.semainesCompar}`, s: `${Math.round(100 * s.semainesHausse / s.semainesCompar)} % des semaines` });
        if (s.serieHausse) t.push({ i: 'fa-fire', l: 'Série record', v: String(s.serieHausse), s: AV.plur(s.serieHausse, 'semaine en hausse d\'affilée', 'semaines en hausse d\'affilée') });
        if (s.serieActuelle >= 2) t.push({ i: 'fa-fire-flame-curved', l: 'Série en cours', v: String(s.serieActuelle), s: 'semaines en hausse d\'affilée' });
        t.push({ i: 'fa-flag', l: 'Premier relevé', v: `#${s.premier.rang}`, s: AV.fmtDate(s.premier.date) });
        t.push({ i: 'fa-equals', l: 'Rang moyen', v: `#${s.moyenne}`, s: 'sur toute la période' });
        t.push({ i: 'fa-calendar-check', l: 'Relevés', v: String(s.nbReleves), s: s.joursSuivi ? `suivi depuis ${s.joursSuivi} jours` : 'premier relevé' });
        return t;
    }
    function tuilesAct(s, type) {
        const u = type === 'xp' ? 'XP' : 'quêtes', t = [], d = s.derniere;
        t.push({ i: 'fa-chart-column', l: `${type === 'xp' ? 'XP' : 'Quêtes'} cumulées`, v: AV.fmtN(s.total), s: `sur ${s.nbSemaines} semaine${s.nbSemaines > 1 ? 's' : ''}` });
        t.push({ i: 'fa-bolt', l: 'Dernière semaine', v: AV.fmtN(d.valeur), s: s.variationPct !== null && s.variationPct > 0 ? `+${s.variationPct} % vs la précédente` : `sem. du ${AV.fmtCourt(d.lundi)}` });
        t.push({ i: 'fa-rocket', l: 'Meilleure semaine', v: AV.fmtN(s.meilleureSemaine.valeur), s: `sem. du ${AV.fmtCourt(s.meilleureSemaine.lundi)}` });
        t.push({ i: 'fa-gauge-high', l: 'Moyenne par semaine', v: AV.fmtN(s.moyenne), s: u });
        if (s.position) t.push({ i: 'fa-ranking-star', l: 'Position cette semaine', v: `#${s.position}`, s: `sur ${s.nbClasses} chevaliers` });
        if (s.podiums) t.push({ i: 'fa-medal', l: 'Passages sur le podium', v: String(s.podiums), s: AV.plur(s.podiums, 'semaine dans le top 3', 'semaines dans le top 3') });
        if (s.semainesHausse) t.push({ i: 'fa-chart-simple', l: 'Semaines en hausse', v: `${s.semainesHausse} / ${s.semainesCompar}`, s: `${Math.round(100 * s.semainesHausse / s.semainesCompar)} % des semaines` });
        if (s.serieHausse >= 2) t.push({ i: 'fa-fire', l: 'Série record', v: String(s.serieHausse), s: 'semaines en hausse d\'affilée' });
        t.push({ i: 'fa-calendar-check', l: 'Semaines suivies', v: String(s.nbSemaines), s: `depuis le ${AV.fmtCourt(s.hebdo[0].lundi)}` });
        return t;
    }

    // ---------- Périodes ----------
    function fenetre(lignes, dateDe) {
        if (!duree || lignes.length < 2) return lignes;
        const coupe = AV.addJ(dateDe(lignes[lignes.length - 1]), -duree);
        const f = lignes.filter(l => dateDe(l) >= coupe);
        return f.length >= 2 ? f : lignes.slice(-2);
    }
    function boutonsPeriode(span) {
        const opts = [[30, '1 mois'], [91, '3 mois'], [182, '6 mois'], [365, '1 an']].filter(([d]) => span > d);
        opts.push([0, 'Tout']);
        const g = $('pf-range'); g.hidden = opts.length === 1; g.innerHTML = '';
        opts.forEach(([d, lib]) => {
            const b = document.createElement('button'); b.className = 'range-btn' + (d === duree ? ' active' : ''); b.textContent = lib;
            b.onclick = () => { duree = d; g.querySelectorAll('.range-btn').forEach(x => x.classList.toggle('active', x === b)); graphiques(); };
            g.appendChild(b);
        });
    }
    const dureeDefaut = (span) => (span > 182 ? 182 : 0);

    // ---------- Graphiques ----------
    function hebdoReleves(h) {    // un point par semaine : le dernier relevé de la semaine
        const m = new Map(); h.forEach(x => m.set(AV.lundiDe(x.date), x));
        return [...m.values()];
    }
    function graphiques() {
        const s = AV.statsMembre(j);
        $('pf-p3').hidden = onglet !== 'rang';
        if (onglet === 'rang') {
            const h = AV.enrichi(j.historique), vue = fenetre(h, (x) => x.date);
            const parSem = hebdoReleves(vue);
            const pts = vue.length > 45 ? vue.filter(x => parSem.some(y => y.date === x.date)) : vue;   // beaucoup de relevés : un point par semaine
            $('pf-t1').textContent = 'Évolution du rang';
            const xs = pts.map(l => AV.toTs(l.date));
            AV.chart('p1', 'pf-c1', { type: 'line', data: { datasets: [{ data: pts.map(l => ({ x: AV.toTs(l.date), y: l.rang })), borderColor: C.SLATE, backgroundColor: 'rgba(148,163,184,0.15)', borderWidth: 2, pointBackgroundColor: '#fff', pointRadius: pts.length > 40 ? 2 : 4, pointHoverRadius: 6, tension: 0.3, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: AV.titreDate, label: (c) => `Rang #${c.parsed.y}` } } }, scales: { y: AV.axeRang(pts.map(l => l.rang)), x: AV.axeDates(xs) } } });
            $('pf-t2').textContent = 'Places gagnées par semaine';
            const hb = fenetre(s.rang.hebdo, (w) => w.S);
            AV.chart('p2', 'pf-c2', { type: 'bar', data: { labels: hb.map(w => AV.fmtCourt(AV.addJ(w.S, -6))), datasets: [{ data: hb.map(w => Math.max(0, w.delta)), backgroundColor: C.GREEN, borderRadius: 4, maxBarThickness: 28 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (it) => `Semaine du ${it[0].label}`, label: (c) => c.parsed.y > 0 ? `+${c.parsed.y} places` : 'Pas de gain' } } },
                    scales: { y: { beginAtZero: true, suggestedMax: 3, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 }, grid: { display: false } } } } });
            $('pf-t3').textContent = 'Courbe des records';
            const xs3 = vue.map(l => AV.toTs(l.date));
            AV.chart('p3', 'pf-c3', { type: 'line', data: { datasets: [{ data: vue.map(l => ({ x: AV.toTs(l.date), y: l.record })), borderColor: C.GOLD, backgroundColor: 'rgba(229,192,123,0.12)', borderWidth: 2, stepped: true, pointRadius: 0, pointHoverRadius: 5, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: AV.titreDate, label: (c) => `Record #${c.parsed.y}` } } }, scales: { y: AV.axeRang(vue.map(l => l.record)), x: AV.axeDates(xs3) } } });
        } else {
            const T = onglet === 'xp' ? { u: 'XP', col: '#a78bfa' } : { u: 'quêtes', col: C.GOLD };
            const a = s[onglet], hb = fenetre(a.hebdo, (x) => x.lundi);
            $('pf-t1').textContent = `${T.u === 'XP' ? 'XP' : 'Quêtes'} par semaine`;
            const moy = hb.map((_, i) => { const w = hb.slice(Math.max(0, i - 3), i + 1); return Math.round(w.reduce((q, x) => q + x.valeur, 0) / w.length); });
            AV.chart('p1', 'pf-c1', { data: { labels: hb.map(x => AV.fmtCourt(x.lundi)), datasets: [
                    { type: 'bar', label: T.u, data: hb.map(x => x.valeur), backgroundColor: T.col, borderRadius: 4, maxBarThickness: 30 },
                    { type: 'line', label: 'Tendance (moyenne des 4 dernières semaines)', data: moy, borderColor: '#e2e8f0', borderWidth: 2, pointRadius: 0, tension: 0.35, borderDash: [5, 4] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.SLATE, boxWidth: 12 } }, tooltip: { callbacks: { title: (it) => `Semaine du ${it[0].label}`, label: (c) => `${c.dataset.label} : ${AV.fmtN(c.parsed.y)}` } } },
                    scales: { y: { beginAtZero: true, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } } } } });
            $('pf-t2').textContent = 'Cumul depuis le début';
            let cum = 0; const cumul = a.hebdo.map(x => (cum += x.valeur));
            const vis = a.hebdo.filter(x => hb.some(y => y.lundi === x.lundi));
            AV.chart('p2', 'pf-c2', { type: 'line', data: { labels: vis.map(x => AV.fmtCourt(x.lundi)), datasets: [{ data: vis.map(x => cumul[a.hebdo.indexOf(x)]), borderColor: T.col, backgroundColor: 'rgba(148,163,184,0.12)', borderWidth: 2, pointRadius: 3, tension: 0.25, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (it) => `Jusqu'au ${it[0].label}`, label: (c) => `${AV.fmtN(c.parsed.y)} ${T.u}` } } },
                    scales: { y: { beginAtZero: true, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }, grid: { display: false } } } } });
        }
    }

    // ---------- Page ----------
    function afficher(pseudo, tab) {
        j = AV.parNom.get(pseudo); const s = AV.statsMembre(j);
        const dispo = ['rang', 'xp', 'quetes'].filter(k => s[k]);
        onglet = dispo.includes(tab) ? tab : dispo[0];
        $('pf-avatar').textContent = j.pseudo.charAt(0).toUpperCase();
        $('pf-pseudo').textContent = j.pseudo;
        const b = $('pf-badge'); b.textContent = j.actif ? 'Actif' : 'Ancien'; b.className = 'badge' + (j.actif ? '' : ' off');
        $('pf-sub').textContent = `Dernière donnée le ${AV.fmtDate(j.derniere_activite)}`;
        AV.calendrier(j);
        const sc = AV.succes(j), tm = AV.titresMois(j.pseudo);
        $('pf-succes-panel').hidden = !sc.length;
        const barre = (x) => x.prochain === null ? '<span class="sc-max">Niveau max</span>'
            : x.inverse ? `<span class="sc-next">Prochain : top ${AV.fmtN(x.prochain)}</span>`
            : `<div class="sc-bar"><i style="width:${x.pct}%"></i></div><span class="sc-next">${AV.fmtN(x.valeur)} / ${AV.fmtN(x.prochain)} ${esc(x.unite)}</span>`;
        $('pf-succes').innerHTML = (tm ? `<div class="succes-row got"><i class="fa-solid fa-crown"></i><div><b>Chevalier du mois <em>×${tm}</em></b><span class="sc-next">Meilleur de la guilde sur un mois</span></div></div>` : '') +
            sc.map(x => `<div class="succes-row${x.niveau ? ' got' : ''}"><i class="fa-solid ${x.icone}"></i><div><b>${esc(x.nom)}${x.niveau ? ` <em>Niv. ${AV.romain(x.niveau)}</em>` : ''}</b>${barre(x)}</div></div>`).join('');
        const bd = AV.badges(j);
        $('pf-badges-panel').hidden = !bd.length;
        $('pf-badges').innerHTML = bd.map(x => `<div class="badge-row"><i class="fa-solid ${x.icone}"></i><div><b>${esc(x.nom)}</b><span>${esc(x.desc)}</span></div></div>`).join('');
        $('pf-tabs').innerHTML = dispo.map(k => `<a class="tab${k === onglet ? ' active' : ''}" href="${AV.lienProfil(j.pseudo, k)}">${{ rang: 'Rang', xp: 'XP', quetes: 'Quêtes' }[k]}</a>`).join('');
        $('pf-tabs').hidden = dispo.length < 2;
        $('pf-tiles').innerHTML = AV.tuilesHTML(onglet === 'rang' ? tuilesRang(s.rang) : tuilesAct(s[onglet], onglet));
        const premier = onglet === 'rang' ? s.rang.premier.date : s[onglet].hebdo[0].lundi;
        const dernier = onglet === 'rang' ? s.rang.dernier.date : s[onglet].derniere.lundi;
        const span = AV.diffJ(dernier, premier);
        duree = dureeDefaut(span);
        boutonsPeriode(span);
        $('pf-rel').hidden = onglet !== 'rang';
        if (onglet === 'rang') { histo(false); }
        AV.archiveMois(j);
        graphiques();
    }
    function histo(tout) {
        const l = AV.enrichi(j.historique).reverse(), v = tout ? l : l.slice(0, 8);
        $('pf-history').innerHTML = AV.tableReleves(v);
        const b = $('pf-show-all'); b.hidden = l.length <= 8; b.textContent = tout ? 'Réduire' : `Afficher tout l'historique (${l.length})`;
        b.onclick = () => histo(!tout);
    }

    AV.routes.profil = ([pseudo, a1]) => {
        if (!AV.parNom.has(pseudo)) return null;
        if (a1 && /^\d{4}-\d{2}$/.test(a1)) return AV.afficherMois(AV.parNom.get(pseudo), a1);
        afficher(pseudo, a1);
        return { page: 'page-profil', nav: 'page-armurerie' };
    };
})();
