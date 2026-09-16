# Android permissions required for AR Drawing Pro

After running `npx cap add android`, edit
`android/app/src/main/AndroidManifest.xml`:

## 1. Add these `<uses-permission>` entries above the `<application>` tag:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />

<!-- Save video to gallery -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

## 2. Also, in `android/app/build.gradle`:

Bump `targetSdkVersion` to 34 and `minSdkVersion` to 24 or higher.
Also make sure `compileSdkVersion` is 34.
