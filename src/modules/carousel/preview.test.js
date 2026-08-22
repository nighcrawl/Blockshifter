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
