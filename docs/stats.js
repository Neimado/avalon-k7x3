/* Avalon - statistiques d'un membre (rang, XP, quêtes, présence) et badges */
(function () {
    const AV = window.AV;
    if (!AV.DATA) return;

    // Classement de la guilde pour une semaine d'activité : lundi -> [[pseudo, valeur], ...] trié
    const cacheAct = {};
    AV.classementAct = (type) => {
        if (cacheAct[type]) return cacheAct[type];
        const out = {};
        AV.joueurs.forEach(j => Object.entries(j[type]).forEach(([l, v]) => (out[l] = out[l] || []).push([j.pseudo, v])));
        Object.values(out).forEach(L => L.sort((a, b) => b[1] - a[1]));
        return (cacheAct[type] = out);
    };

    // Série de semaines consécutives (lundis) : renvoie { max, actuelle }
    function series(lundis, aujourdhui) {
        const set = new Set(lundis);
        let max = 0, cur = 0;
        [...set].sort().forEach(l => { cur = set.has(AV.addJ(l, -7)) ? cur + 1 : 1; max = Math.max(max, cur); });
        const der = AV.lundiDe(aujourdhui);
        let actuelle = 0, l = set.has(der) ? der : AV.addJ(der, -7);
        while (set.has(l)) { actuelle++; l = AV.addJ(l, -7); }
        return { max, actuelle };
    }

    function statsRang(j) {
        const h = j.historique;
        if (!h.length) return null;
        const premier = h[0], dernier = h[h.length - 1];
        const record = h.reduce((m, x) => (x.rang < m.rang ? x : m), h[0]);
        // Semaine par semaine (dimanche à dimanche) : comparaisons équitables, même avec des relevés quotidiens
        const hebdo = AV.dimanchesRang().map(S => { const d = AV.deltaSem(j, S); return d ? { S, rang: d.rang, delta: d.delta } : null; }).filter(Boolean);
        let meilleureSemaine = null, serie = 0, serieMax = 0, prec = null;
        hebdo.forEach(w => {
            if (w.delta > 0 && (!meilleureSemaine || w.delta > meilleureSemaine.valeur)) meilleureSemaine = { valeur: w.delta, S: w.S };
            const consecutive = prec && AV.diffJ(w.S, prec) === 7;
            serie = w.delta > 0 ? (consecutive ? serie : 0) + 1 : 0;
            serieMax = Math.max(serieMax, serie); prec = w.S;
        });
        const sem = hebdo.filter(w => w.delta > 0).length;
        // Meilleur mois : rang en fin de mois contre fin du mois précédent (positif seulement)
        const finMois = {}; h.forEach(x => { finMois[AV.moisCle(x.date)] = x.rang; });
        const mois = Object.keys(finMois).sort(); let meilleurMois = null;
        mois.forEach((m, i) => { if (i && finMois[mois[i - 1]] - finMois[m] > (meilleurMois ? meilleurMois.valeur : 0)) meilleurMois = { valeur: finMois[mois[i - 1]] - finMois[m], mois: m }; });
        return { dernier, premier, record, hebdo, meilleureSemaine, serieHausse: serieMax, serieActuelle: serie,
            semainesHausse: sem, semainesCompar: hebdo.length, gainTotal: premier.rang - dernier.rang, meilleurMois,
            nbReleves: h.length, joursSuivi: AV.diffJ(dernier.date, premier.date),
            moyenne: Math.round(h.reduce((s, x) => s + x.rang, 0) / h.length) };
    }

    function statsAct(j, type) {
        const ks = Object.keys(j[type]).sort();
        if (!ks.length) return null;
        const hebdo = ks.map(l => ({ lundi: l, valeur: j[type][l] }));
        const total = hebdo.reduce((s, x) => s + x.valeur, 0);
        const meilleure = hebdo.reduce((m, x) => (x.valeur > m.valeur ? x : m), hebdo[0]);
        const der = hebdo[hebdo.length - 1], avant = j[type][AV.addJ(der.lundi, -7)];
        let serie = 0, serieMax = 0, hausses = 0, comp = 0;
        hebdo.forEach(x => {
            const p = j[type][AV.addJ(x.lundi, -7)];
            if (p === undefined) { serie = 0; return; }
            comp++;
            if (x.valeur > p) { hausses++; serie++; serieMax = Math.max(serieMax, serie); } else serie = 0;
        });
        const rangs = AV.classementAct(type), pos = (rangs[der.lundi] || []).findIndex(x => x[0] === j.pseudo) + 1;
        const podiums = Object.values(rangs).filter(L => L.slice(0, 3).some(x => x[0] === j.pseudo)).length;
        return { total, nbSemaines: hebdo.length, moyenne: total / hebdo.length, meilleureSemaine: meilleure, derniere: der,
            precedente: avant === undefined ? null : avant, variationPct: avant ? Math.round(100 * (der.valeur - avant) / avant) : null,
            serieHausse: serieMax, serieActuelle: serie, semainesHausse: hausses, semainesCompar: comp,
            position: pos, nbClasses: (rangs[der.lundi] || []).length, podiums, hebdo };
    }

    const cache = new Map();
    AV.statsMembre = (j) => {
        if (cache.has(j.pseudo)) return cache.get(j.pseudo);
        const lundis = [...j.historique.map(x => AV.lundiDe(x.date)), ...Object.keys(j.xp), ...Object.keys(j.quetes)];
        const pres = series(lundis, AV.ref), nb = new Set(lundis).size;
        const debut = lundis.length ? lundis.slice().sort()[0] : AV.ref;
        const possibles = Math.max(1, AV.diffJ(AV.lundiDe(AV.ref), debut) / 7 + 1);
        const s = { rang: statsRang(j), xp: statsAct(j, 'xp'), quetes: statsAct(j, 'quetes'),
            presence: { serieMax: pres.max, serieActuelle: pres.actuelle, semaines: nb, taux: Math.min(100, Math.round(100 * nb / possibles)) } };
        cache.set(j.pseudo, s);
        return s;
    };

    // Badges : uniquement des récompenses
    AV.badges = (j) => {
        const s = AV.statsMembre(j), b = [];
        if (s.presence.serieActuelle >= 4) b.push({ cle: 'regulier', nom: `Régulier ×${s.presence.serieActuelle}`, icone: 'fa-calendar-check', desc: `${s.presence.serieActuelle} semaines d'affilée avec des données` });
        if (s.rang && s.rang.serieActuelle >= 2) b.push({ cle: 'feu', nom: `En feu ×${s.rang.serieActuelle}`, icone: 'fa-fire', desc: `${s.rang.serieActuelle} semaines d'affilée en hausse au classement` });
        if (s.xp && s.xp.serieActuelle >= 2) b.push({ cle: 'xp', nom: `XP en hausse ×${s.xp.serieActuelle}`, icone: 'fa-bolt', desc: `${s.xp.serieActuelle} semaines d'affilée avec plus d'XP que la semaine d'avant` });
        if (s.quetes && s.quetes.serieActuelle >= 2) b.push({ cle: 'quetes', nom: `Quêtes en hausse ×${s.quetes.serieActuelle}`, icone: 'fa-scroll', desc: `${s.quetes.serieActuelle} semaines d'affilée avec plus de quêtes` });
        if (s.xp && s.xp.podiums) b.push({ cle: 'podxp', nom: `Podium XP ×${s.xp.podiums}`, icone: 'fa-medal', desc: `${s.xp.podiums} semaine(s) dans le top 3 de l'XP` });
        if (s.quetes && s.quetes.podiums) b.push({ cle: 'podq', nom: `Podium quêtes ×${s.quetes.podiums}`, icone: 'fa-medal', desc: `${s.quetes.podiums} semaine(s) dans le top 3 des quêtes` });
        if (s.rang && s.rang.record.rang <= 10) b.push({ cle: 'top10', nom: 'Top 10 mondial', icone: 'fa-mountain', desc: `Rang #${s.rang.record.rang} atteint` });
        return b;
    };
})();
