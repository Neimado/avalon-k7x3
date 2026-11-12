document.addEventListener('DOMContentLoaded', () => {
    const DATA = window.AVALON_DATA;
    const DAY = 86400000;
    const GREEN = '#10b981', RED = '#ef4444', GOLD = '#e5c07b', SLATE = '#94a3b8';
    const GRID = 'rgba(255,255,255,0.05)';
    const PAGE_ARCHIVE = 12;
    const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    // ---------- Utilitaires ----------
    const $ = (id) => document.getElementById(id);

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    // minuscules sans accents : "août" et "aout" se valent dans la recherche
    const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
    const fmtCourt = (iso) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };
    const fmtTsCourt = (ts) => fmtCourt(new Date(ts).toISOString().slice(0, 10));
    const toTs = (iso) => Date.parse(iso + 'T00:00:00Z');
    const isoDe = (ts) => new Date(ts).toISOString().slice(0, 10);
    const ajouteJours = (iso, n) => isoDe(toTs(iso) + n * DAY);

    const enc = encodeURIComponent;
    const lienProfil = (pseudo) => `#profil/${enc(pseudo)}`;
    const lienMois = (pseudo, cle) => `#profil/${enc(pseudo)}/${cle}`;
    const lienSemaine = (lundi) => `#stats/${lundi}`;
    const ouvrirProfil = (pseudo) => { location.hash = lienProfil(pseudo).slice(1); };

    const libelleMois = (cle) => {
        const [y, m] = cle.split('-');
        return `${cap(MOIS[parseInt(m, 10) - 1])} ${y}`;
    };

    const lundiDe = (iso) => {
        const decalage = (new Date(toTs(iso)).getUTCDay() + 6) % 7;   // lundi = 0
        return isoDe(toTs(iso) - decalage * DAY);
    };

    const libelleSemaine = (lundi) => {
        const [y1, m1, d1] = lundi.split('-').map(Number);
        const [y2, m2, d2] = ajouteJours(lundi, 6).split('-').map(Number);
        if (m1 === m2) return `${d1} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
        if (y1 === y2) return `${d1} ${MOIS[m1 - 1]} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
        return `${d1} ${MOIS[m1 - 1]} ${y1} au ${d2} ${MOIS[m2 - 1]} ${y2}`;
    };

    // Les baisses restent discrètes (gris), seules les hausses sont mises en valeur
    const progressionHTML = (v) => {
        if (v > 0) return `<span class="prog up">▲ +${v}</span>`;
        if (v < 0) return `<span class="prog down">▼ ${Math.abs(v)}</span>`;
        return `<span class="prog flat">=</span>`;
    };

    // ---------- Graphiques (un seul endroit pour les créer / les remplacer) ----------
    const charts = {};

    function creerGraphique(cle, canvasId, config) {
        if (charts[cle]) { charts[cle].destroy(); delete charts[cle]; }
        if (typeof Chart === 'undefined') return;
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = SLATE;
        charts[cle] = new Chart($(canvasId).getContext('2d'), config);
    }

    const majNotes = () => {
        document.querySelectorAll('.chart-note').forEach(n => { n.hidden = typeof Chart !== 'undefined'; });
    };

    const espacer = (xs, max = 7) => {
        const pas = Math.max(1, Math.ceil(xs.length / max));
        return xs.filter((_, i) => i % pas === 0);
    };

    function axeRang(valeurs) {
        const mn = Math.min(...valeurs), mx = Math.max(...valeurs);
        const marge = Math.max(2, Math.round((mx - mn) * 0.15));
        return {
            reverse: true,                       // le rang #1 est en haut
            min: Math.max(1, mn - marge),
            max: mx + marge,
            ticks: {
                color: SLATE, precision: 0, maxTicksLimit: 6,
                callback: (v) => Number.isInteger(v) ? `#${v}` : ''
            },
            grid: { color: GRID }
        };
    }

    function axeDates(xs) {
        const marge = Math.max(DAY, Math.round((xs[xs.length - 1] - xs[0]) * 0.03));
        return {
            type: 'linear',
            min: xs[0] - marge,
            max: xs[xs.length - 1] + marge,
            afterBuildTicks: (scale) => { scale.ticks = espacer(xs).map(v => ({ value: v })); },
            ticks: { color: SLATE, callback: (v) => fmtTsCourt(v) },
            grid: { display: false }
        };
    }

    const titreDate = (it) => fmtDate(isoDe(it[0].parsed.x));

    function graphiqueRang(cle, canvasId, lignes, couleurLigne = SLATE) {
        const xs = lignes.map(l => toTs(l.date));
        creerGraphique(cle, canvasId, {
            type: 'line',
            data: { datasets: [{
                data: lignes.map(l => ({ x: toTs(l.date), y: l.rang })),
                borderColor: couleurLigne, backgroundColor: 'rgba(148,163,184,0.15)',
                borderWidth: 2, pointBackgroundColor: '#fff',
                pointRadius: lignes.length > 40 ? 2 : 4, pointHoverRadius: 6,
                tension: 0.3, fill: true
            }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { title: titreDate, label: (c) => `Rang #${c.parsed.y}` } }
                },
                scales: { y: axeRang(lignes.map(l => l.rang)), x: axeDates(xs) }
            }
        });
    }

    function graphiqueGains(cle, canvasId, lignes) {
        const mouvements = lignes.filter(l => l.gain !== null);
        creerGraphique(cle, canvasId, {
            type: 'bar',
            data: {
                labels: mouvements.map(l => fmtCourt(l.date)),
                datasets: [{
                    data: mouvements.map(l => l.gain > 0 ? l.gain : 0),
                    backgroundColor: GREEN, borderRadius: 4, maxBarThickness: 28
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (c) => c.parsed.y > 0 ? `+${c.parsed.y} places` : 'Pas de gain' } }
                },
                scales: {
                    y: { beginAtZero: true, suggestedMax: 3, ticks: { color: SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: GRID } },
                    x: { ticks: { color: SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }, grid: { display: false } }
                }
            }
        });
    }

    // Barres horizontales : le mouvement de chaque chevalier (tout le monde)
    function graphiqueBarres(cle, canvasId, wrapperId, emptyId, entrees) {
        const lignes = entrees.filter(e => e.variation !== null).sort((a, b) => b.variation - a.variation);
        const vide = lignes.length === 0;
        $(emptyId).hidden = !vide;
        $(wrapperId).hidden = vide;
        if (vide) return;

        $(wrapperId).style.height = `${lignes.length * 38 + 60}px`;
        creerGraphique(cle, canvasId, {
            type: 'bar',
            data: {
                labels: lignes.map(e => e.pseudo),
                datasets: [{
                    data: lignes.map(e => e.variation),
                    backgroundColor: lignes.map(e => e.variation > 0 ? GREEN : e.variation < 0 ? RED : '#64748b'),
                    borderRadius: 6, barThickness: 22
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (c) => `${c.parsed.x > 0 ? '+' : ''}${c.parsed.x} places` } }
                },
                scales: {
                    x: { ticks: { color: SLATE, precision: 0 }, grid: { color: GRID } },
                    y: { ticks: { color: '#e2e8f0' }, grid: { display: false } }
                }
            }
        });
    }

    // ---------- Archives : recherche + filtre par année + "voir plus" ----------
    // items : { annee, titre, sous, badge, href, haystack } triés du plus récent au plus ancien
    function creerArchive(root, items, placeholder) {
        const annees = [...new Set(items.map(i => i.annee))].sort().reverse();
        const etat = { annee: annees[0], q: '', limite: PAGE_ARCHIVE };

        root.innerHTML = `
            <div class="archive-controls">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="search" placeholder="${esc(placeholder)}" autocomplete="off">
                </div>
                <div class="year-chips"></div>
            </div>
            <div class="archive-grid"></div>
            <p class="empty" hidden>Aucun résultat.</p>
            <button class="show-all" hidden></button>`;

        const input = root.querySelector('input');
        const chips = root.querySelector('.year-chips');
        const grille = root.querySelector('.archive-grid');
        const vide = root.querySelector('.empty');
        const plus = root.querySelector('.show-all');

        if (annees.length > 1) {
            [...annees, ''].forEach(a => {
                const b = document.createElement('button');
                b.className = 'range-btn';
                b.dataset.annee = a;
                b.textContent = a || 'Toutes';
                b.addEventListener('click', () => { etat.annee = a; etat.limite = PAGE_ARCHIVE; maj(); });
                chips.appendChild(b);
            });
        } else {
            chips.hidden = true;
            etat.annee = '';
        }

        function maj() {
            const q = norm(etat.q.trim());
            // Une recherche porte sur toutes les années
            const liste = items.filter(i => q ? i.haystack.includes(q) : (!etat.annee || i.annee === etat.annee));
            const visibles = liste.slice(0, etat.limite);

            chips.classList.toggle('dim', !!q);
            chips.querySelectorAll('.range-btn').forEach(b => b.classList.toggle('active', !q && b.dataset.annee === etat.annee));

            grille.innerHTML = visibles.map(i => `
                <a class="archive-card" href="${i.href}">
                    <span class="archive-title">${esc(i.titre)}</span>
                    <span class="archive-sub">${esc(i.sous)}</span>
                    ${i.badge ? `<span class="badge">${esc(i.badge)}</span>` : ''}
                </a>`).join('');

            vide.hidden = liste.length !== 0;
            const reste = liste.length - visibles.length;
            plus.hidden = reste <= 0;
            plus.textContent = `Voir plus (${reste} restant${reste > 1 ? 's' : ''})`;
        }

        plus.addEventListener('click', () => { etat.limite += PAGE_ARCHIVE; maj(); });
        input.addEventListener('input', () => { etat.q = input.value; etat.limite = PAGE_ARCHIVE; maj(); });
        maj();
    }

    // Texte de recherche d'un mois "2026-10" : "octobre 2026 2026-10 10/2026"
    const textesMois = (cle) => {
        const [y, m] = cle.split('-');
        return `${MOIS[parseInt(m, 10) - 1]} ${y} ${cle} ${m}/${y}`;
    };

    // ---------- Navigation par adresse (#classement, #profil/Nom/2026-10, #stats/2026-11-09...) ----------
    // Le bouton "retour" du téléphone fonctionne naturellement.
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page-section');
    const ROUTES = {
        classement: 'page-classement', stats: 'page-stats',
        armurerie: 'page-armurerie', pantheon: 'page-pantheon'
    };
    const decoder = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };

    function activer(pageId, navId) {
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === navId));
        pages.forEach(p => p.classList.toggle('active', p.id === pageId));
        window.scrollTo(0, 0);
    }

    function route() {
        const [p0, p1, p2] = location.hash.replace(/^#/, '').split('/').map(decoder);

        if (DATA && p0 === 'profil' && p1) {
            const joueur = DATA.joueurs.find(j => j.pseudo === p1);
            if (joueur) {
                if (p2 && moisDe(joueur).some(m => m.key === p2)) {
                    activer('page-mois', 'page-armurerie');
                    renderMois(joueur, p2);
                } else {
                    activer('page-profil', 'page-armurerie');
                    renderProfile(joueur);
                }
                majNotes();
                return;
            }
        }

        if (DATA && p0 === 'stats' && p1 && semaines.has(p1)) {
            activer('page-semaine', 'page-stats');
            renderSemaine(p1);
            majNotes();
            return;
        }

        const id = ROUTES[p0] || 'page-classement';
        activer(id, id);
        if (id === 'page-stats' && DATA) graphiqueBarres('actuel', 'barChart', 'bar-wrapper', 'bar-empty', entreesActuelles);
        majNotes();
    }

    navButtons.forEach(btn => btn.addEventListener('click', () => {
        const cible = btn.dataset.target.replace('page-', '');
        if (location.hash.replace(/^#/, '') === cible) route(); else location.hash = cible;
    }));
    window.addEventListener('hashchange', route);

    // ---------- Données manquantes ----------
    if (!DATA) {
        $('table-body').innerHTML =
            `<tr style="opacity:1;animation:none"><td colspan="4" style="text-align:center;color:#ef4444;">
            Données introuvables : lance <b>python export_web.py</b> puis recharge la page.</td></tr>`;
        route();
        return;
    }

    $('date-maj').textContent = DATA.derniere_mise_a_jour;

    const actifs = DATA.joueurs.filter(j => j.actif).sort((a, b) => a.rang_actuel - b.rang_actuel);
    const disparus = DATA.joueurs.filter(j => !j.actif).sort((a, b) => a.rang_actuel - b.rang_actuel);

    // ---------- Page 1 : Classement ----------
    function renderTable(filtre = '') {
        const q = norm(filtre.trim());
        const tbody = $('table-body');
        tbody.innerHTML = '';
        let affiches = 0;

        actifs.forEach((joueur, index) => {
            if (q && !norm(joueur.pseudo).includes(q)) return;
            const pos = index + 1;
            const tr = document.createElement('tr');
            tr.tabIndex = 0;
            tr.setAttribute('role', 'link');
            tr.style.animationDelay = `${Math.min(affiches, 15) * 0.04}s`;
            tr.innerHTML = `
                <td><span class="place ${pos <= 3 ? 'medal-' + pos : ''}">${pos}</span></td>
                <td class="pseudo">${esc(joueur.pseudo)}</td>
                <td class="world-rank">#${joueur.rang_actuel}</td>
                <td>${progressionHTML(joueur.variation)}</td>`;
            tr.addEventListener('click', () => ouvrirProfil(joueur.pseudo));
            tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') ouvrirProfil(joueur.pseudo); });
            tbody.appendChild(tr);
            affiches++;
        });

        $('empty-search').hidden = affiches !== 0;
    }

    renderTable();
    $('search-input').addEventListener('input', (e) => renderTable(e.target.value));

    // ---------- Page 2 : Rapport de bataille ----------
    // Une "entrée" = { pseudo, rang, variation } (variation = null si pas de relevé précédent)
    const entreesActuelles = actifs.map(j => ({
        pseudo: j.pseudo, rang: j.rang_actuel,
        variation: j.nb_releves >= 2 ? j.variation : null
    }));

    // Les 3 cartes de résumé, pour n'importe quel jeu d'entrées (actuel ou semaine archivée)
    function renderCartes(conteneur, entrees) {
        const avecVar = entrees.filter(e => e.variation !== null);
        const gagnants = avecVar.filter(e => e.variation > 0).sort((a, b) => b.variation - a.variation);
        const total = gagnants.reduce((s, e) => s + e.variation, 0);
        const mvp = gagnants[0];

        const ouvre = mvp ? `<a class="stat-card mvp-card" href="${lienProfil(mvp.pseudo)}" style="animation-delay:0s">`
                          : `<div class="stat-card mvp-card" style="animation-delay:0s">`;
        const ferme = mvp ? '</a>' : '</div>';

        conteneur.innerHTML = `
            ${ouvre}
                <div class="stat-icon"><i class="fa-solid fa-crown"></i></div>
                <h3>MVP</h3>
                <div class="stat-value">${mvp ? esc(mvp.pseudo) : '-'}</div>
                <div class="stat-sub up">${mvp ? `+${mvp.variation} places` : 'à venir'}</div>
            ${ferme}
            <div class="stat-card" style="animation-delay:0.1s">
                <div class="stat-icon"><i class="fa-solid fa-arrow-trend-up"></i></div>
                <h3>En progression</h3>
                <div class="stat-value">${gagnants.length} / ${avecVar.length}</div>
                <div class="stat-sub accent">${gagnants.length > 1 ? 'chevaliers en hausse' : 'chevalier en hausse'}</div>
            </div>
            <div class="stat-card" style="animation-delay:0.2s">
                <div class="stat-icon"><i class="fa-solid fa-people-group"></i></div>
                <h3>Gagné ensemble</h3>
                <div class="stat-value">+${total}</div>
                <div class="stat-sub accent">places en tout</div>
            </div>`;
    }

    renderCartes($('cur-cards'), entreesActuelles);

    // ---------- Archives hebdomadaires ----------
    // Semaine = du lundi au dimanche. Mouvement d'un chevalier sur la semaine =
    // son rang avant la semaine (dernier relevé précédent) moins son dernier rang de la semaine.
    const semaines = new Map();   // lundi -> [{ pseudo, rang, variation }]
    DATA.joueurs.forEach(j => {
        const h = j.historique;
        const parSemaine = new Map();
        h.forEach((x, i) => {
            const w = lundiDe(x.date);
            parSemaine.set(w, { fin: x, premierIndex: parSemaine.has(w) ? parSemaine.get(w).premierIndex : i });
        });
        parSemaine.forEach((v, w) => {
            const avant = v.premierIndex > 0 ? h[v.premierIndex - 1] : null;
            if (!semaines.has(w)) semaines.set(w, []);
            semaines.get(w).push({ pseudo: j.pseudo, rang: v.fin.rang, variation: avant ? avant.rang - v.fin.rang : null });
        });
    });
    const lundis = [...semaines.keys()].sort();   // du plus ancien au plus récent

    const totalGagne = (entrees) => entrees.filter(e => e.variation > 0).reduce((s, e) => s + e.variation, 0);

    creerArchive($('week-archive'), [...lundis].reverse().map(lundi => {
        const entrees = semaines.get(lundi);
        const total = totalGagne(entrees);
        const fin = ajouteJours(lundi, 6);
        return {
            annee: lundi.slice(0, 4),
            titre: `Semaine du ${libelleSemaine(lundi)}`,
            sous: `${entrees.length} chevalier${entrees.length > 1 ? 's' : ''} relevé${entrees.length > 1 ? 's' : ''}`,
            badge: total > 0 ? `+${total} places` : '',
            href: lienSemaine(lundi),
            haystack: norm(`semaine ${libelleSemaine(lundi)} ${lundi} ${textesMois(lundi.slice(0, 7))} ${textesMois(fin.slice(0, 7))}`)
        };
    }), 'Rechercher une semaine...');

    function renderSemaine(lundi) {
        const entrees = semaines.get(lundi);
        const i = lundis.indexOf(lundi);
        $('wk-titre').textContent = `Semaine du ${libelleSemaine(lundi)}`;
        $('wk-sub').textContent = `${entrees.length} chevalier${entrees.length > 1 ? 's' : ''} relevé${entrees.length > 1 ? 's' : ''}`;

        const reglerPager = (id, cible) => {
            const a = $(id);
            a.classList.toggle('off', !cible);
            a.href = cible ? lienSemaine(cible) : '#stats';
        };
        reglerPager('wk-prev', lundis[i - 1]);
        reglerPager('wk-next', lundis[i + 1]);

        renderCartes($('wk-cards'), entrees);
        graphiqueBarres('semaine', 'wk-chart', 'wk-wrapper', 'wk-empty', entrees);

        $('wk-table').innerHTML = [...entrees].sort((a, b) => a.rang - b.rang).map(e => `
            <tr>
                <td class="pseudo"><a class="plain-link" href="${lienProfil(e.pseudo)}">${esc(e.pseudo)}</a></td>
                <td class="world-rank">#${e.rang}</td>
                <td>${e.variation === null ? '<span class="flat">Nouveau</span>' : progressionHTML(e.variation)}</td>
            </tr>`).join('');
    }

    // ---------- Page 3 : Armurerie ----------
    const grid = $('armory-grid');
    [...actifs, ...disparus].forEach((joueur, i) => {
        const card = document.createElement('a');
        card.className = 'armory-card' + (joueur.actif ? '' : ' inactive');
        card.href = lienProfil(joueur.pseudo);
        card.style.animationDelay = `${Math.min(i, 15) * 0.05}s`;
        card.innerHTML = `
            <div class="armory-head">
                <span class="armory-name">${esc(joueur.pseudo)}</span>
                <span class="badge ${joueur.actif ? '' : 'off'}">${joueur.actif ? 'Actif' : 'Disparu'}</span>
            </div>
            <div class="armory-stats">
                <div><span class="as-label">Rang</span><span class="as-value">#${joueur.rang_actuel}</span></div>
                <div><span class="as-label">Record</span><span class="as-value">#${joueur.peak_rank}</span></div>
                <div><span class="as-label">Relevés</span><span class="as-value">${joueur.nb_releves}</span></div>
            </div>`;
        grid.appendChild(card);
    });

    // ---------- Page 4 : Panthéon ----------
    const P = DATA.pantheon || {};
    const records = [
        { cle: 'sommet', icone: 'fa-mountain', titre: 'Sommet absolu',
          valeur: (r) => `#${r.valeur}`, detail: (r) => r.date ? `${r.pseudo} · ${fmtDate(r.date)}` : r.pseudo },
        { cle: 'bond', icone: 'fa-arrow-trend-up', titre: 'Plus grosse ascension',
          valeur: (r) => `+${r.valeur} places`, detail: (r) => `${r.pseudo} · ${r.date ? fmtDate(r.date) : ''}` },
        { cle: 'remontee', icone: 'fa-flag-checkered', titre: 'Plus grande remontée',
          valeur: (r) => `+${r.valeur} places`, detail: (r) => `${r.pseudo} · depuis son 1er relevé` },
        { cle: 'serie', icone: 'fa-fire', titre: 'Série de hausses',
          valeur: (r) => `${r.valeur} ${r.valeur > 1 ? 'relevés' : 'relevé'}`, detail: (r) => `${r.pseudo} · en hausse d'affilée` },
        { cle: 'assidu', icone: 'fa-calendar-check', titre: 'Le plus assidu',
          valeur: (r) => `${r.valeur} relevés`, detail: (r) => r.pseudo }
    ];

    const pGrid = $('pantheon-grid');
    records.forEach((rec, i) => {
        const r = P[rec.cle];
        if (!r) return;
        const card = document.createElement('a');
        card.className = 'stat-card' + (i === 0 ? ' mvp-card' : '');
        card.href = lienProfil(r.pseudo);
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
            <div class="stat-icon"><i class="fa-solid ${rec.icone}"></i></div>
            <h3>${rec.titre}</h3>
            <div class="stat-value">${esc(rec.valeur(r))}</div>
            <div class="stat-sub accent">${esc(rec.detail(r))}</div>`;
        pGrid.appendChild(card);
    });

    // ---------- Données d'un chevalier ----------
    // Chaque relevé garde son record du moment et son gain, calculés sur tout l'historique
    function enrichir(h) {
        let record = Infinity;
        return h.map((x, i) => {
            record = Math.min(record, x.rang);
            return { date: x.date, rang: x.rang, record, gain: i > 0 ? h[i - 1].rang - x.rang : null };
        });
    }

    const pluriel = (n, un, plus) => n > 1 ? plus : un;

    function tuilesHTML(tuiles) {
        return tuiles.map((t, i) => `
            <div class="tile" style="animation-delay:${Math.min(i, 14) * 0.04}s">
                <div class="tile-label"><i class="fa-solid ${t.icone}"></i><span>${esc(t.label)}</span></div>
                <div class="tile-value">${esc(t.value)}</div>
                <div class="tile-sub">${esc(t.sub)}</div>
            </div>`).join('');
    }

    function tableauReleves(lignes) {
        return lignes.map(l => `
            <tr>
                <td>${fmtDate(l.date)}</td>
                <td class="world-rank">#${l.rang}</td>
                <td>${l.gain === null ? '<span class="flat">Premier relevé</span>' : progressionHTML(l.gain)}</td>
            </tr>`).join('');
    }

    // Un chevalier découpé en mois
    function moisDe(j) {
        const e = enrichir(j.historique);
        const groupes = new Map();
        e.forEach((x, i) => {
            const k = x.date.slice(0, 7);
            if (!groupes.has(k)) groupes.set(k, { key: k, debut: i, rel: [] });
            groupes.get(k).rel.push(x);
        });
        return [...groupes.values()].map(g => {
            const avant = g.debut > 0 ? e[g.debut - 1] : null;
            const fin = g.rel[g.rel.length - 1];
            const base = avant ? avant.rang : g.rel[0].rang;
            let bond = 0, hausses = 0, deltas = 0, serie = 0, serieMax = 0;
            g.rel.forEach(r => {
                if (r.gain === null) return;
                deltas++;
                if (r.gain > 0) { hausses++; bond = Math.max(bond, r.gain); serie++; serieMax = Math.max(serieMax, serie); }
                else serie = 0;
            });
            return {
                key: g.key, rel: g.rel, avantExiste: !!avant, baseline: base,
                fin: fin.rang, finDate: fin.date,
                best: Math.min(...g.rel.map(r => r.rang)),
                gain: base - fin.rang, bond, hausses, deltas, serieMax
            };
        });
    }

    // ---------- Page 5 : Profil d'un chevalier ----------
    let profilCourant = null;
    let rangeDays = 0;
    let historiqueComplet = false;

    function analyser(j) {
        const h = j.historique;
        const premier = h[0];
        const dernier = h[h.length - 1];
        const peak = h.reduce((m, x) => (x.rang < m.rang ? x : m), h[0]);

        let bond = { valeur: 0, date: null };
        let hausses = 0, serie = 0, serieMax = 0;
        for (let i = 1; i < h.length; i++) {
            const gain = h[i - 1].rang - h[i].rang;
            if (gain > bond.valeur) bond = { valeur: gain, date: h[i].date };
            if (gain > 0) { hausses++; serie++; serieMax = Math.max(serieMax, serie); } else { serie = 0; }
        }
        const nbMouvements = h.length - 1;
        const dernierGain = nbMouvements > 0 ? h[h.length - 2].rang - dernier.rang : 0;

        return {
            premier, dernier, peak, bond, hausses, serieMax, serieActuelle: serie,
            nbMouvements, dernierGain,
            gainTotal: premier.rang - dernier.rang,
            moyenneRang: Math.round(h.reduce((s, x) => s + x.rang, 0) / h.length),
            joursSuivi: Math.round((toTs(dernier.date) - toTs(premier.date)) / DAY)
        };
    }

    function renderProfile(j) {
        profilCourant = j;
        const a = analyser(j);
        const place = j.actif ? actifs.findIndex(x => x.pseudo === j.pseudo) + 1 : 0;

        $('pf-avatar').textContent = j.pseudo.charAt(0).toUpperCase();
        $('pf-pseudo').textContent = j.pseudo;
        const badge = $('pf-badge');
        badge.textContent = j.actif ? 'Actif' : 'Disparu';
        badge.className = 'badge' + (j.actif ? '' : ' off');
        $('pf-sub').textContent = `Dernier relevé le ${fmtDate(a.dernier.date)}`;

        // --- Tuiles de stats (seulement celles qui valorisent le chevalier) ---
        const tuiles = [];
        tuiles.push({ icone: 'fa-ranking-star', label: 'Rang mondial', value: `#${a.dernier.rang}`, sub: 'au dernier relevé' });
        tuiles.push({ icone: 'fa-mountain', label: 'Record absolu', value: `#${a.peak.rang}`, sub: fmtDate(a.peak.date) });
        if (place) {
            tuiles.push({ icone: 'fa-trophy', label: 'Place dans la guilde', value: `#${place}`, sub: `sur ${actifs.length} chevaliers actifs` });
            if (place > 1) {
                const devant = actifs[place - 2];
                tuiles.push({ icone: 'fa-bullseye', label: 'Prochain objectif', value: devant.pseudo,
                              sub: `${j.rang_actuel - devant.rang_actuel} places à gagner` });
            } else {
                tuiles.push({ icone: 'fa-crown', label: 'Position', value: 'Tête de la guilde', sub: 'Aucun chevalier devant' });
            }
        }
        if (a.gainTotal > 0) tuiles.push({ icone: 'fa-arrow-trend-up', label: 'Progression totale', value: `+${a.gainTotal}`, sub: 'places depuis le 1er relevé' });
        if (a.dernierGain > 0) tuiles.push({ icone: 'fa-bolt', label: 'Dernier relevé', value: `+${a.dernierGain}`, sub: 'places gagnées' });
        if (a.bond.valeur > 0) tuiles.push({ icone: 'fa-rocket', label: 'Meilleure ascension', value: `+${a.bond.valeur}`, sub: fmtDate(a.bond.date) });
        // Série = relevés consécutifs où le chevalier a gagné des places
        if (a.serieMax > 0) tuiles.push({ icone: 'fa-fire', label: 'Série record', value: `${a.serieMax}`,
            sub: pluriel(a.serieMax, 'relevé en hausse', 'relevés en hausse d\'affilée') });
        if (a.serieActuelle >= 2) tuiles.push({ icone: 'fa-fire-flame-curved', label: 'Série en cours', value: `${a.serieActuelle}`, sub: 'relevés en hausse d\'affilée' });
        if (a.hausses > 0) tuiles.push({ icone: 'fa-chart-simple', label: 'Relevés en hausse', value: `${a.hausses} / ${a.nbMouvements}`, sub: `${Math.round(100 * a.hausses / a.nbMouvements)} % des relevés` });
        if (a.gainTotal > 0 && a.nbMouvements > 0) {
            const moy = Math.round(10 * a.gainTotal / a.nbMouvements) / 10;
            if (moy > 0) tuiles.push({ icone: 'fa-gauge-high', label: 'Gain moyen', value: `+${moy}`, sub: 'places par relevé' });
        }
        tuiles.push({ icone: 'fa-flag', label: 'Premier relevé', value: `#${a.premier.rang}`, sub: fmtDate(a.premier.date) });
        tuiles.push({ icone: 'fa-calendar-check', label: 'Relevés', value: `${j.nb_releves}`, sub: a.joursSuivi > 0 ? `suivi depuis ${a.joursSuivi} jours` : 'premier relevé' });
        tuiles.push({ icone: 'fa-equals', label: 'Rang moyen', value: `#${a.moyenneRang}`, sub: 'sur toute la période' });
        $('pf-tiles').innerHTML = tuilesHTML(tuiles);

        // --- Filtre de période : n'apparaît que quand l'historique est assez long ---
        const opts = [30, 90, 365].filter(d => a.joursSuivi > d)
            .map(d => ({ days: d, label: d === 365 ? '1 an' : `${d} j` }));
        opts.push({ days: 0, label: 'Tout' });
        rangeDays = a.joursSuivi > 90 ? 90 : 0;

        const groupe = $('pf-range');
        groupe.hidden = opts.length === 1;
        groupe.innerHTML = '';
        opts.forEach(o => {
            const b = document.createElement('button');
            b.className = 'range-btn' + (o.days === rangeDays ? ' active' : '');
            b.textContent = o.label;
            b.addEventListener('click', () => {
                rangeDays = o.days;
                groupe.querySelectorAll('.range-btn').forEach(x => x.classList.toggle('active', x === b));
                drawProfileCharts();
            });
            groupe.appendChild(b);
        });

        // --- Archives mensuelles ---
        const mois = moisDe(j);
        creerArchive($('pf-archive'), [...mois].reverse().map(m => ({
            annee: m.key.slice(0, 4),
            titre: libelleMois(m.key),
            sous: `${m.rel.length} relevé${m.rel.length > 1 ? 's' : ''} · fin de mois #${m.fin}`,
            badge: m.gain > 0 ? `+${m.gain} places` : '',
            href: lienMois(j.pseudo, m.key),
            haystack: norm(textesMois(m.key))
        })), 'Rechercher un mois...');

        historiqueComplet = false;
        renderHistory();
        drawProfileCharts();
    }

    function renderHistory() {
        const lignes = enrichir(profilCourant.historique).reverse();
        const limite = 8;
        const visibles = historiqueComplet ? lignes : lignes.slice(0, limite);
        $('pf-history').innerHTML = tableauReleves(visibles);

        const btn = $('pf-show-all');
        btn.hidden = lignes.length <= limite;
        btn.textContent = historiqueComplet ? 'Réduire' : `Afficher tout l'historique (${lignes.length})`;
        btn.onclick = () => { historiqueComplet = !historiqueComplet; renderHistory(); };
    }

    // Garde uniquement les relevés des X derniers jours (au moins 2 points)
    function fenetre(lignes, days) {
        if (!days) return lignes;
        const coupe = toTs(lignes[lignes.length - 1].date) - days * DAY;
        const f = lignes.filter(l => toTs(l.date) >= coupe);
        return f.length >= 2 ? f : lignes.slice(-2);
    }

    function drawProfileCharts() {
        const vue = fenetre(enrichir(profilCourant.historique), rangeDays);
        const xs = vue.map(l => toTs(l.date));

        graphiqueRang('rang', 'pf-chart-rank', vue);
        graphiqueGains('gains', 'pf-chart-gains', vue);

        // Courbe des records (ne fait que s'améliorer)
        creerGraphique('record', 'pf-chart-record', {
            type: 'line',
            data: { datasets: [{
                data: vue.map(l => ({ x: toTs(l.date), y: l.record })),
                borderColor: GOLD, backgroundColor: 'rgba(229,192,123,0.12)',
                borderWidth: 2, stepped: true, pointRadius: 0, pointHoverRadius: 5, fill: true
            }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { title: titreDate, label: (c) => `Record #${c.parsed.y}` } }
                },
                scales: { y: axeRang(vue.map(l => l.record)), x: axeDates(xs) }
            }
        });
    }

    // ---------- Page 5 bis : un mois d'un chevalier ----------
    function renderMois(j, cle) {
        const tous = moisDe(j);
        const i = tous.findIndex(m => m.key === cle);
        const m = tous[i];

        $('mo-titre').textContent = libelleMois(cle);
        $('mo-sub').textContent = j.pseudo;
        const retour = $('mo-back');
        retour.href = lienProfil(j.pseudo);
        retour.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Retour au profil de ${esc(j.pseudo)}`;

        const reglerPager = (id, cible) => {
            const a = $(id);
            a.classList.toggle('off', !cible);
            a.href = cible ? lienMois(j.pseudo, cible.key) : lienProfil(j.pseudo);
        };
        reglerPager('mo-prev', tous[i - 1]);
        reglerPager('mo-next', tous[i + 1]);

        const tuiles = [];
        tuiles.push({ icone: 'fa-ranking-star', label: 'Rang en fin de mois', value: `#${m.fin}`, sub: fmtDate(m.finDate) });
        tuiles.push({ icone: 'fa-mountain', label: 'Meilleur rang du mois', value: `#${m.best}`, sub: 'rang le plus haut atteint' });
        if (m.gain > 0) tuiles.push({ icone: 'fa-arrow-trend-up', label: 'Places gagnées', value: `+${m.gain}`, sub: 'sur le mois' });
        if (m.bond > 0) tuiles.push({ icone: 'fa-rocket', label: 'Meilleure ascension', value: `+${m.bond}`, sub: 'sur un seul relevé' });
        if (m.hausses > 0) tuiles.push({ icone: 'fa-chart-simple', label: 'Relevés en hausse', value: `${m.hausses} / ${m.deltas}`,
            sub: `${Math.round(100 * m.hausses / m.deltas)} % des relevés` });
        if (m.serieMax >= 2) tuiles.push({ icone: 'fa-fire', label: 'Série du mois', value: `${m.serieMax}`, sub: 'relevés en hausse d\'affilée' });
        tuiles.push({ icone: 'fa-flag', label: 'Rang de départ', value: `#${m.baseline}`,
            sub: m.avantExiste ? 'au dernier relevé du mois précédent' : 'au premier relevé' });
        tuiles.push({ icone: 'fa-calendar-check', label: 'Relevés', value: `${m.rel.length}`, sub: `en ${libelleMois(cle).toLowerCase()}` });
        $('mo-tiles').innerHTML = tuilesHTML(tuiles);

        graphiqueRang('mois-rang', 'mo-chart-rank', m.rel);
        graphiqueGains('mois-gains', 'mo-chart-gains', m.rel);
        $('mo-table').innerHTML = tableauReleves([...m.rel].reverse());
    }

    // ---------- Page de départ ----------
    route();
});
