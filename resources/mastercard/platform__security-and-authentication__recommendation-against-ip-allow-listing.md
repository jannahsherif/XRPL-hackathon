# Recommendation Against IP Allow-Listing
source: https://developer.mastercard.com/platform/documentation/security-and-authentication/recommendation-against-ip-allow-listing/index.md

Mastercard does not recommend IP Allow-Listing given the dynamic nature of our public-facing internet infrastructure. Mastercard's public IP addresses may change at any time due to architectural changes, new features and enhancements, and failover events.

Customers connecting to api.mastercard.com should always use DNS hostnames rather than hard-coded IPs when making these connections. This approach will allow for maximum uptime benefit due to the improved routing efficiencies and mitigation of future internet anomalies. Connecting directly via an IP address is strongly discouraged as you will not receive the benefits of routing through our global network of systems that may result in loss of service.

Please consult with your security and network administrators to determine if a solution can be implemented while still maintaining your security policies.
Note: Certificate pinning is not a recommended approach and Mastercard discourages it.

## Get Help {#get-help}

### Contact us for technical support. {#contact-us-for-technical-support}

