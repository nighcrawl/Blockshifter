import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { withMasonryControls } from './edit';

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
	ToggleControl: ( { label, checked, onChange, help } ) => (
		<>
			<label>
				{ label }
				<input
					type="checkbox"
					checked={ checked }
					onChange={ ( event ) => onChange( event.target.checked ) }
				/>
			</label>
			{ help && <span>{ help }</span> }
		</>
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

const WrappedEdit = withMasonryControls( DummyBlockEdit );

describe( 'withMasonryControls', () => {
	it( 'renders the original BlockEdit untouched for unsupported blocks', () => {
		render( <WrappedEdit name="core/paragraph" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.getByTestId( 'dummy-block-edit' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Enable Masonry mode' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the toggle for core/gallery, unchecked by default', () => {
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.getByLabelText( 'Enable Masonry mode' ) ).not.toBeChecked();
	} );

	it( 'shows the toggle checked when blockshifterTransform is masonry', () => {
		render(
			<WrappedEdit
				name="core/group"
				attributes={ { blockshifterTransform: 'masonry' } }
				setAttributes={ jest.fn() }
			/>
		);

		expect( screen.getByLabelText( 'Enable Masonry mode' ) ).toBeChecked();
	} );

	it( 'sets blockshifterTransform to masonry when toggled on', () => {
		const setAttributes = jest.fn();
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ setAttributes } /> );

		fireEvent.click( screen.getByLabelText( 'Enable Masonry mode' ) );

		expect( setAttributes ).toHaveBeenCalledWith( { blockshifterTransform: 'masonry' } );
	} );

	it( 'clears blockshifterTransform when toggled off', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ { blockshifterTransform: 'masonry' } }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Enable Masonry mode' ) );

		expect( setAttributes ).toHaveBeenCalledWith( { blockshifterTransform: '' } );
	} );

	it( 'hides the secondary controls when masonry is disabled', () => {
		render( <WrappedEdit name="core/group" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect( screen.queryByLabelText( 'Columns' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Gap (px)' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the secondary controls with current config when enabled on core/group', () => {
		render(
			<WrappedEdit
				name="core/group"
				attributes={ {
					blockshifterTransform: 'masonry',
					blockshifterConfig: { masonry: { columns: 4, gap: 24 } },
				} }
				setAttributes={ jest.fn() }
			/>
		);

		expect( screen.getByLabelText( 'Columns' ) ).toHaveValue( 4 );
		expect( screen.getByLabelText( 'Gap (px)' ) ).toHaveValue( 24 );
	} );

	it( 'updates only columns in blockshifterConfig.masonry when changed', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/group"
				attributes={ {
					blockshifterTransform: 'masonry',
					blockshifterConfig: { masonry: { columns: 3, gap: 16 } },
				} }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.change( screen.getByLabelText( 'Columns' ), { target: { value: '5' } } );

		expect( setAttributes ).toHaveBeenCalledWith( {
			blockshifterConfig: { masonry: { columns: 5, gap: 16 } },
		} );
	} );

	it( 'preserves other modules\' config when changing gap', () => {
		const setAttributes = jest.fn();
		render(
			<WrappedEdit
				name="core/group"
				attributes={ {
					blockshifterTransform: 'masonry',
					blockshifterConfig: { carousel: { perPage: 2 }, masonry: { columns: 3, gap: 16 } },
				} }
				setAttributes={ setAttributes }
			/>
		);

		fireEvent.change( screen.getByLabelText( 'Gap (px)' ), { target: { value: '32' } } );

		expect( setAttributes ).toHaveBeenCalledWith( {
			blockshifterConfig: {
				carousel: { perPage: 2 },
				masonry: { columns: 3, gap: 32 },
			},
		} );
	} );

	it( 'never shows the secondary controls for core/gallery, even when enabled', () => {
		render(
			<WrappedEdit
				name="core/gallery"
				attributes={ {
					blockshifterTransform: 'masonry',
					blockshifterConfig: { masonry: { columns: 4, gap: 24 } },
				} }
				setAttributes={ jest.fn() }
			/>
		);

		expect( screen.queryByLabelText( 'Columns' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Gap (px)' ) ).not.toBeInTheDocument();
	} );

	it( 'shows a help hint pointing to the Gallery\'s own controls for core/gallery', () => {
		render( <WrappedEdit name="core/gallery" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect(
			screen.getByText( 'Uses the Gallery block’s own Columns and spacing settings.' )
		).toBeInTheDocument();
	} );

	it( 'shows no help hint for core/group', () => {
		render( <WrappedEdit name="core/group" attributes={ {} } setAttributes={ jest.fn() } /> );

		expect(
			screen.queryByText( 'Uses the Gallery block’s own Columns and spacing settings.' )
		).not.toBeInTheDocument();
	} );
} );
