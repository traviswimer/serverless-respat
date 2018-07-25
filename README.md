# Serverless ResPat (Resource Patterns) Plugin

> Add common "Resource Pattern" combinations to your Serverless-Framework config.

## What is a "Resource Pattern"?

Resource patterns are simply a combination of cloud resources that are used for a specific goal. For example, what if you want to use Serverless to setup all the AWS resources needed to forward emails sent to your domain. This requires multiple resources, such as lambda functions, S3 buckets, SES receipt rules, and IAM policies.

**Resource Patterns simplify the creation of resources for common scenarios.**

With Resource Patterns, rather than building your own Cloudformation object of all the resources, you only need to pass a simple config.

## Usage

Install:

`npm install --save-dev serverless-respat`

Add it to your plugins in your serverless config file:

```javascript
"plugins": [
	"serverless-respat"
]
```

Add patterns to the "custom" object in your serverless config file.

**Simple Example:**

```javascript
"custom": {
	"serverless-respat": {
		prefix: "${self:service}-${opt:stage}",
		patterns: [
			{
				pattern: require("serverless-respat-ses-forwarder"),
				config: {
					ses_ruleset_name: "EmailForwarding",
					bucket_name: "your-bucket-name",
					email_recipients: ["YOUR_DOMAIN"],
					lambda_function_name: "ForwardEmail"
				}
			}
		]
	}
}
```

**Complex Example:**

```javascript
"custom": {
	"serverless-respat": {
		prefix: "${self:service}-${opt:stage}",
		patterns: [
			{
				// Resource Pattern object
				pattern: require("serverless-respat-ses-forwarder"),

				// This config is passed to the resource functions specified in the "pattern"
				config: {
					ses_ruleset_name: "EmailForwarding",
					bucket_name: "your-bucket-name",
					email_recipients: ["YOUR_DOMAIN"],
					lambda_function_name: "ForwardEmail"
				},

				// This is prepended to all Serverless resources created
				resource_prefix: "EmailFwd",

				// This will override the "MaxSessionDuration" property on the
				// "LambdaForwardRole" resource created by the specified pattern.
				overrides: {
					LambdaForwardRole: {
						Properties: {
							MaxSessionDuration: 10000
						}
					}
				}
			}
		]
	}
}
```

## Plugin Config API

-   **prefix** (string) - A string that should be used in resource patterns to ensure unique resource names.
-   **patterns** (array) - A list of resource patterns to be added.
    -   **pattern** (object) - A Resource Pattern object.
    -   **config** (object) - Config values used by the pattern. (will differ depending on the pattern)
    -   **resource_prefix** (string) _OPTIONAL_ - A prefix that will be prepended to all Serverless resource names. (Can fix name collisions if using the same pattern multiple times)
    -   **overrides** (function|object) _OPTIONAL_ - Specifies values to override for each resource in the pattern.

## Creating a Resource Pattern

Resource Patterns are just objects that specify how to generate Serverless Resources configurations. As an overly-simplified example, lets assume we want a resource pattern that just creates an S3 bucket. To do that you would create an object like this:

```javascript
module.exports = {
	// Name of the pattern (will be included in Resource names)
	name: "s3BucketPattern",

	// The resources to be added as part of the pattern
	resources: {
		"FancyBucket": ({prefix, bucket_name, access}, serverless) => {
			return {
				Type: "AWS::S3::Bucket",
				Properties: {
					BucketName: prefix + bucket_name,
					AccessControl: access
				}
			}
		}
	},

	// Default values to be used if user does not specify the property in their config
	default_config: {
		access: "Private"
	}

	// Config properties that the user is required to specify
	required_props: [
		"bucket_name"
	]
};
```

Then, to use this pattern, you would add this to your serverless config:

```javascript
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

## Resource-Pattern Object

* **name** (string) - The name of the pattern. (Is automatically included in resource names)
* **resources** (object) - Each property defines a function that creates a resource. The property name will become the Serverless resource name. Each function will receive the pattern config as the first argument and the `serverless` object as the second.
* **default_config** (object) - The default config values that will be used if the user does not specify them.
* **required_props** (array) - An array of strings specifying which config values a user must define.
