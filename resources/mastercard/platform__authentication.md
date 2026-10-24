# Authentication
source: https://developer.mastercard.com/platform/documentation/authentication/index.md

## Overview {#overview}

Mastercard values high levels of security to protect your data. APIs on Mastercard Developers are secured using industry standards and strong cryptographic algorithms. To access Mastercard APIs, you will need to configure your API client to authenticate using one of the following authentication protocols:

### OAuth 1.0a {#oauth-10a}

This is the default authentication mechanism used by most APIs on Mastercard Developers. OAuth 1.0a is an authentication and authorization protocol that guarantees the integrity and authenticity of incoming API calls and allows for non-repudiation of requests.
Using OAuth 1.0a to Access Mastercard APIs

### OAuth 2.0 {#oauth-20}

Mastercard APIs use the OAuth 2.0 client credentials flow to authenticate API clients, and [FAPI 2.0](https://openid.bitbucket.io/fapi/fapi-security-profile-2_0.html), a security profile built for financial services.
Using OAuth 2.0 to Access Mastercard APIs

### Mutual TLS (mTLS) {#mutual-tls-mtls}

Mutual TLS Authentication is a two-way authentication mechanism based on Transport Layer Security (TLS) that uses digital certificates signed using Public Key Infrastructure framework.
Using mTLS to Access Mastercard APIs
