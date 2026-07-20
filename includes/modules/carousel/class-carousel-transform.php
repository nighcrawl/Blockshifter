<?php
/**
 * Blocktopus_Carousel_Transform class.
 *
 * @package Blocktopus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Module 1 (MVP): wraps a block's rendered content as a Splide carousel.
 */
final class Blocktopus_Carousel_Transform implements Blocktopus_Transform {

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
		return array( 'core/gallery', 'core/group' );
	}

	public function get_asset_handles(): array {
		return array(
			'scripts' => array( 'blocktopus-carousel-frontend' ),
			'styles'  => array( 'blocktopus-carousel-frontend' ),
		);
	}

	public function render( string $block_content, array $block ): string {
		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}

		$config  = $block['attrs']['blocktopusConfig']['carousel'] ?? array();
		$prepped = $this->mark_root_and_slides( $block_content, $config );

		return $this->insert_splide_track( $prepped );
	}

	/**
	 * Turn the block's own wrapper element into the `.splide` root itself
	 * (merging the `splide` class and `data-splide` config onto it, rather
	 * than adding a new wrapper around it — Splide needs its slides to be
	 * direct children of `.splide__list`, not nested one level deeper
	 * inside the original wrapper), and mark its direct children as slides.
	 *
	 * Also propagates the widest `alignwide`/`alignfull` found among the
	 * slides up to the root: WordPress's own layout CSS targets those
	 * classes with a direct-child selector (e.g. `.is-layout-constrained >
	 * .alignfull`), which the newly-inserted `.splide__track`/`.splide__list`
	 * wrapper breaks for the slides themselves. Slides can't each bleed
	 * independently — they must share one width to slide correctly — so
	 * the carousel as a whole takes on the alignment instead.
	 *
	 * @param array{perPage?: int, autoplay?: bool, loop?: bool} $config
	 */
	private function mark_root_and_slides( string $html, array $config ): string {
		$processor          = new WP_HTML_Tag_Processor( $html );
		$depth              = 0;
		$root_seen          = false;
		$widest_slide_align = '';

		while ( $processor->next_token() ) {
			if ( '#tag' !== $processor->get_token_type() ) {
				continue;
			}

			if ( $processor->is_tag_closer() ) {
				--$depth;
				continue;
			}

			if ( ! $root_seen ) {
				$root_seen = true;
				$processor->set_bookmark( 'root' );

				if ( ! $this->is_void_element( $processor->get_tag() ) ) {
					$depth = 1;
				}
				continue;
			}

			if ( 1 === $depth ) {
				$processor->add_class( 'splide__slide' );
				$widest_slide_align = $this->widest_alignment( $widest_slide_align, $this->slide_alignment( $processor ) );
			}

			if ( ! $this->is_void_element( $processor->get_tag() ) ) {
				++$depth;
			}
		}

		$processor->seek( 'root' );
		$processor->add_class( 'splide' );

		if ( '' !== $widest_slide_align ) {
			$processor->add_class( 'align' . $widest_slide_align );
		}

		$processor->set_attribute( 'data-splide', wp_json_encode( $this->build_splide_options( $config ) ) );

		return $processor->get_updated_html();
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
	 * element prepared by mark_root_and_slides(), wrapping its children
	 * (now marked as slides) without disturbing the root tag itself.
	 */
	private function insert_splide_track( string $html ): string {
		$root_tag_ends_at = strpos( $html, '>' );

		if ( false === $root_tag_ends_at ) {
			return $html;
		}

		$root_closing_tag_starts_at = strrpos( $html, '</' );

		if ( false === $root_closing_tag_starts_at || $root_closing_tag_starts_at <= $root_tag_ends_at ) {
			return $html;
		}

		return substr( $html, 0, $root_tag_ends_at + 1 )
			. '<div class="splide__track"><div class="splide__list">'
			. substr( $html, $root_tag_ends_at + 1, $root_closing_tag_starts_at - $root_tag_ends_at - 1 )
			. '</div></div>'
			. substr( $html, $root_closing_tag_starts_at );
	}

	/**
	 * Map Blocktopus's own config shape to Splide's own option names —
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
