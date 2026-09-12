import React, { useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet } from "react-native";

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
 */
export default function OverlayImage({ uri, opacity, locked, flipped }) {
  // Committed transform (persists between gestures).
  const committed = useRef({ tx: 0, ty: 0, scale: 1, rot: 0 });

  // Per-gesture bookkeeping.
  const gesture = useRef({
    mode: null,
    base: null,
    startDist: 0,
    startAngle: 0,
  });

  // Animated mirrors for smooth rendering.
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;

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

        onPanResponderRelease: () => {
          // Commit whatever the animated values currently hold.
          committed.current = {
            tx: tx.__getValue(),
            ty: ty.__getValue(),
            scale: scale.__getValue(),
            rot: rot.__getValue(),
          };
          gesture.current.mode = null;
        },
        onPanResponderTerminate: () => {
          committed.current = {
            tx: tx.__getValue(),
            ty: ty.__getValue(),
            scale: scale.__getValue(),
            rot: rot.__getValue(),
          };
          gesture.current.mode = null;
        },
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
