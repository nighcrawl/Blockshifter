import { addFilter } from '@wordpress/hooks';
import { addCoreAttributes } from './core-attributes';

addFilter(
	'blocks.registerBlockType',
	'blocktopus/core-attributes',
	addCoreAttributes
);
