/* Avalon - page Guide : fiches d'exécution, nutrition, récupération, régularité, lexique + recherche */
(function () {
    const AV = window.AV, $ = AV.$, esc = AV.esc;
    if (!AV.GUIDE_TECH || !AV.GUIDE_SECTIONS) return;
    const root = $('guide-root');
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const TECH = AV.GUIDE_TECH, SECT = AV.GUIDE_SECTIONS, LEX = AV.GUIDE_LEXIQUE || [];
    const nbExos = TECH.reduce((n, f) => n + f.membres.length, 0);
    const AVERT = '<p class="guide-warn"><i class="fa-solid fa-circle-info"></i> Conseils généraux de bon sens : ils ne remplacent pas l\'avis d\'un médecin, d\'un kinésithérapeute ou d\'un diététicien. En cas de douleur persistante, de maladie ou si tu as moins de 18 ans et un doute sur ton alimentation, demande un avis professionnel.</p>';

    // ---------- Index de recherche ----------
    const INDEX = [];
    TECH.forEach(f => {
        INDEX.push({ t: f.titre, s: 'Fiche d\'exécution', h: `#guide/technique/${f.id}`, i: f.icone });
        f.membres.forEach(m => INDEX.push({ t: m, s: `Exercice · fiche « ${f.titre} »`, h: `#guide/technique/${f.id}`, i: 'fa-dumbbell' }));
    });
    SECT.forEach(s => s.fiches.forEach(f => INDEX.push({ t: f.titre, s: s.titre, h: `#guide/${s.id}/${f.id}`, i: f.icone })));
    LEX.forEach(([k, d]) => INDEX.push({ t: k, s: 'Lexique', h: '#guide/lexique', i: 'fa-book', extra: d }));
    INDEX.forEach(x => { x.n = norm(x.t + ' ' + (x.extra || '')); });

    const retour = (h, l) => `<a class="back-link" href="${h}"><i class="fa-solid fa-arrow-left"></i> ${esc(l)}</a>`;
    const liste = (a) => `<ul class="guide-list">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;

    // ---------- Accueil ----------
    function accueil() {
        const cartes = [
            { h: '#guide/technique', i: 'fa-dumbbell', t: 'Bien exécuter', s: `${TECH.length} fiches · ${nbExos} exercices de l'appli` },
            ...SECT.map(s => ({ h: `#guide/${s.id}`, i: s.icone, t: s.titre, s: `${s.fiches.length} fiches` })),
            { h: '#guide/lexique', i: 'fa-book', t: 'Lexique', s: `${LEX.length} termes expliqués` }];
        root.innerHTML = `<header class="hero small"><h1>Le Guide</h1><p class="subtitle">Conseils pour bien s'entraîner</p></header>
            <div class="archive-controls"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="gd-search" placeholder="Un exercice, un conseil, un mot..." autocomplete="off"></div></div>
            <div id="gd-res" hidden></div>
            <div class="guide-grid" id="gd-home">${cartes.map(c => `<a class="guide-card" href="${c.h}"><i class="fa-solid ${c.i}"></i><b>${esc(c.t)}</b><span>${esc(c.s)}</span></a>`).join('')}</div>
            ${AVERT}
            <div class="panel"><h2 class="panel-title">Sources</h2><ul class="guide-list">${(AV.GUIDE_SOURCES || []).map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)}</a></li>`).join('')}</ul>
            <p class="panel-hint">Les noms d'exercices sont ceux de l'application LEVELING: Fitness.</p></div>`;
        const input = $('gd-search'), res = $('gd-res'), home = $('gd-home');
        input.addEventListener('input', () => {
            const q = norm(input.value.trim());
            home.hidden = !!q; res.hidden = !q;
            if (!q) return;
            const L = INDEX.filter(x => x.n.includes(q)).slice(0, 15);
            res.innerHTML = L.length ? L.map(x => `<a class="gs-item guide-hit" href="${x.h}"><i class="fa-solid ${x.i}"></i><span>${esc(x.t)}</span><em>${esc(x.s)}</em></a>`).join('')
                : '<p class="panel-hint center">Rien trouvé. Essaie un autre mot, ou le nom de l\'exercice tel qu\'il apparaît dans l\'appli.</p>';
        });
    }

    // ---------- Fiches d'exécution ----------
    function listeTech() {
        root.innerHTML = `${retour('#guide', 'Le Guide')}<header class="hero small"><h1>Bien exécuter</h1><p class="subtitle">Une fiche par famille de mouvements</p></header>
            <div class="guide-grid">${TECH.map(f => `<a class="guide-card" href="#guide/technique/${f.id}"><i class="fa-solid ${f.icone}"></i><b>${esc(f.titre)}</b><span>${esc(f.zone)} · ${f.membres.length} exercice${f.membres.length > 1 ? 's' : ''}</span></a>`).join('')}</div>${AVERT}`;
    }
    function ficheTech(f) {
        root.innerHTML = `${retour('#guide/technique', 'Bien exécuter')}
            <header class="hero small"><h1>${esc(f.titre)}</h1><p class="subtitle">${esc(f.zone)}</p></header>
            <div class="panel"><h2 class="panel-title">Exercices de l'appli concernés</h2><div class="guide-chips">${f.membres.map(m => `<span class="mini-badge">${esc(m)}</span>`).join('')}</div></div>
            <div class="panel"><h2 class="panel-title">Les points clés</h2>${liste(f.cles)}</div>
            <div class="panel"><h2 class="panel-title">Erreurs fréquentes</h2><div class="guide-err">${f.erreurs.map(([e, c]) => `<div><b><i class="fa-solid fa-xmark"></i> ${esc(e)}</b><span><i class="fa-solid fa-check"></i> ${esc(c)}</span></div>`).join('')}</div></div>
            <div class="panel"><h2 class="panel-title">Respiration</h2><p class="guide-p">${esc(f.souffle)}</p></div>
            <div class="two-col"><div class="panel guide-lvl"><h2 class="panel-title"><i class="fa-solid fa-seedling"></i> Débutant</h2><p class="guide-p">${esc(f.debutant)}</p></div>
            <div class="panel guide-lvl"><h2 class="panel-title"><i class="fa-solid fa-crown"></i> Vétéran</h2><p class="guide-p">${esc(f.veteran)}</p></div></div>
            ${f.variantes && f.variantes.length ? `<div class="panel"><h2 class="panel-title">Selon la variante</h2><div class="guide-err">${f.variantes.map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join('')}</div></div>` : ''}
            ${AVERT}`;
    }

    // ---------- Sections (nutrition, récupération, régularité) ----------
    function listeSection(s) {
        root.innerHTML = `${retour('#guide', 'Le Guide')}<header class="hero small"><h1>${esc(s.titre)}</h1><p class="subtitle">${esc(s.desc)}</p></header>
            <div class="guide-grid">${s.fiches.map(f => `<a class="guide-card" href="#guide/${s.id}/${f.id}"><i class="fa-solid ${f.icone}"></i><b>${esc(f.titre)}</b></a>`).join('')}</div>${AVERT}`;
    }
    function calculateur(type) {
        const lab = type === 'proteines' ? 'Calcule ta cible en protéines' : 'Repère pour ton eau';
        return `<div class="panel guide-calc"><h2 class="panel-title">${lab}</h2>
            <label class="guide-lab">Ton poids (kg)<input type="number" id="gd-poids" inputmode="decimal" min="30" max="250" placeholder="ex : 70"></label>
            <p class="guide-p" id="gd-calc-res">Entre ton poids pour voir le résultat.</p></div>`;
    }
    function brancherCalc(type) {
        const inp = $('gd-poids'), out = $('gd-calc-res');
        if (!inp) return;
        inp.addEventListener('input', () => {
            const p = parseFloat(String(inp.value).replace(',', '.'));
            if (!(p >= 30 && p <= 250)) { out.textContent = 'Entre un poids réaliste (30 à 250 kg).'; return; }
            if (type === 'proteines') out.innerHTML = `Pour <b>${p} kg</b> : environ <b>${Math.round(p * 1.4)} à ${Math.round(p * 2)} g</b> de protéines par jour, soit à peu près <b>${Math.round(p * 0.25)} à ${Math.round(p * 0.4)} g par repas</b>. Vise le bas de la fourchette si tu débutes.`;
            else out.innerHTML = `Pour <b>${p} kg</b> : un repère d'environ <b>${(p * 0.03).toFixed(1)} à ${(p * 0.04).toFixed(1)} L</b> de liquides par jour (eau, boissons, soupes), plus quand tu transpires ou qu'il fait chaud. Ce n'est qu'un repère : ta soif et la couleur de ton urine comptent plus.`;
        });
    }
    function ficheSection(s, f) {
        root.innerHTML = `${retour('#guide/' + s.id, s.titre)}<header class="hero small"><h1>${esc(f.titre)}</h1></header>
            <div class="panel"><p class="guide-p">${esc(f.intro)}</p>${liste(f.points)}</div>
            ${f.calc ? calculateur(f.calc) : ''}
            ${f.attention && f.attention.length ? `<div class="panel guide-attn"><h2 class="panel-title"><i class="fa-solid fa-triangle-exclamation"></i> À savoir</h2>${liste(f.attention)}</div>` : ''}
            ${AVERT}`;
        if (f.calc) brancherCalc(f.calc);
    }
    function lexique() {
        root.innerHTML = `${retour('#guide', 'Le Guide')}<header class="hero small"><h1>Lexique</h1><p class="subtitle">Les mots du sport, en clair</p></header>
            <div class="panel guide-lex">${LEX.map(([k, d]) => `<div><b>${esc(k)}</b><span>${esc(d)}</span></div>`).join('')}</div>`;
    }

    AV.routes.guide = ([a, b]) => {
        const s = SECT.find(x => x.id === a);
        if (a === 'technique') { const f = TECH.find(x => x.id === b); if (f) ficheTech(f); else listeTech(); }
        else if (a === 'lexique') lexique();
        else if (s) { const f = s.fiches.find(x => x.id === b); if (f) ficheSection(s, f); else listeSection(s); }
        else accueil();
        return { page: 'page-guide', nav: 'page-guide' };
    };
})();
