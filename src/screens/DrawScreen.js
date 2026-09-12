import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import OverlayImage from "../components/OverlayImage";
import ControlsBar from "../components/ControlsBar";
import { colors, radius, spacing } from "../theme";

/**
 * The tracing screen: a live camera preview with the reference image floating
 * on top. The user positions the overlay, locks it, and traces onto real paper.
 */
export default function DrawScreen({ imageUri, onBack }) {
  const [permission, requestPermission] = useCameraPermissions();

  const [opacity, setOpacity] = useState(0.5);
  const [locked, setLocked] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [facing, setFacing] = useState("back");
  const [resetKey, setResetKey] = useState(0);

  // Animated opacity so slider changes feel smooth on the overlay.
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const handleOpacityChange = (v) => {
    setOpacity(v);
    opacityAnim.setValue(v);
  };

  // ----- Permission states -------------------------------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          AR Drawing overlays your reference image on the live camera so you can
          trace it. Please grant camera access to continue.
        </Text>
        <TouchableOpacity
          style={styles.permButton}
          onPress={requestPermission}
          activeOpacity={0.9}
        >
          <Text style={styles.permButtonText}>Grant camera access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.permBack}>
          <Text style={styles.permBackText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ----- Main tracing UI ---------------------------------------------------
  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} facing={facing} />

      {imageUri ? (
        <OverlayImage
          key={resetKey}
          uri={imageUri}
          opacity={opacityAnim}
          locked={locked}
          flipped={flipped}
        />
      ) : null}

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.topButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.topButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>
            {locked ? "Locked" : "Positioning"}
          </Text>
        </View>
      </SafeAreaView>

      {/* Bottom controls */}
      <View style={styles.bottom} pointerEvents="box-none">
        <ControlsBar
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
          locked={locked}
          onToggleLock={() => setLocked((v) => !v)}
          flipped={flipped}
          onToggleFlip={() => setFlipped((v) => !v)}
          onReset={() => {
            // Remount the overlay (via key change) to reset its transform,
            // and restore default flip + opacity.
            setFlipped(false);
            handleOpacityChange(0.5);
            setResetKey((k) => k + 1);
          }}
          onFlipCamera={() =>
            setFacing((f) => (f === "back" ? "front" : "back"))
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  permIcon: { fontSize: 48, marginBottom: spacing.md },
  permTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  permBody: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  permButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  permButtonText: { color: colors.text, fontWeight: "800", fontSize: 16 },
  permBack: { marginTop: spacing.lg },
  permBackText: { color: colors.textMuted, fontSize: 15 },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  topButton: {
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  topButtonText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  topBadge: {
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  topBadgeText: { color: colors.accent, fontWeight: "700", fontSize: 13 },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
