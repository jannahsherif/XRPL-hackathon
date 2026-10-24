# Authentication by Mastercard (TAS)
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/index.md

Mastercard's Token Authentication Service (TAS) establishes strong authentication standards to reduce friction, fortify security, and drive conversion.

With TAS, Integrators can drive cardholder authentication with device binding, passkey verification, or alternative methods.

## Authentication Methods {#authentication-methods}

### Authentication with Passkey {#authentication-with-passkey}

[Learn More](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/create-passkey/index.md)

### Authentication with 3DS {#authentication-with-3ds}

[Learn More](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/use-case2/index.md)
Note:   

**Data Retention Policy**   

Mastercard may retain FIDO attestation data, OS-attested app instance data and/or PKI key attestation data to perform the verification of device binding and transaction authentication when processing the checkout.   

If a consumer does not authenticate/use the passkey for **13 months** , Mastercard may delete all data related to the device instance, the passkey (FIDO), public key (PKI) attestation, `srcDigitalCardId` along with its corresponding FPAN and the `externalCredentialId`.   

The authenticating entity/Integrator must perform a new ID\&V process to create a new device binding and provide the required data, where applicable, to Mastercard.

**Maintaining Session Affinity**   

* Site identifier `X-Src-Cx-Flow-Id`

  * This parameter is added as a part of all inbound API response headers for resolving site affinity issues on subsequent calls. When making back-to-back API calls, the Integrator must include the `X-Src-Cx-Flow-Id` of the initial API response in the header of the subsequent API requests. This ensures that the consecutive API calls will be sent to the same Mastercard server that returned the initial response.
* `srcCorrelationId`

  * This parameter correlates a series of two or more requests to a single session of activity. Integrators must choose to populate previously used `srcCorrelationId` in subsequent requests to correlate their activity under a single ID.

<br />

**UX displayed in different scenarios**

The UI displayed in these scenarios is for illustration purpose. Refer to the [Product Guide](https://trc-techresource.mastercard.com/r/bundle/m_tas_pg_en-us/page/d/en-US/tai1746675386084.html) for details.
