"""
Injection des nouvelles donnees dans la base d'Avalon.

Utilisation : coller le JSON fourni par le "Parseur" dans donnees_propres.json,
puis lancer :  python injection_json.py
(ou, pour un autre fichier :  python injection_json.py mon_fichier.json)

Le JSON peut melanger trois sortes d'entrees :
  {"type": "rang",   "date": "2026-11-15", "pseudo": "Shin", "rang": 1}
  {"type": "xp",     "semaine": "2026-11-08", "pseudo": "Shin", "valeur": 2383}
  {"type": "quetes", "semaine": "2026-11-08", "pseudo": "Shin", "valeur": 17}
"semaine" = n'importe quel jour de la semaine concernee (le dimanche des graphiques de Shin convient).
Une entree d'XP / de quetes peut avoir "role": "precedente" : c'est la semaine d'avant, lue sur la
barre claire du graphique. Elle sert a VERIFIER la base (jamais a l'ecraser).
"""
import sqlite3
import json
import os
import re
import shutil
import sys
import unicodedata
from datetime import datetime, date, timedelta

# Toujours travailler dans le dossier du script (marche aussi depuis un autre dossier)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

FICHIER_JSON = sys.argv[1] if len(sys.argv) > 1 else 'donnees_propres.json'
BASE = 'avalon_data.db'
DOSSIER_SAUVEGARDES = 'sauvegardes'
DOSSIER_ARCHIVES = 'archives_json'
NB_SAUVEGARDES = 10
SAUT_SUSPECT = 150          # un saut de rang de plus de 150 places est signale (simple avertissement)

# Pseudos ecrits differemment selon la source (clef en minuscules -> orthographe a utiliser).
# Ajoute une ligne ici si un membre apparait sous deux noms differents.
ALIAS = {
    'labete': 'BeteDuGevandan',
    'zounnllin': 'Zounnlin',
}

TYPES = {
    'rang': 'rang', 'classement': 'rang',
    'xp': 'xp',
    'quete': 'quetes', 'quetes': 'quetes', 'quest': 'quetes', 'quests': 'quetes',
}
NOM_TYPE = {'rang': 'Rangs', 'xp': 'XP', 'quetes': 'Quetes'}


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


def lundi_de(d):
    return d - timedelta(days=d.weekday())


def jj_mm(d):
    return d.strftime('%d/%m')


# ---------- 1. Lecture du fichier JSON ----------
def rien_a_ajouter(raison):
    print(f"[Info] {raison} -> aucune nouvelle donnee a ajouter, on passe a la suite.")
    sys.exit(0)

if not os.path.exists(FICHIER_JSON):
    rien_a_ajouter(f"{FICHIER_JSON} est introuvable")
with open(FICHIER_JSON, 'r', encoding='utf-8-sig') as f:
    if not f.read().strip():
        rien_a_ajouter(f"{FICHIER_JSON} est vide")

try:
    with open(FICHIER_JSON, 'r', encoding='utf-8-sig') as f:
        donnees = json.load(f)
except json.JSONDecodeError as e:
    fatal(f"{FICHIER_JSON} n'est pas un JSON valide (ligne {e.lineno}). "
          "Verifie que tu as copie uniquement le bloc de code, du premier [ au dernier ].")

if not isinstance(donnees, list):
    fatal("Le JSON doit etre une liste [ {...}, {...} ].")
if not donnees:
    fatal("Le JSON est vide : rien a ajouter.")

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
cur.execute('''
    CREATE TABLE IF NOT EXISTS activite (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL,
        type TEXT NOT NULL,
        semaine DATE NOT NULL,
        valeur INTEGER NOT NULL,
        UNIQUE (pseudo, type, semaine)
    )
''')

connus = {}                                    # "shin" -> "Shin" (rangs ET activite)
for (p,) in cur.execute('SELECT DISTINCT pseudo FROM classements UNION SELECT DISTINCT pseudo FROM activite'):
    connus[p.lower()] = p


