/**
 * The one place that knows about every Module at once. Each Module's own
 * `logic.js` stays the source of truth for its slug/support/enabled checks —
 * this file only aggregates them, plus the two things no single Module can
 * own on its own: the human label shared between its Inspector Control panel
 * and the Shifted Block Indicator (see `shifted-indicator/`), and that
 * indicator's per-Module color.
 */
import { __ } from '@wordpress/i18n';
import {
	CAROUSEL_SLUG,
	isCarouselSupported,
	isCarouselEnabled,
	getCarouselSummary,
} from '../modules/carousel/logic';
import {
	MASONRY_SLUG,
	isMasonrySupported,
	isMasonryEnabled,
	getMasonrySummary,
} from '../modules/masonry/logic';

export const CAROUSEL_LABEL = __( 'Blockshifter Carousel', 'blockshifter' );
export const MASONRY_LABEL = __( 'Blockshifter Masonry', 'blockshifter' );

/**
 * Colors are hand-picked per Module rather than derived from registration
 * order, so a Module's color stays stable even if the order it's listed in
 * here changes later.
 */
export const MODULES = [
	{
		slug: CAROUSEL_SLUG,
		label: CAROUSEL_LABEL,
		color: '#5b21b6',
		isSupported: isCarouselSupported,
		isEnabled: isCarouselEnabled,
		// eslint-disable-next-line no-unused-vars -- keeps every Module's getSummary at the same (attributes, blockName) shape
		getSummary: ( attributes, blockName ) => getCarouselSummary( attributes ),
	},
	{
		slug: MASONRY_SLUG,
		label: MASONRY_LABEL,
		color: '#0f766e',
		isSupported: isMasonrySupported,
		isEnabled: isMasonryEnabled,
		getSummary: getMasonrySummary,
	},
];

/**
 * The Module currently active on a block, if any. `blockshifterTransform`
 * only ever names one Module at a time, so at most one entry can match.
 */
export function getActiveModule( blockName, attributes ) {
	return MODULES.find( ( module ) => module.isSupported( blockName ) && module.isEnabled( attributes ) ) ?? null;
}

/**
 * The Shifted Block Indicator's full badge text for a block: the active
 * Module's label, plus its current config summary in parentheses when it
 * has one to show. `null` when no Module is active — the caller's cue to
 * render nothing at all.
 */
export function getShiftedIndicatorLabel( blockName, attributes ) {
	const module = getActiveModule( blockName, attributes );

	if ( ! module ) {
		return null;
	}

	const summary = module.getSummary( attributes, blockName );

	return summary ? `${ module.label } (${ summary })` : module.label;
}
