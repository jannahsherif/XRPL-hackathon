# Verify Credentials

This tutorial describes how to verify that an account holds a valid [credential](/docs/concepts/decentralized-storage/credentials) on the XRP Ledger, which has different use cases depending on the type of credential and the meaning behind it. A few possible reasons to verify a credential include:

- Confirming that a recipient has passed a background check before sending a payment.
- Checking a person's professional certifications, after verifying their identity with a [DID](/docs/concepts/decentralized-storage/decentralized-identifiers).
- Displaying a player's achievements in a blockchain-connected game.


## Goals

By following this tutorial, you should learn how to:

- Fetch a Credential entry from the ledger.
- Recognize if a credential has been accepted and when it has expired.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.
- Know the issuer, subject, and credential type of the credential you want to verify. For purposes of this tutorial, you can use sample values of data that exists in the public network.
  - For information on how to create your own credentials, see the [Build a Credential Issuing Service in JavaScript](/docs/tutorials/sample-apps/credential-issuing-service-in-javascript) (or [in Python](/docs/tutorials/sample-apps/credential-issuing-service-in-python)) tutorial.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

JavaScript
From the code sample folder, use `npm` to install dependencies:

```sh
npm i
```

Python
From the code sample folder, set up a virtual environment and use `pip` to install dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up client and define constants

To get started, import the client library and instantiate an API client. You also need to specify the details of the credential you want to verify. The sample code looks up a credential on Mainnet that is set to expire on January 1, 2038.

JavaScript
```js
import { Client, rippleTimeToISOTime, convertStringToHex } from "xrpl"

const client = new Client("wss://xrplcluster.com")
await client.connect()

const SUBJECT_ADDRESS = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"
const ISSUER_ADDRESS = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX"
const CREDENTIAL_TYPE = convertStringToHex("my_credential").toUpperCase()
```

Python
```py
from binascii import hexlify
from re import match

from xrpl.clients import JsonRpcClient
from xrpl.models.requests import LedgerEntry, Ledger
from xrpl.utils import ripple_time_to_datetime

client = JsonRpcClient("https://xrplcluster.com")
SUBJECT_ADDRESS = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"
ISSUER_ADDRESS = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX"
CREDENTIAL_TYPE = hexlify("my_credential".encode("utf-8")).decode("ascii").upper()
```

### 3. Look up the credential

Use the [ledger_entry method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_entry) to request the credential, using the latest validated ledger version. The response includes the [Credential entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential) as it is stored in the ledger.

If the request fails with an `entryNotFound` error, then the specified credential doesn't exist in the ledger. This could mean you got one of the values wrong or the credential has been deleted.

JavaScript
```js
// Look up Credential ledger entry --------------------------------------------
const ledgerEntryRequest = {
  command: "ledger_entry",
  credential: {
    subject: SUBJECT_ADDRESS,
    issuer: ISSUER_ADDRESS,
    credential_type: CREDENTIAL_TYPE,
  },
  ledger_index: "validated",
}
console.log("Looking up credential...")
console.log(JSON.stringify(ledgerEntryRequest, null, 2))

let xrplResponse
try {
  xrplResponse = await client.request(ledgerEntryRequest)
} catch (err) {
  if (err.data?.error === "entryNotFound") {
    console.error("Credential was not found")
  } else {
    console.error(err)
  }
  client.disconnect()
  process.exit(1)
}

const credential = xrplResponse.result.node
console.log("Found credential:")
console.log(JSON.stringify(credential, null, 2))
```

Python
```py
# Look up Credential ledger entry ----------------------------------------------
ledger_entry_request = LedgerEntry(
    credential={
        "subject": SUBJECT_ADDRESS,
        "issuer": ISSUER_ADDRESS,
        "credential_type": CREDENTIAL_TYPE,
    },
    ledger_index="validated",
)
print("Looking up credential...")
print(ledger_entry_request.to_dict())
try:
    xrpl_response = client.request(ledger_entry_request)
except Exception as err:
    print("Error: ledger_entry failed with error:", err)
    exit(1)

if xrpl_response.status != "success":
    if xrpl_response.result["error"] == "entryNotFound":
        print("Credential was not found")
        exit(1)
    # Other errors, for example invalidly-specified addresses.
    print("Unexpected error looking up credential:", xrpl_response.result)

credential = xrpl_response.result["node"]
print("Found credential:")
print(credential)
```

