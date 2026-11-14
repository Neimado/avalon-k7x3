/* Avalon - comparer deux chevaliers (côte à côte, sans classement ni "vainqueur") + image à partager */
(function () {
    const AV = window.AV, $ = AV.$, C = AV.C;
    if (!AV.DATA) return;

    // ---------- Comparaison ----------
    const COUL = [C.A, C.B];
    const ordre = () => AV.joueurs.slice().sort((a, b) => (b.actif - a.actif) || a.pseudo.localeCompare(b.pseudo, 'fr'));
    function lignes(a, b) {
        const S = [AV.statsMembre(a), AV.statsMembre(b)], L = [];
        const ajoute = (nom, f) => { const v = S.map(f); if (v.some(x => x !== null && x !== undefined)) L.push([nom, v.map(x => (x === null || x === undefined ? '-' : x))]); };
        ajoute('Rang mondial', s => s.rang && `#${s.rang.dernier.rang}`);
        ajoute('Record de rang', s => s.rang && `#${s.rang.record.rang}`);
        ajoute('Progression totale (places)', s => s.rang && (s.rang.gainTotal > 0 ? `+${s.rang.gainTotal}` : '-'));
        ajoute('Meilleure semaine (places)', s => s.rang && s.rang.meilleureSemaine && `+${s.rang.meilleureSemaine.valeur}`);
        ajoute('XP cumulées', s => s.xp && AV.fmtN(s.xp.total));
        ajoute('XP, dernière semaine', s => s.xp && AV.fmtN(s.xp.derniere.valeur));
        ajoute('XP, meilleure semaine', s => s.xp && AV.fmtN(s.xp.meilleureSemaine.valeur));
        ajoute('XP, moyenne par semaine', s => s.xp && AV.fmtN(s.xp.moyenne));
        ajoute('Quêtes cumulées', s => s.quetes && AV.fmtN(s.quetes.total));
        ajoute('Quêtes, dernière semaine', s => s.quetes && AV.fmtN(s.quetes.derniere.valeur));
        ajoute('Quêtes, meilleure semaine', s => s.quetes && AV.fmtN(s.quetes.meilleureSemaine.valeur));
        ajoute('Semaines suivies', s => s.presence.semaines);
        return L;
    }
    const union = (a, b) => [...new Set([...a, ...b])].sort();

    function afficher(a, b) {
        const o = (l) => l.map(j => `<option value="${AV.esc(j.pseudo)}">${AV.esc(j.pseudo)}</option>`).join('');
        const tous = ordre(), anc = tous.filter(j => !j.actif);
        const opts = anc.length ? `<optgroup label="Actifs">${o(tous.filter(j => j.actif))}</optgroup><optgroup label="Anciens">${o(anc)}</optgroup>` : o(tous);
        ['du-a', 'du-b'].forEach(id => { $(id).innerHTML = opts; });
        $('du-a').value = a.pseudo; $('du-b').value = b.pseudo;
        $('du-nom-a').textContent = a.pseudo; $('du-nom-b').textContent = b.pseudo;
        $('du-nom-a').style.color = COUL[0]; $('du-nom-b').style.color = COUL[1];
        $('du-table').innerHTML = lignes(a, b).map(([n, v]) => `<tr><td class="du-l">${AV.esc(n)}</td><td class="world-rank">${AV.esc(v[0])}</td><td class="world-rank">${AV.esc(v[1])}</td></tr>`).join('');
        const J = [a, b];

        // Rang : deux courbes sur le même axe de dates
        const aR = J.map(j => j.historique), tousRang = aR.flat();
        $('du-p-rang').hidden = !(aR[0].length && aR[1].length);
        if (!$('du-p-rang').hidden) {
            const xs = union(...aR.map(h => h.map(x => AV.toTs(x.date)))).sort((p, q) => p - q);
            AV.chart('d1', 'du-c-rang', { type: 'line', data: { datasets: J.map((j, i) => ({ label: j.pseudo, data: aR[i].map(x => ({ x: AV.toTs(x.date), y: x.rang })), borderColor: COUL[i], backgroundColor: COUL[i], borderWidth: 2, pointRadius: 3, tension: 0.3 })) },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.SLATE, boxWidth: 12 } }, tooltip: { callbacks: { title: AV.titreDate, label: (c) => `${c.dataset.label} : #${c.parsed.y}` } } },
                    scales: { y: AV.axeRang(tousRang.map(x => x.rang)), x: AV.axeDates(xs) } } });
        }
        // XP et quêtes : barres côte à côte par semaine
        [['xp', 'du-p-xp', 'du-c-xp', 'XP'], ['quetes', 'du-p-q', 'du-c-q', 'quêtes']].forEach(([t, panneau, canvas, u]) => {
            const ws = union(Object.keys(a[t]), Object.keys(b[t]));
            $(panneau).hidden = !(Object.keys(a[t]).length && Object.keys(b[t]).length) || !ws.length;
            if ($(panneau).hidden) return;
            AV.chart('d' + t, canvas, { type: 'bar', data: { labels: ws.map(AV.fmtCourt), datasets: J.map((j, i) => ({ label: j.pseudo, data: ws.map(w => (w in j[t] ? j[t][w] : null)), backgroundColor: COUL[i], borderRadius: 3, maxBarThickness: 18 })) },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.SLATE, boxWidth: 12 } }, tooltip: { callbacks: { title: (it) => `Semaine du ${it[0].label}`, label: (c) => `${c.dataset.label} : ${AV.fmtN(c.parsed.y)} ${u}` } } },
                    scales: { y: { beginAtZero: true, ticks: { color: C.SLATE, precision: 0, maxTicksLimit: 6 }, grid: { color: C.GRID } }, x: { ticks: { color: C.SLATE, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } } } } });
        });
    }
    const aller = () => AV.go(`duel/${encodeURIComponent($('du-a').value)}/${encodeURIComponent($('du-b').value)}`);
    $('du-a').addEventListener('change', aller); $('du-b').addEventListener('change', aller);
    AV.routes.duel = ([pa, pb]) => {
        const l = ordre(), a = AV.parNom.get(pa) || l[0], b = AV.parNom.get(pb) || l.find(j => j !== a) || l[0];
        afficher(a, b);
        return { page: 'page-duel', nav: 'page-armurerie' };
    };

    // ---------- Image à partager (Discord, etc.) ----------
    function composer(o, logo) {
        const W = 1080, src = AV.$(o.canvasId), r = src ? 1000 / src.width : 0, hGraph = src ? Math.round(src.height * r) : 0;
        const c = document.createElement('canvas'); c.width = W; c.height = 330 + hGraph + 70;
        const x = c.getContext('2d');
        const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#1c1c24'); g.addColorStop(1, '#09090b');
        x.fillStyle = g; x.fillRect(0, 0, W, c.height);
        x.textAlign = 'center'; x.fillStyle = '#fff';
        if (logo) { x.save(); x.beginPath(); x.arc(W / 2, 70, 44, 0, 7); x.clip(); x.drawImage(logo, W / 2 - 44, 26, 88, 88); x.restore(); }
        x.font = '700 44px Cinzel, serif'; x.fillText('AVALON', W / 2, 160);
        x.font = '600 30px Inter, sans-serif'; x.fillText(o.titre, W / 2, 205);
        x.font = '400 22px Inter, sans-serif'; x.fillStyle = '#94a3b8'; x.fillText(o.sous || '', W / 2, 238);
        const n = o.tuiles.length, tw = (1000 - (n - 1) * 14) / n;
        o.tuiles.forEach((t, i) => {
            const tx = 40 + i * (tw + 14);
            x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(tx, 258, tw, 56);
            x.fillStyle = '#94a3b8'; x.font = '500 14px Inter, sans-serif'; x.fillText(t.l.toUpperCase(), tx + tw / 2, 278);
            x.fillStyle = '#fff'; x.font = '700 20px Inter, sans-serif'; x.fillText(t.v, tx + tw / 2, 303, tw - 16);
        });
        if (src) x.drawImage(src, 40, 330, 1000, hGraph);
        x.fillStyle = '#64748b'; x.font = '400 16px Inter, sans-serif'; x.fillText('Serveur Leveling Fitness', W / 2, c.height - 28);
        return c;
    }
    AV.partager = (o) => {
        const fin = (blob) => {
            const f = new File([blob], `${o.fichier || 'avalon'}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: o.titre }).catch(() => {}); return; }
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        };
        const essayer = (logo) => { try { composer(o, logo).toBlob(b => b && fin(b)); return true; } catch (e) { return false; } };
        const img = new Image();
        img.onload = () => { if (!essayer(img)) essayer(null); };
        img.onerror = () => essayer(null);
        img.src = 'logo.png';
    };
})();
