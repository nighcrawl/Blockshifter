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

	public function test_adds_css_custom_properties_for_columns_and_gap(): void {
		$result = $this->transform->render( '<div class="wp-block-group"><div>one</div></div>', array() );

		$this->assertStringContainsString( '--blockshifter-masonry-columns:', $result );
		$this->assertStringContainsString( '--blockshifter-masonry-gap:', $result );
	}

	public function test_defaults_to_three_columns_when_no_config(): void {
		$result = $this->transform->render( '<div><div>one</div></div>', array() );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 3;', $result );
	}

	public function test_defaults_to_sixteen_pixel_gap_when_no_config(): void {
		$result = $this->transform->render( '<div><div>one</div></div>', array() );

		$this->assertStringContainsString( '--blockshifter-masonry-gap: 16px;', $result );
	}

	public function test_passes_columns_from_block_config(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'columns' => 4 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 4;', $result );
	}

	public function test_passes_gap_from_block_config(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'gap' => 24 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-gap: 24px;', $result );
	}

	public function test_clamps_columns_to_minimum_of_one(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'columns' => 0 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-columns: 1;', $result );
	}

	public function test_clamps_gap_to_minimum_of_zero(): void {
		$block = array( 'attrs' => array( 'blockshifterConfig' => array( 'masonry' => array( 'gap' => -10 ) ) ) );

		$result = $this->transform->render( '<div><div>one</div></div>', $block );

		$this->assertStringContainsString( '--blockshifter-masonry-gap: 0px;', $result );
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
