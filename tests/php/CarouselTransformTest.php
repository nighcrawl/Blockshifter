<?php

namespace Blocktopus\Tests;

use Blocktopus_Carousel_Transform;
use Blocktopus\Tests\Fakes\HtmlRenderingTestCase;

final class CarouselTransformTest extends HtmlRenderingTestCase {

	/**
	 * @var Blocktopus_Carousel_Transform
	 */
	private $transform;

	protected function setUp(): void {
		parent::setUp();
		$this->transform = new Blocktopus_Carousel_Transform();
	}

	public function test_slug_is_carousel(): void {
		$this->assertSame( 'carousel', $this->transform->get_slug() );
	}

	public function test_allowed_blocks_default_to_gallery_and_group(): void {
		$this->assertSame( array( 'core/gallery', 'core/group' ), $this->transform->get_allowed_blocks() );
	}

	public function test_turns_the_blocks_own_wrapper_into_the_splide_root(): void {
		$result = $this->transform->render( '<ul class="wp-block-gallery"><li>one</li></ul>', array() );

		// The original wrapper tag gains the splide class — it is not
		// nested inside a *new* wrapper — so its children end up as
		// direct children of .splide__list, which Splide requires.
		$this->assertMatchesRegularExpression( '/^<ul [^>]*class="wp-block-gallery splide"/', $result );
		$this->assertStringContainsString( 'class="splide__track"', $result );
		$this->assertStringContainsString( '<div class="splide__list"><li class="splide__slide">one</li></div>', $result );
		$this->assertStringEndsWith( '</div></div></ul>', $result );
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

	public function test_defaults_to_per_page_one_with_no_config(): void {
		$result = $this->transform->render( '<ul><li>one</li></ul>', array() );

		$this->assertStringContainsString( 'data-splide="{"perPage":1}"', $result );
	}

	public function test_passes_per_page_from_block_config(): void {
		$block = array( 'attrs' => array( 'blocktopusConfig' => array( 'carousel' => array( 'perPage' => 3 ) ) ) );

		$result = $this->transform->render( '<ul><li>one</li></ul>', $block );

		$this->assertStringContainsString( 'data-splide="{"perPage":3}"', $result );
	}

	public function test_omits_autoplay_when_disabled_and_includes_it_when_enabled(): void {
		$disabled = array( 'attrs' => array( 'blocktopusConfig' => array( 'carousel' => array( 'autoplay' => false ) ) ) );
		$enabled  = array( 'attrs' => array( 'blocktopusConfig' => array( 'carousel' => array( 'autoplay' => true ) ) ) );

		$this->assertStringNotContainsString( 'autoplay', $this->transform->render( '<ul><li>one</li></ul>', $disabled ) );
		$this->assertStringContainsString( '"autoplay":true', $this->transform->render( '<ul><li>one</li></ul>', $enabled ) );
	}

	public function test_maps_loop_to_splides_loop_type_when_enabled(): void {
		$looping     = array( 'attrs' => array( 'blocktopusConfig' => array( 'carousel' => array( 'loop' => true ) ) ) );
		$not_looping = array( 'attrs' => array( 'blocktopusConfig' => array( 'carousel' => array( 'loop' => false ) ) ) );

		$this->assertStringContainsString( '"type":"loop"', $this->transform->render( '<ul><li>one</li></ul>', $looping ) );
		$this->assertStringNotContainsString( '"type"', $this->transform->render( '<ul><li>one</li></ul>', $not_looping ) );
	}

	public function test_does_not_add_an_align_class_to_the_root_when_no_slide_is_aligned(): void {
		$result = $this->transform->render( '<div class="wp-block-group"><div>one</div></div>', array() );

		$this->assertDoesNotMatchRegularExpression( '/class="[^"]*\balign(wide|full)\b/', $result );
	}

	public function test_propagates_alignwide_from_a_slide_to_the_root(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group"><div class="alignwide">one</div></div>',
			array()
		);

		$this->assertMatchesRegularExpression( '/^<div [^>]*class="wp-block-group splide alignwide"/', $result );
		// The slide itself keeps its own alignwide class too.
		$this->assertStringContainsString( 'class="alignwide splide__slide"', $result );
	}

	public function test_propagates_alignfull_from_a_slide_to_the_root(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group"><div class="alignfull">one</div></div>',
			array()
		);

		$this->assertMatchesRegularExpression( '/^<div [^>]*class="wp-block-group splide alignfull"/', $result );
	}

	public function test_propagates_the_widest_alignment_when_slides_disagree(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group"><div class="alignwide">one</div><div class="alignfull">two</div></div>',
			array()
		);

		$this->assertMatchesRegularExpression( '/^<div [^>]*class="wp-block-group splide alignfull"/', $result );
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
