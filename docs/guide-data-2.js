/* Avalon - Guide : nutrition, récupération, régularité, lexique. Contenu général de bon sens ; ne remplace pas un avis médical. */
window.AV.GUIDE_SECTIONS = [
{
    id: 'nutrition', titre: 'Nutrition', icone: 'fa-apple-whole', desc: 'Manger pour s\'entraîner : l\'essentiel, sans régime.',
    fiches: [
        { id: 'proteines', titre: 'Les protéines', icone: 'fa-drumstick-bite', calc: 'proteines',
          intro: 'Elles servent à réparer et construire le muscle. Pour quelqu\'un qui s\'entraîne régulièrement, la position de la société savante ISSN indique 1,4 à 2,0 g par kilo de poids de corps et par jour.',
          points: ['Répartis-les sur la journée : environ 20 à 40 g par repas (0,25 à 0,4 g par kilo) fonctionne bien.', 'Bonnes sources : œufs, volaille, poisson, viande maigre, produits laitiers (skyr, fromage blanc), tofu, légumineuses, flocons d\'avoine, noix.', 'Plusieurs repas avec des protéines valent mieux qu\'un seul gros repas.', 'Pas besoin de poudre : les compléments sont un confort, pas une obligation.'],
          attention: ['Pour une personne en bonne santé, ces apports sont considérés comme sûrs. En cas de maladie des reins ou de traitement, demande l\'avis d\'un médecin.'] },
        { id: 'glucides', titre: 'Les glucides, ton carburant', icone: 'fa-bread-slice',
          intro: 'Ce sont la principale source d\'énergie des séances intenses et de la course. Ils aident aussi à bien récupérer.',
          points: ['Féculents de base : riz, pâtes, pommes de terre, pain complet, flocons d\'avoine, légumineuses, fruits.', 'Un repas riche en glucides 2 à 3 heures avant une grosse séance donne de l\'énergie.', 'Après la séance, associe glucides et protéines pour bien récupérer.', 'Mange assez de glucides les jours d\'entraînement : se sentir vidé vient souvent d\'un manque d\'énergie, pas de faiblesse.'],
          attention: [] },
        { id: 'lipides', titre: 'Les bons gras', icone: 'fa-fish',
          intro: 'Les lipides sont indispensables (hormones, vitamines, santé du cœur). Ce n\'est pas un ennemi.',
          points: ['Privilégie : huile d\'olive ou de colza, poissons gras (sardine, maquereau, saumon), noix, amandes, avocat.', 'Limite les fritures et les produits ultra-transformés au quotidien, sans les interdire.', 'Évite un repas très gras juste avant la séance : la digestion est plus lente.'],
          attention: [] },
        { id: 'hydratation', titre: 'Hydratation', icone: 'fa-glass-water', calc: 'eau',
          intro: 'Une petite déshydratation fatigue et fait baisser les performances. Boire régulièrement est simple et efficace.',
          points: ['Repère général : une urine claire, jaune pâle, indique que tu bois assez.', 'Bois par petites gorgées avant, pendant les séances longues, et après.', 'Quand il fait chaud ou que tu transpires beaucoup, bois plus.', 'L\'eau suffit pour la plupart des séances de moins d\'une heure.'],
          attention: ['Boire des litres d\'un coup n\'est pas utile. Si tu as des maux de tête, des vertiges ou des nausées pendant l\'effort, arrête-toi et repose-toi.'] },
        { id: 'avant-apres', titre: 'Avant et après la séance', icone: 'fa-utensils',
          intro: 'Pas besoin de protocole compliqué : vise la simplicité.',
          points: ['Avant : un repas 2 à 3 heures avant, ou une collation légère 30 à 60 minutes avant (banane, yaourt, tartine de pain complet).', 'Évite beaucoup de fibres et de gras juste avant l\'effort pour ne pas avoir mal au ventre.', 'Après : un repas ou une collation avec protéines et glucides dans les heures qui suivent suffit.', 'Il n\'existe pas de "fenêtre de 30 minutes" obligatoire : l\'important est la journée complète.'],
          attention: [] },
        { id: 'assiette', titre: 'L\'assiette type', icone: 'fa-plate-wheat',
          intro: 'Un repère visuel simple pour les repas principaux.',
          points: ['La moitié : légumes (cuits ou crus).', 'Un quart : féculents (riz, pâtes, pommes de terre, pain).', 'Un quart : protéines (œufs, poisson, volaille, légumineuses, tofu).', 'Un peu de bon gras (huile d\'olive, noix) et un fruit.', 'Mange à ta faim, à des heures régulières : sauter des repas en espérant "perdre" du temps est rarement une bonne idée.'],
          attention: [] },
        { id: 'budget', titre: 'Manger bien avec peu de budget', icone: 'fa-piggy-bank',
          intro: 'Les aliments les plus utiles pour le sport sont souvent les moins chers.',
          points: ['Œufs, thon et sardines en boîte, fromage blanc, lait.', 'Légumineuses (lentilles, pois chiches, haricots) : protéines, glucides et fibres pour presque rien.', 'Flocons d\'avoine, riz, pâtes, pommes de terre.', 'Légumes surgelés : aussi nutritifs que frais, et pratiques.', 'Cuisine en grande quantité et garde des portions pour la semaine.'],
          attention: [] },
        { id: 'mythes', titre: 'Mythes courants', icone: 'fa-circle-question',
          intro: 'Quelques idées reçues qui reviennent tout le temps.',
          points: ['"Les protéines abîment les reins" : chez une personne en bonne santé, les apports courants des sportifs sont considérés comme sûrs.', '"Il faut manger toutes les 2 heures" : le rythme dépend de ton emploi du temps, pas d\'une règle magique.', '"Transpirer fait fondre la graisse" : la sueur est de l\'eau, qui revient quand tu bois.', '"Sans compléments, pas de progrès" : l\'alimentation de tous les jours, le sommeil et la régularité font l\'essentiel.', '"Je dois manger le moins possible" : manger trop peu fatigue, freine la récupération et les progrès.'],
          attention: ['Si ton rapport à l\'alimentation te pose problème (culpabilité, restrictions, compulsions), parles-en à un médecin ou un professionnel : ce n\'est pas un échec de volonté, et ça se soigne.'] }
    ]
},
{
    id: 'recuperation', titre: 'Récupération', icone: 'fa-bed', desc: 'Progresser, c\'est aussi bien se reposer.',
    fiches: [
        { id: 'sommeil', titre: 'Le sommeil', icone: 'fa-moon',
          intro: 'C\'est la meilleure récupération gratuite : le corps répare les muscles et recharge l\'énergie pendant la nuit.',
          points: ['Adultes : 7 à 9 heures par nuit. Adolescents : 8 à 10 heures.', 'Couche-toi et lève-toi à des heures proches, même le week-end.', 'Écrans éteints 30 à 60 minutes avant le coucher si tu peux.', 'Chambre fraîche, sombre, calme ; limite la caféine après le milieu d\'après-midi.', 'Après une mauvaise nuit, allège la séance plutôt que de forcer.'],
          attention: [] },
        { id: 'echauffement', titre: 'L\'échauffement', icone: 'fa-fire-flame-simple',
          intro: '5 à 10 minutes pour préparer le corps : moins de risques de blessure et de meilleures premières séries.',
          points: ['Commence par augmenter la chaleur : marche rapide, jumping jacks lents, corde, 2 à 3 minutes.', 'Mobilise les articulations utiles : cercles de bras, cercles de hanche, poignets, nuque (lentement).', 'Fais quelques répétitions légères du premier exercice de la séance.', 'Les longs étirements passifs, mieux vaut les garder pour la fin ou un moment calme.'],
          attention: [] },
        { id: 'jours-repos', titre: 'Jours de repos', icone: 'fa-calendar-check',
          intro: 'Le muscle se construit pendant le repos, pas pendant la séance.',
          points: ['Laisse environ 48 heures de repos à un même groupe musculaire après une séance intense.', 'Prévois au moins 1 à 2 jours plus légers ou sans entraînement par semaine.', 'Un jour de repos n\'est pas un jour perdu : marche, mobilité ou étirements doux sont possibles.', 'Fatigue qui s\'accumule, performances qui baissent, humeur en baisse : ajoute un jour de repos.'],
          attention: [] },
        { id: 'courbatures', titre: 'Courbatures ou douleur ?', icone: 'fa-triangle-exclamation',
          intro: 'Savoir faire la différence te protège.',
          points: ['Courbatures : douleur diffuse, des deux côtés, qui apparaît 24 à 72 heures après un nouvel effort et diminue en quelques jours. C\'est normal.', 'Douleur à surveiller : vive, localisée, qui apparaît pendant l\'effort, souvent dans une articulation (genou, épaule, coude, poignet).', 'Dans ce cas : arrête le mouvement, vérifie ta technique, allège ou change d\'exercice.', 'Si la douleur dure plus d\'une semaine, ou s\'il y a gonflement, engourdissement ou perte de force, consulte un professionnel de santé.'],
          attention: ['Douleur dans la poitrine, essoufflement anormal, vertiges ou malaise pendant l\'effort : arrête immédiatement et demande un avis médical.'] },
        { id: 'progressivite', titre: 'Progresser sans se blesser', icone: 'fa-stairs',
          intro: 'La régularité bat l\'intensité. Les blessures viennent surtout d\'une augmentation trop rapide.',
          points: ['Augmente peu à la fois : une répétition ou une série de plus, pas le double.', 'Quand la forme se dégrade, la série est terminée.', 'Change une seule chose à la fois : charge, volume ou difficulté de l\'exercice.', 'Un travail varié (poussée, traction, jambes, gainage) équilibre le corps et protège les articulations.'],
          attention: [] },
        { id: 'reprise', titre: 'Reprendre après une pause', icone: 'fa-rotate-left',
          intro: 'Maladie, vacances, semaine chargée : ça arrive à tout le monde.',
          points: ['Ne reprends pas là où tu t\'étais arrêté : vise environ 60 à 70 % de ton ancien volume la première semaine.', 'Réveille d\'abord le corps avec des séances courtes et propres.', 'Après une maladie, attends la disparition de la fièvre et reprends progressivement ; en cas de doute, demande un avis médical.', 'Une pause n\'efface pas tout : le corps retrouve ses acquis plus vite qu\'il ne les a construits.'],
          attention: [] }
    ]
},
{
    id: 'regularite', titre: 'Régularité et mental', icone: 'fa-brain', desc: 'Tenir ses quêtes jour après jour.',
    fiches: [
        { id: 'version-minimale', titre: 'La version minimale', icone: 'fa-hourglass-start',
          intro: 'Les jours sans énergie, ne cherche pas la séance parfaite : cherche la séance faisable.',
          points: ['Fixe-toi une version minimale de 5 minutes (par exemple 1 série de chaque exercice de la quête).', 'Commence : une fois lancé, on continue souvent plus longtemps que prévu.', 'Même si tu t\'arrêtes à 5 minutes, ça compte : tu gardes l\'habitude.'],
          attention: [] },
        { id: 'habitude', titre: 'Construire l\'habitude', icone: 'fa-link',
          intro: 'L\'habitude s\'installe quand elle devient automatique.',
          points: ['Choisis un moment fixe (après le réveil, après les cours, avant la douche).', 'Rattache-la à un geste existant : "après le café, je fais ma quête".', 'Prépare la veille : tenue, tapis, bouteille d\'eau.', 'Évite de rater deux jours de suite : un jour manqué n\'est rien, deux commencent une habitude inverse.'],
          attention: [] },
        { id: 'progres', titre: 'Mesurer ses progrès', icone: 'fa-chart-line',
          intro: 'Le vrai point de comparaison, c\'est toi il y a un mois.',
          points: ['Note quelques repères : nombre de pompes propres, durée de planche, sensations.', 'Compare-toi à toi-même, pas aux autres : chacun part d\'un point différent.', 'Prends une photo ou une note tous les mois : on voit rarement le changement au quotidien.', 'Célèbre les petites victoires : première traction, planche de 1 minute, semaine complète.'],
          attention: [] },
        { id: 'guilde', titre: 'Avancer en guilde', icone: 'fa-people-group',
          intro: 'S\'entraîner avec d\'autres rend la régularité plus facile.',
          points: ['Partage tes victoires dans le salon : les encouragements motivent tout le monde.', 'Ne te compare pas au top du classement : regarde ta propre progression sur ta page profil.', 'Les débutants comme les vétérans ont leur place : chaque quête validée fait avancer la guilde.', 'Demande conseil quand tu bloques : les anciens ont tous connu les mêmes difficultés.'],
          attention: [] }
    ]
}
];

