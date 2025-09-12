# Postmortem – Witchcat (JS13K 2025)

## L’idée / Game Design

Pour cette édition 2025, j’aurais aimé faire un jeu en 3D. Mais, par manque de temps pour m’y préparer avant la jam, j’ai préféré capitaliser sur le moteur créé en 2024, qui me permettait déjà de gérer les assets de façon optimisée.  
Le défi : transformer ce moteur en support d’un petit **open world** au lieu de simples niveaux fixes.

L’idée des **saisons** est venue rapidement : avec mon système, changer les couleurs d’un asset est très simple.  
Zelda *Oracle of Seasons* a été une énorme source d’inspiration. J’ai repris le principe des saisons bloquant/débloquant des chemins, avec mes propres variantes :

- **Hiver** : la neige bloque, mais l’eau gèle et devient praticable.  
- **Automne** : les champignons poussent, et les trous sont recouverts de feuilles.  
- **Été** : les racines bloquent, mais les lianes permettent de grimper.  
- **Printemps** : les fleurs de pierre éclosent et peuvent être détruites.  

Le printemps est la dernière saison débloquée, donc uniquement pensé comme *débloqueur*.  
Un effet de bord est devenu une fonctionnalité : les fleurs détruites disparaissent aussi dans les autres saisons. Cela a ouvert de nouveaux puzzles (notamment pour le chat au sud, le plus complexe).

---

## Gestion des assets / images

Le projet final contient **30 assets différents**, certains animés, soit **57 tiles 16×16px** – énorme pour un jeu de 13 ko.  

J’ai réutilisé un script Node créé l’an dernier. Les images ont max 5 couleurs : blanc (transparent), noir, rouge, vert et bleu. Chaque pixel est encodé en **RLE maison**, avec un caractère représentant jusqu’à 16 pixels consécutifs.  
Exemple :  
- `a` = 1 bleu  
- `b` = 2 bleus  
- `A` = 1 vert  
- `D` = 4 verts  

Pour la carte, j’ai recyclé mon éditeur de niveaux en adaptant l’export : un gros JSON avec une alternance *cases vides / cases pleines*.  
Exemple : `10,5,1,2` = 10 vides, 5 pleines, 1 vide, 2 pleines.

Au lancement :  
- décodage des assets et des calques,  
- génération d’une grande image par saison pour tous les éléments statiques (arbres, rochers, racines, murs…),  
- création d’une table de collisions.  

Les variations saisonnières sont gérées au rendu : eau remplacée par glace, trous par feuilles, etc.

Au départ j'avais repris des assets de Zelda. [Lylouf](https://x.com/lylouf13), un ami pixel artist, a fait un travail formidable en recréant les assets pour donner une identité propre au jeu.

---

## Personnage et collisions

Le gameplay 2024 était basé sur des déplacements *case par case*. Pour un open world, il fallait un **déplacement libre** et revoir entièrement collisions et mouvement.

- Le personnage reste centré, et c’est le décor qui défile.  
- En bord de carte, c’est l’inverse : le personnage bouge et la carte se fige.  
- Les arrondis/subpixels ont généré des artefacts visuels que j’ai dû corriger.  

### Collisions
- Hitbox précise pour le personnage.  
- Objets : case entière, sauf trous/eau plus permissifs.  
- Gros travail d’équilibrage pour éviter que le joueur puisse se faufiler *entre deux cases* ou coincer la hitbox dans un angle.  

En rejouant à *Oracle of Seasons*, j’ai repéré un système malin : si 50% de la hitbox est déjà passée et qu’il n’y a plus d’obstacle, le personnage glisse automatiquement sur le côté.  
Ça évite la frustration de rester bloqué contre un mur pour quelques pixels → énorme gain de confort.

---

## Pièges et ennemis

L’ajout d’ennemis et pièges a prolongé les défis techniques des collisions.  

- **Pics** : simples, deux frames → si le joueur est sur la case quand ils sont levés, il prend un dégât.  
- **Lames** : beaucoup plus complexe → elles doivent foncer en ligne droite jusqu’à heurter un obstacle, puis revenir avec une vitesse différente. Elles ne doivent pas se déclencher s’il y a un obstacle entre elles et le joueur.  
- **Seeker** : plus simple, il suit le joueur mais s’arrête quand il n’a plus de chemin, au lieu d’avoir une animation de retour.  

