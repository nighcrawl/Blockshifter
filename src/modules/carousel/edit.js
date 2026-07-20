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
				blocktopusTransform: nextTransformOnToggle( value, attributes.blocktopusTransform ),
			} );
		};

		const onConfigChange = ( key ) => ( value ) => {
			setAttributes( {
				blocktopusConfig: setCarouselConfigValue( attributes, key, value ),
			} );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Blocktopus Carousel', 'blocktopus' ) }>
						<ToggleControl
							label={ __( 'Activer le mode Carousel', 'blocktopus' ) }
							checked={ enabled }
							onChange={ onToggle }
						/>
						{ enabled && (
							<>
								<RangeControl
									label={ __( 'Slides visibles par page', 'blocktopus' ) }
									min={ 1 }
									max={ 6 }
									value={ config.perPage }
									onChange={ onConfigChange( 'perPage' ) }
								/>
								<ToggleControl
									label={ __( 'Autoplay', 'blocktopus' ) }
									checked={ config.autoplay }
									onChange={ onConfigChange( 'autoplay' ) }
								/>
								<ToggleControl
									label={ __( 'Boucle infinie', 'blocktopus' ) }
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
