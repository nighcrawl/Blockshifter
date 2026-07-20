# Blocktopus

Blocktopus est une boîte à outils grandissante de modes d'affichage pour les blocs Gutenberg natifs (`core/gallery`, `core/group`) — pas de nouveau type de bloc, pas besoin de sortir de l'éditeur natif, aucune courbe d'apprentissage.

## Concept

La plupart des plugins de carousel/slider ajoutent leur propre bloc custom, qui vit maladroitement à côté du contenu existant, avec son JS lourd et un design qui jure avec le thème. Blocktopus fait l'inverse : on prend un bloc qu'on utilise déjà — Galerie, Groupe — on bascule un toggle dans son Inspector, et sa sortie front se transforme. Le bloc lui-même reste 100% natif et éditable ; rien ne change dans la façon d'écrire le contenu.

Blocktopus, c'est une pieuvre qui fait grandir de nouveaux bras avec le temps : aujourd'hui c'est Carousel, demain d'autres modes d'affichage rejoindront la même boîte à outils, chacun tout aussi simple à activer.

**Carousel, disponible aujourd'hui** — transforme un bloc Galerie ou Groupe en carousel propre et minimaliste (via [Splide.js](https://splidejs.com/)), avec réglages :
- Activer/désactiver le mode Carousel
- Nombre de slides visibles par page
- Autoplay
- Boucle infinie

D'autres bras arrivent : Accordéon, Masonry... sont sur la roadmap, chacun suivant le même principe (choisir un bloc, activer un toggle). Voir `CONTEXT.md` et `docs/adr/` pour le vocabulaire du projet et les décisions d'architecture.

## Installation dans WordPress

Le plugin doit être **buildé avant** d'être installé — le dossier `build/` (assets JS/CSS compilés) n'est pas versionné dans le dépôt git.

### Depuis ce dépôt (développement)

```bash
composer install
npm install
npm run build
```

Puis copiez (ou créez un lien symbolique) le dossier du plugin dans `wp-content/plugins/` de votre installation WordPress, par exemple :

```bash
cp -R . /chemin/vers/wordpress/wp-content/plugins/blocktopus
```

Activez ensuite le plugin depuis l'admin WordPress (**Extensions**).

### Depuis une archive ZIP GitHub

Si vous téléchargez le code via le bouton "Code → Download ZIP" de GitHub, le dossier `build/` sera absent (il est dans `.gitignore`). Il faut le générer vous-même :

1. Placez le dossier extrait dans `wp-content/plugins/`
2. Depuis ce dossier, lancez `npm install && npm run build`
3. Activez le plugin dans l'admin WordPress

### Prérequis

- WordPress 6.2+
- PHP 7.4+
- Node.js (pour builder les assets JS/CSS)

## Utilisation

1. Dans l'éditeur, sélectionnez un bloc **Galerie** ou **Groupe**
2. Dans l'Inspector (panneau latéral), ouvrez le panneau **Blocktopus Carousel**
3. Activez le toggle "Enable Carousel mode" (le texte de l'UI suit la langue de votre WordPress — anglais par défaut, tant qu'aucune traduction française n'est fournie)
4. Réglez le nombre de slides visibles, l'autoplay et la boucle infinie selon vos besoins

Le rendu carousel ne s'applique qu'au front — l'édition du bloc dans l'éditeur reste inchangée.

## Développement

```bash
composer install       # dépendances PHP (tests uniquement)
npm install             # dépendances JS

npm run start           # build JS en mode watch
npm run build           # build JS de production

composer test-setup     # télécharge le noyau WordPress nécessaire aux tests PHP (une fois)
composer test           # tests PHP (PHPUnit + Brain Monkey)
npm run test:unit       # tests JS (Jest)
```

### Publication WordPress.org

```bash
bin/build-wporg-package.sh   # génère dist/blocktopus-<version>.zip (runtime seul)
```

## Structure

```
blocktopus.php                          # Bootstrap du plugin
includes/
├── interface-transform.php             # Contrat Blocktopus_Transform
├── class-module-registry.php           # Registre explicite des Modules
├── class-assets.php                    # Enqueue conditionnel des assets front
├── class-render.php                    # Dispatch générique du rendu (render_block)
└── modules/carousel/                   # Module Carousel
src/
├── index.js                            # Entrée éditeur (attributs génériques, contrôles Carousel)
├── frontend/carousel-init.js           # Init Splide.js en front
└── modules/carousel/                   # Logique + Inspector Controls du Module Carousel
```

## Licence

GPL-2.0-or-later
