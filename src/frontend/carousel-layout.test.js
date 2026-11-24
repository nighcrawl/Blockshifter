import fs from 'fs';
import path from 'path';

const css = fs.readFileSync( path.join( __dirname, 'carousel-layout.css' ), 'utf8' );

describe( 'carousel-layout.css: a native list used as .splide__list', () => {
	const list = String.raw`\.splide__track\s*>\s*\.splide__list\[class\*="is-layout-"\]`;

	it( 'keeps Splide\'s own flex row and no gap, whatever native layout (Flow, Grid…) the list carries', () => {
		expect( css ).toMatch( new RegExp( `${ list }\\s*{[^}]*display:\\s*flex;[^}]*gap:\\s*0;` ) );
	} );

	it( 'cancels the native sibling margin on every slide, so they all start on the same line', () => {
		expect( css ).toMatch( new RegExp( `${ list }\\s*>\\s*\\.splide__slide\\s*{[^}]*margin-block-start:\\s*0;` ) );
	} );
} );
