<?php
/**
 * Blockshifter_Telemetry class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Opt-in, anonymous usage telemetry (ADR-0010).
 *
 * Reports installation_id, plugin/WP/PHP versions and which Modules are
 * actually seen in rendered content — nothing else. No network call is
 * ever made before the site owner explicitly opts in.
 */
final class Blockshifter_Telemetry {

	const OPTION_ENABLED       = 'blockshifter_telemetry_enabled';
	const OPTION_DECIDED       = 'blockshifter_telemetry_decided';
	const OPTION_ID            = 'blockshifter_telemetry_id';
	const OPTION_FEATURES_SEEN = 'blockshifter_telemetry_features_seen';

	const PAGE_SLUG = 'blockshifter-telemetry';
	const CRON_HOOK = 'blockshifter_telemetry_send';
	const ENDPOINT  = 'https://api.blockshifter.dev/v1/telemetry';

	/**
	 * Wire every hook telemetry needs. Called once from the plugin bootstrap.
	 */
	public static function register(): void {
		add_filter( 'cron_schedules', array( self::class, 'add_weekly_schedule' ) );
		add_action( self::CRON_HOOK, array( self::class, 'send' ) );

		add_action( 'admin_menu', array( self::class, 'register_settings_page' ) );
		add_action( 'admin_notices', array( self::class, 'maybe_render_notice' ) );
		add_action( 'admin_post_blockshifter_telemetry_update', array( self::class, 'handle_update' ) );
		add_action( 'admin_init', array( self::class, 'add_privacy_policy_content' ) );
	}

	/**
	 * Deactivation cleanup: stop the cron, keep the opt-in choice and UUID
	 * (only a full uninstall wipes those — see uninstall.php).
	 */
	public static function on_deactivation(): void {
		self::unschedule_cron();
	}

	/**
	 * Whether the site owner has opted in.
	 */
	public static function is_enabled(): bool {
		return (bool) get_option( self::OPTION_ENABLED, false );
	}

	/**
	 * Whether the site owner has made an explicit opt-in/opt-out choice.
	 */
	public static function is_decided(): bool {
		return (bool) get_option( self::OPTION_DECIDED, false );
	}

	/**
	 * Register the "Blockshifter" submenu under Settings.
	 */
	public static function register_settings_page(): void {
		add_options_page(
			__( 'Blockshifter — Telemetry', 'blockshifter' ),
			__( 'Blockshifter', 'blockshifter' ),
			'manage_options',
			self::PAGE_SLUG,
			array( self::class, 'render_settings_page' )
		);
	}

