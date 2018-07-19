const Serverless = require('serverless');

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
						"initial_resource1": {},
						"initial_resource2": {}
					}
				},
				custom: {
					'serverless-respat': {
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

	describe('addPattern()', () => {
		test('adds resources to serverless Resources', () => {
			// serverless.service.custom['serverless-respat'].patterns.push({
			// 	pattern_module: function() {}
			// });

			let plugin = new ServerlessRespatPlugin(serverless);
			plugin.addPattern({
				pattern_module: require("./test/validPattern"),
				config: {
					valid_pattern_resource_prop1: "valid_pattern_resource_prop1",
					valid_pattern_resource_prop2: "valid_pattern_resource_prop2"
				}
			});
			expect(serverless.service.resources.Resources).toMatchSnapshot();
		});
	});
});
