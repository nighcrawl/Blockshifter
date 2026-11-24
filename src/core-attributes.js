/**
 * Registers the generic block attributes shared by every Blockshifter Module
 * (ADR-0002): `blockshifterTransform` (which Module is active) and
 * `blockshifterConfig` (namespaced-by-slug settings for the active Module).
 */
import { TARGET_BLOCKS } from './shared/modules-registry';

export function addCoreAttributes( settings, name ) {
	if ( ! TARGET_BLOCKS.includes( name ) ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			blockshifterTransform: {
				type: 'string',
				default: '',
			},
			blockshifterConfig: {
				type: 'object',
				default: {},
			},
		},
	};
}
