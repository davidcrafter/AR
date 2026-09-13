import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import DrawScreen from "./src/screens/DrawScreen";
import { colors } from "./src/theme";

/**
 * Root component.
 *
 * Navigation is intentionally a small state machine flipping between the two
 * screens (no navigation library / native deps for a two-screen app).
 *
 * `session` carries everything the Draw screen needs. A fresh image starts a
 * new (unsaved) session; opening a saved project seeds the session with its
 * stored transform / opacity / flip so the overlay is restored exactly.
 */
export default function App() {
  const [route, setRoute] = useState("home"); // 'home' | 'draw'
  const [session, setSession] = useState(null);

  // Start tracing a brand-new image (no saved project yet).
  const startTracing = useCallback((uri) => {
    setSession({
      imageUri: uri,
      projectId: null,
      name: "",
      transform: null,
      opacity: 0.5,
      flipped: false,
    });
    setRoute("draw");
  }, []);

  // Resume a saved project.
  const openProject = useCallback((project) => {
    setSession({
      imageUri: project.imageUri,
      projectId: project.id,
      name: project.name,
      transform: project.transform,
      opacity: project.opacity,
      flipped: project.flipped,
    });
    setRoute("draw");
  }, []);

  const goHome = useCallback(() => setRoute("home"), []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {route === "home" || !session ? (
        <HomeScreen onStartTracing={startTracing} onOpenProject={openProject} />
      ) : (
        <DrawScreen
          imageUri={session.imageUri}
          projectId={session.projectId}
          initialName={session.name}
          initialTransform={session.transform}
          initialOpacity={session.opacity}
          initialFlipped={session.flipped}
          onBack={goHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
