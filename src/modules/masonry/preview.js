import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { masonryModule, getMasonryColumns } from './logic';
import { mountGrid, unmountGrid } from '../../frontend/masonry-init';

/**
 * The block editor canvas runs inside its own iframe (`iframe[name=
 * "editor-canvas"]`, the same selector Gutenberg itself relies on
 * internally) since WordPress 6.3 — `document` alone can't reach a block's
 * real DOM node. Falls back to the top document for setups without an
 * iframed canvas (e.g. older WordPress, or the Widgets screen).
 */
function getEditorDocument() {
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );

	return iframe?.contentDocument ?? document;
}

/**
 * Adds the Masonry Module's CSS Grid class and column custom property to a
 * block's own wrapper element, mirroring
 * Blockshifter_Masonry_Transform::add_masonry_classes_and_props() on the PHP
 * side. Goes through `wrapperProps` (merged onto the wrapper by Gutenberg's
 * own `useBlockProps()`) rather than direct DOM mutation, so it survives
 * Gutenberg's own re-renders instead of fighting them.
 */
export const withMasonryPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes, wrapperProps } = props;

		if ( ! masonryModule.isSupported( name ) || ! masonryModule.isEnabled( attributes ) ) {
			return <BlockListBlock { ...props } />;
		}

		const columns = getMasonryColumns( attributes, name );

		return (
			<BlockListBlock
				{ ...props }
				wrapperProps={ {
					...wrapperProps,
					className: [ wrapperProps?.className, 'blockshifter-masonry' ].filter( Boolean ).join( ' ' ),
					style: {
						...wrapperProps?.style,
						'--blockshifter-masonry-columns': columns,
					},
				} }
			/>
		);
	},
	'withMasonryPreview'
);

/**
 * Keeps `mountGrid()` attached to whatever DOM node currently carries
 * `#block-{clientId}`, and returns a cleanup that detaches everything.
 *
 * The node behind that id is not stable for the lifetime of the block:
 * `core/post-template` first renders a `<p>` spinner while its posts load,
 * then swaps it for the real `<ul>` — same id, new element. Mounting once
 * on whatever node exists at effect time left the grid unpacked in the
 * editor until Masonry was toggled off and on again. A `childList`
 * observer on the document re-resolves the id on every structural change
 * (cheap: one `getElementById`) and moves the mount over when the node
 * changes. Attribute changes — including the inline spans `mountGrid()`
 * itself writes — are deliberately not observed.
 */
function trackBlockElement( doc, id ) {
	let current = null;

	const sync = () => {
		const element = doc.getElementById( id );

		if ( element === current ) {
			return;
		}

		if ( current ) {
			unmountGrid( current );
		}

		current = element;

		if ( current ) {
			mountGrid( current );
		}
	};

	sync();

	const observer =
		typeof MutationObserver === 'undefined' || ! doc.body ? null : new MutationObserver( sync );
	observer?.observe( doc.body, { childList: true, subtree: true } );

	return () => {
		observer?.disconnect();

		if ( current ) {
			unmountGrid( current );
			current = null;
		}
	};
}

/**
 * Triggers the real packing JS (src/frontend/masonry-init.js) on a block's
 * actual DOM node while it is Masonry-enabled in this editing session.
 * `withMasonryPreview` above only ever sets a class/style through React —
 * it has no way to reach into the DOM to run `mountGrid()` itself, so this
 * is a second, separate `editor.BlockEdit` filter rather than a second
 * responsibility bolted onto the first.
 *
 * The matching `unmountGrid()` runs as this effect's own cleanup — on every
 * re-run (Masonry toggled off, or a different clientId) and on unmount —
 * and whenever the block's DOM node is swapped for a new one (see
 * `trackBlockElement`). That reverses `mountGrid()`'s DOM mutations (the
 * `is-masonry-packed` class, per-item inline styles, its observers) as soon
 * as Masonry stops being enabled, so no stale masonry-packed state is left
 * behind to conflict with another Module's own Editor Preview taking over
 * the same block (e.g. switching to Carousel).
 */
export const withMasonryPreviewMount = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, attributes, clientId } = props;
		const enabled = masonryModule.isSupported( name ) && masonryModule.isEnabled( attributes );

		useEffect( () => {
			if ( ! enabled ) {
				return;
			}

			return trackBlockElement( getEditorDocument(), `block-${ clientId }` );
		}, [ enabled, clientId ] );

		return <BlockEdit { ...props } />;
	},
	'withMasonryPreviewMount'
);
