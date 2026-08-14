import './masonry-layout.css';

const ROW_UNIT = 1; // Internal constant, not exposed to user (ADR 0009)
const RESIZE_DEBOUNCE_MS = 150;
const DEFAULT_GAP = 16; // Safe fallback when no numeric gap can be resolved at all.

// Every mounted grid, resolved gap, observed image, and pending debounce
// timer is tracked keyed by DOM node — never by index or a stored list —
// so state never outlives the element itself and nothing needs manual
// teardown when a grid is removed from the page.
const mountedGrids = new WeakSet();
const gridRowGaps = new WeakMap();
const observedImages = new WeakSet();
const packTimers = new WeakMap();

/**
 * Pure function to calculate grid-row-end span based on item height.
 * Used by the mount logic and unit-tested separately.
 *
 * The grid's own real `row-gap` is always zeroed (see `adoptNativeGap`) —
 * the visual gap is instead baked into each item's own box, as blank space
 * trailing its content, sized directly from `gap` here. That sidesteps a
 * real row-gap's coarse quantization: a box can only ever be an exact
 * multiple of `rowUnit + gap` tall, so whenever an item's actual height
 * doesn't land on one of those multiples, the leftover slack lands *after*
 * the gap rather than as part of it, growing the visual gap by a varying,
 * inconsistent amount per item (worse still, too small a `rowUnit` lets
 * the item's own min-content size — it won't shrink below its intrinsic
 * height — grow the box's last row past its quantized allocation entirely,
 * *shrinking* the following gap instead). Baking the gap into the span
 * directly and keeping `rowUnit` a small internal constant (ADR 0009)
 * keeps that slack under one `rowUnit`, imperceptible.
 *
 * @param {number} itemHeight - The rendered height of the item in pixels
 * @param {number} rowUnit - The grid-auto-rows unit in pixels
 * @param {number} gap - The visual gap to bake in after this item's content
 * @returns {number} The span value for grid-row-end
 */
export function computeSpan( itemHeight, rowUnit, gap ) {
	if ( itemHeight <= 0 ) {
		return 1;
	}

	const span = Math.ceil( ( itemHeight + gap ) / rowUnit );

	return Math.max( 1, span );
}

function readNumericGap( style, property ) {
	const value = parseFloat( style[ property ] );

	return Number.isFinite( value ) ? value : null;
}

/**
 * core/group's default (Flow) and constrained layouts never use the `gap`
 * property at all — they space children with a sibling margin instead
 * (`margin-block-start` on `* + *`). Once this module forces `display:
 * grid` on the root (masonry-layout.css), an *unset* `row-gap`/`column-gap`
 * stops being distinguishable from a real one: per spec, `normal` computes
 * to `0px` for a grid container, not to a non-numeric keyword the way it
 * does for flex — so a Flow-layout Group with no `gap` property at all
 * reads back as a perfectly numeric (and wrong) zero. WordPress's own
 * layout-type class name is the reliable signal instead: Flow and
 * constrained layouts always go through the margin-based path below,
 * regardless of what the forced-grid `gap` computes to.
 */
function isMarginBasedLayout( grid ) {
	return grid.classList.contains( 'is-layout-flow' ) || grid.classList.contains( 'is-layout-constrained' );
}

/**
 * Resolves the grid's effective row/column gap, always from the native
 * Gutenberg Gap control — never a Blockshifter-authored value.
 *
 * For a flex or grid native layout (not margin-based — see
 * `isMarginBasedLayout`), the browser's own resolved numeric
 * `row-gap`/`column-gap` is used directly. Otherwise the native Gap is
 * measured off an actual sibling's margin instead, before that margin gets
 * neutralized by `neutralizeFlowMargins`. A safe numeric default covers the
 * remaining case: no sibling to measure a margin from at all.
 */
function measureGaps( grid ) {
	if ( ! isMarginBasedLayout( grid ) ) {
		const computed = window.getComputedStyle( grid );
		const nativeRowGap = readNumericGap( computed, 'rowGap' );
		const nativeColumnGap = readNumericGap( computed, 'columnGap' );

		if ( null !== nativeRowGap && null !== nativeColumnGap ) {
			return { rowGap: nativeRowGap, columnGap: nativeColumnGap };
		}
	}

	const secondChild = grid.children[ 1 ];
	const measuredMargin = secondChild
		? readNumericGap( window.getComputedStyle( secondChild ), 'marginBlockStart' )
		: null;
	const gap = measuredMargin ?? DEFAULT_GAP;

	return { rowGap: gap, columnGap: gap };
}

/**
 * core/group's default (Flow) layout applies its native Gap as a sibling
 * margin. Left in place, that margin would be added on top of the Grid gap
 * this module applies, doubling the spacing — so it's zeroed out here,
 * inline (winning over the native rule's class-based selector on
 * specificity alone, no `!important` needed).
 */
function neutralizeFlowMargins( grid ) {
	Array.from( grid.children ).forEach( ( item ) => {
		item.style.marginBlockStart = '0';
	} );
}

/**
 * Reads the grid's native row gap once and neutralizes any native sibling
 * margin so it isn't doubled up. The *column* gap is applied as a real CSS
 * `column-gap` (columns are even `fr` tracks, so it's exact either way);
 * the *row* gap is deliberately never applied as a real `row-gap` — see
 * `computeSpan` for why — and is instead only recorded for `packGrid` to
 * bake into each item's own span. Only ever done at mount: re-measuring on
 * every recalculation would read back the already-neutralized margin.
 */
