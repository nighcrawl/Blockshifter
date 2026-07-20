# Blocktopus

Blocktopus transforme des blocs Gutenberg natifs (`core/gallery`, `core/group`) en variantes d'affichage alternatives — sans créer de nouveaux types de bloc, et sans sortir de l'éditeur natif.

## Concept

Plutôt que d'ajouter ses propres blocs (comme le font la plupart des plugins de carousel), Blocktopus ajoute un mode d'affichage optionnel directement dans l'Inspector des blocs Galerie et Groupe existants. Le bloc reste 100% natif et éditable normalement ; seule sa sortie en front est transformée.

**Module 1 (MVP) : Carousel** — transforme un bloc Galerie ou Groupe en carousel (via [Splide.js](https://splidejs.com/)), avec réglages :
- Activer/désactiver le mode Carousel
- Nombre de slides visibles par page
- Autoplay
- Boucle infinie

D'autres modules (Accordéon, Masonry...) sont prévus pour plus tard. Voir `CONTEXT.md` et `docs/adr/` pour le vocabulaire du projet et les décisions d'architecture.

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
3. Activez le toggle "Activer le mode Carousel"
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

## Structure

```
blocktopus.php                          # Bootstrap du plugin
includes/
├── interface-transform.php             # Contrat Blocktopus_Transform
├── class-module-registry.php           # Registre explicite des Modules
├── class-assets.php                    # Enqueue conditionnel des assets front
├── class-render.php                    # Dispatch générique du rendu (render_block)
└── modules/carousel/                   # Module 1 : Carousel
src/
├── index.js                            # Entrée éditeur (attributs génériques, contrôles Carousel)
├── frontend/carousel-init.js           # Init Splide.js en front
└── modules/carousel/                   # Logique + Inspector Controls du Module Carousel
```

## Licence

GPL-2.0-or-later
