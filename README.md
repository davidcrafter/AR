# AR Drawing 🎨📱

A mobile app that helps you **trace any picture onto real paper**. Pick a
reference image, point your phone's camera at your sketchpad, and the app floats
a semi-transparent version of the image over the live camera feed. Position it,
lock it, and trace what you see.

This is the **V1 "simple overlay"** approach — the same technique the popular
"AR drawing" apps on the app stores use. The reference image is pinned on top of
the camera preview (rather than 3D-tracked to the paper), which keeps things
fast, reliable, and works on any phone.

Built with **React Native + Expo**.

---

## Features (V1)

- 📷 Live camera preview (rear or front camera)
- 🖼️ Pick a reference image from your photo library, or snap one with the camera
- 🔍 **Pinch to zoom**, **twist to rotate**, **drag to move** the overlay
- 🎚️ Adjustable overlay **opacity**
- 🔒 **Lock** the overlay so you don't nudge it while tracing
- ↔️ **Flip** the image horizontally (handy for mirror tracing)
- ↺ **Reset** position/size/rotation in one tap

---

## Project structure

```
ar-drawing-app/
├── App.js                     # Root: simple state-based navigation
├── index.js                   # Expo entry point
├── app.json                   # Expo config + camera/photo permissions
├── babel.config.js
├── package.json
└── src/
    ├── theme.js               # Colors, spacing, radius tokens
    ├── screens/
    │   ├── HomeScreen.js       # Pick image + start a tracing session
    │   └── DrawScreen.js       # Camera + overlay + controls
    └── components/
        ├── OverlayImage.js     # Draggable/pinchable/rotatable reference image
        ├── ControlsBar.js      # Bottom control panel
        └── Slider.js           # Dependency-free opacity slider
```

> **Design note:** to keep the app easy to build and run, the only native
> dependencies are `expo-camera` and `expo-image-picker`. Gestures, the slider,
> and navigation are implemented with core React Native — so there are no fragile
> version mismatches to fight.

---

## Prerequisites

- **Node.js 18+** and npm
- The **Expo Go** app on your phone (free, from the App Store / Play Store), or
  an iOS Simulator / Android Emulator
- A real device is strongly recommended — you need a working camera to trace.

---

## Setup & run

From the `ar-drawing-app/` folder:

```bash
# 1. Install dependencies
npm install

# 2. (Recommended) Align native package versions with your installed Expo SDK.
#    This auto-corrects expo-camera / expo-image-picker to the exact versions
#    that match your Expo version, so you never hit a compatibility warning.
npx expo install --fix

# 3. Start the dev server
npx expo start
```

Then:

- **On your phone:** open **Expo Go** and scan the QR code shown in the terminal
  (iPhone: scan with the Camera app; Android: scan from inside Expo Go).
- **On a simulator:** press `i` (iOS) or `a` (Android) in the terminal.

The first time you open the Draw screen, the app will ask for **camera**
permission — allow it. Picking a reference image will ask for **photo library**
permission.

---

## How to use it

1. On the **home screen**, tap **Choose from library** (or **Take a photo**) and
   select the picture you want to trace. Simple line art or high-contrast images
   work best.
2. Tap **Start tracing →**.
3. Prop your phone steadily above your paper (a stand or a stack of books helps).
4. **Drag** with one finger to move the overlay, **pinch** with two fingers to
   resize, and **twist** two fingers to rotate. Use the **Opacity** slider so you
   can see both the image and your paper.
5. Tap **Lock** 🔒 — this freezes the overlay and disables gestures so you won't
   move it by accident.
6. Trace what you see through the camera onto your paper. Tap **Unlock** any time
   to reposition.

---

## Troubleshooting

- **A dependency version warning on `expo start`** → run `npx expo install --fix`
  and restart. This reconciles `expo-camera` / `expo-image-picker` with your SDK.
- **Camera is black / permission denied** → enable Camera permission for Expo Go
  (or the app) in your phone's Settings, then reopen.
- **Nothing happens when picking an image** → make sure you granted photo
  library access; on iOS you can also choose "Selected Photos".
- **Overlay feels jumpy when switching between 1 and 2 fingers** → lift and place
  fingers together; the gesture re-centers on each new touch.

---

## Ideas for V2

- Save & reopen tracing "projects"
- Sketch/line-art filter to auto-convert photos into outlines
- Time-lapse recording of your drawing session
- Grid guides and true AR tracking (ARKit / ARCore) so the image sticks to the
  paper as you move the phone

---

Made with Kiro.
