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
 * Mounts a real Splide instance directly on the block's own DOM node
 * (see ADR "Carousel Editor Preview monte/détruit Splide sur le vrai DOM").
 * Splide restructures that DOM (inserting `.splide__track`/`.splide__list`)
 * exactly as `Blockshifter_Carousel_Transform::render()` does server-side —
 * safe only because it's mounted and destroyed strictly while the block is
 * *not* selected, before Gutenberg gets a chance to reconcile added,
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

				const splide = new Splide( element, buildSplideOptions( config, { isEditor: true } ) );

				splide.mount();
				splideRef.current = splide;
			} );

			return () => {
				cancelled = true;
				splideRef.current?.destroy();
				splideRef.current = null;
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
