/* Avalon - carte de chevalier : carte à collectionner téléchargeable, rareté selon les succès */
(function () {
    const AV = window.AV, $ = AV.$;
    const RAR = [
        { min: 23, nom: 'Mythique', c1: '#f472b6', c2: '#7c3aed', txt: '#fdf4ff' },
        { min: 15, nom: 'Légendaire', c1: '#fbbf24', c2: '#b45309', txt: '#fffbeb' },
        { min: 9, nom: 'Épique', c1: '#a78bfa', c2: '#4c1d95', txt: '#f5f3ff' },
        { min: 4, nom: 'Rare', c1: '#38bdf8', c2: '#1e3a8a', txt: '#f0f9ff' },
        { min: 0, nom: 'Commune', c1: '#94a3b8', c2: '#334155', txt: '#f8fafc' }];
    AV.rarete = (n) => RAR.find(r => n >= r.min);

    function dessiner(j, logo) {
        const W = 600, H = 840, c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d'), s = AV.statsMembre(j), nb = AV.nbSucces(j), R = AV.rarete(nb), tm = AV.titresMois(j.pseudo);
        const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, R.c1); g.addColorStop(1, R.c2);
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = 'rgba(15,23,42,0.82)'; x.fillRect(24, 24, W - 48, H - 48);
        x.strokeStyle = R.c1; x.lineWidth = 3; x.strokeRect(24, 24, W - 48, H - 48);
        x.textAlign = 'center'; x.fillStyle = R.c1; x.font = '700 22px Cinzel, Georgia, serif';
        x.fillText('AVALON', W / 2, 70);
        x.fillStyle = '#cbd5e1'; x.font = '400 15px Inter, sans-serif'; x.fillText(R.nom.toUpperCase(), W / 2, 94);
        const cx = W / 2, cy = 215;
        x.beginPath(); x.arc(cx, cy, 78, 0, Math.PI * 2); x.fillStyle = R.c2; x.fill(); x.lineWidth = 5; x.strokeStyle = R.c1; x.stroke();
        if (logo) { x.save(); x.beginPath(); x.arc(cx, cy, 72, 0, Math.PI * 2); x.clip(); x.globalAlpha = 0.25; x.drawImage(logo, cx - 72, cy - 72, 144, 144); x.restore(); }
        x.fillStyle = R.txt; x.font = '700 80px Cinzel, Georgia, serif'; x.fillText(j.pseudo.charAt(0).toUpperCase(), cx, cy + 28);
        let nom = j.pseudo; x.font = '700 38px Cinzel, Georgia, serif';
        while (x.measureText(nom).width > W - 110 && nom.length > 3) nom = nom.slice(0, -2) + '…';
        x.fillStyle = '#f8fafc'; x.fillText(nom, cx, 350);
        const L = [];
        if (s.rang) L.push(['Rang mondial', `#${s.rang.dernier.rang}`]);
        if (s.rang) L.push(['Record', `#${s.rang.record.rang}`]);
        if (s.xp) L.push(['XP cumulés', AV.fmtN(s.xp.total)]);
        if (s.quetes) L.push(['Quêtes', AV.fmtN(s.quetes.total)]);
        L.push(['Succès', `${nb}`]);
        if (tm) L.push(['Chevalier du mois', `×${tm}`]);
        const top = L.slice(0, 6);
        top.forEach((l, i) => {
            const y = 410 + i * 50;
            x.fillStyle = 'rgba(148,163,184,0.12)'; x.fillRect(60, y - 28, W - 120, 40);
            x.textAlign = 'left'; x.fillStyle = '#94a3b8'; x.font = '400 18px Inter, sans-serif'; x.fillText(l[0], 78, y);
            x.textAlign = 'right'; x.fillStyle = R.c1; x.font = '700 22px Inter, sans-serif'; x.fillText(l[1], W - 78, y);
        });
        x.textAlign = 'center'; x.fillStyle = '#64748b'; x.font = '400 14px Inter, sans-serif';
        x.fillText('Leveling Fitness · Avalon Dashboard', W / 2, H - 44);
        return c;
    }
    AV.carteChevalier = (j) => {
        const fin = (blob) => {
            const f = new File([blob], `carte-${j.pseudo}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: `Carte de ${j.pseudo}` }).catch(() => {}); return; }
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        };
        const go = (logo) => { try { dessiner(j, logo).toBlob(b => b && fin(b)); return true; } catch (e) { return false; } };
        const img = new Image(); img.onload = () => { if (!go(img)) go(null); }; img.onerror = () => go(null); img.src = 'logo.png';
    };
})();
