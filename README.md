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
| **Récolter** | Touche les 🌲 (bois), 🪨 (pierre) et les remous 🐟 (poisson). Chaque ressource s'épuise après 3-4 récoltes et repousse en 25 s. Les habitants ramassent aussi du bois/pierre tout seuls. |
| **Construire** | 5 bâtiments : 🏠 Maison, 🌾 Ferme, ⚓ Port (au bord de l'eau), 🏪 Marché, 🏛️ Mairie (unique). Menu « Construire », puis touche une case verte. |
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

Il tend vers un total visible dans « Habitants » : base 50, +15 si tout le monde mange,
+18 pendant une fête, +8 avec l'entraide, −15 avec les impôts, −8 par incident en cours,
−25 en cas de famine. Sous 40, plus aucun bateau n'accoste ; sous 30, la production baisse ;
au-dessus de 75, elle augmente.

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

Les valeurs d'équilibrage (coûts, durées, rythme de production, probabilités de vote)
sont regroupées en haut de `game.js`, section **DONNÉES**.
La carte est générée à partir de `SEED` : change-le pour obtenir une autre île.

## Tester / déboguer

`window.__ile` expose l'état (`__ile.state`) et quelques fonctions dans la console,
par exemple `__ile.spawnIncident('vol')`, `__ile.spawnArrival()` ou `__ile.update(60)`
pour avancer le temps. Les emojis dépendent de la police du système (Apple, Google, Microsoft).

## Pistes pour la suite

- Plus d'îles, de bâtiments et de métiers ; événements saisonniers.
- Règles plus riches (couvre-feu, taxes par bâtiment, élection du shérif) et débats entre habitants.
- Sons, vibrations, tutoriel guidé, PWA installable hors-ligne.
- Vrai SDK de pubs récompensées et boutique de cosmétiques.
- Mode coopératif / îles voisines pour renforcer l'entraide entre joueurs.
