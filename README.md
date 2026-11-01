# 🏝️ Île Paradis (nom provisoire)

Un petit jeu de gestion d'île, jouable dans le navigateur et sur mobile.
Tu récoltes, tu construis, tu accueilles des habitants, tu votes des règles de vie
et ton **shérif à cheval** patrouille pour les faire respecter.

## Lancer le jeu

Aucune dépendance, aucun build : ouvre simplement `index.html` dans un navigateur.

```bash
# ou, pour tester sur ton téléphone sur le même Wi-Fi :
python3 -m http.server 8000      # puis http://<ip-de-ton-pc>:8000
```

La partie est sauvegardée automatiquement dans le navigateur (`localStorage`).
« Habitants → Nouvelle partie » remet tout à zéro.

## La boucle de jeu

| Étape | Dans le prototype |
|---|---|
| **Récolter** | Touche les 🌲 (bois), 🪨 (pierre) et les remous 🐟 (poisson). Chaque ressource s'épuise après 3-4 récoltes (1-2 unités par toucher) et repousse en 40 s. Les habitants ramassent aussi du bois/pierre tout seuls, lentement. |
| **Construire** | 5 bâtiments : 🏠 Maison, 🌾 Ferme, ⚓ Port (au bord de l'eau), 🏪 Marché, 🏛️ Mairie (unique). Menu « Construire », puis touche une case verte. Chaque exemplaire supplémentaire d'un même bâtiment coûte **30 % de plus**. |
| **Accueillir** | Quand il reste de la place, un bateau ⛵ accoste. Touche-le pour accueillir un habitant : 🎣 Pêcheur, 🧑‍🌾 Fermier ou 💼 Marchand. Il double la production du bâtiment qui lui correspond. |
| **Voter** | À l'Assemblée (Mairie), propose une règle : 💰 Impôts, 🎉 Fêtes, 🤝 Entraide. Les habitants votent à la majorité, selon leur métier et leur humeur. |
| **Faire respecter** | Le shérif 🐎 fait sa tournée des bâtiments : c'est lui qui **collecte les impôts** et qui règle les incidents qu'il croise. |

### Le shérif et les incidents

Toutes les 40-70 s environ, un incident éclate :

- 🦹 **Vol** : un voleur dérobe des ressources toutes les 5 s dans un bâtiment.
  Choix : ⛓️ Prison (récupère tout, bonheur −3) ou 🤝 Pardon (récupère la moitié, bonheur +5).
- 💢 **Dispute** entre deux habitants.
  Choix : 🕊️ Médiation (bonheur +6) ou 💰 Amende (+8 🪙, bonheur −4).

Touche l'icône : le shérif galope sur place et te laisse trancher. Si tu ne fais rien,
il peut l'attraper pendant sa tournée (résolution « par défaut », moins avantageuse) ;
au bout de 45 s l'incident dégénère et le bonheur chute.

### Le bonheur

Il tend vers un total visible dans « Habitants » : base 45, +15 si tout le monde mange,
+18 pendant une fête, +8 avec l'entraide, −15 avec les impôts, −8 par incident en cours,
−25 en cas de famine. Sous 40, plus aucun bateau n'accoste ; sous 30, la production baisse ;
au-dessus de 75, elle augmente.

## Équilibrage (simulé par un bot, 6 parties × 20-30 min)

Un bot qui joue comme un humain (≈1,4 toucher/s, réagit en 3-6 s) a servi à régler le rythme.
Avant : tout le jeu était construit en 46 s, 4 300 bois s'accumulaient sans usage, jamais de faim.
Après (médianes) :

| Jalon | Avant | Après |
|---|---|---|
| Port fini | 15 s | 35 s |
| 2 habitants | 25 s | 38 s |
| Marché fini | 36 s | 80 s |
| 8 habitants | 265 s | 310 s |
| Mairie finie / 1er vote | 46 s | 282 s |

Réglages : coûts et durées de construction ×1,5 à ×3, coût +30 % par exemplaire, départ plus serré,
récolte 1-2 par toucher (au lieu de 2-3), repousse 40 s, cueillette passive des habitants ÷2,
fête = 1 nourriture par habitant (4 minimum) au lieu de 4 fixes, impôts un peu moins rejetés.
**Reste à vérifier avec de vrais joueurs** : la fin de partie (après ~10 min, 16 habitants et plus rien à
acheter), la faim (le bot pêche volontiers) et le poids réel des impôts.

## Monétisation (prévue, simulée dans le prototype)

- **Pubs récompensées**, toujours facultatives :
  - 📺 *Doubler une récolte* : bouton visible pendant 8 s après chaque récolte.
  - 📺 *Accélérer une construction* : touche un chantier.
- **Cosmétiques** : l'écurie (🐎 → 🦓 → 🦄) donne un aperçu des skins de cheval.
  Décors et skins de bâtiments suivront.
- **Pas de pay-to-win** : aucun achat ne touche à l'économie ni aux règles.

Les pubs sont simulées par `Ads.show(reason, onReward)` dans `game.js` (compte à rebours de 3 s).
Pour brancher une vraie régie (AdMob, Google H5 Games Ads…), remplace le corps de cette fonction
et appelle `onReward()` uniquement quand la pub a été regardée en entier.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure : HUD, scène, barre d'actions, fenêtres |
| `style.css` | Mise en page mobile d'abord, fenêtres en « bottom sheet » |
| `game.js` | Tout le jeu : données, carte, simulation, rendu canvas, interface |
| `inde/` | Version Inde simplifiée (`index.html`, `style.css`, `game.js`) |

Les valeurs d'équilibrage (coûts, durées, rythme de production, probabilités de vote)
sont regroupées en haut de `game.js`, section **DONNÉES**.
La carte est générée à partir de `SEED` : change-le pour obtenir une autre île.

## Tester / déboguer

`window.__ile` expose l'état (`__ile.state`) et quelques fonctions dans la console,
par exemple `__ile.spawnIncident('vol')`, `__ile.spawnArrival()` ou `__ile.update(60)`
pour avancer le temps. Les emojis dépendent de la police du système (Apple, Google, Microsoft).

## Version Inde : `inde/` (गाँव बाज़ार / Village Bazaar)

Version volontairement **plus simple et plus légère**, pensée pour les téléphones d'entrée de gamme
et des sessions courtes : `inde/index.html` (français par défaut, hindi et anglais dans ⚙️ Réglages).

| Île Paradis | Village Bazaar |
|---|---|
| Vote, bonheur, faim, métiers, bateaux | Supprimés : les habitants arrivent seuls et occupent un poste (×2) |
| Shérif + incidents à arbitrer | **Mini-jeu du Kotwal** : un voleur 🦹 apparaît et bouge, touche-le en 9 s (combo jusqu'à ×2) |
| 5 bâtiments | Maison, Champ, Chaï, Bazar, Temple (+20 % de revenu, 3 max) |
| — | **Récompense quotidienne** sur 7 jours (série qui se remet à 1 si on rate un jour), jour 7 = gros lot + festival offert |
| — | **Gains hors-ligne** : jusqu'à 2 h à 50 % de rendement, doublables avec une pub |
| — | **Festival 🎆** (×2 pendant 30 s, recharge 150 s), instantané avec une pub |
| — | **Améliorations** : champ, chaï et bazar montent jusqu'au niveau 10 (+50 % de revenu par niveau) |
| 🐎 🦓 🦄 | Le Kotwal monte un 🐎, 🐘 ou 🐪 (cosmétique, sans effet) |

Pubs récompensées (toutes facultatives et simulées par `Ads.show`) : doubler une récolte, finir un chantier,
lancer un festival, doubler le gain hors-ligne, doubler la récompense quotidienne.
Aucun paiement n'est branché ; les achats UPI (₹10-49) restent à concevoir.

Simulation (bot, 1,4 toucher/s) : champ à 15 s, chaï à 80 s, bazar à 136 s, 1er temple à 196 s, 10 habitants à ~5 min,
tout construit vers 6 min, puis les améliorations prennent le relais (≈2 h pour s'approcher du niveau 9 partout).
Un joueur presque passif (0,25 toucher/s) a 1,5 à 2× de retard sur les jalons : la partie reste jouable sans taper.
À régler avec de vrais joueurs : le bois/pierre devient le facteur limitant en fin de partie, les pièces s'accumulent.

Tests : `window.__gb` expose l'état et des fonctions (`__gb.update(60)`, `__gb.spawnThief()`, `__gb.upgrade(b)`…).

## Pistes pour la suite

- Plus d'îles, de bâtiments et de métiers ; événements saisonniers.
- Règles plus riches (couvre-feu, taxes par bâtiment, élection du shérif) et débats entre habitants.
- Sons, vibrations, tutoriel guidé, PWA installable hors-ligne.
- Vrai SDK de pubs récompensées et boutique de cosmétiques.
- Mode coopératif / îles voisines pour renforcer l'entraide entre joueurs.
