const cloneDeep = require('clone-deep');
const deepMerge = require('deepmerge');
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

		if (!this.plugin_config.prefix) {
			throw new Error(`serverless-respat: You must specify a "prefix".`);
		}

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

	addPattern(user_pattern_settings) {
		if (!user_pattern_settings.pattern) {
			throw new Error('serverless-respat: Every object in the "patterns" array must include a "pattern" property.');
		}

		let pattern = user_pattern_settings.pattern;

		// Ensure pattern is valid
		if (!pattern.name) {
			throw new Error('serverless-respat: Invalid resource pattern provided. All patterns must specify a "name".');
		}
		if (!pattern.resources) {
			throw new Error(`serverless-respat: Invalid resource pattern provided. All patterns must specify "resources".`);
		}

		// Build config object
		let default_config = cloneDeep(pattern.default_config || {});
		let user_config = cloneDeep(user_pattern_settings.config) || {};
		let pattern_config = deepMerge(default_config, user_config);
		let resource_prefix = user_pattern_settings.resource_prefix || "";
		pattern_config.prefix = pattern_config.prefix || this.plugin_config.prefix;

		// Ensure required config properties have been provided
		let required_props = pattern.required_props || [];
		required_props.forEach((prop_name) => {
			if (typeof pattern_config[prop_name] === 'undefined') {
				throw new Error(`serverless-respat: Required property "${prop_name}" missing from config for "${pattern.name}"`);
			}
		});

		let resource_names = Object.keys(pattern.resources);

		// Check for Resource naming conflicts
		resource_names.forEach((resource_name) => {
			// Serverless only allows alphanumeric resource names
			if (!isAlphanumeric(resource_name)) {
				throw new Error(`serverless-respat: Resource name "${resource_name}" cannot contain non-alphanumeric characters.`);
			}

			let prefixed_resource_name = resource_prefix + pattern.name + resource_name;

			if (this.service.resources.Resources[prefixed_resource_name]) {
				throw new Error(`serverless-respat: Cannot add ${resource_name} to Resources, because it already exists.
						This was caused by the following "resource-pattern":\r\n\r\n
						${JSON.stringify(pattern, null, "\t")}`);
			} else {
				// Add the resource (can be either an object or a function that returns an object)
				let resource = pattern.resources[resource_name];
				this.service.resources.Resources[prefixed_resource_name] = resource(pattern_config, this.serverless);
			}
		});
	}
}

module.exports = ServerlessRespatPlugin;
