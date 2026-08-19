<?php

namespace Blockshifter\Tests;

use Blockshifter_Module_Registry;
use Blockshifter_Telemetry;
use Blockshifter\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;

final class TelemetryTest extends TestCase {

	/**
	 * In-memory stand-in for wp_options, shared by the get_option/update_option
	 * stubs below so tests can assert on state transitions across calls.
	 *
	 * @var array<string, mixed>
	 */
	private $options = array();

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		Blockshifter_Module_Registry::reset();

		$this->options = array();

		Functions\when( '__' )->returnArg( 1 );

		Functions\when( 'get_option' )->alias(
			function ( string $name, $default = false ) {
				return $this->options[ $name ] ?? $default;
			}
		);

		Functions\when( 'update_option' )->alias(
			function ( string $name, $value ) {
				$this->options[ $name ] = $value;
				return true;
			}
		);
	}

	protected function tearDown(): void {
		Blockshifter_Module_Registry::reset();
		Monkey\tearDown();
		parent::tearDown();
	}

	private function enable_telemetry( string $installation_id = 'fixed-uuid' ): void {
		$this->options[ Blockshifter_Telemetry::OPTION_ENABLED ] = true;
		$this->options[ Blockshifter_Telemetry::OPTION_ID ]      = $installation_id;
	}

	// -- maybe_record_feature_usage() --------------------------------------

	public function test_does_not_record_feature_usage_when_telemetry_is_disabled(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Functions\expect( 'has_block' )->never();

		Blockshifter_Telemetry::maybe_record_feature_usage( 'CONTENT' );

		$this->assertArrayNotHasKey( Blockshifter_Telemetry::OPTION_FEATURES_SEEN, $this->options );
	}

	public function test_records_a_module_as_seen_the_first_time_its_block_is_found(): void {
		$this->enable_telemetry();
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturnFirstArg();

		Functions\expect( 'has_block' )
			->once()
			->with( 'core/gallery', 'CONTENT_WITH_GALLERY' )
			->andReturn( true );

		Blockshifter_Telemetry::maybe_record_feature_usage( 'CONTENT_WITH_GALLERY' );

		$this->assertArrayHasKey( 'carousel', $this->options[ Blockshifter_Telemetry::OPTION_FEATURES_SEEN ] );
	}

	public function test_does_not_record_a_module_whose_block_is_absent(): void {
		$this->enable_telemetry();
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturnFirstArg();

		Functions\expect( 'has_block' )
			->once()
			->with( 'core/gallery', 'CONTENT_WITHOUT_GALLERY' )
			->andReturn( false );

		Blockshifter_Telemetry::maybe_record_feature_usage( 'CONTENT_WITHOUT_GALLERY' );

		$this->assertArrayNotHasKey( Blockshifter_Telemetry::OPTION_FEATURES_SEEN, $this->options );
	}

	public function test_does_not_re_check_a_module_already_seen(): void {
		$this->enable_telemetry();
		$this->options[ Blockshifter_Telemetry::OPTION_FEATURES_SEEN ] = array( 'carousel' => 12345 );

		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );

		Functions\expect( 'has_block' )->never();

		Blockshifter_Telemetry::maybe_record_feature_usage( 'CONTENT' );

		$this->assertSame( 12345, $this->options[ Blockshifter_Telemetry::OPTION_FEATURES_SEEN ]['carousel'] );
	}

	// -- send() --------------------------------------------------------------

	public function test_send_does_nothing_when_telemetry_is_disabled(): void {
		Functions\expect( 'wp_remote_post' )->never();

		Blockshifter_Telemetry::send();
	}

	public function test_send_does_nothing_without_an_installation_id(): void {
		$this->options[ Blockshifter_Telemetry::OPTION_ENABLED ] = true;

		Functions\expect( 'wp_remote_post' )->never();

		Blockshifter_Telemetry::send();
	}

	public function test_send_posts_the_expected_payload_non_blocking(): void {
		$this->enable_telemetry( '550e8400-e29b-41d4-a716-446655440000' );
		$this->options[ Blockshifter_Telemetry::OPTION_FEATURES_SEEN ] = array( 'carousel' => 1000 );

		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );
		Blockshifter_Module_Registry::register( new FakeTransform( 'masonry', array( 'core/gallery' ) ) );

		Functions\when( 'get_bloginfo' )->justReturn( '6.9' );
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );

		Functions\expect( 'wp_remote_post' )
			->once()
			->with(
				Blockshifter_Telemetry::ENDPOINT,
				\Mockery::on(
					function ( $args ) {
						$this->assertFalse( $args['blocking'] );
						$this->assertSame( 5, $args['timeout'] );

						$payload = json_decode( $args['body'], true );

						$this->assertSame( 1, $payload['telemetry_version'] );
						$this->assertSame( '550e8400-e29b-41d4-a716-446655440000', $payload['installation_id'] );
						$this->assertSame( BLOCKSHIFTER_VERSION, $payload['plugin_version'] );
						$this->assertSame( '6.9', $payload['wordpress_version'] );
						$this->assertTrue( $payload['features']['carousel'] );
						$this->assertFalse( $payload['features']['masonry'] );

						return true;
					}
				)
			);

		Blockshifter_Telemetry::send();
	}

	// -- add_weekly_schedule() ------------------------------------------------

	public function test_adds_the_weekly_schedule_when_missing(): void {
		$schedules = Blockshifter_Telemetry::add_weekly_schedule( array() );

		$this->assertArrayHasKey( 'weekly', $schedules );
		$this->assertSame( WEEK_IN_SECONDS, $schedules['weekly']['interval'] );
	}

	public function test_does_not_override_an_existing_weekly_schedule(): void {
		$existing  = array(
			'weekly' => array(
				'interval' => 42,
				'display'  => 'Custom',
			),
		);
		$schedules = Blockshifter_Telemetry::add_weekly_schedule( $existing );

		$this->assertSame( 42, $schedules['weekly']['interval'] );
	}

	// -- on_deactivation() -----------------------------------------------------

	public function test_deactivation_unschedules_a_pending_cron_event(): void {
		Functions\expect( 'wp_next_scheduled' )
			->once()
			->with( Blockshifter_Telemetry::CRON_HOOK )
			->andReturn( 999999 );

		Functions\expect( 'wp_unschedule_event' )
			->once()
			->with( 999999, Blockshifter_Telemetry::CRON_HOOK );

		Blockshifter_Telemetry::on_deactivation();
	}

	public function test_deactivation_does_nothing_without_a_pending_cron_event(): void {
		Functions\expect( 'wp_next_scheduled' )
			->once()
			->with( Blockshifter_Telemetry::CRON_HOOK )
			->andReturn( false );

		Functions\expect( 'wp_unschedule_event' )->never();

		Blockshifter_Telemetry::on_deactivation();
	}

	// -- apply_enabled_change() ------------------------------------------------

	public function test_opting_in_generates_an_id_schedules_cron_and_sends_immediately(): void {
		Functions\expect( 'wp_generate_uuid4' )->once()->andReturn( 'new-uuid' );
		Functions\expect( 'wp_next_scheduled' )->once()->with( Blockshifter_Telemetry::CRON_HOOK )->andReturn( false );
		Functions\expect( 'wp_schedule_event' )->once()->with( \Mockery::type( 'int' ), 'weekly', Blockshifter_Telemetry::CRON_HOOK );
		Functions\when( 'get_bloginfo' )->justReturn( '6.9' );
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\expect( 'wp_remote_post' )->once();

		Blockshifter_Telemetry::apply_enabled_change( true );

		$this->assertTrue( $this->options[ Blockshifter_Telemetry::OPTION_DECIDED ] );
		$this->assertTrue( $this->options[ Blockshifter_Telemetry::OPTION_ENABLED ] );
		$this->assertSame( 'new-uuid', $this->options[ Blockshifter_Telemetry::OPTION_ID ] );
	}

	public function test_opting_in_again_keeps_the_existing_installation_id(): void {
		$this->options[ Blockshifter_Telemetry::OPTION_ID ] = 'already-there';

		Functions\expect( 'wp_generate_uuid4' )->never();
		Functions\when( 'wp_next_scheduled' )->justReturn( false );
		Functions\expect( 'wp_schedule_event' )->once();
		Functions\when( 'get_bloginfo' )->justReturn( '6.9' );
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\expect( 'wp_remote_post' )->once();

		Blockshifter_Telemetry::apply_enabled_change( true );

		$this->assertSame( 'already-there', $this->options[ Blockshifter_Telemetry::OPTION_ID ] );
	}

	public function test_toggling_on_while_already_enabled_does_not_resend_or_reschedule(): void {
		$this->enable_telemetry();

		Functions\expect( 'wp_generate_uuid4' )->never();
		Functions\expect( 'wp_schedule_event' )->never();
		Functions\expect( 'wp_remote_post' )->never();

		Blockshifter_Telemetry::apply_enabled_change( true );

		$this->assertTrue( $this->options[ Blockshifter_Telemetry::OPTION_DECIDED ] );
	}

	public function test_opting_out_unschedules_cron_without_touching_the_installation_id(): void {
		$this->enable_telemetry( 'kept-uuid' );

		Functions\expect( 'wp_next_scheduled' )->once()->with( Blockshifter_Telemetry::CRON_HOOK )->andReturn( 123 );
		Functions\expect( 'wp_unschedule_event' )->once()->with( 123, Blockshifter_Telemetry::CRON_HOOK );
		Functions\expect( 'wp_remote_post' )->never();

		Blockshifter_Telemetry::apply_enabled_change( false );

		$this->assertTrue( $this->options[ Blockshifter_Telemetry::OPTION_DECIDED ] );
		$this->assertFalse( $this->options[ Blockshifter_Telemetry::OPTION_ENABLED ] );
		$this->assertSame( 'kept-uuid', $this->options[ Blockshifter_Telemetry::OPTION_ID ] );
	}

	// -- is_enabled() / is_decided() -------------------------------------------

	public function test_is_enabled_and_is_decided_default_to_false(): void {
		$this->assertFalse( Blockshifter_Telemetry::is_enabled() );
		$this->assertFalse( Blockshifter_Telemetry::is_decided() );
	}
}
