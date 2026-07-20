<?php

namespace Blocktopus\Tests;

use Blocktopus_Module_Registry;
use Blocktopus_Render;
use Blocktopus\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use PHPUnit\Framework\TestCase;

final class RenderDispatchTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Blocktopus_Module_Registry::reset();
	}

	protected function tearDown(): void {
		Blocktopus_Module_Registry::reset();
		Monkey\tearDown();
		parent::tearDown();
	}

	public function test_dispatches_to_the_active_module_when_block_is_allowed(): void {
		$module = new FakeTransform(
			'carousel',
			array( 'core/gallery' ),
			array(),
			static function ( string $content ) {
				return 'RENDERED:' . $content;
			}
		);
		Blocktopus_Module_Registry::register( $module );

		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 'core/gallery' ) );

		$result = Blocktopus_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blocktopusTransform' => 'carousel' ),
			)
		);

		$this->assertSame( 'RENDERED:ORIGINAL', $result );
	}

	public function test_returns_content_unchanged_when_transform_attribute_is_absent(): void {
		$module = new FakeTransform(
			'carousel',
			array( 'core/gallery' ),
			array(),
			static function () {
				return 'SHOULD_NOT_BE_CALLED';
			}
		);
		Blocktopus_Module_Registry::register( $module );

		$result = Blocktopus_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array(),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}

	public function test_returns_content_unchanged_when_transform_attribute_is_empty_string(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery' ) );
		Blocktopus_Module_Registry::register( $module );

		$result = Blocktopus_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blocktopusTransform' => '' ),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}

	public function test_returns_content_unchanged_when_no_module_matches_the_slug(): void {
		$result = Blocktopus_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blocktopusTransform' => 'unknown-module' ),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}

	public function test_returns_content_unchanged_when_block_is_not_in_the_modules_allowed_blocks(): void {
		$module = new FakeTransform(
			'carousel',
			array( 'core/gallery' ),
			array(),
			static function () {
				return 'SHOULD_NOT_BE_CALLED';
			}
		);
		Blocktopus_Module_Registry::register( $module );

		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 'core/gallery' ) );

		$result = Blocktopus_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array( 'blocktopusTransform' => 'carousel' ),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}
}
