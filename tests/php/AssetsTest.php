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

	public function test_register_hooks_module_asset_registration_onto_wp_enqueue_scripts_early(): void {
		Blockshifter_Assets::register();

		$this->assertSame(
			5,
			has_action( 'wp_enqueue_scripts', array( Blockshifter_Assets::class, 'register_module_assets' ) )
		);
	}

	public function test_registers_every_module_front_end_script_and_style_from_its_slug(): void {
		$plugin_dir = $this->make_plugin_dir( array( 'fake' ), true );
		Blockshifter_Module_Registry::register( $this->make_fake_module() );

		Functions\expect( 'wp_register_script' )->once()->with(
			'blockshifter-fake-frontend',
			'https://example.test/plugin/build/frontend/fake-init.js',
			array( 'wp-dom-ready' ),
			'abc123',
			true
		);
		Functions\expect( 'wp_register_style' )->once()->with(
			'blockshifter-fake-frontend',
			'https://example.test/plugin/build/frontend/fake-init.css',
			array(),
			BLOCKSHIFTER_VERSION
		);

		Blockshifter_Assets::register_frontend_assets( $plugin_dir, 'https://example.test/plugin/' );
	}

	public function test_registers_the_script_without_a_style_when_the_module_has_no_built_css(): void {
		$plugin_dir = $this->make_plugin_dir( array( 'fake' ), false );
		Blockshifter_Module_Registry::register( $this->make_fake_module() );

		Functions\expect( 'wp_register_script' )->once();
		Functions\expect( 'wp_register_style' )->never();

		Blockshifter_Assets::register_frontend_assets( $plugin_dir, 'https://example.test/plugin/' );
	}

	public function test_registers_nothing_for_a_module_whose_front_end_was_never_built(): void {
		$plugin_dir = $this->make_plugin_dir( array(), false );
		Blockshifter_Module_Registry::register( $this->make_fake_module() );

		Functions\expect( 'wp_register_script' )->never();
		Functions\expect( 'wp_register_style' )->never();

		Blockshifter_Assets::register_frontend_assets( $plugin_dir, 'https://example.test/plugin/' );
	}

	/**
	 * The handles each real Module enqueues at render time must be exactly
	 * the ones registered for it by slug convention — otherwise its assets
	 * would be enqueued but never registered, and silently never load.
	 */
	public function test_every_real_module_declares_the_handles_registered_by_convention(): void {
		foreach ( array( new \Blockshifter_Carousel_Transform(), new \Blockshifter_Masonry_Transform() ) as $module ) {
			$handle = Blockshifter_Assets::frontend_handle( $module->get_slug() );

			$this->assertSame(
				array(
					'scripts' => array( $handle ),
					'styles'  => array( $handle ),
				),
				$module->get_asset_handles()
			);
		}
	}

	public function test_editor_target_blocks_script_exposes_each_module_s_filtered_target_blocks(): void {
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Blockshifter_Module_Registry::register( $this->make_fake_module() );

		$this->assertSame(
			'window.blockshifterTargetBlocks = {"fake":["blockshifter\\/test-transform-block"]};',
			Blockshifter_Assets::editor_target_blocks_script()
		);
	}

	public function test_editor_target_blocks_script_is_an_empty_object_without_modules(): void {
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );

		$this->assertSame(
			'window.blockshifterTargetBlocks = {};',
			Blockshifter_Assets::editor_target_blocks_script()
		);
	}

	/**
	 * A throwaway plugin directory holding `build/frontend/{slug}-init.*`
	 * for each given slug.
	 *
	 * @param string[] $built_slugs
	 */
	private function make_plugin_dir( array $built_slugs, bool $with_css ): string {
		$plugin_dir = sys_get_temp_dir() . '/blockshifter-assets-test-' . uniqid() . '/';
		mkdir( $plugin_dir . 'build/frontend', 0777, true );

		foreach ( $built_slugs as $slug ) {
			file_put_contents(
				"{$plugin_dir}build/frontend/{$slug}-init.asset.php",
				"<?php return array( 'dependencies' => array( 'wp-dom-ready' ), 'version' => 'abc123' );"
			);

			if ( $with_css ) {
				file_put_contents( "{$plugin_dir}build/frontend/{$slug}-init.css", '' );
			}
		}

		return $plugin_dir;
	}
}
