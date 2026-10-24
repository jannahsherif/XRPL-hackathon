# OAuth 2.0 Error Codes
source: https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md

## Overview {#overview}

This page covers common errors from the Mastercard authorization server (token endpoint) and resource server (Mastercard APIs) when using OAuth 2.0 with FAPI 2.0 ("FAPI2SP private key + DPoP"). Each error includes what went wrong, the HTTP status code, response, and how to fix it.

Errors follow OAuth 2.0 standards from [RFC 6749](https://tools.ietf.org/html/rfc6749#section-5.2) and [RFC 9449](https://tools.ietf.org/html/rfc9449) for DPoP.

For the full OAuth 2.0 flow, see [Using OAuth 2.0 to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md).

## Table of Contents {#table-of-contents}

* [General Error Format](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#general-error-format)
* [Authorization Server Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#authorization-server-errors)
* [Resource Server Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#resource-server-errors)

## General Error Format {#general-error-format}

###### HTTP status code {#http-status-code}

`400`, `401`, `403`, or other codes

###### Payload {#payload}

OAuth 2.0 errors come back in JSON with this format:

```json
{
  "error": "error_code",
  "error_description": "Human-readable error description"
}
```

Field explanations:

* `error`: standard OAuth 2.0 error code that identifies the error type
* `error_description`: extra details about the error to help you troubleshoot

## Authorization server errors {#authorization-server-errors}

* [Request Format Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#request-format-errors)
* [Scope Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-errors)
* [Client Assertion Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-errors)
* [DPoP Proof Errors](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-errors)

### Request Format Errors {#request-format-errors}

1. [Request content type is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#request-content-type-is-invalid)
2. [Request has duplicate parameter](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#request-has-duplicate-parameter)
3. [Client assertion is missing](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-is-missing)
4. [Client assertion type is missing](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-type-is-missing)
5. [Client assertion type is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-type-is-invalid)

#### Request content type is invalid {#request-content-type-is-invalid}

The token endpoint expects requests with the `application/x-www-form-urlencoded` content type.

###### HTTP status code {#http-status-code-1}

`400`

###### Payload {#payload-1}

```json
{
  "error": "invalid_request",
  "error_description": "Expected content-type: application/x-www-form-urlencoded"
}
```

###### Resolution {#resolution}

Send the token request with the correct `Content-Type` header.

*** ** * ** ***

#### Request has duplicate parameter {#request-has-duplicate-parameter}

Your token request has a parameter (`client_id` or `grant_type`) appearing more than once in the form data.

###### HTTP status code {#http-status-code-2}

`400`

###### Payload {#payload-2}

```json
{
  "error": "invalid_request",
  "error_description": "Invalid request"
}
```

###### Resolution {#resolution-1}

Make sure each parameter appears only once in your token request.

*** ** * ** ***

#### Client assertion is missing {#client-assertion-is-missing}

Your token request is missing the `client_assertion` parameter.

###### HTTP status code {#http-status-code-3}

`400`

###### Payload {#payload-3}

```json
{
  "error": "invalid_request",
  "error_description": "client_assertion is missing in the request"
}
```

###### Resolution {#resolution-2}

Include the `client_assertion` parameter in your token request. The client assertion is a JWT you sign with your authentication key (the private key you downloaded from Mastercard Developers). This JWT authenticates your application to the Mastercard authorization server.

*** ** * ** ***

#### Client assertion type is missing {#client-assertion-type-is-missing}

Your request is missing the `client_assertion_type` parameter.

###### HTTP status code {#http-status-code-4}

`400`

###### Payload {#payload-4}

```json
{
  "error": "invalid_request",
  "error_description": "client_assertion_type is missing in the request"
}
```

###### Resolution {#resolution-3}

Include the `client_assertion_type` parameter in the request (the server requires `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`).

*** ** * ** ***

#### Client assertion type is invalid {#client-assertion-type-is-invalid}

The `client_assertion_type` field in your token request is invalid or not recognized.

###### HTTP status code {#http-status-code-5}

`400`

###### Payload {#payload-5}

```json
{
  "error": "invalid_request",
  "error_description": "Invalid client_assertion_type in request"
}
```

###### Resolution {#resolution-4}

Use the correct `client_assertion_type` (the server requires `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`).

*** ** * ** ***

### Scope Errors {#scope-errors}

1. [Scope is missing](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-is-missing)
2. [Scope format is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-format-is-invalid)
3. [Scope is unsupported](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-is-unsupported)
4. [Scope offline_access is disallowed](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-offline_access-is-disallowed)
5. [Scope string is too long](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#scope-string-is-too-long)

#### Scope is missing {#scope-is-missing}

Your token request did not include the required `scope` parameter.

###### HTTP status code {#http-status-code-6}

`400`

###### Payload {#payload-6}

```json
{
  "error": "invalid_request",
  "error_description": "scope is missing in the request"
}
```

###### Resolution {#resolution-5}

Determine which scopes are needed or allowed for your client and add the `scope` parameter with one or more of those values.

*** ** * ** ***

#### Scope format is invalid {#scope-format-is-invalid}

The scope string in your request is malformed or has characters in an invalid format.

###### HTTP status code {#http-status-code-7}

`400`

###### Payload {#payload-7}

```json
{
  "error": "invalid_scope",
  "error_description": "Invalid scope"
}
```

###### Resolution {#resolution-6}

Fix the format of the scope parameter.

*** ** * ** ***

#### Scope is unsupported {#scope-is-unsupported}

The scope you requested isn't supported by the Mastercard authorization server or isn't allowed for your client.

###### HTTP status code {#http-status-code-8}

`400`

###### Payload {#payload-8}

```json
{
  "error": "invalid_scope",
  "error_description": "Unsupported scope"
}
```

###### Resolution {#resolution-7}

Request a scope that exists and is allowed for your client. Check the service documentation for available scopes.

*** ** * ** ***

#### Scope offline_access is disallowed {#scope-offline_access-is-disallowed}

Your client requested the `offline_access` scope in a context (client_credentials grant) where that scope isn't allowed.

###### HTTP status code {#http-status-code-9}

`400`

###### Payload {#payload-9}

```json
{
  "error": "invalid_scope",
  "error_description": "offline_access scope is not supported in client_credentials flow"
}
```

###### Resolution {#resolution-8}

Remove `offline_access` from your request.

*** ** * ** ***

#### Scope string is too long {#scope-string-is-too-long}

Your request included too many scopes or a scope string that's too long.

###### HTTP status code {#http-status-code-10}

`400`

###### Payload {#payload-10}

```json
{
  "error": "invalid_scope",
  "error_description": "Invalid scope"
}
```

###### Resolution {#resolution-9}

Reduce the number of scopes in your request.

*** ** * ** ***

### Client Assertion Errors {#client-assertion-errors}

1. [Client ID does not match client assertion](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-id-does-not-match-client-assertion)
2. [Client assertion is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-is-invalid)
3. [Client assertion signature could not be verified](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-signature-could-not-be-verified)
4. [Client assertion is expired](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-is-expired)
5. [Client assertion is not yet valid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-is-not-yet-valid)
6. [Client assertion has unsupported algorithm](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#client-assertion-has-unsupported-algorithm)

#### Client ID does not match client assertion {#client-id-does-not-match-client-assertion}

The `client_id` in your request doesn't match the client identifier in the client assertion JWT.

###### HTTP status code {#http-status-code-11}

`400`

###### Payload {#payload-11}

```json
{
  "error": "invalid_client",
  "error_description": "client_id does not match client assertion"
}
```

###### Resolution {#resolution-10}

Make sure the `client_id` parameter matches the `iss` and `sub` claims in your client assertion JWT. All 3 values must be the same. Check you're signing the assertion with the correct authentication key and not mixing credentials from different projects.

*** ** * ** ***

#### Client assertion is invalid {#client-assertion-is-invalid}

The JWT you provided in `client_assertion` isn't valid. It might be malformed, have incorrect claims, or fail validation some other way.

###### HTTP status code {#http-status-code-12}

`400`

###### Payload {#payload-12}

```json
{
  "error": "invalid_client",
  "error_description": "Invalid client_assertion"
}
```

###### Resolution {#resolution-11}

Check how you're building and signing the client assertion JWT. Make sure all required claims are present and valid: `iss` and `sub` (both must match your client ID), `aud` (the resource endpoint URL), `iat` (issued-at time), `exp` (expiration time), `nbf` (not-before time), and `jti` (unique identifier). The JWT header must include the correct `kid` (your key ID from Mastercard Developers) and `alg` (ES256 or PS256). Sign the JWT with your authentication key.

*** ** * ** ***

#### Client assertion signature could not be verified {#client-assertion-signature-could-not-be-verified}

The Mastercard authorization server couldn't verify the signature of your client assertion JWT.

###### HTTP status code {#http-status-code-13}

`400`

###### Payload {#payload-13}

```json
{
  "error": "invalid_client",
  "error_description": "client_assertion signature couldn't be verified"
}
```

###### Resolution {#resolution-12}

Make sure you're signing the client assertion with the correct authentication key. The private key you use must match the public key you uploaded to Mastercard Developers. Check the signature algorithm too (use ES256 or PS256). The `kid` (key ID) in the JWT header must match the key ID from Mastercard Developers. If you recently updated your key on Mastercard Developers, make sure you downloaded the new private key and are using it in your application.

*** ** * ** ***

#### Client assertion is expired {#client-assertion-is-expired}

The client assertion JWT's `iat` (issued-at time) or `exp` (expiration time) shows it's too old and has expired.

###### HTTP status code {#http-status-code-14}

`400`

###### Payload {#payload-14}

```json
{
  "error": "invalid_client",
  "error_description": "client_assertion is expired"
}
```

###### Resolution {#resolution-13}

Generate a fresh client assertion for each token request. Set the `iat` claim to the current time and the `exp` claim to a short time in the future (within the acceptable window the Mastercard authorization server defines). Make sure your system clock is accurate.

*** ** * ** ***

#### Client assertion is not yet valid {#client-assertion-is-not-yet-valid}

The `nbf` (not before time) in your client assertion JWT shows it's not yet valid.

###### HTTP status code {#http-status-code-15}

`400`

###### Payload {#payload-15}

```json
{
  "error": "invalid_client",
  "error_description": "NBF(Not Before Date) is invalid, value must be less than current date time"
}
```

###### Resolution {#resolution-14}

Fix the `nbf` claim in your client assertion JWT. The `nbf` claim is the time before which the JWT must not be accepted for processing. Set it to the current time or a time in the past. If your system clock is fast, sync it with an NTP server.

*** ** * ** ***

#### Client assertion has unsupported algorithm {#client-assertion-has-unsupported-algorithm}

Your client assertion JWT was signed using an algorithm the Mastercard authorization server doesn't support.

###### HTTP status code {#http-status-code-16}

`400`

###### Payload {#payload-16}

```json
{
  "error": "invalid_client",
  "error_description": "Unsupported alg value for client_assertion"
}
```

###### Resolution {#resolution-15}

Sign the client assertion using ES256 or PS256. Make sure the `alg` claim in the JWT header matches the algorithm of your authentication key and is one of these supported values.

*** ** * ** ***

### DPoP Proof Errors {#dpop-proof-errors}

1. [DPoP proof is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-invalid)
2. [DPoP proof is missing public key](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-missing-public-key)
3. [DPoP proof has unsupported algorithm](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-has-unsupported-algorithm)
4. [DPoP proof signature could not be verified](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-signature-could-not-be-verified)
5. [DPoP proof is expired](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-expired)
6. [DPoP proof is issued in the future](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-issued-in-the-future)
7. [DPoP proof JTI value is too long](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-jti-value-is-too-long)
8. [DPoP proof htu claim is mismatched](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-htu-claim-is-mismatched)
9. [DPoP proof nonce is missing or invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-nonce-is-missing-or-invalid)

#### DPoP proof is invalid {#dpop-proof-is-invalid}

The DPoP proof in your request is not a valid JWT or is missing required claims.

###### HTTP status code {#http-status-code-17}

`400`

###### Payload {#payload-17}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Invalid dpop token"
}
```

###### Resolution {#resolution-16}

Check the format and content of your DPoP proof. Make sure it is a well-formed JWT with the correct header and payload structure. The payload must include all required claims: `jti` (unique identifier), `htm` (HTTP method), `htu` (HTTP URI), and `iat` (issued-at time). When calling the token endpoint, set `htm` to `POST` and `htu` to the exact token endpoint URL. The JWT must be properly base64-encoded and signed with your DPoP private key.

*** ** * ** ***

#### DPoP proof is missing public key {#dpop-proof-is-missing-public-key}

Your DPoP proof JWT doesn't include a public key in its header.

###### HTTP status code {#http-status-code-18}

`400`

###### Payload {#payload-18}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Token signing public key missing in DPoP token header"
}
```

###### Resolution {#resolution-17}

Include the public key (JWK) in the `jwk` claim of your DPoP JWT header. The Mastercard authorization server uses this public key to verify the signature of the DPoP proof. The public key must correspond to the private key you used to sign the DPoP proof.

*** ** * ** ***

#### DPoP proof has unsupported algorithm {#dpop-proof-has-unsupported-algorithm}

Your DPoP proof JWT was signed using an algorithm the Mastercard authorization server doesn't support.

###### HTTP status code {#http-status-code-19}

`400`

###### Payload {#payload-19}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Unsupported alg value in token"
}
```

###### Resolution {#resolution-18}

Sign the DPoP proof using ES256 or PS256. Make sure the `alg` claim in the JWT header matches the algorithm of your DPoP key and is one of these supported values.

*** ** * ** ***

#### DPoP proof signature could not be verified {#dpop-proof-signature-could-not-be-verified}

The Mastercard authorization server couldn't verify the signature of your DPoP proof.

###### HTTP status code {#http-status-code-20}

`400`

###### Payload {#payload-20}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "dpop token signature couldn't be verified"
}
```

###### Resolution {#resolution-19}

Make sure you're signing the DPoP proof with the private key that matches the public key in the `jwk` header claim. Check the signature algorithm (use ES256 or PS256) and make sure the public key in the `jwk` claim is the correct public key for your DPoP key pair.

*** ** * ** ***

#### DPoP proof is expired {#dpop-proof-is-expired}

The `iat` (issued-at time) in your DPoP JWT shows it's too old and has expired.

###### HTTP status code {#http-status-code-21}

`400`

###### Payload {#payload-21}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Token is expired"
}
```

###### Resolution {#resolution-20}

Generate a fresh DPoP proof for each request. The `iat` claim should be the current time (within the acceptable window the Mastercard authorization server defines, usually a few minutes). Make sure your system clock is accurate and create a new DPoP JWT right before sending the request.

*** ** * ** ***

#### DPoP proof is issued in the future {#dpop-proof-is-issued-in-the-future}

The `iat` timestamp in your DPoP proof is set to a time in the future.

###### HTTP status code {#http-status-code-22}

`400`

###### Payload {#payload-22}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Token cannot be issued in the future"
}
```

###### Resolution {#resolution-21}

Fix the system time or the way you set the `iat` claim in the DPoP JWT. The issued-at time should be the current time (or a few seconds in the past). Do not use a future timestamp. If your system clock is fast, sync it with an NTP server.

*** ** * ** ***

#### DPoP proof JTI value is too long {#dpop-proof-jti-value-is-too-long}

The unique token identifier (`jti`) in your DPoP proof exceeded the allowed length.

###### HTTP status code {#http-status-code-23}

`400`

###### Payload {#payload-23}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "JTI exceeded 16 byte limit"
}
```

###### Resolution {#resolution-22}

Generate a shorter `jti` for your DPoP JWT. The `jti` should be a unique identifier (often a random UUID or string), but it must be within the Mastercard authorization server's size limits. Generate a `jti` that's 16 bytes or fewer.

*** ** * ** ***

#### DPoP proof htu claim is mismatched {#dpop-proof-htu-claim-is-mismatched}

The `htu` (HTTP URI) claim in your DPoP proof doesn't match the URL you're calling.

###### HTTP status code {#http-status-code-24}

`400`

###### Payload {#payload-24}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Claims validation failed due to htu mismatch"
}
```

###### Resolution {#resolution-23}

Make sure the `htu` claim in your DPoP proof exactly matches the URL you're calling. The `htu` must include the scheme, host, and path, but exclude query parameters and fragments.

*** ** * ** ***

#### DPoP proof nonce is missing or invalid {#dpop-proof-nonce-is-missing-or-invalid}

The Mastercard authorization server needs a nonce in the DPoP proof, but you didn't include one, or the nonce you included isn't valid anymore.

###### HTTP status code {#http-status-code-25}

`400`

###### Payload {#payload-25}

```json
{
  "error": "use_dpop_nonce",
  "error_description": "Authorization server requires nonce in DPoP proof"
}
```

###### Resolution {#resolution-24}

Send your first DPoP proof without a nonce. The Mastercard authorization server will respond with a `DPoP-Nonce` header containing the nonce value. Extract that nonce, include it in a new DPoP proof JWT, and send your token request again. If the nonce you included was invalid, the authorization server will return a new `DPoP-Nonce` header with the correct value to use.

## Resource server errors {#resource-server-errors}

1. [Access token is missing](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#access-token-is-missing)
2. [Invalid authorization header](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#invalid-authorization-header)
3. [DPoP proof is missing public key](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-missing-public-key)
4. [DPoP proof nonce is missing or invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-nonce-is-missing-or-invalid)
5. [DPoP proof has unsupported algorithm](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-has-unsupported-algorithm)
6. [DPoP proof htu claim is mismatched](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-htu-claim-is-mismatched)
7. [DPoP proof signature could not be verified](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-signature-could-not-be-verified)
8. [DPoP proof has unsupported public key type](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-has-unsupported-public-key-type)
9. [DPoP proof is expired](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-expired)
10. [DPoP proof is issued in the future](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-issued-in-the-future)
11. [DPoP proof is malformed](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-is-malformed)
12. [Access token is invalid](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#access-token-is-invalid)
13. [DPoP proof ath and access token mismatch](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#dpop-proof-ath-and-access-token-mismatch)
14. [Invalid DPoP key binding](https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/oauth2-error-codes/index.md#invalid-dpop-key-binding)

#### Access token is missing {#access-token-is-missing}

The request did not include an access token in the `Authorization` header (or it was empty).

###### HTTP status code {#http-status-code-26}

`400`

###### Payload {#payload-26}

```json
{
  "error": "invalid_request",
  "error_description": "invalid request"
}
```

###### WWW-Authenticate {#www-authenticate}

    WWW-Authenticate: DPoP error="invalid_request", error_description="invalid request", algs="ES256 PS256"

###### Resolution {#resolution-25}

Include a valid access token in the `Authorization` header. For DPoP-bound tokens use: `Authorization: DPoP <access_token>`.

*** ** * ** ***

#### Invalid authorization header {#invalid-authorization-header}

The `Authorization` header format is invalid.

###### HTTP status code {#http-status-code-27}

`400`

###### Payload {#payload-27}

```json
{
  "error": "invalid_request",
  "error_description": "invalid request"
}
```

###### WWW-Authenticate {#www-authenticate-1}

    WWW-Authenticate: DPoP error="invalid_request", error_description="invalid request", algs="ES256 PS256"

###### Resolution {#resolution-26}

Include a valid access token in the `Authorization` header. For DPoP-bound tokens use: `Authorization: DPoP <access_token>`.

*** ** * ** ***

#### DPoP proof is missing public key {#dpop-proof-is-missing-public-key-1}

The DPoP proof did not include a public key JWK in the JWT header, so the server cannot verify the signature and the access token binding.

###### HTTP status code {#http-status-code-28}

`401`

###### Payload {#payload-28}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "dpop token signature couldn't be verified"
}
```

###### WWW-Authenticate {#www-authenticate-2}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="dpop token signature couldn't be verified", algs="ES256 PS256"

###### Resolution {#resolution-27}

Include the public key (`jwk`) in the DPoP JWT header that corresponds to the private key used to sign the proof. Ensure the JWK is valid and complete.

*** ** * ** ***

#### DPoP proof nonce is missing or invalid {#dpop-proof-nonce-is-missing-or-invalid-1}

The resource server needs a nonce in the DPoP proof, but you didn't include one, or the nonce you included isn't valid anymore.

###### HTTP status code {#http-status-code-29}

`401`

###### Payload {#payload-29}

```json
{
  "error": "use_dpop_nonce",
  "error_description": "Resource server requires nonce in DPoP proof"
}
```

###### WWW-Authenticate {#www-authenticate-3}

    WWW-Authenticate: DPoP error="use_dpop_nonce", error_description="Resource server requires nonce in DPoP proof", algs="ES256 PS256"

###### Resolution {#resolution-28}

The resource server returns a new `DPoP-Nonce` header with the correct value to use.

*** ** * ** ***

#### DPoP proof has unsupported algorithm {#dpop-proof-has-unsupported-algorithm-1}

Your DPoP proof JWT was signed using an algorithm the resource server doesn't support.

###### HTTP status code {#http-status-code-30}

`401`

###### Payload {#payload-30}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Unsupported alg value in token"
}
```

###### WWW-Authenticate {#www-authenticate-4}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Unsupported alg value in token", algs="ES256 PS256"

###### Resolution {#resolution-29}

Sign the DPoP proof using ES256 or PS256. Make sure the `alg` claim in the JWT header matches the algorithm of your DPoP key and is one of these supported values.

*** ** * ** ***

#### DPoP proof htu claim is mismatched {#dpop-proof-htu-claim-is-mismatched-1}

The `htu` (HTTP URI) claim in your DPoP proof doesn't match the URL you're calling.

###### HTTP status code {#http-status-code-31}

`401`

###### Payload {#payload-31}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Claims validation failed due to htu mismatch"
}
```

###### WWW-Authenticate {#www-authenticate-5}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Claims validation failed due to htu mismatch", algs="ES256 PS256"

###### Resolution {#resolution-30}

Make sure the `htu` claim in your DPoP proof exactly matches the URL you're calling. The `htu` must include the scheme, host, and path, but exclude query parameters and fragments.

*** ** * ** ***

#### DPoP proof signature could not be verified {#dpop-proof-signature-could-not-be-verified-1}

The resource server couldn't verify the signature of your DPoP proof.

###### HTTP status code {#http-status-code-32}

`401`

###### Payload {#payload-32}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "dpop token signature couldn't be verified"
}
```

###### WWW-Authenticate {#www-authenticate-6}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="dpop token signature couldn't be verified", algs="ES256 PS256"

###### Resolution {#resolution-31}

Make sure you're signing the DPoP proof with the private key that matches the public key in the `jwk` header claim. Check the signature algorithm (use ES256 or PS256) and make sure the public key in the `jwk` claim is the correct public key for your DPoP key pair.

*** ** * ** ***

#### DPoP proof has unsupported public key type {#dpop-proof-has-unsupported-public-key-type}

The public key in your DPoP proof has an unsupported key type or malformed fields.

###### HTTP status code {#http-status-code-33}

`401`

###### Payload {#payload-33}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "dpop token signature couldn't be verified"
}
```

###### WWW-Authenticate {#www-authenticate-7}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="dpop token signature couldn't be verified", algs="ES256 PS256"

###### Resolution {#resolution-32}

Use a supported public key type (elliptic curve keys for ES256 or RSA for PS256 as allowed by the server). Provide a valid JWK in the proof header.

*** ** * ** ***

#### DPoP proof is expired {#dpop-proof-is-expired-1}

The `iat` (issued-at time) in your DPoP JWT shows it's too old and has expired.

###### HTTP status code {#http-status-code-34}

`401`

###### Payload {#payload-34}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Token is expired"
}
```

###### WWW-Authenticate {#www-authenticate-8}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Token is expired", algs="ES256 PS256"

###### Resolution {#resolution-33}

Generate a fresh DPoP proof for each request. The `iat` claim should be the current time (within the acceptable window the Mastercard authorization server defines, usually a few minutes). Make sure your system clock is accurate and create a new DPoP JWT right before sending the request.

*** ** * ** ***

#### DPoP proof is issued in the future {#dpop-proof-is-issued-in-the-future-1}

The `iat` timestamp in your DPoP proof is set to a time in the future.

###### HTTP status code {#http-status-code-35}

`401`

###### Payload {#payload-35}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Token cannot be issued in the future"
}
```

###### WWW-Authenticate {#www-authenticate-9}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Token cannot be issued in the future", algs="ES256 PS256"

###### Resolution {#resolution-34}

Fix the system time or the way you set the `iat` claim in the DPoP JWT. The issued-at time should be the current time (or a few seconds in the past). Do not use a future timestamp. If your system clock is fast, sync it with an NTP server.

*** ** * ** ***

#### DPoP proof is malformed {#dpop-proof-is-malformed}

The DPoP proof is malformed and cannot be parsed as a JWT.

###### HTTP status code {#http-status-code-36}

`401`

###### Payload {#payload-36}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Invalid dpop token"
}
```

###### WWW-Authenticate {#www-authenticate-10}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Invalid dpop token", algs="ES256 PS256"

###### Resolution {#resolution-35}

Generate a valid DPoP JWT. Verify base64 encoding, header, payload, signature, and presence of required claims.

*** ** * ** ***

#### Access token is invalid {#access-token-is-invalid}

The access token is not acceptable to the resource server.

###### HTTP status code {#http-status-code-37}

`401`

###### Payload {#payload-37}

```json
{
  "error": "access_denied",
  "error_description": "access denied"
}
```

###### WWW-Authenticate {#www-authenticate-11}

    WWW-Authenticate: DPoP error="access_denied", error_description="access denied", algs="ES256 PS256"

###### Resolution {#resolution-36}

Request or generate a valid access token from the Mastercard authorization server. Ensure the token signature is intact and the token was not tampered with.

*** ** * ** ***

#### DPoP proof ath and access token mismatch {#dpop-proof-ath-and-access-token-mismatch}

The authentication confirmation (`ath`) in the DPoP proof does not match the access token binding.

###### HTTP status code {#http-status-code-38}

`401`

###### Payload {#payload-38}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "DPoP token ath and access token do not match"
}
```

###### WWW-Authenticate {#www-authenticate-12}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="DPoP token ath and access token do not match", algs="ES256 PS256"

###### Resolution {#resolution-37}

When using DPoP, include a correct `ath` claim value (thumbprint or hash of the access token as required).

*** ** * ** ***

#### Invalid DPoP key binding {#invalid-dpop-key-binding}

The server could not validate the key binding or thumbprint in the DPoP proof.

###### HTTP status code {#http-status-code-39}

`401`

###### Payload {#payload-39}

```json
{
  "error": "invalid_dpop_proof",
  "error_description": "Invalid DPoP key binding"
}
```

###### WWW-Authenticate {#www-authenticate-13}

    WWW-Authenticate: DPoP error="invalid_dpop_proof", error_description="Invalid DPoP key binding", algs="ES256 PS256"

###### Resolution {#resolution-38}

Ensure the JWK in the DPoP header matches the key used to sign the proof and that the key used to sign the proof is the same that was used when requesting the access token.
