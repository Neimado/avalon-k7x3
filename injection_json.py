"""
Injection des nouveaux scores dans la base d'Avalon.

Utilisation : coller le JSON fourni par le "Parseur" dans donnees_propres.json,
puis lancer :  python injection_json.py
"""
import sqlite3
import json
import os
import re
import shutil
import sys
import unicodedata
from datetime import datetime, date

# Toujours travailler dans le dossier du script (marche aussi depuis un autre dossier)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

FICHIER_JSON = 'donnees_propres.json'
BASE = 'avalon_data.db'
DOSSIER_SAUVEGARDES = 'sauvegardes'
DOSSIER_ARCHIVES = 'archives_json'
NB_SAUVEGARDES = 10
SAUT_SUSPECT = 150          # un saut de plus de 150 places est signalé (juste un avertissement)


def fatal(message):
    print(f"ERREUR : {message}")
    sys.exit(1)


def nettoyer_pseudo(brut):
    """Garde uniquement le nom principal : sans titre, tag [GUILDE], accents, espaces ni emojis."""
    p = str(brut).split('|')[0]
    p = re.sub(r'\[.*?\]', '', p)
    p = unicodedata.normalize('NFD', p)
    p = ''.join(c for c in p if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^A-Za-z0-9_\-]', '', p)


# ---------- 1. Lecture du fichier JSON ----------
if not os.path.exists(FICHIER_JSON):
    fatal(f"{FICHIER_JSON} est introuvable. N'oublie pas d'y coller le resultat du Parseur.")

try:
    with open(FICHIER_JSON, 'r', encoding='utf-8-sig') as f:
        donnees = json.load(f)
except json.JSONDecodeError as e:
    fatal(f"{FICHIER_JSON} n'est pas un JSON valide (ligne {e.lineno}). "
          "Verifie que tu as copie uniquement le bloc de code, du premier [ au dernier ].")

if not isinstance(donnees, list):
    fatal("Le JSON doit etre une liste [ {...}, {...} ].")
if not donnees:
    fatal("Le JSON est vide : aucun score a ajouter.")

# ---------- 2. Base de donnees (creee si besoin) + sauvegarde ----------
base_existait = os.path.exists(BASE) and os.path.getsize(BASE) > 0
if base_existait:
    os.makedirs(DOSSIER_SAUVEGARDES, exist_ok=True)
    nom = datetime.now().strftime('avalon_data_%Y-%m-%d_%H%M%S.db')
    shutil.copy2(BASE, os.path.join(DOSSIER_SAUVEGARDES, nom))
    anciennes = sorted(os.listdir(DOSSIER_SAUVEGARDES))
    for vieux in anciennes[:-NB_SAUVEGARDES]:
        os.remove(os.path.join(DOSSIER_SAUVEGARDES, vieux))

conn = sqlite3.connect(BASE)
cur = conn.cursor()
cur.execute('''
    CREATE TABLE IF NOT EXISTS classements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL,
        rang INTEGER NOT NULL,
        date_enregistrement DATE NOT NULL
    )
''')

cur.execute('SELECT DISTINCT pseudo FROM classements')
connus = {p.lower(): p for (p,) in cur.fetchall()}     # "shin" -> "Shin"

# ---------- 3. Verification et nettoyage des entrees ----------
aujourdhui = date.today()
retenus = {}                 # (pseudo, date) -> rang   (le dernier de la liste gagne)
nouveaux_pseudos = set()
rejets = []
nb_doublons = 0

for i, entree in enumerate(donnees, start=1):
    try:
        brut_pseudo = entree['pseudo']
        brut_date = str(entree['date']).strip()
        rang = int(str(entree['rang']).replace('#', '').strip())
    except (KeyError, TypeError, ValueError):
        rejets.append(f"entree n.{i} illisible : {entree}")
        continue

    try:
        d = datetime.strptime(brut_date, '%Y-%m-%d').date()
    except ValueError:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : date invalide '{brut_date}' (format attendu AAAA-MM-JJ)")
        continue
    if d > aujourdhui:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : date dans le futur ({brut_date}). "
                      "Verifie la date du jour donnee au Parseur.")
        continue
    if rang <= 0:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : rang invalide ({rang})")
        continue

    pseudo = nettoyer_pseudo(brut_pseudo)
    if not pseudo:
        rejets.append(f"entree n.{i} : pseudo illisible '{brut_pseudo}'")
        continue
    if pseudo != str(brut_pseudo).strip():
        print(f"Pseudo nettoye : '{brut_pseudo}' -> '{pseudo}'")
    if pseudo.lower() in connus:
        pseudo = connus[pseudo.lower()]                 # meme orthographe que dans la base
    else:
        nouveaux_pseudos.add(pseudo)

    cle = (pseudo, brut_date)
    if cle in retenus:
        nb_doublons += 1
    retenus[cle] = rang

# ---------- 4. Ecriture ----------
ajoutes, modifies, inchanges = 0, 0, 0
avertissements = []

for (pseudo, jour), rang in sorted(retenus.items(), key=lambda x: (x[0][1], x[0][0])):
    cur.execute('SELECT id, rang FROM classements WHERE pseudo = ? AND date_enregistrement = ?', (pseudo, jour))
    ligne = cur.fetchone()

    cur.execute('''SELECT rang FROM classements WHERE pseudo = ? AND date_enregistrement < ?
                   ORDER BY date_enregistrement DESC LIMIT 1''', (pseudo, jour))
    avant = cur.fetchone()
    if avant and abs(avant[0] - rang) > SAUT_SUSPECT:
        avertissements.append(f"{pseudo} : #{avant[0]} -> #{rang} le {jour} (gros saut, a verifier)")

    if ligne is None:
        cur.execute('INSERT INTO classements (pseudo, rang, date_enregistrement) VALUES (?, ?, ?)',
                    (pseudo, rang, jour))
        ajoutes += 1
    elif ligne[1] != rang:
        cur.execute('UPDATE classements SET rang = ? WHERE id = ?', (rang, ligne[0]))
        modifies += 1
        print(f"Corrige : {pseudo} le {jour} : #{ligne[1]} -> #{rang}")
    else:
        inchanges += 1

conn.commit()
conn.close()

# ---------- 5. Archive du JSON (pour pouvoir tout reconstruire un jour) ----------
os.makedirs(DOSSIER_ARCHIVES, exist_ok=True)
shutil.copy2(FICHIER_JSON, os.path.join(DOSSIER_ARCHIVES, datetime.now().strftime('donnees_%Y-%m-%d_%H%M%S.json')))

# ---------- 6. Bilan ----------
print()
print(f"Succes : {ajoutes} ajoute(s), {modifies} corrige(s), {inchanges} deja present(s).")
if nb_doublons:
    print(f"{nb_doublons} doublon(s) le meme jour : seul le dernier score a ete garde.")
if nouveaux_pseudos:
    print("Nouveaux pseudos : " + ", ".join(sorted(nouveaux_pseudos)))
    print("  -> Si l'un d'eux est en fait une faute de frappe d'un membre existant, dis-le moi.")
for a in avertissements:
    print("Attention : " + a)
if rejets:
    print()
    print(f"{len(rejets)} entree(s) ignoree(s) :")
    for r in rejets:
        print("  - " + r)
if ajoutes == 0 and modifies == 0 and not rejets:
    print("(Rien de nouveau : ces scores etaient deja dans la base.)")
