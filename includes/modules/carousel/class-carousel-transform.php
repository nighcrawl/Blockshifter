<?php
/**
 * Blockshifter_Carousel_Transform class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Module 1 (MVP): wraps a block's rendered content as a Splide carousel.
 */
final class Blockshifter_Carousel_Transform implements Blockshifter_Transform {

	const SLUG = 'carousel';

	/**
	 * HTML void elements never receive a closing tag, so they must not
	 * increment WP_HTML_Tag_Processor's nesting depth while we walk it.
	 *
	 * @var string[]
	 */
	private const VOID_ELEMENTS = array(
		'AREA',
		'BASE',
		'BR',
		'COL',
		'EMBED',
		'HR',
		'IMG',
		'INPUT',
		'LINK',
		'META',
		'PARAM',
		'SOURCE',
		'TRACK',
		'WBR',
	);

	public function get_slug(): string {
		return self::SLUG;
	}

	public function get_allowed_blocks(): array {
		return array( 'core/gallery', 'core/group', 'core/post-template' );
	}

	public function get_asset_handles(): array {
		return array(
			'scripts' => array( 'blockshifter-carousel-frontend' ),
			'styles'  => array( 'blockshifter-carousel-frontend' ),
		);
	}

	public function render( string $block_content, array $block ): string {
		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}

		$config  = $block['attrs']['blockshifterConfig']['carousel'] ?? array();
		$options = $this->build_splide_options( $config );
		$shape   = $this->mark_slides( $block_content );

		if ( $shape->is_list_root() ) {
			return $this->wrap_list_root( $shape, $options );
		}

