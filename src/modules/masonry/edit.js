import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
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
					<PanelBody title={ __( 'Blockshifter Masonry', 'blockshifter' ) }>
						<ToggleControl
							label={ __( 'Enable Masonry mode', 'blockshifter' ) }
							checked={ enabled }
							onChange={ onToggle }
						/>
						{ enabled && (
							<>
								<RangeControl
									label={ __( 'Columns', 'blockshifter' ) }
									min={ 1 }
									max={ 6 }
									value={ config.columns }
									onChange={ onConfigChange( 'columns' ) }
								/>
								<RangeControl
									label={ __( 'Gap (px)', 'blockshifter' ) }
									min={ 0 }
									max={ 64 }
									value={ config.gap }
									onChange={ onConfigChange( 'gap' ) }
								/>
							</>
						) }
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withMasonryControls'
);
