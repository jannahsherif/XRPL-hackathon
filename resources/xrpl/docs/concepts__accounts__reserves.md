# Reserves

The XRP Ledger applies *reserve requirements*, in XRP, to protect the shared global ledger from growing excessively large as the result of spam or malicious usage. The goal is to constrain the growth of the ledger to match improvements in technology so that a current commodity-level machine can always fit the current ledger in RAM.

To have an account, an address must hold a minimum amount of XRP in the shared global ledger. To fund a new address, you must receive enough XRP at that address to meet the reserve requirement. You cannot send the reserved XRP to others, but you can recover some of the XRP by [deleting the account](/docs/concepts/accounts/deleting-accounts).

The XRP reserve is not dormant, however. You can use your reserves to pay transaction fees. Another way to look at your reserves is that you are pre-funding your account to handle your transaction fees.

The reserve requirement changes from time to time due to the [Fee Voting](/docs/concepts/consensus-protocol/fee-voting) process, where validators can agree to new reserve settings.

## Base Reserve and Owner Reserve

The reserve requirement has two parts:

* The **Base Reserve** is a minimum amount of XRP that is required for each address in the ledger.
* The **Owner Reserve** is an increase to the reserve requirement for each object that the address owns in the ledger. The cost per item is also called the *incremental reserve*.


The current reserve requirements on Mainnet are:

- Base reserve: **1 XRP**
- Owner reserve: **0.2 XRP** per item


Reserves on other networks may vary.

An exception to the owner reserve is that you can create your first two trust lines on the XRPL with just the base reserve. Create your new account with the 1 XRP base reserve, then you can create your 2 trust lines and the reserves are not required. If you fund your account with more than 1 XRP, your account will be charged the normal reserve fees for your first two trust lines.

## Owner Reserves

Many objects in the ledger (ledger entries) are owned by a particular account. Usually, the owner is the account that created the object. Each object increases the owner's total reserve requirement by the owner reserve. When objects are removed from the ledger, they no longer count against the reserve requirement.

Objects that count towards their owner's reserve requirement include: [Checks](/docs/concepts/payment-types/checks), [Deposit Preauthorizations](/docs/concepts/accounts/depositauth#preauthorization), [Escrows](/docs/concepts/payment-types/escrow), [NFT Offers](/docs/concepts/tokens/nfts/trading), [NFT Pages](/docs/concepts/tokens/nfts), [Offers](/docs/references/protocol/ledger-data/ledger-entry-types/offer), [Oracles](/docs/concepts/decentralized-storage/price-oracles), [Payment Channels](/docs/concepts/payment-types/payment-channels), [Signer Lists](/docs/concepts/accounts/multi-signing), [Tickets](/docs/concepts/accounts/tickets), and [Trust Lines](/docs/concepts/tokens/fungible-tokens).

Some special cases:

- Non-Fungible Tokens (NFTs) are grouped into pages containing up to 32 NFTs each, and the owner reserve applies per page rather than per NFT. Due to the mechanism for splitting and combining pages, the number of NFTs actually stored per page varies. See also: [Reserve for NFTokenPage objects](/docs/references/protocol/ledger-data/ledger-entry-types/nftokenpage#nftokenpage-reserve).
- Trust lines (`RippleState` entries) are shared between two accounts. The owner reserve can apply to one or both of them. Most often, the token holder owes a reserve and the issuer does not. See also: [RippleState: Contributing to the Owner Reserve](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate#contributing-to-the-owner-reserve).
- Signer lists created before the [MultiSignReserve amendment](/resources/known-amendments#multisignreserve) activated in April 2019 count as multiple objects. See also: [Signer Lists and Reserves](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist#signer-lists-and-reserves).
- An [Owner Directory](/docs/references/protocol/ledger-data/ledger-entry-types/directorynode) is a ledger entry that lists all objects related to an account, including all objects the account owns. However, the owner directory itself does not count towards the reserve.
- Oracles count as one item for the owner reserve if they contain one to five `PriceData` objects, or two items if they contain six to ten `PriceData` objects.
- Some ledger entries can be sponsored, meaning their owner reserve counts against a sponsoring account instead of the owner. A sponsored entry names its sponsor in a `Sponsor` field (or `HighSponsor` and `LowSponsor` for trust lines) and the sponsor's `SponsoringOwnerCount` tracks how many entries it covers. An account's base reserve can be sponsored separately, tracked by `SponsoringAccountCount`. See also: [Sponsored Fees and Reserves](/docs/concepts/accounts/sponsored-fees-and-reserves). _Requires the [Sponsor amendment](/resources/known-amendments#sponsor). (Open for Voting: 17.14%)_


### Looking Up Reserves

Applications can look up the current base and incremental reserve values using the [server_info method](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info) or [server_state method](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_state):

| Method | Units | Base Reserve Field | Incremental Reserve Field |
|  --- | --- | --- | --- |
| [server_info method](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info) | Decimal XRP | `validated_ledger.reserve_base_xrp` | `validated_ledger.reserve_inc_xrp` |
| [server_state method](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_state) | Integer drops of XRP | `validated_ledger.reserve_base` | `validated_ledger.reserve_inc` |


To determine the owner reserve of an account, multiply the incremental reserve by the number of objects the account owns. To look up the number of objects an account owns, call the [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info) and take `account_data.OwnerCount`.

To calculate an address's total reserve requirement, multiply `OwnerCount` by `reserve_inc_xrp`, then add `reserve_base_xrp`. See also: Code Sample: Calculate Reserves.

## Going Below the Reserve Requirement

During transaction processing, the [transaction cost](/docs/concepts/transactions/transaction-cost) destroys some of the sending address's XRP balance. This can cause an address's XRP to go below the reserve requirement. You can even destroy *all* of your XRP this way.

When your account holds less XRP than its current reserve requirement, you cannot send XRP to others, or create new objects that would increase your account's reserve requirement. Even so, the account continues to exist in the ledger and you can still send transactions that don't do these things, as long as you have enough XRP to pay the transaction cost. You can go back above the reserve requirement by receiving enough XRP, or if the reserve requirement decreases below the amount you have.

If your address is below the reserve requirement, you can send an [OfferCreate transactions](/docs/references/protocol/transactions/types/offercreate) to acquire more XRP and get back above the reserve requirement. However, since you cannot create an [Offer entry in the ledger](/docs/references/protocol/ledger-data/ledger-entry-types/offer) while you are below the reserve, this transaction can only consume Offers that are already in the order books.

## Changing the Reserve Requirements

The XRP Ledger has a mechanism to adjust the reserve requirements. Such adjustments may consider, for example, long-term changes in the value of XRP, improvements in the capacity of commodity-level machine hardware, or increased efficiency in the server software implementation. Any changes have to be approved by the consensus process. See [Fee Voting](/docs/concepts/consensus-protocol/fee-voting) for more information.

## See Also

- [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects)
- [AccountRoot Object](/docs/references/protocol/ledger-data/ledger-entry-types/accountroot)
- [Fee Voting](/docs/concepts/consensus-protocol/fee-voting)
- [SetFee pseudo-transaction](/docs/references/protocol/transactions/pseudo-transaction-types/setfee)
- [Tutorial: Calculate and display the reserve requirement (Python)](/docs/tutorials/sample-apps/build-a-desktop-wallet-in-python#3-display-an-account)