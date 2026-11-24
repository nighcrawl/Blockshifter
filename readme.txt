=== Blockshifter ===
Contributors: nighcrawl
Tags: carousel, masonry, gallery, gutenberg, block editor
Requires at least: 6.2
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform native Gutenberg blocks into alternate display variants without leaving the editor.

== Description ==

Blockshifter is a growing toolbox of display modes for native Gutenberg blocks — no new block types, no leaving the block editor, no learning curve.

Pick a block you already use — Gallery, Group, Query Loop — flip a toggle in its Inspector, and its front-end output transforms. The block itself stays 100% native and editable; nothing about how you write content changes.

Think of Blockshifter as a shape-shifter for your blocks: same content underneath, a different shape on the front end. Today it shifts into a Carousel or a Masonry grid; tomorrow more shapes join the same toolbox, each just as simple to switch on.

= Carousel, live today =

A clean, minimalist carousel for Gallery, Group and Query Loop blocks, powered by [Splide.js](https://splidejs.com/) — lightweight, accessible, dependency-free. Arrows and pagination are styled to sit quietly on top of your content, in any color, on any background.

* One toggle to turn a block into a carousel
* Slides per page
* Autoplay
* Infinite loop
* Fully responsive, keyboard and screen-reader friendly out of the box

= Masonry, live today =

A compact, variable-height masonry grid for Gallery, Group and Query Loop blocks, built with native CSS Grid — no third-party library. Native Gutenberg settings stay in charge wherever they exist: Columns and Gap on Gallery, Gap on Group and Query Loop.

* One toggle to turn a block into a masonry grid
* Columns (Group and Query Loop — Gallery keeps its own native Columns control)
* Respects each block's native Gap and responsive behavior; Query Loop posts stack in a single column on small screens
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
3. Select a Gallery, Group or Query Loop's Post Template block in the editor, open the Inspector, and enable the "Blockshifter Carousel" or "Blockshifter Masonry" panel.

== Frequently Asked Questions ==

= Which blocks are supported? =

Gallery, Group and Query Loop (through its Post Template block) out of the box. Developers can extend any module to other core blocks via its `blockshifter/<module>/allowed_blocks` filter — see the Description above. The filter applies both on the front end and in the block editor.

= Are other display modes (Accordion...) available? =

Not yet — the current release ships with the Carousel and Masonry modules. More are planned.

= Is this plugin free? =

Yes, Blockshifter is completely free, with no premium tier at this time.

= Does Blockshifter collect any data? =

Blockshifter includes an optional, opt-in telemetry feature, disabled by default. If you choose to enable it from Settings > Blockshifter, it sends a small anonymous payload (installation UUID, Blockshifter/WordPress/PHP versions, and which modules are detected in use) to help prioritize development — no page content, URL, username, email or IP address is ever collected. See the Privacy section below for full details, and how to disable it.

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

1. The Editor Preview of a Gallery block with Carousel mode enabled, showing the Blockshifter Carousel panel and its settings (slides per page, autoplay, infinite loop) in the Inspector.
2. The Editor Preview of a Group block with Masonry mode enabled, showing the Blockshifter Masonry panel and its Columns setting in the Inspector.
3. A Gallery block rendered as a Carousel on the front end.
4. A Group block rendered as a Masonry grid on the front end.
5. The opt-in telemetry setting in Settings > Blockshifter.

== Changelog ==

= 0.4.0 =
* Adds Query Loop support: Carousel and Masonry can now be enabled on a Query Loop's Post Template, with the same Inspector controls and Editor Preview as Gallery and Group.
* Masonry on a Query Loop uses its own Columns setting, overriding the Query Loop's native grid columns, and stacks posts in a single column on screens narrower than 600px.
* Carousel and Masonry scripts and styles now load wherever a block is actually transformed — including blocks rendered from a template (a Query Loop on the blog home, archives, template parts) — and only there, instead of on any page that merely contains a Gallery, Group or Post Template.
* Opt-in usage telemetry now also counts modules used in templates, not only in post content. Nothing is collected unless telemetry is enabled.
* The `blockshifter/<module>/allowed_blocks` filter now also applies in the block editor: blocks added through it get the Inspector controls and Editor Preview, instead of only being transformed on the front end. A filter that does not return an array no longer causes a fatal error; the module falls back to its default blocks.
* Fixes Carousel producing invalid HTML on list-based blocks, and moving a Gallery's caption into the slides: the caption now stays under the carousel, in the editor too.
* Fixes uneven slide widths and vertical alignment in the Carousel Editor Preview.
* Fixes Masonry columns of unequal width, and Masonry not repacking when a single tile changes size.
* Fixes the Masonry Editor Preview staying unpacked on a Query Loop until Masonry was toggled off and on again.
* Fixes the plugin's settings not being removed when the plugin is deleted: the uninstall routine was missing from the 0.3.0 package.

= 0.3.0 =
* Adds Editor Preview: the editor canvas now renders a live preview of the Carousel or Masonry front-end output while a Module is enabled, plus a "Shifted" badge on the block toolbar to indicate a Module is active.
* Adds fully opt-in, anonymous usage telemetry — disabled by default. See the Privacy section below for details.

= 0.2.0 =
* Adds Masonry, a second Blockshifter module: turns a Gallery or Group block into a compact, variable-height CSS Grid layout, with the same "pick a block, flip a toggle" pattern as Carousel.
* Gap and (on Gallery) Columns always come from the block's own native Gutenberg settings — Masonry never duplicates them.
* Matches Gallery's native responsive behavior (two columns on narrow screens, configured column count above) on both Gallery and Group.
* Degrades gracefully to a regular, non-overlapping grid without JavaScript.

= 0.1.0 =
* Initial release: Carousel, the first Blockshifter module, for the Gallery and Group blocks.
