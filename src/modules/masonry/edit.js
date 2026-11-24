import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createModuleControls } from '../../shared/module-controls';
import { masonryModule } from './logic';

// core/gallery already has its own native Columns control — masonry defers
// to it instead of duplicating it. Gap is always native, for every block,
// so it's never one of Blockshifter's own controls.
const usesNativeColumns = ( blockName ) => 'core/gallery' === blockName;

export const withMasonryControls = createModuleControls( masonryModule, {
	displayName: 'withMasonryControls',
	toggleLabel: __( 'Enable Masonry mode', 'blockshifter' ),
	getToggleHelp: ( { name } ) =>
		usesNativeColumns( name )
			? __( 'Uses the Gallery block’s own Columns and spacing settings.', 'blockshifter' )
			: undefined,
	renderSettings: ( { config, onConfigChange, props } ) =>
		usesNativeColumns( props.name ) ? null : (
			<RangeControl
				label={ __( 'Columns', 'blockshifter' ) }
				min={ 1 }
				max={ 6 }
				value={ config.columns }
				onChange={ onConfigChange( 'columns' ) }
			/>
		),
} );
