/* Avalon - Guide : fiches d'exécution (1/2). Une fiche par famille de mouvements ; "membres" = noms exacts de l'appli LEVELING: Fitness. */
window.AV.GUIDE_TECH = (window.AV.GUIDE_TECH || []).concat([
{
    id: 'pompes', titre: 'Pompes', icone: 'fa-hand-fist', zone: 'Pectoraux, bras, épaules',
    membres: ['Push-Up', 'Push-Up sur les genoux', 'Push-Up large', 'Push-Up triceps', 'Diamond Push-Up', 'Push-Up alterné', 'Push-Up explosif', 'Push-Up sur avant-bras', 'Hand-Release Push-Up', 'Spider Push-Up', 'Pike Push-Up'],
    cles: ['Mains un peu plus larges que les épaules, sous les épaules, doigts vers l\'avant.', 'Corps en une seule ligne de la tête aux talons : abdos et fessiers serrés.', 'Coudes à environ 45° du corps (pas écartés à 90°).', 'Descends jusqu\'à ce que la poitrine frôle le sol, puis pousse le sol loin de toi.'],
    erreurs: [['Les hanches s\'affaissent ou montent', 'Serre abdos et fessiers comme pour une planche ; si tu ne tiens pas, passe sur les genoux.'], ['Amplitude trop courte', 'Compte seulement les pompes où la poitrine descend près du sol.'], ['Coudes écartés en "T"', 'Rapproche-les vers les côtes : ça protège les épaules.'], ['Tête qui plonge ou nuque cassée', 'Regarde le sol à environ 30 cm devant tes mains.']],
    souffle: 'Inspire en descendant, expire en poussant.',
    debutant: 'Commence sur les genoux ou mains surélevées (table, mur) : mieux vaut 8 pompes propres que 20 bâclées. Arrête la série quand le dos se creuse.',
    veteran: 'Descente lente (3 s), pause 1 s en bas, puis pousse. Varie les appuis plutôt que de seulement ajouter des répétitions.',
    variantes: [['Sur les genoux', 'Ligne droite du genou à la tête, fessiers qui ne reculent pas.'], ['Large', 'Plus de pectoraux ; si les épaules tirent, rapproche les mains.'], ['Triceps / Diamond', 'Coudes près du corps ; échauffe bien les poignets.'], ['Explosif', 'Seulement quand tes pompes classiques sont propres ; réception contrôlée, bras jamais bloqués.'], ['Sur avant-bras', 'Même ligne que la planche, coudes sous les épaules.'], ['Hand-Release', 'Décolle les mains au sol entre chaque répétition : on repart de zéro, plus de rebond.'], ['Spider', 'Genou vers le coude sans que les hanches ne montent.'], ['Pike', 'Hanches hautes en V, la tête passe entre les bras : très orienté épaules.']]
},
{
    id: 'squats', titre: 'Squats', icone: 'fa-person-walking', zone: 'Cuisses, fessiers',
    membres: ['Squat', 'Squat avec haltères', 'Squat avant avec haltères', 'Squat en fente avec haltères', 'Squat et développé au-dessus de la tête', 'Pistol Squat'],
    cles: ['Pieds à largeur d\'épaules (un peu plus si tu es à l\'aise), pointes légèrement ouvertes.', 'Poids réparti sur tout le pied, talons collés au sol.', 'Genoux dans l\'axe des orteils, poitrine haute, dos naturellement droit.', 'Descends au moins jusqu\'aux cuisses parallèles si ta mobilité le permet, puis pousse le sol.'],
    erreurs: [['Les genoux rentrent vers l\'intérieur', 'Pousse les genoux vers l\'extérieur, dans l\'axe des pieds.'], ['Les talons décollent', 'Écarte un peu plus les pieds, ouvre les pointes ; la mobilité de cheville s\'améliore avec le temps.'], ['Le dos s\'arrondit en bas', 'Arrête-toi un peu plus haut : la profondeur propre vaut mieux que la profondeur maximale.'], ['Se pencher en avant', 'Garde la poitrine haute, regard devant.']],
    souffle: 'Inspire en descendant, expire en remontant.',
    debutant: 'Assieds-toi sur une chaise puis relève-toi (squat sur chaise), bras tendus devant pour l\'équilibre.',
    veteran: 'Tempo lent, pause en bas, ou version à une jambe. Ajoute de la charge seulement quand l\'amplitude est constante.',
    variantes: [['Avec haltères', 'Garde-les près du corps, gainage serré.'], ['Squat avant', 'Haltères à hauteur d\'épaules, coudes hauts : le buste reste plus vertical.'], ['Squat et développé', 'Monte les haltères seulement quand tu es debout, sans cambrer le bas du dos.'], ['Pistol Squat', 'Exigeant : travaille d\'abord en t\'aidant d\'un appui, puis assis sur un banc. Pas de douleur au genou.']]
},
{
    id: 'fentes', titre: 'Fentes', icone: 'fa-shoe-prints', zone: 'Cuisses, fessiers, équilibre',
    membres: ['Fente arrière', 'Fente arrière avec haltères', 'Fente arrière avec rotation', 'Fente arrière genou haut', 'Fente statique'],
    cles: ['Pas assez grand pour que les deux genoux fassent environ 90° en bas.', 'Buste droit, regard devant, bassin stable.', 'Genou avant dans l\'axe du pied, poids sur le talon avant.', 'Pousse dans le pied avant pour revenir.'],
    erreurs: [['Pas trop court', 'Écarte un peu plus les pieds ; le talon avant doit rester au sol.'], ['Genou qui rentre', 'Garde-le au-dessus du pied, pense "genou vers le petit orteil".'], ['Perte d\'équilibre', 'Écarte les pieds comme sur deux rails, pas sur une corde raide.'], ['Buste penché', 'Redresse-toi, abdos serrés.']],
    souffle: 'Inspire en descendant, expire en remontant.',
    debutant: 'Fente arrière avec une main sur un mur ou une chaise ; la fente arrière est plus douce pour les genoux que la fente avant.',
    veteran: 'Haltères, ou tempo lent, ou genou haut pour travailler l\'équilibre.',
    variantes: [['Avec rotation', 'Tourne le buste vers la jambe avant, bassin immobile.'], ['Genou haut', 'Remonte le genou arrière devant toi sans te pencher.'], ['Statique', 'Reste en bas pendant le temps demandé, poids réparti, respiration calme.']]
},
{
    id: 'fessiers', titre: 'Ponts et fessiers', icone: 'fa-arrow-up-wide-short', zone: 'Fessiers, arrière des cuisses',
    membres: ['Glute Bridge jambe tendue', 'Glute March', 'Pont fessier avec haltère', 'Pont fessier aux haltères avec extension', 'Bridge unilat. alterné', 'Donkey Kick alterné', 'Donkey Kick jambe tendue', 'Pédalage en élévation', 'Posture du pont'],
    cles: ['Allongé, pieds à plat près des fessiers, largeur de hanches.', 'Pousse dans les talons, monte le bassin jusqu\'à l\'alignement épaules-hanches-genoux.', 'Serre les fessiers 1 seconde en haut, puis redescends lentement.', 'Menton légèrement rentré, nuque détendue.'],
    erreurs: [['Le bas du dos se cambre en haut', 'Monte moins haut et serre les fessiers : le mouvement vient des hanches.'], ['On pousse sur les orteils', 'Reviens sur les talons, tu sentiras mieux les fessiers.'], ['Les genoux s\'écartent', 'Garde-les alignés avec les pieds.'], ['Le bassin tourne (marche, kick)', 'Garde le bassin horizontal, bouge seulement la jambe.']],
    souffle: 'Expire en montant, inspire en descendant.',
    debutant: 'Pont classique, bien lent ; cherche à sentir les fessiers plus que le dos.',
    veteran: 'Une jambe (bridge unilatéral), ou haltère posé sur le bassin (protège-le avec une serviette), pause de 2 s en haut.',
    variantes: [['Glute March', 'Alterne les genoux sans que le bassin ne descende ni ne tourne.'], ['Donkey Kick', 'À quatre pattes, dos neutre : monte le talon vers le plafond sans cambrer.'], ['Pédalage en élévation', 'Mouvement contrôlé, bassin stable.'], ['Posture du pont', 'Maintien : respire calmement, fessiers serrés, aucun pincement dans le dos.']]
},
{
    id: 'mollets', titre: 'Mollets', icone: 'fa-socks', zone: 'Mollets, chevilles',
    membres: ['Élévation des mollets debout', 'Mollet une jambe'],
    cles: ['Debout, appuie-toi d\'une main sur un mur pour l\'équilibre.', 'Monte sur la pointe des pieds le plus haut possible, pause 1 s.', 'Redescends lentement, talons jusqu\'au sol ou légèrement plus bas sur une marche.'],
    erreurs: [['Rebond sans contrôle', 'Monte en 1 s, pause, descends en 2-3 s.'], ['Amplitude courte', 'Va chercher la hauteur maximale à chaque répétition.'], ['Chevilles qui basculent vers l\'extérieur', 'Pousse à travers le gros orteil.']],
    souffle: 'Expire en montant, inspire en descendant.',
    debutant: 'Deux pieds, appui sur un mur ; 2-3 séries de 12 à 15.',
    veteran: 'Une jambe, ou sur une marche pour descendre plus bas ; ajoute de la lenteur avant la charge.',
    variantes: [['Mollet une jambe (étirement)', 'Maintien du talon vers le sol, jambe arrière tendue ; tension agréable, jamais de douleur vive.']]
},
{
    id: 'tirage', titre: 'Tractions et dips', icone: 'fa-grip-lines', zone: 'Dos, biceps, triceps, pectoraux',
    membres: ['Traction', 'Dips', 'Dip inversé', 'Extension des triceps debout avec haltère'],
    cles: ['Traction : prise un peu plus large que les épaules, bras tendus au départ, épaules "vers le bas et l\'arrière".', 'Tire les coudes vers les côtes, menton au-dessus de la barre, descente contrôlée.', 'Dips : épaules basses loin des oreilles, coudes pas trop écartés, descente jusqu\'à environ 90° au coude.', 'Triceps debout : coudes fixes près de la tête, seul l\'avant-bras bouge.'],
    erreurs: [['Se balancer pour monter', 'Serre le corps, jambes ensemble, mouvement propre même si tu en fais moins.'], ['Épaules qui montent aux oreilles', 'Pousse les épaules vers le bas avant de tirer ou de pousser.'], ['Descendre trop bas aux dips', 'Au-delà de 90° les épaules souffrent ; arrête-toi avant si ça pince.'], ['Se laisser tomber dans la descente', 'La descente compte autant que la montée : 2-3 s.']],
    souffle: 'Expire pendant l\'effort (montée ou poussée), inspire en revenant.',
    debutant: 'Traction : descentes lentes depuis le haut (3-5 s) ou avec un élastique. Dips inversés (sur chaise) : hanches proches du banc, petite amplitude.',
    veteran: 'Pauses en haut, tempo lent, prises variées, puis lest. Les dips inversés sont à éviter si tes épaules sont sensibles.',
    variantes: [['Dip inversé', 'Mains derrière sur un banc stable, descends peu, épaules en arrière et basses.'], ['Extension triceps debout', 'Haltère léger, dos neutre, ne cambre pas en poussant.']]
},
{
    id: 'epaules', titre: 'Épaules et bras aux haltères', icone: 'fa-dumbbell', zone: 'Épaules, pectoraux, biceps',
    membres: ['Élévation latérale debout avec haltères', 'Élévation latérale debout, bras fléchis', 'Élévation frontale aux haltères', 'Élévation frontale à un bras avec haltère', 'Triangle Fly debout', 'Croisement de bras', 'Curl biceps debout avec haltères', 'Curl biceps alterné avec haltères', 'Curl marteau avec haltères', 'Curl glissé avec haltères'],
    cles: ['Choisis un poids qui te permet 12 à 15 répétitions propres : l\'ego se range au vestiaire.', 'Mouvement lent et contrôlé, sans élan.', 'Élévations : monte jusqu\'à la hauteur des épaules, pas plus haut.', 'Curls : coudes collés au corps, descends presque bras tendus.'],
    erreurs: [['Balancer le buste pour monter', 'Allège le poids, fixe le dos, serre les abdos.'], ['Hausser les épaules (trapèzes)', 'Garde les épaules basses, pense "épaules loin des oreilles".'], ['Lever les coudes plus haut que les mains', 'Garde les coudes légèrement fléchis, mains au niveau ou sous les coudes.'], ['Descendre en lâchant', 'Redescends en 2-3 secondes.']],
    souffle: 'Expire en soulevant, inspire en redescendant.',
    debutant: 'Commence avec des haltères légers (ou des bouteilles d\'eau) pour apprendre le geste.',
    veteran: 'Pause 1 s en haut, tempo lent, séries unilatérales pour corriger les déséquilibres.',
    variantes: [['Curl marteau', 'Paumes face à face, coudes fixes : travaille aussi l\'avant-bras.'], ['Croisement de bras / Fly', 'Coudes légèrement fléchis, ouvre jusqu\'à sentir un étirement sans descendre sous la ligne des épaules.']]
}
]);
