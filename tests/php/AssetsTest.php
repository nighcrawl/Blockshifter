<?php

namespace Blocktopus\Tests;

use Blocktopus_Assets;
use Blocktopus_Module_Registry;
use Blocktopus\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;

final class AssetsTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Blocktopus_Module_Registry::reset();
	}

	protected function tearDown(): void {
		Blocktopus_Module_Registry::reset();
		Monkey\tearDown();
		parent::tearDown();
	}

	private function make_fake_module(): FakeTransform {
		return new FakeTransform(
			'fake',
			array( 'blocktopus/test-transform-block' ),
			array(
				'scripts' => array( 'blocktopus-fake-frontend' ),
				'styles'  => array( 'blocktopus-fake-frontend' ),
			)
		);
	}

	public function test_enqueues_module_assets_when_has_block_finds_the_module_active(): void {
		$module = $this->make_fake_module();
		Blocktopus_Module_Registry::register( $module );

		Filters\expectApplied( 'blocktopus/fake/allowed_blocks' )
			->once()
			->andReturn( array( 'blocktopus/test-transform-block' ) );

		Functions\expect( 'has_block' )
			->once()
			->with( 'blocktopus/test-transform-block', 'CONTENT_WITH_THE_BLOCK' )
			->andReturn( true );

		Functions\expect( 'wp_enqueue_script' )->once()->with( 'blocktopus-fake-frontend' );
		Functions\expect( 'wp_enqueue_style' )->once()->with( 'blocktopus-fake-frontend' );

		Blocktopus_Assets::maybe_enqueue_for_content( 'CONTENT_WITH_THE_BLOCK' );
	}

	public function test_enqueues_nothing_when_has_block_finds_no_match(): void {
		$module = $this->make_fake_module();
		Blocktopus_Module_Registry::register( $module );

		Filters\expectApplied( 'blocktopus/fake/allowed_blocks' )
			->once()
			->andReturn( array( 'blocktopus/test-transform-block' ) );

		Functions\expect( 'has_block' )
			->once()
			->with( 'blocktopus/test-transform-block', 'CONTENT_WITHOUT_THE_BLOCK' )
			->andReturn( false );

		Functions\expect( 'wp_enqueue_script' )->never();
		Functions\expect( 'wp_enqueue_style' )->never();

		Blocktopus_Assets::maybe_enqueue_for_content( 'CONTENT_WITHOUT_THE_BLOCK' );
	}
}
