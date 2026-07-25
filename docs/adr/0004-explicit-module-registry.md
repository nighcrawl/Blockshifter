# Chargement des Modules via registre explicite, pas d'auto-découverte

Les Modules vivent chacun dans leur propre dossier (`includes/modules/<slug>/`) mais ne sont pas chargés par scan automatique du filesystem. Le bootstrap (`blockshifter.php`) les enregistre explicitement dans un registre central (ex. `Blockshifter_Core::register_module( new Carousel_Module() )`). Choisi pour la simplicité de débogage (pas de magie de découverte de fichiers) et pour permettre de désactiver un Module individuellement — utile si un modèle freemium par Module est adopté plus tard.
