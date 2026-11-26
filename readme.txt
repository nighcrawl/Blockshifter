=== Blockshifter ===
Contributors: nighcrawl
Tags: carousel, slider, masonry, query loop, gallery
Requires at least: 6.2
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Turn the Gallery, Group and Query Loop blocks you already use into a carousel or a masonry grid. One toggle. No new block, no lock-in.

== Description ==

You want a carousel of photos, a slider of your latest posts, or a masonry grid. Usually that means installing a slider plugin with its own block, its own settings screen and its own way of storing your content. Remove that plugin later and your sliders are gone.

**Blockshifter works the other way around.** Select a block you already use (Gallery, Group or Query Loop), open its sidebar, flip the **Carousel** or **Masonry** toggle, publish. The block stays a 100% native WordPress block: you keep editing it exactly as before, and the editor shows a live preview of the result.

**Try it in your browser first:** click **Live Preview** at the top of this page. A demo site opens with a Gallery carousel, a Gallery masonry grid and a carousel of latest posts, ready to edit.

= What you can build =

* **A photo carousel** from a Gallery block: slides per page, autoplay, infinite loop.
* **A "latest posts" slider** from a Query Loop: any post type, any query, same toggle.
* **A masonry photo wall** from a Gallery block, using its own native Columns and Gap settings.
* **A masonry grid of cards, testimonials or posts** from a Group or a Query Loop.

= No lock-in =

Blockshifter never creates its own block type and never rewrites your content. It only changes how the block is displayed on the front end. Deactivate it, and your Gallery is a regular Gallery again, your Query Loop a regular list of posts. Nothing to migrate, nothing broken.

= Light and accessible =

* Scripts and styles load only on pages where a block is actually shifted, nowhere else.
* Carousel is powered by [Splide.js](https://splidejs.com/): lightweight, dependency-free, keyboard and screen-reader friendly.
* Masonry is native CSS Grid, no third-party library, and falls back to a regular grid without JavaScript.
* Works with block themes and classic themes, on any background color.

= More shapes are coming =

Accordion and other display modes are on the roadmap. Each one follows the same pattern: pick a block, flip a toggle, done. Tell us which one you need on the [support forum](https://wordpress.org/support/plugin/blockshifter/).

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

= What happens to my content if I deactivate Blockshifter? =

Nothing breaks. Blockshifter only changes the front-end display of native blocks; it never creates its own block type. Once deactivated, a shifted Gallery is displayed as a regular Gallery, a shifted Query Loop as a regular list of posts.

= Do I need to learn a new block or page builder? =

No. You keep using the Gallery, Group and Query Loop blocks. Blockshifter only adds a "Blockshifter Carousel" and a "Blockshifter Masonry" panel to their sidebar.

= Can I make a slider of my latest posts? =

Yes, for posts and any post type a Query Loop can list: enable Carousel on the Query Loop's Post Template. Masonry works the same way.

= Does it slow down my site? =

Carousel and Masonry assets load only on pages where a block is actually shifted, including blocks coming from a template (blog home, archives, template parts). Other pages load nothing from Blockshifter.

= Does it work with my theme? =

Blockshifter works with block themes and classic themes, as long as you build the content with the block editor. If something looks wrong with your theme, please open a thread on the support forum with the theme name.

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
