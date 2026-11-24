import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Builds a Module's Inspector Controls (`editor.BlockEdit` filter): one
 * panel titled with the Module's label, its enable toggle, and — only while
 * enabled — the Module's own settings. Everything every Module wires the
 * same way (support check, toggle, namespaced config writes) lives here;
 * each Module's `edit.js` only describes what differs.
 *
 * @param {Object}   module                 A Module built by `defineModule()`.
 * @param {Object}   options
 * @param {string}   options.displayName    HOC display name, e.g. `withCarouselControls`.
 * @param {string}   options.toggleLabel    Label of the enable toggle.
 * @param {Function} [options.getToggleHelp] `( props ) => string|undefined`, help under the toggle.
 * @param {Function} options.renderSettings `( { config, onConfigChange, props } ) => node`,
 *                                          rendered only while the Module is enabled.
 */
export function createModuleControls( module, { displayName, toggleLabel, getToggleHelp = () => undefined, renderSettings } ) {
	return createHigherOrderComponent(
		( BlockEdit ) => ( props ) => {
			if ( ! module.isSupported( props.name ) ) {
				return <BlockEdit { ...props } />;
			}

			const { attributes, setAttributes } = props;
			const enabled = module.isEnabled( attributes );

			const onToggle = ( value ) => {
				setAttributes( {
					blockshifterTransform: module.nextTransformOnToggle( value, attributes.blockshifterTransform ),
				} );
			};

			const onConfigChange = ( key ) => ( value ) => {
				setAttributes( {
					blockshifterConfig: module.setConfigValue( attributes, key, value ),
				} );
			};

			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody title={ module.label }>
							<ToggleControl
								label={ toggleLabel }
								checked={ enabled }
								onChange={ onToggle }
								help={ getToggleHelp( props ) }
							/>
							{ enabled && renderSettings( { config: module.getConfig( attributes ), onConfigChange, props } ) }
						</PanelBody>
					</InspectorControls>
				</>
			);
		},
		displayName
	);
}
