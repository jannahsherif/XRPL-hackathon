# Postman Collection
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/postman-collection/index.md

Postman is an application for easy RESTful API exploration. You can use Postman to test API calls multiple times without having to write code. You can save multiple sets of credentials to quickly test an API's calls in the sandbox and production environments.

The following steps will show you how to use Postman collections hosted in the Mastercard workspace on [Postman](https://www.postman.com/mastercard/mastercard-checkout-workspace/overview).

## Prerequisites {#prerequisites}

* Sign up for a new account or log in to your existing postman account.

* Sign up on Mastercard Connect and use **"Mastercard Checkout Solutions - Sandbox"** application to:   

  * [Enroll into a program](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md)
  * [Create a project](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step6/index.md) for the program you want to make a call to.
  * [Generate necessary keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md)
* For Click to Pay program, before calling the [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API in Postman, you must integrate with our [JavaScript library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step2/index.md) to call the SDK methods and generate necessary credentials for the API call.

## 1. Set up the Postman Collection {#1-set-up-the-postman-collection}

Setting up a Postman collection for Mastercard's APIs can be done in 2 different ways, read [here](https://developer.mastercard.com/platform/tutorial/use-postman-for-mastercard-apis/step-1/).

## 2. Configure the Postman Environment {#2-configure-the-postman-environment}

Once you have the collection in your Postman workspace, [set up the Postman Environment](https://developer.mastercard.com/platform/tutorial/use-postman-for-mastercard-apis/step-2/) to set different variables for your APIs.

## 3. Set up the Base URL {#3-set-up-the-base-url}

Within your environment, set the correct value for `baseUrl`, see [this step](https://developer.mastercard.com/platform/tutorial/use-postman-for-mastercard-apis/step-3/).

## 4. Enable Authentication {#4-enable-authentication}

As detailed out in the [API basics](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-basics/index.md) section, Mastercard supports OAuth 1.0a for authenticating client applications in order to call our APIs. See detailed steps [here](https://developer.mastercard.com/platform/tutorial/use-postman-for-mastercard-apis/step-4/).

## 5. Invoke a Mastercard API from Postman {#5-invoke-a-mastercard-api-from-postman}

After completing the configuration, hit **Send** to get a successful response.

Explore the full range of [Mastercard Checkout Solution APIs](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md) to help your business transact with digital payments.

## Try it out {#try-it-out}

Use the button below to fork our Postman collection and explore the API.
Run in Postman
