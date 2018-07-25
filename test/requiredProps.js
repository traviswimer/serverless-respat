module.exports = {
	name: "requiredProps",
	resources: {
		resourceUsingDefaults: (config) => {
			return {
				"resource_prop1": config.default_prop1,
				"resource_prop2": config.default_prop2,
			}
		}
	},
	required_props: [
		"required_prop_1"
	]
};
