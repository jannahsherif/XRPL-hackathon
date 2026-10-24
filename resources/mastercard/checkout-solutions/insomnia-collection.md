# Insomnia Collection
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/insomnia-collection/index.md

[Insomnia](https://insomnia.rest/) is an open-source API client that developers use to quickly and easily send REST requests to Mastercard APIs. Ready-to-use json packages in Insomnia allow you to test API calls multiple times without having to write code.

The following steps will show you how to use Insomnia collections for [Mastercard Checkout Solutions APIs](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md).

## Prerequisites {#prerequisites}

* Sign up on Mastercard Connect and use **"Mastercard Checkout Solutions - Sandbox"** application to:   

  * [Enroll into a program](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md)
  * [Create a project](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step6/index.md) for the program you want to make a call to
  * [Generate necessary keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md)
* For Click to Pay program, before calling the [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API in Postman, you must integrate with our [JavaScript library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step2/index.md) to call the SDK methods and generate necessary credentials for the API call.

## 1. Download Insomnia application {#1-download-insomnia-application}

Download [Insomnia](https://insomnia.rest/download) application for your operating system.

## 2. Install the Mastercard Plugin for Insomnia {#2-install-the-mastercard-plugin-for-insomnia}

Download the `insomnia-plugin-mastercard.zip` file from the plugin's [Latest Release](https://github.com/Mastercard/insomnia-plugin-mastercard/releases). Follow the instructions in this [step](https://developer.mastercard.com/platform/tutorial/use-insomnia-rest-client-for-mastercard-apis/step-2/) to extract the content of the zip file in the Plugins folder.

## 3. Import Data in Insomnia {#3-import-data-in-insomnia}

On your Insomnia dashboard, on the top-right corner, navigate to **Create \> Import From \> File** and import any/all of the following packages.

![Import package in Insomnia](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/insomnia-import.png "Import package in Insomnia")

|                    API                     |                                                                                 Collection                                                                                  |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Registration APIs                          | [MCS - Registration.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Registration.json) (43KB)                         |
| Card APIs                                  | [MCS - Card APIs.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Card%20APIs.json) (134KB)                            |
| Cards Batch Enrollment APIs                | [MCS - Cards Batch Enrollment.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Cards%20Batch%20Enrollment.json) (7KB)  |
| Authentication APIs                        | [MCS - Authentication.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Authentication.json) (39KB)                     |
| Click to Pay Checkout API                  | [MCS - Click to Pay Checkout.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Click%20to%20Pay%20Checkout.json) (66KB) |
| Secure Card on File Checkout API           | [MCS - SCOF - Checkout.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20SCOF%20-%20Checkout.json) (71KB)               |
| Mastercard Virtual Card Token Checkout API | [MCS - MVCT - Checkout.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20MVCT%20-%20Checkout.json) (90KB)               |
| Guest Checkout API                         | [MCS - Guest Checkout.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Guest%20Checkout.json) (56KB)                   |
| Confirmations API                          | [MCS - Confirmations.json](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MCS%20-%20Confirmations.json) (64KB)                       |

## 4. Configure Environment {#4-configure-environment}

Our ready-to-use json packages contain the environment setup per collection. Ensure that you replace the values for the following environment variables with your project level keys/IDs:

* consumerKey   
* keyAlias   
* keystoreP12Path   
* keystorePassword   
* srcClientId   

See a sample environment below:

![Environment setup in Insomnia](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/insomnia-environment.png "Environment setup in Insomnia")

## 5. Run an API endpoint {#5-run-an-api-endpoint}

After correctly importing the json package and configuring the environment, hit **Send** for an API endpoint to to get a successful response.
