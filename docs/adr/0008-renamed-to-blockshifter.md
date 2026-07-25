# Renommage de Blocktopus vers Blockshifter suite au rejet WordPress.org

La soumission du plugin sous le nom "Blocktopus" a été mise en attente par la review WordPress.org (25 juillet 2026) pour risque de confusion de marque — l'outil de détection de l'équipe a flaggé "Blocktopus" comme correspondant à des usages externes existants (voir ADR-0007, déjà noté comme un risque accepté à l'époque, mais jugé bloquant par le reviewer).

Nouveau nom choisi : **Blockshifter** (slug `blockshifter`). Vérifications effectuées avant de trancher :
- Slug `blockshifter` disponible sur WordPress.org (aucun plugin existant).
- Collision trouvée en recherche générale avec deux sociétés existantes ("BlockShift Technologies", Pakistan, conseil blockchain ; "Blockshift", blockshift.us, développement logiciel) — jugée acceptable, secteur distinct (plugin WordPress vs conseil/dev blockchain), même raisonnement que pour ADR-0007.
- Le nom "Blockshifter" (avec le suffixe "-er") lui-même ne remonte aucune collision directe en recherche générale.

Tout le code, la documentation et les identifiants techniques (`Blockshifter_*`, `blockshifterTransform`, `blockshifterConfig`, hooks `blockshifter/...`) ont été renommés en conséquence. Le dépôt GitHub et le dossier local du projet ont également été renommés.
