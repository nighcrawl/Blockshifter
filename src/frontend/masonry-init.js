import './masonry-layout.css';

const ROW_UNIT = 8; // Internal constant, not exposed to user (ADR 0009)
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Pure function to calculate grid-row-end span based on item height.
 * Used by the mount logic and unit-tested separately.
 *
 * @param {number} itemHeight - The rendered height of the item in pixels
 * @param {number} rowUnit - The grid-auto-rows unit in pixels
 * @param {number} gap - The gap between items in pixels
 * @returns {number} The span value for grid-row-end
 */
export function computeSpan( itemHeight, rowUnit, gap ) {
	if ( itemHeight <= 0 ) {
		return 1;
	}

	const effectiveRowHeight = rowUnit + gap;
	const span = Math.ceil( itemHeight / effectiveRowHeight );

	return Math.max( 1, span );
}

/**
 * Measure items and set grid-row-end spans for true masonry packing.
 * Recalculates on image load and window resize (debounced).
 */
export function mountMasonryGrids() {
	const masonryGrids = document.querySelectorAll( '.blockshifter-masonry' );

	masonryGrids.forEach( ( grid ) => {
		const items = grid.children;
		if ( items.length === 0 ) {
			return;
		}

		// Read the effective gap straight off the resolved `gap` CSS
		// property (always resolved to px by the browser) rather than a
		// Blockshifter-specific custom property — works whether the gap
		// comes from our own inline style (core/group) or WP's own native
		// block-gap style (core/gallery).
		const gap = parseInt( window.getComputedStyle( grid ).columnGap || '16', 10 );

		// Calculate span for each item
		Array.from( items ).forEach( ( item ) => {
			// scrollHeight, not offsetHeight: once packed, the item's box is
			// already constrained by its previous grid-row-end span, so
			// offsetHeight would just read that stale value back instead of
			// the content's true (possibly overflowing) natural height.
			const itemHeight = item.scrollHeight;
			const span = computeSpan( itemHeight, ROW_UNIT, gap );
			item.style.gridRowEnd = `span ${ span }`;
		} );

		// Switch on the fine-grained row unit only once spans are set —
		// keeps the no-JS fallback (auto rows, no overlap) reachable.
		grid.classList.add( 'is-masonry-packed' );

		// Recalculate when images inside items load
		const images = grid.querySelectorAll( 'img' );
		images.forEach( ( img ) => {
			if ( img.complete ) {
				// Image already loaded, recalculate immediately
				recalculateItemSpans( grid, gap );
			} else {
				img.addEventListener( 'load', () => {
					recalculateItemSpans( grid, gap );
				} );
			}
		} );
	} );
}

function recalculateItemSpans( grid, gap ) {
	const items = grid.children;
	Array.from( items ).forEach( ( item ) => {
		const itemHeight = item.scrollHeight;
		const span = computeSpan( itemHeight, ROW_UNIT, gap );
		item.style.gridRowEnd = `span ${ span }`;
	} );
}

// Debounced resize handler
let resizeTimeout;
function handleResize() {
	clearTimeout( resizeTimeout );
	resizeTimeout = setTimeout( () => {
		mountMasonryGrids();
	}, RESIZE_DEBOUNCE_MS );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => {
		mountMasonryGrids();
		window.addEventListener( 'resize', handleResize );
	} );
}
