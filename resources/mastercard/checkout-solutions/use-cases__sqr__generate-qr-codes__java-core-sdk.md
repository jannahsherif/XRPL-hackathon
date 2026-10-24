# Java Core SDK
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/java-core-sdk/index.md

## Overview {#overview}

The table below provides a quick summary to get started with Java Core SDK.

| Audience | Libraries |
|----------|-----------|

* The digital wallet to parse and verify QR code content for web applications and Android applications.
* The acquirer/PSP to generate QR codes for web applications and Android applications

\|

<!-- -->

* [pushpayment-core-sdk-2.0.9.3-javadoc.jar](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/pushpayment-core-sdk-2.0.9.3-javadoc.jar) (168KB)
* [pushpayment-core-sdk-2.0.9.3.jar](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/pushpayment-core-sdk-2.0.9.3.jar) (74KB)

## Adding Dependencies with Gradle {#adding-dependencies-with-gradle}

Configure your build.gradle file to include the following:

```build.gradle
dependencies {
  implementation fileTree(dir: 'libs', include: ['*.jar'])
  implementation 'com.google.zxing:core:3.3.0' // This is a java library for generating Bitmap Image
}
```

## Usage {#usage}

### Generate QR Code {#generate-qr-code}

Use this function to generate a QR code:
**Java**

```Java
public void generateQRCode(){
  // construct the PushPaymentData object
  PushPaymentData pushPaymentData = new PushPaymentData();

  try {
    // Set required properties on push payment data e.g pushPaymentData.payloadFormatIndicator = "01"

    // Payload format indicator
    pushPaymentData.setPayloadFormatIndicator("01");

    // Point of initiation method
    pushPaymentData.setValue("01", "12");

    // Merchant category code
    pushPaymentData.setMerchantCategoryCode("1434");

    // Transaction currency code
    pushPaymentData.setTransactionCurrencyCode("156");

    // Transaction amount - Optional Tag
    pushPaymentData.setValue("54","100.8");

    // Country code
    pushPaymentData.setCountryCode("CN");

    // Merchant name
    pushPaymentData.setMerchantName("BEST TRANSPORT");

    // Merchant city
    pushPaymentData.setMerchantCity("BEIJING");

    // Postal code - Optional Tag
    pushPaymentData.setPostalCode("56748");

    // Additional data - Optional Tag
    AdditionalData addData = new AdditionalData();
    addData.setStoreId("A6008");
    addData.setLoyaltyNumber("***");
    addData.setTerminalId("A6008667");
    addData.setAdditionalDataRequest("ME");
    pushPaymentData.setAdditionalData(addData);

    // Mastercard Data (Tag 05)- Optional Tag
    MastercardData MastercardData = new MastercardData();
    String recipientIdCheckout = "6a2f41a3-c54c-fce8-32d2-0324e1c32e22";
    String srcDpaId = "123456789123456789123456789123456789";
    // Method setSRCID() of MastercardData tag object will add Sub Tag 04 (SRC ID) value in form recipientIdCheckout*srcDpaId
    MastercardData.setSRCID(recipientIdCheckout,srcDpaId);
    pushPaymentData.setMastercardData(MastercardData);

  } catch (Exception e) {
    System.out.println("Error occurred during creation of pushpaymentdata: " + e.getMessage());
  }

  try {
    String qrContent = pushPaymentData.generatePushPaymentString();
    Bitmap map = encodeToQrCode(qrContent);
    System.out.println("QR content : " + qrContent);
  } catch (Exception e) {
    // do something for the exception
  }
}

private Bitmap encodeToQrCode(String text) {
  QRCodeWriter writer = new QRCodeWriter();
  BitMatrix matrix;
  int width = 200;  // get desired QR code width
  int height = 200; // get desired QR code height

  try {
    Map<EncodeHintType, Object> hintMap = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
    hintMap.put(EncodeHintType.CHARACTER_SET, "UTF-8");     // for allowing Chinese characters
    matrix = writer.encode(text, BarcodeFormat.QR_CODE, width, height, hintMap);

  } catch (WriterException ex) {
    ex.printStackTrace();
    return null;
  }

  Bitmap bmp = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
  for (int x = 0; x < width; x++) {
    for (int y = 0; y < height; y++) {
      bmp.setPixel(x, y, matrix.get(x, y) ? Color.BLACK : Color.WHITE);
    }
  }

  return bmp;
}
```

