# iOS Core SDK
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/ios-core-sdk/index.md

## Overview {#overview}

iOS Core SDK only provides the core functionality to parse and generate the content of the QR code. The SDK is developed in Objective-C and it works with Swift.

The table below provides a quick summary to get started with iOS Core SDK.

| Audience | Installation (Same for Objective-C and Swift) |
|----------|-----------------------------------------------|

* The digital wallet to parse and verify QR code content for web applications and iOS applications.
* The acquirer/PSP to generate QR codes for web applications and iOS applications.

\|

1. Download the latest release of MPQR Scan SDK. [MPQRCoreSDK.xcframework.zip](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MPQRCoreSDK.xcframework.zip) (1MB)
2. Unzip the file and place it in the project folder.
3. Go to Xcode projects General settings. Add MPQRScanSDK.xcframework in Frameworks, Libraries and Embedded content.

## Usage {#usage}

### Generate QR Code {#generate-qr-code}

* Swift
* Objective-C

```Swift
import CoreImage

func generateQRCode(from string: String) -> UIImage? {
  let data = string.data(using: String.Encoding.utf8)

  if let filter = CIFilter(name: "CIQRCodeGenerator") {
    filter.setValue(data, forKey: "inputMessage")
    // Set scale according to your device display. If the qr code is blurry then increase scale
    let transform = CGAffineTransform(scaleX: 3, y: 3)

    if let output = filter.outputImage?.transformed(by: transform) {
        return UIImage(ciImage: output)
    }
  }
  return nil
}

func generatePushPaymentQR() {
  // Generate
  let pushPaymentData = PushPaymentData()

  // Payload format indicator
  pushPaymentData.payloadFormatIndicator = "01"

  // Point of initiation method
  pushPaymentData.pointOfInitiationMethod = "12"

  // Additional data
  let addData = AdditionalData()
  addData.storeId = "A6008"
  addData.loyaltyNumber = "***"
  addData.terminalId = "A6008667"
  addData.additionalConsumerDataRequest = "ME"
  pushPaymentData.additionalData = addData

  let mastercardData = MastercardData()
  let recipientIdCheckout = "623456a8-1c34-1b34-34b4-123abbc234ef"
  let srcDpaId = "123456a8-1c34-1b34-34b4-123abbc234ef"
  do {
    try mastercardData.setSRCID(recipientIdCheckout, withSrcDpaId: srcDpaId)
    try pushPaymentData.setMastercard(mastercardData)
  } catch {
    print("Error occurred while adding mastercardData \(error)")
  }

  // Merchant category code
  pushPaymentData.merchantCategoryCode = "1434"

  // Transaction currency code
  pushPaymentData.transactionCurrencyCode = "156"

  // Transaction amount
  pushPaymentData.transactionAmount = "83.80"

  // Country code
  pushPaymentData.countryCode = "CN"

  // Merchant name
  pushPaymentData.merchantName = "BEST TRANSPORT"

  // Merchant city
  pushPaymentData.merchantCity = "BEIJING"

  // Postal code
  pushPaymentData.postalCode = "56748"

  var qrCodeString: String?
  do {
    // Generate QR code string
    qrCodeString = try pushPaymentData.generatePushPaymentString()
    print("QR code string \(qrCodeString)")

    // Generate image
    let image = generateQRCode(from: qrCodeString!)
  } catch {
    print("Error occurred while generating QR code string \(error)")
    return
  }
}
```

```Objective-C
#import <MPQRCoreSDK/MPQRCoreSDK.h>

- (UIImage *)generateQRCode:(NSString *)string {
    NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
    CIFilter *filter = [CIFilter filterWithName:@"CIQRCodeGenerator"];
    if (!filter || !data)
        return nil;

    [filter setValue:data forKey:@"inputMessage"];
    CGAffineTransform transform = CGAffineTransformMakeScale(3, 3);
    CIImage *image = [[filter outputImage] imageByApplyingTransform:transform];
    return [UIImage imageWithCIImage:image];
}


-(void)generatePushPaymentQR{
    // Generate
    PushPaymentData *pushPaymentData = [[PushPaymentData alloc] init];

    // Payload format indicator
    pushPaymentData.payloadFormatIndicator = @"01";

    // Point of initiation method
    pushPaymentData.pointOfInitiationMethod = @"12";

    MPQRError* error;

    AdditionalData* addData = [AdditionalData new];
    addData.storeId = @"A6008";
    addData.loyaltyNumber = @"****";
    addData.terminalId = @"A6008667";
    addData.additionalConsumerDataRequest = @"ME";
    pushPaymentData.additionalData = addData;

    // MastercardData for tag 05
    MastercardData *masterCardData = [MastercardData new];
    NSString* srcDpaId = @"62345678-1234-1234-1234-123456781acf";
    NSString* recipientIdCheckout = @"12345678-1234-1234-1234-123456781acf";
    [masterCardData setSRCID:recipientIdCheckout withSrcDpaId:srcDpaId error:&error];
    if (!error) {
        [pushPaymentData setMastercardData:masterCardData error:&error];
    }

    // Merchant category code
    pushPaymentData.merchantCategoryCode = @"1434";

    // Transaction currency code
    pushPaymentData.transactionCurrencyCode = @"156";

    // Transaction amount
    pushPaymentData.transactionAmount = @"83.80";

    // Country code
    pushPaymentData.countryCode = @"CN";

    // Merchant name
    pushPaymentData.merchantName = @"BEST TRANSPORT";

    // Merchant city
    pushPaymentData.merchantCity = @"BEIJING";

    // Postal code
    pushPaymentData.postalCode = @"56748";

    NSString* strQRCode = [pushPaymentData generatePushPaymentString:&error];
    NSLog(@"QR code string: %@", strQRCode);
    if (error) {
        NSLog(@"Error: %@", error);
    } else {
        // Generate image
        UIImage *image = [self generateQRCode: strQRCode];
    }
}

```

