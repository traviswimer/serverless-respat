module.exports = {
	name: "nonAlphanumericName",
	resources: {
		'this_is*not@lphanumeric': (config) => {
			return {"valid_pattern_resource_prop1": config.valid_pattern_resource_prop1}
		}
	}
};
