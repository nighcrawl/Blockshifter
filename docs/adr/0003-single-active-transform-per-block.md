# Un seul Transform actif par bloc (pour l'instant)

`blocktopusTransform` est une string, pas un tableau : un bloc ne peut avoir qu'un seul Module actif à la fois (pas de cumul carousel + masonry sur le même bloc). Décidé pour simplifier le rendu (`render_block` ne résout qu'un seul Transform, pas un pipeline) et parce que le cumul n'a pas de cas d'usage produit clair pour le MVP. Ouvert à revisiter dans une version future si un besoin de cumul émerge — dans ce cas `blocktopusTransform` deviendrait probablement un tableau.
