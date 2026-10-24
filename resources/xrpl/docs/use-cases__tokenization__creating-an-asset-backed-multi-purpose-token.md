# Creating an Asset-backed Multi-purpose Token

*As a financial professional, I want to use multi-purpose tokens to create an asset-backed token in order to profit from resale transactions.*

A Multi-Purpose Token (MPT) is a compact and flexible object that offers the best aspects of fungible and non-fungible tokens. It is the next generation of tokenization on the XRPL. Notable features include:

- MPTs store metadata directly on the XRPL blockchain, with the option of linking to additional off-chain data. Once created, the metadata is immutable.
- MPTs can have a fixed token supply, with a cap on the maximum number of tokens.
- MPT issuers can collect transfer fees each time the token is traded.
- MPTs can be non-transferable, for use cases such as airline credits.
- MPTs also allow advanced compliance features.


_Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_

## Intended Audience

This page is written for product managers, business stakeholders, and non-technical users who want a high-level use case and an easy way to generate an MPT using the downloadable MPT Generator utility.

To learn about MPTs in general, go to the **Concept** page. For developer-focused content and code examples go to the **Tutorial**.

Concept: Multi‑Purpose Tokens
Tutorial: Issue a Multi‑Purpose Token
MPT Generator
## MPT Generator

![MPT Generator Utility](/assets/uc-mpt1-mpt-generator-empty-form.9b7a26c4354b4bcae3178d2b1549a81e90466b8c3dd9e89e0c1af12416b6cc66.ac57e6ef.png)

You can download a [standalone version of the MPT Generator](/assets/mpt-generator.9ac208dcae540687d54a830436951904ee6e8cb53a68c7fe70d8d7483fd995ca.fbe1936e.zip) as sample code.

In practice, you want to use an Issuer account configuration to issue an MPT, but you can try the form  with a new, unconfigured account and the transaction works fine. A T-bill is one example of the many types of asset you can create and trade on the XRP Ledger.

## Creating a US Treasury Bill as an MPT

A US Treasury bill (T-bill) is a short-term debt security issued by the US government. T-bills are considered a safe investment because they're backed by the US government. T-bills are appealing to investors in American states that have high income tax because the interest earned is exempt from state and local taxes. See [Treasury Bills In Depth](https://www.treasurydirect.gov/research-center/history-of-marketable-securities/bills/t-bills-indepth/).

iframe
### Creating an Issuing Account

You can use the Account Configurator to experiment with the settings for a T-bill issuing account in a sandbox environment. When you are satisfied with your configuration, you can create an account on XRPL Mainnet to begin trading.

To create a new MPT Issuer account:

- In the Account Configurator utility, choose ledger instance **Devnet**.
- Click **Get New Account**.
- Choose account configuration template **Issuer**.


The form sets the standard flags for an Issuer account and displays additional configuration fields.

![T-bill Issuer Account Configuration](/assets/uc-mpt1-t-bill-account-configuration.0d521bbd99b2a55e0a680280ed8792e06bba43b007fe5843a7c4feddb1ab7633.ac57e6ef.png)

