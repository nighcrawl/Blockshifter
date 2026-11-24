import { getTargetBlocks } from './target-blocks';

describe( 'getTargetBlocks', () => {
	const original = window.blockshifterTargetBlocks;

	afterEach( () => {
		window.blockshifterTargetBlocks = original;
	} );

	it( 'returns the Target Blocks PHP injected for this slug, filter included', () => {
		window.blockshifterTargetBlocks = { fake: [ 'core/gallery', 'core/columns' ], other: [ 'core/group' ] };

		expect( getTargetBlocks( 'fake' ) ).toEqual( [ 'core/gallery', 'core/columns' ] );
	} );

	it( 'returns no block for a slug PHP did not list', () => {
		window.blockshifterTargetBlocks = { other: [ 'core/group' ] };

		expect( getTargetBlocks( 'fake' ) ).toEqual( [] );
	} );

	it( 'returns no block when PHP injected nothing at all', () => {
		delete window.blockshifterTargetBlocks;

		expect( getTargetBlocks( 'fake' ) ).toEqual( [] );
	} );

	it( 'returns no block when the injected value is not a list', () => {
		window.blockshifterTargetBlocks = { fake: 'core/gallery' };

		expect( getTargetBlocks( 'fake' ) ).toEqual( [] );
	} );

	it( 'returns a copy, so callers cannot alter the shared data', () => {
		window.blockshifterTargetBlocks = { fake: [ 'core/gallery' ] };

		getTargetBlocks( 'fake' ).push( 'core/columns' );

		expect( getTargetBlocks( 'fake' ) ).toEqual( [ 'core/gallery' ] );
	} );
} );
