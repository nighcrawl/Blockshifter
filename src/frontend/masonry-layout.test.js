import fs from 'fs';
import path from 'path';

const css = fs.readFileSync( path.join( __dirname, 'masonry-layout.css' ), 'utf8' );

describe( 'masonry-layout.css responsive contract', () => {
	it( 'defaults to two columns below the 600px breakpoint', () => {
		const [ beforeBreakpoint ] = css.split( '@media' );

		expect( beforeBreakpoint ).toMatch( /\.blockshifter-masonry\s*{[^}]*grid-template-columns:\s*repeat\(\s*2,\s*minmax\(\s*0,\s*1fr\s*\)\s*\)\s*!important/ );
	} );

	it( 'switches to the configured column count at gallery\'s native 600px breakpoint', () => {
		expect( css ).toMatch( /@media\s*\(\s*min-width:\s*600px\s*\)/ );

		const [ , afterBreakpoint ] = css.split( '@media' );

		expect( afterBreakpoint ).toMatch(
			/\.blockshifter-masonry\s*,\s*\.blockshifter-masonry\.wp-block-post-template\s*{[^}]*grid-template-columns:\s*repeat\(\s*var\(\s*--blockshifter-masonry-columns,\s*3\s*\),\s*minmax\(\s*0,\s*1fr\s*\)\s*\)\s*!important/
		);
	} );

	it( 'never declares its own gap, leaving spacing to the native Gutenberg Gap control', () => {
		expect( css ).not.toMatch( /(?<!-)\bgap\s*:/ );
	} );

	it( 'stacks a Query Loop (core/post-template) in a single column below 600px', () => {
		const [ beforeBreakpoint ] = css.split( '@media' );

		expect( beforeBreakpoint ).toMatch(
			/\.blockshifter-masonry\.wp-block-post-template\s*{[^}]*grid-template-columns:\s*minmax\(\s*0,\s*1fr\s*\)\s*!important/
		);
	} );

	it( 'floors every column track at zero, so one item\'s min-content width can never widen its own column', () => {
		const declarations = css.match( /grid-template-columns:[^;]*;/g );

		expect( declarations.length ).toBeGreaterThan( 0 );
		declarations.forEach( ( declaration ) => {
			expect( declaration ).toMatch( /minmax\(\s*0,\s*1fr\s*\)/ );
			expect( declaration.replace( /minmax\(\s*0,\s*1fr\s*\)/g, '' ) ).not.toMatch( /1fr/ );
		} );
	} );

	it( 'marks every column declaration !important so native layout rules never override it', () => {
		const declarations = css.match( /grid-template-columns:[^;]*;/g );

		expect( declarations.length ).toBeGreaterThan( 0 );
		declarations.forEach( ( declaration ) => expect( declaration ).toMatch( /!important;$/ ) );
	} );
} );
