describe( 'computeSpan', () => {
	let computeSpan;

	beforeAll( () => {
		( { computeSpan } = require( './masonry-init' ) );
	} );

	it( 'calculates span based on item height and row unit', () => {
		// Item height 100px, row unit 20px, gap 0 => span 5
		expect( computeSpan( 100, 20, 0 ) ).toBe( 5 );
	} );

	it( 'accounts for gap in span calculation', () => {
		// Item height 100px, row unit 20px, gap 10px
		// Each row takes 20px + 10px gap = 30px effective
		// 100px / 30px = 3.33 => ceil => 4
		expect( computeSpan( 100, 20, 10 ) ).toBe( 4 );
	} );

	it( 'returns at least 1 for very small items', () => {
		expect( computeSpan( 5, 20, 0 ) ).toBe( 1 );
	} );

	it( 'handles zero gap correctly', () => {
		expect( computeSpan( 60, 20, 0 ) ).toBe( 3 );
	} );

	it( 'handles large heights', () => {
		expect( computeSpan( 500, 25, 5 ) ).toBe( 17 );
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
				<div style="height: 100px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const grid = document.querySelector( '.blockshifter-masonry' );
		// Falls back to the internal 16px default rather than producing NaN.
		expect( grid.style.rowGap ).toBe( '16px' );
	} );

	it( 'measures a native Flow sibling margin as the gap and neutralizes it on the item', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry">
				<div style="height: 50px;"></div>
				<div style="height: 50px; margin-block-start: 24px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const grid = document.querySelector( '.blockshifter-masonry' );
		const secondItem = grid.children[ 1 ];

		expect( grid.style.rowGap ).toBe( '24px' );
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
