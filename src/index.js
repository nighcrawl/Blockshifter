import { addFilter } from '@wordpress/hooks';
import { addCoreAttributes } from './core-attributes';
import { withCarouselControls } from './modules/carousel/edit';
import { withCarouselPreview } from './modules/carousel/preview';
import { withMasonryControls } from './modules/masonry/edit';
import { withMasonryPreview, withMasonryPreviewMount } from './modules/masonry/preview';

addFilter(
	'blocks.registerBlockType',
	'blockshifter/core-attributes',
	addCoreAttributes
);

addFilter(
	'editor.BlockEdit',
	'blockshifter/carousel-controls',
	withCarouselControls
);

addFilter(
	'editor.BlockEdit',
	'blockshifter/masonry-controls',
	withMasonryControls
);

addFilter(
	'editor.BlockListBlock',
	'blockshifter/masonry-preview',
	withMasonryPreview
);

addFilter(
	'editor.BlockEdit',
	'blockshifter/masonry-preview-mount',
	withMasonryPreviewMount
);

addFilter(
	'editor.BlockListBlock',
	'blockshifter/carousel-preview',
	withCarouselPreview
);
