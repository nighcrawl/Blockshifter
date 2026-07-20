# Blocktopus

Plugin WordPress qui transforme des blocs Gutenberg core existants en variantes d'affichage (carousel, accordéon, masonry...) via Block Supports, sans créer de nouveaux types de blocs.

## Language

**Module**:
Terme produit/utilisateur pour une transformation d'affichage complète (ex. "Blocktopus Carousel", "Blocktopus Accordion"). Chaque Module implémente l'interface technique Transform.
_Avoid_: Transform (au sens produit — réserver ce mot au sens technique interne), addon, extension.

**Transform**:
Terme technique interne désignant l'interface/abstraction (`Blocktopus_Transform`) qu'implémente chaque Module côté PHP. Définit les blocs cibles autorisés, la clé de config, et la logique de rendu front propres à ce Module. Ne couvre pas les Inspector Controls (JS).
_Avoid_: Module (au sens technique interne — réserver ce mot au sens produit).

**Slug**:
Identifiant unique et stable d'un Module (ex. `carousel`, `accordion`), partagé entre sa moitié PHP (`Blocktopus_Transform`) et sa moitié JS (Inspector Controls). C'est le seul lien entre les deux — pas d'interface unifiée. Sert aussi de clé de namespace dans `blocktopusConfig`.
_Avoid_: id, key, name (au sens identifiant technique du Module).
