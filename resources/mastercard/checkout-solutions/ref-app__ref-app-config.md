# App Setup and Configuration
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-config/index.md

This article explains how to set up and configure the reference application so you can run it on your local machine.

## Getting Started {#getting-started}

Once you've downloaded and unzipped the app file, in your IDE select **File** , and then **Open**. For illustrative purposes, the steps in this article refer to both IntelliJ and VS Code as the IDE.

## Add API Keys {#add-api-keys}

To use the app with Mastercard Checkout Solutions APIs, you must provide your Signing Key and Payload Encryption Key. Mastercard uses signing keys to generate Authorization headers and authorize the incoming requests. Payload Encryption Keys are required to decrypt the incoming response payload returned by Mastercard. For information on how to create and get those keys, see the [API Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) tutorial.

### Signing Keys {#signing-keys}

To add your Signing Key:

1. Copy the downloaded **Signing Key** certificate (suffixed `.p12`) file to `./src/main/resources` and add the file name under `./src/main/resources/application.properties` to the following field:

   ```javascript
   signing.pkcs12KeyFile=
   ```

2. Get the Key Alias, Key Password, and Consumer Key details from the from Mastercard Connect Mastercard Checkout Solutions onboarding app in `./src/main/resources/application.properties`, and then update the signing key details accordingly.

   ```javascript
   signing.consumerKey=
   signing.keyAlias=
   signing.keyPassword=
   ```

### Payload Encryption Key {#payload-encryption-key}

To add your Payload Encryption Key:

1. Use the [default payload encryption key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-encryption-key/index.md) available through Mastercard Checkout Solutions onboarding app on Mastercard Connect or add a new payload encryption key. For more details on how to upload a payload encryption key, refer to [Add Payload Encryption Key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-encryption-key/index.md) in the API Keys tutorial.

2. Copy the Payload Encryption key alias .p12 file to `./src/main/resources` and update the file name in the following field under `./src/main/resources/application.properties`.

   ```javascript
   mastercard.encryption.pkcs12KeyFile=
   ```

3. To decrypt the incoming response payload returned by Mastercard, update the payload encryption keys details under `./src/main/resources/application.properties`.

   ```javascript
   mastercard.encryption.keyAlias=
   mastercard.encryption.keyPassword=
   ```

## Add SRC Identifiers {#add-src-identifiers}

To use the Mastercard Checkout Solutions APIs in Sandbox or Production, you need to complete the onboarding process and get the following SRC properties:

* SRC Client ID
* Service ID (not required for Click to Pay)
* SRC DPA ID (depending on your use case)

<br />

Update the ID's in the following fields under `./src/main/resources/application.properties`:

    SRC_CLIENT_ID='change-me'
    SERVICE_ID='change-me'
    SRC_DPA_ID=''

After you build the application, rather than updating these details in the application, add the values directly to the input fields on Form fields.

## YAML Specifications {#yaml-specifications}

The application will run with the included YAML specifications. If a newer version of the OpenAPI spec is available, download it from the [API Reference](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md) for the respective APIs and add them to your resources directory under `./src/main/resources/specifications`.

## Development Environments {#development-environments}

To switch between using Sandbox or Production environments, change the `production` value in `./src/main/resources/application.properties`:

* Production:

  ```javascript
  production=true
  ```

* Sandbox:

  ```javascript
  production=false
  ```

## Build the App {#build-the-app}

To build the app, complete the following steps, as relevant to your IDE:
1. Go to **File** , and then select **Project Structure**.
2. In the Project Structure window:
   1. Under **Project** , set the **SDK** to 17 or above.
   2. Under **Modules** , set the **Language level** to *17-sealed types, always-strict floating-point semantics* or above.
3. Click **Apply** , then **OK**.
4. In the Project panel, open the reference app folder.
5. Open the Maven (m) tool window from the right-side panel.
6. In the Maven window, expand the **reference-app folder** , and then **Lifecycle**.
7. To build the app, double-click **clean**.
8. When clean completes, double-click **compile**.

If the build is successful, you will get a `BUILD SUCCESS` message in the Run log window. If the build is not successful check for any missing credentials in the `application.properties` file.
1. When you open the app project folder, you may get a pop-up message asking which build tool you want to use. Select **Use Maven**.
2. If you installed the Spring Boot Dashboard, open the dashboard in the left navigation pane.
3. If you haven't installed the Spring Boot Dashboard, navigate to the application `.java` file under `./src/main/java/`.

## Run the App {#run-the-app}

Once you have successfully built the app, you have the option to run the app in your IDE. Alternatively, you can run it using the command prompt in your command-line interface (CLI).

### Run the App in an IDE {#run-the-app-in-an-ide}

1. In the Project panel, locate the app `.java` file in `.src/main/java/com.*`.
2. Double-click the application file to open it in the editor window.
3. To run the application, click **Run \[app file name\]**.
4. If warning messages display prompting you to enable annotation processing, accept the recommendations, clean and compile the app again, and then rerun the app.
If you installed the Spring Boot Dashboard, under **Apps** , click **Run**.

If you haven't installed the Spring Boot Dashboard:

1. In the Explorer panel, locate the app `.java` file in `.src/main/java/com.*`.
2. Double-click the application file to open it in the editor window.
3. To run the application, click **Run Java**.

### Run the App Using a CLI {#run-the-app-using-a-cli}

To build and run the code using Maven, run the following command:

    ./mvnw spring-boot:run

### Server Port {#server-port}

The server port is configured to 8080. If you wish to change the server port, update it in `./src/main/resources/application.properties`.

    server.port=8080

### Open the App in a Browser {#open-the-app-in-a-browser}

To access the Reference Application, use *localhost:8080* in your browser (or change the port accordingly). If the app is running successfully, you should see the home page of the relevant app.

## Next Steps {#next-steps}

Learn more about how to use the individual applications to test the related APIs and use cases.

* [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-ctp/index.md)
* [Secure Card on File](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-cof/index.md)
* [Guest Checkout Tokenization](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-gct/index.md)
