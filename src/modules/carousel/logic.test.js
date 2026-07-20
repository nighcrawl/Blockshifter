import {
	CAROUSEL_SLUG,
	isCarouselSupported,
	isCarouselEnabled,
	nextTransformOnToggle,
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
	it( 'is true when blocktopusTransform is carousel', () => {
		expect( isCarouselEnabled( { blocktopusTransform: 'carousel' } ) ).toBe( true );
	} );

	it( 'is false when blocktopusTransform is empty', () => {
		expect( isCarouselEnabled( { blocktopusTransform: '' } ) ).toBe( false );
	} );

	it( 'is false when blocktopusTransform belongs to another module', () => {
		expect( isCarouselEnabled( { blocktopusTransform: 'accordion' } ) ).toBe( false );
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
