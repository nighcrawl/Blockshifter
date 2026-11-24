import fs from 'fs';
import path from 'path';

const css = fs.readFileSync( path.join( __dirname, 'preview.css' ), 'utf8' );

describe( 'Carousel Editor Preview CSS', () => {
	it( 'lets a slide shrink below its min-content width, so one wide slide never outgrows its per-page share', () => {
		expect( css ).toMatch( /\.blockshifter-carousel-preview\s*>\s*\*\s*{[^}]*min-width:\s*0\s*;/ );
	} );

	it( 'cancels the Flow layout sibling margin, so every slide starts on the same line', () => {
		expect( css ).toMatch(
			/\.blockshifter-carousel-preview\s*>\s*\*\s*{[^}]*margin-block-start:\s*0\s*!important\s*;/
		);
	} );
} );
