describe( 'computeSpan', () => {
	let computeSpan;

	beforeAll( () => {
		( { computeSpan } = require( './masonry-init' ) );
	} );

	it( 'calculates span based on item height and row unit', () => {
		// Item height 100px, row unit 20px, gap 0 => span 5
		expect( computeSpan( 100, 20, 0 ) ).toBe( 5 );
	} );

	it( 'bakes the gap into the span, since the grid\'s own real row-gap is always zero', () => {
		// Item height 100px, row unit 20px, gap 10px baked in as trailing
		// space: box must cover 100+10=110px, so ceil(110/20) = 6 rows.
		expect( computeSpan( 100, 20, 10 ) ).toBe( 6 );
	} );

	it( 'keeps the box within one row unit of the item height plus gap, regardless of how large gap is relative to the row unit', () => {
		// A real `row-gap` bakes gap into the *step size* between spans
		// (rowUnit + gap per extra row), so the quantization slack scales
		// with gap no matter how fine rowUnit is. Baking gap into the
		// target height instead (itemHeight + gap) and stepping only by
		// rowUnit keeps slack bounded by rowUnit alone.
		const rowUnit = 1;
		const gap = 24;
		const itemHeight = 149;
		const span = computeSpan( itemHeight, rowUnit, gap );
		const boxHeight = span * rowUnit;

		expect( boxHeight ).toBeGreaterThanOrEqual( itemHeight + gap );
		expect( boxHeight - ( itemHeight + gap ) ).toBeLessThan( rowUnit );
	} );

	it( 'returns at least 1 for very small items', () => {
		expect( computeSpan( 5, 20, 0 ) ).toBe( 1 );
	} );

	it( 'handles zero gap correctly', () => {
		expect( computeSpan( 60, 20, 0 ) ).toBe( 3 );
	} );

	it( 'handles large heights', () => {
		expect( computeSpan( 500, 25, 5 ) ).toBe( 21 );
	} );
} );

/**
 * jsdom has no `ResizeObserver` of its own, so every test that needs one
 * installs this mock before requiring the module (module-scoped, so it
 * must exist before the module's own top-level code runs) and tears it
 * down again afterwards.
 */
class MockResizeObserver {
	constructor( callback ) {
		this.callback = callback;
		this.observed = new Set();
		this.observeCalls = 0;
		MockResizeObserver.instances.push( this );
	}

	observe( target ) {
		this.observeCalls += 1;
		this.observed.add( target );
	}

	unobserve( target ) {
		this.observed.delete( target );
	}

	disconnect() {
		this.observed.clear();
	}

	trigger( target ) {
		this.callback( [ { target } ] );
	}
}
MockResizeObserver.instances = [];

/**
 * jsdom's real `MutationObserver` flushes on the microtask queue, which
 * doesn't play well with fake timers used elsewhere in this file — a mock
 * with a synchronous `trigger()` keeps mutation tests deterministic.
 */
class MockMutationObserver {
	constructor( callback ) {
		this.callback = callback;
		this.targets = new Set();
		this.observeCalls = 0;
		MockMutationObserver.instances.push( this );
	}

	observe( target ) {
		this.observeCalls += 1;
		this.targets.add( target );
	}

	disconnect() {
		this.targets.clear();
	}

	trigger( target ) {
		this.callback( [ { target, type: 'childList' } ] );
	}
}
MockMutationObserver.instances = [];

/**
 * jsdom never computes real layout, so `offsetHeight` is always 0 — stub
 * it per element to exercise the actual span math.
 */
function mockOffsetHeight( element, height ) {
	Object.defineProperty( element, 'offsetHeight', { value: height, configurable: true } );
}

