<?php

namespace Blocktopus\Tests\Fakes;

use Brain\Monkey;
use PHPUnit\Framework\TestCase;

/**
 * Shared setup for tests that exercise real rendering through
 * WP_HTML_Tag_Processor (Blocktopus_Carousel_Transform::render() and
 * anything that dispatches to it).
 */
abstract class HtmlRenderingTestCase extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Monkey\Functions\when( '__' )->returnArg( 1 );
		Monkey\Functions\when( '_doing_it_wrong' )->justReturn( null );
		Monkey\Functions\when( 'esc_attr' )->returnArg( 1 );
		Monkey\Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}
}
