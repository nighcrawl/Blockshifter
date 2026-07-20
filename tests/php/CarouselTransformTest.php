<?php

namespace Blocktopus\Tests;

use Blocktopus_Carousel_Transform;
use Brain\Monkey;
use PHPUnit\Framework\TestCase;

final class CarouselTransformTest extends TestCase {

	/**
	 * @var Blocktopus_Carousel_Transform
	 */
	private $transform;

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Monkey\Functions\when( '__' )->returnArg( 1 );
		Monkey\Functions\when( '_doing_it_wrong' )->justReturn( null );
		Monkey\Functions\when( 'esc_attr' )->returnArg( 1 );
		$this->transform = new Blocktopus_Carousel_Transform();
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	public function test_slug_is_carousel(): void {
		$this->assertSame( 'carousel', $this->transform->get_slug() );
	}

	public function test_allowed_blocks_default_to_gallery_and_group(): void {
		$this->assertSame( array( 'core/gallery', 'core/group' ), $this->transform->get_allowed_blocks() );
	}

	public function test_wraps_content_in_the_splide_structure(): void {
		$result = $this->transform->render( '<ul class="wp-block-gallery"><li>one</li></ul>', array() );

		$this->assertStringContainsString( 'class="splide"', $result );
		$this->assertStringContainsString( 'class="splide__track"', $result );
		$this->assertStringContainsString( 'class="splide__list"', $result );
	}

	public function test_marks_direct_children_as_slides(): void {
		$result = $this->transform->render(
			'<ul class="wp-block-gallery"><li class="item">one</li><li class="item">two</li></ul>',
			array()
		);

		$this->assertSame( 2, substr_count( $result, 'splide__slide' ) );
		// Existing classes on the direct children must be preserved.
		$this->assertStringContainsString( 'item', $result );
	}

	public function test_does_not_mark_grandchildren_as_slides(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group"><div class="item"><span class="nested">deep</span></div></div>',
			array()
		);

		// Only the one direct child (.item) becomes a slide, not the nested span.
		$this->assertSame( 1, substr_count( $result, 'splide__slide' ) );
	}

	public function test_degrades_gracefully_with_a_single_child(): void {
		$result = $this->transform->render( '<ul class="wp-block-gallery"><li>only</li></ul>', array() );

		$this->assertSame( 1, substr_count( $result, 'splide__slide' ) );
		$this->assertStringContainsString( 'only', $result );
	}

	public function test_degrades_gracefully_with_no_children(): void {
		$result = $this->transform->render( '', array() );

		$this->assertSame( '', $result );
	}

	public function test_asset_handles_are_scoped_to_the_carousel_frontend_bundle(): void {
		$this->assertSame(
			array(
				'scripts' => array( 'blocktopus-carousel-frontend' ),
				'styles'  => array( 'blocktopus-carousel-frontend' ),
			),
			$this->transform->get_asset_handles()
		);
	}
}
