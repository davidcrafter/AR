import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { loadProjects, deleteProject } from "../storage/projects";
import { colors, radius, spacing } from "../theme";

/**
 * Home / start screen.
 *
 * Responsibilities:
 *  - Explain the tracing flow to the user.
 *  - Let the user choose a reference image from their photo library
 *    or capture one with the camera.
 *  - Preview the chosen image and hand it off to the Draw screen.
 *  - List saved projects so the user can reopen or delete them.
 */
export default function HomeScreen({ onStartTracing, onOpenProject }) {
  const [imageUri, setImageUri] = useState(null);
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]);

  // Reload saved projects whenever this screen mounts (it remounts every time
  // we return from the Draw screen, so newly-saved projects show up).
  useEffect(() => {
    let active = true;
    loadProjects().then((list) => {
      if (active) setProjects(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const confirmDelete = (project) => {
    Alert.alert("Delete project", `Delete "${project.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const next = await deleteProject(project.id);
          if (next) setProjects(next);
        },
      },
    ]);
  };

  const pickFromLibrary = async () => {
    try {
      setBusy(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access so you can choose a reference image.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Something went wrong", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const captureWithCamera = async () => {
    try {
      setBusy(true);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow camera access so you can capture a reference image.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Something went wrong", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.badge}>AR • V2</Text>
          <Text style={styles.title}>AR Drawing</Text>
          <Text style={styles.subtitle}>
            Trace any picture onto real paper. Pick a reference image, point
            your camera at your sketchpad, and follow the overlay.
          </Text>
        </View>

        <View style={styles.previewWrap}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.previewEmpty}>
              <Text style={styles.previewEmptyIcon}>🖼️</Text>
              <Text style={styles.previewEmptyText}>
                No reference image yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={pickFromLibrary}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonPrimaryText}>Choose from library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={captureWithCamera}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonSecondaryText}>Take a photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !imageUri && styles.startButtonDisabled]}
          onPress={() => imageUri && onStartTracing(imageUri)}
          disabled={!imageUri || busy}
          activeOpacity={0.9}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.startButtonText}>Start tracing →</Text>
          )}
        </TouchableOpacity>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>How it works</Text>
          <Tip
            index="1"
            text="Pick a reference image (simple line art works best)."
          />
          <Tip index="2" text="Prop your phone steady over your paper." />
          <Tip
            index="3"
            text="Adjust opacity, size and rotation, then lock the overlay."
          />
          <Tip index="4" text="Trace what you see through the camera." />
        </View>

        {projects.length > 0 && (
          <View style={styles.projects}>
            <Text style={styles.projectsTitle}>Saved projects</Text>
            {projects.map((p) => (
              <View key={p.id} style={styles.projectRow}>
                <TouchableOpacity
                  style={styles.projectMain}
                  onPress={() => onOpenProject(p)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: p.imageUri }}
                    style={styles.projectThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.projectMeta}>
                      {formatDate(p.updatedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.projectDelete}
                  onPress={() => confirmDelete(p)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.projectDeleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function Tip({ index, text }) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipBullet}>
        <Text style={styles.tipBulletText}>{index}</Text>
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: { marginBottom: spacing.lg },
  badge: {
    alignSelf: "flex-start",
    color: colors.accent,
    backgroundColor: colors.surfaceAlt,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  previewWrap: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  preview: { width: "100%", height: "100%" },
  previewEmpty: { alignItems: "center" },
  previewEmptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  previewEmptyText: { color: colors.textMuted, fontSize: 14 },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  startButton: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  startButtonDisabled: { backgroundColor: colors.surface, opacity: 0.6 },
  startButtonText: { color: colors.text, fontWeight: "800", fontSize: 17 },
  tips: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  tipsTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  tipBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  tipBulletText: { color: colors.text, fontWeight: "800", fontSize: 13 },
  tipText: { color: colors.textMuted, fontSize: 14, flex: 1, lineHeight: 20 },

  projects: { marginTop: spacing.lg },
  projectsTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: spacing.md,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  projectMain: { flexDirection: "row", alignItems: "center", flex: 1 },
  projectThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.md,
  },
  projectInfo: { flex: 1 },
  projectName: { color: colors.text, fontWeight: "700", fontSize: 15 },
  projectMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  projectDelete: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  projectDeleteText: { fontSize: 18 },
});
