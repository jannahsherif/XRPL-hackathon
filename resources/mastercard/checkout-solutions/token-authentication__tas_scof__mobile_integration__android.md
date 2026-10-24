# Android Implementation
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/tas_scof/mobile_integration/android/index.md

The mobile app must invoke the **Chrome Custom Tab** and display Integrator's web URL with a call-to-action (CTA) button when the consumer initiates checkout on their Android mobile app. The CTA button will trigger the Mastercard Authentication UI for Passkey enrollment and authentication.

The following representation shows the consumer's Passkey authentication during checkout on merchant's mobile app in their Android device.

![Chrome Custom Tab Sample Code](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/scof_chrome_7.png "Chrome Custom Tab session")

## Step 1: Consumer Selects Mastercard Secure Card on File for Checkout {#step-1-consumer-selects-mastercard-secure-card-on-file-for-checkout}

1. The consumer initiates checkout by selecting Secure Card on file on Merchant app that invokes Integrator's web session in [**Chrome Custom Tab**](https://developer.chrome.com/docs/android/custom-tabs).

## Step 2: Invoke Authentication UI and Checkout {#step-2-invoke-authentication-ui-and-checkout}

1. Integrator displays a Call-To-Action (CTA) button on the Chrome Custom Tab for launching the [Authentication UI](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md).
2. The Authentication UI initiates Passkey authentication process for the recognized consumer on a trusted device.
3. Consumer completes biometric authentication and Mastercard responds to the Integrator with `assuranceData` as proof of authentication.
4. Integrator completes the checkout with `assuranceData`, and consumer returns to the merchant app page.
5. Integrator displays successful order placement message to the consumer on the merchant app.

Diagram sfSafariViewController_2

## Chrome Custom Tab Sample Code {#chrome-custom-tab-sample-code}

Note:   

The integrator should implement the return-to-app functionality from the chrome custom tab by following Android recommended callback mechanism. They can use either a deep link or an app link, as outlined in Android documentation.  

* [Android Developer Documentation for Deep Links](https://developer.android.com/guide/navigation/design/deep-link)   
* [Android Developer Documentation for App Links](https://developer.android.com/training/app-links)
* InitiateIntent
* LaunchChromeCustomTab

```InitiateIntent
fun getCustomTabsIntent(uri: Uri): CustomTabsIntent { 

     //Provide customization if required by the application. 

     val intentCustomTabs = CustomTabsIntent.Builder() 
        .setDefaultColorSchemeParams(customTabBarColor) 
        .setDownloadButtonEnabled(false) 
        .setBookmarksButtonEnabled(false) 
        .setShareState(CustomTabsIntent.SHARE_STATE_OFF) 
        .setInstantAppsEnabled(false) 
        .setBackgroundInteractionEnabled(false) 
        .setInitialActivityHeightPx(heightInPx, CustomTabsIntent.ACTIVITY_HEIGHT_FIXED) 
        .build() 
     intentCustomTabs.intent.setData(uri) 
     return intentCustomTabs 

} 
```

```LaunchChromeCustomTab
//Launch Chrome Custom Tabs

@Composable
fun launchChromeCustomTabs(url: String){
  	val qualifiedUrl = Uri.parse(url)
    val launcher =
        rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            // Activity dismissal handler
        }
    
    launcher.launch(
        // Invoke the custom tabs intent to open Chrome custom tabs.
    getCustomTabsIntent(
        uri = qualifiedUrl
    ).intent)
}
```

