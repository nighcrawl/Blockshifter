<?php

namespace Blockshifter\Tests;

use Blockshifter_Module_Registry;
use Blockshifter\Tests\Fakes\FakeTransform;
use Brain\Monkey;
use Brain\Monkey\Filters;
use PHPUnit\Framework\TestCase;

final class ModuleRegistryTest extends TestCase {

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

	public function test_register_and_get_by_slug(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery' ) );

		Blockshifter_Module_Registry::register( $module );

		$this->assertSame( $module, Blockshifter_Module_Registry::get( 'carousel' ) );
	}

	public function test_get_returns_null_for_unknown_slug(): void {
		$this->assertNull( Blockshifter_Module_Registry::get( 'unknown' ) );
	}

	public function test_all_returns_every_registered_module(): void {
		$carousel  = new FakeTransform( 'carousel', array( 'core/gallery' ) );
		$accordion = new FakeTransform( 'accordion', array( 'core/group' ) );

		Blockshifter_Module_Registry::register( $carousel );
		Blockshifter_Module_Registry::register( $accordion );

		$all = Blockshifter_Module_Registry::all();

		$this->assertCount( 2, $all );
		$this->assertSame( $carousel, $all['carousel'] );
		$this->assertSame( $accordion, $all['accordion'] );
	}

	public function test_allowed_blocks_for_applies_the_filter(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery', 'core/group' ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->with( array( 'core/gallery', 'core/group' ) )
			->andReturn( array( 'core/gallery', 'core/group', 'core/columns' ) );

		$result = Blockshifter_Module_Registry::allowed_blocks_for( $module );

		$this->assertSame( array( 'core/gallery', 'core/group', 'core/columns' ), $result );
	}

	public function test_allowed_blocks_for_applies_the_filter_for_masonry(): void {
		$module = new FakeTransform( 'masonry', array( 'core/gallery', 'core/group' ) );

		Filters\expectApplied( 'blockshifter/masonry/allowed_blocks' )
			->once()
			->with( array( 'core/gallery', 'core/group' ) )
			->andReturn( array( 'core/gallery', 'core/group', 'core/columns' ) );

		$result = Blockshifter_Module_Registry::allowed_blocks_for( $module );

		$this->assertSame( array( 'core/gallery', 'core/group', 'core/columns' ), $result );
	}

	public function test_target_blocks_by_slug_lists_every_module_with_the_filter_applied(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery' ) ) );
		Blockshifter_Module_Registry::register( new FakeTransform( 'masonry', array( 'core/group' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 'core/gallery', 'core/columns' ) );

		$this->assertSame(
			array(
				'carousel' => array( 'core/gallery', 'core/columns' ),
				'masonry'  => array( 'core/group' ),
			),
			Blockshifter_Module_Registry::target_blocks_by_slug()
		);
	}

	/**
	 * A filter returning a keyed or gappy array (e.g. after array_filter())
	 * must still reach the editor as a JSON list, not a JSON object.
	 */
	public function test_target_blocks_by_slug_reindexes_a_filtered_list(): void {
		Blockshifter_Module_Registry::register( new FakeTransform( 'carousel', array( 'core/gallery', 'core/group' ) ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )
			->once()
			->andReturn( array( 1 => 'core/group' ) );

		$this->assertSame(
			array( 'carousel' => array( 'core/group' ) ),
			Blockshifter_Module_Registry::target_blocks_by_slug()
		);
	}

	/**
	 * A third-party filter returning something other than an array (e.g. a
	 * callback that forgot its `return`) must not fatal the editor or the
	 * front end: the Module falls back to its own default Target Blocks.
	 */
	public function test_allowed_blocks_for_falls_back_to_the_defaults_when_the_filter_returns_a_non_array(): void {
		$module = new FakeTransform( 'carousel', array( 'core/gallery', 'core/group' ) );

		Filters\expectApplied( 'blockshifter/carousel/allowed_blocks' )->once()->andReturn( null );

		$this->assertSame( array( 'core/gallery', 'core/group' ), Blockshifter_Module_Registry::allowed_blocks_for( $module ) );
	}
}
