<?php

namespace Blocktopus\Tests\Fakes;

use Blocktopus_Transform;

/**
 * Minimal Blocktopus_Transform test double, shared across test cases.
 */
final class FakeTransform implements Blocktopus_Transform {

	private $slug;
	private $allowed_blocks;
	private $asset_handles;

	public function __construct( string $slug, array $allowed_blocks = array(), array $asset_handles = array() ) {
		$this->slug           = $slug;
		$this->allowed_blocks = $allowed_blocks;
		$this->asset_handles  = $asset_handles;
	}

	public function get_slug(): string {
		return $this->slug;
	}

	public function get_allowed_blocks(): array {
		return $this->allowed_blocks;
	}

	public function get_asset_handles(): array {
		return $this->asset_handles;
	}

	public function render( string $block_content, array $block ): string {
		return $block_content;
	}
}
