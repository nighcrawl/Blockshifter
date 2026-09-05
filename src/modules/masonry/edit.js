import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { MASONRY_LABEL } from '../../shared/modules-registry';
import {
	isMasonrySupported,
	isMasonryEnabled,
	nextTransformOnToggle,
	getMasonryConfig,
	setMasonryConfigValue,
} from './logic';

export const withMasonryControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isMasonrySupported( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const enabled = isMasonryEnabled( attributes );
		const config = getMasonryConfig( attributes );
		// core/gallery already has its own native Columns control — masonry
		// defers to it instead of duplicating it. Gap is always native, for
		// both blocks, so it's never one of Blockshifter's own controls.
		const usesNativeColumns = 'core/gallery' === props.name;

		const onToggle = ( value ) => {
			setAttributes( {
				blockshifterTransform: nextTransformOnToggle( value, attributes.blockshifterTransform ),
			} );
		};

		const onConfigChange = ( key ) => ( value ) => {
			setAttributes( {
				blockshifterConfig: setMasonryConfigValue( attributes, key, value ),
			} );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ MASONRY_LABEL }>
						<ToggleControl
							label={ __( 'Enable Masonry mode', 'blockshifter' ) }
							checked={ enabled }
							onChange={ onToggle }
							help={
								usesNativeColumns
									? __( 'Uses the Gallery block’s own Columns and spacing settings.', 'blockshifter' )
									: undefined
							}
						/>
						{ enabled && ! usesNativeColumns && (
							<RangeControl
								label={ __( 'Columns', 'blockshifter' ) }
								min={ 1 }
								max={ 6 }
								value={ config.columns }
								onChange={ onConfigChange( 'columns' ) }
							/>
						) }
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withMasonryControls'
);
