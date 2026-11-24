<?php
/**
 * Blockshifter_Carousel_Shape class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * What the Carousel transform reads about a Target Block's rendered root
 * while marking its slides (see Blockshifter_Carousel_Transform::mark_slides()),
 * handed to every later step instead of a loosely-typed array.
 */
final class Blockshifter_Carousel_Shape {

	/**
	 * Root tags that may only contain `<li>`, so the Splide wrappers go
	 * around them instead of inside.
	 *
	 * @var string[]
	 */
	private const LIST_ELEMENTS = array( 'UL', 'OL' );

	/** The block's HTML, direct children already marked as slides. */
	public string $html;

	/** The root element's tag name, uppercase (e.g. `FIGURE`, `UL`). */
	public string $root_tag;

	/** Widest alignment among the slides: `''`, `wide` or `full`. */
	public string $align;

	/** A root `<figure>` whose first direct child is its `<figcaption>`. */
	public bool $leading_caption;

	/** A root `<figure>` whose last direct child is its `<figcaption>`. */
	public bool $trailing_caption;

	public function __construct( string $html, string $root_tag, string $align, bool $leading_caption, bool $trailing_caption ) {
		$this->html             = $html;
		$this->root_tag         = $root_tag;
		$this->align            = $align;
		$this->leading_caption  = $leading_caption;
		$this->trailing_caption = $trailing_caption;
	}

	/**
	 * A `<ul>`/`<ol>` root (e.g. core/post-template), which can't take the
	 * Splide wrappers inside it.
	 */
	public function is_list_root(): bool {
		return in_array( $this->root_tag, self::LIST_ELEMENTS, true );
	}
}