	/**
	 * Render the settings page: a single opt-in toggle.
	 */
	public static function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$enabled = self::is_enabled();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Blockshifter — Telemetry', 'blockshifter' ); ?></h1>
			<p>
				<?php
				esc_html_e(
					'This anonymous data helps us understand which Blockshifter modules are actually used, so we can prioritize what to build next. No personal data, no URL, no page content is ever sent.',
					'blockshifter'
				);
				?>
			</p>
			<form method="get" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="blockshifter_telemetry_update" />
				<label>
					<input type="checkbox" name="enabled" value="1" <?php checked( $enabled ); ?> />
					<?php esc_html_e( 'Share anonymous usage statistics with the Blockshifter developers', 'blockshifter' ); ?>
				</label>
				<?php wp_nonce_field( 'blockshifter_telemetry_update' ); ?>
				<p>
					<?php submit_button( __( 'Save', 'blockshifter' ), 'primary', '', false ); ?>
				</p>
				<p>
					<a href="https://blockshifter.dev/privacy.html" target="_blank" rel="noopener noreferrer">
						<?php esc_html_e( 'Privacy policy', 'blockshifter' ); ?>
					</a>
				</p>
			</form>
		</div>
		<?php
	}

	/**
	 * Admin notice shown until the site owner makes an explicit choice.
	 * Deliberately not dismissible: closing the browser tab is not consent,
	 * and an explicit "No thanks" is the only thing that silences it.
	 */
	public static function maybe_render_notice(): void {
		if ( self::is_decided() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$enable_url  = wp_nonce_url( admin_url( 'admin-post.php?action=blockshifter_telemetry_update&enabled=1' ), 'blockshifter_telemetry_update' );
		$decline_url = wp_nonce_url( admin_url( 'admin-post.php?action=blockshifter_telemetry_update&enabled=0' ), 'blockshifter_telemetry_update' );
		?>
		<div class="notice notice-info">
			<p>
				<?php
				esc_html_e(
					'Help us improve Blockshifter: share anonymous usage statistics (plugin, WordPress and PHP version, and which modules are enabled — no personal data, no content from your site).',
					'blockshifter'
				);
				?>
			</p>
			<p>
				<a href="<?php echo esc_url( $enable_url ); ?>" class="button button-primary"><?php esc_html_e( 'Enable', 'blockshifter' ); ?></a>
				<a href="<?php echo esc_url( $decline_url ); ?>" class="button"><?php esc_html_e( 'No thanks', 'blockshifter' ); ?></a>
				<a href="https://blockshifter.dev/privacy.html" target="_blank" rel="noopener noreferrer" style="margin-left: 8px;">
					<?php esc_html_e( 'Learn more', 'blockshifter' ); ?>
				</a>
			</p>
		</div>
		<?php
	}

	/**
	 * Handles both the settings page form and the notice's Enable/No thanks
	 * links — a single entry point avoids duplicating the enable/disable logic.
	 */
	public static function handle_update(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'blockshifter' ) );
		}

		check_admin_referer( 'blockshifter_telemetry_update' );

		self::apply_enabled_change( ! empty( $_REQUEST['enabled'] ) );

		$redirect = wp_get_referer();

		if ( ! $redirect ) {
			$redirect = admin_url( 'options-general.php?page=' . self::PAGE_SLUG );
		}

		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Apply an opt-in/opt-out decision: flip the stored flags and, only on
	 * the false-to-true transition, generate the installation id, schedule
	 * the cron and fire an immediate report (Q7/Q10). Public so the decision
	 * logic can be unit tested independently of handle_update()'s exit().
	 */
	public static function apply_enabled_change( bool $enabled ): void {
		$was_enabled = self::is_enabled();

		update_option( self::OPTION_DECIDED, true );
		update_option( self::OPTION_ENABLED, $enabled );

		if ( $enabled && ! $was_enabled ) {
			self::ensure_installation_id();
			self::schedule_cron();
			self::send();
		} elseif ( ! $enabled && $was_enabled ) {
			self::unschedule_cron();
		}
	}

	/**
	 * The stored installation UUID, generating one if this is the first
	 * opt-in. Kept stable across later opt-out/opt-in toggles (ADR-0010).
	 */
	private static function ensure_installation_id(): string {
		$id = get_option( self::OPTION_ID );

		if ( ! $id ) {
			$id = wp_generate_uuid4();
			update_option( self::OPTION_ID, $id, false );
		}

		return $id;
	}

	/**
	 * Register the custom weekly cron schedule (WP core has none).
	 *
	 * @param array $schedules Existing WP cron schedules.
	 */
	public static function add_weekly_schedule( array $schedules ): array {
		if ( ! isset( $schedules['weekly'] ) ) {
			$schedules['weekly'] = array(
				'interval' => WEEK_IN_SECONDS,
				'display'  => __( 'Once Weekly', 'blockshifter' ),
			);
		}

		return $schedules;
	}

	/**
	 * Schedule the weekly cron, if not already scheduled.
	 */
	private static function schedule_cron(): void {
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time(), 'weekly', self::CRON_HOOK );
		}
	}

	/**
	 * Unschedule the weekly cron.
	 */
	private static function unschedule_cron(): void {
		$timestamp = wp_next_scheduled( self::CRON_HOOK );

		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::CRON_HOOK );
		}
	}

	/**
	 * Send the current telemetry report. Fire-and-forget: a down or slow
	 * endpoint must never be visible to the site owner, so no logging and
	 * no retry — this is an observation channel, not a source of truth.
	 */
	public static function send(): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		$id = get_option( self::OPTION_ID );

		if ( ! $id ) {
			return;
		}

		wp_remote_post(
			self::ENDPOINT,
			array(
				'timeout'    => 5,
				'blocking'   => false,
				'user-agent' => 'Blockshifter/' . BLOCKSHIFTER_VERSION,
				'headers'    => array( 'Content-Type' => 'application/json' ),
				'body'       => wp_json_encode( self::build_payload( $id ) ),
			)
		);
	}

	/**
	 * Build the telemetry_version:1 payload (see blockshifter-telemetry-api.md).
	 */
	private static function build_payload( string $installation_id ): array {
		$seen     = self::feature_flags();
		$features = array();

		foreach ( Blockshifter_Module_Registry::all() as $module ) {
			$features[ $module->get_slug() ] = ! empty( $seen[ $module->get_slug() ] );
		}

		return array(
			'telemetry_version' => 1,
			'installation_id'   => $installation_id,
			'plugin_version'    => BLOCKSHIFTER_VERSION,
			'wordpress_version' => get_bloginfo( 'version' ),
			'php_version'       => PHP_VERSION,
			'features'          => $features,
		);
	}

	/**
	 * @return array<string, int> Module slug => timestamp first seen rendered.
	 */
	private static function feature_flags(): array {
		return get_option( self::OPTION_FEATURES_SEEN, array() );
	}

	/**
	 * Piggyback on the render pass: mark a Module as "seen" the first time
	 * one of its allowed blocks is found in rendered content. Cheap, but
	 * only as fresh as real site traffic (ADR-0010) — no separate site scan.
	 */
	public static function maybe_record_feature_usage( string $content ): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		$seen    = self::feature_flags();
		$changed = false;

		foreach ( Blockshifter_Module_Registry::all() as $module ) {
			$slug = $module->get_slug();

			if ( ! empty( $seen[ $slug ] ) ) {
				continue;
			}

			foreach ( Blockshifter_Module_Registry::allowed_blocks_for( $module ) as $block_name ) {
				if ( has_block( $block_name, $content ) ) {
					$seen[ $slug ] = time();
					$changed       = true;
					break;
				}
			}
		}

		if ( $changed ) {
			update_option( self::OPTION_FEATURES_SEEN, $seen, false );
		}
	}

	/**
	 * Surface the telemetry disclosure in WP's native Privacy Policy tool.
	 */
	public static function add_privacy_policy_content(): void {
		if ( ! function_exists( 'wp_add_privacy_policy_content' ) ) {
			return;
		}

		$content = '<p>' . esc_html__(
			'Blockshifter may send, only if explicitly enabled in its settings, anonymous usage statistics: a random installation identifier, the Blockshifter/WordPress/PHP version, and which Blockshifter modules (Carousel, Masonry...) are detected on the site. No URL, no page content and no data that could identify the site or its users is ever sent. See the full privacy policy: https://blockshifter.dev/privacy.html',
			'blockshifter'
		) . '</p>';

		wp_add_privacy_policy_content( 'Blockshifter', wp_kses_post( $content ) );
	}
}
