# Reference Applications
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/index.md

Mastercard Checkout Solutions reference applications are simple Spring Boot Applications created using Java Spring Boot and Maven OpenAPI client plugin. They provides API Client capabilities with OAuth 1.0a and JWE-based encryption/decryption for accessing various Mastercard Checkout Solutions API endpoints.
>
> ### What you will learn: {#what-you-will-learn}
>
> * How to install and configure the reference application
> * How to switch between Sandbox and Production environments
> * How to run and use your reference application, and encrypt or decrypt requests and responses

Use the command prompt or terminal to run the reference application without using an IDE. Alternatively, use your preferred IDE to explore the source code and review the workflows of all APIs.

## Products {#products}

Reference applications are available for the following products:

### Click to Pay {#click-to-pay}

Use the app to test recognized user, returning user, and first time user flows.   

[See Click to Pay →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-ctp/index.md)

### Secure Card on File {#secure-card-on-file}

Use the app to test merchant registration, card enrollment and management, payment checkout, and authentication flows.  

[See Secure Card on File →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-cof/index.md)

### Guest Checkout Tokenization {#guest-checkout-tokenization}

Use the app to test the transaction flow, including card encryption and tokenization.  

[See Guest Checkout Tokenization →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-gct/index.md)

## Prerequisites {#prerequisites}

* An account on [Mastercard Connect](https://www.mastercardconnect.com/) with access to the *Mastercard Checkout Solutions onboarding* app, with at least one Mastercard Secure Card on File API use case enabled. For more information, follow the [Onboarding and Registration in Sandbox](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md) tutorial.
* Java installed on your local system.
* The latest version of [Apache Maven](https://maven.apache.org/download.cgi).
* An IDE that supports Java 17 or above (such as [IntelliJ IDEA](https://www.jetbrains.com/idea/download/), [VS Code](https://code.visualstudio.com/download), or [Eclipse](https://www.eclipse.org/downloads/)).
* If you're using VS Code, we recommend installing the [Spring Boot Dashboard](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-boot-dashboard) extension.

## Technologies Used {#technologies-used}

* Java
* Maven

## Get the Source Code {#get-the-source-code}

To get the reference app source code, click a link below and unzip the file on your local machine.

* **Click to Pay:** [mcs-c2p-ref-app.zip](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/ref-app/mcs-c2p-ref-app.zip) (1MB)
* **Secure Card on File:** [mcs-scof-ref-app.zip](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/ref-app/mcs-scof-ref-app.zip) (1MB)
* **Guest Checkout Tokenization:** [mcs-gct-ref-app.zip](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/ref-app/mcs-gct-ref-app.zip) (980KB)

## Next Step {#next-step}

Configure and run the reference app on your local machine. See [App Configuration →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-config/index.md)

## Additional Resources {#additional-resources}

* Review our onboarding, API keys, and integration tutorials. See [Tutorials and Guides →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/tutorials-and-guides/index.md)
* Learn more about the product-specific use cases you can test with the app.
  * [Click to Pay →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)
  * [Secure Card on File →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/index.md)
  * [Guest Checkout Tokenization →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/guest-tokenization/index.md)
* Test the various use cases and APIs for each product using Mastercard test cards. See [Testing →](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/index.md)
