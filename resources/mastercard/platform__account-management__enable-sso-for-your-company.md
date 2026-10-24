# Single Sign-On Client Onboarding
source: https://developer.mastercard.com/platform/documentation/account-management/enable-sso-for-your-company/index.md

## What is Federated Single Sign-On (FSSO)? {#what-is-federated-single-sign-on-fsso}

Single sign-on (SSO) enables access to applications for a single domain. FSSO extends this capability across multiple organizations or domains, enabling users to access applications in trusted partner organizations using their existing credentials. Mastercard Developers has implemented FSSO.

## Overview {#overview}

FSSO allows users to authenticate once and access applications and services across domains and organizations without needing separate logins.

A federated partner relationship involves two distinct roles: the identity provider (IDP) and the service provider (SP). The IDP supplies a verified identity as a digital token---in this case (your organization). The SP validates the digital token, creates a session for the user, and grants access to the application environment (Mastercard Developers).

A link has been added to our [main login screen](https://developer.mastercard.com/account/log-in) to redirect users to the SSO login screen. SSO enabled users can also directly access the [SSO login screen](https://developer.mastercard.com/account/log-in?login=sso).

Instead of traditional 'login with password,' a user will enter their email address to log in to Mastercard Developers. New users can also be added immediately with Just-In-Time (JIT) account creation through the SSO login screen.
Profile details, such as name and email, can now be managed by your organization. Additionally, all SSO users will be automatically verified under your organization, providing an extra layer of trust and security across your projects.

## How to enable SSO for your organization? {#how-to-enable-sso-for-your-organization}

### Step 1: Submit your request for SSO {#step-1-submit-your-request-for-sso}

To start the process, you must first contact your Mastercard representative (ex. technical account manager) and inform them of your need for SSO. If you don't have an active relationship with a Mastercard representative or don't know who your representative is, you can create a [support ticket](https://developer.mastercard.com/support) under "My account and log in" and state you would like to setup single sign-on for your company.

In your request please be sure to submit the following information:

* Organization Details
  * Provide the full name of your organization.
  * Provide your Mastercard assigned company ID (CID).
* Active Users
  * Specify the current number of active Mastercard Developers users.
  * If there are no active users, estimate the number of users expected to use SSO.
  * List the Mastercard APIs currently in use by your organization.
* Security and Compliance Requirements
  * Describe any specific security or compliance requirements.
  * Mastercard Developers supports the SAML 2.0 authentication protocol for FSSO. Please indicate if you cannot support this protocol and reason why.
  * Specify any requirements for a testing environment and test users.
* Timeline and Deadlines
  * Provide the target date for SSO completion.
  * List any upcoming events or launches impacting this timeline.
  * Clarify if SSO is essential to your organization's use of Mastercard services or if it's optional but preferred.

Note: You can expect an estimated 5 weeks to enable SSO for your organization after the Mastercard Developers team has picked up your request and contacted your Mastercard representative.

### Step 2: Provide IDP metadata information {#step-2-provide-idp-metadata-information}

*For this step you must work with your Mastercard representative*

1. Complete the [FSSO Questionnaire](https://static.developer.mastercard.com/content/platform/uploads/fsso_questionnaire_idp_onboarding_on_mcd.doc)
2. Provide SAML Attributes, Organization Domain(s), and Company ID (CID)

Once these details are finalized, your Mastercard representative will send the information to the Mastercard Developers team.

### Step 3: Certificate exchange {#step-3-certificate-exchange}

*For this step you must work with your Mastercard representative*

Mastercard Developers SSO implementation currently supports only SAML 2.0. We require the SAML assertion to be signed at a minimum, and assertion encryption is optional.

Mastercard requires that all partners share their certificates securely using the Mastercard Key Management Portal (KMP). If you do not have access to KMP, please contact your Mastercard representative.

1. A complete CA chain, including the root certificate, is required for successful registration in KMP.
2. You may use an existing certificate issued by a trusted third-party CA.
3. Self-signed certificates are not accepted; at least one CA in the chain must be a trusted public CA (e.g., Verisign, Entrust).

KMP offers two methods for you to provide your certificate. Note that this step may need to be repeated for each environment.

1. If you wish to provide your own certificate, please select the below options while uploading the certificate on KMP:

   1. Application - Federated Single Sign-on
   2. Request Type - Submit Certificate
   3. Environment - Production
   4. Certificate Profile - Signing
   5. *Mastercard representative email address*
2. If you require Mastercard to issue a certificate, you can upload a CSR (Certificate Signing Request), and we will issue a certificate for you. With this approach, the Client DN for the certificate must include the following attributes:

   1. Common Name (CN): \[ Your organization name\]-\[Environment\]
   2. Organization (O): MasterCard Worldwide - FSSO
   3. Organization Unit (OU): FSSO Message Signing
   4. Country (C): must be a valid 2 characters ISO code

At this stage, your Mastercard representative will work closely with you to ensure a successful certificate exchange.

### Step 4: Configure Mastercard Developers Certificate {#step-4-configure-mastercard-developers-certificate}

After you are successfully onboarded to Mastercard Developers, we will share our metadata attributes, which you must use to configure your system. Please note that this step may take 2 to 3 weeks.

### Step 5: Define integration and testing plan {#step-5-define-integration-and-testing-plan}

In this step, your Mastercard representative or the Mastercard Developers team will set up a meeting to review your specific requirements and ensure compliance with Mastercard Developers' standards.

* Set Up Production Environment requirements
  * Ensure protocols for production environments.
* Prepare Test Users and Scenarios
  * Identify test users and define key scenarios to validate functionality.
* Develop a Communication Plan
  * Plan to inform your organization's users about this new feature.
  * Mastercard Developers will notify all active users of any changes to their accounts. We also recommend that your organization send similar communication to keep users informed.
* Schedule the Go-Live Date
  * Select a target date to launch the feature officially! On this date, passwords and manual account creation will be disabled for all users within the organization.

## Shared Mailboxes {#shared-mailboxes}

Before enabling SSO, review any shared mailbox or group email accounts that access Mastercard Developers.

Support for shared mailbox authentication through SSO is determined by your organization's identity provider (IdP) configuration. Some organizations may support these accounts, while others may not.

If shared mailbox authentication is not supported by your organization:

* Shared mailbox accounts may no longer be able to sign in once SSO is enforced.
* Password-based sign-in will no longer be available as a fallback.
* Projects, applications, or resources owned by these accounts may become inaccessible until ownership is transferred.

<br />

Before go-live, we recommend identifying any shared mailbox accounts and confirming whether they are supported by your organization's SSO implementation. If they are not supported, you can mitigate this issue by adding multiple team members with personal accounts to projects owned by users with shared mailboxes. Refer to the [Team Management](https://developer.mastercard.com/platform/documentation/managing-your-account/team-management/index.md) documentation for guidance.
