module.exports = {
	name: "validPattern",
	resources: {
		resourceUsingDefaults: (config) => {
			return {
				"resource_prop1": config.default_prop1,
				"resource_prop2": config.default_prop2,
			}
		}
	},
	default_config: {
		"default_prop1": "default_value1",
		"default_prop2": "default_value2"
	}
};
