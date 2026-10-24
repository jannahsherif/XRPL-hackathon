

# Amazon Bedrock AgentCore Gateway event types
<a name="gateway-event-types"></a>

This section provides information about the types of events that Amazon Bedrock AgentCore Gateway logs to CloudTrail.

**Topics**
+ [Amazon Bedrock AgentCore Gateway management events in CloudTrail](#gateway-management-events)
+ [Amazon Bedrock AgentCore Gateway data events in CloudTrail](#gateway-data-events)

## Amazon Bedrock AgentCore Gateway management events in CloudTrail
<a name="gateway-management-events"></a>

Every management event or log entry contains information about who generated the request. The identity information helps you determine the following:
+ Whether the request was made with root user or user credentials.
+ Whether the request was made on behalf of an IAM Identity Center user.
+ Whether the request was made with temporary security credentials for a role or federated user.
+ Whether the request was made by another AWS service.

CloudTrail is active in your AWS account when you create the account and you automatically have access to the CloudTrail *Event history* . The CloudTrail *Event history* provides a viewable, searchable, downloadable, and immutable record of the past 90 days of recorded management events in an AWS Region.

For an ongoing record of events in your AWS account past 90 days, create a trail or a CloudTrail Lake event data store.

Gateway logs management events for the following operations:


| Operation | Description | 
| --- | --- | 
| CreateGateway | Creates a new gateway | 
| CreateGatewayTarget | Creates a new target for a gateway | 
| DeleteGateway | Deletes a gateway | 
| DeleteGatewayTarget | Deletes a gateway target | 
| GetGateway | Gets information about a gateway | 
| GetGatewayTarget | Gets information about a gateway target | 
| ListGatewayTargets | Lists all targets for a gateway | 
| ListGateways | Lists all gateways | 
| UpdateGateway | Updates an existing gateway | 
| UpdateGatewayTarget | Updates an existing gateway target | 

## Amazon Bedrock AgentCore Gateway data events in CloudTrail
<a name="gateway-data-events"></a>

Data events provide information about the resource operations performed on or in a resource. These are also known as data plane operations. Data events are often high-volume activities. You must explicitly enable data events because they are not logged by default. The CloudTrail *Event history* doesn’t record data events.

Additional charges apply for logging data events. For more information about CloudTrail pricing, see [AWS CloudTrail Pricing](https://aws.amazon.com/cloudtrail/pricing/).

To learn how to enable logging data events for the Gateway resource types, see [Enable CloudTrail data event logging for Amazon Bedrock AgentCore Gateway resources](enabling-cloudtrail-data-event-logging.md).

The following table lists the Gateway resource types for which you can enable data events:


| Data event type | resources.type value | Data APIs logged to CloudTrail | 
| --- | --- | --- | 
| Bedrock-AgentCore gateway |  AWS::BedrockAgentCore::Gateway | InvokeGateway | 

### Identity information in data events
<a name="identity-info-data-events"></a>

Amazon Bedrock AgentCore Gateway data events differ from standard AWS data events in how identity information is stored. Because the Data API follows the MCP protocol and uses JSON Web Token (JWT)-based authentication rather than SigV4, Amazon Bedrock AgentCore Gateway data events don’t have standard AWS identity information. Instead, identity is captured by logging specific JWT claims, including the "sub" claim.

**Note**  
We recommend that you avoid using any personally identifiable information (PII) in this field. For example, you could use a GUID or a pairwise identifier, as suggested in the [OIDC specification](http://openid.net/specs/openid-connect-core-1_0.html#SubjectIDTypes) instead of PII data like email.

### Error information in data events
<a name="error-info-data-events"></a>

Amazon Bedrock AgentCore Gateway provides error information as part of the `responseElements` field rather than as top-level `errorCode` and `errorMessage` fields. If you’re looking for specific error types such as AccessDenied events, parse through the `responseElements` field in the CloudTrail event.

### Data event routing
<a name="data-event-routing"></a>

Because Amazon Bedrock AgentCore Gateway uses JWT tokens for authentication rather than SigV4 credentials, data events are only routed to the resource owner account.