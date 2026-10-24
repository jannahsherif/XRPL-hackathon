

# Create a policy
<a name="policy-create-policies"></a>

Policy in Amazon Bedrock AgentCore uses Cedar as its authorization language to control access to tools and resources. This guide explains how to understand Cedar policies and write authorization requirements in natural language that can be automatically converted to Cedar. Natural language policy generation requires a deployed AgentCore Gateway and policy engine.

Cedar is a formal policy language that provides precise, verifiable access control. When working with AgentCore Gateway authorization:
+  **Understand Cedar policies** - Read and interpret existing Cedar policies to understand access control rules
+  **Write in natural language** - Express authorization requirements using clear, precise natural language
+  **Convert to Cedar** - Use policy authoring service to automatically generate Cedar policies from natural language
+  **Verify policies** - Review generated Cedar policies to ensure they match your requirements

You don’t need to memorize Cedar syntax. Focus on understanding policy structure and writing precise natural language requirements.

**Topics**
+ [Policy scope](policy-scope.md)
+ [Policy conditions](policy-conditions.md)
+ [Authorization flow](policy-authorization-flow.md)
+ [Schema constraints](policy-schema-constraints.md)