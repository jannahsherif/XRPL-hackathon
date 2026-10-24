# Business Relationship Type (BRT)
source: https://developer.mastercard.com/platform/documentation/account-management/business-relationship-type/index.md

## Overview {#overview}

When becoming a Mastercard customer, your company is assigned a unique Company ID (CID). Along with the CID, a Business Relationship Type (BRT) is also assigned. The BRT defines the nature of your company's relationship with Mastercard and the types of products and services your company is authorized to use.

Each product and service offered through Mastercard Developers is associated with a specific BRT. To request Production access, the API services added to your project must align with the BRT assigned to your company. This ensures that your company can only access products and services that are authorized for its business relationship with Mastercard.

In order to request Production access for a service that is not currently covered by the BRT assigned to your CID, you can request an additional BRT by following the steps below.
Note: In order to add a new BRT to your company, you have to successfully complete [Company Verification](https://developer.mastercard.com/platform/documentation/account-management/company-verification/index.md)

## Submit an add BRT request {#submit-an-add-brt-request}

1. When a service on your project requires a BRT that is not associated with your CID, and if it supports self-service BRT addition, a "Production access prerequisites" task called "Provide additional company details" will appear.
2. Click on "Get Started."

![Get Started](https://static.developer.mastercard.com/content/platform/img/brt-1.png)

3. Provide your company phone number and click the "Next" button.

![Phone Number](https://static.developer.mastercard.com/content/platform/img/brt-2.png)

4. Review the information and submit your request by clicking the "Submit" button.

![Request Details](https://static.developer.mastercard.com/content/platform/img/brt-3.png)

5. After the request is successfully submitted, the status of the "Production access prerequisites" task will change to `UPDATE IN PROGRESS`.

![Update in progress](https://static.developer.mastercard.com/content/platform/img/brt-4.png)

## Complete the onboarding process for the missing BRT {#complete-the-onboarding-process-for-the-missing-brt}

1. Check your mailbox for an email from [noreplycompanyonboarding@mastercard.com](mailto:noreplycompanyonboarding@mastercard.com)
2. Click on the "Get Started" button.

![Get Started](https://static.developer.mastercard.com/content/platform/img/brt-5.png)

3. Follow the link to the Customer Onboarding Platform and complete the required questionnaire. After review and approval, the missing BRT will be added to your company's CID.
4. Once the BRT is added, your Mastercard Developers account will be updated automatically. The "Production access prerequisites" section will be cleared, and the "Request Production access" button will be enabled.

Note: It may take up to 2 hours for your Mastercard Developers account to reflect the updated CID and BRT information. During this time, the "Production access prerequisites" section may continue to show the missing requirement, and the "Request Production access" button may remain disabled.
