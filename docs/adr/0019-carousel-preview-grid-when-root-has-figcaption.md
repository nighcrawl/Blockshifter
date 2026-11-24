# L'aperçu Carousel passe en grille quand la racine a une `<figcaption>` directe

Lève la « limite connue » de l'ADR-0018 et complète l'ADR-0012. L'aperçu Carousel de l'éditeur est une rangée flex qui défile (CSS scroll-snap). La légende d'une galerie (`<figcaption>`, dernier enfant direct du `<figure>`) y défilait comme une slide de plus, après la dernière image, alors que sur le front elle reste sous le carrousel (ADR-0018).

Décision : seulement quand la racine a une `<figcaption>` directe (`.blockshifter-carousel-preview:has( > figcaption )`), l'aperçu passe en grille d'une ligne :
- `grid-auto-flow: column` ; chaque colonne fait la part d'une slide (`100% / perPage`) ; toutes les slides sont sur la ligne 1.
- La légende est sur la ligne 2, sous les slides. Elle est en `position: sticky; left: 0` pour rester visible pendant le défilement, et sa largeur couvre toutes les slides visibles.
- `width: auto !important` sur les slides : en flex, la base de chaque élément écrasait déjà la largeur en pourcentage que `core/gallery` donne à ses images. Dans une colonne de grille, ce pourcentage s'appliquerait à la colonne et réduirait encore l'image (même conflit que celui documenté pour Masonry).

Les autres racines (Group, Post Template, galerie sans légende) gardent la rangée flex de l'ADR-0012, sans changement.

Alternatives rejetées :
- Passer tout l'aperçu en grille : ça change aussi Group et Post Template, sans rien leur apporter.
- Sortir la légende de la rangée en position absolue : la rangée défile (`overflow-x: auto`), donc la légende serait coupée ou ferait défiler l'aperçu verticalement.