function adoptNativeGap( grid ) {
	const { rowGap, columnGap } = measureGaps( grid );

	neutralizeFlowMargins( grid );

	grid.style.rowGap = '0px';
	grid.style.columnGap = `${ columnGap }px`;

	gridRowGaps.set( grid, rowGap );
}

/**
 * Measure one item and set its grid-row-end span.
 *
 * `align-self` is forced to `start` rather than the grid default
 * (`stretch`): the gap this module applies is baked into each item's own
 * span as *trailing* empty space in its row track (see `computeSpan`), and
 * a stretched item would paint its own background/border across that
 * space, visually erasing the gap for any tile with a solid background.
 * `start` instead sizes the item to its own natural content height and
 * anchors it to the top of the track, leaving the trailing space — and
 * whatever sits behind it — untouched. As a side effect, `offsetHeight`
 * always reflects the item's true content height at its current width,
 * regardless of its currently assigned span, so no reset-then-measure
 * dance is needed before reading it.
 */
function setItemSpan( item, gap ) {
	item.style.alignSelf = 'start';
	const span = computeSpan( item.offsetHeight, ROW_UNIT, gap );
	item.style.gridRowEnd = `span ${ span }`;
}

function packGrid( grid ) {
	if ( grid.children.length === 0 ) {
		return;
	}

	const gap = gridRowGaps.get( grid ) ?? DEFAULT_GAP;

	Array.from( grid.children ).forEach( ( item ) => setItemSpan( item, gap ) );

	// Switch on the fine-grained row unit only once spans are set —
	// keeps the no-JS fallback (auto rows, no overlap) reachable.
	grid.classList.add( 'is-masonry-packed' );
}

/**
 * Debounces repacking per grid, so bursts of resize/mutation/image-load
 * events on the same grid collapse into a single recalculation.
 */
function schedulePack( grid ) {
	clearTimeout( packTimers.get( grid ) );
	packTimers.set(
		grid,
		setTimeout( () => packGrid( grid ), RESIZE_DEBOUNCE_MS )
	);
}

/**
 * Recalculates once any not-yet-loaded image inside the grid finishes
 * loading. Each image is only ever observed once — tracked by the image
 * node itself — so repeated mounts/mutations never accumulate duplicate
 * `load` listeners.
 */
function observeImages( grid ) {
	grid.querySelectorAll( 'img' ).forEach( ( img ) => {
		if ( observedImages.has( img ) ) {
			return;
		}

		observedImages.add( img );

		if ( img.complete ) {
			return;
		}

		img.addEventListener( 'load', () => schedulePack( grid ), { once: true } );
	} );
}

/**
 * Recalculates when a grid's own rendered size changes for any reason —
 * a parent's width changing, a sidebar collapsing, not just a window
 * resize. This is the primary recalculation mechanism; the window `resize`
 * listener (see bottom of file) is only a fallback for browsers without
 * `ResizeObserver`. A single observer instance is shared across every
 * grid — each is added to it exactly once, in `mountGrid`.
 */
const containerResizeObserver =
	typeof ResizeObserver === 'undefined'
		? null
		: new ResizeObserver( ( entries ) => {
				entries.forEach( ( entry ) => schedulePack( entry.target ) );
		  } );

/**
 * Recalculates when a direct-child Masonry Tile is inserted or removed
 * client-side (e.g. by another script). Scoped to the grid's own
 * `childList` only — descendants further down are never inspected. A
 * single observer instance is shared across every grid, each added to it
 * exactly once, in `mountGrid`.
 */
const directChildMutationObserver =
	typeof MutationObserver === 'undefined'
		? null
		: new MutationObserver( ( mutations ) => {
				mutations.forEach( ( mutation ) => {
					const grid = mutation.target;
					neutralizeFlowMargins( grid );
					observeImages( grid );
					schedulePack( grid );
				} );
		  } );

/**
 * Mounts one grid: idempotent, so calling it again for a grid already
 * mounted is a no-op — the guard every recalculation path relies on to
 * never accumulate duplicate observers or listeners.
 */
function mountGrid( grid ) {
	if ( mountedGrids.has( grid ) ) {
		return;
	}

	mountedGrids.add( grid );

	adoptNativeGap( grid );
	packGrid( grid );
	observeImages( grid );

	containerResizeObserver?.observe( grid );
	directChildMutationObserver?.observe( grid, { childList: true } );
}

/**
 * Mount every Masonry grid currently on the page. Safe to call more than
 * once (e.g. from the resize fallback below): grids already mounted are
 * left alone rather than re-observed.
 */
export function mountMasonryGrids() {
	document.querySelectorAll( '.blockshifter-masonry' ).forEach( mountGrid );
}

// Window-resize fallback, only wired up when `ResizeObserver` itself is
// unavailable — it recalculates every mounted grid rather than mounting
// new ones, since a plain resize can't introduce a new grid to the page.
let resizeFallbackTimeout;
function handleResizeFallback() {
	clearTimeout( resizeFallbackTimeout );
	resizeFallbackTimeout = setTimeout( () => {
		document.querySelectorAll( '.blockshifter-masonry' ).forEach( schedulePack );
	}, RESIZE_DEBOUNCE_MS );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => {
		mountMasonryGrids();

		if ( ! containerResizeObserver ) {
			window.addEventListener( 'resize', handleResizeFallback );
		}
	} );
}
