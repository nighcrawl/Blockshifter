# L'éditeur lit les Target Blocks depuis PHP, filtre `allowed_blocks` compris

Complète ADR-0001 et ADR-0005, sans les remplacer. ADR-0001 rend filtrables les Target Blocks de chaque Module (`blockshifter/{slug}/allowed_blocks`). Jusqu'en 0.4.0, seul le rendu PHP appliquait ce filtre. L'éditeur utilisait ses propres listes écrites en dur (`supportedBlocks` dans le `logic.js` de chaque Module). Un bloc ajouté par le filtre était donc transformé sur le front, mais il ne recevait ni les attributs `blockshifterTransform`/`blockshifterConfig` ni les Inspector Controls : impossible de l'activer.

Décision : le registre PHP des Modules est la seule source des Target Blocks.
- Sur `enqueue_block_editor_assets`, `wp_add_inline_script( 'blockshifter-editor', …, 'before' )` définit `window.blockshifterTargetBlocks = { slug: [ blocs ] }`. Le contenu vient de `Blockshifter_Module_Registry::target_blocks_by_slug()`, filtre appliqué.
- Les données sont injectées avant le script de l'éditeur, et pas dans les réglages de l'éditeur : l'éditeur ajoute les attributs Blockshifter sur `blocks.registerBlockType`, au moment où les blocs core s'enregistrent, donc avant que le store de l'éditeur existe.
- La moitié JS de chaque Module lit sa liste avec `getTargetBlocks( slug )`. Aucune liste n'est plus écrite en dur côté JS. S'il n'y a pas de données, le Module ne cible aucun bloc : pas de liste de repli, qui pourrait diverger de PHP sans que personne le voie.
- Un filtre tiers doit être ajouté avant `enqueue_block_editor_assets`, par exemple au chargement du plugin ou sur `init`.

ADR-0005 tient toujours : PHP transmet des données à JS, pas un contrat commun. Les deux moitiés d'un Module restent reliées par le Slug et la forme de `blockshifterConfig[slug]`, auxquels s'ajoute la liste de ses Target Blocks.

Alternative rejetée : garder les listes JS comme repli si les données manquent. Ça garde la duplication que cette décision veut supprimer, et ça masque un problème de chargement réel.
