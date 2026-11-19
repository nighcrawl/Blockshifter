---
status: partially superseded by ADR-0017
---

# Masonry sur Query Loop utilise toujours sa propre config, jamais les colonnes natives de la vue Grid

Pour `core/gallery`, le Module Masonry lit la colonne count native du bloc (`get_columns()` special-case) plutôt que de dupliquer un réglage Blockshifter. Pour Query Loop, ce même pattern aurait supposé lire `displayLayout.columns` (réglage natif de la vue Grid du bloc `core/query`) — mais cette donnée vit dans le contexte du bloc (`WP_Block::$context`), non accessible depuis le `render_block` filter tel qu'actuellement câblé (2 arguments, pas le 3e `$block_instance`). Plutôt que d'étendre l'interface `Transform::render()` pour un seul cas d'usage, Query Loop + Masonry utilise systématiquement sa propre config Blockshifter (`blockshifterConfig.masonry.columns`), jamais la vue Grid native. Cohérent avec le fait que Masonry (CSS Grid) écrase de toute façon le layout natif une fois actif — les deux systèmes de colonnes ne devraient jamais se superposer. Alternative rejetée : étendre `Transform::render()` avec le contexte du bloc pour lire `displayLayout.columns` — reporté tant qu'aucun autre besoin concret de contexte n'apparaît (YAGNI).
