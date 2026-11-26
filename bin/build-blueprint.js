#!/usr/bin/env node
/**
 * Builds .wporg-assets/blueprints/blueprint.json, the WordPress Playground
 * blueprint behind the "Live Preview" button on wordpress.org/plugins/blockshifter.
 *
 * The demo page markup lives in .wporg-assets/blueprints/demo-page.html so it
 * can be edited as plain block markup; this script inlines it into the
 * blueprint (WordPress.org serves blueprint.json alone, without siblings).
 *
 * Usage: node bin/build-blueprint.js
 * Then copy .wporg-assets/blueprints/blueprint.json to assets/blueprints/
 * in the plugin's SVN repository.
 */
const fs = require( 'fs' );
const path = require( 'path' );

const dir = path.join( __dirname, '..', '.wporg-assets', 'blueprints' );
const demoPage = fs.readFileSync( path.join( dir, 'demo-page.html' ), 'utf8' ).trim();

if ( demoPage.includes( '\nDEMO;' ) ) {
	throw new Error( 'demo-page.html must not contain the nowdoc terminator "DEMO;".' );
}

const demoPosts = [
	[ 'Shipping a carousel without a slider plugin', 'A Query Loop is already a list of posts. Blockshifter just changes its shape on the front end.' ],
	[ 'Why native blocks age better', 'Content stored as core blocks survives theme switches, plugin changes and editor redesigns.' ],
	[ 'Masonry with CSS Grid only', 'No layout library: Blockshifter computes each tile span and lets CSS Grid do the rest.' ],
	[ 'One toggle, no new workflow', 'Select the block, open its Inspector, flip the switch. That is the whole learning curve.' ],
	[ 'Assets load only where used', 'Carousel and Masonry scripts are enqueued only on pages where a block is actually shifted.' ],
	[ 'Deactivate without breaking anything', 'Turn Blockshifter off and your blocks fall back to a regular Gallery, Group or post list.' ],
];

const phpString = ( value ) => `'${ value.replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" ) }'`;

const php = `<?php
require_once '/wordpress/wp-load.php';
wp_set_current_user( 1 ); // Admin: keeps block markup out of kses.

wp_delete_post( 1, true ); // "Hello world!"
wp_delete_post( 2, true ); // "Sample Page"

$posts = array(
${ demoPosts.map( ( [ title, excerpt ] ) => `\tarray( ${ phpString( title ) }, ${ phpString( excerpt ) } ),` ).join( '\n' ) }
);
foreach ( $posts as $i => $post ) {
	wp_insert_post( array(
		'post_title'   => $post[0],
		'post_excerpt' => $post[1],
		'post_content' => '<!-- wp:paragraph --><p>' . esc_html( $post[1] ) . '</p><!-- /wp:paragraph -->',
		'post_status'  => 'publish',
		'post_date'    => gmdate( 'Y-m-d H:i:s', time() - ( $i + 1 ) * DAY_IN_SECONDS ),
	) );
}

$page_id = wp_insert_post( array(
	'post_type'    => 'page',
	'post_title'   => 'Blockshifter demo',
	'post_status'  => 'publish',
	'post_content' => <<<'DEMO'
${ demoPage }
DEMO,
) );

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $page_id );

// Skip the block editor welcome guide so "Edit Page" lands straight on the blocks.
update_user_meta( 1, $GLOBALS['wpdb']->get_blog_prefix() . 'persisted_preferences', array(
	'core/edit-post' => array( 'welcomeGuide' => false ),
	'core'           => array( 'isComplementaryAreaVisible' => true ),
	'_modified'      => gmdate( 'c' ),
) );
`;

const blueprint = {
	$schema: 'https://playground.wordpress.net/blueprint-schema.json',
	meta: {
		title: 'Blockshifter demo',
		description: 'Native Gallery and Query Loop blocks shifted into a Carousel and a Masonry grid.',
		author: 'nighcrawl',
		categories: [ 'Blocks', 'Gallery' ],
	},
	landingPage: '/',
	preferredVersions: { php: '8.2', wp: 'latest' },
	login: true,
	steps: [
		{
			step: 'installPlugin',
			pluginData: { resource: 'wordpress.org/plugins', slug: 'blockshifter' },
			options: { activate: true },
		},
		{ step: 'runPHP', code: php },
	],
};

const out = path.join( dir, 'blueprint.json' );
fs.writeFileSync( out, JSON.stringify( blueprint, null, '\t' ) + '\n' );
console.log( `Wrote ${ path.relative( process.cwd(), out ) }` );
