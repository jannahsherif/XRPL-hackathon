# iOS QR Scan SDK
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/ios-qr-scan-sdk/index.md

## Overview {#overview}

iOS Core SDK provides the core functionality to parse and generate the content of the QR code, whereas iOS QR Scan SDK helps you create a UI component to scan the QR code.

## Installation (Same for Objective-C and Swift) {#installation-same-for-objective-c-and-swift}

1. Download the latest release of MPQR Scan SDK. [MPQRScanSDK.xcframework.zip](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/uploads/MPQRScanSDK.xcframework.zip) (527KB)
2. Unzip the file and place it in the project folder.
3. Go to Xcode projects General settings. Add MPQRScanSDK.xcframework in Frameworks, Libraries and Embedded content.

## Usage {#usage}

### Subclass of QRCodeReaderViewController {#subclass-of-qrcodereaderviewcontroller}

* Swift
* Objective-C

```Swift
import UIKit
import MPQRScanSDK

class QRCodeReaderViewControllerSubClass: QRCodeReaderViewController {

  override func setupUIComponents(withCancelButtonTitle cancelButtonTitle: String?, cameraView: QRCodeReaderView?) {
    if let cameraView = cameraView {
      self.cameraView = cameraView;
    }else
    {
      self.cameraView = QRCodeReaderView()
    }

    // Customized Camera view
    let overlayView = self.cameraView!.getOverlay()
    overlayView.cornerColor = UIColor.green
    overlayView.cornerWidth = 6
    overlayView.cornerLength = 75
    overlayView.indicatorSize = CGSize(width: 250, height: 250)
    view.addSubview(self.cameraView!)

    // Customized Cancel Button
    if cancelButtonTitle != nil, self.showCancelButton {
      self.cancelButton = UIButton.init();
      if let cancelButton = self.cancelButton {
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        // Developer can customize image, title and other attributes for button
        cancelButton.setTitle(cancelButtonTitle, for: .normal)
        cancelButton.setTitleColor(UIColor.yellow, for: .normal)
        cancelButton.addTarget(self, action: #selector(clickedCancel), for: .touchUpInside)
        view.addSubview(cancelButton)
      }
    }

    // Customize Toggle Torch Button
    if showTorchButton == true, codeReader?.isTorchAvailable() == true {
      self.toggleTorchButton = UIButton.init()
      if let toggleTorchBtn = self.toggleTorchButton {
        toggleTorchBtn.translatesAutoresizingMaskIntoConstraints = false
        // Developer can customize image, title and other attributes for button
        toggleTorchBtn.setImage(UIImage.init(named: "torchBtn"), for: .normal)
        toggleTorchBtn.addTarget(self, action: #selector(clickedToggleTorch), for: .touchUpInside)
        view.addSubview(toggleTorchBtn)
    }
  }
}

// Handle Cancel button click event
@objc private func clickedCancel() {
  self.dismiss(animated: true, completion: nil)
}

// Handle Toggle torch button click event
@objc private func clickedToggleTorch() {
  codeReader?.toggleTorch()
}

override func setupAutoLayoutConstraints() {
  if self.cancelButton != nil {
    // view constraints if cancel button is present
    let views = ["cameraView":self.cameraView!, "cancelButton":self.cancelButton!]
    view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:|[cameraView][cancelButton(40)]|", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
    view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "H:|-50-[cameraView]-50-|", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
    view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "H:|-50-[cancelButton]-50-|", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
  }else{
    // view constraints if cancel button is absent
    let views = ["cameraView":self.cameraView!]
    view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:|-50-[cameraView]-50-|", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
    view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "H:|-50-[cameraView]-50-|", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
  }

    if self.toggleTorchButton != nil {
      // toggleTorchButton constraints for iOS 11+ and below
      if #available(iOS 11.0, *) {
        NSLayoutConstraint.activate([
          self.toggleTorchButton!.topAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.topAnchor, constant: 30),
          self.toggleTorchButton!.leadingAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.leadingAnchor, constant: 10)
        ])
      } else {
        let topLayoutGuide = self.topLayoutGuide;
        let views = ["toggleTorchButton":self.toggleTorchButton!, "topLayoutGuide": topLayoutGuide] as [String : Any]
        view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:[topLayoutGuide]-[toggleTorchButton(50)]", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
        view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "H:|[toggleTorchButton(70)]", options: NSLayoutConstraint.FormatOptions(rawValue: 0), metrics: nil, views: views))
      }
    }
  }
}
```

