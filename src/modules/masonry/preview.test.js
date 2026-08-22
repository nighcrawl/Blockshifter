import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { withMasonryPreview, withMasonryPreviewMount } from './preview';

jest.mock( '../../frontend/masonry-init', () => ( {
	mountGrid: jest.fn(),
} ) );

// eslint-disable-next-line no-unused-vars -- imported after the mock above
import { mountGrid } from '../../frontend/masonry-init';

function DummyBlockListBlock( props ) {
	return (
		<div
			data-testid="dummy-block-list-block"
			data-classname={ props.wrapperProps?.className }
			data-columns={ props.wrapperProps?.style?.[ '--blockshifter-masonry-columns' ] }
		/>
	);
}

function DummyBlockEdit() {
	return <div data-testid="dummy-block-edit" />;
}

describe( 'withMasonryPreview', () => {
	const WrappedBlockListBlock = withMasonryPreview( DummyBlockListBlock );

	it( 'does not set wrapperProps for an unsupported block', () => {
		render(
			<WrappedBlockListBlock name="core/paragraph" attributes={ {} } wrapperProps={ {} } />
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).not.toHaveAttribute(
			'data-classname',
			'blockshifter-masonry'
		);
	} );

	it( 'does not set wrapperProps when masonry is not enabled on a supported block', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: '' } }
				wrapperProps={ {} }
			/>
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).not.toHaveAttribute(
			'data-classname',
			'blockshifter-masonry'
		);
	} );

	it( 'sets the blockshifter-masonry class and column custom property when enabled on core/gallery', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry', columns: 4 } }
				wrapperProps={ {} }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute( 'data-classname', 'blockshifter-masonry' );
		expect( element ).toHaveAttribute( 'data-columns', '4' );
	} );

	it( 'reads columns from blockshifterConfig.masonry on core/group', () => {
		render(
			<WrappedBlockListBlock
				name="core/group"
				attributes={ {
					blockshifterTransform: 'masonry',
					blockshifterConfig: { masonry: { columns: 5 } },
				} }
				wrapperProps={ {} }
			/>
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).toHaveAttribute(
			'data-columns',
			'5'
		);
	} );

	it( 'preserves an existing wrapperProps className and style already set by another filter', () => {
		function ReadWrapperProps( props ) {
			return (
				<div
					data-testid="dummy-block-list-block"
					data-classname={ props.wrapperProps?.className }
					data-existing={ props.wrapperProps?.style?.existing }
				/>
			);
		}

		const Wrapped = withMasonryPreview( ReadWrapperProps );

		render(
			<Wrapped
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry' } }
				wrapperProps={ { className: 'some-other-class', style: { existing: '1px' } } }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		// A className already set by another editor.BlockListBlock filter
		// (core alignment classes, a third-party plugin, etc.) must survive
		// alongside blockshifter-masonry, not be clobbered by it.
		expect( element ).toHaveAttribute( 'data-classname', 'some-other-class blockshifter-masonry' );
		expect( element ).toHaveAttribute( 'data-existing', '1px' );
	} );
} );

describe( 'withMasonryPreviewMount', () => {
	const WrappedBlockEdit = withMasonryPreviewMount( DummyBlockEdit );

	beforeEach( () => {
		document.body.innerHTML = '';
		mountGrid.mockClear();
	} );

	it( 'renders the original BlockEdit untouched', () => {
		render( <WrappedBlockEdit name="core/gallery" attributes={ {} } clientId="abc" /> );

		expect( screen.getByTestId( 'dummy-block-edit' ) ).toBeInTheDocument();
	} );

	it( 'does not call mountGrid for an unsupported block', () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/paragraph"
				attributes={ { blockshifterTransform: 'masonry' } }
				clientId="abc"
			/>
		);

		expect( mountGrid ).not.toHaveBeenCalled();
	} );

	it( 'does not call mountGrid when masonry is not enabled', () => {
		document.body.innerHTML = '<div id="block-abc"></div>';

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: '' } }
				clientId="abc"
			/>
		);

		expect( mountGrid ).not.toHaveBeenCalled();
	} );

	it( 'calls mountGrid with the block\'s real DOM node, found by its id, when enabled', () => {
		document.body.innerHTML = '<div id="block-abc"></div>';
		const element = document.getElementById( 'block-abc' );

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry' } }
				clientId="abc"
			/>
		);

		expect( mountGrid ).toHaveBeenCalledWith( element );
	} );

	it( 'reads the block from the editor-canvas iframe document when present', () => {
		document.body.innerHTML = '<iframe name="editor-canvas"></iframe>';
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		const iframeElement = iframe.contentDocument.createElement( 'div' );
		iframeElement.id = 'block-abc';
		iframe.contentDocument.body.appendChild( iframeElement );

		render(
			<WrappedBlockEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry' } }
				clientId="abc"
			/>
		);

		expect( mountGrid ).toHaveBeenCalledWith( iframeElement );
	} );

	it( 'does nothing when the DOM node cannot be found yet', () => {
		document.body.innerHTML = '';

		expect( () =>
			render(
				<WrappedBlockEdit
					name="core/gallery"
					attributes={ { blockshifterTransform: 'masonry' } }
					clientId="abc"
				/>
			)
		).not.toThrow();

		expect( mountGrid ).not.toHaveBeenCalled();
	} );
} );
