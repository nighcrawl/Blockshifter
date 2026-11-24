/**
 * Pure logic for the Masonry Module's JS half — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 * The shared behaviour comes from `defineModule()`; only what is specific
 * to Masonry lives here.
 */
import { __ } from '@wordpress/i18n';
import { defineModule } from '../../shared/define-module';

export const MASONRY_SLUG = 'masonry';
export const MASONRY_SUPPORTED_BLOCKS = [ 'core/gallery', 'core/group', 'core/post-template' ];

export const MASONRY_DEFAULT_CONFIG = {
	columns: 3,
};

/**
 * The Masonry Module's effective column count, mirroring
 * Blockshifter_Masonry_Transform::get_columns() on the PHP side: `core/gallery`
 * has no Blockshifter-specific control and reads its own native `columns`
 * attribute (falling back to 3, its Gutenberg default), while `core/group`
 * has no native equivalent and reads its own namespaced config.
 */
export function getMasonryColumns( attributes, blockName ) {
	if ( 'core/gallery' === blockName ) {
		const parsed = parseInt( attributes?.columns, 10 );

		return Math.max( 1, Number.isNaN( parsed ) ? 3 : parsed );
	}

	return Math.max( 1, masonryModule.getConfig( attributes ).columns );
}

/**
 * A short, human-readable summary of the Masonry Module's current config,
 * for the Shifted Block Indicator badge (see `shared/shifted-indicator/`) —
 * mirrors `getCarouselSummary`.
 */
export function getMasonrySummary( attributes, blockName ) {
	const columns = getMasonryColumns( attributes, blockName );

	return `${ __( 'Columns', 'blockshifter' ) }: ${ columns }`;
}

export const masonryModule = defineModule( {
	slug: MASONRY_SLUG,
	label: __( 'Blockshifter Masonry', 'blockshifter' ),
	color: '#0f766e',
	supportedBlocks: MASONRY_SUPPORTED_BLOCKS,
	defaultConfig: MASONRY_DEFAULT_CONFIG,
	getSummary: getMasonrySummary,
} );

export const isMasonrySupported = masonryModule.isSupported;
export const isMasonryEnabled = masonryModule.isEnabled;
export const nextTransformOnToggle = masonryModule.nextTransformOnToggle;
export const getMasonryConfig = masonryModule.getConfig;
export const setMasonryConfigValue = masonryModule.setConfigValue;
