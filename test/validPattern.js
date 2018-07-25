module.exports = {
	name: "validPattern",
	resources: {
		validPatternResource1: (config) => {
			return {"valid_pattern_resource_prop1": config.valid_pattern_resource_prop1}
		},
		validPatternResource2: (config) => {
			return {"valid_pattern_resource_prop2": config.valid_pattern_resource_prop2}
		}
	}
};
