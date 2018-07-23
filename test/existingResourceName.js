module.exports = function validPattern({config}) {
	return {
		resources: {
			initial_resource1: (config) => {
				return {"valid_pattern_resource_prop1": config.valid_pattern_resource_prop1};
			}
		}
	}
}
