/**
 * Pure logic for the Masonry Module's Inspector Control — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 */
import { __ } from '@wordpress/i18n';

export const MASONRY_SLUG = 'masonry';
export const MASONRY_SUPPORTED_BLOCKS = [ 'core/gallery', 'core/group' ];

export function isMasonrySupported( blockName ) {
	return MASONRY_SUPPORTED_BLOCKS.includes( blockName );
}

export function isMasonryEnabled( attributes ) {
	return attributes?.blockshifterTransform === MASONRY_SLUG;
}

/**
 * What `blockshifterTransform` should become when the toggle changes.
 * Only clears the attribute if this Module was the one that owned it.
 */
export function nextTransformOnToggle( enabled, currentTransform ) {
	if ( enabled ) {
		return MASONRY_SLUG;
	}

	return currentTransform === MASONRY_SLUG ? '' : currentTransform;
}

export const MASONRY_DEFAULT_CONFIG = {
	columns: 3,
};

/**
 * The Masonry Module's own config, with defaults applied — reads only
 * from its own namespaced key, never touching other Modules' config.
 */
export function getMasonryConfig( attributes ) {
	return {
		...MASONRY_DEFAULT_CONFIG,
		...( attributes?.blockshifterConfig?.masonry ?? {} ),
	};
}

/**
 * The next `blockshifterConfig` attribute value after changing one Masonry
 * setting. Preserves every other Module's namespaced config, and every
 * other Masonry setting, untouched.
 */
export function setMasonryConfigValue( attributes, key, value ) {
	const blockshifterConfig = attributes?.blockshifterConfig ?? {};
	const masonry = blockshifterConfig.masonry ?? {};

	return {
		...blockshifterConfig,
		masonry: {
			...masonry,
			[ key ]: value,
		},
	};
}

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

	return Math.max( 1, getMasonryConfig( attributes ).columns );
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
