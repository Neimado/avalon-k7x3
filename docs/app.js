/* Avalon - démarrage : les modules (core, pages-rang, stats, activite, profil, mois, duel) sont chargés avant */
document.addEventListener('DOMContentLoaded', () => {
    const AV = window.AV;
    if (!AV || !AV.DATA) {
        document.getElementById('table-body').innerHTML =
            `<tr style="opacity:1;animation:none"><td colspan="4" style="text-align:center;color:#ef4444;">
            Données introuvables : lance <b>python export_web.py</b> puis recharge la page.</td></tr>`;
        return;
    }
    AV.demarrer();
});
