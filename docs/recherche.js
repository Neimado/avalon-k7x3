/* Avalon - recherche globale : chevaliers et pages, depuis n'importe où (touche "/" sur ordinateur) */
(function () {
    const AV = window.AV, esc = AV.esc;
    if (!AV.DATA) return;
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const PAGES = [['Classement', 'classement', 'fa-trophy'], ['Rapport de Bataille', 'stats', 'fa-chart-line'], ['XP', 'xp', 'fa-bolt'], ['Quêtes', 'quetes', 'fa-scroll'],
        ['Armurerie', 'armurerie', 'fa-shield-halved'], ['La Guilde', 'guilde', 'fa-users'], ['Panthéon', 'pantheon', 'fa-crown'], ['Guide', 'guide', 'fa-book-open'], ['Comparer deux chevaliers', 'duel', 'fa-right-left']];

    const fab = document.createElement('button');
    fab.id = 'gs-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Rechercher'); fab.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    const ov = document.createElement('div');
    ov.id = 'gs'; ov.hidden = true;
    ov.innerHTML = '<div class="gs-box"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="gs-input" placeholder="Chevalier, page..." autocomplete="off"></div><div id="gs-res"></div></div>';
    document.body.append(fab, ov);
    const input = ov.querySelector('#gs-input'), res = ov.querySelector('#gs-res');

    function maj() {
        const q = norm(input.value.trim());
        const m = AV.joueurs.filter(j => !q || norm(j.pseudo).includes(q)).sort((a, b) => (b.actif - a.actif) || a.pseudo.localeCompare(b.pseudo, 'fr')).slice(0, q ? 8 : 5);
        const p = q ? PAGES.filter(x => norm(x[0]).includes(q)) : PAGES;
        const li = (href, ic, t, s) => `<a class="gs-item" href="${href}"><i class="fa-solid ${ic}"></i><span>${esc(t)}</span><em>${esc(s)}</em></a>`;
        res.innerHTML = m.map(j => li(AV.lienProfil(j.pseudo), 'fa-user', j.pseudo, j.actif ? 'Chevalier' : 'Ancien')).join('') + p.map(x => li('#' + x[1], x[2], x[0], 'Page')).join('') || '<p class="panel-hint">Aucun résultat.</p>';
    }
    const ouvrir = () => { ov.hidden = false; input.value = ''; maj(); setTimeout(() => input.focus(), 30); };
    const fermer = () => { ov.hidden = true; input.blur(); };
    fab.addEventListener('click', ouvrir);
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('.gs-item')) fermer(); });
    input.addEventListener('input', maj);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = res.querySelector('.gs-item'); if (a) { a.click(); location.hash = a.getAttribute('href'); } } });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !ov.hidden) fermer();
        else if (e.key === '/' && ov.hidden && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); ouvrir(); }
    });
})();
