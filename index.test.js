const Serverless = require('serverless');
const cloneDeep = require('clone-deep');

const ServerlessRespatPlugin = require('./index');

var serverless;
describe('ServerlessRespatPlugin', () => {
	beforeEach(() => {
		serverless = {
			cli: {
				log: jest.fn(),
				consoleLog: jest.fn()
			},
			pluginManager: {
				spawnzz: jest.fn()
			},
			service: {
				resources: {
					Resources: {
						"existingResourceNameinitialResource1": {},
						"existingResourceNameinitialResource2": {}
					}
				},
				custom: {
					'serverless-respat': {
						prefix: "prefix",
						patterns: []
					}
				}
			},
			getProvider: jest.fn(() => {
				return {
					sdk: {
						config: {
							update: jest.fn(),
							setPromisesDependency: jest.fn()
						}
					}
				}
			})
		}
	});

	describe('constructor()', () => {
		test('throws error when no prefix is specified', () => {
			delete serverless.service.custom['serverless-respat'].prefix;
			expect(() => {
				new ServerlessRespatPlugin(serverless);
			}).toThrow();
		});
	});

	describe('addPattern()', () => {
		test('adds resources to serverless Resources', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({
				pattern: require("./test/validPattern"),
				config: {
					valid_pattern_resource_prop1: "valid_pattern_resource_prop1",
					valid_pattern_resource_prop2: "valid_pattern_resource_prop2"
				}
			});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('adds default config props', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({pattern: require("./test/withDefaults")});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('includes resource_prefix in resource_names', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({resource_prefix: "ResourcePrefix", pattern: require("./test/validPattern")});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('overrides default config with user config', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({
				pattern: require("./test/withDefaults"),
				config: {
					default_prop2: "user_prop_value"
				}
			});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('overrides resource object with "overrides"', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({
				pattern: require("./test/validPattern"),
				config: {
					valid_pattern_resource_prop1: "valid_pattern_resource_prop1",
					valid_pattern_resource_prop2: "valid_pattern_resource_prop2"
				},
				overrides: {
					validPatternResource1: {
						valid_pattern_resource_prop1: "override_value"
					}
				}
			});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('overrides resource object with "overrides" as a function', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({
				pattern: require("./test/validPattern"),
				config: {
					valid_pattern_resource_prop1: "valid_pattern_resource_prop1",
					valid_pattern_resource_prop2: "valid_pattern_resource_prop2"
				},
				overrides: {
					validPatternResource1: ({resource, config}) => {
						return {
							valid_pattern_resource_prop1: resource.valid_pattern_resource_prop1 + "__override_value__" + config.valid_pattern_resource_prop1
						}
					}
				}
			});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});

		test('does not throw error when required prop are provided', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			expect(() => {
				plugin.addPattern({
					pattern: require("./test/requiredProps"),
					config: {
						required_prop_1: "some_value"
					}
				});
			}).not.toThrow();
		});

		test('throws error when required prop is missing', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			expect(() => {
				plugin.addPattern({pattern: require("./test/requiredProps")});
			}).toThrow();
		});

		test('throws error when resource name is not alphanumeric', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			expect(() => {
				plugin.addPattern({
					pattern: require("./test/nonAlphanumericName"),
					config: {
						valid_pattern_resource_prop1: "valid_pattern_resource_prop1"
					}
				});
			}).toThrow();
		});

		test('throws error when resource name already exists', () => {
			let plugin = new ServerlessRespatPlugin(serverless);
			expect(() => {
				plugin.addPattern({
					pattern: require("./test/existingResourceName"),
					config: {
						valid_pattern_resource_prop1: "valid_pattern_resource_prop1"
					}
				});
			}).toThrow();
		});
	});
});
