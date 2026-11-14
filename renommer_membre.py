"""
Renomme un membre partout dans la base (rangs, XP, quetes).

Utilisation :   python renommer_membre.py "Ancien" "Nouveau"
Exemple      :   python renommer_membre.py "Zounnlin" "Zounnllin"

Si le nouveau nom existe deja, les deux membres sont fusionnes.
Une copie de la base est faite dans le dossier sauvegardes/ avant toute modification.
Pense ensuite a lancer :  python export_web.py
"""
import os
import shutil
import sqlite3
import sys
from datetime import datetime

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if len(sys.argv) != 3:
    print('Utilisation : python renommer_membre.py "Ancien" "Nouveau"')
    sys.exit(1)

ancien, nouveau = sys.argv[1].strip(), sys.argv[2].strip()
if not nouveau or ancien == nouveau:
    print("Rien a faire : les deux noms sont identiques ou vides.")
    sys.exit(1)
if not os.path.exists('avalon_data.db'):
    print("ERREUR : avalon_data.db est introuvable (lance ce script depuis le dossier Avalon_Dashboard).")
    sys.exit(1)

os.makedirs('sauvegardes', exist_ok=True)
shutil.copy2('avalon_data.db', os.path.join('sauvegardes', datetime.now().strftime('avalon_data_%Y-%m-%d_%H%M%S_avant_renommage.db')))

conn = sqlite3.connect('avalon_data.db')
cur = conn.cursor()

# Nom exact trouve dans la base (sans tenir compte des majuscules)
cur.execute('SELECT DISTINCT pseudo FROM classements UNION SELECT DISTINCT pseudo FROM activite')
existants = {p.lower(): p for (p,) in cur.fetchall()}
if ancien.lower() not in existants:
    print(f"ERREUR : aucun membre nomme '{ancien}' dans la base. Noms connus : " + ", ".join(sorted(existants.values(), key=str.lower)))
    sys.exit(1)
ancien = existants[ancien.lower()]
fusion = nouveau.lower() in existants and existants[nouveau.lower()] != ancien
if nouveau.lower() in existants:
    nouveau = existants[nouveau.lower()] if fusion else nouveau

cur.execute('UPDATE classements SET pseudo = ? WHERE pseudo = ?', (nouveau, ancien))
n_rangs = cur.rowcount
# Un seul rang par jour : si la fusion cree des doublons, on garde le plus recent
cur.execute('''DELETE FROM classements WHERE id NOT IN (
                   SELECT MAX(id) FROM classements GROUP BY pseudo, date_enregistrement)''')

cur.execute('UPDATE OR IGNORE activite SET pseudo = ? WHERE pseudo = ?', (nouveau, ancien))
n_act = cur.rowcount
cur.execute('DELETE FROM activite WHERE pseudo = ?', (ancien,))     # lignes en conflit avec le nouveau nom

conn.commit()
conn.close()
print(f"Termine : '{ancien}' -> '{nouveau}' ({n_rangs} rang(s), {n_act} valeur(s) d'XP / de quetes)."
      + (" Les deux membres ont ete fusionnes." if fusion else ""))
print("N'oublie pas de lancer : python export_web.py")
