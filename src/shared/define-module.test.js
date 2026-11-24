import { defineModule } from './define-module';

const getSummary = jest.fn( () => 'summary' );

const fake = defineModule( {
	slug: 'fake',
	label: 'Blockshifter Fake',
	color: '#000000',
	supportedBlocks: [ 'core/gallery', 'core/group' ],
	defaultConfig: { size: 1, flag: false },
	getSummary,
} );

describe( 'defineModule', () => {
	it( 'keeps the descriptor fields as given', () => {
		expect( fake ).toMatchObject( {
			slug: 'fake',
			label: 'Blockshifter Fake',
			color: '#000000',
			supportedBlocks: [ 'core/gallery', 'core/group' ],
			defaultConfig: { size: 1, flag: false },
			getSummary,
		} );
	} );

	it.each( [ 'slug', 'label', 'color', 'supportedBlocks', 'defaultConfig', 'getSummary' ] )(
		'throws when %s is missing',
		( field ) => {
			const descriptor = {
				slug: 'fake',
				label: 'Fake',
				color: '#000',
				supportedBlocks: [],
				defaultConfig: {},
				getSummary,
			};
			delete descriptor[ field ];

			expect( () => defineModule( descriptor ) ).toThrow( field );
		}
	);
} );

describe( 'isSupported', () => {
	it( 'is true for a supported block', () => {
		expect( fake.isSupported( 'core/group' ) ).toBe( true );
	} );

	it( 'is false for any other block', () => {
		expect( fake.isSupported( 'core/paragraph' ) ).toBe( false );
	} );
} );

describe( 'isEnabled', () => {
	it( 'is true only when blockshifterTransform is this slug', () => {
		expect( fake.isEnabled( { blockshifterTransform: 'fake' } ) ).toBe( true );
		expect( fake.isEnabled( { blockshifterTransform: 'other' } ) ).toBe( false );
		expect( fake.isEnabled( { blockshifterTransform: '' } ) ).toBe( false );
	} );

	it( 'is false when attributes is undefined', () => {
		expect( fake.isEnabled( undefined ) ).toBe( false );
	} );
} );

describe( 'nextTransformOnToggle', () => {
	it( 'returns this slug when enabling, whatever was active', () => {
		expect( fake.nextTransformOnToggle( true, '' ) ).toBe( 'fake' );
		expect( fake.nextTransformOnToggle( true, 'other' ) ).toBe( 'fake' );
	} );

	it( 'clears the attribute when disabling and this Module owned it', () => {
		expect( fake.nextTransformOnToggle( false, 'fake' ) ).toBe( '' );
	} );

	it( 'leaves another Module\'s transform untouched when disabling', () => {
		expect( fake.nextTransformOnToggle( false, 'other' ) ).toBe( 'other' );
	} );
} );

describe( 'getConfig', () => {
	it( 'returns the defaults when no config is set', () => {
		expect( fake.getConfig( {} ) ).toEqual( { size: 1, flag: false } );
		expect( fake.getConfig( undefined ) ).toEqual( { size: 1, flag: false } );
	} );

	it( 'merges this Module\'s own config over the defaults, ignoring other Modules\' config', () => {
		const attributes = { blockshifterConfig: { fake: { size: 3 }, other: { size: 9, flag: true } } };

		expect( fake.getConfig( attributes ) ).toEqual( { size: 3, flag: false } );
	} );
} );

describe( 'setConfigValue', () => {
	it( 'sets one value under this Module\'s own namespace', () => {
		expect( fake.setConfigValue( {}, 'size', 2 ) ).toEqual( { fake: { size: 2 } } );
	} );

	it( 'keeps every other setting and every other Module\'s config untouched', () => {
		const attributes = { blockshifterConfig: { fake: { size: 3, flag: true }, other: { size: 9 } } };

		expect( fake.setConfigValue( attributes, 'size', 4 ) ).toEqual( {
			fake: { size: 4, flag: true },
			other: { size: 9 },
		} );
	} );

	it( 'never mutates the attributes it is given', () => {
		const attributes = { blockshifterConfig: { fake: { size: 3 } } };

		fake.setConfigValue( attributes, 'size', 4 );

		expect( attributes ).toEqual( { blockshifterConfig: { fake: { size: 3 } } } );
	} );
} );
