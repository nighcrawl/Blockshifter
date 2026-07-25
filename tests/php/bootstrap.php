<?php
/**
 * PHPUnit bootstrap for Blockshifter — Brain Monkey, no full WP install.
 *
 * The HTML API classes (WP_HTML_Tag_Processor & friends) are the real
 * WordPress core source, vendored read-only under .wp-core-src/ (gitignored).
 * Fetch/refresh with `composer test-setup` (pinned to WP 6.7 — bump that
 * script deliberately, not by re-running `wp core download` unpinned) —
 * they have no WP runtime dependency beyond `__()` and `_doing_it_wrong()`,
 * which Brain Monkey stubs per-test.
 */

require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', sys_get_temp_dir() . '/' );
}

$wp_core_html_api_dir = dirname( __DIR__, 2 ) . '/.wp-core-src/wp-includes/html-api/';

if ( ! is_dir( $wp_core_html_api_dir ) ) {
	fwrite( STDERR, "\nWordPress core source not found — run `composer test-setup` first.\n\n" );
	exit( 1 );
}

$wp_core_html_api = $wp_core_html_api_dir;
unset( $wp_core_html_api_dir );

foreach (
	array(
		'class-wp-html-attribute-token.php',
		'class-wp-html-span.php',
		'class-wp-html-text-replacement.php',
		'class-wp-html-decoder.php',
		'class-wp-html-unsupported-exception.php',
		'class-wp-html-doctype-info.php',
		'class-wp-html-token.php',
		'class-wp-html-tag-processor.php',
	) as $wp_core_html_api_file
) {
	require_once $wp_core_html_api . $wp_core_html_api_file;
}
unset( $wp_core_html_api, $wp_core_html_api_file );

// WP_HTML_Tag_Processor::add_class() consults this for attribute escaping.
require_once dirname( __DIR__, 2 ) . '/.wp-core-src/wp-includes/kses.php';

require_once dirname( __DIR__, 2 ) . '/includes/interface-transform.php';
require_once dirname( __DIR__, 2 ) . '/includes/class-module-registry.php';
require_once dirname( __DIR__, 2 ) . '/includes/class-assets.php';
require_once dirname( __DIR__, 2 ) . '/includes/class-render.php';
require_once dirname( __DIR__, 2 ) . '/includes/modules/carousel/class-carousel-transform.php';
