<?php

namespace Blocktopus\Tests;

use Blocktopus_Module_Registry;
use Blocktopus\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use PHPUnit\Framework\TestCase;

final class ModuleRegistryTest extends TestCase {

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

	public function test_register_and_get_by_slug(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery' ) );

		Blocktopus_Module_Registry::register( $module );

		$this->assertSame( $module, Blocktopus_Module_Registry::get( 'carousel' ) );
	}

	public function test_get_returns_null_for_unknown_slug(): void {
		$this->assertNull( Blocktopus_Module_Registry::get( 'unknown' ) );
	}

	public function test_all_returns_every_registered_module(): void {
		$carousel  = new FakeTransform( 'carousel', array( 'core/gallery' ) );
		$accordion = new FakeTransform( 'accordion', array( 'core/group' ) );

		Blocktopus_Module_Registry::register( $carousel );
		Blocktopus_Module_Registry::register( $accordion );

		$all = Blocktopus_Module_Registry::all();

		$this->assertCount( 2, $all );
		$this->assertSame( $carousel, $all['carousel'] );
		$this->assertSame( $accordion, $all['accordion'] );
	}

	public function test_allowed_blocks_for_applies_the_filter(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery', 'core/group' ) );

		Filters\expectApplied( 'blocktopus/carousel/allowed_blocks' )
			->once()
			->with( array( 'core/gallery', 'core/group' ) )
			->andReturn( array( 'core/gallery', 'core/group', 'core/columns' ) );

		$result = Blocktopus_Module_Registry::allowed_blocks_for( $module );

		$this->assertSame( array( 'core/gallery', 'core/group', 'core/columns' ), $result );
	}
}
