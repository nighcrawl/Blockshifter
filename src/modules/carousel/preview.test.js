import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import { withCarouselPreview } from './preview';

const mount = jest.fn();
const destroy = jest.fn();
const mockSplideConstructor = jest.fn().mockImplementation( () => ( { mount, destroy } ) );

jest.mock( '@splidejs/splide', () => ( {
	__esModule: true,
	default: mockSplideConstructor,
} ) );
jest.mock( '@splidejs/splide/css/core', () => ( {} ) );
jest.mock( '../../frontend/carousel-nav.css', () => ( {} ) );
jest.mock( '../../frontend/carousel-layout.css', () => ( {} ) );

function DummyBlockEdit() {
	return <div data-testid="dummy-block-edit" />;
}

const WrappedBlockEdit = withCarouselPreview( DummyBlockEdit );

async function flush() {
	// Lets the dynamic import() microtask and the effect it schedules settle.
	await act( async () => {
		await Promise.resolve();
		await Promise.resolve();
	} );
}

describe( 'withCarouselPreview', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
		mockSplideConstructor.mockClear();
		mount.mockClear();
		destroy.mockClear();
	} );

	it( 'renders the original BlockEdit untouched', () => {
		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ {} }
				clientId="abc"
				isSelected={ false }
			/>
		);

		expect( document.querySelector( '[data-testid="dummy-block-edit"]' ) ).toBeInTheDocument();
	} );

	it( 'never mounts Splide for an unsupported block', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/paragraph"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mockSplideConstructor ).not.toHaveBeenCalled();
	} );

	it( 'never mounts Splide when carousel is not enabled', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: '' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mockSplideConstructor ).not.toHaveBeenCalled();
	} );

	it( 'never mounts Splide while the block is selected', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected
			/>
		);
		await flush();

		expect( mockSplideConstructor ).not.toHaveBeenCalled();
	} );

	it( 'mounts Splide on the block\'s real DOM node once enabled and unselected', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';
		const element = document.getElementById( 'block-abc' );

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel', blockshifterConfig: { carousel: { perPage: 2 } } } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mockSplideConstructor ).toHaveBeenCalledWith( element, { perPage: 2 } );
		expect( mount ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'wraps the block\'s real children in the .splide__track/.splide__list structure Splide requires, tagging each as a slide', async () => {
		document.body.innerHTML =
			'<div id="block-abc"><div class="wp-block-image">one</div><div class="wp-block-image">two</div></div>';
		const element = document.getElementById( 'block-abc' );
		const [ first, second ] = element.children;

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( element ).toHaveClass( 'splide' );
		const track = element.querySelector( ':scope > .splide__track' );
		const list = track?.querySelector( ':scope > .splide__list' );
		expect( list?.children ).toHaveLength( 2 );
		// The same DOM nodes are reparented, not recreated — real children
		// stay editable (Gutenberg keeps its own reference to them).
		expect( list.children[ 0 ] ).toBe( first );
		expect( list.children[ 1 ] ).toBe( second );
		expect( first ).toHaveClass( 'splide__slide' );
		expect( second ).toHaveClass( 'splide__slide' );
	} );

	it( 'unwraps back to the original flat children once the block becomes selected', async () => {
		document.body.innerHTML =
			'<div id="block-abc"><div class="wp-block-image">one</div><div class="wp-block-image">two</div></div>';
		const element = document.getElementById( 'block-abc' );
		const [ first, second ] = element.children;

		const { rerender } = render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		await act( async () => {
			rerender(
				<WrappedBlockEdit
					name="core/gallery"
					attributes={ { blockshifterTransform: 'carousel' } }
					clientId="abc"
					isSelected
				/>
			);
		} );

		expect( element ).not.toHaveClass( 'splide' );
		expect( element.querySelector( '.splide__track' ) ).toBeNull();
		expect( Array.from( element.children ) ).toEqual( [ first, second ] );
		expect( first ).not.toHaveClass( 'splide__slide' );
		expect( second ).not.toHaveClass( 'splide__slide' );
	} );

	it( 'strips autoplay from the mounted Splide options, even when configured on', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ {
					blockshifterTransform: 'carousel',
					blockshifterConfig: { carousel: { autoplay: true } },
				} }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mockSplideConstructor ).toHaveBeenCalledWith(
			document.getElementById( 'block-abc' ),
			expect.not.objectContaining( { autoplay: true } )
		);
	} );

	it( 'destroys the mounted instance once the block becomes selected', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		const { rerender } = render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mount ).toHaveBeenCalledTimes( 1 );

		await act( async () => {
			rerender(
				<WrappedBlockEdit
					name="core/gallery"
					attributes={ { blockshifterTransform: 'carousel' } }
					clientId="abc"
					isSelected
				/>
			);
		} );

		expect( destroy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'destroys the mounted instance on unmount', async () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		const { unmount } = render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mount ).toHaveBeenCalledTimes( 1 );

		await act( async () => {
			unmount();
		} );

		expect( destroy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does nothing when the DOM node cannot be found yet', async () => {
		document.body.innerHTML = '';

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				clientId="abc"
				isSelected={ false }
			/>
		);
		await flush();

		expect( mockSplideConstructor ).not.toHaveBeenCalled();
	} );
} );
