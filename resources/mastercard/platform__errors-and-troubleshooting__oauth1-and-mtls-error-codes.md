# OAuth 1.0a and mTLS Error Codes
source: https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md

## Overview {#overview}

This page covers common errors from the Mastercard API gateway when using OAuth 1.0a and mTLS. Each error includes what went wrong, the HTTP status code, response, and how to fix it.

Errors follow the Mastercard API gateway's error format, as detailed below.

## Table of Contents {#table-of-contents}

* [General Error Format](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#general-error-format)
* [Threat Protection](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#threat-protection)
* [OAuth Parameters](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#oauth-parameters)
* [Mastercard Developers Project Authorization](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#mastercard-developers-project-authorization)
* [Quotas and Rate Limits](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#quotas-and-rate-limits)
* [Transformation](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#transformation)
* [Internal Server Errors (5xx)](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#internal-server-errors-5xx)
* [HTTP Status Code Reference](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#http-status-code-reference)

## General Error Format {#general-error-format}

All errors returned by the Mastercard API gateway follow the same format:

###### HTTP status code {#http-status-code}

`4xx/5xx`

###### Payload {#payload}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "<Unique code>",
        "Description": "<Description of the error>",
        "Recoverable": true/false,
        "Details": null
      }
    ]
  }
}
```

Field explanations:

* **Source** - The application that generated this error. Every error message that is generated and returned by the gateway will have this field equal to `Gateway`. When the value of the source field is something else, it means the error was generated elsewhere.
* **ReasonCode** - A unique constant identifying the error case encountered during transaction processing. For example, `INVALID_SIGNATURE` is used when the request signature does not match the expected one.
* **Description** - Description of the `ReasonCode` field with additional details.
* **Recoverable** - Indicates whether this error will always be returned for this request, or retrying could change the outcome. For example, if the request contains an invalid signature, retrying will never result in a success. However, if the error is related to some unexpected timeout with the service, retrying the call could result in a successful response.
* **Details** - Always null, present for backwards compatibility.

## Threat Protection {#threat-protection}

### Payload Size Limit {#payload-size-limit}

The gateway will reject requests with payload above a certain size in order to protect itself from running out of memory. If the configured maximum size is exceeded, the following error message will be returned:

###### HTTP status code {#http-status-code-1}

`400`

###### Payload {#payload-1}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_INPUT_FORMAT",
        "Description": "Payload too large. Limit: <max_payload_size> KB",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution}

Client should reduce the payload size in order to comply with the gateway enforced limit shown in the `Description` field.

*** ** * ** ***

### Content Type Validation {#content-type-validation}

The gateway will reject `Content-Type` header values that don't conform to [specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type). This header must correspond to the payload formatting. When the validation of the content type header value fails, the following error message is returned:

###### HTTP status code {#http-status-code-2}

`400`

###### Payload {#payload-2}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_INPUT_FORMAT",
        "Description": "Invalid content-type header syntax.",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-1}

Verify the value of the `Content-Type` header that the client is sending. Compare to what is allowed by [specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).

*** ** * ** ***

### Unsupported Content Type {#unsupported-content-type}

Each service that accepts payloads (HTTP request body) will support a certain set of content types. If the request content type does not match any of the defined supported content types, an error message is returned.

###### HTTP status code {#http-status-code-3}

`400`

###### Payload {#payload-3}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "UNSUPPORTED_CONTENT_TYPE",
        "Description": "The request Content-Type (<request content-type value>) is not supported for this service",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-2}

Review the supported content types for this service and make adjustments to the value of the `Content-Type` header to make the request conform to the service specification.

Another situation where this error may be returned is when a request is made with HTTP method of `POST`, `PUT` or `PATCH` that contains no payload and is missing the `Content-Type` header. Always include a `Content-Type` header for these HTTP methods, even if the request doesn't contain a payload (message body).

*** ** * ** ***

## OAuth Parameters {#oauth-parameters}

Mastercard API platform utilizes OAuth 1.0a with the body hash extension for securing requests. For implementation details please refer to the [OAuth implementation details](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md) as well as the [generating API client](https://developer.mastercard.com/platform/documentation/developer-tools/generating-and-configuring-a-mastercard-api-client/index.md) page. The errors in this section generally stem from incorrect implementation of this authentication method and can be avoided by utilizing the official Mastercard libraries linked from the above mentioned documentation pages.

### Authorization Header {#authorization-header}

The OAuth `Authorization` header is a string that captures all the parameters used for securing calls to services. The gateway will attempt to deconstruct this header into individual parameters contained within it. When the format of the header is incorrect, or required parameters starting with `oauth_` prefix are missing, the following error will be returned:

###### HTTP status code {#http-status-code-4}

`400`

###### Payload {#payload-4}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_SBS",
        "Description": "Problem with signature base string. <oauth_error>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-3}

Generally, the `Description` field will provide information about what is missing and needs to be addressed. The validation of this is to verify the OAuth implementation. This should not happen when the official libraries or SDK is used.

*** ** * ** ***

### Missing Headers {#missing-headers}

An API call may require that custom headers be sent with an HTTP request. Headers can be required or optional depending on the API specification. When the API request has a required header missing, the following message will be returned:

###### HTTP status code {#http-status-code-5}

`400`

###### Payload {#payload-5}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_SBS",
        "Description": "Bad Request - Required <headername> header is missing",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-4}

The `Description` field will provide information on which header is missing. The API request needs to have appropriate headername with its corresponding value.

*** ** * ** ***

### Consumer Key {#consumer-key}

The consumer key identifies the project and key which will be utilized to perform authentication and authorization of this request. It is meant to be exactly 97 characters long with an exclamation mark in the middle. The portion before the exclamation mark identifies the project containing the key used for signing and the service being called, and the portion after the exclamation mark identifies the certificate that was used to sign the message. When the consumer key doesn't conform to the length/format requirements, the following error is thrown:

###### HTTP status code {#http-status-code-6}

`400`

###### Payload {#payload-6}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_CONSUMER_KEY",
        "Description": "Consumer key parameter must be 97 characters long, split by an exclamation mark symbol. Received: <request_oauth_consumer_key>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-5}

Verify the format of the oauth_consumer_key header parameter value and ensure that it conforms to the specification. The consumer key should be obtained from the Developer Portal project dashboard.

*** ** * ** ***

### Signature Algorithm {#signature-algorithm}

The `oauth_signature_method` parameter in the `Authorization` header indicates what algorithm was used to sign the request and optionally calculate the body hash. We suggest using `RSA-SHA256` or `RSA-SHA512`. When the provided parameter doesn't match any of these values, the following error is returned:

###### HTTP status code {#http-status-code-7}

`400`

###### Payload {#payload-7}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_SIGNATURE_METHOD",
        "Description": "Invalid oauth_signature_method: ${oauth.oauth_signature_method}. Supported: RSA-SHA1, RSA-SHA256, RSA-SHA512.",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### HTTP status code {#http-status-code-8}

`422`

###### Payload {#payload-8}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_SIGNATURE_METHOD",
        "Description": "Unprocessable Entity - Invalid oauth_signature_method: RSA-SHA11 Supported: RSA-SHA1, RSA-SHA256, RSA-SHA512.",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-6}

Ensure one of the supported signature methods described above is used.

*** ** * ** ***

### Timestamp {#timestamp}

OAuth specification requires the use of a timestamp in order to limit the time window during which nonces for replay attack protection need to be stored. The timestamp is expressed in the number of seconds since January 1, 1970 00:00:00 GMT, as detailed in the OAuth RFC5849 [Section 3.3](https://tools.ietf.org/html/rfc5849#section-3.3). The gateway is configured with an acceptable time window of **`+/- 15 minutes`** around the server's UNIX timestamp value. If the timestamp falls outside of the allowed window, the following error message is returned:

###### HTTP status code {#http-status-code-9}

`400`

###### Payload {#payload-9}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_TIMESTAMP",
        "Description": "Bad Request - Invalid OAuth Timestamp
          Minimum allowed: <timestamp_minimum>
          Maximum allowed: <timestamp_maximum>
          Received: <oauth_timestamp>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### HTTP status code {#http-status-code-10}

`403`

###### Payload {#payload-10}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_OAUTH_TIMESTAMP",
        "Description": "Minimum allowed: <timestamp_minimum>. Maximum allowed: <timestamp_maximum>. Received: <oauth_timestamp>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-7}

Ensure the client's server clock is correctly synchronized with the gateway server's clock. Ideally, all servers should be using public NTP pools to synchronize their time.

*** ** * ** ***

### Nonce {#nonce}

The `oauth_nonce` parameter protects against replay attacks. Every request is required to have a unique nonce associated with it. The replay protection key is the composite of timestamp and nonce string in the format `{timestamp}n{nonce}`. Therefore, the nonce has to be unique only for the second during which it was made. The nonce may be repeated with a different timestamp as it still provides a unique key. The caller can determine the length and format of the nonce string.

###### HTTP status code {#http-status-code-11}

`403`

###### Payload {#payload-11}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "OAUTH_NONCE_USED",
        "Description": "Nonce was already used within the current time window.",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### HTTP status code {#http-status-code-12}

`425`

###### Payload {#payload-12}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "NONCE_USED",
        "Description": "Too Early - Nonce was already used within the current time window.",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-8}

Ensure that the generator used to create nonce strings is providing enough randomness.

*** ** * ** ***

### Body Hash {#body-hash}

The body hash ensures that the request payload has not been tampered with in-flight. It is an extension to the OAuth 1.0a specification as described [here](https://tools.ietf.org/id/draft-eaton-oauth-bodyhash-00.html). The original OAuth 1.0a specification only ensures protection of `application/x-www-form-urlencoded` content types, and this extension allows us to also protect other commonly used REST API content types such as JSON or XML. The body hash value is provided under the `oauth_body_hash` parameter of the Authorization header.

Whenever the `oauth_body_hash` parameter is present, the gateway will compare its value to the value of the hash it calculates based on the received payload. If the payload is empty, the gateway will compare it against the hash of an empty string. As mentioned in the [Signature Algorithm](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth1-and-mtls-error-codes/index.md#signature-algorithm) section, the number of SHA bits used in the calculation of the body hash must match the value provided in the `oauth_signature_method` parameter, otherwise there will be a mismatch. In case of a mismatch between the locally calculated hash and the hash provided in the OAuth header, the gateway will return the following error:

###### HTTP status code {#http-status-code-13}

`400`

###### Payload {#payload-13}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_BODY_HASH",
        "Description": "The provided oauth_body_hash does not match the <oauth.oauth_signature_method> hash of the request payload. Calculated: <body_hash_calculated>, Received: <body_hash.output>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

The error message provides the algorithm that the gateway used for calculating the local hash (represented by the `<oauth_signature_method>` variable), the received value of the hash (`<oauth_body_hash_received>`) and the calculated value of the hash (`<body_hash_calculated>`).

###### Resolution {#resolution-9}

There are several common root causes that should be checked when the hash values are not matching:

* Is the number of SHA bits used for the body hash calculation matching the number of bits used for creating the digital signature, as indicated in the `oauth_signature_method` parameter?
* Are there any proxy devices on the path of the request that could be slightly changing the payload? Pay attention to invisible characters like newline characters.
* Is the hashing algorithm being used correct? The calculation should **not** be using RSA or HMAC keys, it should be a plain SHA function.
* If the payload is empty, does the parameter contain hashed value of an empty string?

*** ** * ** ***

## Mastercard Developers Project Authorization {#mastercard-developers-project-authorization}

The consumer key is a 97 character string separated by an exclamation mark. The format is `<client_id>!<key_id>`. The client identifier identifies the Mastercard Developers project that contains service(s) and key(s). These project items are verified in the context of this request to ensure that the caller is authorized to call the service in question for the current environment with the key indicated.

The important thing to note is that the consumer keys **will differ** for sandbox and project keys. When a single Mastercard Developers project contains both sandbox and production keys, it's crucial that the key in the correct environment is used with the hostname that the request is being sent to. The environment to hostname mapping is as follows:

| Environment |               Hostname               |
|-------------|--------------------------------------|
| Sandbox     | <https://sandbox.api.mastercard.com> |
| Production  | <https://api.mastercard.com>         |

### Project Lookup {#project-lookup}

The project identifier (first portion of `oauth_consumer_key` before exclamation mark, also called client ID) must exist for the appropriate environment called. If a call is made via sandbox.api.mastercard.com with a consumer key intended for production use, the request will fail. The request will also fail if a project matching the consumer key doesn't exist for the environment being called. In both cases, the following error is thrown:

###### HTTP status code {#http-status-code-14}

`400`

###### Payload {#payload-14}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_CLIENT_ID",
        "Description": "The provided clientId was not found. This host requires <prod/sandbox> keys. Are you sure your API key matches this target environment? Received: <consumer_key>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-10}

The value that defines whether the host requires production or sandbox keys must match the environment of the consumer key value used in the request. A sandbox consumer key won't work with the production hostname and vice versa. Verify the values against the one displayed on the Mastercard Developers project dashboard.

*** ** * ** ***

### Project Service Access {#project-service-access}

The service being called must be part of the Mastercard Developers portal project that corresponds to the consumer key on the request. If the project doesn't contain the service that this request was routed to, the following error is thrown:

###### HTTP status code {#http-status-code-15}

`401`

###### Payload {#payload-15}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_CLIENT_ID",
        "Description": "Project <client_id> doesn't have access to the requested service",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-11}

Verify that the Mastercard Developers project that corresponds to the consumer key on the request contains the service being requested. If this is a production service, ensure that the production access has been granted, as indicated by the status on the project dashboard.

*** ** * ** ***

### Project Key Access {#project-key-access}

The OAuth signing key identified by the second portion of the `oauth_consumer_key` (after the exclamation mark) must be part of the project that matches the client identifier of this request (before the exclamation mark). If the signing key identifier does not match any of the ones located within the project, the following error is returned:

###### HTTP status code {#http-status-code-16}

`401`

###### Payload {#payload-16}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_KEY_ID",
        "Description": "Project <client_id> doesn't contain key <key_id>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-12}

This error can happen if a signing key originally belonging to the project has expired or been revoked. Ensure that the key identifier returned under the `<key_id>` variable in the description of the error message is present and valid in the Mastercard Developers project dashboard.

###### HTTP status code {#http-status-code-17}

`401`

###### Payload {#payload-17}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "DECLINED",
        "Description": "Unauthorized - Access Not Granted",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-13}

This error can occur if a signing key does not belong to the same project or keys have expired or revoked. Make sure that the signing key is relevant to the calling service and is valid in the Mastercard Developers project dashboard.

*** ** * ** ***

### Signing Key Lookup {#signing-key-lookup}

If the key identifier specified in the `consumer_key` parameter cannot be found, the following error is returned:

###### HTTP status code {#http-status-code-18}

`401`

###### Payload {#payload-18}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "DECLINED",
        "Description": "Unauthorized - Access Not Granted",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-14}

There can be several common root causes that should be checked:

* This error can happen if a signing key originally belonging to the project has expired or been revoked.
* Verify that the Mastercard Developers project that corresponds to the consumer key on the request contains the service being requested. If this is a production service, ensure that the production access has been granted, as indicated by the status on the project dashboard.

<br />

###### HTTP status code {#http-status-code-19}

`400`

###### Payload {#payload-19}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_KEY_ID",
        "Description": "The provided key was not found. Received: <key_id>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-15}

This scenario is very unlikely, please contact API support via the [Support](https://developer.mastercard.com/support) link on the Mastercard Developers portal.

*** ** * ** ***

### Signing Key Validation {#signing-key-validation}

If the certificate referenced in the request has expired, the following error is returned:

###### HTTP status code {#http-status-code-20}

`403`

###### Payload {#payload-20}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INVALID_KEY",
        "Description": "The signing certificate is not valid. <certificate_validation_error>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-16}

The description will indicate what part of the certificate validation has failed. Renewing or creating a new key via the Mastercard Developers project dashboard will resolve this issue.

*** ** * ** ***

### Signature Verification {#signature-verification}

Once project and key authorization is complete, the request signature sent within the `oauth_signature` parameter is verified. The mechanics of signature generation are described in detail in [RFC5849 Section 3.4](https://tools.ietf.org/html/rfc5849#section-3.4). The signature is essentially a well formed string called the "Signature Base String" that has been digitally signed with the client's private key. The method of generating the signature base string is detailed in the RFC [here](https://tools.ietf.org/html/rfc5849#section-3.4.1). We strongly encourage the use of our [API client libraries](https://developer.mastercard.com/platform/documentation/developer-tools/generating-and-configuring-a-mastercard-api-client/index.md) to ensure compatibility and correct implementation of this specification.

The general sequence of events in signature verification is as follows:

1. Signature base string (SBS) is generated by the client using various request parameters, as per specification
2. The value of the SBS is digitally signed using client's private key
3. Upon receiving the request, the gateway will re-construct the SBS using various parameters of the received request
4. The gateway will verify the digital signature using the public key provided via Mastercard Developers portal.

If the digital signature validation fails, the following error is returned:

###### HTTP status code {#http-status-code-21}

`401`

###### Payload {#payload-21}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "AUTHENTICATION_FAILED",
        "Description": "OAuth signatures did not match. Acceptable signature base string: <gateway_generated_sbs>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### HTTP status code {#http-status-code-22}

`403`

###### Payload {#payload-22}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "AUTHENTICATION_FAILED",
        "Description": "OAuth Signature parameter failed verification. Acceptable signature base string: <gateway_generated_sbs>",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-17}

The most common cause of this issue is that the signing (private) key used by the client does not correspond to the public key identified by the `consumer_key` parameter from the Mastercard Developers portal project dashboard. This can happen if many private keys are provisioned in a project and get mixed up, or the private key is lost. In this situation, the easiest thing is to set up a new signing key in the developer portal and update both the private key file and the `oauth_consumer_key` value on the request to match.

If the private key used for encrypting has been confirmed to correspond to the `oauth_consumer_key`, the next step is to compare the signature values. The `Description` section will output the signature base string that has been generated by the gateway. This value **must exactly match** the value of the signature base string that has been generated locally by the client. Sometimes debug logging must be enabled to print this value during the OAuth signature generation. Identify the discrepancy between client generated SBS and gateway generated SBS, then correct as required.

Small changes to request parameters that could be introduced by network proxies commonly break signatures. The URL encoding of request parameters and signature base string parameters also must be consistent between the gateway and client. To ensure consistency, please utilize the official Mastercard provided security libraries.

*** ** * ** ***

## Quotas and Rate Limits {#quotas-and-rate-limits}

### IP Rate Limit {#ip-rate-limit}

If the IP based rate limiting has been enabled on a service, the following error will be returned when the rate limit is exceeded:

###### HTTP status code {#http-status-code-23}

`429`

###### Payload {#payload-23}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "RATE_LIMIT_EXCEEDED",
        "Description": "You have exceeded the IP rate limit. Maximum allowed: <max_ip_tps> TPS",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-18}

Reduce the number of calls made from a single IP to keep the TPS below `<max_ip_tps>` rate.

*** ** * ** ***

### Service Rate Limit {#service-rate-limit}

If a global rate limit has been enabled on the service, and it is exceeded by traffic to that service, the following error will be returned:

###### HTTP status code {#http-status-code-24}

`429`

###### Payload {#payload-24}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "RATE_LIMIT_EXCEEDED",
        "Description": "You have exceeded the service rate limit. Maximum allowed: <max_service_tps> TPS",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-19}

Use a backoff algorithm and reduce rate until service operation is restored.

*** ** * ** ***

### Client Rate Limit {#client-rate-limit}

Client rate limit will restrict the maximum TPS rate of a specific client for the particular service. When the limit is exceeded, the following error is returned:

###### HTTP status code {#http-status-code-25}

`429`

###### Payload {#payload-25}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "RATE_LIMIT_EXCEEDED",
        "Description": "You have exceeded your rate limit. Maximum allowed: <max_client_tps> TPS.",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-20}

The error message will indicate the maximum allowed rate limit for this client and this service. The caller should reduce the peak TPS rate of calls and not exceed the allowed value.

*** ** * ** ***

### Client Quota {#client-quota}

Client quotas will limit the number of calls that can be made per some time period with a particular consumer key. Specifically, this ignores the key ID portion and only uses the client ID (first 48 characters of the consumer key value) to enforce the quota.

For all clients that have a quota set, the gateway will add response headers with live counters of the current quota levels. The headers are defined as follows:

    x-quota-current: <current counter value>
    x-quota-max: <maximum allowed calls>
    x-quota-period: <frequency at which quota gets reset to zero>

The quota period values can be `month`, `day`, `hour`, `minute` or `second`.

If the quota is exceeded, the following error is returned:

###### HTTP status code {#http-status-code-26}

`403`

###### Payload {#payload-26}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "VOLUME_THRESHOLD_EXCEEDED",
        "Description": "You have exceeded your allowed call quota. Current call quota: <max_calls> per <time_period>.",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-21}

The error will specify what the maximum allowed number of `max_calls` per configured `<time_period>`. Ensure your call logic doesn't exceed the allowed quota, or contact [support](https://developer.mastercard.com/support) if the quota needs to be increased.

*** ** * ** ***

## Transformation {#transformation}

In certain cases, the gateway will attempt to transform the payload from one content type to another. Currently we support transforming JSON to XML (on the request) and XML to JSON (on the response). In certain cases, the transformation may fail, and the cause of the transformation error will be logged to the server log for further analysis. This is practically always caused by an XSD which does not correspond to the XML payload returned by the server.

#### Request {#request}

If the transformation of the request payload fails, the following error response is returned:

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "TRANSFORM_ERROR",
        "Description": "Transformation of request body failed",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-22}

Contact [API support](https://developer.mastercard.com/support). In order to reduce the likelihood of these errors, try to integrate with the service using its native content types, therefore avoiding gateway based transformations.

*** ** * ** ***

#### Response {#response}

If the transformation of the service response payload fails, the following error response is returned:

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "TRANSFORM_ERROR",
        "Description": "Transformation of response body failed",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-23}

Contact [API support](https://developer.mastercard.com/support). In order to reduce the likelihood of these errors, try to integrate with the service using its native content types, therefore avoiding gateway based transformations.

*** ** * ** ***

## Internal Server Errors (5xx) {#internal-server-errors-5xx}

### Service Routing {#service-routing}

Once the threat protection, authentication, authorization and rate limits have all been successfully processed, the gateway will route the request to the origin service. If an unexpected issue happens during the routing, the following error is returned:

###### HTTP status code {#http-status-code-27}

`500`

###### Payload {#payload-27}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Service",
        "ReasonCode": "SYSTEM_ERROR",
        "Description": "An unexpected error has occurred with the service you have requested.",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-24}

Retry with a backoff algorithm. If the issue persists, contact [API support](https://developer.mastercard.com/support).

*** ** * ** ***

### General System Errors {#general-system-errors}

For all other system errors, the error messages will be returned in the following format:

###### HTTP status code {#http-status-code-28}

`500`

###### Payload {#payload-28}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "SERVER_ERROR_xxx",
        "Description": "Internal server error",
        "Recoverable": true,
        "Details": null
      }
    ]
  }
}
```

Where `xxx` will be a unique integer code for the error in question.

###### Resolution {#resolution-25}

Retry with a backoff algorithm. If the issue persists, contact [API support](https://developer.mastercard.com/support).

*** ** * ** ***

###### HTTP status code {#http-status-code-29}

`500`

###### Payload {#payload-29}

```json
{
  "Errors": {
    "Error": [
      {
        "Source": "Gateway",
        "ReasonCode": "INTERNAL_SERVER_ERR",
        "Description": "Internal Server Error",
        "Recoverable": false,
        "Details": null
      }
    ]
  }
}
```

###### Resolution {#resolution-26}

Retry with a backoff algorithm. If the issue persists, contact [API support](https://developer.mastercard.com/support).

*** ** * ** ***

### Global Router {#global-router}

The global router with handle every request before it is sent to the gateway. If the global router can't reach the edge gateway, it will respond with an error that looks like this:

```html
<HTML><HEAD>
<TITLE>Internal Server Error</TITLE>
</HEAD><BODY>
<H1>Internal Server Error - Read</H1>
The server encountered an internal error or misconfiguration and was unable to
complete your request.<P>
Reference&#32;&#35;x&#46;xxxxxxxx&#46;xxxxxxxxxx&#46;xxxxxxxx
</BODY></HTML>
```

###### Resolution {#resolution-27}

Retry with a backoff algorithm. If the issue persists, contact [API support](https://developer.mastercard.com/support).

*** ** * ** ***

## HTTP Status Code Reference {#http-status-code-reference}

| HTTP Status Code |                                      Description                                       |
|------------------|----------------------------------------------------------------------------------------|
| 400              | Problem with signature base string                                                     |
| 400              | The provided clientId was not found                                                    |
| 400              | Invalid content-type header syntax                                                     |
| 400              | The provided oauth_body_hash does not match the SHA256 hash of the request payload     |
| 400              | The provided oauth_body_hash does not match the SHA1 hash of the request payload       |
| 400              | Invalid oauth_signature_method: HMAC-SHA1                                              |
| 400              | Transformation of response body failed                                                 |
| 400              | Invalid oauth_signature_method: \[PROVIDED_SIGNATURE_METHOD\]                          |
| 400              | Consumer key parameter must be 97 characters long, split by an exclamation mark symbol |
| 400              | Payload too large                                                                      |
| 400              | The request Content-Type (\[PROVIDED_CONTENT_TYPE\]) is not supported for this service |
| 401              | OAuth signatures did not match                                                         |
| 401              | Project \[PROJECT_ID\] doesn't have access to the requested service                    |
| 403              | You have exceeded your allowed call quota                                              |
| 403              | Nonce was already used within the current time window                                  |
| 403              | Minimum allowed: \[TIMESTAMP\]                                                         |
| 403              | The signing certificate is not valid                                                   |
| 429              | You have exceeded your rate limit                                                      |
| 500              | An unexpected error has occurred with the service you have requested                   |

