# Serverless ResPat (Resource Patterns) Plugin
> Add common "Resource Pattern" combinations to your Serverless-Framework config.

## What is a "Resource Pattern"?
Resource patterns are simply a combination of cloud resources that are used for a specific goal. For example, what if you want to use Serverless to setup all the resources needed to forward emails sent to your domain. This requires multiple resources, such as lambda functions, S3 buckets, SES receipt rules, and IAM policies.

**Resource Patterns simplify the creation of resources for common scenarios.**

With Resource Patterns, rather than building your own Cloudformation object of all the resources, you only need to pass a simple config.

## Usage
Install:

`npm install --save-dev serverless-respat`

Add it to your plugins in your serverless config file:
```
"plugins": [
	"serverless-respat"
]
```

Add patterns to the "custom" object in your serverless config file:
```
"custom": {
	"serverless-respat": {
		prefix: "${self:service}-${opt:stage}",
		patterns: [
			{
				pattern_function: require("serverless-respat-ses-forwarder"),
				config: {
					ses_ruleset_name: "EmailForwarding",
					bucket_name: "el-bucket-de-email",
					email_recipients: ["kjsdfjweijfkjsdfhjkhdf.com"],
					lambda_function_name: "ForwardEmail"
				}
			}
		]
	}
}
```

As you can see, for each pattern, you pass a "pattern_function" and a "config". The pattern is simply a function that returns resources to be added. The config options passed will depend on the pattern function.

## Creating a Resource Pattern
Resource Patterns are just simple functions that generate Serverless Resources configurations. As an overly-simplified example, lets assume we want a resource pattern that just creates an S3 bucket. To do that you would create a function like this:

```
module.exports = function s3BucketPattern({config, serverless}) {
	let {
		prefix,
		pattern_name = "s3Bucket",
		bucket_name,
	} = config;

	let resources = {
		[`${pattern_name}FancyBucket`]: {
			"Type": "AWS::S3::Bucket",
			"Properties": {
				"BucketName": prefix + bucket_name,
				AccessControl: "Private"
			}
		};
	};

	return {
		resources
	};
};
```

Then, to use this pattern, you would add this to your serverless config:
```
"custom": {
	"serverless-respat": {
		prefix: "${self:service}-${opt:stage}",
		patterns: [
			{
				pattern_function: require("./myFancyBucketPattern"),
				config: {
					bucket_name: "fancy-bucket",
				}
			}
		]
	}
}
```

You could then chose to publish your pattern function on NPM so anyone could easily create a fancy bucket.

You may be wondering about the purpose of the `prefix`. In general, resource names created in a pattern should include the prefix. This allows users of your pattern to create consistently named resources and avoid name collisions. It is also worth keeping in mind that a user could use your pattern multiple times within the same project, so it may make sense to also allow naming options using your pattern's config object.
