import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Slider from "./Slider";
import { colors, radius, spacing } from "../theme";

/**
 * Bottom control panel for the Draw screen. Purely presentational — all state
 * lives in DrawScreen and is passed down here.
 */
export default function ControlsBar({
  opacity,
  onOpacityChange,
  locked,
  onToggleLock,
  flipped,
  onToggleFlip,
  onReset,
  onFlipCamera,
  onSave,
}) {
  return (
    <View style={styles.container}>
      {!locked && (
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Opacity</Text>
          <View style={styles.sliderWrap}>
            <Slider
              value={opacity}
              min={0.05}
              max={1}
              onChange={onOpacityChange}
            />
          </View>
          <Text style={styles.sliderValue}>{Math.round(opacity * 100)}%</Text>
        </View>
      )}

      {onSave && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>💾 Save project</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonRow}>
        <IconButton
          label={locked ? "Unlock" : "Lock"}
          icon={locked ? "🔒" : "🔓"}
          highlighted={locked}
          onPress={onToggleLock}
        />
        {!locked && (
          <>
            <IconButton
              label="Flip"
              icon="↔️"
              highlighted={flipped}
              onPress={onToggleFlip}
            />
            <IconButton label="Reset" icon="↺" onPress={onReset} />
            <IconButton label="Camera" icon="🔄" onPress={onFlipCamera} />
          </>
        )}
      </View>

      {locked && (
        <Text style={styles.lockedHint}>
          Overlay locked — trace away. Tap Unlock to adjust.
        </Text>
      )}
    </View>
  );
}

function IconButton({ label, icon, onPress, highlighted }) {
  return (
    <TouchableOpacity
      style={[styles.iconButton, highlighted && styles.iconButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.iconButtonIcon}>{icon}</Text>
      <Text style={styles.iconButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sliderLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
    width: 58,
  },
  sliderWrap: { flex: 1, marginHorizontal: spacing.sm },
  sliderValue: {
    color: colors.textMuted,
    fontSize: 13,
    width: 44,
    textAlign: "right",
  },
  saveButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  saveButtonText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minWidth: 66,
  },
  iconButtonActive: {
    backgroundColor: colors.primary,
  },
  iconButtonIcon: { fontSize: 20, marginBottom: 2 },
  iconButtonLabel: { color: colors.text, fontSize: 12, fontWeight: "600" },
  lockedHint: {
    color: colors.text,
    textAlign: "center",
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
