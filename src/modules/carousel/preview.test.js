import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { withCarouselPreview } from './preview';

jest.mock( './preview.css', () => ( {} ) );

function DummyBlockListBlock( props ) {
	return (
		<div
			data-testid="dummy-block-list-block"
			data-classname={ props.wrapperProps?.className }
			data-per-page={ props.wrapperProps?.style?.[ '--blockshifter-carousel-per-page' ] }
		/>
	);
}

const WrappedBlockListBlock = withCarouselPreview( DummyBlockListBlock );

describe( 'withCarouselPreview', () => {
	it( 'does not set wrapperProps for an unsupported block', () => {
		render(
			<WrappedBlockListBlock name="core/paragraph" attributes={ {} } wrapperProps={ {} } />
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).not.toHaveAttribute(
			'data-classname',
			'blockshifter-carousel-preview'
		);
	} );

	it( 'does not set wrapperProps when carousel is not enabled on a supported block', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: '' } }
				wrapperProps={ {} }
			/>
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).not.toHaveAttribute(
			'data-classname',
			'blockshifter-carousel-preview'
		);
	} );

	it( 'sets the preview class and the per-page custom property when enabled', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel', blockshifterConfig: { carousel: { perPage: 3 } } } }
				wrapperProps={ {} }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute( 'data-classname', 'blockshifter-carousel-preview' );
		expect( element ).toHaveAttribute( 'data-per-page', '3' );
	} );

	it( 'defaults per-page to 1 when not configured', () => {
		render(
			<WrappedBlockListBlock
				name="core/group"
				attributes={ { blockshifterTransform: 'carousel' } }
				wrapperProps={ {} }
			/>
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).toHaveAttribute( 'data-per-page', '1' );
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

		const Wrapped = withCarouselPreview( ReadWrapperProps );

		render(
			<Wrapped
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				wrapperProps={ { className: 'some-other-class', style: { existing: '1px' } } }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute( 'data-classname', 'some-other-class blockshifter-carousel-preview' );
		expect( element ).toHaveAttribute( 'data-existing', '1px' );
	} );
} );
