import {
	MASONRY_SLUG,
	MASONRY_DEFAULT_CONFIG,
	isMasonrySupported,
	isMasonryEnabled,
	nextTransformOnToggle,
	getMasonryConfig,
	setMasonryConfigValue,
	getMasonryColumns,
	getMasonrySummary,
} from './logic';

describe( 'isMasonrySupported', () => {
	it.each( [ 'core/gallery', 'core/group' ] )( 'is true for %s', ( name ) => {
		expect( isMasonrySupported( name ) ).toBe( true );
	} );

	it( 'is false for an unsupported block', () => {
		expect( isMasonrySupported( 'core/paragraph' ) ).toBe( false );
	} );
} );

describe( 'isMasonryEnabled', () => {
	it( 'is true when blockshifterTransform is masonry', () => {
		expect( isMasonryEnabled( { blockshifterTransform: 'masonry' } ) ).toBe( true );
	} );

	it( 'is false when blockshifterTransform is empty', () => {
		expect( isMasonryEnabled( { blockshifterTransform: '' } ) ).toBe( false );
	} );

	it( 'is false when blockshifterTransform belongs to another module', () => {
		expect( isMasonryEnabled( { blockshifterTransform: 'carousel' } ) ).toBe( false );
	} );

	it( 'is false when attributes is undefined', () => {
		expect( isMasonryEnabled( undefined ) ).toBe( false );
	} );
} );

describe( 'nextTransformOnToggle', () => {
	it( 'returns the masonry slug when enabling', () => {
		expect( nextTransformOnToggle( true, '' ) ).toBe( MASONRY_SLUG );
	} );

	it( 'clears the attribute when disabling and masonry owned it', () => {
		expect( nextTransformOnToggle( false, 'masonry' ) ).toBe( '' );
	} );

	it( 'leaves another module\'s transform untouched when disabling', () => {
		expect( nextTransformOnToggle( false, 'carousel' ) ).toBe( 'carousel' );
	} );
} );

describe( 'getMasonryConfig', () => {
	it( 'returns the defaults when no config is set', () => {
		expect( getMasonryConfig( {} ) ).toEqual( MASONRY_DEFAULT_CONFIG );
	} );

	it( 'returns undefined-safe defaults when attributes is undefined', () => {
		expect( getMasonryConfig( undefined ) ).toEqual( MASONRY_DEFAULT_CONFIG );
	} );

	it( 'merges stored masonry config over the defaults', () => {
		const attributes = { blockshifterConfig: { masonry: { columns: 4 } } };

		expect( getMasonryConfig( attributes ) ).toEqual( {
			columns: 4,
		} );
	} );

	it( 'ignores another module\'s config namespace', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 3 } } };

		expect( getMasonryConfig( attributes ) ).toEqual( MASONRY_DEFAULT_CONFIG );
	} );
} );

describe( 'setMasonryConfigValue', () => {
	it( 'sets a key on an empty blockshifterConfig', () => {
		const result = setMasonryConfigValue( {}, 'columns', 4 );

		expect( result ).toEqual( { masonry: { columns: 4 } } );
	} );

	it( 'preserves other masonry keys already set', () => {
		const attributes = { blockshifterConfig: { masonry: { columns: 3, gap: 24 } } };

		const result = setMasonryConfigValue( attributes, 'gap', 32 );

		expect( result ).toEqual( { masonry: { columns: 3, gap: 32 } } );
	} );

	it( 'preserves other modules\' config namespaces untouched', () => {
		const attributes = {
			blockshifterConfig: {
				carousel: { perPage: 2 },
				masonry: { columns: 3 },
			},
		};

		const result = setMasonryConfigValue( attributes, 'gap', 24 );

		expect( result ).toEqual( {
			carousel: { perPage: 2 },
			masonry: { columns: 3, gap: 24 },
		} );
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
