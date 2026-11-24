import fs from 'fs';
import path from 'path';

const css = fs.readFileSync( path.join( __dirname, 'preview.css' ), 'utf8' );

describe( 'Carousel Editor Preview CSS', () => {
	it( 'lets a slide shrink below its min-content width, so one wide slide never outgrows its per-page share', () => {
		expect( css ).toMatch( /\.blockshifter-carousel-preview\s*>\s*\*\s*{[^}]*min-width:\s*0\s*;/ );
	} );

	describe( 'a root with its own direct-child <figcaption> (core/gallery caption)', () => {
		const withCaption = String.raw`\.blockshifter-carousel-preview:has\(\s*>\s*figcaption\s*\)`;

		it( 'switches the preview to a single-row grid whose columns are the per-page share', () => {
			expect( css ).toMatch(
				new RegExp(
					`${ withCaption }\\s*{[^}]*display:\\s*grid\\s*!important;[^}]*grid-auto-flow:\\s*column;[^}]*grid-auto-columns:\\s*calc\\(\\s*100%\\s*/\\s*var\\(\\s*--blockshifter-carousel-per-page,\\s*1\\s*\\)\\s*\\);`
				)
			);
			expect( css ).toMatch( new RegExp( `${ withCaption }\\s*>\\s*\\*\\s*{[^}]*grid-row:\\s*1;` ) );
		} );

		it( 'lets each slide fill its column, overriding gallery\'s own percentage width', () => {
			expect( css ).toMatch(
				new RegExp( `${ withCaption }\\s*>\\s*:not\\(\\s*figcaption\\s*\\)\\s*{[^}]*width:\\s*auto\\s*!important;` )
			);
		} );

		it( 'keeps the caption below the slides, full-width and in view while they scroll', () => {
			const rule = css.match( new RegExp( `${ withCaption }\\s*>\\s*figcaption\\s*{([^}]*)}` ) );

			expect( rule ).not.toBeNull();
			expect( rule[ 1 ] ).toMatch( /grid-row:\s*2;/ );
			expect( rule[ 1 ] ).toMatch( /grid-column:\s*1;/ );
			expect( rule[ 1 ] ).toMatch( /position:\s*sticky;/ );
			expect( rule[ 1 ] ).toMatch( /left:\s*0;/ );
			expect( rule[ 1 ] ).toMatch( /width:\s*calc\(\s*100%\s*\*\s*var\(\s*--blockshifter-carousel-per-page,\s*1\s*\)\s*\);/ );
			expect( rule[ 1 ] ).toMatch( /scroll-snap-align:\s*none;/ );
		} );
	} );

	it( 'cancels the Flow layout sibling margin, so every slide starts on the same line', () => {
		expect( css ).toMatch(
			/\.blockshifter-carousel-preview\s*>\s*\*\s*{[^}]*margin-block-start:\s*0\s*!important\s*;/
		);
	} );
} );
