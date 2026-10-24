# Code and Formats
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md

## API Gateway Errors {#api-gateway-errors}

Error codes can be returned by the Mastercard gateway, which verifies your request's signature and routes to the correct location. These errors returned by the API Gateway are standard across Mastercard services. For more details about Gateway errors, see the [Gateway Error Codes](https://developer.mastercard.com/platform/documentation/gateway-error-codes/)
page of the general Mastercard Developers Platform documentation.

## Client JavaScript Errors {#client-javascript-errors}

When an integrator makes a client side call to the application, and there is an error, the JavaScript methods respond with an `error` object that contains more details about what caused the error.
Warning: Below are illustrative examples of different errors received while calling the JS methods. However, each [JS Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/index.md) has its own set of possible errors, refer to this section for more details.

### Error Format and Example {#error-format-and-example}

```javascript
{
  required String reason;
  required Number status;
  required String message;
  optional Array errorDetail;
}
```

```javascript

{
  "reason": "SRCI_ID_MISSING",
  "status": 400,
  "message": "Missing parameter",
}
```

#### Attributes {#attributes}

|                                                                  Name                                                                   |  Type  | R/C/O |                          Description                          |
|-----------------------------------------------------------------------------------------------------------------------------------------|--------|-------|---------------------------------------------------------------|
| [**reason**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#error-reason-codes) | String | R     | Reason code for the error.                                    |
| **status**                                                                                                                              | Number | R     |                                                               |
| **message**                                                                                                                             | String | O     | Error message to be displayed for integrator.                 |
| **errorDetail**                                                                                                                         | Object | O     | Reference object containing relevant details about the error. |

#### Error Reason Codes {#error-reason-codes}

The following table contains standard error reason codes and its resolutions.

|        Reason Code        |                                                                                                                                                               Description and remedy                                                                                                                                                                |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **REQUEST_TIMEOUT**       | The request took longer than the permitted time to complete. This could mean the service is experiencing a high volume of calls. You should try again later. It may also be because the library is unable to communicate with its iFrame.                                                                                                           |
| **SERVICE_ERROR**         | Some error happened on the server which caused the error. In your front end application, you should either show a generic message, or retry the same request again (it might succeed).                                                                                                                                                              |
| **UNKNOWN_ERROR**         | This is a standard error that can be thrown from any method.                                                                                                                                                                                                                                                                                        |
| **INVALID_PARAMETER**     | The value provided for one or more request parameters is considered invalid. This error is also generated when a required field is missing. **Note**: Whenever possible, you should provide client side validation to avoid an unnecessary round trip to the server. Simple validation constraints are documented as part of the API specification. |
| **INVALID_REQUEST**       | The server could not understand the request. Usually this means a data field must be in a particular format, but is not. For example, base64 decoding may have failed. The message field may provide additional clarification of what part/field of the request is considered incorrect.                                                            |
| **AUTH_ERROR**            | The server does understand the request, but cannot authenticate.                                                                                                                                                                                                                                                                                    |
| **NOT_FOUND**             | The requested resource/business entity does not exist. The resource might also be hidden for security reasons.                                                                                                                                                                                                                                      |
| **ACCT_INACCESSIBLE**     | The account exists but is not currently accessible due to multiple incorrect OTP attempts.                                                                                                                                                                                                                                                          |
| **ID_FORMAT_UNSUPPORTED** | Incorrect Identity Type passed.                                                                                                                                                                                                                                                                                                                     |
| **CODE_INVALID**          | The supplied OTP value was invalid. Try again.                                                                                                                                                                                                                                                                                                      |
| **RETRIES_EXCEEDED**      | The limit for the number of retries for OTP generation was exceeded. This maximum number of retries allowed is dependent on the network. If you see this Reason Code, you should initiate a guest checkout.                                                                                                                                         |
| **CARD_INVALID**          | The card failed validation. The error may also be thrown when an invalid `srcDigitalCardId` is provided, e.g. the consumer provided a card which was not selected from the response from getCards() or validate().                                                                                                                                  |

## Server API Errors {#server-api-errors}

When you make a server side API call to Mastercard Checkout Solutions and there is an error, then the API service call response contains an HTTP error status code (4xx, 5xx) and an `Error` object.

The [status](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#http-statuses) value match the HTTP status, while the [reason](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#reason) and [message](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#message) values provide more detail on why the application layer rejected your call.
Warning: Below are illustrative examples of different errors received while making an API call. However, each [API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md) end point has its own set of possible errors, refer to the schema for more details.

### Error Format and Example {#error-format-and-example-1}

```JSON
{
    "status": "<HTTP status code to categorize the errors>",
    "reason": "<Error reason as associated with the HTTP status code>",
    "message": "<Error message as associated with the HTTP status code>",
    "errordetail": [
        {
            "reason": "<Error reason>",
            "sourceType": "<Type of the source>",
            "message": "<Error message>",
            "source": "<Name of the source which generated this error>"
        }
    ]
}
```

```JSON
{
    "status": 400,
    "reason": "INVALID_ARGUMENT",
    "message": "Cannot process the request because it is malformed or has incorrect/missing fields or values.",
    "errordetail": [
        {
            "reason": "CANNOT_BE_NULL",
            "sourceType": "BODY",
            "message": "must not be null",
            "source": "srcClientId"
        }
    ]
}
```

#### HTTP Statuses {#http-statuses}

|           Status            |                                                                                                                              Detail                                                                                                                              |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 200 - OK                    | Request succeeded and processed ok.                                                                                                                                                                                                                              |
| 400 - Bad Request           | This may be returned for example when the `SRC-Correlation-Id` portion of the request body is either missing or incorrect. See the `error` object in the response body for details.                                                                              |
| 401 - Unauthorized          | Although defined as a response in the specification, the Mastercard Checkout Solution implementation will not return 401 errors. You may however see a 401 response returned from the API Gateway, for example if there is a problem with the Oauth signature.   |
| 403 - Forbidden             | This may be returned for example when the `SRC-Client-Id` portion of the request body is either missing or incorrect, or because the combination of `SRC-Correlation-Id` and `SRC-DSA-Id` is incorrect. See the `error` object in the response body for details. |
| 404 - Not Found             | This may be returned when a checkout transaction is not found.                                                                                                                                                                                                   |
| 429 - Resource exhausted    | The API Gateway may return this if running out of resource quota or reaching rate limiting.                                                                                                                                                                      |
| 500 - Internal Server Error | See the `error` object in the response body for details.                                                                                                                                                                                                         |
| 503 - Service Unavailable   | The server is currently unavailable. Typically the server is not able to serve the request temporarily. Retry after some time.                                                                                                                                   |

#### Reason {#reason}

The `reason` element is a string enum value and will be one of:

|       Reason       |                                                                                                                                     Description                                                                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| INVALID_ARGUMENT   | Cannot process the request because it is malformed or has incorrect/missing fields or values.                                                                                                                                                                                       |
| INVALID_STATE      | Request cannot be executed due to the incorrect field value.                                                                                                                                                                                                                        |
| UNAUTHENTICATED    | Required authentication information is either missing or not valid for the resource.                                                                                                                                                                                                |
| PERMISSION_DENIED  | Access is denied to the requested resource. Client does not have sufficient permission or has been locked.                                                                                                                                                                          |
| NOT_FOUND          | A specified resource is not found, or the request is rejected by undisclosed reason.                                                                                                                                                                                                |
| ABORTED            | Concurrency conflict, such as read-modify-write conflict.                                                                                                                                                                                                                           |
| ALREADY_EXISTS     | The resource that a client tried to create already exists.                                                                                                                                                                                                                          |
| RESOURCE_EXHAUSTED | Either out of resource quota or reaching rate limiting.                                                                                                                                                                                                                             |
| CANCELLED          | Request cancelled by the client. NOT IMPLEMENTED                                                                                                                                                                                                                                    |
| DATA_LOSS          | Unrecoverable data loss or data corruption.                                                                                                                                                                                                                                         |
| INTERNAL           | Internal server error. Typically a server bug.                                                                                                                                                                                                                                      |
| NOT_IMPLEMENTED    | API method not implemented by the server. NOT IMPLEMENTED                                                                                                                                                                                                                           |
| UNAVAILABLE        | Service unavailable. Typically the server not able to serve the request temporarily. Retry after some time.                                                                                                                                                                         |
| DEADLINE_EXCEEDED  | Request deadline exceeded. This will happen only if the caller sets a deadline that is shorter than the method's default deadline (i.e. requested deadline is not enough for the server to process the request) and the request did not finish within the deadline. NOT IMPLEMENTED |

#### Message {#message}

The `message` string will give further information.

The following table shows the combinations of `status` and `reason` values that can be returned as application layer errors.

| Status |      Reason       |                                                                                                                                                                                    Message                                                                                                                                                                                     |
|--------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 400    | INVALID_ARGUMENT  | "Cannot process the request because it is malformed or has incorrect/missing fields or values". Thrown if there is an issue with the request body schema validation failure like length checks failure, mandatory check failure, type check failure, cookie not present etc.                                                                                                   |
| 400    | INVALID_STATE     | "Request cannot be executed due to the incorrect field value". Thrown If there is an issue with the business validation failure on the response body like value mismatch, code not valid, invalid value, etc.                                                                                                                                                                  |
| 401    | UNAUTHENTICATED   | "Required authentication information is either missing or not valid for the resource". Thrown if Authentication information is missing or invalid. E.g., JSON web token not present or incorrect for an API with required Authentication Header.                                                                                                                               |
| 403    | PERMISSION_DENIED | "Access is denied to the requested resource. Client does not have sufficient permission or has been locked". Thrown if the request does not have sufficient authentication level to access a specified resource. e.g., missing client-ids in the request body. **Note: this can occur in two situations, with different error messages. See the sample errors section below.** |
| 403    | LOCKED            | "Access is denied to the requested resource. The user account has been locked". Thrown if the requested resource is locked or the customer profile owning the record is locked.                                                                                                                                                                                                |

#### ErrorDetail {#errordetail}

The `errorDetail` is an optional list explaining the error in detail.

* `reason` - uniquely identifies the type of error.

  The reason element is a string enum value and will be one of:

  |     Reason     |                           Description                           |
  |----------------|-----------------------------------------------------------------|
  | CANNOT_BE_NULL | The supplied value cannot be null                               |
  | INVALID_VALUE  | The type is correct but the supplied value is not supported     |
  | INVALID_FORMAT | The format is not correct                                       |
  | ALREADY_EXISTS | The entity already exists                                       |
  | INVALID_STATE  | This entity is in an invalid state for the requested operation. |
  | CORRUPT_DATA   | The data associated with this entity is corrupted               |

  <br />

* `sourceType` - part of the request which has resulted in the error

  The `sourceType` element is a string enum value and will be one of:

  | sourceType |                 Description                  |
  |------------|----------------------------------------------|
  | BODY       | Refers to the body of the request            |
  | HEADER     | Refers to any headers set in the request     |
  | QUERY      | Any parameters set in the query string       |
  | PATH       | Any parameter set in the path of the service |
  | METHOD     | Refers to the request method                 |

  <br />

* [`message`](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#message) - custom message released by the application.

* `source` - specifies the location of the parameter in request, which generated the error.

## Retry Policy for Notifications {#retry-policy-for-notifications}

A retry logic is in place if an event notification request from Mastercard Checkout Solutions to the client fails.

If client's listener application is unavailable, for example, due to a planned maintenance, a `503 (Service Unavailable)` response from the client should typically contain the `Retry-After` header with the estimated time for the recovery of the service. Mastercard Checkout Solutions honors the time in the Retry-After header and retries after the specified time interval.

Example of `503 Service Unavailable` response from the client:

```JSON
{
    "status": 503,
    "reason": "SERVICE_UNAVAILABLE",
    "message": "The service is under maintenance."
}
```

If Mastercard Checkout Solutions receives a failure response without `Retry-After` header, after the first failure, Mastercard Checkout Solutions retries the client up to a maximum of 5 retries with an exponentially increasing wait time of 15 minutes, 30 minutes, 2 hours, 20 hours and 40 hours for consecutive error responses.

Example of error responses from the client:

* `400 Bad Request`

```JSON
{
  "status": 400,
  "reason": "INVALID_ARGUMENT",
  "message": "One or more fields in the request are either missing or does not have correct value.",
  "details": [
    {
      "reason": "CORRUPT_DATA",
      "message": "Only application/json; charset=UTF-8 is supported",
      "sourceType": "HEADER",
      "source": "Content-Type"
    }
  ]
}
```

* `500 Internal Server Error`

```JSON
{
  "status": 500,
  "reason": "INTERNAL",
  "message": "Internal server error. Something went wrong while processing the request."
}
```

