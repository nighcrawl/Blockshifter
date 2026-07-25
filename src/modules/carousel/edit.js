import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import {
	isCarouselSupported,
	isCarouselEnabled,
	nextTransformOnToggle,
	getCarouselConfig,
	setCarouselConfigValue,
} from './logic';

export const withCarouselControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isCarouselSupported( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const enabled = isCarouselEnabled( attributes );
		const config = getCarouselConfig( attributes );

		const onToggle = ( value ) => {
			setAttributes( {
				blockshifterTransform: nextTransformOnToggle( value, attributes.blockshifterTransform ),
			} );
		};

		const onConfigChange = ( key ) => ( value ) => {
			setAttributes( {
				blockshifterConfig: setCarouselConfigValue( attributes, key, value ),
			} );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Blockshifter Carousel', 'blockshifter' ) }>
						<ToggleControl
							label={ __( 'Enable Carousel mode', 'blockshifter' ) }
							checked={ enabled }
							onChange={ onToggle }
						/>
						{ enabled && (
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
						) }
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withCarouselControls'
);
