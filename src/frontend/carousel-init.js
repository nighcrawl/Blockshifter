import Splide from '@splidejs/splide';
import '@splidejs/splide/css/core';
import './carousel-nav.css';
import './carousel-layout.css';

/**
 * Mount a Splide instance on every carousel wrapper found in `root`.
 * Default settings only (ADR-driven per-carousel config lands in a later
 * ticket) — Splide provides its own keyboard/ARIA behaviour out of the box.
 */
export function mountCarousels( root = document ) {
	root.querySelectorAll( '.splide' ).forEach( ( element ) => {
		new Splide( element ).mount();
	} );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => mountCarousels() );
}
