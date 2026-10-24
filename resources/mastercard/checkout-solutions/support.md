# Support
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md

## Misc FAQs {#misc-faqs}

* Create a payment profile at checkout when they see the payment icon where Mastercard is accepted.
* Create a payment profile or add a Mastercard card at [checkout.mastercard.com](https://www.mastercard.us/en-us/personal/ways-to-pay/click-to-pay.html)
* Enroll through their issuer's website or app when prompted.
If you have opened a project with our Customer Implementation Services and have an assigned Project Manager, please reach out to them for assistance with your onboarding and registration queries. Otherwise, please click the **Get Help** button at the bottom of this page.
* As a merchant with a digital shopping application or a payment service provider(PSP) operating on behalf of a merchant, or a commerce Platforms you can integrate with Mastercard Checkout Solutions by following the [onboarding steps](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md) in [Mastercard Connect](https://www.mastercardconnect.com).
* Issuers can drive Mastercard enrollment in Click to Pay through their mobile banking application or website. To know more, see [Provisioning Cards to Mastercard Click to Pay](https://developer.mastercard.com/issuer-enrollment/documentation/)
If you have been denied production access, an email with the reason for rejection is provided. After completing the rejected items, you can request production access again.

### Getting Started {#getting-started}

Your company must nominate two security administrators as the primary point of contact to manage access rights of other employees on Mastercard Connect. If you are unaware of your appointed security administrators, contact [Mastercard](mailto:apisupport@mastercard.com) for support. You will only need to register and onboard once, even if you have a presence in multiple regions, as the onboarding process applies globally. Contact [Mastercard](mailto:apisupport@mastercard.com) for support with local customizations.

### Authenticating APIs {#authenticating-apis}

The APIs use [OAuth 1.0a](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/) for authenticating client applications. POST requests (with a body) must be signed using the Google Request Body Hash extension for OAuth. **Note** : the API Signing Key (OAuth Key) can be downloaded from Mastercard Connect, as detailed in [Adding Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md). You should refer to [How can I validate my OAuth implementation?](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/#how-can-i-validate-my-oauth-implementation) to check that your OAuth implementation is working correctly.

Also, Mastercard provides a plugin for Insomnia which you may use to test your own API Signing Key [Using Insomnia REST Client with Mastercard APIs](https://developer.mastercard.com/platform/tutorial/use-insomnia-rest-client-for-mastercard-apis/).
The [Perform Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial contains details on how to obtain Mastercard public keys and encrypt an object, such as a PAN/card. If you have opened a project with our Customer Implementation Services and have an assigned Project Manager, please reach out to them for assistance with Sandbox and API integration. Otherwise, please contact [API.Support@mastercard.com](mailto:API.Support@mastercard.com) or click the **Get Help** button at the bottom of this page.
1. Ensure you have a Token Requestor Identifier (TRID) assigned to you. Your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) will help you with this step.
2. Use the [Mastercard Checkout Solutions onboarding application](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md) on Mastercard connect to complete activities such as creating sandbox project, keys and generating test DPA IDs.
3. Use these credentials to call the APIs in sandbox. Refer to the [API reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md) section to learn more about all the available API endpoints, requests and responses.
4. Use the test cards in [Testing](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md) to test different scenarios.
5. Start testing your integration by calling the sandbox URLs in the [API reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md) section.
6. To ensure Secure Card on File can push notifications to your system, share URLs that can be onboarded to Mastercard's XML gateway.
The X-SRC-CX-FLOW-ID ensures to direct all calls from the same client to the same server and maintains session affinity. When you make your initial API call, Secure Card on File responds with the X-SRC-CX-FLOW-ID in the header. The X-SRC-CX-FLOW-ID returned in this response can be used in the subsequent calls to ensure these calls are directed to the same server that returned the initial response.

## Click to Pay {#click-to-pay}

Mastercard Click to Pay is currently available in the following countries. Some markets have multiple locales as multiple languages are available.

|      Country       | Locale | Supported Language  |
|--------------------|--------|---------------------|
| Argentina          | es_AR  | Latin Spanish       |
| Australia          | en_AU  | GB English          |
| Austria            | de_AT  | German              |
| Bahrain            | en_BH  | British English     |
| Belgium            | fr_BE  | French              |
| Belgium            | nl_BE  | Dutch               |
| Belgium            | de_BE  | German              |
| Belgium            | en_BE  | English             |
| Brazil             | pt_BR  | Portuguese          |
| Bulgaria           | bg_BG  | Bulgarian           |
| Canada             | en_CA  | English             |
| Canada             | fr_CA  | French Canadian     |
| Chile              | es_CL  | Latin Spanish       |
| Colombia           | es_CO  | Latin Spanish       |
| Costa Rica         | es_CR  | LAC Spanish         |
| Croatia            | en_HR  | English             |
| Croatia            | hr_HR  | Croatian            |
| Czech Republic     | cs_CZ  | Czech               |
| Czech Republic     | en_CZ  | English             |
| Denmark            | da_DK  | Danish              |
| Dominican Republic | es_DO  | LAC Spanish         |
| Ecuador            | es_EC  | LAC Spanish         |
| Egypt              | en_EG  | English             |
| El Salvador        | es_SV  | LAC Spanish         |
| Estonia            | et_EE  | Estonian            |
| Finland            | sv_FI  | Swedish             |
| Finland            | fi_FI  | Finnish             |
| France             | fr_FR  | French              |
| Germany            | de_DE  | German              |
| Germany            | en_DE  | English             |
| Greece             | el_GR  | Greek               |
| Guatemala          | es_GT  | LAC Spanish         |
| Honduras           | ES_HN  | LAC Spanish         |
| Hong Kong          | en_HK  | GB English          |
| Hong Kong          | zh_HK  | Traditional Chinese |
| Hungary            | hu_HU  | Hungarian           |
| Ireland            | en_IE  | GB English          |
| Israel             | en_IL  | English             |
| Italy              | it_IT  | Italian             |
| Italy              | en_IT  | English             |
| Jordan             | en_JO  | English             |
| Kenya              | en_KE  | English             |
| Kuwait             | en_KW  | GB English          |
| Latvia             | lv_LV  | Latvian             |
| Lithuania          | lt_LT  | Lithuanian          |
| Malaysia           | en_MY  | GB English          |
| Malaysia           | ms_MY  | Malay               |
| Mexico             | es_MX  | Latin Spanish       |
| Netherlands        | nl_NL  | Dutch               |
| New Zealand        | en_NZ  | GB English          |
| Nicaragua          | es_NI  | LAC Spanish         |
| Nigeria            | en_NG  | British English     |
| Norway             | nb_NO  | Norwegian Bokmal    |
| Norway             | en_NO  | English             |
| Panama             | es_PA  | LAC Spanish         |
| Paraguay           | es_PY  | LAC Spanish         |
| Peru               | es_PE  | LAC Spanish         |
| Philippines        | en_PH  | English             |
| Poland             | pl_PL  | Polish              |
| Poland             | en_PL  | English             |
| Portugal           | pt_PT  | Portugese           |
| Qatar              | en_QA  | GB English          |
| Romania            | ro_RO  | Romanian            |
| Saudi Arabia       | en_SA  | GB English          |
| Serbia             | en_RS  | English             |
| Serbia             | er_RS  | Serbian             |
| Singapore          | en_SG  | GB English          |
| Slovakia           | sk_SK  | Slovakian           |
| South Africa       | en_ZA  | British English     |
| Spain              | es_ES  | Spain Spanish       |
| Spain              | en_ES  | English             |
| Sweden             | sv_SE  | Swedish             |
| Sweden             | en_SE  | English             |
| Switzerland        | en_CH  | GB English          |
| Switzerland        | it_CH  | Italian             |
| Switzerland        | de_CH  | German              |
| Tanzania           | en_TZ  | English             |
| UAE                | en_AE  | GB English          |
| Ukraine            | uk_UA  | Ukrainian           |
| United Kingdom     | en_GB  | GB English          |
| Uruguay            | es_UY  | LAC Spanish         |
| USA                | en_US  | English             |
| Vietnam            | en-VN  | English             |
| Vietnam            | vi-VN  | Vietnamese          |

Mastercard Click to Pay is free for consumers. However, development costs may apply for merchants and PSPs.

### Secure Remote Commerce Initiator (SRCI) {#secure-remote-commerce-initiator-srci}

Networks, Payment Service Providers/Gateways, Merchants, Commerce Platforms. To become a Mastercard SRCI you must comply with the [Mastercard Click to Pay Program Requirements](https://techdocs.mastercard.com/bundle/mc_click_to_pay_reqs/page/nyq1606416365006.html). Mastercard provides an online portal to simplify the process of onboarding as an SRCI. Refer to the [Onboarding Guide](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md) for details. If you are already a Mastercard customer, contact your account manager for details on how to participate in the SRC Program. Yes, any organization that handles the payment card information must provide proof of PCI-DSS (level 2) compliance. If you are a merchant that is not currently PCI DSS compliant, using a PSP is the quickest and most reliable way to support Mastercard Click to Pay.

### Data Privacy {#data-privacy}

When customers use Mastercard Click to Pay to make purchases with merchants, Mastercard provides personal data to merchants so they can process the transaction. The SRCI will need to ensure they store the personal data in compliance with their local regulations. They should provide a privacy notice and obtain consent from each cardholder to collect and share personal information with Mastercard Click to Pay System.

### Registering Digital Payment Applications (DPAs) {#registering-digital-payment-applications-dpas}

Use the [DPA Registration API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration) to onboard DPAs. First, you will need to create sandbox DPAs, then complete pre-production testing. Only then should you request production approval. After receiving production approval, you will be able to create production level DPAs. Yes. The **DPA Management** tab in the [onboarding application](https://www.mastercardconnect.com) provides two sandbox DPAs for testing purposes. The below information is needed to successfully register a DPA:

|       Parameter        |          Name          |                                                                                    Description                                                                                    |
|------------------------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DPA Presentation Name  | `dpaPresentationName`  | Merchant company name associated with the DPA to be used for presentation purposes within the user experience.                                                                    |
| DPA Name               | `dpaName`              | Legal name of registered DPA.                                                                                                                                                     |
| DPA Address            | `dpaAddress`           | DPA business address.                                                                                                                                                             |
| DPA URI                | `dpaUri`               | DPA website URI.                                                                                                                                                                  |
| Application Type       | `dpaApplicationType`   | Enum for type of application. For example: Browser, Application, IoT, Other.                                                                                                      |
| Merchant Category Code | `merchantCategoryCode` | The category code describing the merchant's business,                                                                                                                             |
| Acquirer ID            | `acquirerId`           | Acquiring Institution ID Code which identifies the acquiring institution (for example, merchant bank) or its agent.                                                               |
| Acquirer Merchant ID   | `acquirerMerchantId`   | The ID for a merchant that is assigned by the Acquirer. You may have to contact the merchant or acquirer for this value.                                                          |
| DPA Identifier         | `srciDpaId`            | The SRCI specific ID for the DPA you are registering.                                                                                                                             |
| Service Identifier     | `serviceId`            | Service ID associated with a specific SRC configuration. For integrations with SRC via Mastercard Click to Pay trigger (as described in this documentation), you must pass "SRC". |

Please refer to [Registering your DPA Data](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step8/index.md) to see more information about registering a DPA.

### Client Side Integration -- (JS Library) {#client-side-integration--js-library}

The `init` call will fail to load if any of the following parameters are missing or invalid:

* SRC Client ID
* DPA ID
* SRCI Transaction ID
* DPA Transaction Options

**Note** : Before making the `init` function call, you should confirm that the SRC Client ID and the DPA ID have been correctly on-boarded to Mastercard Click to Pay system.
If the token type requested in the `dynamicDataType` field is not supported, the Click to Pay system will respond with the most secure cryptogram type available. On clicking the "Not You" link:

* The DCF screen closes and unbind the consumer from the device. DCF via the SRC SDK, will communicate to the SRCI a `dcfActionCode` of SWITCH_CONSUMER, with the parameter `unbindAppInstance` set to true, and the `idToken` of the current profile.
* Based on the response from the DCF, the SRCI will have to make the `unbindAppInstance` call for every participating SRC network, to ensure the cookies from all systems are deleted and the user's data cannot be pulled on that browser anymore.
* If the above step is not taken by the SRCI, the cookies from Click to Pay networks will not be removed from the browser.
* In that scenario, the card selection screen will be populated with the cards that were pulled using any remaining cookies.
You should follow the below process for identity validation:

* First make the `identityLookup` call to all available networks.
* Filter results where consumer present is True and determine the last network used from lastUsedCardTimestamp.
* Then select whichever server responded with the latest Timestamp to the `identityLookup` call.
To determine the hierarchy of the cards in the card list:

* You should refer to the `dateOfCardLastUsed` and `dateOfCardCreated` timestamps returned in the response of the `getSRCProfile` request.
* The most recently used cards should be displayed on the top of the list in the descending order.
* If there are more than one card which has never been used those should be displayed in descending order of created date.
Every method in the JS Library is a promise. To avoid any issues you must wait for the JS method function call's promise to resolve before making the next call in the flow. When the consumer clicks the chevron besides the card number on the DCF, the DCF screen should close. The DCF sends a `dcfActionCode` of 'CHANGE_CARD' to the SRCI. Then the DCF informs the SRCI that the user wants to select or add a new card and the SRCI should recreate the card list screen. This may happen if the Server failed to read the cookie or the cookie has expired. In both cases, you should treat the consumer as a Returning User on an Unrecognized Device. The Click to Pay system will throw an error if the card number is not valid. Sandbox uses specific test cards while production uses real cards. Timeout can occur for a number of reasons like slow internet connectivity and too much latency. When the JS library times out, you should re-try the call. The `isRecognized` (cookie lookup) function is required for all flows within Click to Pay. It should be called as an asynchronous task as soon as possible after the `init` function call. The `identityLookup` function is required to authenticate the consumer, when they select the "Returning User" tab for logging-in but there is no valid cookie present (e.g. the device is unrecognized). The cookie is stored in the browser when the consumer selects "Remember me" on the DCF center-aligned window. A recognition token is an alternate way to recognize cardholders in Click to Pay checkout. Integrators can use these tokens, alongside third-party cookies.

When a cardholder provides consent to be remembered on a merchant site (that supports recognition token), Mastercard will send a recognition token to the Integrator. The Integrator must drop and manage this token in the first-party context.
You should use the public key contained in JWK keyset provided by the Click to Pay System. For Mastercard, you should use the public key for FPAN encryption (presently called `149123-src-fpan-encryption`, the number prefix may vary) which is available at: <https://sandbox.src.mastercard.com/keys>. You should support the current and last 2 versions of the following browsers:

**Desktop Devices -- PC, MacBook**

* Google Chrome
* Apple Safari
* Microsoft Edge
* Firefox

**Mobile Browsers -- Android, iOS**

* Google Chrome
* Apple Safari
* Firefox
* Android Browser
Mastercard recommend that you pass the `windowRef` to the SDK `checkout` function, if you wish to control how the DCF screen is rendered during checkout. This will allow you to control:

* Creation of the `windowRef` -- whether DCF is shown in a center-aligned iFrame or Pop-up
* Dimensions of the DCF window -- height / width
* Position of the DCF window -- centered / center-aligned, etc.
* Visibility of the DCF window -- such as showing it to the consumer, and matching it with any overlay around or behind it.

If you don't need to control where the DCF screen is rendered you can omit the parameter and the SDK will create a center-aligned pop-up window with a URL bar and center it.
Where the merchant invokes additional methods on the onclick event of the SRC button instead of launching the Click to Pay experience directly, the direct user intent is lost (since this is a cross domain pop-up) and the experience fails to load. The correct format should be like: xx_XX (e.g. en_US).

## Secure Card on File {#secure-card-on-file}

Call the **Enroll Card** ([**POST /cards**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) endpoint with PAN or encrypted PAN details and optional data to support the decision to enroll and tokenize.
* Digital Activity Service Providers (DASP) are the Technical Enablers who provide their Digital Activity Customers (DACs) with technical integration with SCOF for tokenization activities. To do so, the Technical Enabler must be registered as a 'Digital Activity Service Provider'.
* The Technical Integrator operates on behalf of and at the direction of their Digital Activity Customers, and their customer is responsible for the acts and omissions of the Service Provider.
* Refer to this [tutorial](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step4/index.md) to follow the DASP enrollment steps. Alternatively, you can reach out to your Mastercard representative for more details on how this model suits your requirements.

### Onboarding {#onboarding}

For step-by-step instructions on onboarding, you can refer the [requirements](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/index.md). If you have an existing relationship with Mastercard, please reach out to your Mastercard Account Manager to understand the requirements to enroll for the program. Otherwise please click the **Get Help** button at the bottom of this page. Mastercard provides an online application on Mastercard Connect to complete onboarding activities. Ensure you have implemented endpoints to receive notifications from Mastercard Secure Card on File.
You will receive notifications when:

* Card status has been updated - For example, card status active or cancelled
* Transaction notification - For example, transaction declined notification due to maximum PIN attempts.
Issuer participation (including conditions and processes) are defined by every region. See the Issuer participation chapter in the [Program Guide](https://techdocs.mastercard.com/bundle/m_MTAF_en-us/page/vxx1661363161815.html).

## Guest Checkout Tokenization {#guest-checkout-tokenization}

The existing guest checkout customer experience can continue to remain the same. Guest Checkout Tokenization is a server-side integration that requires you to make backend API calls and doesn't impact your user experience. All merchants need to be registered using the DPA Registration API. A successful call to the DPA registration API generates a DPA ID and this unique identifier is assigned to the merchant. DPA ID is required to call the Guest Checkout Tokenization APIs. Please work with your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) to complete all the required onboarding steps. Follow the steps to [Integrate with Guest Checkout Tokenization](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_guestcheckout/index.md) and for API Specifications refer, [API Reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md). x-openapi-clientid is an identifier required to make calls to the Guest Checkout Tokenization APIs. This ID is provided to you during the onboarding process to make OAuth1.0 based signed requests. All our keys are asymmetrical public-private key pairs. The below keys are required:

1. API Signing Key (OAuth Key)
2. Payload Encryption Key

See [API Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) for more details.
No. Guest Checkout token is generated for an FPAN. There is a 1-1 mapping between the FPAN and Guest Checkout token. So if a consumer shops with the same FPAN at Merchant A and Merchant B, and both Merchants use the same PSP, there's only one Guest Checkout Token assigned to the FPAN. Token has a validity of 3 years from the day of generation. A token can be used only once for a customer initiated transaction. Guest Checkout token is a temporary token. You can store it for lifecycle management but you cannot convert it to a Card on File token. You should use the customer-supplied FPAN to initiate Card on File tokenization. There must be a cryptogram for every tokenized transaction. Mastercard will decline tokenization transaction without a cryptogram. A rogue merchant cannot fetch a cryptogram using just the Guest Checkout token. You will receive a 404 error.
* JSON

```JSON
{
   "error":[
      {
         "description":"Resource Not Found: Data is not found for the given request.",
         "reasonCode ":"NOT_FOUND"
      }
   ]
}
```

## Get Help {#get-help}

There are several ways you can request help:

* For any issues regarding your API or SDK Integrations contact: [APISupport@mastercard.com](mailto:APISupport@mastercard.com).   
  Please provide the following transaction details to facilitate investigation:
  * Correlation ID for the particular transaction
  * Video or screenshot showing as much detail of the issue as possible
  * HAR file (if possible)
* To get support on SRC onboarding and registration please contact: [Digital.Support@mastercard.com](mailto:digital.support@mastercard.com)

### Contact us for technical support. {#contact-us-for-technical-support}

