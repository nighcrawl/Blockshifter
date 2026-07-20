import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { isCarouselSupported, isCarouselEnabled, nextTransformOnToggle } from './logic';

export const withCarouselControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isCarouselSupported( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const enabled = isCarouselEnabled( attributes );

		const onToggle = ( value ) => {
			setAttributes( {
				blocktopusTransform: nextTransformOnToggle( value, attributes.blocktopusTransform ),
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
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withCarouselControls'
);
