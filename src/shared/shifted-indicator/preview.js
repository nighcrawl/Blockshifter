import { createHigherOrderComponent } from '@wordpress/compose';
import { getActiveModule, getShiftedIndicatorLabel } from '../modules-registry';
import './indicator.css';

/**
 * Always-visible badge + color tint marking any block currently shifted by
 * a Blockshifter Module, whichever one it is — a single generic filter
 * rather than each Module's own `preview.js` growing its own copy. CSS-only
 * (a `data-*` attribute read back via `content: attr(...)`, plus a color
 * custom property), matching every other Editor Preview in this codebase:
 * none of them reach into the DOM except Masonry's real packing pass, which
 * needs to measure actual rendered heights — this needs nothing like that.
 */
export const withShiftedIndicator = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes, wrapperProps } = props;
		const module = getActiveModule( name, attributes );

		if ( ! module ) {
			return <BlockListBlock { ...props } />;
		}

		return (
			<BlockListBlock
				{ ...props }
				wrapperProps={ {
					...wrapperProps,
					className: [ wrapperProps?.className, 'blockshifter-shifted-indicator' ]
						.filter( Boolean )
						.join( ' ' ),
					style: {
						...wrapperProps?.style,
						'--blockshifter-shifted-color': module.color,
					},
					'data-blockshifter-shifted-label': getShiftedIndicatorLabel( name, attributes ),
				} }
			/>
		);
	},
	'withShiftedIndicator'
);
