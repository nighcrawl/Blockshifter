import { addFilter } from '@wordpress/hooks';
import { addCoreAttributes } from './core-attributes';
import { withCarouselControls } from './modules/carousel/edit';

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
