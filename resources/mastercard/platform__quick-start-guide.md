# Quick Start Guide
source: https://developer.mastercard.com/platform/documentation/quick-start-guide/index.md

Use this guide to create your Mastercard Developers account, set up a project, test your integration in Sandbox, and request Production access when you are ready to go live.

## Step 1: Create and Activate Your Mastercard Developers Account {#step-1-create-and-activate-your-mastercard-developers-account}

1. Sign up for a [Mastercard Developers account](https://developer.mastercard.com/account/sign-up).
2. Activate your account using the verification link sent to your email.
3. Log in to Mastercard Developers.

## Step 2: Create a Project and Add APIs {#step-2-create-a-project-and-add-apis}

All Mastercard API integrations start with a project. A project represents one application or business use case and may include multiple APIs. APIs added to a single project must use compatible authentication protocols.

1. Log in and go to the [My Projects](https://developer.mastercard.com/dashboard) page.
2. Click "Create new project."
3. Provide your project details and, if applicable, client details.

![Create new project screen](https://static.developer.mastercard.com/content/platform/img/create-new-project.png)
Note: When creating a project, select **Yes** for "Are you creating this project on behalf of a client?" only if you are building the integration for another company. If you are creating the project for your own organization, select **No** and do not re-enter your organization's details as client information.

4. Select the API(s) you plan to integrate with and click "Proceed."

Note: The authentication method and credentials generated inside your project depend on the API(s) you selected. You can find more information on the different supported authentication mechanisms on the [Authentication](https://developer.mastercard.com/platform/documentation/authentication/index.md) page.

5. Generate and download your credentials.
6. Click the "Open Project" button. Now you're ready to test in Sandbox.

## Step 3: Integrate \& Test {#step-3-integrate--test}

### Option 1: Test with an API Tool (Recommended for First-Time Users) {#option-1-test-with-an-api-tool-recommended-for-first-time-users}

1. Open the documentation for the API you are integrating with.
2. Review the authentication requirements and available endpoints.
3. Configure your Sandbox credentials in your API tool (eg. Postman or Insomnia).
   * Read our [blog post](https://developer.mastercard.com/blog/a-mastercard-plugin-for-insomnia-rest-client/) and accompanying [tutorial](https://developer.mastercard.com/platform/documentation/developer-tools/insomnia-collection/index.md) to learn about using the Insomnia app to interact with Mastercard APIs.
4. Send test requests to the Sandbox environment.

### Option 2: Use Mastercard SDKs {#option-2-use-mastercard-sdks}

1. Open the documentation for the API you are integrating with.
2. Navigate to the *SDK Reference* section.
3. Select your preferred programming language.
4. Use the provided code samples and SDK documentation to begin integrating.

### Option 3: Generate Your Own API Client (Best for Production-Ready Integrations) {#option-3-generate-your-own-api-client-best-for-production-ready-integrations}

1. Open the documentation for the API you're integrating with and go to the *API Reference* page.
2. Download the API specification (OpenAPI or Swagger).
3. Generate and configure an API client for this API.
4. Configure your client using our client libraries.

For a detailed step-by-step guide see [Generating and Configuring a Mastercard API Client](https://developer.mastercard.com/platform/documentation/developer-tools/generating-and-configuring-a-mastercard-api-client/index.md).

## Step 4: Production Prerequisites {#step-4-production-prerequisites}

Before you can request Production access, you need to complete a few steps located in the *Production access prerequisites* section on your project *Summary* page.

![Production access prerequisites](https://static.developer.mastercard.com/content/platform/img/prod-access-prereqs.png)

1. First you need to verify your company. This ensures your company is registered to do business with Mastercard. You can follow steps in our [Company Verification guide](https://developer.mastercard.com/platform/documentation/account-management/company-verification/index.md) to complete this step.

2. You also need to provide your "commercial countries" to indicate where you are doing business for this API integration (i.e. where are your end customers located).

## Step 5: Go Live in Production {#step-5-go-live-in-production}

After you have tested your implementation in Sandbox and completed your Production prerequisite steps, you can move to Production and go live.

1. Open your project and click the "Request Production access" button on the *Summary* page and complete the steps in the flow.

2. When you reach the final step in the flow, your request will be submitted and your credentials will be generated and ready to download. After you download your credentials, click the "Open project" button.

Note: Production credentials are generated instantaneously but they are only activated once your Production request is approved.

3. Once we have reviewed and approved your request, you will receive an approval email. Now your Production credentials are activated and you're ready to go live with your API integration.

## FAQs {#faqs}

A service may not appear in the APIs dropdown if it's private and you don't have access to it. In this case, you must request access to the service before it can be added to your project.

Additionally, a service may not appear if it is documentation-only.
Keys generated on Mastercard Developers are valid for 13 months.

You will receive multiple email reminders to replace or renew your keys before they expire. These reminders are sent 60, 30, 15, 5, and 1 day prior to expiration.
Some services require approval before granting access to their Sandbox environment. If your Sandbox access shows as "Under Review," your request is pending review by the service team. Once reviewed, the status will be updated to Approved or Declined based on their decision. If your company has already been verified, the step will not be shown. You can see if your company has been verified by going to the [*My Account* page](https://developer.mastercard.com/account/profile) and checking if there is a `VERIFIED` badge next to your company name.

Customers who use single sign-on (SSO) are verified automatically, so they will not be prompted to go through the company verification process.
This error is usually caused by a mismatch between the credentials and environment being used. Ensure that Sandbox endpoints are using Sandbox credentials, Production endpoints are using Production credentials, and that Sandbox and Production credentials have not been mixed. If your configuration appears correct and the issue persists, contact API Support with details of the request and any relevant error messages for further investigation.
