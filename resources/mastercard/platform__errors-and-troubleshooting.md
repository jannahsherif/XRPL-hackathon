# Errors & Troubleshooting
source: https://developer.mastercard.com/platform/documentation/errors-and-troubleshooting/index.md

This page outlines some of the common issues you may come across when integrating with Mastercard APIs. These issues are general in nature, for errors that are specific to the API you are integrating please ensure you read the support section for that particular API.

## TLS Handshake Failures {#tls-handshake-failures}

* Example (Java)

```Example (Java)
javax.net.ssl.SSLHandshakeException: Remote host closed connection during handshake
```

This can occur when your server is misconfigured for handling the outbound requests to the Mastercard API. You may have a proxy that is tampering with the request and stripping the required certificates.

You can run the following command to check if the server certificates are being returned:

    openssl s_client -showcerts -host sandbox.api.mastercard.com -port 443

The result from this command will show you if:

* No peer certificates are available
* No client certificate CA names were sent

As an additional troubleshooting measure, you can disconnect from the corporate network and re-run the above command. If the certificate chain details are now available, this confirms that your corporate network is tampering with the requests sent to the Mastercard service.

**Resolution**

You will need to work with your internal network architects to identify what part of it is tampering with the certificates, and reconfigure settings to address the issue.

## Connection Timeouts {#connection-timeouts}

* Example (Java)

```Example (Java)
java.net.ConnectException: Connection timed out
```

You may see connection timeouts when there is an issue with firewalls preventing access to Mastercard's API endpoints. You can verify by running this command:

    telnet sandbox.api.mastercard.com 443

If you see the connection timeout error then it is likely that a firewall within the corporate network is blocking the connection.

**Resolution**

You will need to work with your organization's networking team to open connectivity to Mastercard API endpoints.
