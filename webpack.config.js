const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( process.cwd(), 'src/index.js' ),
		'frontend/carousel-init': path.resolve( process.cwd(), 'src/frontend/carousel-init.js' ),
	},
};
