/**
 * What PHP injects in the editor by default (no `allowed_blocks` filter),
 * mirroring each Transform's get_allowed_blocks(). Set before any Module is
 * defined, exactly like the real inline script that runs before the editor
 * script (see Blockshifter_Assets::editor_target_blocks_script()).
 */
window.blockshifterTargetBlocks = {
	carousel: [ 'core/gallery', 'core/group', 'core/post-template' ],
	masonry: [ 'core/gallery', 'core/group', 'core/post-template' ],
};
