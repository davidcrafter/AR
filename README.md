# AR Drawing 🎨📱

A mobile app that helps you **trace any picture onto real paper**. Pick a
reference image, point your phone's camera at your sketchpad, and the app floats
a semi-transparent version of the image over the live camera feed. Position it,
lock it, and trace what you see.

This is the **"simple overlay"** approach — the same technique the popular
"AR drawing" apps on the app stores use. The reference image is pinned on top of
the camera preview (rather than 3D-tracked to the paper), which keeps things
fast, reliable, and works on any phone.

Built with **React Native + Expo**.

---

## Features

- 📷 Live camera preview (rear or front camera)
- 🖼️ Pick a reference image from your photo library, or snap one with the camera
- 🔍 **Pinch to zoom**, **twist to rotate**, **drag to move** the overlay
- 🎚️ Adjustable overlay **opacity**
- 🔒 **Lock** the overlay so you don't nudge it while tracing
- ↔️ **Flip** the image horizontally (handy for mirror tracing)
- ↺ **Reset** position/size/rotation in one tap
- 💾 **Save projects** — store an image with its exact position, size, rotation,
  opacity and flip, then reopen it later from the home screen
- 🎥 **Record your drawing** — capture the session to a video and save it to your
  phone's photo gallery

---

## Project structure

```
AR/
├── App.js                     # Root: state-based navigation + session
├── index.js                   # Expo entry point
├── app.json                   # Expo config + permissions
├── babel.config.js
├── package.json
└── src/
    ├── theme.js               # Colors, spacing, radius tokens
    ├── storage/
    │   └── projects.js         # Save/load/delete projects (file system)
    ├── screens/
    │   ├── HomeScreen.js        # Pick image, start session, list saved projects
    │   └── DrawScreen.js        # Camera + overlay + controls + record + save
    └── components/
        ├── OverlayImage.js      # Draggable/pinchable/rotatable reference image
        ├── ControlsBar.js       # Bottom control panel
        └── Slider.js            # Dependency-free opacity slider
```

> **Design note:** native dependencies are kept to a minimum — `expo-camera`
> (preview + recording), `expo-image-picker` (choose image), `expo-file-system`
> (save projects) and `expo-media-library` (save recordings to the gallery).
> Gestures, the slider, and navigation are all implemented with core React
> Native, so there are fewer version mismatches to fight.

---

## Prerequisites

- **Node.js 18+** and npm
- The **Expo Go** app on your phone (free, from the App Store / Play Store), or
  an iOS Simulator / Android Emulator
- A real device is strongly recommended — you need a working camera to trace.

---

## Setup & run

From the `AR/` folder:

```bash
# 1. Install dependencies
npm install

# 2. (Recommended) Align native package versions with your installed Expo SDK.
#    This auto-corrects expo-camera / expo-image-picker / expo-file-system /
#    expo-media-library to the exact versions that match your Expo version,
#    so you never hit a compatibility warning.
npx expo install --fix

# 3. Start the dev server
npx expo start
```

Then:

- **On your phone:** open **Expo Go** and scan the QR code shown in the terminal
  (iPhone: scan with the Camera app; Android: scan from inside Expo Go).
- **On a simulator:** press `i` (iOS) or `a` (Android) in the terminal.

The app requests permissions as needed: **camera** (tracing + recording),
**photo library** (choosing an image), and **add-to-gallery** (saving recordings).

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

### Saving a project 💾

Tap **Save project** on the Draw screen, give it a name, and it's stored with the
current position, size, rotation, opacity and flip. Reopen it any time from the
**Saved projects** list on the home screen — the overlay is restored exactly as
you left it. Swipe-free delete is available via the 🗑️ button on each project.

### Recording your drawing 🎥

Tap **● Record** (top-right on the Draw screen) to start capturing, and **◼ Stop**
to finish. The video is saved to your phone's photo gallery.

> **Note:** the recording captures the **camera feed** — i.e. your hand drawing
> on the paper — because the overlay is a screen layer, not part of the camera's
> video stream. So you get a clean video of the drawing appearing on paper. (A
> future enhancement could composite the overlay into the video via screen
> recording.)

---

## Troubleshooting

- **A dependency version warning on `expo start`** → run `npx expo install --fix`
  and restart. This reconciles the Expo packages with your installed SDK.
- **Camera is black / permission denied** → enable Camera permission for Expo Go
  (or the app) in your phone's Settings, then reopen.
- **Nothing happens when picking an image** → make sure you granted photo
  library access; on iOS you can also choose "Selected Photos".
- **Recording won't save** → grant the "add to photos / media" permission when
  prompted (Settings → the app → Photos).
- **Video recording is unreliable in Expo Go on some Android devices** → this is
  a known `expo-camera` limitation in Expo Go; a development build
  (`npx expo run:android`) is the most reliable way to test recording.
- **Overlay feels jumpy when switching between 1 and 2 fingers** → lift and place
  fingers together; the gesture re-centers on each new touch.

---

## Ideas for later

- Sketch/line-art filter to auto-convert photos into outlines
- Composite the overlay into recordings (screen-capture based)
- Grid guides and true AR tracking (ARKit / ARCore) so the image sticks to the
  paper as you move the phone

---

Made with Kiro.
