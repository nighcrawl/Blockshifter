import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { isMasonrySupported, isMasonryEnabled, getMasonryColumns } from './logic';
import { mountGrid } from '../../frontend/masonry-init';

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

		if ( ! isMasonrySupported( name ) || ! isMasonryEnabled( attributes ) ) {
			return <BlockListBlock { ...props } />;
		}

		const columns = getMasonryColumns( attributes, name );

		return (
			<BlockListBlock
				{ ...props }
				wrapperProps={ {
					...wrapperProps,
					className: 'blockshifter-masonry',
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
 * Triggers the real packing JS (src/frontend/masonry-init.js) on a block's
 * actual DOM node the first time it becomes Masonry-enabled in this editing
 * session. `withMasonryPreview` above only ever sets a class/style through
 * React — it has no way to reach into the DOM to run `mountGrid()` itself,
 * so this is a second, separate `editor.BlockEdit` filter rather than a
 * second responsibility bolted onto the first.
 *
 * Only the initial mount needs to happen here: `mountGrid()` attaches a
 * `ResizeObserver` that keeps repacking on its own for the lifetime of the
 * element, including the resize a class/style toggle itself causes — so
 * toggling Masonry off and back on for the same block never needs a second
 * explicit call.
 */
export const withMasonryPreviewMount = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, attributes, clientId } = props;
		const enabled = isMasonrySupported( name ) && isMasonryEnabled( attributes );

		useEffect( () => {
			if ( ! enabled ) {
				return;
			}

			const element = getEditorDocument().getElementById( `block-${ clientId }` );

			if ( element ) {
				mountGrid( element );
			}
		}, [ enabled, clientId ] );

		return <BlockEdit { ...props } />;
	},
	'withMasonryPreviewMount'
);
