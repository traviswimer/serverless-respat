const cloneDeep = require('clone-deep');
const isAlphanumeric = require('is-alphanumeric');

class ServerlessRespatPlugin {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options;

		this.service = serverless.service;

		this.service.resources = this.service.resources || {};
		this.service.resources.Resources = this.service.resources.Resources || {};

		this.original_resources = cloneDeep(this.service.resources.Resources);

		this.plugin_config = this.service.custom['serverless-respat'] || {};
		this.plugin_config.patterns = this.plugin_config.patterns || [];
		this.plugin_config.prefix = this.plugin_config.prefix;

		this.addPatterns = this.addPatterns.bind(this);
		this.addPattern = this.addPattern.bind(this);

		this.commands = {
			respat: {
				usage: 'Adds resources defined by "resource-pattern" functions.',
				lifecycleEvents: ['add_patterns']
			}
		};

		this.hooks = {
			'before:package:initialize': () => this.serverless.pluginManager.spawn('respat'),

			'respat:add_patterns': this.addPatterns
		}
	}

	addPatterns() {
		this.plugin_config.patterns.forEach(this.addPattern);
	}

	addPattern(pattern) {
		let pattern_config = cloneDeep(pattern.config) || {};
		pattern_config.prefix = pattern_config.prefix || this.plugin_config.prefix;

		if (!pattern.pattern_function) {
			throw new Error('serverless-respat: All patterns must include a "pattern_function".');
		}

		// Generate the Resources using the provided pattern
		let pattern_function = pattern.pattern_function;
		let resources_to_add = pattern_function({config: pattern_config, serverless: this.serverless}).resources;

		if (!resources_to_add) {
			throw new Error(`Invalid object returned by pattern_function.`);
		}

		let resource_names = Object.keys(resources_to_add);

		// Check for Resource naming conflicts
		resource_names.forEach((resource_name) => {
			// Serverless only allows alphanumeric resource names
			if (!isAlphanumeric(resource_name)) {
				throw new Error(`serverless-respat: Resource name "${resource_name}" cannot contain non-alphanumeric characters.`);
			}

			if (this.service.resources.Resources[resource_name]) {
				throw new Error(`serverless-respat: Cannot add ${resource_name} to Resources, because it already exists.
						This was caused by the following "resource-pattern":\r\n\r\n
						${JSON.stringify(pattern, null, "\t")}`);
			} else {
				// Add the resource
				this.service.resources.Resources[resource_name] = resources_to_add[resource_name];
			}
		});
	}
}

module.exports = ServerlessRespatPlugin;
