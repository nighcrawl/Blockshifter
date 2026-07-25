<?php

namespace Blockshifter\Tests;

use Blockshifter_Carousel_Transform;
use Blockshifter_Module_Registry;
use Blockshifter_Render;
use Blockshifter\Tests\Fakes\HtmlRenderingTestCase;
use Brain\Monkey\Filters;

/**
 * End-to-end proof (ADR-0001) that a third party can extend the Carousel
 * Module's target blocks via `apply_filters()`, using the real Module —
 * not a fake — through the real render dispatch.
 */
final class CarouselAllowedBlocksFilterTest extends HtmlRenderingTestCase {

	protected function setUp(): void {
		parent::setUp();
		Blockshifter_Module_Registry::reset();
		Blockshifter_Module_Registry::register( new Blockshifter_Carousel_Transform() );
	}

	protected function tearDown(): void {
		Blockshifter_Module_Registry::reset();
		parent::tearDown();
	}

	public function test_a_block_added_via_the_filter_is_treated_as_carousel(): void {
		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->with( array( 'core/gallery', 'core/group' ) )
			->andReturn( array( 'core/gallery', 'core/group', 'core/columns' ) );

		$result = Blockshifter_Render::dispatch(
			'<div><div class="col">one</div></div>',
			array(
				'blockName' => 'core/columns',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);

		$this->assertStringContainsString( 'class="splide"', $result );
		$this->assertStringContainsString( 'splide__slide', $result );
	}

	public function test_without_the_filter_a_non_default_block_is_left_untouched(): void {
		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturnFirstArg();

		$result = Blockshifter_Render::dispatch(
			'<div><div class="col">one</div></div>',
			array(
				'blockName' => 'core/columns',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);

		$this->assertSame( '<div><div class="col">one</div></div>', $result );
	}

	public function test_without_the_filter_the_default_blocks_still_work(): void {
		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturnFirstArg();

		$result = Blockshifter_Render::dispatch(
			'<ul><li>one</li></ul>',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blockshifterTransform' => 'carousel' ),
			)
		);

		$this->assertStringContainsString( 'class="splide"', $result );
	}
}
