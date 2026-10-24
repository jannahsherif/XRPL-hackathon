# Authenticate for Click to Pay
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md

This method launches the authentication UI to handle consumer identification and verification. It unifies the user flows for passkey for login, one‑time passwords (OTP), and optional 'Remember me' consent, all within Mastercard's hosted UI window.

This method encapsulates the functionalities of [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) and [completeIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md) methods.
In **Mastercard-hosted** mode (windowRef supplied), the following logic applies:

1. If a payment passkey exists for the current device and specified User identity (email or phone number), the payment passkey is automatically invoked and the User may validate appropriately with whatever biometrics are set up the machine (for example, fingerprint scan, face scan, Windows PIN).
2. If a payment passkey is not available as above, the usual OTP flow occurs instead:
   1. The User is sent an OTP code to the specified User identity (email or phone number).
   2. An OTP UI is rendered within the referenced iFrame window.
   3. The User enters the OTP code received and validates their identity.
3. If either a payment passkey or an OTP fails to validate correctly, Mastercard returns the relevant error codes for the Integrator to process and manage accordingly.

In **Integrator-hosted** mode, the integrator may still want to provide a payment passkey for identity validation. The integrator may detect if a payment passkey exists by using the [identityLookup](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method. If a payment passkey is confirmed to exist, calling `authenticate()` simply invokes the payment passkey appropriately, without any other UI involved.
>
> #### Applicable Products {#applicable-products}
>
> * [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript

authenticate ({
    required AuthenticationMethod authenticationMethod;
    required AccountReference accountReference;
    required AuthenticationContext authenticationContext;
    optional string srciTransactionId;
    optional Window windowRef;
    optional Boolean requestRecognition; 
})


// Response
dictionary {
  required AuthenticationResult authenticationResult;
  required AuthenticationStatus authenticationStatus;
  conditional AssuranceData assuranceData;
  optional string srcCorrelationId;
  optional string srciTransactionId;
  conditional string recognitionToken;
  required string idToken;
}
```

## Code Sample {#code-sample}

```JavaScript
const iframeObj = document.getElementById("IFRAME_CAM");  // merchant's iframe for consumer authentication module (CAM)
 
const accountReference = {
  consumerIdentity = {
	  "identityProvider": "SRC",
	  "identityType": "EMAIL_ADDRESS",
	  "identityValue": "test@test.com"
  } 
}
 
const authenticationMethod = {
  "authenticationMethodType": "MANAGED_AUTHENTICATION",
  "authenticationSubject": "CONSUMER"
}
 
const authenticationContext: {
  authenticationReasons: ['CONSUMER_IDENTITY_VALIDATION'],
  "srcDpaId" :"2971e7de-8de8-4e4a-85ef-4ad0bd9629f0"
}
 
 
const result = await window
  .AUTHSDK_MASTERCARD
  .authenticate({
    accountReference,
    authenticationMethod,
    authenticationContext,
    "windowRef": iframeObj,
    "requestRecognition" : "true" 
  }
);
```

## Request Example and Parameters {#request-example-and-parameters}

### Request Example {#request-example}

```javascript

authenticate ({
  "srciTransactionId" : "a5899431-5364-4682-be3d-aba123465a1b",
  "authenticationMethod": {
    "authenticationMethodType": ["MANAGED_AUTHENTICATION" |
                                 "FIDO2" |
                                 "SMS_OTP" |
                                 "EMAIL_OTP"],
    "authenticationSubject": " CONSUMER",
  },
  "accountReference": {
    "consumerIdentity": {
    "identityProvider": 'SRC' // required
    "identityType": 'MOBILE_PHONE_NUMBER' | 'EMAIL_ADDRESS' // required
    "identityValue": string // required (email address or mobile number (numeric string with country code prepended)
  },
  "authenticationContext": {
    "authenticationReasons":["CONSUMER_IDENTITY_VALIDATION"],
    "srcDpaId" :"2971e7de-8de8-4e4a-85ef-4ad0bd9629f0"
  },
  "windowRef": [iframe object], // only for Mastercard-hosted mode
  "requestRecognition" : "true" // only for Mastercard-hosted mode
})
```

### Request Parameters {#request-parameters}

|           Name            |                                                                                           Type                                                                                           | Mandate  |                                                                                                                                                                                                                                                                            Description                                                                                                                                                                                                                                                                             |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationMethod**  | [AuthenticationMethod](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md#authentication-method)   | Required | The authentication method desired to authenticate the cardholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **accountReference**      | [AccountReference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md#account-reference)           | Required | The reference to the cardholder's account or card profile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **authenticationContext** | [AuthenticationContext](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md#authentication-context) | Required | Information about how the authentication will proceed, as well as data pertinent to its session.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **srciTransactionId**     | String                                                                                                                                                                                   | Optional | ID corresponding to the transaction (if authenticating in the context of one). For example, *a5899431-5364-4682-be3d-aba123465a1b*                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **windowRef**             | Window                                                                                                                                                                                   | Optional | Only required for Mastercard-hosted mode. The window reference to host the authentication UI. This should be an embedded iframe reference. We currently support the following dimensions: * Suggested width and height: 100% * Minimum: 320px (width) x 480px (height) <br /> For iframe design best practices, see Payment Passkeys in our [Customer Experience Guide](https://developer.mastercard.com/click-to-pay-customer-experience-guide/documentation/use-cases/payment-passkeys/user-authenticates-passkey-retrieve-cards/#authentication-iframe-design). |
| **requestRecognition**    | Boolean                                                                                                                                                                                  | Optional | The value of `true` indicates if the Integrator has requested for Mastercard to display **Remember Me** checkbox on the OTP screen, as well as return the `recognitionToken` in the response.                                                                                                                                                                                                                                                                                                                                                                      |

### Authentication Method {#authentication-method}

|             Name             |  Type  |   Mandate   |                                                                                                                                                 Description                                                                                                                                                  |
|------------------------------|--------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationMethodType** | String | Conditional | The method used for authentication. Valid values are: * `MANAGED_AUTHENTICATION` - the authentication flow is to run in Mastercard-hosted mode * `FIDO2` - the passkey authentication flow is to run in Integrator-hosted mode * `SMS_OTP` - an OTP is sent via SMS * `EMAIL_OTP` - an OTP is sent via email |
| **authenticationSubject**    | String | Required    | The entity performing the authentication. Valid value is: * `CONSUMER`                                                                                                                                                                                                                                       |

### Authentication Context {#authentication-context}

|           Name            |  Type  | Mandate  |                                                                     Description                                                                     |
|---------------------------|--------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationReasons** | String | Required | Reason for authentication. Returned value is `CONSUMER_IDENTITY_VALIDATION`, which is used when performing ID\&V for an existing consumer identity. |
| **srcDpaId**              | String | Optional | DPA Identifier. This is generated by Mastercard during DPA registration.                                                                            |

### Account Reference {#account-reference}

|         Name         |                                                                           Type                                                                           | Mandate  |                                                      Description                                                      |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------|
| **consumerIdentity** | [ConsumerIdentity](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer-identity) | Required | Primary verifiable consumer identifier within a Click to Pay Profile. It can be email address or mobile phone number. |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```javascript

{
  "authenticationStatus": "COMPLETE",
  "authenticationResult": "AUTHENTICATED",
  "assuranceData": {
    "verificationData": [{
      "verificationType": "CONSUMER",
      "verificationEntity": "02",
      "verificationMethod": "12",
      "verificationResults": "01",
      "verificationTimestamp": "2023-02-13T14:18:40.968Z"
    }]
  },
  "authenticationSessionId" : "slkj456-tyrltkj456-45dtr5-44543m",
  "srciTransactionId" : "a5899431-5364-4682-be3d-aba123465a1b",
  "recognitionToken": "eyJraWQiOiIyMDIzMD.... ", // only returned in Mastercard-hosted mode
  "idToken" : "eyJraWQiOiIxNDkwM..."
}
```

### Response Parameters {#response-parameters}

|            Name             |                                                                        Type                                                                        |   Mandate   |                                                                                                                                                                                                                                                                        Description                                                                                                                                                                                                                                                                        |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationResult**    | AuthenticationResult                                                                                                                               | Required    | The result of the authentication session attempt. Valid values are: * `AUTHENTICATED` * `NOT_AUTHENTICATED`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **authenticationStatus**    | AuthenticationStatus                                                                                                                               | Required    | The current status of the authentication session attempt. Valid values are: * `COMPLETE` * `PENDING` * `PENDING_CHALLENGE` * `CANCELLED` * `EXPIRED` * `NOT_SUPPORTED`                                                                                                                                                                                                                                                                                                                                                                                    |
| **assuranceData**           | [AssuranceData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data) | Conditional | Assurance data supplied to support risk management.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **srcCorrelationId**        | String                                                                                                                                             | Optional    | The correlation ID corresponding to the session instance. If not provided, one will be generated and returned as part of the response for authenticate(). For example, *43d4c8e5-b57e-4794-ac9b-6a454c9325cb*                                                                                                                                                                                                                                                                                                                                             |
| **srciTransactionId**       | String                                                                                                                                             | Optional    | The ID corresponding to the transaction (if authenticating in the context of one). If one is not provided, this field is omitted or null in the response. For example, *a5899431-5364-4682-be3d-aba123465a1b*                                                                                                                                                                                                                                                                                                                                             |
| **authenticationSessionId** | String                                                                                                                                             | Required    | Reference Identifier for the authentication session returned by the SRC system.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **idToken**                 | String                                                                                                                                             | Required    | [Federated ID token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) that is required when AuthenticationStatus is `COMPLETE`, AuthenticationResult is `AUTHENTICATED`, and AuthenticationReasons include `CONSUMER_IDENTITY_VALIDATION`.                                                                                                                                                                                                                                     |
| **recognitionToken**        | String                                                                                                                                             | Conditional | Merchant Recognition Token returned when requested from calling the `requestRecognition` function if a consumer opts-in through **Remember Me** checkbox. Note: Mastercard recommends storing/dropping the recognition token as a first party cookie on the device/browser. Integrator must manage the security aspects and ensure that the following security measures are in place: * Expiration Date - Cookies should have a maximum lifespan of 180 days * Secure * httpOnly (only applicable for server-side tokens) * sameSite= strict * Value= JWT |

## Application Errors {#application-errors}

|                Reason Code                |                                                                                                                                                                       Description                                                                                                                                                                       |                                                                                                                                            Example                                                                                                                                             |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AUTHENTICATION_ METHOD _NOT_SUPPORTED** | Will happen if the `authenticationMethodType` is anything other than the supported methods or if this is the result of NPA not being supported.                                                                                                                                                                                                         | * Javascript ```javascript { "reason": "AUTHENTICATION_METHOD_NOT_SUPPORTED", "name": "authError" } ```                                                                                                                                                                                        |
| **AUTH_ERROR**                            | The authentication UI experience has failed.                                                                                                                                                                                                                                                                                                            | * Javascript ```javascript { "reason": "AUTH_ERROR", "name": "authError", "message": "TRANS_ABANDONED" } ```                                                                                                                                                                                   |
| **ACCT_INACCESSIBLE**                     | The SRC Profile exists but is not currently accessible (e.g. is locked). All 403 (permission denied) errors are mapped to this.                                                                                                                                                                                                                         | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "name": "authError" } ```                                                                                                                                                                                                          |
| **BLOCKED**                               | The method is blocked due to security reasons. Invocation of additional SDK methods may be blocked for the session and card. An example would be if pop-ups are blocked by the browser, causing the Mastercard-hosted experience to fail.                                                                                                               | * Javascript ```javascript { "reason": "BLOCKED", "name": "authError" } ```                                                                                                                                                                                                                    |
| **INVALID_PARAMETER**                     | The value provided for one or more request parameters is considered invalid. This error is also generated in case of a missing, required, request parameter.                                                                                                                                                                                            | * Javascript ```javascript { "reason": "INVALID_PARAMETER", "name": "authError" } ```                                                                                                                                                                                                          |
| **INVALID_REQUEST**                       | The server is not able to adequately parse the request.                                                                                                                                                                                                                                                                                                 | * Javascript ```javascript { "reason": "INVALID_REQUEST", "name": "authError", "details": [ { "message": "authenticationContext.authenticationReasons is required", "reason": "INVALID_VALUE", "source": "authenticationContext.authenticationReasons", "sourceType": "any.required" } ] } ``` |
| **NOT_FOUND**                             | The requested resource/business entity does not exist. The resource might also be hidden for security reasons. Some examples of why this could happen: * The `accountReference` was incorrect (e.g., card by `srcDigitalCardId` could not be retrieved) * The `serviceId` used for enrolling a card was not the `serviceId` passed in as the parameter. | * Javascript ```javascript { "reason": "NOT_FOUND", "name": "authError" } ```                                                                                                                                                                                                                  |
| **SERVICE_ERROR**                         | A non-specific server-side error occurred.                                                                                                                                                                                                                                                                                                              | * Javascript ```javascript { "reason": "SERVICE_ERROR", "name": "authError" } ```                                                                                                                                                                                                              |
| **UNKNOWN_ERROR**                         | A client-side error occurred.                                                                                                                                                                                                                                                                                                                           | * Javascript ```javascript { "reason": "UNKNOWN_ERROR", "name": "authError" } ```                                                                                                                                                                                                              |

