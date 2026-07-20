/**
 * Registers the generic block attributes shared by every Blocktopus Module
 * (ADR-0002): `blocktopusTransform` (which Module is active) and
 * `blocktopusConfig` (namespaced-by-slug settings for the active Module).
 */

export const TARGET_BLOCKS = [ 'core/gallery', 'core/group' ];

export function addCoreAttributes( settings, name ) {
	if ( ! TARGET_BLOCKS.includes( name ) ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			blocktopusTransform: {
				type: 'string',
				default: '',
			},
			blocktopusConfig: {
				type: 'object',
				default: {},
			},
		},
	};
}
