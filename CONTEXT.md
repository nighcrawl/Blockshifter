# Blockshifter

Plugin WordPress qui transforme des blocs Gutenberg core existants en variantes d'affichage (carousel, accordéon, masonry...) via Block Supports, sans créer de nouveaux types de blocs.

## Language

**Module**:
Terme produit/utilisateur pour une transformation d'affichage complète (ex. "Blockshifter Carousel", "Blockshifter Accordion"). Chaque Module implémente l'interface technique Transform.
_Avoid_: Transform (au sens produit — réserver ce mot au sens technique interne), addon, extension.

**Transform**:
Terme technique interne désignant l'interface/abstraction (`Blockshifter_Transform`) qu'implémente chaque Module côté PHP. Définit les blocs cibles autorisés, la clé de config, et la logique de rendu front propres à ce Module. Ne couvre pas les Inspector Controls (JS).
_Avoid_: Module (au sens technique interne — réserver ce mot au sens produit).

**Slug**:
Identifiant unique et stable d'un Module (ex. `carousel`, `accordion`), partagé entre sa moitié PHP (`Blockshifter_Transform`) et sa moitié JS (Inspector Controls). C'est le seul lien entre les deux — pas d'interface unifiée. Sert aussi de clé de namespace dans `blockshifterConfig`.
_Avoid_: id, key, name (au sens identifiant technique du Module).

**Native Block Controls**:
Réglages fournis par Gutenberg pour un bloc core, que Blockshifter réutilise lorsqu'ils couvrent le besoin d'un Module. Ils restent la source de vérité, par opposition à une configuration propre à Blockshifter.
_Avoid_: Blockshifter controls, duplicate controls.

**Masonry Tile**:
Enfant direct d'un bloc transformé par le Module Masonry, traité comme une unité de disposition indépendante. Les descendants de la tuile ne font pas partie du layout Masonry.
_Avoid_: nested item, card (sauf lorsqu'il s'agit réellement d'une carte de contenu).

**Regular Grid Fallback**:
Disposition Grid régulière et lisible affichée avant le calcul Masonry ou lorsque JavaScript n'est pas disponible. Elle conserve les colonnes et le Gap du Module sans promettre le compactage par hauteur.
_Avoid_: broken masonry, no-JS masonry.
