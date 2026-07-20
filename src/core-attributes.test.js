import { addCoreAttributes, TARGET_BLOCKS } from './core-attributes';

describe( 'addCoreAttributes', () => {
	it.each( TARGET_BLOCKS )(
		'adds blocktopusTransform and blocktopusConfig to %s',
		( blockName ) => {
			const settings = { name: blockName, attributes: { existing: { type: 'string' } } };

			const result = addCoreAttributes( settings, blockName );

			expect( result.attributes.existing ).toEqual( { type: 'string' } );
			expect( result.attributes.blocktopusTransform ).toEqual( {
				type: 'string',
				default: '',
			} );
			expect( result.attributes.blocktopusConfig ).toEqual( {
				type: 'object',
				default: {},
			} );
		}
	);

	it( 'leaves other blocks untouched', () => {
		const settings = { name: 'core/paragraph', attributes: { content: { type: 'string' } } };

		const result = addCoreAttributes( settings, 'core/paragraph' );

		expect( result ).toBe( settings );
		expect( result.attributes.blocktopusTransform ).toBeUndefined();
	} );

	it( 'does not mutate the original settings object', () => {
		const settings = { name: 'core/gallery', attributes: {} };

		addCoreAttributes( settings, 'core/gallery' );

		expect( settings.attributes.blocktopusTransform ).toBeUndefined();
	} );
} );
