<?php

namespace Blocktopus\Tests;

use Blocktopus_Carousel_Transform;
use Blocktopus_Module_Registry;
use Blocktopus_Render;
use Blocktopus\Tests\Fakes\HtmlRenderingTestCase;
use Brain\Monkey\Filters;

/**
 * End-to-end proof (ADR-0001) that a third party can extend the Carousel
 * Module's target blocks via `apply_filters()`, using the real Module —
 * not a fake — through the real render dispatch.
 */
final class CarouselAllowedBlocksFilterTest extends HtmlRenderingTestCase {

	protected function setUp(): void {
		parent::setUp();
		Blocktopus_Module_Registry::reset();
		Blocktopus_Module_Registry::register( new Blocktopus_Carousel_Transform() );
	}

	protected function tearDown(): void {
		Blocktopus_Module_Registry::reset();
		parent::tearDown();
	}

	public function test_a_block_added_via_the_filter_is_treated_as_carousel(): void {
		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->with( array( 'core/gallery', 'core/group' ) )
			->andReturn( array( 'core/gallery', 'core/group', 'core/columns' ) );

		$result = Blocktopus_Render::dispatch(
			'<div><div class="col">one</div></div>',
			array(
				'blockName' => 'core/columns',
				'attrs'     => array( 'blocktopusTransform' => 'carousel' ),
			)
		);

		$this->assertStringContainsString( 'class="splide"', $result );
		$this->assertStringContainsString( 'splide__slide', $result );
	}

	public function test_without_the_filter_a_non_default_block_is_left_untouched(): void {
		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->andReturnFirstArg();

		$result = Blocktopus_Render::dispatch(
			'<div><div class="col">one</div></div>',
			array(
				'blockName' => 'core/columns',
				'attrs'     => array( 'blocktopusTransform' => 'carousel' ),
			)
		);

		$this->assertSame( '<div><div class="col">one</div></div>', $result );
	}

	public function test_without_the_filter_the_default_blocks_still_work(): void {
		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->andReturnFirstArg();

		$result = Blocktopus_Render::dispatch(
			'<ul><li>one</li></ul>',
			array(
				'blockName' => 'core/gallery',
				'attrs'     => array( 'blocktopusTransform' => 'carousel' ),
			)
		);

		$this->assertStringContainsString( 'class="splide"', $result );
	}
}
