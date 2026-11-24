/**
 * Pure logic for the Carousel Module's JS half — kept free of
 * React/@wordpress/block-editor so it can be unit tested without a DOM.
 * The shared behaviour comes from `defineModule()`; only what is specific
 * to Carousel lives here.
 */
import { __ } from '@wordpress/i18n';
import { defineModule } from '../../shared/define-module';
import { getTargetBlocks } from '../../shared/target-blocks';

const CAROUSEL_SLUG = 'carousel';

const CAROUSEL_DEFAULT_CONFIG = {
	perPage: 1,
	autoplay: false,
	loop: false,
};

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
	const { perPage, autoplay, loop } = carouselModule.getConfig( attributes );
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

export const carouselModule = defineModule( {
	slug: CAROUSEL_SLUG,
	label: __( 'Blockshifter Carousel', 'blockshifter' ),
	color: '#5b21b6',
	supportedBlocks: getTargetBlocks( CAROUSEL_SLUG ),
	defaultConfig: CAROUSEL_DEFAULT_CONFIG,
	getSummary: getCarouselSummary,
} );

