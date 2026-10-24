# Build a Credential Issuing Service in Python

_Added by the [Credentials amendment](/resources/known-amendments#credentials). (Enabled: 2025-09-04)_

This tutorial demonstrates how to build and use a microservice that issues [Credentials](/docs/concepts/decentralized-storage/credentials) on the XRP Ledger, in the form of a RESTlike API, using the [Flask](https://flask.palletsprojects.com/) framework for Python.

## Setup

First, download the complete sample code for this tutorial from GitHub:

- Credential Issuing Service sample code


Then, in the appropriate directory, set up a virtual environment and install dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

This should install appropriate versions of Flask and xrpl-py.

To use the API that this microservice provides, you also need an HTTP client such as [Postman](https://www.postman.com/downloads/), [RESTED](https://github.com/RESTEDClient/RESTED), or [cURL](https://curl.se/).

## Overview

The Credential Issuer microservice, mostly implemented in `issuer_service.py`, provides a RESTlike API with the following methods:

| Method | Description |
|  --- | --- |
| `POST /credential` | Request that the issuer issue a specific credential to a specific account. |
| `GET /admin/credential` | List all credentials issued by the issuer's address, optionally filtering only for credentials that have or have not been accepted by their subject. |
| `DELETE /admin/credential` | Delete a specific credential from the XRP Ledger, which revokes it. |


Some of the methods have `/admin` in the path because they are intended to be used by the microservice's administrator. However, the sample code does not implement any authentication.

The sample code also contains a simple commmandline interface for a user account to accept a credential issued to it, as `accept_credential.py`.

The other files contain helper code that is used by one or both tools.

## Usage

### 1. Get Accounts

To use the credential issuing service, you need two accounts on the Devnet, where the Credentials amendment is already enabled. Go to the [XRP Faucets page](/resources/dev-tools/xrp-faucets) and select **Devnet**. Then, click the button to Generate credentials, saving the key pair (address and secret), twice. You will use one of these accounts as a **credential issuer** and the other account as the **credential subject** (holder), so make a note of which is which.

### 2. Start Issuer Service

To start the issuer microservice in dev mode, run the following command from the directory with the sample code:

```sh
flask --app issuer_service run
```

On macOS, you may need to specify a different port number because the Flask default port, `5000`, is used by the OS's **AirPlay Receiver** service. For example:

```sh
flask --app issuer_service run --port 5008
```

It should prompt you for your **issuer account** seed. Input the secret key you saved previously and press Enter.

The output should look like the following:

```txt
Issuer account seed: 
Starting credential issuer with XRPL address rJ6XzCCSapCaWZxExArkcBWLgJvT6bXCbV
 * Serving Flask app 'issuer_service'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

Double-check that the XRPL address displayed matches the address of the credential issuer keys you saved earlier.

### 3. Request Credential

To request a credential, make a request such as the following:

Summary
* HTTP method: `POST`
* URL: `http://localhost:5000/credential`
If you specified a different port when starting the service, change `:5000` in this and other examples to match the port you specified.
* Headers:
  * `Content-Type: application/json`
* Request Body:

```json
{
    "subject": "rGtnKx7veDhV9CgYenkiCV5HMLpgU2BfcQ",
    "credential": "TestCredential",
    "documents": {
        "reason": "please"
    }
}
```


cURL
```sh
curl -H "Content-Type: application/json" -X POST -d '{"subject": "rGtnKx7veDhV9CgYenkiCV5HMLpgU2BfcQ", "credential": "TestCredential", "documents": {"reason": "please"}}' http://localhost:5000/credential
```

The parameters of the JSON request body should be as follows:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `subject` | String - Address | Yes | The XRPL classic address of the subject of the credential. Set this to the address that you generated at the start of this tutorial for the credential holder account. |
| `credential` | String | Yes | The type of credential to issue. The example microservice accepts any string consisting of alphanumeric characters as well as the special characters underscore (`_`), dash (`-`), and period (`.`), with a minimum length of 1 and a maximum length of 64 characters. |
| `documents` | Object | Yes | As a credential issuer, you typically need to verify some confidential information about someone before you issue them a credential. As a placeholder, the sample code checks for a nested field named `reason` that contains the string `please`. |
| `expiration` | String - ISO8601 Datetime | No | The time after which the credential expires, such as `2025-12-31T00:00:00Z`. |
| `uri` | String | No | Optional URI data to store with the credential. This data will become public on the XRP Ledger. If provided, this must be a string with minimum length 1 and max length 256, consisting of only characters that are valid in URIs, which are numbers, letters, and the following special characters: `-._~:/?#[]@!$&'()*+,;=%`. Conventionally, it should link to a Verifiable Credential document as defined by the W3C. |


This microservice immediately issues any credential that the user requests. A successful response from the API uses the HTTP status code `201 Created` and has a response body with the result of submitting the transaction to the XRP Ledger. You can use the `hash` or `ctid` value from the response to look up the transaction using an explorer such as [https://devnet.xrpl.org/](https://devnet.xrpl.org/).

For a real credential issuer, you would probably check the credential type and only issue specific types of credentials, or maybe even just one type.  If checking the user's documents requires human intervention or takes longer than the amount of time an API request should wait to respond, you would need to store credential requests to some kind of storage, like an SQL database. You might also want to add a separate method for admins (or automated processes) to reject or issue the credential after checking the documents.

### 4. List Credentials

To show a list of credentials issued by the issuing account, make the following request:

Summary
* HTTP method: `GET`
* URL: `http://localhost:5000/admin/credential`
* Query parameters (optional): Use `?accepted=yes` to filter results to only credentials that the subject has accepted, or `?accepted=no` for credentials the user has not accepted.


cURL
```sh
curl http://localhost:5000/admin/credential
```

A response could look like the following:

```json
{
  "credentials": [
    {
      "accepted": false,
      "credential": "TestCredential",
      "subject": "rGtnKx7veDhV9CgYenkiCV5HMLpgU2BfcQ"
    }
  ]
}
```

In the response, each entry in the `credentials` array represents a Credential issued by the issuer account and stored in the blockchain. The details should match the request from the previous step, except that the `documents` are omitted because they are not saved on the blockchain.

### 5. Accept Credential

For a credential to be valid, the subject of the credential has to accept it. You can use `accept_credential.py` to do this:

```sh
python accept_credential.py
```

It should prompt you for your **subject account** seed. Input the secret key you saved previously and press Enter.

The script displays a list of Credentials that have been issued to your account and have not been accepted yet. Input the number that corresponds to the credential you want to accept, then press Enter. For example:

```txt
Accept a credential?
    0) No, quit.
    1) 'TestCredential' issued by rJ6XzCCSapCaWZxExArkcBWLgJvT6bXCbV
    2) 'AnotherTestCredential' issued by rJ6XzCCSapCaWZxExArkcBWLgJvT6bXCbV
Select an option (0-2): 1
```

The script signs and submits a transaction to accept the specified credential, and prints the output to the console. You can use the `hash` or `ctid` value to look up the transaction using an explorer.

### 6. Revoke Credential

To revoke an issued credential, make a request such as the following:

Summary
* HTTP method: `DELETE`
* URL: `http://localhost:5000/admin/credential`
* Headers:
  * `Content-Type: application/json`
* Request Body:

```json
{
    "subject": "rGtnKx7veDhV9CgYenkiCV5HMLpgU2BfcQ",
    "credential": "TestCredential"
}
```


cURL
```sh
curl -H "Content-Type: application/json" -X DELETE -d '{"subject": "rGtnKx7veDhV9CgYenkiCV5HMLpgU2BfcQ", "credential": "TestCredential"}' http://localhost:5000/admin/credential
```

The parameters of the JSON request body should be as follows:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `subject` | String - Address | Yes | The XRPL classic address of the subject of the credential to revoke. |
| `credential` | String | Yes | The type of credential to revoke. This must match a credential type previously issued. |


A successful response from the API uses the HTTP status code `200 OK` and has a response body with the result of submitting the transaction to the XRP Ledger. You can use the `hash` or `ctid` value from the response to look up the transaction using an explorer.

## Code Walkthrough

The code for this tutorial is divided among the following files:

| File | Purpose |
|  --- | --- |
| `accept_credential.py` | Commandline interface for a credential subject to look up and accept Credentials. |
| `credential_mode.py` | A model class for Credentials that validates user input, and maps between the microservice's simplified Credential format and the full XRPL representation of Credentials. |
| `decode_hex.py` | A helper function for decoding hexadecimal into human-readable strings, used by both the credential issuer and holder. |
| `issuer_service.py` | Defines the microservice as a Flask app, including API methods and error handling. |
| `look_up_credentials.py` | A helper function for looking up Credentials tied to an account, including pagination and filtering, used by both the credential issuer and holder. |


### accept_credential.py

This file is meant to be run as a commandline tool so it starts with a [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)), followed by dependencies grouped by type: standard lib, then PyPI packages, and local files last.

```py
#!/usr/bin/env python

from binascii import unhexlify
from os import getenv
from getpass import getpass

from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountObjects, AccountObjectType
from xrpl.models.transactions import CredentialAccept
from xrpl.transaction import submit_and_wait
from xrpl.utils import str_to_hex, datetime_to_ripple_time
from xrpl.wallet import Wallet, generate_faucet_wallet

from look_up_credentials import look_up_credentials
from decode_hex import decode_hex
```

It then defines the XRPL client and sets up a `Wallet` instance with the subject account's key pair, using a seed either passed as an environment variable or input as a password:

```py
XRPL_SERVER = "https://s.altnet.rippletest.net:51234/"

client = JsonRpcClient(XRPL_SERVER)

def init_wallet():
    seed = getenv("SUBJECT_ACCOUNT_SEED")
    if not seed:
        seed = getpass(prompt='Subject account seed: ',stream=None)
    if not seed:
        print("Please specify the subject's master seed")
        exit(1)
    return Wallet.from_seed(seed=seed)

wallet = init_wallet()
```

It looks up pending credentials using the `look_up_credentials(...)` function imported from `look_up_credentials.py`:

```py
pending_credentials = look_up_credentials(
        client, 
        subject=wallet.address, 
        accepted="no"
)
```

Next is a text menu that displays each of the unaccepted credentials returned by the lookup, as well as the option to quit:

```py
prompt = """
Accept a credential?
    0) No, quit."""
for i, cred in enumerate(pending_credentials):
    credential_type_s = decode_hex(cred["CredentialType"])
    prompt += f"\n    {i+1}) '{credential_type_s}' issued by {cred['Issuer']}"

selection = None
options = [str(n) for n in range(len(pending_credentials)+1)]
while selection not in options:
    selection = input(prompt+f"\n Select an option (0-{len(options)-1}): ")

if selection == "0":
    exit(0)
```

Finally, if the user picked a credential, the code constructs a [CredentialAccept transaction](/docs/references/protocol/transactions/types/credentialaccept), signs and submits it, and waits for it to be validated by consensus before displaying the result.

```py
chosen_cred = pending_credentials[int(selection)-1]
tx = CredentialAccept(
    account=wallet.address, 
    credential_type=chosen_cred["CredentialType"],
    issuer=chosen_cred["Issuer"]
)
print("Submitting transaction", tx)
response = submit_and_wait(tx, client=client, wallet=wallet, autofill=True)
print(response)
```

### issuer_service.py

This file defines the Flask app of the issuer microservice. It opens by importing dependencies, grouped into standard lib, PyPI dependencies, and lastly local files:

```py
from os import getenv
from getpass import getpass

from flask import Flask, jsonify, request

from xrpl.clients import JsonRpcClient
from xrpl.models.exceptions import XRPLModelException
from xrpl.models.requests import LedgerEntry
from xrpl.models.transactions import CredentialCreate, CredentialDelete
from xrpl.transaction import sign_and_submit
from xrpl.wallet import Wallet

from look_up_credentials import look_up_credentials, XRPLLookupError
from credential_model import Credential, CredentialRequest
```

It then defines the XRPL client and sets up a `Wallet` instance with the issuer account's key pair, using a seed either passed as an environment variable or input as a password:

```py
# Set up XRPL connection ------------------------------------------------------
def init_wallet():
    seed = getenv("ISSUER_ACCOUNT_SEED")
    if not seed:
        seed = getpass(prompt='Issuer account seed: ',stream=None)
    if not seed:
        print("Please specify the issuer's master seed")
        exit(1)
    return Wallet.from_seed(seed=seed)

wallet = init_wallet()
print("Starting credential issuer with XRPL address", wallet.address)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
```

Next, it creates the Flask app:

```py
# Define Flask app ------------------------------------------------------------
app = Flask(__name__)
```

After that come the definitions for the three API methods, starting with `POST /credential`. Users call this method to request a credential from the service. This method parses the request body as JSON and instantiates a `CredentialRequest` object—one of the data models defined in `credential_model.py`. If this succeeds, it uses the data to fill out a CredentialCreate transaction. Finally, it checks the transaction's [result code](/docs/references/protocol/transactions/transaction-results) to decide which HTTP response code to use:

```py
# Method for users to request a credential from the service -------------------
@app.route("/credential", methods=['POST'])
def request_credential():
    # CredentialRequest throws if the request is not validly formatted
    cred_request = CredentialRequest(request.json)
    # verify_documents() throws if the provided documents don't pass inspection
    cred_request.verify_documents()
    cred_xrpl = cred_request.to_xrpl()

    cc_response = sign_and_submit(CredentialCreate(
        account=wallet.address,
        subject=cred_xrpl.subject,
        credential_type=cred_xrpl.credential,
        uri=cred_xrpl.uri,
        expiration=cred_xrpl.expiration
    ), client=client, wallet=wallet, autofill=True)

    if cc_response.status != "success":
        raise XRPLTxError(cc_response)
    elif cc_response.result["engine_result"] == "tecDUPLICATE":
        raise XRPLTxError(cc_response, status_code=409)
    elif cc_response.result["engine_result"] != "tesSUCCESS":
        raise XRPLTxError(cc_response)

    response = jsonify(cc_response.result)
    response.status_code = 201
    return response
```

The next API method is `GET /admin/credential`, which looks up credentials issued by the service. It uses the `look_up_credentials(...)` method defined in `look_up_credentials.py` to get a list of credentials. It uses the `Credential` data model, imported from `credential_model.py`, to transform each ledger entry from the XRP Ledger format to the simplified representation the microservice uses.

```py
# Method for admins to look up all credentials issued -------------------------
@app.route("/admin/credential")
def get_credentials():
    # ?accepted=yes|no|both query parameter - the default is "both"
    filter_accepted = request.args.get("accepted", "both").lower()

    credentials = look_up_credentials(
            client,
            issuer=wallet.address, 
            accepted=filter_accepted
    )
    response = {
        "credentials": [Credential.from_xrpl(c).to_dict() for c in credentials]
    }
    return response
```

The final API method, `DELETE /admin/credential`, deletes a Credential from the ledger, revoking it. This again uses the `Credential` data model to validate user inputs and translate them into XRPL format where necessary. After that, it attempts to look up the Credential in the ledger and returns an error if it doesn't exist. This way, the issuer doesn't have to pay the cost of sending a transaction that would fail. Finally, the method checks the transaction result code and sets the HTTP response code accordingly.

```py
# Method for admins to revoke an issued credential ----------------------------
@app.route("/admin/credential", methods=['DELETE'])
def delete_credential():
    del_request = Credential(request.json)

    # To save on transaction fees, check if the Credential
    # exists on ledger before attempting to delete it.
    xrpl_response = client.request(LedgerEntry(credential={
        "subject": del_request.subject,
        "issuer": wallet.address,
        "credential_type": del_request.to_xrpl().credential
    }))
    if (xrpl_response.status != "success" and 
            xrpl_response.result["error"] == "entryNotFound"):
        response = jsonify({
            "error": "entryNotFound",
            "error_message": (f"Credential doesn't exist for subject "
                              f"'{del_request.subject} and credential type "
                              f"'{del_request.credential}'")
        })
        response.status_code = 404
        return response

    cd_response = sign_and_submit(CredentialDelete(
        account=wallet.address,
        subject=del_request.subject,
        credential_type=del_request.to_xrpl().credential
    ), client=client, wallet=wallet, autofill=True)

    if cd_response.status != "success":
        raise XRPLTxError(cd_response)

    if cd_response.result["engine_result"] == "tecNO_ENTRY":
        # Usually this won't happen since we just checked for the credential,
        # but it's possible it got deleted since then.
        raise XRPLTxError(cd_response, status_code=404)
    elif cd_response.result["engine_result"] != "tesSUCCESS":
        raise XRPLTxError(cd_response)

    response = jsonify(cd_response.result)
    response.status_code = 200
    return response
```

Finally, the file ends by adding error handlers for a variety of errors that can be raised by the API methods, including in the data models or by xrpl-py's API methods:

```py
# Error handling --------------------------------------------------------------
class XRPLTxError(Exception):
    def __init__(self, xrpl_response, status_code=400):
        self.body = xrpl_response.result
        self.status_code = status_code

@app.errorhandler(XRPLTxError)
def handle_tx_error(e):
    response = jsonify(e.body)
    response.status_code = e.status_code
    return response

@app.errorhandler(XRPLLookupError)
def handle_xrpl_error(e):
    response = jsonify(e.body)
    response.status_code = 400
    return response

@app.errorhandler(ValueError)
def handle_value_error(e):
    response = jsonify({
        "error": "badRequest",
        "error_message": str(e)
    })
    response.status_code = 400
    return response

# Reuse the same handler for xrpl-py's model exceptions
app.register_error_handler(XRPLModelException, handle_value_error)

# Tip: Some of Flask's built-in errors return HTML, not JSON, by default. 
# If you want to configure those, you can import error cases like BadRequest 
# from werkzeug.exceptions and implement custom handlers.
```

### look_up_credentials.py

This file implements lookup of Credentials. Both the issuer code and the subject code use this function to look up their own credentials.

This code performs [pagination using markers](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) to get all the results from the ledger. It also filters results based on the issuer/subject account, so that lookup by issuer, for example, doesn't include credentials that someone else issued *to* the issuer account. Finally, it can optionally check the accepted status of the Credentials and only include ones that are or aren't accepted.

```py
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountObjects, AccountObjectType

lsfAccepted = 0x00010000

class XRPLLookupError(Exception):
    def __init__(self, xrpl_response):
        self.body = xrpl_response.result

def look_up_credentials(client:JsonRpcClient, 
                        issuer:str="", 
                        subject:str="", 
                        accepted:str="both"):
    """
    Looks up Credentials issued by/to a specified XRPL account, optionally
    filtering by accepted status. Handles pagination.
    """
    account = issuer or subject # Use whichever is specified, issuer if both
    if not account:
        raise ValueError("Must specify issuer or subject")
    
    accepted = accepted.lower()
    if accepted not in ("yes","no","both"):
        raise ValueError("accepted must be str 'yes', 'no', or 'both'")

    credentials = []
    has_more_pages = True
    marker = None
    while has_more_pages:
        xrpl_response = client.request(AccountObjects(
            account=account,
            type=AccountObjectType.CREDENTIAL,
            marker=marker
        ))
        if xrpl_response.status != "success":
            raise XRPLLookupError(xrpl_response)

        for obj in xrpl_response.result["account_objects"]:
            # Skip credentials that aren't issued to/by the requested address.
            if issuer and obj["Issuer"] != issuer:
                continue
            if subject and obj["Subject"] != subject:
                continue
            # Skip credentials that don't match the specified accepted status
            cred_accepted = obj["Flags"] & lsfAccepted
            
            if accepted == "yes" and not cred_accepted:
                continue
            if accepted == "no" and cred_accepted:
                continue
            credentials.append(obj)
        
        marker = xrpl_response.result.get("marker")
        if not marker:
            has_more_pages = False
    
    return credentials
```

### decode_hex.py

This file implements conversion of hex strings to human-readable text using ASCII, where possible. If the hex can't be decoded, it returns the original text prefaced with `(BIN) ` as a graceful fallback instead of throwing an error. This is important when reading data from the XRP Ledger because other users and tools can create Credentials with arbitrary binary data which might not decode to actual text at all. Even though the microservice from this tutorial only creates Credentials that use a restricted subset of ASCII characters, it might need to read ledger data that was created with different tools and different rules. You might even want to put more restrictions or checks in place depending on how you use the data; for example, if you output the results to a webpage you should make sure to escape or strip HTML tags to avoid visual glitches or cross-site-scripting attacks.

```py
from binascii import unhexlify

def decode_hex(s_hex):
    """
    Try decoding a hex string as ASCII; return the decoded string on success,
    or the un-decoded string prefixed by '(BIN) ' on failure.
    """
    try:
        s = unhexlify(s_hex).decode("ascii")
        # Could use utf-8 instead, but it has more edge cases.
        # Optionally, sanitize the string for display before returning
    except:
        s = "(BIN) "+s_hex
    return s
```

### credential_model.py

This file implements the simplified "Credential" data model that the issuer microservice uses to represent credentials. It performs validation of user input and conversion between formats.

The file starts with importing dependencies grouped by type:

```py
import re
from datetime import datetime

from xrpl.core.addresscodec import is_valid_classic_address
from xrpl.utils import ripple_time_to_datetime, datetime_to_ripple_time, str_to_hex

from decode_hex import decode_hex
```

It then has a function to validate the credential type, using a regular expression that checks the length and characters used:

```py
def is_allowed_credential_type(credential_type: str):
    """
    Returns True if the specified credential type is one that this service
    issues, or False otherwise.
    
    XRPL credential types can be any binary data; this service issues
    any credential that can be encoded from the following ASCII chars:
    alphanumeric characters, underscore, period, and dash.
    (min length 1, max 64)

    You might want to further limit the credential types, depending on your 
    use case; for example, you might only issue one specific credential type.
    """
    CREDENTIAL_REGEX = re.compile(r'^[A-Za-z0-9_\.\-]{1,64}$')
    if CREDENTIAL_REGEX.match(credential_type):
        return True
    return False
```

It uses a similar function to validate user-provided URI values:

```py
def is_allowed_uri(uri):
    """
    Returns True if the specified URI is acceptable for this service, or
    False otherwise.

    XRPL Credentials' URI values can be any binary data; this service
    adds any user-requested URI to a Credential as long as the URI
    can be encoded from the characters usually allowed in URIs, namely
    the following ASCII chars:

    alphanumeric characters (upper and lower case)
    the following symbols: -._~:/?#[]@!$&'()*+,;=%
    (minimum length 1 and max length 256 chars)

    You might want to instead define your own URI and attach it to the
    Credential regardless of user input, or you might want to verify that the
    URI points to a valid Verifiable Credential document that matches the user.
    """
    URI_REGEX = re.compile(r"^[A-Za-z0-9\-\._~:/\?#\[\]@!$&'\(\)\*\+,;=%]{1,256}$")
    if URI_REGEX.match(uri):
        return True
    return False
```

The main export of this file is the `Credential` class. Most of the methods use this class, or a class derived from it, to read user input from the API.

```py
class Credential:
    """
    A credential object, in a simplified format for our API.
    The constructor performs parameter validation. Attributes:
    subject (str): the subject of the credential, as a classic address
    credential (str): the credential type, in human-readable (ASCII) chars
    uri (str, optional): URI of the credential in human-readable (ASCII) chars
    expiration (datetime, optional): time when the credential expires
                            (displayed as an ISO 8601 format string in JSON)
    accepted (bool, optional): true if this credential has been accepted
                               on the XRPL by the subject account.
                               False if not accepted. 
                               Omitted for credentials that haven't been 
                               issued yet.
    """
```

The default constructor for the Credential class checks that user input meets various requirements. It uses the `dict.get(key)` method, which returns `None` instead of raising an error when the key doesn't exist, to set optional fields to `None`. It also parses the user-provided timestamp from a string to a native Python `datetime` object if necessary.

```py
    def __init__(self, d: dict):
        self.subject = d.get("subject")
        if type(self.subject) != str:
            raise ValueError("Must provide a string 'subject' field")
        if not is_valid_classic_address(self.subject):
            raise ValueError(f"subject not valid address: '{self.subject}'")

        self.credential = d.get("credential")
        if type(self.credential) != str:
            raise ValueError("Must provide a string 'credential' field")

        if not is_allowed_credential_type(self.credential):
            raise ValueError(f"credential not allowed: '{self.credential}'.")

        self.uri = d.get("uri")
        if self.uri is not None and (
                type(self.uri) != str or not is_allowed_uri(self.uri)):
            raise ValueError(f"URI isn't valid: {self.uri}")

        exp = d.get("expiration")
        if exp:
            if type(exp) == str:
                self.expiration = datetime.fromisoformat(exp)
            elif type(exp) == datetime:
                self.expiration = exp
            else:
                raise ValueError(f"Unsupported expiration format: {type(exp)}")
        else:
            self.expiration = None
        
        self.accepted = d.get("accepted")
```

The `from_xrpl(...)` class method is an alternate constructor for the Credential class. It takes a dictionary in the XRP Ledger's native format and decodes it to the native Python formats the Credential class expects (for example, converting the `credential` field from hexadecimal to a native string). The API methods that read data from the XRP Ledger use this constructor so that their output is formatted the same way as user input in the other API methods.

```py
    @classmethod
    def from_xrpl(cls, xrpl_d: dict):
        """
        Instantiate from a Credential ledger entry in the XRPL format.
        """
        d = {
            "subject": xrpl_d["Subject"],
            "credential": decode_hex(xrpl_d["CredentialType"]),
            "accepted": bool(xrpl_d["Flags"] & 0x00010000) # lsfAccepted
        }
        if xrpl_d.get("URI"):
            d["uri"] = decode_hex(xrpl_d["URI"])
        if xrpl_d.get("Expiration"):
            d["expiration"] = ripple_time_to_datetime(xrpl_d["Expiration"])
        return cls(d)
```

The `to_dict(self)` method builds a dictionary representation for the Credential object, which can then be returned by the API as JSON. It converts from a `datetime` back to an ISO 8601 string and omits optional fields instead of including them with a `None` or `null` value.

```py
    def to_dict(self):
        d = {
            "subject": self.subject,
            "credential": self.credential,
        }
        if self.expiration is not None:
            d["expiration"] = self.expiration.isoformat()
        if self.uri:
            d["uri"] = self.uri
        if self.accepted is not None:
            d["accepted"] = self.accepted
        return d
```

The `to_xrpl(self)` method returns a different class of object, `XrplCredential`, which is formatted for submitting to the XRP Ledger:

```py
    def to_xrpl(self):
        """
        Return an object with parameters formatted for the XRPL
        """
        return XrplCredential(self)
```

The implementation of `XrplCredential` performs the necessary conversions in its constructor:

```py
class XrplCredential:
    """
    A Credential object, in a format closer to the XRP Ledger representation.
    Credential type and URI are hexadecimal;
    Expiration, if present, is in seconds since the Ripple Epoch.
    """
    def __init__(self, c:Credential):
        self.subject = c.subject
        self.credential = str_to_hex(c.credential)
        if c.expiration:
            self.expiration = datetime_to_ripple_time(c.expiration)
        else:
            self.expiration = None

        if c.uri:
            self.uri = str_to_hex(c.uri)
        else:
            self.uri = None
```

Finally, the `CredentialRequest` class inherits from the `Credential` class but checks for an additional field, `documents`. For a realistic credential issuer, you might require the user to provide specific documents in the request body, like a photo of their government-issued ID or a cryptographically signed message from another business, which your code would check. For this tutorial, the check is only a placeholder:

```py
class CredentialRequest(Credential):
    """
    Request from user to issue a credential on ledger.
    The constructor performs parameter validation.
    """
    def __init__(self, cred_request):
        super().__init__(cred_request)
        # As a credential issuer, you typically need to verify some information
        # about someone before you issue them a credential. For this example,
        # the user passes relevant information in a documents field of the API
        # request. The documents are kept confidential, off-chain.
        self.documents = cred_request.get("documents")
    
    def verify_documents(self):
        # This is where you would check the user's documents to see if you
        # should issue the requested Credential to them.
        # Depending on the type of credentials your service needs, you might
        # need to implement different types of checks here.
        if not self.documents:
            raise ValueError(f"you must provide a non-empty 'documents' field")
        
        # As a placeholder, this example checks that the documents field
        # contains a string field named "reason" containing the word "please"
        if type(self.documents.get("reason")) != str:
            raise ValueError(f"documents must contain a 'reason' string")
        if "please" not in self.documents["reason"].lower():
            raise ValueError(f"reason must include 'please'")
        
        return True
```

## Next Steps

Using this service as a base, you can extend the service with more features, such as:

- Security/authentication to protect API methods from unauthorized use.
- Actually checking user documents to decide if you should issue a credential.


Alternatively, you can use credentials to for various purposes, such as:

- Define a [Permissioned Domain](/docs/concepts/tokens/decentralized-exchange/permissioned-domains) that uses your credentials to grant access to features on the XRP Ledger.
- [Verify credentials](/docs/tutorials/compliance-features/verify-credentials) manually to grant access to services that exist off-ledger.