describe( 'mountMasonryGrids', () => {
	let mountMasonryGrids;

	beforeEach( () => {
		document.body.innerHTML = '';
		jest.useFakeTimers();

		MockResizeObserver.instances = [];
		MockMutationObserver.instances = [];
		global.ResizeObserver = MockResizeObserver;
		global.MutationObserver = MockMutationObserver;

		jest.resetModules();
		( { mountMasonryGrids } = require( './masonry-init' ) );
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete global.ResizeObserver;
		delete global.MutationObserver;
	} );

	it( 'sets grid-row-end span on each masonry item', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3;">
				<div class="wp-block-image" style="height: 100px;"></div>
				<div class="wp-block-image" style="height: 200px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const items = document.querySelectorAll( '.blockshifter-masonry > *' );
		expect( items[ 0 ].style.gridRowEnd ).toContain( 'span' );
		expect( items[ 1 ].style.gridRowEnd ).toContain( 'span' );
	} );

	it( 'marks the grid as packed once spans are set (enables the fine row unit, keeps the no-JS fallback reachable otherwise)', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3;">
				<div style="height: 100px;"></div>
			</div>
		`;

		const grid = document.querySelector( '.blockshifter-masonry' );
		expect( grid.classList.contains( 'is-masonry-packed' ) ).toBe( false );

		mountMasonryGrids();

		expect( grid.classList.contains( 'is-masonry-packed' ) ).toBe( true );
	} );

	it( 'does nothing when no masonry grids are present', () => {
		document.body.innerHTML = '<div class="not-masonry"></div>';

		expect( () => mountMasonryGrids() ).not.toThrow();
	} );

	it( 'falls back to a safe numeric gap when no numeric gap or sibling margin can be resolved', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry">
				<div></div>
			</div>
		`;

		const grid = document.querySelector( '.blockshifter-masonry' );
		mockOffsetHeight( grid.children[ 0 ], 100 );

		mountMasonryGrids();

		const item = grid.children[ 0 ];

		// The real `row-gap` is always zeroed — the gap this module resolves
		// is baked into each item's own span instead (see computeSpan).
		expect( grid.style.rowGap ).toBe( '0px' );
		// Falls back to the internal 16px default rather than producing NaN:
		// 100px content + 16px gap, at the 1px internal row unit.
		expect( item.style.gridRowEnd ).toBe( 'span 116' );
	} );

	it( 'measures a native Flow sibling margin as the gap and bakes it into the span, neutralizing the margin itself', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry">
				<div></div>
				<div style="margin-block-start: 24px;"></div>
			</div>
		`;

		const grid = document.querySelector( '.blockshifter-masonry' );
		const [ firstItem, secondItem ] = grid.children;
		mockOffsetHeight( firstItem, 50 );
		mockOffsetHeight( secondItem, 50 );

		mountMasonryGrids();

		expect( grid.style.rowGap ).toBe( '0px' );
		// 50px content + the measured 24px margin as gap, at the 1px row unit.
		expect( firstItem.style.gridRowEnd ).toBe( 'span 74' );
		expect( secondItem.style.marginBlockStart ).toBe( '0' );
	} );

	it( 'measures the Flow sibling margin even when the forced grid display already resolves row-gap to a numeric zero', () => {
		// Real browsers resolve an unset `row-gap` to a numeric `0px` once
		// display is forced to grid (unlike jsdom, which leaves it `normal`)
		// — reproduced here with an explicit `row-gap: 0`. Without checking
		// the native `is-layout-flow` class first, that numeric zero would
		// be mistaken for "no gap configured" and the real 24px sibling
		// margin would never be measured.
		document.body.innerHTML = `
			<div class="blockshifter-masonry is-layout-flow" style="row-gap: 0; column-gap: 0;">
				<div></div>
				<div style="margin-block-start: 24px;"></div>
			</div>
		`;

		const grid = document.querySelector( '.blockshifter-masonry' );
		const [ firstItem, secondItem ] = grid.children;
		mockOffsetHeight( firstItem, 50 );
		mockOffsetHeight( secondItem, 50 );

		mountMasonryGrids();

		expect( firstItem.style.gridRowEnd ).toBe( 'span 74' );
		expect( secondItem.style.marginBlockStart ).toBe( '0' );
	} );

	it( 'recalculates via ResizeObserver when the grid itself changes size', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3;">
				<div style="height: 100px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const grid = document.querySelector( '.blockshifter-masonry' );
		const item = grid.children[ 0 ];

		expect( MockResizeObserver.instances ).toHaveLength( 1 );
		expect( MockResizeObserver.instances[ 0 ].observed.has( grid ) ).toBe( true );

		item.style.gridRowEnd = '';
		MockResizeObserver.instances[ 0 ].trigger( grid );
		jest.advanceTimersByTime( 150 );

		expect( item.style.gridRowEnd ).toContain( 'span' );
	} );

	it( 'recalculates via MutationObserver when a direct child is inserted', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3;">
				<div style="height: 100px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const grid = document.querySelector( '.blockshifter-masonry' );
		const newItem = document.createElement( 'div' );
		newItem.style.height = '80px';
		grid.appendChild( newItem );

		MockMutationObserver.instances[ 0 ].trigger( grid );
		jest.advanceTimersByTime( 150 );

		expect( newItem.style.gridRowEnd ).toContain( 'span' );
	} );

	it( 'recalculates when images load inside items', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3;">
				<div>
					<img src="test.jpg" style="height: 100px;" />
				</div>
			</div>
		`;

		mountMasonryGrids();

		const img = document.querySelector( 'img' );
		const item = document.querySelector( '.blockshifter-masonry > *' );

		img.dispatchEvent( new Event( 'load' ) );
		jest.advanceTimersByTime( 150 );

		expect( item.style.gridRowEnd ).toBeTruthy();
	} );

	it( 'never attaches a second load listener to an image already observed', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry">
				<div><img src="test.jpg" /></div>
			</div>
		`;

		const img = document.querySelector( 'img' );
		const addEventListenerSpy = jest.spyOn( img, 'addEventListener' );

		mountMasonryGrids();
		mountMasonryGrids();

		const loadListenerCalls = addEventListenerSpy.mock.calls.filter( ( call ) => call[ 0 ] === 'load' );
		expect( loadListenerCalls ).toHaveLength( 1 );
	} );

	it( 'never observes the same grid twice across repeated mount calls', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry">
				<div style="height: 50px;"></div>
			</div>
		`;

		mountMasonryGrids();
		mountMasonryGrids();

		expect( MockResizeObserver.instances ).toHaveLength( 1 );
		expect( MockMutationObserver.instances ).toHaveLength( 1 );
		expect( MockResizeObserver.instances[ 0 ].observeCalls ).toBe( 1 );
		expect( MockMutationObserver.instances[ 0 ].observeCalls ).toBe( 1 );
	} );
} );
