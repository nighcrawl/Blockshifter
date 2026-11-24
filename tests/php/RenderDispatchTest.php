<?php

namespace Blockshifter\Tests;

use Blockshifter_Module_Registry;
use Blockshifter_Render;
use Blockshifter\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Actions;
use Brain\Monkey\Filters;
use PHPUnit\Framework\TestCase;

final class RenderDispatchTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Blockshifter_Module_Registry::reset();
	}

	protected function tearDown(): void {
		Blockshifter_Module_Registry::reset();
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
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
		Blockshifter_Module_Registry::register( $module );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 'core/gallery' ) );

		$result = Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
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
		Blockshifter_Module_Registry::register( $module );

		$result = Blockshifter_Render::dispatch(
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
		Blockshifter_Module_Registry::register( $module );

		$result = Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blockshifterTransform' => '' ),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}

	public function test_returns_content_unchanged_when_no_module_matches_the_slug(): void {
		$result = Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blockshifterTransform' => 'unknown-module' ),
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
		Blockshifter_Module_Registry::register( $module );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 'core/gallery' ) );

		$result = Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);

		$this->assertSame( 'ORIGINAL', $result );
	}

	public function test_fires_the_module_rendered_action_with_the_module_when_it_renders(): void {
		$module = new FakeTransform(
			'carousel',
			array( 'core/post-template' ),
			array(),
			static function () {
				return 'TRANSFORMED';
			}
		);
		Blockshifter_Module_Registry::register( $module );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturnFirstArg();
		Actions\expectDone( Blockshifter_Render::MODULE_RENDERED_ACTION )->once()->with( $module );

		Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/post-template',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);
	}

	public function test_does_not_fire_the_module_rendered_action_when_the_block_is_not_allowed(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturnFirstArg();
		Actions\expectDone( Blockshifter_Render::MODULE_RENDERED_ACTION )->never();

		Blockshifter_Render::dispatch(
			'ORIGINAL',
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);
	}

	public function test_does_not_fire_the_module_rendered_action_without_an_active_transform(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Actions\expectDone( Blockshifter_Render::MODULE_RENDERED_ACTION )->never();

		Blockshifter_Render::dispatch( 'ORIGINAL', array( 'blockName' => 'core/gallery', 'attrs' => array() ) );
	}

	/**
	 * A Module that hands the block back untouched (e.g. an empty block)
	 * transformed nothing: no assets to load, no usage to record.
	 */
	public function test_does_not_fire_the_module_rendered_action_when_the_module_leaves_the_block_unchanged(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturnFirstArg();
		Actions\expectDone( Blockshifter_Render::MODULE_RENDERED_ACTION )->never();

		$result = Blockshifter_Render::dispatch(
			'',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);

		$this->assertSame( '', $result );
	}
}
