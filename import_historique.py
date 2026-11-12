import sqlite3

# L'historique trié et nettoyé
historique = {
    "2026-09-29": ["2 Shin", "604 Hayasa", "109 Tylou", "128 Ken", "481 Zounnlin", "190 Lukaz"],
    "2026-10-04": ["100 Ken", "163 BeteDuGevandan", "102 Tylou", "220 Lukaz", "8 Comete", "486 Hayasa", "3 Shin"],
    "2026-10-12": ["82 Tylou", "382 Hayasa", "230 Lukaz", "1 Shin", "70 Ken", "201 Neimado", "153 BeteDuGevandan", "434 Zounnlin"],
    "2026-10-18": ["332 Hayasa", "1 Shin", "56 Ken", "80 Tylou", "157 BeteDuGevandan", "437 Zounnlin", "235 Lukaz", "59 Titou"],
    "2026-10-25": ["71 Ken", "293 Hayasa", "414 Zounnlin", "152 Neimado", "226 Lukaz", "77 Tylou", "174 BeteDuGevandan", "1 Shin", "55 Titou"],
    "2026-11-01": ["215 Lukaz", "67 Ken", "66 Tylou", "65 Titou", "264 Hayasa", "150 Neimado", "398 Zounnlin"],
    "2026-11-10": ["145 Neimado", "243 Hayasa", "79 Tylou"]
}

conn = sqlite3.connect('avalon_data.db')
cursor = conn.cursor()

# AJOUT CRUCIAL : On force la création de la table si elle a été oubliée
cursor.execute('''
CREATE TABLE IF NOT EXISTS classements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT NOT NULL,
    rang INTEGER NOT NULL,
    date_enregistrement DATE NOT NULL
)
''')

compt = 0
for date_score, scores in historique.items():
    for ligne in scores:
        rang, pseudo = ligne.split(" ")
        cursor.execute('''
            INSERT INTO classements (pseudo, rang, date_enregistrement)
            VALUES (?, ?, ?)
        ''', (pseudo, int(rang), date_score))
        compt += 1

conn.commit()
conn.close()
print(f"Succès total ! La table a été créée et {compt} scores historiques ont été injectés.")