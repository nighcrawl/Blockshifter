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
	return attributes?.blockshifterTransform === CAROUSEL_SLUG;
}

/**
 * What `blockshifterTransform` should become when the toggle changes.
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
		...( attributes?.blockshifterConfig?.carousel ?? {} ),
	};
}

/**
 * The next `blockshifterConfig` attribute value after changing one Carousel
 * setting. Preserves every other Module's namespaced config, and every
 * other Carousel setting, untouched.
 */
export function setCarouselConfigValue( attributes, key, value ) {
	const blockshifterConfig = attributes?.blockshifterConfig ?? {};
	const carousel = blockshifterConfig.carousel ?? {};

	return {
		...blockshifterConfig,
		carousel: {
			...carousel,
			[ key ]: value,
		},
	};
}

/**
 * Maps the Carousel Module's own config shape to Splide's own option names,
 * mirroring Blockshifter_Carousel_Transform::build_splide_options() on the
 * PHP side. `isEditor` strips autoplay: the Editor Preview never autoplays,
 * regardless of what's configured for the front end (ADR: Carousel autoplay
 * is disabled in the editor).
 */
export function buildSplideOptions( config, { isEditor = false } = {} ) {
	const options = {
		perPage: Math.max( 1, parseInt( config?.perPage, 10 ) || 1 ),
	};

	if ( config?.autoplay && ! isEditor ) {
		options.autoplay = true;
	}

	if ( config?.loop ) {
		// Splide has no plain boolean "loop" option — infinite looping is
		// enabled via its `type: 'loop'` slider mode instead.
		options.type = 'loop';
	}

	return options;
}
