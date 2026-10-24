# Trust Line Tokens

Trust lines tokens are a type of [fungible token](/docs/concepts/tokens) in the XRP Ledger. They are tracked in trust lines, which enforce the rule that you cannot cause someone else to hold a token they don't want. This is the original token standard of the XRP Ledger, in contrast to [Multi-Purpose Tokens](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens).

## Structure

A trust line is recorded in the ledger as a [RippleState entry](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate). Each trust line is a *bidirectional* relationship consisting of:

- The identifiers for the two [accounts](/docs/concepts/accounts) that the trust line connects.
- A single, shared balance, which is positive from the perspective of one account and negative from the other perspective.
  - The account with a negative balance is generally considered the "issuer" of the tokens. However, in the [APIs](/docs/references/http-websocket-apis), the name `issuer` can refer to either side.
- Various settings and metadata. *Each* of the two accounts can control its own settings on the trust line.
  - Most importantly, each side sets a limit on the trust line, which is 0 by default. Each account's balance (from its perspective on the trust line) can't go above that account's limit, except [through that account's own actions](#going-above-the-limit).


Each trust line is specific to a given [currency code](/docs/references/protocol/data-types/currency-formats#currency-codes). Two accounts can have any number of trust lines between them for different currency codes, but only one shared trust line for any particular currency code.

The balance on a trust line is negative or positive depending on which side you view it from. The side with the negative balance is called the "issuer" and can control some properties of how those tokens behave. When you send tokens to another account that isn't the issuer, those tokens "ripple" through the issuer and possibly other accounts using the same currency code. This is useful in some cases, but can cause unexpected and undesirable behavior in others. You can use the [No Ripple flag](/docs/concepts/tokens/fungible-tokens/rippling) on trust lines to prevent those trust lines from rippling.

## Creation

Any account can unilaterally "trust" another account to issue a token by sending a [TrustSet transaction](/docs/references/protocol/transactions/types/trustset) with a nonzero limit and their own settings. This creates a line with a zero balance, and sets the other side's settings to the default.

Trust lines can be implicitly created by some transactions, such as when you buy a token in the [decentralized exchange](/docs/concepts/tokens/decentralized-exchange). In this case, the trust line uses entirely default settings.

## Going Above the Limit

There are three cases where you can hold a balance that is *greater* than your limit on that trust line:

1. When you acquire more of that token through [trading](/docs/concepts/tokens/decentralized-exchange).
2. When you decrease the limit on a trust line that has a positive balance.
3. When you acquire more of that token by [cashing a Check](/docs/concepts/payment-types/checks). _Added by the [CheckCashMakesTrustLine amendment](/resources/known-amendments#checkcashmakestrustline). (Enabled: 2023-01-23)_


## Trust Line Settings

In addition to the shared balance, each account has its own settings on the trust line, which consist of the following:

- The **Limit**, a number from 0 to the [maximum token amount](/docs/references/protocol/data-types/currency-formats). Payments and other accounts' actions cannot cause the trust line's balance (from this account's perspective) to go over the limit. The default is `0`.
- **Authorized**: A true/false value used with [Authorized Trust Lines](/docs/concepts/tokens/fungible-tokens/authorized-trust-lines) to allow the other side to hold tokens this account issues. The default is `false`. Once set to `true`, this cannot be changed back.
- **No Ripple**: A true/false value to control whether tokens can [ripple](/docs/concepts/tokens/fungible-tokens/rippling) through this trust line. The default depends on the account's "Default Ripple" setting; for new accounts, "Default Ripple" is off which means that `true` is the default for No Ripple. Usually, issuers should allow rippling and non-issuers should disable rippling unless they are using trust lines for community credit.
- **Freeze**: A true/false value indicating whether an [individual freeze](/docs/concepts/tokens/fungible-tokens/freezes#individual-freeze) is in effect on this trust line. The default is `false`.
- **DeepFreeze**: A true/false value indicating whether a [deep freeze](/docs/concepts/tokens/fungible-tokens/freezes#deep-freeze) is in effect on this trust line. The default is `false`.
- **Quality In** and **Quality Out** settings, which allow the account to value tokens issued by the other account on this trust line at less (or more) than face value. For example, if a stablecoin issuer charges a 3% fee for withdrawing tokens for the equivalent off-ledger assets, you could use these settings to value those tokens at 97% of face value. The default, `0`, represents face value.


## Properties

Unlike XRP or MPTs, trust line tokens always exist in *trust lines*, and all transfers move along trust lines. You cannot cause someone else's account to hold more of a token than the *limit* configured on their trust line. (You *can* cause your own trust line to go over the limit, for example by buying more of it in the decentralized exchange or by decreasing the limit after you already have a positive balance.)

Anyone can issue trust line tokens by sending a [Payment transaction](/docs/references/protocol/transactions/types/payment) if the necessary trust lines are in place. You can *burn* (destroy) tokens by sending them back to the issuer. In some cases, cross-currency payments or trades can also create more tokens according to an issuer's settings.

Issuers have options with tokens that are not available with XRP. Issuers can charge a [transfer fee](/docs/concepts/tokens/fungible-tokens/transfer-fees) that is automatically deducted when users transfer their tokens. Issuers can also define a [tick size](/docs/concepts/tokens/decentralized-exchange/ticksize) for exchanges rates involving their tokens. Both issuers and regular accounts can [freeze](/docs/concepts/tokens/fungible-tokens/freezes) trust lines, which limits how the tokens in those trust lines can be used.

Settings such as the transfer fee, tick size, ability to freeze, and others are defined at the issuer's account level and apply to all trust line tokens they issue. For this reason, it is recommended to use a separate issuing account for each type of trust line token you issue, in case you need different settings.

Trust line tokens use decimal (base-10) math with 15 digits of precision and an exponent that allows them to express very large values (up to 9999999999999999 × 1080) and very small values (down to 1.0 × 10-81).

## Reserves and Deletion

Since a trust line occupies space in the ledger, [a trust line increases the XRP your account must hold in reserve](/docs/concepts/accounts/reserves). Either or both accounts in the trust line may be charged the reserve for the trust line, depending on the status of the trust line: if any of your settings are not the default, or if you hold a positive balance, it counts as one item toward your owner reserve.

Generally, this means that the account that created the trust line is responsible for the reserve and the issuer is not. 

Trust lines are automatically deleted if both sides' settings are in the default state and the balance is 0. This means that, to delete a trust line, you need to:

1. Send a [TrustSet transaction](/docs/references/protocol/transactions/types/trustset) to set your settings to the defaults.
2. Offload any positive balance you have on the trust line. You could do this by sending a [payment](/docs/concepts/payment-types/cross-currency-payments), or by selling the currency in the [decentralized exchange](/docs/concepts/tokens/decentralized-exchange).


If your balance is negative (you are the issuer) or the other side's settings are not in the default state, you cannot cause the trust line to be totally deleted, but you can make it so that it does not count towards your owner reserve by following the same steps.

Since the **Authorized** setting cannot be turned off after it has been turned on, it does not count toward the trust line's default state.

### Free Trust Lines

[[Source]](https://github.com/XRPLF/rippled/blob/3c43f4614f87965298773279ff5b85d4c56c637b/src/libxrpl/tx/transactors/token/TrustSet.cpp#L347-L367)

Since trust lines are a powerful feature of the XRP Ledger, there is a special feature to make an account's first two trust lines "free".

When an account creates a new trust line, if the account owns at most 2 items in the ledger including the new line, the account's owner reserve is treated as zero instead of the normal amount. This allows the transaction to succeed even if the account does not hold enough XRP to meet the increased reserve requirement for owning objects in the ledger.

When an account owns 3 or more objects in the ledger, the full owner reserve applies.

## See Also

- **Concepts:**
  - [Decentralized Exchange](/docs/concepts/tokens/decentralized-exchange)
  - [Rippling](/docs/concepts/tokens/fungible-tokens/rippling)
- **References:**
  - [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines) - Look up trust lines attached to a given account
  - [gateway_balances method](/docs/references/http-websocket-apis/public-api-methods/account-methods/gateway_balances) - Look up an issuer's total balance issued
  - [RippleState object](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate) - The data format for trust lines in the ledger's state data.
  - [TrustSet transaction](/docs/references/protocol/transactions/types/trustset) - The transaction to create or modify trust lines.