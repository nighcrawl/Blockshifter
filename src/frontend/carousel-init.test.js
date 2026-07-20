jest.mock( '@splidejs/splide', () => {
	return jest.fn().mockImplementation( () => ( { mount: jest.fn() } ) );
} );
jest.mock( '@splidejs/splide/css/core', () => ( {} ) );

import Splide from '@splidejs/splide';
import { mountCarousels } from './carousel-init';

describe( 'mountCarousels', () => {
	beforeEach( () => {
		Splide.mockClear();
		document.body.innerHTML = '';
	} );

	it( 'mounts a Splide instance for each .splide element', () => {
		document.body.innerHTML =
			'<div class="splide" id="a"></div>' +
			'<div class="splide" id="b"></div>' +
			'<div class="not-splide"></div>';

		mountCarousels();

		expect( Splide ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does nothing when there are no carousels on the page', () => {
		document.body.innerHTML = '<div class="not-splide"></div>';

		mountCarousels();

		expect( Splide ).not.toHaveBeenCalled();
	} );
} );
