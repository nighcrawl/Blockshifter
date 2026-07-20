import { addFilter } from '@wordpress/hooks';
import { addCoreAttributes } from './core-attributes';
import { withCarouselControls } from './modules/carousel/edit';

addFilter(
	'blocks.registerBlockType',
	'blocktopus/core-attributes',
	addCoreAttributes
);

addFilter(
	'editor.BlockEdit',
	'blocktopus/carousel-controls',
	withCarouselControls
);