### 4. Check if the credential has been accepted

Since a credential isn't valid until the subject has accepted it, you need to check if the credential has been accepted to know if it's valid. The accepted status of a credential is stored as a flag in the `Flags` field, so you use the bitwise-AND operator to see if that particular flag is enabled.

JavaScript
```js
// Check if the credential has been accepted ----------------------------------
const lsfAccepted = 0x00010000
if (!(credential.Flags & lsfAccepted)) {
  console.log("Credential is not accepted.")
  client.disconnect()
  process.exit(2)
}
```

Python
```py
# Check if the credential has been accepted ------------------------------------
lsfAccepted = 0x00010000
if not credential["Flags"] & lsfAccepted:
    print("Credential is not accepted.")
    exit(2)
```

### 5. Check credential expiration

If the credential has an expiration time, you need to confirm that it has not passed, causing the credential to expire. As with all expirations in the XRP Ledger, expiration is compared with the official close time of the previous ledger, so use the [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger) to fetch the ledger header and compare against the close time.

If the credential does not have an expiration time, then it remains valid indefinitely.

JavaScript
```js
// Confirm that the credential is not expired ---------------------------------
if (credential.Expiration) {
  const expirationTime = rippleTimeToISOTime(credential.Expiration)
  console.log(`Credential has expiration: ${expirationTime}`)
  console.log("Looking up validated ledger to check for expiration.")

  let ledgerResponse
  try {
    ledgerResponse = await client.request({
      command: "ledger",
      ledger_index: "validated",
    })
  } catch (err) {
    console.error("Error looking up most recent validated ledger:", err)
    client.disconnect()
    process.exit(3)
  }

  const closeTime = rippleTimeToISOTime(ledgerResponse.result.ledger.close_time)
  console.log(`Most recent validated ledger was at: ${closeTime}`)

  if (new Date(closeTime) > new Date(expirationTime)) {
    console.log("Credential is expired.")
    client.disconnect()
    process.exit(4)
  }
}
```

Python
```py
# Confirm that the credential is not expired -----------------------------------
if credential.get("Expiration"):
    expiration_time = ripple_time_to_datetime(credential["Expiration"])
    print("Credential has expiration:", expiration_time.isoformat())
    print("Looking up validated ledger to check for expiration.")

    ledger_response = client.request(Ledger(ledger_index="validated"))
    if ledger_response.status != "success":
        print("Error looking up most recent validated ledger:", ledger_response.result)
        exit(3)
    close_time = ripple_time_to_datetime(ledger_response.result["ledger"]["close_time"])
    print("Most recent validated ledger was at:", close_time.isoformat())

    if close_time > expiration_time:
        print("Credential is expired.")
        exit(4)
```

### 6. Declare credential valid

If the credential has passed all checks to this point, it is valid. In summary, the checks were:

- The credential exists in the latest validated ledger.
- It has been accepted by the subject.
- It has not expired.


JavaScript
```js
// Credential has passed all checks -------------------------------------------
console.log("Credential is valid.")
client.disconnect()
```

Python
```py
# Credential has passed all checks. --------------------------------------------
print("Credential is valid.")
```

## Next Steps

Now that you know how to use `xrpl.js` to verify credentials, you can try building this or related steps together into a bigger project. For example:

- Incorporate credential verification into a [wallet application](/docs/tutorials/sample-apps/build-a-desktop-wallet-in-javascript).
- Issue your own credentials with a [credential issuing service](/docs/tutorials/sample-apps/credential-issuing-service-in-javascript).


## See Also

- **Concepts:**
  - [Credentials](/docs/concepts/decentralized-storage/credentials)
- **Tutorials:**
  - [Build a Credential Issuing Service in JavaScript](/docs/tutorials/sample-apps/credential-issuing-service-in-javascript)
  - [Build a Credential Issuing Service in Python](/docs/tutorials/sample-apps/credential-issuing-service-in-python)
- **References:**
  - API methods:
    - [ledger_entry method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_entry)
    - [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger)
  - Ledger entries:
    - [Credential entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential)