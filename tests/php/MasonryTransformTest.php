<?php

namespace Blockshifter\Tests;

use Blockshifter_Masonry_Transform;
use Blockshifter\Tests\Fakes\HtmlRenderingTestCase;

final class MasonryTransformTest extends HtmlRenderingTestCase {

	/**
	 * @var Blockshifter_Masonry_Transform
	 */
	private $transform;

	protected function setUp(): void {
		parent::setUp();
		$this->transform = new Blockshifter_Masonry_Transform();
	}

	public function test_slug_is_masonry(): void {
		$this->assertSame( 'masonry', $this->transform->get_slug() );
	}

	public function test_allowed_blocks_default_to_gallery_and_group(): void {
		$this->assertSame( array( 'core/gallery', 'core/group' ), $this->transform->get_allowed_blocks() );
	}

	public function test_adds_masonry_class_to_root_element(): void {
		$result = $this->transform->render( '<ul class="wp-block-gallery"><li>one</li></ul>', array() );

		$this->assertMatchesRegularExpression( '/^<ul [^>]*class="wp-block-gallery blockshifter-masonry"/', $result );
	}

	public function test_adds_css_custom_property_for_columns(): void {
		$result = $this->transform->render( '<div class="wp-block-group"><div>one</div></div>', array() );

		$this->assertStringContainsString( '--blockshifter-masonry-columns:', $result );
	}

	public function test_never_writes_a_gap_declaration(): void {
		$result = $this->transform->render( '<div class="wp-block-group"><div>one</div></div>', array() );

		$this->assertStringNotContainsString( 'gap:', $result );
	}

	public function test_defaults_to_three_columns_when_no_config(): void {
		$result = $this->transform->render( '<div><div>one</div></div>', array() );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 3;', $result );
	}

	public function test_passes_columns_from_block_config(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'columns' => 4 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 4;', $result );
	}

	public function test_ignores_legacy_gap_config(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'gap' => 24 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringNotContainsString( 'gap:', $result );
	}

	public function test_clamps_columns_to_minimum_of_one(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'columns' => 0 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 1;', $result );
	}

	public function test_gallery_reads_native_columns_attribute_instead_of_config(): void {
		$block = array(
			'blockName' => 'core/gallery',
			'attrs'     => array(
				'columns'            => 5,
				'blockshifterConfig' => array( 'masonry' => array( 'columns' => 2 ) ),
			),
		);

		$result = $this->transform->render( '<figure class="wp-block-gallery"><figure>one</figure></figure>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 5;', $result );
	}

	public function test_gallery_defaults_to_three_columns_when_native_attribute_unset(): void {
		$block = array(
			'blockName' => 'core/gallery',
			'attrs'     => array(),
		);

		$result = $this->transform->render( '<figure class="wp-block-gallery"><figure>one</figure></figure>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 3;', $result );
	}

	public function test_gallery_never_writes_a_gap_declaration(): void {
		$block = array(
			'blockName' => 'core/gallery',
			'attrs'     => array( 'columns' => 4 ),
		);

		$result = $this->transform->render( '<figure class="wp-block-gallery"><figure>one</figure></figure>', $block );

		$this->assertStringNotContainsString( 'gap:', $result );
	}

	public function test_group_uses_blockshifter_config_for_columns_only(): void {
		$block = array(
			'blockName' => 'core/group',
			'attrs'     => array( 'blockshifterConfig' => array( 'masonry' => array( 'columns' => 5 ) ) ),
		);

		$result = $this->transform->render( '<div class="wp-block-group"><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 5;', $result );
		$this->assertStringNotContainsString( 'gap:', $result );
	}

	public function test_preserves_existing_inline_style_on_root_element(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group" style="background-color:red;">one</div>',
			array()
		);

		$this->assertStringContainsString( 'background-color:red', $result );
		$this->assertStringContainsString( '--blockshifter-masonry-columns:', $result );
	}

	public function test_preserves_native_gap_custom_property_on_root_element(): void {
		$result = $this->transform->render(
			'<div class="wp-block-group" style="--wp--style--block-gap: 24px;">one</div>',
			array()
		);

		$this->assertStringContainsString( '--wp--style--block-gap: 24px', $result );
	}

	public function test_does_not_modify_empty_block_content(): void {
		$result = $this->transform->render( '', array() );

		$this->assertSame( '', $result );
	}

	public function test_does_not_modify_whitespace_only_block_content(): void {
		$result = $this->transform->render( '   ', array() );

		$this->assertSame( '   ', $result );
	}

	public function test_preserves_existing_classes_on_root_element(): void {
		$result = $this->transform->render( '<div class="wp-block-group custom-class"><div>one</div></div>', array() );

		$this->assertStringContainsString( 'wp-block-group', $result );
		$this->assertStringContainsString( 'custom-class', $result );
	}

	public function test_asset_handles_are_scoped_to_the_masonry_frontend_bundle(): void {
		$this->assertSame(
			array(
				'scripts' => array( 'blockshifter-masonry-frontend' ),
				'styles'  => array( 'blockshifter-masonry-frontend' ),
			),
			$this->transform->get_asset_handles()
		);
	}
}
