# Getting Started
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/gettingstarted/index.md

This section provides an overview of steps required to get started integrating with Mastercard Checkout Solutions.

![Getting Started](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/gettingstarted_3.png)

## Step 1. Onboard {#step-1-onboard}

To onboard with Mastercard Checkout Solutions, order the [Mastercard Checkout Solutions - Sandbox](https://www.mastercardconnect.com/-/store-plus/item-details/A/srconbrmtf) on [Mastercard Connect](https://www.mastercardconnect.com/).

## Step 2. Program Enrollment and Directory Creation {#step-2-program-enrollment-and-directory-creation}

To prepare your Sandbox environment for your Mastercard Checkout Solutions implementation, complete one or both of the following actions based on your project requirements.

### Step 2.1: Enroll in Programs {#step-21-enroll-in-programs}

Enroll in the programs required for your Sandbox project to enable the necessary program configurations.

#### To enroll in a program: {#to-enroll-in-a-program}

1. Identify the programs required for your project.
2. Follow the instructions from [Enroll in Programs](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step5/index.md).

### Step 2.2: Create a Directory {#step-22-create-a-directory}

Create a directory to organize consumer credentials and program configurations. The directory acts as a logical container that helps you manage credential sharing, governance, and program enablement.

#### To create a directory: {#to-create-a-directory}

If your project requires a new directory, follow the instructions in [Create a Directory](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step5/index.md#52-create-a-directory).
Note: You can complete either substep or both, depending on your project requirements.

## Step 3. Create Sandbox Projects {#step-3-create-sandbox-projects}

You can create up to 20 sandbox projects to allow testing in different lower environments. [Learn how to create sandbox projects](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step5/index.md).

## Step 4. Integrate {#step-4-integrate}

### Use Cases {#use-cases}

Before you start your integration, review [Use Cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md) to learn the sequence of JavaScript methods and API calls required to complete the integration.

You need to set up the JavaScript Library, where applicable, and call our APIs to complete your integration. Sandbox projects have predefined keys and test data (merchant data) to help you get started with your integration.

### Integrating the JavaScript Library {#integrating-the-javascript-library}

[Set up the JavaScript Library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step2/index.md) and call the required methods. The [JavaScript Library Reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/index.md) section describes each method, and includes the data required to call the methods and their typical responses.
Note: JavaScript Library integration may not be valid for all products. For example, Secure Card on File.

### Integrating the APIs {#integrating-the-apis}

The [Integrating the APIs](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/tutorials-and-guides/index.md#tutorials) section provides an overview of the API resources you need to call to complete your integration.
The [API Reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md) section describes the endpoints of the API resources in detail.

## Step 5. Testing {#step-5-testing}

Test your integration using the Test Cards along with some basic [Test scenarios](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md) we recommend.

## Next Steps {#next-steps}

Once you complete integration and testing in sandbox, [onboard to production environment](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-production/index.md) and complete all the required steps to go live.