```Objective-C
#import <UIKit/UIKit.h>
#import <MPQRScanSDK/MPQRScanSDK.h>

@interface QRCodeReaderViewControllerSubClass : QRCodeReaderViewController

@end

@implementation QRCodeReaderViewControllerSubClass

#pragma mark - Overriden

- (void)setupUIComponentsWithCancelButtonTitle:(NSString *)cancelButtonTitle cameraView:(QRCodeReaderView *)cameraView{
  self.cameraView = cameraView;
  if (!self.cameraView) {
    self.cameraView = [[QRCodeReaderView alloc] init];
    self.cameraView.translatesAutoresizingMaskIntoConstraints = NO;
    self.cameraView.clipsToBounds = YES;
  }

  // Customized Camera view
  QRCodeReaderViewOverlay *overlayView = (QRCodeReaderViewOverlay *)[self.cameraView getOverlay];
  overlayView.cornerColor = UIColor.greenColor;
  overlayView.cornerWidth = 6;
  overlayView.cornerLength = 75;
  overlayView.indicatorSize = CGSizeMake(250, 250);
  [self.view addSubview:self.cameraView];

  // Customized Cancel Button
  if (self.showCancelButton) {
    self.cancelButton = [[UIButton alloc] init];
    self.cancelButton.translatesAutoresizingMaskIntoConstraints = NO;
    // Developer can customize image, title and other attributes for button
    [self.cancelButton setTitle:cancelButtonTitle forState:UIControlStateNormal];
    [self.cancelButton setTitleColor:[UIColor yellowColor] forState:UIControlStateNormal];
    [self.cancelButton addTarget:self action:@selector(clickedCancel) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview: self.cancelButton];
  }

  // Customize Toggle Torch Button
  if (self.showTorchButton) {
    self.toggleTorchButton = [[UIButton alloc] init];
    self.toggleTorchButton.translatesAutoresizingMaskIntoConstraints = NO;
    // Developer can customize image, title and other attributes for button
    [self.toggleTorchButton setImage:[UIImage imageNamed:@"torchBtn"] forState:UIControlStateNormal];
    [self.toggleTorchButton addTarget:self action:@selector(clickedToggleTorch) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview: self.toggleTorchButton];
  }
}

// Handle Cancel button click event
- (void)clickedCancel{
    [self dismissViewControllerAnimated:YES completion:nil];
}

// Handle Toggle torch button click event
- (void)clickedToggleTorch{
    [self.codeReader toggleTorch];
}

- (void)setupAutoLayoutConstraints
{
  if (self.cancelButton) {
    // view constraints if cancel button is present
    NSDictionary *views = [NSDictionary dictionaryWithObjectsAndKeys:self.cameraView, @"cameraView", self.cancelButton, @"cancelButton", nil];
    [self.view addConstraints:
     [NSLayoutConstraint constraintsWithVisualFormat:@"V:|[cameraView][cancelButton(40)]|" options:0 metrics:nil views:views]];
    [self.view addConstraints:
     [NSLayoutConstraint constraintsWithVisualFormat:@"H:|[cameraView]|" options:0 metrics:nil views:views]];
    [self.view addConstraints:
     [NSLayoutConstraint constraintsWithVisualFormat:@"H:|-[cancelButton]-|" options:0 metrics:nil views:views]];
  }else {
    // view constraints if cancel button is absent
    NSDictionary *views = [NSDictionary dictionaryWithObjectsAndKeys:@"cameraView", self.cameraView, nil];
    [self.view addConstraints:
     [NSLayoutConstraint constraintsWithVisualFormat:@"V:|[cameraView]|" options:0 metrics:nil views:views]];
    [self.view addConstraints:
     [NSLayoutConstraint constraintsWithVisualFormat:@"H:|[cameraView]|" options:0 metrics:nil views:views]];
  }

  if (self.toggleTorchButton != nil) {
    // toggleTorchButton constraints for iOS 11+ and below
    if (@available(iOS 11.0, *)) {
      [[[self.toggleTorchButton topAnchor] constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor constant:30] setActive: YES];
      [[[self.toggleTorchButton leadingAnchor] constraintEqualToAnchor:self.view.safeAreaLayoutGuide.leadingAnchor constant:10] setActive: YES];
    } else {
      id topLayoutGuide = self.topLayoutGuide;
      NSDictionary *torchViews = [NSDictionary dictionaryWithObjectsAndKeys:self.toggleTorchButton, @"toggleTorchButton", topLayoutGuide, @"topLayoutGuide", nil];
      [self.view addConstraints:
       [NSLayoutConstraint constraintsWithVisualFormat:@"V:[topLayoutGuide]-[toggleTorchButton(50)]" options:0 metrics:nil views:torchViews]];
      [self.view addConstraints:
       [NSLayoutConstraint constraintsWithVisualFormat:@"H:|[toggleTorchButton(70)]" options:0 metrics:nil views:torchViews]];
    }

  }
}
@end
```

