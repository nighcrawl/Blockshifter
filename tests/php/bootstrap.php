<?php
/**
 * PHPUnit bootstrap for Blocktopus — Brain Monkey, no full WP install.
 */

require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', sys_get_temp_dir() . '/' );
}

require_once dirname( __DIR__, 2 ) . '/includes/interface-transform.php';
require_once dirname( __DIR__, 2 ) . '/includes/class-module-registry.php';
require_once dirname( __DIR__, 2 ) . '/includes/class-assets.php';
