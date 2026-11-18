import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_ZOOM = 5;
const OUTPUT_SIZE = 1024;
const DIM = "rgba(0,0,0,0.65)";
const RING = 1000; // thickness of the dimmed mask

const clamp = (v, min, max) => {
  "worklet";
  return Math.min(Math.max(v, min), max);
};

/**
 * Props
 *  visible   boolean
 *  uri       string  - local uri of the picked image
 *  width/height number - picker-reported size (used as a fallback)
 *  shape     "circle" | "square"
 *  onCancel  () => void
 *  onConfirm ({ uri, width, height }) => void
 */
const ImageCropper = ({
  visible,
  uri,
  width,
  height,
  shape = "circle",
  onCancel,
  onConfirm,
}) => {
  const [src, setSrc] = useState(null); // normalised image { uri, width, height }
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [working, setWorking] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const sliderW = useSharedValue(1);

  const resetTransform = useCallback(
    (animated = false) => {
      const set = (v) => (animated ? withTiming(v, { duration: 220 }) : v);
      scale.value = set(1);
      tx.value = set(0);
      ty.value = set(0);
      savedScale.value = 1;
      savedTx.value = 0;
      savedTy.value = 0;
    },
    [scale, tx, ty, savedScale, savedTx, savedTy],
  );

  /* Load + normalise (applies EXIF orientation, gives true pixel size) */
  useEffect(() => {
    if (!visible || !uri) return;
    let cancelled = false;
    setSrc(null);
    resetTransform();

    (async () => {
      try {
        const r = await ImageManipulator.manipulateAsync(uri, [], {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        if (!cancelled) setSrc({ uri: r.uri, width: r.width, height: r.height });
      } catch {
        if (!cancelled) setSrc({ uri, width, height });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, uri]);

  /* ------------------------------ geometry ------------------------------ */
  const crop = Math.max(
    120,
    Math.min(area.w - 32, area.h - 32, 360),
  );
  const iw = src?.width ?? 1;
  const ih = src?.height ?? 1;
  const base = crop / Math.min(iw, ih); // display px per image px at zoom 1
  const dw = iw * base;
  const dh = ih * base;

  /* ------------------------------ gestures ------------------------------ */
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const mx = Math.max(0, (dw * scale.value - crop) / 2);
      const my = Math.max(0, (dh * scale.value - crop) / 2);
      tx.value = clamp(savedTx.value + e.translationX, -mx, mx);
      ty.value = clamp(savedTy.value + e.translationY, -my, my);
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const s = clamp(savedScale.value * e.scale, 1, MAX_ZOOM);
      scale.value = s;
      const mx = Math.max(0, (dw * s - crop) / 2);
      const my = Math.max(0, (dh * s - crop) / 2);
      tx.value = clamp(tx.value, -mx, mx);
      ty.value = clamp(ty.value, -my, my);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const imageGesture = Gesture.Simultaneous(pan, pinch);

  const setZoomFromSlider = (x) => {
    "worklet";
    const ratio = clamp(x / sliderW.value, 0, 1);
    const s = 1 + ratio * (MAX_ZOOM - 1);
    scale.value = s;
    savedScale.value = s;
    const mx = Math.max(0, (dw * s - crop) / 2);
    const my = Math.max(0, (dh * s - crop) / 2);
    tx.value = clamp(tx.value, -mx, mx);
    ty.value = clamp(ty.value, -my, my);
    savedTx.value = tx.value;
    savedTy.value = ty.value;
  };

  const sliderGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => setZoomFromSlider(e.x))
    .onUpdate((e) => setZoomFromSlider(e.x));

  const stepZoom = (delta) => {
    const s = clamp(scale.value + delta, 1, MAX_ZOOM);
    const mx = Math.max(0, (dw * s - crop) / 2);
    const my = Math.max(0, (dh * s - crop) / 2);
    const nx = clamp(tx.value, -mx, mx);
    const ny = clamp(ty.value, -my, my);
    scale.value = withTiming(s, { duration: 160 });
    tx.value = withTiming(nx, { duration: 160 });
    ty.value = withTiming(ny, { duration: 160 });
    savedScale.value = s;
    savedTx.value = nx;
    savedTy.value = ny;
  };

  /* ------------------------------- styles ------------------------------- */
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: ((scale.value - 1) / (MAX_ZOOM - 1)) * sliderW.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: ((scale.value - 1) / (MAX_ZOOM - 1)) * sliderW.value - 12,
      },
    ],
  }));

  /* ------------------------------- actions ------------------------------ */
  const rotate = async () => {
    if (!src || working) return;
    setWorking(true);
    try {
      const r = await ImageManipulator.manipulateAsync(
        src.uri,
        [{ rotate: 90 }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
      setSrc({ uri: r.uri, width: r.width, height: r.height });
      resetTransform();
    } finally {
      setWorking(false);
    }
  };

  const handleDone = async () => {
    if (!src || working) return;
    setWorking(true);
    try {
      const s = scale.value;
      const k = base * s; // display px per image px
      const size = Math.min(crop / k, iw, ih);

      const originX = clamp(
        (dw * s) / 2 / k - tx.value / k - size / 2,
        0,
        iw - size,
      );
      const originY = clamp(
        (dh * s) / 2 / k - ty.value / k - size / 2,
        0,
        ih - size,
      );

      const side = Math.floor(size);
      const out = await ImageManipulator.manipulateAsync(
        src.uri,
        [
          {
            crop: {
              originX: Math.floor(originX),
              originY: Math.floor(originY),
              width: side,
              height: side,
            },
          },
          { resize: { width: Math.min(OUTPUT_SIZE, side) } },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );

      onConfirm?.({ uri: out.uri, width: out.width, height: out.height });
    } catch (e) {
      console.warn("Crop failed", e);
    } finally {
      setWorking(false);
    }
  };

  const ready = !!src && area.w > 0;
  const round = shape === "circle";
  const maskSize = crop + RING * 2;

  /* -------------------------------- render ------------------------------- */
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0B1220" }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={onCancel}
              disabled={working}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/10"
              accessibilityLabel="Cancel cropping"
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-base font-bold text-white">Crop photo</Text>
              <Text className="text-xs text-white/60">
                Drag and pinch to adjust
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDone}
              disabled={!ready || working}
              className={`px-4 h-10 rounded-full items-center justify-center ${
                !ready || working ? "bg-green-500/50" : "bg-green-500"
              }`}
              accessibilityLabel="Apply crop"
            >
              {working ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-sm font-bold text-white">Done</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Crop area */}
          <View
            style={{ flex: 1, overflow: "hidden" }}
            onLayout={(e) =>
              setArea({
                w: e.nativeEvent.layout.width,
                h: e.nativeEvent.layout.height,
              })
            }
          >
            {!ready ? (
              <View className="items-center justify-center flex-1">
                <ActivityIndicator color="#86D36B" />
              </View>
            ) : (
              <>
                <GestureDetector gesture={imageGesture}>
                  <View style={{ flex: 1 }}>
                    <Animated.Image
                      source={{ uri: src.uri }}
                      resizeMode="cover"
                      style={[
                        {
                          position: "absolute",
                          width: dw,
                          height: dh,
                          left: (area.w - dw) / 2,
                          top: (area.h - dh) / 2,
                        },
                        imageStyle,
                      ]}
                    />
                  </View>
                </GestureDetector>

                {/* Dimmed mask with cut-out */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: maskSize,
                    height: maskSize,
                    left: (area.w - maskSize) / 2,
                    top: (area.h - maskSize) / 2,
                    borderWidth: RING,
                    borderColor: DIM,
                    borderRadius: round ? maskSize / 2 : 0,
                  }}
                />

                {/* Frame + grid */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: crop,
                    height: crop,
                    left: (area.w - crop) / 2,
                    top: (area.h - crop) / 2,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.9)",
                    borderRadius: round ? crop / 2 : 12,
                    overflow: "hidden",
                  }}
                >
                  {[1 / 3, 2 / 3].map((p) => (
                    <View key={`v${p}`}>
                      <View
                        style={{
                          position: "absolute",
                          left: crop * p,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          backgroundColor: "rgba(255,255,255,0.28)",
                        }}
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: crop * p,
                          left: 0,
                          right: 0,
                          height: 1,
                          backgroundColor: "rgba(255,255,255,0.28)",
                        }}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Controls */}
          <View className="px-6 pt-4 pb-3">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => stepZoom(-0.5)}
                hitSlop={10}
                accessibilityLabel="Zoom out"
              >
                <Ionicons name="remove-circle-outline" size={26} color="#fff" />
              </TouchableOpacity>

              <GestureDetector gesture={sliderGesture}>
                <View
                  className="justify-center flex-1 mx-4 h-10"
                  onLayout={(e) => {
                    sliderW.value = e.nativeEvent.layout.width;
                  }}
                >
                  <View className="h-1 rounded-full bg-white/20" />
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        left: 0,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#86D36B",
                      },
                      fillStyle,
                    ]}
                  />
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        left: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#fff",
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      },
                      thumbStyle,
                    ]}
                  />
                </View>
              </GestureDetector>

              <TouchableOpacity
                onPress={() => stepZoom(0.5)}
                hitSlop={10}
                accessibilityLabel="Zoom in"
              >
                <Ionicons name="add-circle-outline" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-3">
              <TouchableOpacity
                onPress={rotate}
                disabled={!ready || working}
                className="flex-row items-center px-5 py-2.5 mr-3 rounded-full bg-white/10"
                accessibilityLabel="Rotate 90 degrees"
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text className="ml-2 text-sm font-semibold text-white">
                  Rotate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => resetTransform(true)}
                disabled={!ready || working}
                className="flex-row items-center px-5 py-2.5 rounded-full bg-white/10"
                accessibilityLabel="Reset crop"
              >
                <Ionicons name="contract-outline" size={18} color="#fff" />
                <Text className="ml-2 text-sm font-semibold text-white">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ImageCropper;