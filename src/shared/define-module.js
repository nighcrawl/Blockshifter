/**
 * Builds a Module's JS half from its descriptor: the behaviour every Module
 * shares (support check, enabled check, toggle, namespaced config read/write)
 * lives here once, instead of being re-implemented per Module with only the
 * slug changing. Each Module's own `logic.js` declares its descriptor and
 * keeps only what is specific to it.
 *
 * Pure: no React, no @wordpress/block-editor, so it tests without a DOM.
 *
 * @param {Object}   descriptor
 * @param {string}   descriptor.slug            Shared with the PHP half and the `blockshifterConfig` key.
 * @param {string}   descriptor.label           Inspector panel title and Shifted Block Indicator label.
 * @param {string}   descriptor.color           Shifted Block Indicator color, hand-picked so it stays stable.
 * @param {string[]} descriptor.supportedBlocks Target Block names this Module can be enabled on.
 * @param {Object}   descriptor.defaultConfig   Config defaults, merged under `blockshifterConfig[slug]`.
 * @param {Function} descriptor.getSummary      `( attributes, blockName ) => string` for the indicator badge.
 */
const REQUIRED_FIELDS = [ 'slug', 'label', 'color', 'supportedBlocks', 'defaultConfig', 'getSummary' ];

export function defineModule( descriptor ) {
	REQUIRED_FIELDS.forEach( ( field ) => {
		if ( descriptor?.[ field ] === undefined ) {
			throw new Error( `defineModule: missing required field "${ field }"` );
		}
	} );

	const { slug, supportedBlocks, defaultConfig } = descriptor;

	const getConfig = ( attributes ) => ( {
		...defaultConfig,
		...( attributes?.blockshifterConfig?.[ slug ] ?? {} ),
	} );

	return {
		...descriptor,

		isSupported: ( blockName ) => supportedBlocks.includes( blockName ),

		isEnabled: ( attributes ) => attributes?.blockshifterTransform === slug,

		/**
		 * What `blockshifterTransform` should become when the toggle changes.
		 * Only clears the attribute if this Module was the one that owned it.
		 */
		nextTransformOnToggle: ( enabled, currentTransform ) => {
			if ( enabled ) {
				return slug;
			}

			return currentTransform === slug ? '' : currentTransform;
		},

		getConfig,

		/**
		 * The next `blockshifterConfig` value after changing one setting —
		 * every other setting, and every other Module's config, untouched.
		 */
		setConfigValue: ( attributes, key, value ) => {
			const blockshifterConfig = attributes?.blockshifterConfig ?? {};

			return {
				...blockshifterConfig,
				[ slug ]: {
					...( blockshifterConfig[ slug ] ?? {} ),
					[ key ]: value,
				},
			};
		},
	};
}
