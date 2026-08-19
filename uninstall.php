<?php
/**
 * Uninstall routine.
 *
 * @package Blockshifter
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'blockshifter_telemetry_enabled' );
delete_option( 'blockshifter_telemetry_decided' );
delete_option( 'blockshifter_telemetry_id' );
delete_option( 'blockshifter_telemetry_features_seen' );

$timestamp = wp_next_scheduled( 'blockshifter_telemetry_send' );

if ( $timestamp ) {
	wp_unschedule_event( $timestamp, 'blockshifter_telemetry_send' );
}
