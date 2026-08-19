=== Blockshifter ===
Contributors: nighcrawl
Tags: slider, carousel, gutenberg, full site editing, block editor
Requires at least: 6.2
Tested up to: 7.0.4
Requires PHP: 7.4
Stable tag: 0.3.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform native Gutenberg blocks into alternate display variants without leaving the editor.

== Description ==

Blockshifter is a growing toolbox of display modes for native Gutenberg blocks — no new block types, no leaving the block editor, no learning curve.

Pick a block you already use — Gallery, Group — flip a toggle in its Inspector, and its front-end output transforms. The block itself stays 100% native and editable; nothing about how you write content changes.

Think of Blockshifter as a shape-shifter for your blocks: same content underneath, a different shape on the front end. Today it shifts into a Carousel or a Masonry grid; tomorrow more shapes join the same toolbox, each just as simple to switch on.

= Carousel, live today =

A clean, minimalist carousel for Gallery and Group blocks, powered by [Splide.js](https://splidejs.com/) — lightweight, accessible, dependency-free. Arrows and pagination are styled to sit quietly on top of your content, in any color, on any background.

* One toggle to turn a block into a carousel
* Slides per page
* Autoplay
* Infinite loop
* Fully responsive, keyboard and screen-reader friendly out of the box

= Masonry, live today =

A compact, variable-height masonry grid for Gallery and Group blocks, built with native CSS Grid — no third-party library. Every native Gutenberg setting stays in charge: Columns and Gap on Gallery, Gap on Group.

* One toggle to turn a block into a masonry grid
* Columns (Group only — Gallery keeps its own native Columns control)
* Respects each block's native Gap and responsive behavior
* Degrades gracefully to a regular grid without JavaScript

= More shapes are coming =

Accordion and other display modes are on the roadmap. Every future module follows the exact same pattern you already know: pick a block, flip a toggle, done.

= For developers =

The list of blocks a module targets is filterable, so you can extend any module to other core blocks without forking the plugin — the filter name follows `blockshifter/<module>/allowed_blocks`:

`add_filter( 'blockshifter/carousel/allowed_blocks', function( $blocks ) {
	$blocks[] = 'core/columns';
	return $blocks;
} );

add_filter( 'blockshifter/masonry/allowed_blocks', function( $blocks ) {
	$blocks[] = 'core/columns';
	return $blocks;
} );`

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/blockshifter`, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Select a Gallery or Group block in the editor, open the Inspector, and enable the "Blockshifter Carousel" panel.

== Frequently Asked Questions ==

= Can I use this on blocks other than Gallery and Group? =

Not out of the box yet, but developers can extend any module's target blocks via its `blockshifter/<module>/allowed_blocks` filter — see the Description above.

= Are other display modes (Accordion...) available? =

Not yet — the current release ships with the Carousel and Masonry modules. More are planned.

= Is this plugin free? =

Yes, Blockshifter is completely free, with no premium tier at this time.

== Privacy ==

Blockshifter includes a fully **opt-in** telemetry feature — disabled by default, and no data is ever sent before you explicitly enable it from Settings > Blockshifter.

When enabled, once a week (and once immediately after you opt in), the plugin sends this anonymous payload to `https://api.blockshifter.dev/v1/telemetry`:

* A random installation identifier (a UUID generated locally, not tied to your identity or your site's URL)
* The Blockshifter, WordPress and PHP version numbers
* Which Blockshifter modules (Carousel, Masonry...) are detected in your rendered content

No page content, no URL, no username, no email address and no IP address is stored. You can disable telemetry at any time from Settings > Blockshifter, which also stops all further data collection.

Full privacy policy: https://blockshifter.dev/privacy.html

== Development ==

Source code, build tools and issue tracker: https://github.com/nighcrawl/Blockshifter

The `src/` directory contains the human-readable, unminified source for everything shipped in `build/`. See the repository's README for the build steps (`composer install && npm install && npm run build`).

== Screenshots ==

1. The Blockshifter Carousel panel in the Inspector of a Group block, with the Carousel mode enabled and its settings (slides per page, autoplay, infinite loop) visible.
2. The same Blockshifter Carousel panel on a Gallery block.
3. A Group block rendered as a full-width Carousel on the front end.
4. A Gallery block rendered as a Carousel on the front end.

== Changelog ==

= 0.2.0 =
* Adds Masonry, a second Blockshifter module: turns a Gallery or Group block into a compact, variable-height CSS Grid layout, with the same "pick a block, flip a toggle" pattern as Carousel.
* Gap and (on Gallery) Columns always come from the block's own native Gutenberg settings — Masonry never duplicates them.
* Matches Gallery's native responsive behavior (two columns on narrow screens, configured column count above) on both Gallery and Group.
* Degrades gracefully to a regular, non-overlapping grid without JavaScript.

= 0.1.0 =
* Initial release: Carousel, the first Blockshifter module, for the Gallery and Group blocks.
