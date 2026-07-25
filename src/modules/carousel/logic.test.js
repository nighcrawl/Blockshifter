import {
	CAROUSEL_SLUG,
	CAROUSEL_DEFAULT_CONFIG,
	isCarouselSupported,
	isCarouselEnabled,
	nextTransformOnToggle,
	getCarouselConfig,
	setCarouselConfigValue,
} from './logic';

describe( 'isCarouselSupported', () => {
	it.each( [ 'core/gallery', 'core/group' ] )( 'is true for %s', ( name ) => {
		expect( isCarouselSupported( name ) ).toBe( true );
	} );

	it( 'is false for an unsupported block', () => {
		expect( isCarouselSupported( 'core/paragraph' ) ).toBe( false );
	} );
} );

describe( 'isCarouselEnabled', () => {
	it( 'is true when blockshifterTransform is carousel', () => {
		expect( isCarouselEnabled( { blockshifterTransform: 'carousel' } ) ).toBe( true );
	} );

	it( 'is false when blockshifterTransform is empty', () => {
		expect( isCarouselEnabled( { blockshifterTransform: '' } ) ).toBe( false );
	} );

	it( 'is false when blockshifterTransform belongs to another module', () => {
		expect( isCarouselEnabled( { blockshifterTransform: 'accordion' } ) ).toBe( false );
	} );

	it( 'is false when attributes is undefined', () => {
		expect( isCarouselEnabled( undefined ) ).toBe( false );
	} );
} );

describe( 'nextTransformOnToggle', () => {
	it( 'returns the carousel slug when enabling', () => {
		expect( nextTransformOnToggle( true, '' ) ).toBe( CAROUSEL_SLUG );
	} );

	it( 'clears the attribute when disabling and carousel owned it', () => {
		expect( nextTransformOnToggle( false, 'carousel' ) ).toBe( '' );
	} );

	it( 'leaves another module\'s transform untouched when disabling', () => {
		expect( nextTransformOnToggle( false, 'accordion' ) ).toBe( 'accordion' );
	} );
} );

describe( 'getCarouselConfig', () => {
	it( 'returns the defaults when no config is set', () => {
		expect( getCarouselConfig( {} ) ).toEqual( CAROUSEL_DEFAULT_CONFIG );
	} );

	it( 'returns undefined-safe defaults when attributes is undefined', () => {
		expect( getCarouselConfig( undefined ) ).toEqual( CAROUSEL_DEFAULT_CONFIG );
	} );

	it( 'merges stored carousel config over the defaults', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 3 } } };

		expect( getCarouselConfig( attributes ) ).toEqual( {
			perPage: 3,
			autoplay: false,
			loop: false,
		} );
	} );

	it( 'ignores another module\'s config namespace', () => {
		const attributes = { blockshifterConfig: { accordion: { openFirst: true } } };

		expect( getCarouselConfig( attributes ) ).toEqual( CAROUSEL_DEFAULT_CONFIG );
	} );
} );

describe( 'setCarouselConfigValue', () => {
	it( 'sets a key on an empty blockshifterConfig', () => {
		const result = setCarouselConfigValue( {}, 'perPage', 4 );

		expect( result ).toEqual( { carousel: { perPage: 4 } } );
	} );

	it( 'preserves other carousel keys already set', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 2, autoplay: true } } };

		const result = setCarouselConfigValue( attributes, 'loop', true );

		expect( result ).toEqual( { carousel: { perPage: 2, autoplay: true, loop: true } } );
	} );

	it( 'preserves other modules\' config namespaces untouched', () => {
		const attributes = {
			blockshifterConfig: {
				accordion: { openFirst: true },
				carousel: { perPage: 2 },
			},
		};

		const result = setCarouselConfigValue( attributes, 'autoplay', true );

		expect( result ).toEqual( {
			accordion: { openFirst: true },
			carousel: { perPage: 2, autoplay: true },
		} );
	} );
} );
