import { carouselModule, getCarouselSummary } from './logic';

// The shared behaviour (toggle, config read/write, support check) is
// covered once in shared/define-module.test.js; this only checks that the
// Carousel descriptor is wired as intended.
describe( 'carouselModule', () => {
	it( 'is identified by the carousel slug, shared with its PHP half', () => {
		expect( carouselModule.slug ).toBe( 'carousel' );
	} );

	it( 'targets the blocks PHP injected for carousel', () => {
		expect( carouselModule.supportedBlocks ).toEqual( window.blockshifterTargetBlocks.carousel );
	} );

	it( 'defaults to one slide per page, no autoplay, no loop', () => {
		expect( carouselModule.getConfig( {} ) ).toEqual( { perPage: 1, autoplay: false, loop: false } );
	} );

	it( 'uses getCarouselSummary for the Shifted Block Indicator', () => {
		expect( carouselModule.getSummary ).toBe( getCarouselSummary );
	} );
} );

describe( 'getCarouselSummary', () => {
	it( 'always shows slides per view, even at the default', () => {
		expect( getCarouselSummary( {} ) ).toBe( 'Slides per view: 1' );
	} );

	it( 'omits autoplay and loop when both are false', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 1, autoplay: false, loop: false } } };

		expect( getCarouselSummary( attributes ) ).toBe( 'Slides per view: 1' );
	} );

	it( 'includes autoplay and loop, in that order, when both are true', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 3, autoplay: true, loop: true } } };

		expect( getCarouselSummary( attributes ) ).toBe( 'Autoplay: true, Loop: true, Slides per view: 3' );
	} );

	it( 'includes only autoplay when loop is false', () => {
		const attributes = { blockshifterConfig: { carousel: { perPage: 2, autoplay: true, loop: false } } };

		expect( getCarouselSummary( attributes ) ).toBe( 'Autoplay: true, Slides per view: 2' );
	} );
} );
