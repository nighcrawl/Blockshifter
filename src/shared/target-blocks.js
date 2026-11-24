/**
 * A Module's Target Blocks, as PHP's Module registry resolved them — the
 * `blockshifter/{slug}/allowed_blocks` filter included (ADR-0001, ADR-0021).
 * PHP injects them as `window.blockshifterTargetBlocks` right before the
 * editor script runs, so they are already there when Modules are defined.
 *
 * No hard-coded fallback on purpose: missing data means the Module targets
 * no block, instead of a stale JS copy silently drifting from PHP.
 *
 * @param {string} slug Module slug.
 * @return {string[]} Block names this Module can be enabled on.
 */
export function getTargetBlocks( slug ) {
	const blocks = window.blockshifterTargetBlocks?.[ slug ];

	return Array.isArray( blocks ) ? [ ...blocks ] : [];
}
