import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const AnimatedMessage = ({ message, visible, onHide }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onHide());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 24,
    right: 24,
    backgroundColor: "#f87171",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  text: { color: "#fff", fontWeight: "600", textAlign: "center" },
});

export default AnimatedMessage;