def resoudre_pseudo(brut):
    pseudo = nettoyer_pseudo(brut)
    if not pseudo:
        return None, None
    cle = pseudo.lower()
    if cle in ALIAS:
        pseudo = ALIAS[cle]
        cle = pseudo.lower()
    if cle in connus:
        return connus[cle], False
    if pseudo == pseudo.lower() or pseudo == pseudo.upper():
        pseudo = pseudo.capitalize()           # "novha" -> "Novha"
    return pseudo, True


# ---------- 3. Verification et nettoyage des entrees ----------
aujourdhui = date.today()
rangs = {}                   # (pseudo, date) -> rang   (le dernier de la liste gagne)
activite = {}                # (type, pseudo, lundi) -> (valeur, role)
nouveaux_pseudos = set()
rejets = []
doublons = 0

for i, entree in enumerate(donnees, start=1):
    if not isinstance(entree, dict):
        rejets.append(f"entree n.{i} illisible : {entree}")
        continue

    type_brut = str(entree.get('type', '')).strip().lower()
    if not type_brut:
        type_brut = 'rang' if 'rang' in entree else ('xp' if 'xp' in entree else ('quetes' if 'quetes' in entree else ''))
    genre = TYPES.get(type_brut)
    if genre is None:
        rejets.append(f"entree n.{i} : type inconnu ('{type_brut}') : {entree}")
        continue

    brut_pseudo = entree.get('pseudo', '')
    pseudo, est_nouveau = resoudre_pseudo(brut_pseudo)
    if not pseudo:
        rejets.append(f"entree n.{i} : pseudo illisible '{brut_pseudo}'")
        continue
    if pseudo != str(brut_pseudo).strip():
        print(f"Pseudo corrige : '{brut_pseudo}' -> '{pseudo}'")
    if est_nouveau:
        nouveaux_pseudos.add(pseudo)

    if genre == 'rang':
        try:
            brut_date = str(entree['date']).strip()
            rang = int(str(entree['rang']).replace('#', '').strip())
        except (KeyError, TypeError, ValueError):
            rejets.append(f"entree n.{i} ({brut_pseudo}) illisible : {entree}")
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
        if (pseudo, brut_date) in rangs:
            doublons += 1
        rangs[(pseudo, brut_date)] = rang
        continue

    # --- XP / quetes ---
    try:
        brut_sem = str(entree.get('semaine') or entree.get('date')).strip()
        valeur = int(str(entree['valeur']).replace(' ', '').strip())
    except (KeyError, TypeError, ValueError):
        rejets.append(f"entree n.{i} ({brut_pseudo}) illisible : {entree}")
        continue
    try:
        d = datetime.strptime(brut_sem, '%Y-%m-%d').date()
    except ValueError:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : semaine invalide '{brut_sem}' (format attendu AAAA-MM-JJ)")
        continue
    lundi = lundi_de(d)
    if lundi > aujourdhui:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : semaine dans le futur ({brut_sem}). "
                      "Verifie la date du jour donnee au Parseur.")
        continue
    if valeur < 0:
        rejets.append(f"entree n.{i} ({brut_pseudo}) : valeur negative ({valeur})")
        continue
    role = str(entree.get('role', 'courante')).strip().lower()
    role = 'precedente' if role.startswith('prec') else 'courante'
    cle = (genre, pseudo, lundi.isoformat())
    if cle in activite:
        doublons += 1
        if activite[cle][1] == 'courante' and role == 'precedente':
            continue                                    # la lecture "courante" prime sur la barre claire
    activite[cle] = (valeur, role)

# ---------- 4. Ecriture : rangs ----------
bilan = {k: {'ajoutes': 0, 'corriges': 0, 'identiques': 0} for k in ('rang', 'xp', 'quetes')}
avertissements = []
verif = {'concordantes': 0, 'completees': 0, 'differentes': []}

