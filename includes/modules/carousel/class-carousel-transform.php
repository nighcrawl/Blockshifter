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

		return $this->wrap_as_splide( $this->mark_direct_children_as_slides( $block_content ) );
	}

	/**
	 * Add the `splide__slide` class to every element one level directly
	 * inside the block's own wrapper element — not deeper descendants.
	 */
	private function mark_direct_children_as_slides( string $html ): string {
		$processor = new WP_HTML_Tag_Processor( $html );
		$depth     = 0;
		$root_seen = false;

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
				if ( ! $this->is_void_element( $processor->get_tag() ) ) {
					$depth = 1;
				}
				continue;
			}

			if ( 1 === $depth ) {
				$processor->add_class( 'splide__slide' );
			}

			if ( ! $this->is_void_element( $processor->get_tag() ) ) {
				++$depth;
			}
		}

		return $processor->get_updated_html();
	}

	private function wrap_as_splide( string $inner_html ): string {
		return '<div class="splide">'
			. '<div class="splide__track">'
			. '<div class="splide__list">' . $inner_html . '</div>'
			. '</div>'
			. '</div>';
	}

	private function is_void_element( ?string $tag_name ): bool {
		return null !== $tag_name && in_array( $tag_name, self::VOID_ELEMENTS, true );
	}
}
