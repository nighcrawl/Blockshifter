import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { withCarouselControls } from './edit';

// @wordpress/block-editor renders via a portal/slot in the real editor, and
// @wordpress/components ships ESM-only transitive deps Jest can't parse here
// — stub both with plain markup so the panel content is inline and findable.
jest.mock( '@wordpress/block-editor', () => ( {
	InspectorControls: ( { children } ) => <>{ children }</>,
} ) );

jest.mock( '@wordpress/components', () => ( {
	PanelBody: ( { title, children } ) => (
		<div role="group" aria-label={ title }>
			{ children }
		</div>
	),
	ToggleControl: ( { label, checked, onChange } ) => (
		<label>
			{ label }
			<input
				type="checkbox"
				checked={ checked }
				onChange={ ( event ) => onChange( event.target.checked ) }
			/>
		</label>
	),
	RangeControl: ( { label, value, onChange } ) => (
		<label>
			{ label }
			<input
				type="number"
				value={ value }
				onChange={ ( event ) => onChange( Number( event.target.value ) ) }
			/>
		</label>
	),
} ) );

function DummyBlockEdit() {
	return <div data-testid="dummy-block-edit" />;
}

const WrappedEdit = withCarouselControls( DummyBlockEdit );

describe( 'withCarouselControls', () => {
	it( 'renders the original BlockEdit untouched for unsupported blocks', () => {
		render( <WrappedEdit name="core/paragraph" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.getByTestId( 'dummy-block-edit' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Activer le mode Carousel' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the toggle for core/gallery, unchecked by default', () => {
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.getByLabelText( 'Activer le mode Carousel' ) ).not.toBeChecked();
	} );

	it( 'shows the toggle checked when blocktopusTransform is carousel', () => {
		render(
			<WrappedEdit
				name="core/group"
				attributes={ { blocktopusTransform: 'carousel' } }
				setAttributes={ jest.fn() }
			/>
		);

		expect( screen.getByLabelText( 'Activer le mode Carousel' ) ).toBeChecked();
	} );

	it( 'sets blocktopusTransform to carousel when toggled on', () => {
		const setAttributes = jest.fn();
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ setAttributes } /> );

		fireEvent.click( screen.getByLabelText( 'Activer le mode Carousel' ) );

		expect( setAttributes ).toHaveBeenCalledWith( { blocktopusTransform: 'carousel' } );
	} );

	it( 'clears blocktopusTransform when toggled off', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ { blocktopusTransform: 'carousel' } }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Activer le mode Carousel' ) );

		expect( setAttributes ).toHaveBeenCalledWith( { blocktopusTransform: '' } );
	} );

	it( 'hides the secondary controls when carousel is disabled', () => {
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.queryByLabelText( 'Slides visibles par page' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Autoplay' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Boucle infinie' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the secondary controls with current config when enabled', () => {
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ {
					blocktopusTransform: 'carousel',
					blocktopusConfig: { carousel: { perPage: 3, autoplay: true, loop: false } },
				} }
				setAttributes={ jest.fn() }
			/>
		);

		expect( screen.getByLabelText( 'Slides visibles par page' ) ).toHaveValue( 3 );
		expect( screen.getByLabelText( 'Autoplay' ) ).toBeChecked();
		expect( screen.getByLabelText( 'Boucle infinie' ) ).not.toBeChecked();
	} );

	it( 'updates only perPage in blocktopusConfig.carousel when changed', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ {
					blocktopusTransform: 'carousel',
					blocktopusConfig: { carousel: { perPage: 1, autoplay: true, loop: false } },
				} }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.change( screen.getByLabelText( 'Slides visibles par page' ), { target: { value: '4' } } );

		expect( setAttributes ).toHaveBeenCalledWith( {
			blocktopusConfig: { carousel: { perPage: 4, autoplay: true, loop: false } },
		} );
	} );

	it( 'preserves other modules\' config when toggling autoplay', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ {
					blocktopusTransform: 'carousel',
					blocktopusConfig: { accordion: { openFirst: true }, carousel: { perPage: 1, autoplay: false, loop: false } },
				} }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Autoplay' ) );

		expect( setAttributes ).toHaveBeenCalledWith( {
			blocktopusConfig: {
				accordion: { openFirst: true },
				carousel: { perPage: 1, autoplay: true, loop: false },
			},
		} );
	} );
} );
