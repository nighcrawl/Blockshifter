<?php
/**
 * Blockshifter_Masonry_Transform class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Module Masonry: transforms a block into a CSS Grid masonry layout.
 */
final class Blockshifter_Masonry_Transform implements Blockshifter_Transform {

	const SLUG = 'masonry';

	public function get_slug(): string {
		return self::SLUG;
	}

	public function get_allowed_blocks(): array {
		return array( 'core/gallery', 'core/group' );
	}

	public function get_asset_handles(): array {
		return array(
			'scripts' => array( 'blockshifter-masonry-frontend' ),
			'styles'  => array( 'blockshifter-masonry-frontend' ),
		);
	}

	public function render( string $block_content, array $block ): string {
		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}

		$config = $block['attrs']['blockshifterConfig']['masonry'] ?? array();
		return $this->add_masonry_classes_and_props( $block_content, $config );
	}

	/**
	 * Add CSS Grid classes and custom properties to the block's root element.
	 *
	 * @param array{columns?: int, gap?: int} $config
	 */
	private function add_masonry_classes_and_props( string $html, array $config ): string {
		$processor = new WP_HTML_Tag_Processor( $html );

		if ( ! $processor->next_tag() ) {
			return $html;
		}

		$processor->add_class( 'blockshifter-masonry' );

		$columns = max( 1, (int) ( $config['columns'] ?? 3 ) );
		$gap     = max( 0, (int) ( $config['gap'] ?? 16 ) );

		$processor->set_attribute( 'style', sprintf(
			'--blockshifter-masonry-columns: %d; --blockshifter-masonry-gap: %dpx;',
			$columns,
			$gap
		) );

		return $processor->get_updated_html();
	}
}
