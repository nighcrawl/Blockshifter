import { computeSpan, mountMasonryGrids } from './masonry-init';

describe( 'computeSpan', () => {
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

describe( 'mountMasonryGrids', () => {
	const ROW_UNIT = 8; // Constant used in the implementation

	beforeEach( () => {
		document.body.innerHTML = '';
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'sets grid-row-end span on each masonry item', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3; --blockshifter-masonry-gap: 16px;">
				<div class="wp-block-image" style="height: 100px;"></div>
				<div class="wp-block-image" style="height: 200px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const items = document.querySelectorAll( '.blockshifter-masonry > *' );
		expect( items[ 0 ].style.gridRowEnd ).toContain( 'span' );
		expect( items[ 1 ].style.gridRowEnd ).toContain( 'span' );
	} );

	it( 'reads columns and gap from CSS custom properties', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 4; --blockshifter-masonry-gap: 24px;">
				<div style="height: 50px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const masonry = document.querySelector( '.blockshifter-masonry' );
		expect( masonry ).not.toBeNull();
	} );

	it( 'does nothing when no masonry grids are present', () => {
		document.body.innerHTML = '<div class="not-masonry"></div>';

		expect( () => mountMasonryGrids() ).not.toThrow();
	} );

	it( 'recalculates on window resize (debounced)', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3; --blockshifter-masonry-gap: 16px;">
				<div style="height: 100px;"></div>
			</div>
		`;

		mountMasonryGrids();

		const item = document.querySelector( '.blockshifter-masonry > *' );
		const initialSpan = item.style.gridRowEnd;

		// Trigger resize
		window.dispatchEvent( new Event( 'resize' ) );

		// Should not recalculate immediately (debounced)
		expect( item.style.gridRowEnd ).toBe( initialSpan );

		// Fast-forward past debounce time
		jest.advanceTimersByTime( 150 );

		// Now it should have recalculated
		expect( item.style.gridRowEnd ).toBeTruthy();
	} );

	it( 'recalculates when images load inside items', () => {
		document.body.innerHTML = `
			<div class="blockshifter-masonry" style="--blockshifter-masonry-columns: 3; --blockshifter-masonry-gap: 16px;">
				<div>
					<img src="test.jpg" style="height: 100px;" />
				</div>
			</div>
		`;

		mountMasonryGrids();

		const img = document.querySelector( 'img' );
		const item = document.querySelector( '.blockshifter-masonry > *' );

		// Trigger image load
		img.dispatchEvent( new Event( 'load' ) );

		// Should have recalculated after image load
		expect( item.style.gridRowEnd ).toBeTruthy();
	} );
} );
