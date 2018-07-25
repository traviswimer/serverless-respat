module.exports = {
	name: "existingResourceName",
	resources: {
		initialResource1: (config) => {
			return {"valid_pattern_resource_prop1": config.valid_pattern_resource_prop1};
		}
	}
};