Tous les objets dynamiques (pièges, ennemis) sont recalculés frame par frame via un système d’AABBOverlap très léger et efficace.

---

## World / Level Design

Au départ, j’imaginais des grottes/maisons séparées comme dans Zelda. Finalement, j’ai opté pour un design basé sur **4 temples de saison**, chacun donnant un nouveau pouvoir, et des zones intermédiaires plus orientées puzzle.  

- **Temple de l’hiver** : simple, pensé pour ne pas frustrer les joueurs casu → objectif : atteindre l’orbe même après avoir pris des dégâts.  
- **Temple de l’été** : problème → impossible d’y créer une énigme de changement de saison, il fallait attendre d’avoir au moins deux saisons pour exploiter la mécanique.  
- **Zones intermédiaires** : ajoutées par itérations successives, en gardant la zone centrale comme hub.  

La zone sud, vide au départ, a été utilisée comme contenu *endgame* → un chat nécessitant tous les pouvoirs des saisons.  

### Placement des chats
Je voulais guider le joueur sans flèches ni HUD intrusif. L’idée des **panneaux remplacés par les chats collectés** s’est révélée plus diégétique et élégante. J’ai revu la répartition pour équilibrer les zones.

---

## Playtests et adaptations

J’ai pu faire tester rapidement, notamment via deux streamers, ce qui a permis d’ajuster le design.  

- Suppression des panneaux explicatifs : meilleure découverte par l’expérience.  
- Amélioration de la lisibilité de l’eau (couleur + animation).  
- Blocage de certaines zones déjà explorées pour limiter le backtracking inutile.  
- Ajouts de repères subtils :
  - eau proche de la pierre d’hiver après le temple d’automne,  
  - trous rappelés dans le temple du printemps pour montrer leur lien avec l’automne,  
  - affichage permanent de la saison active à l’écran,  
  - animation sur les pierres de changement de saison,  
  - chapeau de la sorcière changeant de couleur selon la saison (détail esthétique),  
  - chats qui regardent le joueur selon sa position (immersion).  

---

## Cinématiques

Je voulais intégrer une petite intro et une outro.  
Un tableau d’instructions contrôle :  
- la position/visibilité du personnage,  
- les changements de saison,  
- la direction du regard,  
- des animations ponctuelles.  

Cela m’a permis de donner une impression de **caméra scriptée** à moindre coût.  
La petite “danse” finale est née d’un bug : le flip horizontal s’est mêlé à la rotation prévue → le rendu était drôle et je l’ai conservé.

---

## Optimisations et conclusion

J’ai passé énormément de temps à grapiller des octets, en testant plusieurs fois le résultat.  
Parfois, un *helper* pour remplacer quelques appels ne vaut pas le coup : il est souvent plus efficace de répéter certains bouts de code, qui seront mieux compressés par Roadroller et le zip.  

J’ai aussi amélioré mon outil de compilation en termes de configuration, le rendant encore plus performant.  
Notamment avec un système de remplacement automatique des propriétés d’objet commençant par un `_` par des versions minifiées. Je l’ai ajouté un peu tard, ce qui a causé quelques bugs au début.

J’aurais aimé ajouter un support mobile avec un stick virtuel à gauche et un bouton à droite, mais je n’avais plus de place.  
Idem pour un écran titre permettant de continuer ou de lancer une nouvelle partie.

C’était un vrai défi de créer un petit monde ouvert en 2D en seulement **13 ko**, et je suis extrêmement fier d’avoir accompli ce challenge !  
En **13312 octets**, on trouve quand même :
- 30 assets / 57 frames de 16×16 px,  
- un monde de 100×62 cases,  
- en 4 variations différentes,  
→ soit **24800 cases designées à la main**.

Un énorme merci à [Lylouf](https://x.com/lylouf13) pour la création de tous les assets en pixel art et des palettes de couleurs !