Additional Secure Card on File QR indicators must be included in the QR code within the Mastercard Data Tag (Tag 05). An identifier for the acquirer/PSP (**recipientIdCheckout** ) and a merchant identifier (**srcDpaId** ) must be present within the SRCID (Sub Tag 04) in the Mastercard Data Tag (Tag 05), delimited with an asterisk '**\***'.

### Get Mastercard Data {#get-mastercard-data}

Use this function to retrieve the `MastercardData` (TAG_05_Mastercard_DATA) instance from a QR code string.

```Java
/**
 * Returns MastercardData instance at TAG05.
 *
 * @return value of MastercardData stored if it exists, null if it does not.
 */
public MastercardData getMastercardData() {
  Serializable data = getValue(PPTag.TAG_05_Mastercard_DATA);
  return data == null ? null : (MastercardData) data;
}
```

### Get Merchant Category Code {#get-merchant-category-code}

Use this function to retrieve the merchant category code (TAG_52) from a QR code string.

```Java
/**
 * Returns merchant category code.
 *
 * @return value of merchant category code
 */
public String getMerchantCategoryCode() {
  return getStringValue(PPTag.TAG_52_MERCHANT_CATEGORY_CODE);
}
```

### Get AdditionalData Value {#get-additionaldata-value}

Use this function to retrieve the additional data tag value (TAG_62) from a QR code string.

```Java
private void getAdditionalDataValueFromQRString(String qrCode){
  try {
    String additionalData =  Parser.getAdditionalDataValueFromQRString(qrCode);
    System.out.println(additionalData);
  } catch (Exception e){
    System.out.println(e.getMessage());
  }
}
```

### Parse QR Code Content {#parse-qr-code-content}

Use this function to parse QR code content. This function throws an exception when a QR code is not compliant with the EMVCo merchant presented QR specification.

```Java
private void parseQRCode(String code) {
  PushPaymentData qrcode;
  try {
    qrcode = Parser.parse(code);
    System.out.println(qrcode.dumpData());
  } catch (ConflictiveTagException e) {
    System.out.println("ConflictiveTagException : " + e);
  } catch (InvalidTagValueException e) {
    System.out.println("InvalidTagValueException : " + e);
  } catch (MissingTagException e) {
    System.out.println("MissingTagException : " + e);
  } catch (UnknownTagException e) {
    System.out.println("UnknownTagException : " + e);
  } catch (FormatException e) {
    System.out.println("FormatException : " + e);
  }
}
```

#### Parse QR Code Content with Validation Warning {#parse-qr-code-content-with-validation-warning}

Unlike the parseQRCode function above, this function will not throw an exception for InvalidTagValue, RFU Tag and Missing Tag. Instead, it returns a PushPaymentData object with a validation error when the scanned QR code is not compliant with the EMVCo Merchant Presented QR specification.

```Java
private void parseQRCodeWithWarnings(String code){
  try {
    PushPaymentData data = Parser.parseWithValidationWarnings(code);
    for (MPQRError error : data.validationErrors) {
      System.out.println("validation error : " + error.errorMessage);
      System.out.println("validation error tag : " + error.getErrorTag().getTag());
      System.out.println("validation error root tag : " + error.getErrorRootTag());
      System.out.println("validation error value : " + error.getErrorValue());
    }
  } catch (ConflictiveTagException e) {
    System.out.println("ConflictiveTagException : " + e);
  } catch (DuplicateTagException e) {
    System.out.println("InvalidTagValueException : " + e);
  } catch (UnknownTagException e) {
    System.out.println("UnknownTagException : " + e);
  } catch (FormatException e) {
    System.out.println("FormatException : " + e);
  }
}
```

