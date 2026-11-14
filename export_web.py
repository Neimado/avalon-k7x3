import sqlite3
import json
import os
from datetime import datetime, timedelta

# Un membre sans nouveau rang NI nouvelle donnee d'XP / de quetes depuis plus de X jours
# (par rapport a la derniere donnee de la base) passe en "Disparu"
JOURS_INACTIF = 14

# Toujours travailler dans le dossier du script
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('docs', exist_ok=True)

conn = sqlite3.connect('avalon_data.db')
cursor = conn.cursor()


def table_existe(nom):
    cursor.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (nom,))
    return cursor.fetchone() is not None


# ---------- Rangs ----------
rangs = {}      # pseudo -> {date: rang}   (si deux scores le meme jour, le dernier enregistre gagne)
if table_existe('classements'):
    cursor.execute('''
        SELECT pseudo, date_enregistrement, rang
        FROM classements
        ORDER BY pseudo, date_enregistrement ASC, id ASC
    ''')
    for pseudo, date_score, rang in cursor.fetchall():
        rangs.setdefault(pseudo, {})[date_score] = rang

# ---------- XP et quetes (par semaine, clef = lundi de la semaine) ----------
activite = {}   # pseudo -> {"xp": {lundi: valeur}, "quetes": {...}}
if table_existe('activite'):
    cursor.execute('SELECT pseudo, type, semaine, valeur FROM activite ORDER BY semaine ASC')
    for pseudo, genre, semaine, valeur in cursor.fetchall():
        activite.setdefault(pseudo, {"xp": {}, "quetes": {}}).setdefault(genre, {})[semaine] = valeur
conn.close()


def dimanche(lundi):
    d = datetime.strptime(lundi, "%Y-%m-%d") + timedelta(days=6)
    return d.strftime("%Y-%m-%d")


# Derniere date connue pour chaque membre, et derniere date de toute la base
dernieres = {}
for pseudo in set(rangs) | set(activite):
    dates = list(rangs.get(pseudo, {}))
    for genre in ("xp", "quetes"):
        dates += [dimanche(l) for l in activite.get(pseudo, {}).get(genre, {})]
    dernieres[pseudo] = max(dates) if dates else None

dates_toutes = [d for d in dernieres.values() if d]
reference = max(dates_toutes) if dates_toutes else datetime.now().strftime("%Y-%m-%d")
ref_dt = datetime.strptime(reference, "%Y-%m-%d")

joueurs = []
for pseudo in sorted(set(rangs) | set(activite), key=str.lower):
    derniere = dernieres.get(pseudo)
    if not derniere:
        continue
    jours = (ref_dt - datetime.strptime(derniere, "%Y-%m-%d")).days
    act = activite.get(pseudo, {})
    joueurs.append({
        "pseudo": pseudo,
        "actif": jours <= JOURS_INACTIF,
        "derniere_activite": derniere,
        "historique": [{"date": d, "rang": r} for d, r in sorted(rangs.get(pseudo, {}).items())],
        "xp": act.get("xp", {}),
        "quetes": act.get("quetes", {}),
    })

donnees_web = {
    "derniere_mise_a_jour": datetime.now().strftime("%Y-%m-%d %H:%M"),
    "reference": reference,
    "joueurs": joueurs,
}

with open(os.path.join('docs', 'data.json'), 'w', encoding='utf-8') as f:
    json.dump(donnees_web, f, ensure_ascii=False, indent=1)

# Version .js : le site marche meme en double-clic, sans serveur
with open(os.path.join('docs', 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.AVALON_DATA = ' + json.dumps(donnees_web, ensure_ascii=False, separators=(',', ':')) + ';')

actifs = sum(1 for j in joueurs if j["actif"])
nb_rangs = sum(len(j["historique"]) for j in joueurs)
nb_xp = sum(len(j["xp"]) for j in joueurs)
nb_quetes = sum(len(j["quetes"]) for j in joueurs)
print(f"Export reussi : {len(joueurs)} membres ({actifs} actifs), {nb_rangs} rangs, "
      f"{nb_xp} valeurs d'XP, {nb_quetes} valeurs de quetes. docs/data.js et docs/data.json sont a jour.")