		return $this->insert_splide_track( $this->mark_root( $shape, $options ), $shape );
	}

	/**
	 * Mark the root element's direct children as slides, and read what the
	 * rest of the transform needs about the root's shape: its tag, the
	 * widest alignment among its slides, and whether a `<figcaption>` sits
	 * first or last among its direct children (core/gallery's own caption).
	 *
	 * A direct-child `<figcaption>` is never a slide: it captions the root
	 * `<figure>` as a whole, and is only valid HTML as that `<figure>`'s
	 * first or last child — see insert_splide_track(), which keeps it there.
	 *
	 * Also records the widest `alignwide`/`alignfull` found among the
	 * slides: WordPress's own layout CSS targets those classes with a
	 * direct-child selector (e.g. `.is-layout-constrained > .alignfull`),
	 * which the inserted `.splide__track`/`.splide__list` wrapper breaks for
	 * the slides themselves. Slides can't each bleed independently — they
	 * must share one width to slide correctly — so the carousel as a whole
	 * takes on the alignment instead (see mark_root()/wrap_list_root()).
	 */
	private function mark_slides( string $html ): Blockshifter_Carousel_Shape {
		$processor          = new WP_HTML_Tag_Processor( $html );
		$depth              = 0;
		$root_tag           = '';
		$widest_slide_align = '';
		$first_child_tag    = '';
		$last_child_tag     = '';
		$child_count        = 0;

		while ( $processor->next_token() ) {
			if ( '#tag' !== $processor->get_token_type() ) {
				continue;
			}

			if ( $processor->is_tag_closer() ) {
				--$depth;
				continue;
			}

			$tag = $processor->get_tag();

			if ( '' === $root_tag ) {
				$root_tag = $tag;

				if ( ! $this->is_void_element( $tag ) ) {
					$depth = 1;
				}
				continue;
			}

			if ( 1 === $depth ) {
				$first_child_tag = '' === $first_child_tag ? $tag : $first_child_tag;
				$last_child_tag  = $tag;
				++$child_count;

				if ( 'FIGCAPTION' !== $tag ) {
					$processor->add_class( 'splide__slide' );
					$widest_slide_align = $this->widest_alignment( $widest_slide_align, $this->slide_alignment( $processor ) );
				}
			}

			if ( ! $this->is_void_element( $tag ) ) {
				++$depth;
			}
		}

		$is_figure       = 'FIGURE' === $root_tag;
		$leading_caption = $is_figure && 'FIGCAPTION' === $first_child_tag;

		return new Blockshifter_Carousel_Shape(
			$processor->get_updated_html(),
			$root_tag,
			$widest_slide_align,
			$leading_caption,
			// A lone caption is already handled as the leading one.
			$is_figure && 'FIGCAPTION' === $last_child_tag && ! ( $leading_caption && 1 === $child_count )
		);
	}

	/**
	 * Turn the block's own wrapper element into the `.splide` root itself
	 * (merging the `splide` class and `data-splide` config onto it, rather
	 * than adding a new wrapper around it), so its children end up as
	 * direct children of the `.splide__list` that insert_splide_track()
	 * inserts inside it.
	 *
	 */
	private function mark_root( Blockshifter_Carousel_Shape $shape, array $options ): string {
		$processor = new WP_HTML_Tag_Processor( $shape->html );
		$processor->next_tag();
		$this->add_splide_root_attributes( $processor, $shape->align, $options );

		return $processor->get_updated_html();
	}

	/**
	 * A `<ul>`/`<ol>` root (core/post-template) may only contain `<li>`, so
	 * the Splide wrappers can't be inserted inside it the way they are for
	 * Gallery/Group. Instead the native list itself becomes `.splide__list`
	 * — unchanged apart from that one class — and the `.splide` root and
	 * `.splide__track` are added *around* it: the minimum Splide needs,
	 * without breaking the list's own semantics.
	 *
	 */
	private function wrap_list_root( Blockshifter_Carousel_Shape $shape, array $options ): string {
		$list = new WP_HTML_Tag_Processor( $shape->html );
		$list->next_tag();
		$list->add_class( 'splide__list' );

		$wrapper = new WP_HTML_Tag_Processor( '<div><div class="splide__track">' );
		$wrapper->next_tag();
		$this->add_splide_root_attributes( $wrapper, $shape->align, $options );

		return $wrapper->get_updated_html() . $list->get_updated_html() . '</div></div>';
	}

	private function add_splide_root_attributes( WP_HTML_Tag_Processor $processor, string $align, array $options ): void {
		$processor->add_class( 'splide' );

		if ( '' !== $align ) {
			$processor->add_class( 'align' . $align );
		}

		$processor->set_attribute( 'data-splide', wp_json_encode( $options ) );
	}

	private function slide_alignment( WP_HTML_Tag_Processor $processor ): string {
		if ( $processor->has_class( 'alignfull' ) ) {
			return 'full';
		}

		if ( $processor->has_class( 'alignwide' ) ) {
			return 'wide';
		}

		return '';
	}

	private function widest_alignment( string $a, string $b ): string {
		$rank = array(
			''     => 0,
			'wide' => 1,
			'full' => 2,
		);

		return $rank[ $b ] > $rank[ $a ] ? $b : $a;
	}

	/**
	 * Insert `.splide__track > .splide__list` immediately inside the root
	 * element prepared by mark_root(), wrapping its children (now marked as
	 * slides) without disturbing the root tag itself.
	 *
	 * A root `<figure>`'s own leading/trailing `<figcaption>` (see
	 * mark_slides()) is left outside the track, still the first/last child
	 * of its `<figure>`, exactly where WordPress rendered it. A
	 * `<figcaption>` can't contain another one, so the leading caption ends
	 * at the inner HTML's first `</figcaption>`, and the trailing one starts
	 * at its last `<figcaption`.
	 *
	 */
	private function insert_splide_track( string $html, Blockshifter_Carousel_Shape $shape ): string {
		$root_tag_ends_at = strpos( $html, '>' );

		if ( false === $root_tag_ends_at ) {
			return $html;
		}

		$root_closing_tag_starts_at = strrpos( $html, '</' );

		if ( false === $root_closing_tag_starts_at || $root_closing_tag_starts_at <= $root_tag_ends_at ) {
			return $html;
		}

		$inner    = substr( $html, $root_tag_ends_at + 1, $root_closing_tag_starts_at - $root_tag_ends_at - 1 );
		$leading  = '';
		$trailing = '';

		if ( $shape->leading_caption ) {
			$caption_ends_at = strpos( $inner, '</figcaption>' ) + strlen( '</figcaption>' );
			$leading         = substr( $inner, 0, $caption_ends_at );
			$inner           = substr( $inner, $caption_ends_at );
		}

		if ( $shape->trailing_caption ) {
			$caption_starts_at = strrpos( $inner, '<figcaption' );
			$trailing          = substr( $inner, $caption_starts_at );
			$inner             = substr( $inner, 0, $caption_starts_at );
		}

		return substr( $html, 0, $root_tag_ends_at + 1 )
			. $leading
			. '<div class="splide__track"><div class="splide__list">'
			. $inner
			. '</div></div>'
			. $trailing
			. substr( $html, $root_closing_tag_starts_at );
	}

	/**
	 * Map Blockshifter's own config shape to Splide's own option names —
	 * consumed automatically by Splide's `data-splide` JSON attribute, so
	 * the front-end init script needs no changes to honour these settings.
	 *
	 * @param array{perPage?: int, autoplay?: bool, loop?: bool} $config
	 */
	private function build_splide_options( array $config ): array {
		$options = array(
			'perPage' => max( 1, (int) ( $config['perPage'] ?? 1 ) ),
		);

		if ( ! empty( $config['autoplay'] ) ) {
			$options['autoplay'] = true;
		}

		if ( ! empty( $config['loop'] ) ) {
			// Splide has no plain boolean "loop" option — infinite looping
			// is enabled via its `type: 'loop'` slider mode instead.
			$options['type'] = 'loop';
		}

		return $options;
	}

	private function is_void_element( ?string $tag_name ): bool {
		return null !== $tag_name && in_array( $tag_name, self::VOID_ELEMENTS, true );
	}
}
