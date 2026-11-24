/**
 * The one place that knows about every Module at once. Each Module declares
 * its own JS half in its `logic.js` (via `defineModule()` — slug, label,
 * color, supported blocks, config, summary); this file only lists them and
 * answers the questions that span all Modules.
 */
import { carouselModule } from '../modules/carousel/logic';
import { masonryModule } from '../modules/masonry/logic';

export const MODULES = [ carouselModule, masonryModule ];

export const CAROUSEL_LABEL = carouselModule.label;
export const MASONRY_LABEL = masonryModule.label;

/**
 * Every block name targeted by at least one Module — the union of each
 * Module's own `supportedBlocks`. The single source of truth for which
 * blocks need the generic `blockshifterTransform`/`blockshifterConfig`
 * attributes (see `core-attributes.js`), instead of a separately
 * maintained list that drifts from the Modules' own.
 */
export const TARGET_BLOCKS = [ ...new Set( MODULES.flatMap( ( module ) => module.supportedBlocks ) ) ];

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
