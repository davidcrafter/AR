# iOS Info.plist keys required for AR Drawing Pro

After running `npx cap add ios`, add these keys to
`ios/App/App/Info.plist` **inside the outer `<dict>` element**.

These purpose strings appear in the iOS permission prompts and are
**mandatory** for App Store approval — a missing or vague string is
the most common cause of instant rejection.

```xml
<key>NSCameraUsageDescription</key>
<string>AR Drawing Pro uses your camera so you can overlay reference images on paper and trace them by hand.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>AR Drawing Pro saves your recorded drawing videos to your Photos library.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>AR Drawing Pro can pick a reference image from your Photos library for tracing.</string>

<key>NSMicrophoneUsageDescription</key>
<string>AR Drawing Pro does not record microphone audio. This entry is only present because iOS bundles microphone permission with camera capture in some contexts.</string>

<key>UIRequiresFullScreen</key>
<true/>

<key>UISupportedInterfaceOrientations</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
</array>

<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>

<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```
