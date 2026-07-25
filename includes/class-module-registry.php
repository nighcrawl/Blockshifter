<?php
/**
 * Blockshifter_Module_Registry class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Explicit registry of Modules (ADR-0004) — no filesystem auto-discovery.
 */
final class Blockshifter_Module_Registry {

	/**
	 * @var array<string, Blockshifter_Transform>
	 */
	private static $modules = array();

	/**
	 * Register a Module. Called explicitly from the plugin bootstrap.
	 */
	public static function register( Blockshifter_Transform $module ): void {
		self::$modules[ $module->get_slug() ] = $module;
	}

	/**
	 * Get a single registered Module by slug, or null if none matches.
	 */
	public static function get( string $slug ): ?Blockshifter_Transform {
		return self::$modules[ $slug ] ?? null;
	}

	/**
	 * @return array<string, Blockshifter_Transform>
	 */
	public static function all(): array {
		return self::$modules;
	}

	/**
	 * The Module's allowed blocks, with the extensibility filter applied
	 * (ADR-0001). Consumers should always go through this instead of
	 * calling Blockshifter_Transform::get_allowed_blocks() directly.
	 */
	public static function allowed_blocks_for( Blockshifter_Transform $module ): array {
		return apply_filters( "blockshifter/{$module->get_slug()}/allowed_blocks", $module->get_allowed_blocks() );
	}

	/**
	 * Test-only: clear the registry between test cases.
	 */
	public static function reset(): void {
		self::$modules = array();
	}
}
