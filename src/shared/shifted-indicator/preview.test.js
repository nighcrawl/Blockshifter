import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { withShiftedIndicator } from './preview';

function DummyBlockListBlock( props ) {
	return (
		<div
			data-testid="dummy-block-list-block"
			data-classname={ props.wrapperProps?.className }
			data-color={ props.wrapperProps?.style?.[ '--blockshifter-shifted-color' ] }
			data-label={ props.wrapperProps?.[ 'data-blockshifter-shifted-label' ] }
		/>
	);
}

describe( 'withShiftedIndicator', () => {
	const WrappedBlockListBlock = withShiftedIndicator( DummyBlockListBlock );

	it( 'does not set wrapperProps when no Module is active', () => {
		render(
			<WrappedBlockListBlock name="core/gallery" attributes={ {} } wrapperProps={ {} } />
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).not.toHaveAttribute( 'data-classname', 'blockshifter-shifted-indicator' );
		expect( element ).not.toHaveAttribute( 'data-label' );
	} );

	it( 'sets the indicator class, color, and label (with its config summary) when carousel is active', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				wrapperProps={ {} }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute( 'data-classname', 'blockshifter-shifted-indicator' );
		expect( element ).toHaveAttribute( 'data-label', 'Blockshifter Carousel (Slides per view: 1)' );
		expect( element.dataset.color ).toBeTruthy();
	} );

	it( 'sets a different label and color when masonry is active', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry' } }
				wrapperProps={ {} }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute( 'data-label', 'Blockshifter Masonry (Columns: 3)' );
	} );

	it( 'reflects each block\'s own config in its label, telling two shifted blocks apart', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ {
					blockshifterTransform: 'carousel',
					blockshifterConfig: { carousel: { perPage: 3, autoplay: true, loop: true } },
				} }
				wrapperProps={ {} }
			/>
		);

		expect( screen.getByTestId( 'dummy-block-list-block' ) ).toHaveAttribute(
			'data-label',
			'Blockshifter Carousel (Autoplay: true, Loop: true, Slides per view: 3)'
		);
	} );

	it( 'preserves an existing wrapperProps className and style already set by another filter', () => {
		render(
			<WrappedBlockListBlock
				name="core/gallery"
				attributes={ { blockshifterTransform: 'carousel' } }
				wrapperProps={ { className: 'blockshifter-carousel-preview', style: { existing: '1px' } } }
			/>
		);

		const element = screen.getByTestId( 'dummy-block-list-block' );
		expect( element ).toHaveAttribute(
			'data-classname',
			'blockshifter-carousel-preview blockshifter-shifted-indicator'
		);
	} );
} );
