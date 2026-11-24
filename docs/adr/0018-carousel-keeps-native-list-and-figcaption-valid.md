# Carousel garde un HTML valide : une liste native devient `.splide__list`, la légende d'un `<figure>` reste hors des slides

Complète ADR-0013, dont la décision tient (pas de nouvelle abstraction, `render()` reste aveugle au nom du bloc) mais dont le constat « `<ul>` + `<li>` est une forme structurellement identique » était faux pour Carousel. Le Transform insérait `<div class="splide__track"><div class="splide__list">` *dans* la racine du bloc. C'est valide pour un `<div>` (Group) ou un `<figure>` (Gallery), mais pas pour la `<ul>` du Post Template : on obtenait `ul > div > div > li`, invalide, et les lecteurs d'écran ne voyaient plus de liste. Le test manuel a montré un second défaut, sur Gallery : sa légende (`<figcaption class="blocks-gallery-caption">`, dernier enfant direct du `<figure>`) devenait une slide de plus, et un `<figcaption>` déplacé dans `.splide__list` n'est plus le premier ni le dernier enfant de son `<figure>`.

Principe retenu : rester au plus près du HTML natif de WordPress et n'ajouter que le minimum dont Splide a besoin.

Décision, toujours fondée sur la forme rendue et jamais sur le nom du bloc :
- **Racine `<ul>`/`<ol>`** : la liste native reste intacte et devient elle-même `.splide__list` (une seule classe ajoutée). Le `.splide` (avec `data-splide` et l'alignement propagé) et le `.splide__track` sont deux `<div>` ajoutés *autour* d'elle.
- **Autres racines** : inchangé, la racine du bloc devient `.splide` et la piste est insérée dedans.
- **Racine `<figure>`** : un `<figcaption>` enfant direct n'est jamais une slide. Il reste à sa place, premier ou dernier enfant du `<figure>`, avant ou après la piste.
- La liste garde ses classes de layout natives (Flow, Grid…), qui contredisent la rangée unique de Splide. `carousel-layout.css` les neutralise uniquement pour une `.splide__list` portant une classe `is-layout-*` : `display: flex`, `gap: 0`, pas de marge entre éléments. La vue Grid du Query Loop, qui empilait les slides, fonctionne donc aussi.

Alternatives rejetées :
- Transformer la `<ul>` en `<div>` : HTML valide, mais on perd la sémantique de liste et on s'éloigne du rendu natif.
- Garder la `<ul>` comme `.splide` et insérer des `<li>` comme piste : détourne `<li>` de son sens, et Splide exige quand même deux niveaux sous la racine.

Limite connue : l'aperçu de l'éditeur (CSS scroll-snap, ADR-0012) traite encore la légende de galerie comme un élément de la rangée qui défile.