window.AV.GUIDE_LEXIQUE = [
    ['Répétition (rép)', 'Un mouvement complet d\'un exercice (une descente + une montée de pompe, par exemple).'],
    ['Série', 'Un groupe de répétitions faites d\'affilée, suivi d\'un repos.'],
    ['Repos', 'Le temps de pause entre deux séries ; 30 à 90 s selon l\'exercice et ton niveau.'],
    ['Amplitude', 'La distance parcourue par le mouvement. Une amplitude complète fait mieux travailler le muscle.'],
    ['Tempo', 'La vitesse du mouvement, par exemple 3 s pour descendre, 1 s pour monter.'],
    ['Gainage', 'Maintien d\'une position stable en contractant les muscles du tronc (planche).'],
    ['Isométrique', 'Effort sans mouvement : on tient une position (planche, fente statique).'],
    ['Concentrique / excentrique', 'La phase où le muscle se raccourcit (monter) / s\'allonge sous contrôle (descendre).'],
    ['Unilatéral', 'Exercice fait avec un seul côté à la fois (une jambe, un bras).'],
    ['Surcharge progressive', 'Augmenter peu à peu la difficulté (répétitions, lenteur, charge, variante) pour continuer à progresser.'],
    ['AMRAP', 'As Many Reps As Possible : un maximum de répétitions dans un temps donné, en gardant une bonne forme.'],
    ['EMOM', 'Every Minute On the Minute : une tâche au début de chaque minute, le temps restant sert de repos.'],
    ['HIIT / Tabata', 'Entraînement par intervalles : efforts courts et intenses suivis de pauses courtes (Tabata : 20 s d\'effort, 10 s de repos).'],
    ['RPE (effort perçu)', 'Note de 1 à 10 de la difficulté ressentie. RPE 8 = il t\'en restait environ 2 répétitions.'],
    ['Courbatures (DOMS)', 'Douleur musculaire diffuse 24 à 72 h après un effort inhabituel ; normale et temporaire.'],
    ['Échauffement', 'Préparation du corps avant l\'effort (chaleur, mobilité, répétitions légères).'],
    ['Mobilité', 'Capacité de bouger librement une articulation sur toute son amplitude.'],
    ['Allure conversationnelle', 'Vitesse de course à laquelle tu peux encore parler par phrases courtes.']
];

window.AV.GUIDE_SOURCES = [
    ['ISSN, position sur les protéines et l\'exercice (2017)', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5477153/'],
    ['Tom\'s Guide : erreurs courantes aux pompes', 'https://www.tomsguide.com/wellness/fitness/im-a-personal-trainer-these-are-the-3-most-common-push-up-mistakes-i-see-and-how-to-fix-them']
];
