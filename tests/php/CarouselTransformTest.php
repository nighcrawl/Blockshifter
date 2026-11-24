<?php

namespace Blockshifter\Tests;

use Blockshifter_Carousel_Transform;
use Blockshifter\Tests\Fakes\HtmlRenderingTestCase;

final class CarouselTransformTest extends HtmlRenderingTestCase {

	/**
	 * @var Blockshifter_Carousel_Transform
	 */
	private $transform;

	protected function setUp(): void {
		parent::setUp();
		$this->transform = new Blockshifter_Carousel_Transform();
	}

	public function test_slug_is_carousel(): void {
		$this->assertSame( 'carousel', $this->transform->get_slug() );
	}

	public function test_allowed_blocks_default_to_gallery_group_and_post_template(): void {
		$this->assertSame( array( 'core/gallery', 'core/group', 'core/post-template' ), $this->transform->get_allowed_blocks() );
	}

	public function test_turns_the_blocks_own_wrapper_into_the_splide_root(): void {
		$result = $this->transform->render(
			'<figure class="wp-block-gallery"><figure class="wp-block-image">one</figure></figure>',
			array()
		);

		// The original wrapper tag gains the splide class — it is not
		// nested inside a *new* wrapper — so its children end up as
		// direct children of .splide__list, which Splide requires.
		$this->assertSame(
			'<figure data-splide="{"perPage":1}" class="wp-block-gallery splide">'
			. '<div class="splide__track"><div class="splide__list">'
			. '<figure class="wp-block-image splide__slide">one</figure>'
			. '</div></div></figure>',
			$result
		);
	}

	public function test_marks_direct_children_as_slides(): void {
		$result = $this->transform->render(
			'<figure class="wp-block-gallery"><figure class="wp-block-image item">one</figure><figure class="wp-block-image item">two</figure></figure>',
			array()
		);

		$this->assertSame( 2, substr_count( $result, 'splide__slide' ) );
		// Existing classes on the direct children must be preserved.
		$this->assertStringContainsString( 'class="wp-block-image item splide__slide"', $result );
	}

	public function test_keeps_a_gallerys_own_caption_out_of_the_slides_as_the_last_child_of_its_figure(): void {
		// core/gallery (WP >= 5.9) renders its caption as the *last* direct
		// child of its root <figure>, after the images. It is not a slide,
		// and a <figcaption> is only valid as the first or last child of
		// its <figure> — so it stays there, after the track.
		$result = $this->transform->render(
			'<figure class="wp-block-gallery">'
			. '<figure class="wp-block-image"><img src="a.jpg"/><figcaption class="wp-element-caption">image caption</figcaption></figure>'
			. '<figure class="wp-block-image"><img src="b.jpg"/></figure>'
			. '<figcaption class="blocks-gallery-caption wp-element-caption">gallery caption</figcaption>'
			. '</figure>',
			array()
		);

		$this->assertSame( 2, substr_count( $result, 'splide__slide' ) );
		$this->assertStringContainsString(
			'<figure class="wp-block-image splide__slide"><img src="a.jpg"/><figcaption class="wp-element-caption">image caption</figcaption></figure>',
			$result
		);
		$this->assertStringEndsWith(
			'</div></div><figcaption class="blocks-gallery-caption wp-element-caption">gallery caption</figcaption></figure>',
			$result
		);
	}

