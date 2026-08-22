import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useRef } from '@wordpress/element';
import { isCarouselSupported, isCarouselEnabled, getCarouselConfig, buildSplideOptions } from './logic';

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
 * Splide (v4) never builds its own `.splide__track`/`.splide__list` wrapper
 * — it throws ("A track/list element is missing") unless that structure
 * already exists. `Blockshifter_Carousel_Transform::insert_splide_track()`
 * builds it server-side by rewriting a static HTML string; there's no
 * equivalent for a live React tree, so this wraps the block's *existing*
 * child DOM nodes in place — reparenting them, never recreating them, so
 * React's own fiber-to-node references stay valid while they're moved.
 * Paired with `unwrapForSplide()`, called before Splide ever mounts.
 */
function wrapForSplide( element ) {
	if ( element.querySelector( ':scope > .splide__track' ) ) {
		return;
	}

	const ownerDocument = element.ownerDocument;
	const track = ownerDocument.createElement( 'div' );
	const list = ownerDocument.createElement( 'div' );

	track.className = 'splide__track';
	list.className = 'splide__list';

	Array.from( element.children ).forEach( ( child ) => {
		child.classList.add( 'splide__slide' );
		list.appendChild( child );
	} );

	track.appendChild( list );
	element.appendChild( track );
	element.classList.add( 'splide' );
}

/**
 * Reverses `wrapForSplide()`: moves each slide back to being a direct child
 * of the block's own element, in its original order, and removes the
 * `.splide__track`/`.splide__list`/`.splide__slide`/`.splide` markup this
 * module — not Splide itself — inserted. Must run before the block can
 * become selected again, so Gutenberg only ever reconciles children against
 * the flat DOM shape it originally rendered.
 */
function unwrapForSplide( element ) {
	const track = element.querySelector( ':scope > .splide__track' );

	if ( ! track ) {
		return;
	}

	const list = track.querySelector( ':scope > .splide__list' );

	Array.from( list ? list.children : [] ).forEach( ( child ) => {
		child.classList.remove( 'splide__slide' );
		element.appendChild( child );
	} );

	track.remove();
	element.classList.remove( 'splide' );
}

/**
 * Mounts a real Splide instance directly on the block's own DOM node
 * (see ADR "Carousel Editor Preview monte/détruit Splide sur le vrai DOM").
 * Safe only because the wrap/mount happens strictly while the block is
 * *not* selected, and destroy/unwrap happens the moment it becomes selected
 * (or unmounts) — before Gutenberg gets a chance to reconcile added,
 * removed, or reordered children against a DOM shape it no longer expects.
 *
 * Splide is dynamically imported so the always-loaded editor bundle
 * (`build/index.js`) never carries it — only a block with Carousel actually
 * enabled pays for it, and only once it needs it.
 */
export const withCarouselPreview = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, attributes, clientId, isSelected } = props;
		const enabled = isCarouselSupported( name ) && isCarouselEnabled( attributes );
		const config = getCarouselConfig( attributes );
		const configKey = JSON.stringify( config );
		const splideRef = useRef( null );

		useEffect( () => {
			if ( ! enabled || isSelected ) {
				return undefined;
			}

			const element = getEditorDocument().getElementById( `block-${ clientId }` );

			if ( ! element ) {
				return undefined;
			}

			let cancelled = false;

			Promise.all( [
				import( '@splidejs/splide' ),
				import( '@splidejs/splide/css/core' ),
				import( '../../frontend/carousel-nav.css' ),
				import( '../../frontend/carousel-layout.css' ),
			] ).then( ( [ { default: Splide } ] ) => {
				if ( cancelled ) {
					return;
				}

				wrapForSplide( element );

				const splide = new Splide( element, buildSplideOptions( config, { isEditor: true } ) );

				splide.mount();
				splideRef.current = splide;
			} );

			return () => {
				cancelled = true;
				splideRef.current?.destroy();
				splideRef.current = null;
				unwrapForSplide( element );
			};
			// `config` is intentionally omitted: `configKey` is its stable,
			// content-based stand-in, so a config value change re-runs this
			// effect without doing so on every unrelated attribute change.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ enabled, isSelected, clientId, configKey ] );

		return <BlockEdit { ...props } />;
	},
	'withCarouselPreview'
);
