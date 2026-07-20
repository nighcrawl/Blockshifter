/**
 * Pure logic for the Carousel Module's Inspector Control — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 */

export const CAROUSEL_SLUG = 'carousel';
export const CAROUSEL_SUPPORTED_BLOCKS = [ 'core/gallery', 'core/group' ];

export function isCarouselSupported( blockName ) {
	return CAROUSEL_SUPPORTED_BLOCKS.includes( blockName );
}

export function isCarouselEnabled( attributes ) {
	return attributes?.blocktopusTransform === CAROUSEL_SLUG;
}

/**
 * What `blocktopusTransform` should become when the toggle changes.
 * Only clears the attribute if this Module was the one that owned it.
 */
export function nextTransformOnToggle( enabled, currentTransform ) {
	if ( enabled ) {
		return CAROUSEL_SLUG;
	}

	return currentTransform === CAROUSEL_SLUG ? '' : currentTransform;
}

export const CAROUSEL_DEFAULT_CONFIG = {
	perPage: 1,
	autoplay: false,
	loop: false,
};

/**
 * The Carousel Module's own config, with defaults applied — reads only
 * from its own namespaced key, never touching other Modules' config.
 */
export function getCarouselConfig( attributes ) {
	return {
		...CAROUSEL_DEFAULT_CONFIG,
		...( attributes?.blocktopusConfig?.carousel ?? {} ),
	};
}

/**
 * The next `blocktopusConfig` attribute value after changing one Carousel
 * setting. Preserves every other Module's namespaced config, and every
 * other Carousel setting, untouched.
 */
export function setCarouselConfigValue( attributes, key, value ) {
	const blocktopusConfig = attributes?.blocktopusConfig ?? {};
	const carousel = blocktopusConfig.carousel ?? {};

	return {
		...blocktopusConfig,
		carousel: {
			...carousel,
			[ key ]: value,
		},
	};
}