	public function test_keeps_a_leading_figcaption_before_the_track(): void {
		$result = $this->transform->render(
			'<figure class="wp-block-gallery"><figcaption>caption</figcaption><figure class="wp-block-image">one</figure></figure>',
			array()
		);

		$this->assertSame( 1, substr_count( $result, 'splide__slide' ) );
		$this->assertStringContainsString(
			'class="wp-block-gallery splide"><figcaption>caption</figcaption><div class="splide__track"><div class="splide__list">',
			$result
		);
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
		$result = $this->transform->render( '<figure class="wp-block-gallery"><figure class="wp-block-image">only</figure></figure>', array() );

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
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'carousel' => array( 'perPage' => 3 ) ) ) );

		$result = $this->transform->render( '<ul><li>one</li></ul>', $block );

		$this->assertStringContainsString( 'data-splide="{"perPage":3}"', $result );
	}

	public function test_omits_autoplay_when_disabled_and_includes_it_when_enabled(): void {
		$disabled = array( 'attrs' => array( 'blockshifterConfig' => array( 'carousel' => array( 'autoplay' => false ) ) ) );
		$enabled  = array( 'attrs' => array( 'blockshifterConfig' => array( 'carousel' => array( 'autoplay' => true ) ) ) );

		$this->assertStringNotContainsString( 'autoplay', $this->transform->render( '<ul><li>one</li></ul>', $disabled ) );
		$this->assertStringContainsString( '"autoplay":true', $this->transform->render( '<ul><li>one</li></ul>', $enabled ) );
	}

	public function test_maps_loop_to_splides_loop_type_when_enabled(): void {
		$looping     = array( 'attrs' => array( 'blockshifterConfig' => array( 'carousel' => array( 'loop' => true ) ) ) );
		$not_looping = array( 'attrs' => array( 'blockshifterConfig' => array( 'carousel' => array( 'loop' => false ) ) ) );

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

	public function test_keeps_a_lone_figcaption_exactly_once(): void {
		$result = $this->transform->render( '<figure class="wp-block-gallery"><figcaption>caption</figcaption></figure>', array() );

		$this->assertSame( 1, substr_count( $result, '<figcaption>caption</figcaption>' ) );
		$this->assertSame( 0, substr_count( $result, 'splide__slide' ) );
	}

	public function test_keeps_a_post_templates_list_intact_inside_new_splide_wrappers(): void {
		// core/post-template renders as <ul> + one <li class="wp-block-post ..."> per
		// post (optionally with a data-wp-key for enhanced pagination). A <ul> may
		// only contain <li>, so the Splide wrappers can't go *inside* it the way
		// they do for Gallery/Group: the native list itself becomes .splide__list,
		// unchanged except for that class, and .splide/.splide__track wrap it.
		$result = $this->transform->render(
			'<ul class="wp-block-post-template">'
			. '<li data-wp-key="post-template-item-1" class="wp-block-post post-1">one</li>'
			. '<li data-wp-key="post-template-item-2" class="wp-block-post post-2">two</li>'
			. '</ul>',
			array( 'blockName' => 'core/post-template' )
		);

		$this->assertSame(
			'<div class="splide" data-splide="{"perPage":1}"><div class="splide__track">'
			. '<ul class="wp-block-post-template splide__list">'
			. '<li data-wp-key="post-template-item-1" class="wp-block-post post-1 splide__slide">one</li>'
			. '<li data-wp-key="post-template-item-2" class="wp-block-post post-2 splide__slide">two</li>'
			. '</ul></div></div>',
			$result
		);
	}

	public function test_treats_an_ordered_list_root_like_an_unordered_one(): void {
		$result = $this->transform->render( '<ol class="list"><li>one</li></ol>', array() );

		$this->assertSame(
			'<div class="splide" data-splide="{"perPage":1}"><div class="splide__track">'
			. '<ol class="list splide__list"><li class="splide__slide">one</li></ol>'
			. '</div></div>',
			$result
		);
	}

	public function test_propagates_a_slide_alignment_to_the_wrapper_of_a_list_root(): void {
		$result = $this->transform->render( '<ul class="list"><li class="alignwide">one</li></ul>', array() );

		$this->assertStringStartsWith( '<div class="splide alignwide" data-splide="{"perPage":1}">', $result );
		$this->assertStringContainsString( '<ul class="list splide__list">', $result );
	}

	public function test_degrades_gracefully_when_the_query_has_no_results(): void {
		// render_block_core_post_template() returns '' when the query is empty.
		$result = $this->transform->render( '', array( 'blockName' => 'core/post-template' ) );

		$this->assertSame( '', $result );
	}

	public function test_asset_handles_are_scoped_to_the_carousel_frontend_bundle(): void {
		$this->assertSame(
			array(
				'scripts' => array( 'blockshifter-carousel-frontend' ),
				'styles'  => array( 'blockshifter-carousel-frontend' ),
			),
			$this->transform->get_asset_handles()
		);
	}
}
