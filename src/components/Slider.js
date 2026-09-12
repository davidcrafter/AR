import React, { useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { colors } from "../theme";

/**
 * A minimal, dependency-free horizontal slider built on PanResponder.
 *
 * Props:
 *  - value: current value (between min and max)
 *  - min, max: range (defaults 0..1)
 *  - onChange: (value) => void, fired continuously while dragging
 */
export default function Slider({ value, min = 0, max = 1, onChange }) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  const clamp = (v) => Math.max(min, Math.min(max, v));
  const ratio = width > 0 ? (clamp(value) - min) / (max - min) : 0;

  const emitFromX = (x) => {
    const w = widthRef.current;
    if (w <= 0) return;
    const r = Math.max(0, Math.min(1, x / w));
    onChange(min + r * (max - min));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => emitFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => emitFromX(evt.nativeEvent.locationX),
    }),
  ).current;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        widthRef.current = w;
        setWidth(w);
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.track} />
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      <View style={[styles.thumb, { left: `${ratio * 100}%` }]} />
    </View>
  );
}

const THUMB = 22;

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
  },
  fill: {
    position: "absolute",
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.text,
    marginLeft: -THUMB / 2,
    borderWidth: 3,
    borderColor: colors.primary,
  },
});
