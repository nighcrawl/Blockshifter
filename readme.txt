=== Blocktopus ===
Contributors: TODO-wporg-username-once-approved
Tags: slider, carousel, gutenberg, full site editing, block editor
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Turn native Gallery and Group blocks into a carousel — without leaving the editor. More display modes coming soon.

== Description ==

Blocktopus transforms native Gutenberg blocks into alternate display variants — without creating new block types, and without leaving the block editor.

Most carousel/slider plugins add their own custom block that lives awkwardly next to your existing content. Blocktopus takes a different approach: it adds an optional display mode directly to the Inspector of blocks you already use — Gallery and Group. Your block stays 100% native and editable; only its front-end output changes.

= Module 1 (available now): Carousel =

Turn a Gallery or Group block into a [Splide.js](https://splidejs.com/) carousel, with:

* A simple toggle to enable/disable the carousel display
* Number of slides visible per page
* Autoplay
* Infinite loop

= Coming later =

More display modules (Accordion, Masonry...) are planned. Each will follow the same pattern: pick a block, flip a toggle in the Inspector, done.

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

1. The Blocktopus Carousel panel in the block Inspector, with the Carousel mode enabled and its settings (slides per page, autoplay, infinite loop) visible.

== Changelog ==

= 0.1.0 =
* Initial release: Carousel module for the Gallery and Group blocks.
