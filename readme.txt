=== Blocktopus ===
Contributors: TODO-wporg-username-once-approved
Tags: slider, carousel, gutenberg, full site editing, block editor
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Turn native Gallery and Group blocks into a clean, minimalist carousel — without leaving the editor.

== Description ==

Blocktopus is a growing toolbox of display modes for native Gutenberg blocks — no new block types, no leaving the block editor, no learning curve.

Most carousel/slider plugins bolt on their own custom block that sits awkwardly next to your existing content, dragging in bloated JS and a design language that fights your theme. Blocktopus takes the opposite approach: pick a block you already use — Gallery, Group — flip a toggle in its Inspector, and its front-end output transforms. The block itself stays 100% native and editable; nothing about how you write content changes.

Think of Blocktopus as an octopus growing new arms over time: today it's Carousel, tomorrow more display modes join the same toolbox, each one just as simple to reach for.

= Carousel, live today =

A clean, minimalist carousel for Gallery and Group blocks, powered by [Splide.js](https://splidejs.com/) — lightweight, accessible, dependency-free. No bloated slider bundle, no clashing default theme fighting your site's design: arrows and pagination are styled to sit quietly on top of your content, in any color, on any background.

* One toggle to turn a block into a carousel
* Slides per page
* Autoplay
* Infinite loop
* Fully responsive, keyboard and screen-reader friendly out of the box

= More arms are coming =

Accordion, Masonry, and other display modes are on the roadmap. Every future module follows the exact same pattern you already know: pick a block, flip a toggle, done.

= For developers =

The list of blocks a module targets is filterable, so you can extend the Carousel module to other core blocks without forking the plugin:

`add_filter( 'blocktopus/carousel/allowed_blocks', function( $blocks ) {
	$blocks[] = 'core/columns';
	return $blocks;
} );`

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/blocktopus`, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Select a Gallery or Group block in the editor, open the Inspector, and enable the "Blocktopus Carousel" panel.

== Frequently Asked Questions ==

= Can I use this on blocks other than Gallery and Group? =

Not out of the box yet, but developers can extend the Carousel module's target blocks via the `blocktopus/carousel/allowed_blocks` filter — see the Description above.

= Are other display modes (Accordion, Masonry...) available? =

Not yet — the current release ships with the Carousel module only. More are planned.

= Is this plugin free? =

Yes, Blocktopus is completely free, with no premium tier at this time.

== Screenshots ==

1. The Blocktopus Carousel panel in the Inspector of a Group block, with the Carousel mode enabled and its settings (slides per page, autoplay, infinite loop) visible.
2. The same Blocktopus Carousel panel on a Gallery block.
3. A Group block rendered as a full-width Carousel on the front end.
4. A Gallery block rendered as a Carousel on the front end.

== Changelog ==

= 0.1.0 =
* Initial release: Carousel, the first Blocktopus module, for the Gallery and Group blocks.
