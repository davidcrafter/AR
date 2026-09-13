import React, { useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet } from "react-native";

const DEFAULT_TRANSFORM = { tx: 0, ty: 0, scale: 1, rot: 0 };

/**
 * The draggable / scalable / rotatable reference image that floats above the
 * camera feed.
 *
 * Gestures are implemented with the built-in PanResponder (no native gesture
 * library needed):
 *   - 1 finger  -> pan (move)
 *   - 2 fingers -> pinch to scale + twist to rotate
 *
 * The committed transform lives in a ref; a mirror lives in Animated.Values so
 * the view updates smoothly. When `locked` is true, all gestures are ignored so
 * the artist can trace without nudging the overlay.
 *
 * Props:
 *   - uri: reference image URI
 *   - opacity: Animated value (0..1)
 *   - locked / flipped: booleans
 *   - initialTransform: {tx,ty,scale,rot} to restore a saved project
 *   - onTransformChange: (transform) => void, called when a gesture ends so the
 *     parent can persist the current position/scale/rotation.
 */
export default function OverlayImage({
  uri,
  opacity,
  locked,
  flipped,
  initialTransform,
  onTransformChange,
}) {
  const initial = { ...DEFAULT_TRANSFORM, ...(initialTransform || {}) };

  // Committed transform (persists between gestures).
  const committed = useRef({ ...initial });

  // Per-gesture bookkeeping.
  const gesture = useRef({
    mode: null,
    base: null,
    startDist: 0,
    startAngle: 0,
  });

  // Animated mirrors for smooth rendering, seeded from the initial transform.
  const tx = useRef(new Animated.Value(initial.tx)).current;
  const ty = useRef(new Animated.Value(initial.ty)).current;
  const scale = useRef(new Animated.Value(initial.scale)).current;
  const rot = useRef(new Animated.Value(initial.rot)).current;

  const [size] = useState({ w: 260, h: 260 });

  const distanceBetween = (t) =>
    Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
  const angleBetween = (t) =>
    Math.atan2(t[1].pageY - t[0].pageY, t[1].pageX - t[0].pageX);

  const apply = ({ tx: x, ty: y, scale: s, rot: r }) => {
    tx.setValue(x);
    ty.setValue(y);
    scale.setValue(s);
    rot.setValue(r);
  };

  const commitAndReport = () => {
    committed.current = {
      tx: tx.__getValue(),
      ty: ty.__getValue(),
      scale: scale.__getValue(),
      rot: rot.__getValue(),
    };
    gesture.current.mode = null;
    if (onTransformChange) onTransformChange({ ...committed.current });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !locked,
        onMoveShouldSetPanResponder: () => !locked,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: () => {
          gesture.current.mode = null;
          gesture.current.base = { ...committed.current };
        },

        onPanResponderMove: (evt, g) => {
          if (locked) return;
          const touches = evt.nativeEvent.touches;

          if (touches.length >= 2) {
            const dist = distanceBetween(touches);
            const angle = angleBetween(touches);

            // (Re)initialise pinch reference when entering two-finger mode.
            if (gesture.current.mode !== "pinch") {
              gesture.current.mode = "pinch";
              gesture.current.base = { ...committed.current };
              gesture.current.startDist = dist || 1;
              gesture.current.startAngle = angle;
            }

            const base = gesture.current.base;
            const nextScale = Math.max(
              0.15,
              Math.min(6, base.scale * (dist / gesture.current.startDist)),
            );
            const nextRot = base.rot + (angle - gesture.current.startAngle);
            apply({ tx: base.tx, ty: base.ty, scale: nextScale, rot: nextRot });
          } else if (touches.length === 1) {
            // (Re)initialise pan reference when entering one-finger mode.
            if (gesture.current.mode !== "pan") {
              gesture.current.mode = "pan";
              gesture.current.base = { ...committed.current };
              gesture.current.panDx0 = g.dx;
              gesture.current.panDy0 = g.dy;
            }
            const base = gesture.current.base;
            apply({
              tx: base.tx + (g.dx - gesture.current.panDx0),
              ty: base.ty + (g.dy - gesture.current.panDy0),
              scale: base.scale,
              rot: base.rot,
            });
          }
        },

        onPanResponderRelease: commitAndReport,
        onPanResponderTerminate: commitAndReport,
      }),
    [locked],
  );

  const rotateInterpolate = rot.interpolate({
    inputRange: [-Math.PI * 2, Math.PI * 2],
    outputRange: ["-360deg", "360deg"],
  });

  return (
    <Animated.View
      pointerEvents={locked ? "none" : "auto"}
      style={[
        styles.wrap,
        {
          width: size.w,
          height: size.h,
          opacity,
          transform: [
            { translateX: tx },
            { translateY: ty },
            { scale },
            { rotate: rotateInterpolate },
            { scaleX: flipped ? -1 : 1 },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.Image
        source={{ uri }}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignSelf: "center",
    top: "22%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
