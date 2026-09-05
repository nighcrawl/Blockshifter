/**
 * Pure logic for the Carousel Module's Inspector Control — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 */
import { __ } from '@wordpress/i18n';

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
 * A short, human-readable summary of the Carousel Module's current config,
 * for the Shifted Block Indicator badge (see `shared/shifted-indicator/`) —
 * lets two Carousel-enabled blocks on the same page be told apart at a
 * glance instead of showing the same generic label on both. Booleans only
 * ever appear when true (an "off" toggle is the unremarkable default, not
 * worth a line in the badge); `perPage` always appears, being the one
 * setting every Carousel has an opinion on.
 */
export function getCarouselSummary( attributes ) {
	const { perPage, autoplay, loop } = getCarouselConfig( attributes );
	const parts = [];

	if ( autoplay ) {
		parts.push( `${ __( 'Autoplay', 'blockshifter' ) }: true` );
	}

	if ( loop ) {
		parts.push( `${ __( 'Loop', 'blockshifter' ) }: true` );
	}

	parts.push( `${ __( 'Slides per view', 'blockshifter' ) }: ${ perPage }` );

	return parts.join( ', ' );
}
