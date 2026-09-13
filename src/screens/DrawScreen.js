import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import OverlayImage from "../components/OverlayImage";
import ControlsBar from "../components/ControlsBar";
import { saveProject, newProjectId } from "../storage/projects";
import { colors, radius, spacing } from "../theme";

const DEFAULT_TRANSFORM = { tx: 0, ty: 0, scale: 1, rot: 0 };

/**
 * The tracing screen: a live camera preview with the reference image floating
 * on top. The user positions the overlay, locks it, and traces onto real paper.
 *
 * V2 additions:
 *   - Save the current session as a reusable project.
 *   - Record the drawing session to a video and save it to the photo gallery.
 *     (The recording captures the camera feed — your hand drawing on paper —
 *     since the overlay is a screen layer, not part of the camera stream.)
 */
export default function DrawScreen({
  imageUri,
  onBack,
  projectId: initialProjectId,
  initialName,
  initialTransform,
  initialOpacity,
  initialFlipped,
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();

  const [opacity, setOpacity] = useState(
    typeof initialOpacity === "number" ? initialOpacity : 0.5,
  );
  const [locked, setLocked] = useState(false);
  const [flipped, setFlipped] = useState(!!initialFlipped);
  const [facing, setFacing] = useState("back");
  const [resetKey, setResetKey] = useState(0);

  // Overlay transform bookkeeping.
  const [baseTransform, setBaseTransform] = useState(
    initialTransform || DEFAULT_TRANSFORM,
  );
  const currentTransform = useRef(initialTransform || DEFAULT_TRANSFORM);

  // Project saving.
  const [projectId, setProjectId] = useState(initialProjectId || null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [draftName, setDraftName] = useState(initialName || "");
  const [savingProject, setSavingProject] = useState(false);

  // Video recording.
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Animated opacity so slider changes feel smooth on the overlay.
  const opacityAnim = useRef(new Animated.Value(opacity)).current;
  const handleOpacityChange = (v) => {
    setOpacity(v);
    opacityAnim.setValue(v);
  };

  // Tick a timer while recording.
  useEffect(() => {
    if (!recording) {
      setElapsed(0);
      return undefined;
    }
    const started = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      500,
    );
    return () => clearInterval(id);
  }, [recording]);

  // ----- Recording ---------------------------------------------------------
  const saveRecording = async (uri) => {
    try {
      setSavingVideo(true);
      let perm = mediaPermission;
      if (!perm || !perm.granted) {
        perm = await requestMediaPermission();
      }
      if (!perm?.granted) {
        Alert.alert(
          "Permission needed",
          "Allow photo library access so your recording can be saved to your gallery.",
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(
        "Recording saved",
        "Your drawing video was saved to your photo gallery.",
      );
    } catch (e) {
      Alert.alert("Could not save recording", String(e?.message || e));
    } finally {
      setSavingVideo(false);
    }
  };

  const toggleRecord = async () => {
    if (!cameraRef.current || savingVideo) return;

    if (recording) {
      // Stops recording; the awaiting recordAsync promise below then resolves.
      cameraRef.current.stopRecording();
      return;
    }

    try {
      setRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 300 });
      setRecording(false);
      if (video?.uri) {
        await saveRecording(video.uri);
      }
    } catch (e) {
      setRecording(false);
      Alert.alert("Recording error", String(e?.message || e));
    }
  };

  // ----- Saving a project --------------------------------------------------
  const doSaveProject = async () => {
    try {
      setSavingProject(true);
      const id = projectId || newProjectId();
      const saved = await saveProject({
        id,
        name: draftName,
        imageUri,
        transform: currentTransform.current,
        opacity,
        flipped,
      });
      if (saved) {
        setProjectId(saved.id);
        setSaveModalVisible(false);
        Alert.alert(
          "Project saved",
          `"${saved.name}" was saved. You'll find it on the home screen.`,
        );
      } else {
        Alert.alert(
          "Could not save",
          "Something went wrong saving your project.",
        );
      }
    } finally {
      setSavingProject(false);
    }
  };

  const handleReset = () => {
    setFlipped(false);
    handleOpacityChange(0.5);
    setBaseTransform(DEFAULT_TRANSFORM);
    currentTransform.current = DEFAULT_TRANSFORM;
    setResetKey((k) => k + 1);
  };

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="video"
        mute
      />

      {imageUri ? (
        <OverlayImage
          key={resetKey}
          uri={imageUri}
          opacity={opacityAnim}
          locked={locked}
          flipped={flipped}
          initialTransform={baseTransform}
          onTransformChange={(t) => {
            currentTransform.current = t;
          }}
        />
      ) : null}

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.topButton}
          onPress={onBack}
          activeOpacity={0.8}
          disabled={recording}
        >
          <Text
            style={[styles.topButtonText, recording && styles.disabledText]}
          >
            ‹ Back
          </Text>
        </TouchableOpacity>

        {recording ? (
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC {formatElapsed(elapsed)}</Text>
          </View>
        ) : (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>
              {locked ? "Locked" : "Positioning"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.recButton, recording && styles.recButtonActive]}
          onPress={toggleRecord}
          activeOpacity={0.85}
          disabled={savingVideo}
        >
          {savingVideo ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.recButtonText}>
              {recording ? "◼ Stop" : "● Record"}
            </Text>
          )}
        </TouchableOpacity>
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
          onReset={handleReset}
          onFlipCamera={() =>
            setFacing((f) => (f === "back" ? "front" : "back"))
          }
          onSave={() => setSaveModalVisible(true)}
        />
      </View>

      {/* Save-project modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Save project</Text>
            <Text style={styles.modalSubtitle}>
              Saves this image with its current position, size, rotation and
              opacity so you can reopen it later.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Project name"
              placeholderTextColor={colors.textMuted}
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={doSaveProject}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setSaveModalVisible(false)}
                disabled={savingProject}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={doSaveProject}
                disabled={savingProject}
                activeOpacity={0.9}
              >
                {savingProject ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  disabledText: { opacity: 0.4 },
  topBadge: {
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  topBadgeText: { color: colors.accent, fontWeight: "700", fontSize: 13 },
  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginRight: spacing.sm,
  },
  recText: { color: colors.text, fontWeight: "700", fontSize: 13 },
  recButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minWidth: 92,
    alignItems: "center",
  },
  recButtonActive: { backgroundColor: colors.surfaceAlt },
  recButtonText: { color: colors.text, fontWeight: "800", fontSize: 14 },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Modal
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.lg,
  },
  modalButtons: { flexDirection: "row", gap: spacing.md },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  modalSave: { backgroundColor: colors.primary },
  modalSaveText: { color: colors.text, fontWeight: "800", fontSize: 15 },
});
