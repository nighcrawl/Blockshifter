import { MODULES, getActiveModule, getShiftedIndicatorLabel } from './modules-registry';

describe( 'getActiveModule', () => {
	it( 'returns null when no Module is enabled', () => {
		expect( getActiveModule( 'core/gallery', {} ) ).toBeNull();
	} );

	it( 'returns null for a block no Module supports, even if blockshifterTransform is set', () => {
		expect( getActiveModule( 'core/paragraph', { blockshifterTransform: 'carousel' } ) ).toBeNull();
	} );

	it( 'returns the Carousel entry when carousel is active', () => {
		const active = getActiveModule( 'core/gallery', { blockshifterTransform: 'carousel' } );

		expect( active?.slug ).toBe( 'carousel' );
	} );

	it( 'returns the Masonry entry when masonry is active', () => {
		const active = getActiveModule( 'core/gallery', { blockshifterTransform: 'masonry' } );

		expect( active?.slug ).toBe( 'masonry' );
	} );

	it( 'returns the Masonry entry on core/group too', () => {
		const active = getActiveModule( 'core/group', { blockshifterTransform: 'masonry' } );

		expect( active?.slug ).toBe( 'masonry' );
	} );
} );

describe( 'MODULES', () => {
	it( 'gives every Module a slug, label, color, and its own support/enabled/summary checks', () => {
		MODULES.forEach( ( module ) => {
			expect( typeof module.slug ).toBe( 'string' );
			expect( typeof module.label ).toBe( 'string' );
			expect( typeof module.color ).toBe( 'string' );
			expect( typeof module.isSupported ).toBe( 'function' );
			expect( typeof module.isEnabled ).toBe( 'function' );
			expect( typeof module.getSummary ).toBe( 'function' );
		} );
	} );

	it( 'gives each Module a distinct color, so the badge can tell them apart at a glance', () => {
		const colors = MODULES.map( ( module ) => module.color );

		expect( new Set( colors ).size ).toBe( colors.length );
	} );
} );

describe( 'getShiftedIndicatorLabel', () => {
	it( 'returns null when no Module is active', () => {
		expect( getShiftedIndicatorLabel( 'core/gallery', {} ) ).toBeNull();
	} );

	it( 'appends the config summary in parentheses', () => {
		const attributes = { blockshifterTransform: 'carousel', blockshifterConfig: { carousel: { perPage: 2 } } };

		expect( getShiftedIndicatorLabel( 'core/gallery', attributes ) ).toBe(
			'Blockshifter Carousel (Slides per view: 2)'
		);
	} );

	it( 'tells two blocks using the same Module with different config apart', () => {
		const oneSlide = getShiftedIndicatorLabel( 'core/gallery', { blockshifterTransform: 'carousel' } );
		const fourColumns = getShiftedIndicatorLabel( 'core/gallery', {
			blockshifterTransform: 'masonry',
			columns: 4,
		} );

		expect( oneSlide ).toBe( 'Blockshifter Carousel (Slides per view: 1)' );
		expect( fourColumns ).toBe( 'Blockshifter Masonry (Columns: 4)' );
	} );
} );
