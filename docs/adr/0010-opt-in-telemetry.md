# Télémétrie opt-in, sans log réseau, UUID stable

Blockshifter 0.3.0 embarque une télémétrie strictement opt-in vers `https://api.blockshifter.dev/v1/telemetry` (voir `blockshifter-telemetry-api.md`). Décisions retenues côté plugin :

- **Consentement** : page de réglages dédiée (sous-menu de Réglages) + admin notice non-dismissible tant qu'aucun choix explicite ("Activer" / "Non merci") n'est fait — fermer la notice n'est pas un refus. Aucun appel réseau avant ce choix (guideline 7 WordPress.org, `developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/`).
- **Identifiant** : UUID généré une seule fois, à la première activation de l'opt-in, conservé tel quel à travers les toggles on/off ultérieurs (pour ne pas fausser le comptage d'installations côté API). Supprimé uniquement à la désinstallation complète (`uninstall.php`).
- **Fréquence** : cron hebdomadaire + un envoi immédiat au moment de l'opt-in. Le cron est planifié/déplanifié dynamiquement au toggle (pas de `register_activation_hook`), et nettoyé à la désactivation du plugin — pas de tâche fantôme pour les sites qui n'opt-in jamais.
- **Détection des features** : piggyback léger sur le rendu existant (`has_block()` par module du `Blockshifter_Module_Registry`), un flag `seen` par module mis à jour au premier rendu où le bloc apparaît. Pas de scan complet du site pour cette version — dépend du trafic réel, accepté comme donnée d'observation et non de vérité absolue.
- **Échecs réseau** : `wp_remote_post` non-bloquant, timeout court, aucun log même en `WP_DEBUG` — la télémétrie ne doit jamais être visible ni traçable côté site de l'utilisateur.
- **Conformité** : section `== Privacy ==` dans `readme.txt` + intégration à l'outil natif via `wp_add_privacy_policy_content()` + lien vers une politique de confidentialité externe (`blockshifter.dev/privacy`).