for (pseudo, jour), rang in sorted(rangs.items(), key=lambda x: (x[0][1], x[0][0])):
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
        bilan['rang']['ajoutes'] += 1
    elif ligne[1] != rang:
        cur.execute('UPDATE classements SET rang = ? WHERE id = ?', (rang, ligne[0]))
        bilan['rang']['corriges'] += 1
        print(f"Corrige : {pseudo} le {jour} : rang #{ligne[1]} -> #{rang}")
    else:
        bilan['rang']['identiques'] += 1

# ---------- 5. Ecriture : XP et quetes ----------
for (genre, pseudo, lundi), (valeur, role) in sorted(activite.items(), key=lambda x: (x[0][0], x[0][2], x[0][1])):
    cur.execute('SELECT id, valeur FROM activite WHERE pseudo = ? AND type = ? AND semaine = ?', (pseudo, genre, lundi))
    ligne = cur.fetchone()
    d = datetime.strptime(lundi, '%Y-%m-%d').date()
    libelle = f"{pseudo}, {NOM_TYPE[genre]}, semaine du {jj_mm(d)} au {jj_mm(d + timedelta(days=6))}"

    if role == 'precedente':
        if ligne is None:
            cur.execute('INSERT INTO activite (pseudo, type, semaine, valeur) VALUES (?, ?, ?, ?)',
                        (pseudo, genre, lundi, valeur))
            verif['completees'] += 1
        elif ligne[1] == valeur:
            verif['concordantes'] += 1
        else:
            verif['differentes'].append(f"{libelle} : en base {ligne[1]}, sur l'image {valeur}")
        continue

    if ligne is None:
        cur.execute('INSERT INTO activite (pseudo, type, semaine, valeur) VALUES (?, ?, ?, ?)',
                    (pseudo, genre, lundi, valeur))
        bilan[genre]['ajoutes'] += 1
    elif ligne[1] != valeur:
        cur.execute('UPDATE activite SET valeur = ? WHERE id = ?', (valeur, ligne[0]))
        bilan[genre]['corriges'] += 1
        print(f"Corrige : {libelle} : {ligne[1]} -> {valeur}")
    else:
        bilan[genre]['identiques'] += 1

conn.commit()
conn.close()

# ---------- 6. Archive du JSON (pour pouvoir tout reconstruire un jour) ----------
os.makedirs(DOSSIER_ARCHIVES, exist_ok=True)
shutil.copy2(FICHIER_JSON, os.path.join(DOSSIER_ARCHIVES, datetime.now().strftime('donnees_%Y-%m-%d_%H%M%S.json')))

# ---------- 7. Bilan ----------
print()
rien = True
for genre in ('rang', 'xp', 'quetes'):
    b = bilan[genre]
    if sum(b.values()) == 0:
        continue
    rien = False
    print(f"{NOM_TYPE[genre]} : {b['ajoutes']} ajoute(s), {b['corriges']} corrige(s), {b['identiques']} deja present(s).")
if verif['concordantes'] or verif['completees'] or verif['differentes']:
    rien = False
    print(f"Verification des semaines precedentes : {verif['concordantes']} valeur(s) concordante(s), "
          f"{verif['completees']} completee(s), {len(verif['differentes'])} differente(s).")
    for v in verif['differentes']:
        print("  ATTENTION : " + v + "  (la base n'a PAS ete modifiee, relis le graphique)")
if doublons:
    print(f"{doublons} doublon(s) dans le fichier : seule la derniere valeur a ete gardee.")
if nouveaux_pseudos:
    print("Nouveaux pseudos : " + ", ".join(sorted(nouveaux_pseudos)))
    print("  -> Si l'un d'eux est une faute de frappe d'un membre existant, lance :")
    print("     python renommer_membre.py \"Mauvais\" \"Bon\"")
for a in avertissements:
    print("Attention : " + a)
if rejets:
    print()
    print(f"{len(rejets)} entree(s) ignoree(s) :")
    for r in rejets:
        print("  - " + r)
if rien and not rejets:
    print("(Rien de nouveau : ces donnees etaient deja dans la base.)")
