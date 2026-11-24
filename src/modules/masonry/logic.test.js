import { masonryModule, getMasonryColumns, getMasonrySummary } from './logic';

// The shared behaviour (toggle, config read/write, support check) is
// covered once in shared/define-module.test.js; this only checks that the
// Masonry descriptor is wired as intended.
describe( 'masonryModule', () => {
	it( 'is identified by the masonry slug, shared with its PHP half', () => {
		expect( masonryModule.slug ).toBe( 'masonry' );
	} );

	it( 'targets the blocks PHP injected for masonry', () => {
		expect( masonryModule.supportedBlocks ).toEqual( window.blockshifterTargetBlocks.masonry );
	} );

	it( 'defaults to 3 columns', () => {
		expect( masonryModule.getConfig( {} ) ).toEqual( { columns: 3 } );
	} );

	it( 'uses getMasonrySummary for the Shifted Block Indicator', () => {
		expect( masonryModule.getSummary ).toBe( getMasonrySummary );
	} );
} );

describe( 'getMasonryColumns', () => {
	it( 'reads the native columns attribute for core/gallery', () => {
		expect( getMasonryColumns( { columns: 4 }, 'core/gallery' ) ).toBe( 4 );
	} );

	it( 'defaults core/gallery to 3 columns when its native attribute is unset', () => {
		expect( getMasonryColumns( {}, 'core/gallery' ) ).toBe( 3 );
	} );

	it( 'never lets core/gallery columns go below 1', () => {
		expect( getMasonryColumns( { columns: 0 }, 'core/gallery' ) ).toBe( 1 );
	} );

	it( 'reads the Blockshifter masonry config for core/group', () => {
		expect(
			getMasonryColumns( { blockshifterConfig: { masonry: { columns: 5 } } }, 'core/group' )
		).toBe( 5 );
	} );

	it( 'defaults core/group to 3 columns when no config is set', () => {
		expect( getMasonryColumns( {}, 'core/group' ) ).toBe( 3 );
	} );

	it( 'reads the Blockshifter masonry config for core/post-template, never a native value (ADR-0014)', () => {
		expect(
			getMasonryColumns( { blockshifterConfig: { masonry: { columns: 5 } } }, 'core/post-template' )
		).toBe( 5 );
	} );

	it( 'defaults core/post-template to 3 columns when no config is set', () => {
		expect( getMasonryColumns( {}, 'core/post-template' ) ).toBe( 3 );
	} );
} );

describe( 'getMasonrySummary', () => {
	it( 'shows the effective column count for core/gallery', () => {
		expect( getMasonrySummary( { columns: 4 }, 'core/gallery' ) ).toBe( 'Columns: 4' );
	} );

	it( 'shows the effective column count for core/group', () => {
		expect(
			getMasonrySummary( { blockshifterConfig: { masonry: { columns: 5 } } }, 'core/group' )
		).toBe( 'Columns: 5' );
	} );
} );
