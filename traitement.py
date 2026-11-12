import sqlite3

# Connexion à la base locale (crée le fichier avalon_data.db s'il n'existe pas)
conn = sqlite3.connect('avalon_data.db')
cursor = conn.cursor()

# Création de la table avec une architecture évolutive
cursor.execute('''
CREATE TABLE IF NOT EXISTS classements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT NOT NULL,
    rang INTEGER NOT NULL,
    date_enregistrement DATE NOT NULL
)
''')

conn.commit()
print("Base de données d'Avalon initialisée avec succès.")
conn.close()