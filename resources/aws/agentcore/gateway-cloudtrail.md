

# Log Amazon Bedrock AgentCore Gateway API calls with CloudTrail
<a name="gateway-cloudtrail"></a>

Amazon Bedrock AgentCore Gateway is integrated with AWS CloudTrail, a service that provides a record of actions taken by a user, role, or an AWS service in Gateway. CloudTrail captures all API calls for Gateway as events, including calls from the Gateway console and code calls to the Gateway APIs. Using the information collected by CloudTrail, you can determine the request that was made to Gateway, who made the request, when it was made, and additional details. There are two types of events: **Management events** and **Data events**.

For more information about using CloudTrail with Gateway, see the following resources:
+  [AWS CloudTrail User Guide](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/) 
+  [Creating a Trail for Your AWS Account](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-create-and-update-a-trail.html) 
+  [AWS CloudTrail API Reference](https://docs.aws.amazon.com/awscloudtrail/latest/APIReference/) 
+  [AWS CloudTrail CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/index.html) 

**Topics**
+ [Amazon Bedrock AgentCore Gateway event types](gateway-event-types.md)
+ [Enable CloudTrail data event logging for Amazon Bedrock AgentCore Gateway resources](enabling-cloudtrail-data-event-logging.md)
+ [Understanding Amazon Bedrock AgentCore Gateway CloudTrail events](understanding-gateway-cloudtrail-log-entries.md)