<?php

namespace Blockshifter\Tests;

use Blockshifter_Assets;
use Blockshifter_Module_Registry;
use Blockshifter\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;

final class AssetsTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Blockshifter_Module_Registry::reset();
	}

	protected function tearDown(): void {
		Blockshifter_Module_Registry::reset();
		Monkey\tearDown();
		parent::tearDown();
	}

	private function make_fake_module(): FakeTransform {
		return new FakeTransform(
			'fake',
			array( 'blockshifter/test-transform-block' ),
			array(
				'scripts' => array( 'blockshifter-fake-frontend' ),
				'styles'  => array( 'blockshifter-fake-frontend' ),
			)
		);
	}

	public function test_enqueues_module_assets_when_has_block_finds_the_module_active(): void {
		$module = $this->make_fake_module();
		Blockshifter_Module_Registry::register( $module );

		Filters\expectApplied( 'blockshifter/fake/allowed_blocks' )
			->once()
			->andReturn( array( 'blockshifter/test-transform-block' ) );

		Functions\expect( 'has_block' )
			->once()
			->with( 'blockshifter/test-transform-block', 'CONTENT_WITH_THE_BLOCK' )
			->andReturn( true );

		Functions\expect( 'wp_enqueue_script' )->once()->with( 'blockshifter-fake-frontend' );
		Functions\expect( 'wp_enqueue_style' )->once()->with( 'blockshifter-fake-frontend' );

		Blockshifter_Assets::maybe_enqueue_for_content( 'CONTENT_WITH_THE_BLOCK' );
	}

	public function test_enqueues_nothing_when_has_block_finds_no_match(): void {
		$module = $this->make_fake_module();
		Blockshifter_Module_Registry::register( $module );

		Filters\expectApplied( 'blockshifter/fake/allowed_blocks' )
			->once()
			->andReturn( array( 'blockshifter/test-transform-block' ) );

		Functions\expect( 'has_block' )
			->once()
			->with( 'blockshifter/test-transform-block', 'CONTENT_WITHOUT_THE_BLOCK' )
			->andReturn( false );

		Functions\expect( 'wp_enqueue_script' )->never();
		Functions\expect( 'wp_enqueue_style' )->never();

		Blockshifter_Assets::maybe_enqueue_for_content( 'CONTENT_WITHOUT_THE_BLOCK' );
	}
}
