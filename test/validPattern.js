module.exports = function validPattern({config, serverless}){
	return {
		validPatternResource1: {
			"valid_pattern_resource_prop1": config.valid_pattern_resource_prop1
		},
		validPatternResource2: {
			"valid_pattern_resource_prop2": config.valid_pattern_resource_prop2
		},
	}
}