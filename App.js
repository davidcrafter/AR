import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import DrawScreen from "./src/screens/DrawScreen";
import { colors } from "./src/theme";

/**
 * Root component.
 *
 * V1 keeps navigation intentionally simple: a small state machine flips
 * between the two screens. This avoids pulling in a navigation library
 * (and its native dependencies) for a two-screen app.
 */
export default function App() {
  const [route, setRoute] = useState("home"); // 'home' | 'draw'
  const [imageUri, setImageUri] = useState(null);

  const startTracing = useCallback((uri) => {
    setImageUri(uri);
    setRoute("draw");
  }, []);

  const goHome = useCallback(() => {
    setRoute("home");
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {route === "home" ? (
        <HomeScreen onStartTracing={startTracing} initialImageUri={imageUri} />
      ) : (
        <DrawScreen imageUri={imageUri} onBack={goHome} />
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