| Parameter | Value | Description |
|  --- | --- | --- |
| **Domain** | *TOML domain* | URL to the server where your TOML file is stored. For an experimental account, you can enter any URL. When you configure the account, the domain is automatically converted to a hexidecimal string. If you reconfigure the account, you need to enter the original domain again. |
| **Transfer Rate** | 1005000000 | A value between 1000000000 and 2000000000 representing the percentage value you collect when a holder transfers one of your issued tokens. A Transfer Rate of 1005000000 returns .5% of the transfer value to this account. See [Transfer Rate](/docs/references/protocol/transactions/types/accountset#transferrate). |
| **Tick Size** | 5 | Round offers to this many significant digits. Valid values are 3 to 15, or 0 to disable. |
| **Signer Accounts** | *account addresses* | Accounts that have a vote regarding approval of transactions for this account. |
| **Signer Weights** | *int* | The weight of each signer's signature, relative to other signers. |
| **Signer Quorum** | *int* | The required minimum value of signer weights to approve a transaction. |


In practice, configuring signers for your issuing account is a best practice. To reduce complexity, this example does not use signer configuration.

#### Issuer Account Flag Settings

Use the sliders to configure the standard suggested flag settings. You want to be careful about what other accounts are able to send to your account, so you should disallow most types of transfers. One exception is trust lines, which you do want other accounts to be able to create to your issuing account.

One difference between an MPT issuer and other tokens is that there is no concern about rippling, since MPTs are self-contained. If the only purpose for this issuing account is to issue MPTs, you do not have to enable rippling by default.

| Flag | Purpose |
|  --- | --- |
| depositAuth | Require authorization for another account to deposit to this account. |
| disallowIncomingCheck | Prevent other accounts from sending checks to this account. |
| disallowIncomingNFTokenOffer | Prevent other accounts from sending NFTokenOffers to this account. |
| disallowIncomingPayChan | Prevent other accounts from creating Payment Channels to this account. |
| disallowIncomingXRP | Prevent other accounts from sending XRP to this account. |


Once you've set your preferred values in the account configurator, click **Configure Account** to finish preparing your account to issue T-bills.

### Generating a US Treasury Bill as a Multi-purpose Token

You can represent a US Treasury Bill (T-bill) on the XRPL by creating a multi-purpose token. The example below shows random possible values you might use as a starting point. Adjust as needed for your use case.

![MPT Generator Example](/assets/uc-mpt1-t-bill-mpt-generator.7d76b42e915c6b08ee133bf8c1a825b5f4425c208defd47fde32e563b641fb41.ac57e6ef.png)

| Parameter | Value | Description |
|  --- | --- | --- |
| Asset Scale | 2 | The difference, in orders of magnitude, between a standard T-bill unit and the corresponding fractional unit. |
| Maximum Tokens | 500000 | The maximum number of this T-bill MPT that will ever be issued by this account. |
| Transfer Fee | 314 | Fee collected when the T-bill MPT is transferred to another account. |


As an example, you might set the following flags when creating your T-bill MPT.

| Flag | Description |
|  --- | --- |
| Can Transfer | A holder can transfer the T-bill MPT to another account. |
| Can Trade | A holder can trade the T-bill MPT with another account. |


#### Token Metadata

The metadata you provide is what distinguishes your token from other MPTs. The following JSON definition shows sample configuration information for a T-bill. Copy and paste the data, or your own metadata, into the **Token Metadata** field. Once set, MPT metadata is immutable.

```json
{
  "ticker": "TBILL",
  "name": "T-Bill Yield Token",
  "desc": "A yield-bearing stablecoin backed by short-term U.S. Treasuries and money market instruments.",
  "icon": "https://example.org/tbill-icon.png",
  "asset_class": "rwa",
  "asset_subclass": "treasury",
  "issuer_name": "Example Yield Co.",
  "uris": [
      {
          "uri": "https://exampleyield.co/tbill",
          "category": "website",
          "title": "Product Page"
      },
      {
          "uri": "https://exampleyield.co/docs",
          "category": "docs",
          "title": "Yield Token Docs"
      }
  ],
  "additional_info": {
    "interest_rate": "5.00%",
    "interest_type": "variable",
    "yield_source": "U.S. Treasury Bills",
    "maturity_date": "2045-06-30",
    "cusip": "912796RX0"
  }
}
```

Once you've set your preferred values, click **Generate Transaction** to see the transaction syntax for your settings. The `Flags` field displays the sum of the flags you've selected, and the `MPTokenMetadata` is converted to a hexidecimal string.

![Generated syntax for MPTokenIssuanceCreate transaction](/assets/uc-mpt1-t-bill-mpt-generator-generate-code.a8237e9d1c643e33651515fbe437994ca62ee7cbb3468a63b0f9a07df4dd11e1.ac57e6ef.png)

To create your T-bill MPT, click **Send Transaction**. When your transaction succeeds, a link to the record in the XRPL Explorer is displayed in the result field.

![Success link appended to the code field.](/assets/uc-mpt1-t-bill-create-success.d3aac14435b285cf040219c60fd1bb05c7fc59000e1416d32a5743666cac74fb.ac57e6ef.png)

Follow the link and scroll down to find the `MPTokenIssuanceCreate` transaction for your new T-bill in the Explorer.

![Explorer record of the new T-bill MPT.](/assets/uc-mpt1-t-bill-in-explorer.ab359a661bf30d5328ae61e114ca6cfaf4d811509107f1aa84c6fa42c7a04f7f.ac57e6ef.png)

Click **Gather MPT Information** to copy the account information and MPT Issuance ID to the result field. Copy the information and save it to send the MPT to another account as shown in [Send a Multi-Purpose Token (MPT)](/docs/tutorials/payments/send-an-mpt).

![Account and MPT ID in the result field.](/assets/uc-mpt1-t-bill-gather-mpt-info.36272bd0c7c6fca61a0641ac556f94adc5dda9680fee44444dfa966ab09032af.ac57e6ef.png)

## See Also

- [Issue a Multi-Purpose Token (MPT)](/docs/tutorials/tokens/mpts/issue-a-multi-purpose-token)
- [Send a Multi-Purpose Token (MPT)](/docs/tutorials/payments/send-an-mpt)