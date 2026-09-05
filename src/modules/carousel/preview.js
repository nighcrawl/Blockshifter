import { createHigherOrderComponent } from '@wordpress/compose';
import { isCarouselSupported, isCarouselEnabled, getCarouselConfig } from './logic';
import './preview.css';

/**
 * CSS-only Carousel Editor Preview (see ADR "Carousel Editor Preview en CSS
 * scroll-snap, pas de vrai Splide monté") — a horizontally-scrolling,
 * snap-aligned row, styled entirely through `wrapperProps` on the block's
 * own wrapper (exactly like the Masonry Module's `withMasonryPreview`).
 * Never restructures the DOM, so it stays visible even while the block is
 * selected and being edited, unlike the real-Splide approach it replaces.
 */
export const withCarouselPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes, wrapperProps } = props;

		if ( ! isCarouselSupported( name ) || ! isCarouselEnabled( attributes ) ) {
			return <BlockListBlock { ...props } />;
		}

		const { perPage } = getCarouselConfig( attributes );

		return (
			<BlockListBlock
				{ ...props }
				wrapperProps={ {
					...wrapperProps,
					className: [ wrapperProps?.className, 'blockshifter-carousel-preview' ]
						.filter( Boolean )
						.join( ' ' ),
					style: {
						...wrapperProps?.style,
						'--blockshifter-carousel-per-page': Math.max( 1, perPage ),
					},
				} }
			/>
		);
	},
	'withCarouselPreview'
);
