<?php

namespace Blockshifter\Tests;

use Blockshifter_Assets;
use Blockshifter_Module_Registry;
use Blockshifter_Render;
use Blockshifter\Tests\Fakes\FakeTransform;
use Brain\Monkey;
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
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
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

	public function test_register_hooks_enqueue_onto_the_module_rendered_action(): void {
		Blockshifter_Assets::register();

		$this->assertNotFalse(
			has_action( Blockshifter_Render::MODULE_RENDERED_ACTION, array( Blockshifter_Assets::class, 'enqueue' ) )
		);
	}

	public function test_enqueue_enqueues_every_declared_script_and_style_handle(): void {
		Functions\expect( 'wp_enqueue_script' )->once()->with( 'blockshifter-fake-frontend' );
		Functions\expect( 'wp_enqueue_style' )->once()->with( 'blockshifter-fake-frontend' );

		Blockshifter_Assets::enqueue( $this->make_fake_module() );
	}

	public function test_enqueue_does_nothing_for_a_module_without_assets(): void {
		Functions\expect( 'wp_enqueue_script' )->never();
		Functions\expect( 'wp_enqueue_style' )->never();

		Blockshifter_Assets::enqueue( new FakeTransform( 'bare' ) );
	}
}
