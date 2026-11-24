# Assets front d'un Module enregistrés par convention de slug, dans `Blockshifter_Assets`

Jusqu'en 0.4.0, `blockshifter.php` contenait un bloc `wp_enqueue_scripts` copié-collé par Module pour enregistrer son script et son style front. Ce code n'était pas testé. Le nom du handle était écrit à deux endroits : dans ce bloc et dans `get_asset_handles()` de la Transform. Chaque nouveau Module ajoutait une copie de plus.

Décision : `Blockshifter_Assets` enregistre les assets front de chaque Module du registre (ADR-0004) sur `wp_enqueue_scripts` (priorité 5), en suivant une convention fondée sur le Slug :
- handle `blockshifter-{slug}-frontend`, le même pour le script et le style (`Blockshifter_Assets::frontend_handle()`) ;
- fichiers `build/frontend/{slug}-init.js`, `.asset.php` et `.css`, c'est-à-dire l'entrée webpack `frontend/{slug}-init`.

Un Module sans `.asset.php` construit n'est pas enregistré. Son `.css` est optionnel. `Blockshifter_Transform::get_asset_handles()` ne change pas (ADR-0005) : la Transform doit renvoyer le handle de la convention, et un test le vérifie pour chaque Module réel. Les handles et les URLs restent ceux de 0.4.0.

Ajouter un Module demande donc : sa Transform, une ligne dans le registre, et une entrée webpack `frontend/{slug}-init`. Pas de code d'assets.

Alternative rejetée : une méthode d'enregistrement déclarée par chaque Transform. Elle aurait élargi l'interface PHP et laissé chaque Module réécrire la même logique.
