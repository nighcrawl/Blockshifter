# ALLOWED_BLOCKS d'un Module est extensible via filtre, pas figé

Chaque Module (ex. Carousel) déclare une liste de blocs core cibles (ex. `core/gallery`, `core/group`). Pour le MVP, cette liste est exposée via `apply_filters()` plutôt que codée en dur, afin qu'un développeur tiers ou l'utilisateur puisse étendre un Module existant (ex. autoriser Carousel sur `core/columns`) sans forker le plugin. Alternative rejetée : liste strictement fermée par Module, plus simple mais bloquante pour l'interop avec l'écosystème WordPress.
