"""
Reconstruit avalon_data.db a partir de docs/data.json (le site en ligne contient toutes les donnees).
A utiliser si ton PC est perdu ou si la base est abimee :
  1. telecharge le depot GitHub (Code > Download ZIP) et dezippe-le
  2. double-clic sur restaurer_base.bat (ou : python restaurer_base.py)
Si une base existe deja, elle est mise de cote (avalon_data_ancienne_...db), jamais ecrasee.
"""
import json, os, shutil, sqlite3, sys
from datetime import datetime

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SRC, BASE = os.path.join('docs', 'data.json'), 'avalon_data.db'
if not os.path.exists(SRC):
    print("ERREUR : docs/data.json est introuvable."); sys.exit(1)
d = json.load(open(SRC, encoding='utf-8'))
if os.path.exists(BASE):
    ancien = datetime.now().strftime('avalon_data_ancienne_%Y-%m-%d_%H%M%S.db')
    shutil.move(BASE, ancien); print(f"Ancienne base mise de cote : {ancien}")
conn = sqlite3.connect(BASE); cur = conn.cursor()
cur.execute('CREATE TABLE classements (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudo TEXT NOT NULL, rang INTEGER NOT NULL, date_enregistrement DATE NOT NULL)')
cur.execute('CREATE TABLE activite (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudo TEXT NOT NULL, type TEXT NOT NULL, semaine DATE NOT NULL, valeur INTEGER NOT NULL, UNIQUE (pseudo, type, semaine))')
n = [0, 0, 0]
for j in d['joueurs']:
    for h in j['historique']:
        cur.execute('INSERT INTO classements (pseudo, rang, date_enregistrement) VALUES (?, ?, ?)', (j['pseudo'], h['rang'], h['date'])); n[0] += 1
    for t, i in (('xp', 1), ('quetes', 2)):
        for sem, v in j.get(t, {}).items():
            cur.execute('INSERT INTO activite (pseudo, type, semaine, valeur) VALUES (?, ?, ?, ?)', (j['pseudo'], t, sem, v)); n[i] += 1
conn.commit(); conn.close()
print(f"Base reconstruite : {n[0]} rangs, {n[1]} XP, {n[2]} quetes. Tu peux relancer mettre_a_jour.bat.")
