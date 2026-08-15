/**
 * Pure logic for the Masonry Module's Inspector Control — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 */

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
