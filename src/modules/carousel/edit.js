import { RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createModuleControls } from '../../shared/module-controls';
import { carouselModule } from './logic';

export const withCarouselControls = createModuleControls( carouselModule, {
	displayName: 'withCarouselControls',
	toggleLabel: __( 'Enable Carousel mode', 'blockshifter' ),
	renderSettings: ( { config, onConfigChange } ) => (
		<>
			<RangeControl
				label={ __( 'Visible slides per page', 'blockshifter' ) }
				min={ 1 }
				max={ 6 }
				value={ config.perPage }
				onChange={ onConfigChange( 'perPage' ) }
			/>
			<ToggleControl
				label={ __( 'Autoplay', 'blockshifter' ) }
				checked={ config.autoplay }
				onChange={ onConfigChange( 'autoplay' ) }
			/>
			<ToggleControl
				label={ __( 'Infinite loop', 'blockshifter' ) }
				checked={ config.loop }
				onChange={ onConfigChange( 'loop' ) }
			/>
		</>
	),
} );
