import fs from 'fs';
import path from 'path';

const css = fs.readFileSync( path.join( __dirname, 'masonry-layout.css' ), 'utf8' );

describe( 'masonry-layout.css responsive contract', () => {
	it( 'defaults to two columns below the 600px breakpoint', () => {
		const [ beforeBreakpoint ] = css.split( '@media' );

		expect( beforeBreakpoint ).toMatch( /\.blockshifter-masonry\s*{[^}]*grid-template-columns:\s*repeat\(\s*2,\s*1fr\s*\)/ );
	} );

	it( 'switches to the configured column count at gallery\'s native 600px breakpoint', () => {
		expect( css ).toMatch( /@media\s*\(\s*min-width:\s*600px\s*\)/ );

		const [ , afterBreakpoint ] = css.split( '@media' );

		expect( afterBreakpoint ).toMatch(
			/\.blockshifter-masonry\s*{[^}]*grid-template-columns:\s*repeat\(\s*var\(\s*--blockshifter-masonry-columns,\s*3\s*\),\s*1fr\s*\)/
		);
	} );

	it( 'never declares its own gap, leaving spacing to the native Gutenberg Gap control', () => {
		expect( css ).not.toMatch( /(?<!-)\bgap\s*:/ );
	} );
} );
