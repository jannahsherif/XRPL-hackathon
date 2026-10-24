# Android QR Scan SDK
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/android-qr-scan-sdk/index.md

## Overview {#overview}

The table below provides a quick summary to get started with Android QR Scan SDK.

| Audience | Libraries | Features |
|----------|-----------|----------|

* Originating Institutions and Wallet Providers use this SDK to scan the QR code and parse and verify the content in the Android application.
* This SDK uses the Java Core SDK to parse and verify the QR code content.

\| [qr-scan-sdk-release-1.0.4.aar](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/qr-scan-sdk-release-1.0.4.aar) (44KB) \|

* Can be used via Intents (little code required)
* Can be embedded in an Activity, for advanced customization of UI and logic
* Scanning can be performed in landscape or portrait mode
* The camera is managed in a background thread, for fast startup time
* Return constructed object for the correct Push Payment QR code

## Adding aar Dependency with Gradle {#adding-aar-dependency-with-gradle}

This library supports KitKat and later versions of Android (API level 19+).

1. Copy the qr-scan-sdk-release-1.0.4.aar located inside qr-scan-sdk-release-1.0.4.zip and pushpayment-core-sdk-2.0.9.3.jar into your project libs folder.
2. Configure your build.gradle file:

```build.gradle
repositories {
  flatDir {
    dirs 'libs'
  }
}

dependencies {
  implementation fileTree(dir: 'libs', include: ['*.jar'])
  implementation (name: 'qr-scan-sdk-release-1.0.4', ext: 'aar')
  implementation 'com.journeyapps:zxing-android-embedded:3.4.0'

  // Other dependencies  required by the android application
  // Note : Appcompat minimum version supported is v7:23.1.0
}

android {
  // Minimum version supported is 24.0.0. Older versions may give compile errors
  buildToolsVersion '29.0.3'
}
```

## Usage {#usage}

### With IntentIntegrator {#with-intentintegrator}

```Java
new PPIntentIntegrator(this).initiateScan(); // `this` is the current Activity

// Get the results:
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
  if (resultCode == RESULT_OK) {
    PushPaymentData qrcode = (PushPaymentData) data.getSerializableExtra(PPIntents.PUSH_PAYMENT_DATA);
    if (qrcode != null) {
      try {
        String qrString = qrcode.generatePushPaymentString();
        Toast.makeText(this, qrString, Toast.LENGTH_LONG).show();
      } catch (Exception e) {
        // do something for the exception
      }
    }
  } else if (resultCode == RESULT_CANCELED) {
    if (data != null) {
      FormatException e = (FormatException) data.getSerializableExtra(PPIntents.PARSE_ERROR); // get the exception reason
      if (e != null) {
          Toast.makeText(this, "Exception: "+e.getMessage(), Toast.LENGTH_LONG).show();
      }
      // you can also check if the partial QR code is returned, then grab any data you want from it
      PushPaymentData qrcode = (PushPaymentData) data.getSerializableExtra(PPIntents.PUSH_PAYMENT_DATA);
    }
  }
  super.onActivityResult(requestCode, resultCode, data);
}
```

### Layout and Function Customization {#layout-and-function-customization}

```Java
package com.mastercard.labs.sng.qrscantester;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

import com.google.zxing.client.android.Intents;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;
import com.mastercard.mpqr.pushpayment.scan.activity.PPCaptureActivity;


public class CustomizedCaptureActivity extends PPCaptureActivity {
  // you can define your own return code
  public static final int RESULT_OK_WITH_MERCHANT_ID = 15;
  public static final String MERCHANT_ID_INTENT = "MERCHANT_ID_INTENT";

  private EditText merchantIdEditText;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // add ref to your new element
    merchantIdEditText = (EditText) findViewById(R.id.edit_merchant_id);
  }

  @Override
  protected DecoratedBarcodeView initializeContent() {
    // specify the new customized layout
    this.setContentView(R.layout.activity_pp_capture_customized);
    return (DecoratedBarcodeView)this.findViewById(com.mastercard.mpqr.pushpayment.scan.R.id.zxing_barcode_scanner);
  }

  // you can bind your new event
  public void onOKPressed(View view) {
    String merchantId = merchantIdEditText.getText().toString();
    Intent intent = new Intent(Intents.Scan.ACTION);
    intent.putExtra(MERCHANT_ID_INTENT, merchantId);
    this.setResult(RESULT_OK_WITH_MERCHANT_ID, intent);
    finish();
  }

  @Override
  public void toggleTorch(View view) {
    super.toggleTorch(view);
  }

  @Override
  public void goBack(View view) {
    super.goBack(view);
  }
}
```

