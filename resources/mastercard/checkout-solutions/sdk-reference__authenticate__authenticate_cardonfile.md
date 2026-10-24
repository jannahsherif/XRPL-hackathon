# Authenticate for Secure Card on File
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md

This method is used for invoking the authentication UI to perform identification and verification (ID\&V) for a given authentication method.

This method provides our hosted authentication UI experience in the window object that the merchant provides (or if one isn't provided, we create a pop-up window to host it).

Authentication methods required in the request are available in the response from [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) or [Lookup Authentication Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication).
>
> #### Applicable Products {#applicable-products}
>
> [Secure Card on File - Token Authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/index.md)

## Method Signature {#method-signature}

```javascript
authenticate ({
    required AuthenticationMethod authenticationMethod;
    required AuthenticationContext authenticationContext;
    required AccountReference accountReference;
    required string srcClientId;
    required string serviceId;
    optional string srcCorrelationId;
    optional string srciTransactionId;
    optional string traceId;
    required Window windowRef;
})


// Response
dictionary {
  required AuthenticationResult authenticationResult;
  required AuthenticationStatus authenticationStatus;
  conditional AssuranceData assuranceData;
  optional string srcCorrelationId;
  optional string srciTransactionId;
}
```

## Code Sample {#code-sample}

```JavaScript

const srcDigitalCardId = '75fe8aeb-a0c4-45ce-8313-dde6bb5e6c4e'
const srcCorrelationId = 'a5fe8aeb-a0c4-45ce-8313-dde6bb5e6c3d'
const serviceId = 'SECURE_COF_MERCHANT#TESTPROJECT_PROD-PGMNAME#01'
const srcClientId = 'eccbf087-f159-4d69-b31d-00bec75c0474'
const traceId =  '34ab8aeb-a0c4-45ce-8313-dd65456e6c4e'
const threeDsInputData = {
  billingAddress: {
    name: 'Coby Greenholt',
    line1: '49674 Gorczany Village',
    line2: 'Hansen Circle',
    state: 'CT',
    zip: '98410',
    countryCode: 'US'
  }
}
const authenticationMethod = {
    "authenticationMethodType": "3DS",
    "authenticationSubject": "CARDHOLDER"
  }

const result = await window
  .AUTHSDK_MASTERCARD
  .authenticate({
    srcCorrelationId,
    traceId,
    accountReference: {
      srcDigitalCardId
    },
    authenticationMethod,
    authenticationContext: {
      authenticationReasons: ['ENROL_FINANCIAL_INSTRUMENT'],
      acquirerMerchantId: 'SRC3DS',
      acquirerBIN: '545301',
      dpaTransactionOptions: {
        transactionAmount: {
          transactionAmount: 250.0,
          transactionCurrencyCode: 'USD'
        },
        threeDsInputData
      }
    }
  })
```

## Request Example and Parameters {#request-example-and-parameters}

### Request Example {#request-example}

```javascript
{
    "srcCorrelationId": "a5fe8aeb-a0c4-45ce-8313-dde6bb5e6c3d",
    "serviceId": "SECURE_COF_MERCHANT#TESTPROJECT_PROD-PGMNAME#01",
    "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
    "traceId": "34ab8aeb-a0c4-45ce-8313-dd65456e6c4e",
    "accountReference": {
        "srcDigitalCardId": "75fe8aeb-a0c4-45ce-8313-dde6bb5e6c4e"
    },
    "authenticationMethod": {
        "authenticationMethodType": "SMS_OTP", //3DS or MANAGED_AUTHENTICATION or SMS_OTP or EMAIL_OTP
        "authenticationSubject": "CARDHOLDER",
        "methodAttributes": {
           "associatedAccountDetails": {
             "emailAddress": "user@example.com",
             "phoneNumber": {
                "countryCode": "1",
                "phoneNumber": "2125551212"
        }
      }
    }
  },
    "authenticationContext": {
        "authenticationReasons": ["TRANSACTION_AUTHENTICATION"], //ENROL_FINANCIAL_INSTRUMENT or TRANSACTION_AUTHENTICATION
        "acquirerMerchantId": "SRC3DS",
        "acquirerBIN": "545301",
        "dpaData": {
            "dpaName": "Sample_DPA",
            "dpaUri": "www.sample-website.com",
          }
        "dpaTransactionOptions": {
            "transactionAmount": {
                "transactionAmount": 250,
                "transactionCurrencyCode": "USD",
              },
            "dpaLocale": "en_US",
            "threeDsInputData": {
                "billingAddress": {
                    "name": "Coby Greenholt",
                    "line1": "49674 Gorczany Village",
                    "line2": "Hansen Circle",
                    "state": "CT",
                    "zip": "98410",
                    "countryCode": "US"
                }
            }
              "merchantCategoryCode":"0008",
              "merchantCountryCode":"US",
          }
      },
    "windowRef": window.popup(..., 'width=400,height=640')
}
```

### Request Parameters {#request-parameters}

|           Name            |                                                                                           Type                                                                                           | Mandate  |                                                                                                                                                                                                                                                                                                                                 Description                                                                                                                                                                                                                                                                                                                                 |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationMethod**  | [AuthenticationMethod](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md#authentication-method)   | Required | The authentication method desired to authenticate the cardholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **accountReference**      | [AccountReference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md#account-reference)           | Required | The reference to the cardholder's account or card profile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **authenticationContext** | [AuthenticationContext](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md#authentication-context) | Required | Information about how the authentication will proceed, as well as data pertinent to its session.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **serviceId**             | String                                                                                                                                                                                   | Required | The program instance identifier. Note that you must use the same `serviceId` as the one used for enrolling the card that is to be authenticated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **srcClientId**           | String                                                                                                                                                                                   | Required | Identifies the connecting client. For example, *eccbf087-f159-4d69-b31d-00bec75c0474*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **srcCorrelationId**      | String                                                                                                                                                                                   | Optional | The correlation ID corresponding to the session instance, which is used to link any SDK/API calls for a specific transaction. If not provided, one will be generated and returned as part of the response for authenticate(). Use the `srcCorrelationId` returned from authenticate() in the [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call for the same transaction. For example, *43d4c8e5-b57e-4794-ac9b-6a454c9325cb*                                                                                                                                          |
| **srciTransactionId**     | String                                                                                                                                                                                   | Optional | ID corresponding to the transaction (if authenticating in the context of one). For example, *a5899431-5364-4682-be3d-aba123465a1b*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **traceId**               | UUID                                                                                                                                                                                     | Optional | A unique ID used to maintain site affinity. Example: 848bc94d-edab-4a47-a750-d28e4dcda098. It is recommended to consistently populate this value with `x-src-cx-flow-id` across all method calls if provided. * While performing ID\&V on a card for the first time, fetch the `x-src-cx-flow-id` value from [Lookup Cardholder Authentication Methods API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication). * For a returning card/user, use the `x-src-cx-flow-id` value from previous API calls to maintain site affinity. <br /> **Conditional:** Required for Token Authentication Framework. |
| **windowRef**             | Window                                                                                                                                                                                   | Required | The window reference to host the authentication UI. This can be a center-aligned pop-up. For transaction authentication, ensure that the windowRef pop-up is center-aligned. We currently support the following values: * Recommended: 550px (width) x 760px (height) * Minimum: 432px (width) x 620px (height) <br /> Note: The windowRef popup must open immediately as the cardholder clicks on a call-to-action button in the website to ensure that it opens without any popup blocker.                                                                                                                                                                                |

### Authentication Method {#authentication-method}

|             Name             |                                                                                                    Type                                                                                                     |   Mandate   |                                                                                             Description                                                                                              |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationMethodType** | String                                                                                                                                                                                                      | Conditional | The method used for authentication. Valid values are: * `MANAGED_AUTHENTICATION` * `ONBEHALF_ISSUER_IDV` * `SMS_OTP` * `EMAIL_OTP` * `3DS`                                                           |
| **authenticationSubject**    | String                                                                                                                                                                                                      | Required    | The entity performing the authentication. Valid value is: * `CARDHOLDER`                                                                                                                             |
| **methodAttributes**         | [AuthenticationMethodAttributes](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md#authentication-method-attributes) | Optional    | These attributes enable merchants, commerce platforms, and payment service providers to share associated account details, such as the consumer's email address and/or phone number, with Mastercard. |

### Authentication Method Attributes {#authentication-method-attributes}

|             Name             |                                                                                              Type                                                                                               | Mandate  |                                              Description                                              |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------|
| **AssociatedAccountDetails** | [AssociatedAccountDetails](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_cardonfile/index.md#associated-account-details) | Optional | Additional consumer account identifiers to help users identify the account associated with a passkey. |

### Associated Account Details {#associated-account-details}

|       Name       |                                                                      Type                                                                      | Mandate  |           Description            |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------|
| **emailAddress** | String                                                                                                                                         | Optional | Consumer-provided email address. |
| **phoneNumber**  | [phoneNumber](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#phone-number) | Optional | Consumer-provided phone number.  |

### Authentication Context {#authentication-context}

|           Name            |                                                                                Type                                                                                 |   Mandate   |                                                                                                                                                     Description                                                                                                                                                      |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationReasons** | List                                                                                                                                                                | Required    | List of reasons for authentication. Valid values are: * `CONSUMER_IDENTITY_VALIDATION`: Used when performing ID\&V for an existing card. * `ENROL_FINANCIAL_INSTRUMENT`: Used when performing ID\&V for a new card. * `TRANSACTION_AUTHENTICATION`: Used when performing transaction authentication during checkout. |
| **srcDpaId**              | String                                                                                                                                                              | Conditional | DPA Identifier. This is generated by Mastercard during DPA registration. *Conditionality for Click to Pay:* This is required when `authenticationReasons` contains TRANSACTION_AUTHENTICATION and no `dpaData` is provided.                                                                                          |
| **dpaData**               | [DpaData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#dpa-data)                              | Conditional | DPA-specific information, including merchant name, acquirer information, and merchant attributes. *Conditionality:* This is required when: * `authenticationReasons` contains TRANSACTION_AUTHENTICATION. * The merchant wants to send acquirer info to the ACS.                                                     |
| **dpaTransactionOptions** | [DpaTransactionOptions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#dpa-transaction-options) | Required    | DPA-specific preferences and transaction configuration parameters.                                                                                                                                                                                                                                                   |
| **acquirerMerchantId**    | String                                                                                                                                                              | Conditional | Acquiring institution identification code. For example, *SRC3DS* . *Conditionality:* This is required for `authenticationMethodType` = 3DS or MANAGED_AUTHENTICATION                                                                                                                                                 |
| **acquirerBIN**           | String                                                                                                                                                              | Conditional | Acquiring institution identification code as assigned by the 3DS Directory Server receiving the AReq message. For example, *545301* . *Conditionality:* This is required for `authenticationMethodType` = 3DS or MANAGED_AUTHENTICATION                                                                              |

### Account Reference {#account-reference}

|         Name         |  Type  | Mandate  |                                                             Description                                                             |
|----------------------|--------|----------|-------------------------------------------------------------------------------------------------------------------------------------|
| **srcDigitalCardId** | String | Required | Reference identifier to the Digital Card representing the PAN or Payment Token. For example, *51a977f3-bda4-498b-901d-b48ad4d97abv* |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```javascript

{
  "authenticationStatus": "COMPLETE",
  "authenticationResult": "AUTHENTICATED",
  "assuranceData": {
    "verificationData": [{
      "verificationType": "CARDHOLDER",
      "verificationEntity": "03",
      "verificationMethod": "01",
      "verificationResults": "01",
      "verificationTimestamp": "2023-02-13T14:18:40.968Z",
      "verificationEvents": ["02"],
      "additionalData": "eyJraWQiOiIxNDkwMjQtc3RnLXNyYy1pZGVudGl0eS12ZXJpZmljYXRpb24iLCJ0eXAiOiJKV1QrZXh0LmNhcmRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJjYXJkSWQiOiI3NWZlOGFlYi1hMGM0LTQ1Y2UtODMxMy1kZGU2YmI1ZTZjNGUiLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJjb3JyZWxhdGlvbklkIjoiNmNiMDVkYWMtNzJlZS00M2E2LTgwMmQtMzQ0NDM1NDQ4OGJmIiwic2NvcGVEYXRhIjoie1wiYXV0aFNlc3Npb25JZFwiOlwiN2RiMGQyMzUtNDQwZS00ZTdjLWI5NDAtNGJhY2YxMDc4MzFiXCIsXCJhdXRoZW50aWNhdGlvblJlc3VsdFwiOlwiQVVUSEVOVElDQVRFRFwiLFwiYXV0aGVudGljYXRpb25NZXRob2RcIjpcIjNEU1wiLFwic3JjaUNsaWVudElkXCI6XCJjZTgxMjJhZS04OGJiLTQ1MzctODdmZS04ZTU2Zjk0NzVjYjRcIixcInRocmVlRHNQQVZlcmlmaWVkXCI6XCJ0cnVlXCIsXCJhdXRoZW50aWNhdGlvblRpbWVcIjpcIjIwMjMtMDItMTNUMTQ6MTg6NDAuOTc2WlwiLFwiYXV0aGVudGljYXRpb25SZWFzb25zXCI6W1wiRU5ST0xfRklOQU5DSUFMX0lOU1RSVU1FTlRcIl19IiwiZXhwIjoxNjc2Mjk4MjIwLCJpYXQiOjE2NzYyOTc5MjAsImp0aSI6IjMyMzA0NmM4LTMyMjQtNGE3Zi04NDM3LTA2OGI5ZmE5MmJlMCJ9.to4jlDd3CFPM_ucB9jbCP8_i0xFCFLCOZhHjadO0VZ3keOub0k4fmn_fLw1XZG5U0B8CZMXdsWS_wjBgJ4jaiv_nVF--i_29-YyeQ7BPg6oIPGpEXDEhqxl4ZeeY7quMrMhh2nbupkcHcyB36dCK285D-BLhVtXhed4S1KK-qr6qcOJ76qnDZlDNSx2rIvXwChslXBXFwpPij9JxjKcjv5RWL0qAUXMxKQE8Gf0ZnB_bVZQxRDzw-1CWhKMIyShzahoDJI9dRzKSv-c1xwzz5wTn6FhctGAOk0Sd6KsUIrCBw3W3MXd0uWQXDOhvuYA0aZX9GMRFpOP5penmZNlUaA"
    }]
  },
  "srcCorrelationId": "6cb05dac-72ee-43a6-802d-3444354488bf"
}
```

### Response Parameters {#response-parameters}

|           Name           |                                                                        Type                                                                        |   Mandate   |                                                                                                  Description                                                                                                  |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **authenticationResult** | AuthenticationResult                                                                                                                               | Required    | The result of the authentication session attempt. Valid values are: * `AUTHENTICATED` * `NOT_AUTHENTICATED`                                                                                                   |
| **authenticationStatus** | AuthenticationStatus                                                                                                                               | Required    | The current status of the authentication session attempt. Valid values are: * `COMPLETE` * `PENDING` * `PENDING_CHALLENGE` * `CANCELLED` * `EXPIRED` * `NOT_SUPPORTED`                                        |
| **assuranceData**        | [AssuranceData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data) | Conditional | Assurance data supplied to support risk management.                                                                                                                                                           |
| **srcCorrelationId**     | String                                                                                                                                             | Optional    | The correlation ID corresponding to the session instance. If not provided, one will be generated and returned as part of the response for authenticate(). For example, *43d4c8e5-b57e-4794-ac9b-6a454c9325cb* |
| **srciTransactionId**    | String                                                                                                                                             | Optional    | The ID corresponding to the transaction (if authenticating in the context of one). If one is not provided, this field is omitted or null in the response. For example, *a5899431-5364-4682-be3d-aba123465a1b* |

## Application Errors {#application-errors}

|                Reason Code                |                                                                                                                                                                       Description                                                                                                                                                                       |                                                                                                                                            Example                                                                                                                                             |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AUTHENTICATION_ METHOD _NOT_SUPPORTED** | Will happen if the `authenticationMethodType` is anything other than the supported methods or if this is the result of NPA not being supported.                                                                                                                                                                                                         | * Javascript ```javascript { "reason": "AUTHENTICATION_METHOD_NOT_SUPPORTED", "name": "authError" } ```                                                                                                                                                                                        |
| **AUTH_ERROR**                            | The authentication UI experience has failed.                                                                                                                                                                                                                                                                                                            | * Javascript ```javascript { "reason": "AUTH_ERROR", "name": "authError", "message": "TRANS_ABANDONED" } ```                                                                                                                                                                                   |
| **ACCT_INACCESSIBLE**                     | The SRC Profile exists but is not currently accessible (e.g. is locked). All 403 (permission denied) errors are mapped to this.                                                                                                                                                                                                                         | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "name": "authError" } ```                                                                                                                                                                                                          |
| **BLOCKED**                               | The method is blocked due to security reasons. Invocation of additional SDK methods may be blocked for the session and card. An example would be if pop-ups are blocked by the browser, causing the hosted experience to fail.                                                                                                                          | * Javascript ```javascript { "reason": "BLOCKED", "name": "authError" } ```                                                                                                                                                                                                                    |
| **INVALID_PARAMETER**                     | The value provided for one or more request parameters is considered invalid. This error is also generated in case of a missing, required, request parameter.                                                                                                                                                                                            | * Javascript ```javascript { "reason": "INVALID_PARAMETER", "name": "authError" } ```                                                                                                                                                                                                          |
| **INVALID_REQUEST**                       | The server is not able to adequately parse the request.                                                                                                                                                                                                                                                                                                 | * Javascript ```javascript { "reason": "INVALID_REQUEST", "name": "authError", "details": [ { "message": "authenticationContext.authenticationReasons is required", "reason": "INVALID_VALUE", "source": "authenticationContext.authenticationReasons", "sourceType": "any.required" } ] } ``` |
| **NOT_FOUND**                             | The requested resource/business entity does not exist. The resource might also be hidden for security reasons. Some examples of why this could happen: * The `accountReference` was incorrect (e.g., card by `srcDigitalCardId` could not be retrieved) * The `serviceId` used for enrolling a card was not the `serviceId` passed in as the parameter. | * Javascript ```javascript { "reason": "NOT_FOUND", "name": "authError" } ```                                                                                                                                                                                                                  |
| **SERVICE_ERROR**                         | A non-specific server-side error occurred.                                                                                                                                                                                                                                                                                                              | * Javascript ```javascript { "reason": "SERVICE_ERROR", "name": "authError" } ```                                                                                                                                                                                                              |
| **UNKNOWN_ERROR**                         | A client-side error occurred.                                                                                                                                                                                                                                                                                                                           | * Javascript ```javascript { "reason": "UNKNOWN_ERROR", "name": "authError" } ```                                                                                                                                                                                                              |

