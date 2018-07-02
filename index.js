class ServerlessRespatPlugin {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options;

		this.service = serverless.service;

		this.service.resources = this.service.resources || {};
		this.service.resources.Resources = this.service.resources.Resources || {};

		this.original_resources = this.cloneObject(this.service.resources.Resources);

		this.addPatterns = this.addPatterns.bind(this);
		this.addPattern = this.addPattern.bind(this);

		this.commands = {
			respat: {
				usage: 'Updates resources with changes specifed in "resource-patterns".',
				lifecycleEvents: ['add_patterns']
			}
		};

		this.hooks = {
			'before:package:initialize': () => this.serverless.pluginManager.spawn('respat'),

			'respat:add_patterns': this.addPatterns
		}
	}

	cloneObject(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	addPatterns() {
		let config = this.service.custom['serverless-respat'] || {};
		config.patterns = config.patterns || [];

		config.patterns.forEach(this.addPattern);
	}

	addPattern(pattern) {
		let config = this.cloneObject(pattern.config) || {};
		let serverless = this.cloneObject(this.serverless);

		if (!pattern.pattern_module) {
			throw new Error('serverless-respat: All patterns must include a "pattern_module".');
		}
		let pattern_function = require(pattern.pattern_module);
		let resources_to_add = pattern_function({config, serverless});
		let resource_names = Object.keys(resources_to_add);

		resource_names.forEach((resource_name) => {
			if (this.service.resources.Resources[resource_name]) {
				throw new Error(`serverless-respat: Cannot add ${resource_name} to Resources, because it already exists.
						This was caused by the following "resource-pattern":\r\n\r\n
						${JSON.stringify(pattern, null, "\t")}`);
			} else {
				this.service.resources.Resources[resource_name] = resources_to_add[resource_name];
			}
		});
	}
}

module.exports = ServerlessRespatPlugin;
