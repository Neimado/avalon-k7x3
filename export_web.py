import sqlite3
import json
import os
from datetime import datetime

# Un joueur sans nouveau score depuis plus de X jours passe en "Disparu"
JOURS_INACTIF = 14

os.makedirs('docs', exist_ok=True)

conn = sqlite3.connect('avalon_data.db')
cursor = conn.cursor()
cursor.execute('''
    SELECT pseudo, date_enregistrement, rang
    FROM classements
    ORDER BY pseudo, date_enregistrement ASC, id ASC
''')

# Si un joueur a deux scores le même jour, le dernier enregistré gagne
par_joueur = {}
for pseudo, date_score, rang in cursor.fetchall():
    par_joueur.setdefault(pseudo, {})[date_score] = rang
conn.close()

aujourd_hui = datetime.now()
joueurs = []

for pseudo, scores in par_joueur.items():
    historique = [{"date": d, "rang": r} for d, r in sorted(scores.items())]
    if not historique:
        continue

    rang_actuel = historique[-1]["rang"]
    date_dernier = datetime.strptime(historique[-1]["date"], "%Y-%m-%d")

    # Variation = places gagnées (rang 10 -> rang 3 = +7)
    variation = 0
    if len(historique) >= 2:
        variation = historique[-2]["rang"] - rang_actuel

    # Record absolu (le plus petit rang) et sa date
    meilleur = min(historique, key=lambda h: h["rang"])

    # Plus grosse ascension entre deux relevés + plus longue série de progrès
    bond = {"valeur": 0, "date": None}
    serie = 0
    serie_max = 0
    for avant, apres in zip(historique, historique[1:]):
        delta = avant["rang"] - apres["rang"]
        if delta > bond["valeur"]:
            bond = {"valeur": delta, "date": apres["date"]}
        if delta > 0:
            serie += 1
            serie_max = max(serie_max, serie)
        else:
            serie = 0

    jours_depuis = (aujourd_hui - date_dernier).days

    joueurs.append({
        "pseudo": pseudo,
        "rang_actuel": rang_actuel,
        "variation": variation,
        "peak_rank": meilleur["rang"],
        "peak_date": meilleur["date"],
        "actif": jours_depuis <= JOURS_INACTIF,
        "dernier_releve": historique[-1]["date"],
        "nb_releves": len(historique),
        "remontee_totale": historique[0]["rang"] - rang_actuel,
        "bond": bond,
        "serie_max": serie_max,
        "historique": historique
    })

joueurs.sort(key=lambda j: j["rang_actuel"])

# ---------- Panthéon (que du positif) ----------
def record(cle_valeur, getter_date=None):
    candidats = [j for j in joueurs if cle_valeur(j) > 0]
    if not candidats:
        return None
    gagnant = max(candidats, key=cle_valeur)
    return {"pseudo": gagnant["pseudo"], "valeur": cle_valeur(gagnant),
            "date": getter_date(gagnant) if getter_date else None}

pantheon = {
    "sommet": None,
    "bond": record(lambda j: j["bond"]["valeur"], lambda j: j["bond"]["date"]),
    "remontee": record(lambda j: j["remontee_totale"]),
    "serie": record(lambda j: j["serie_max"]),
    "assidu": record(lambda j: j["nb_releves"]),
}
if joueurs:
    top = min(joueurs, key=lambda j: j["peak_rank"])
    pantheon["sommet"] = {"pseudo": top["pseudo"], "valeur": top["peak_rank"],
                          "date": top["peak_date"]}

donnees_web = {
    "derniere_mise_a_jour": aujourd_hui.strftime("%Y-%m-%d %H:%M"),
    "pantheon": pantheon,
    "joueurs": joueurs
}

with open(os.path.join('docs', 'data.json'), 'w', encoding='utf-8') as f:
    json.dump(donnees_web, f, ensure_ascii=False, indent=2)

# Version .js : le site marche même en double-clic, sans serveur
with open(os.path.join('docs', 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.AVALON_DATA = ' + json.dumps(donnees_web, ensure_ascii=False, indent=2) + ';')

actifs = sum(1 for j in joueurs if j["actif"])
print(f"Export réussi : {len(joueurs)} joueurs ({actifs} actifs). docs/data.js et docs/data.json sont à jour.")
