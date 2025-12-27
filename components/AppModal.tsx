import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

type AppModalProps = {
  visible: boolean;
  message: string;
  modalType?: "success" | "error" | "info";
  onClose: () => void;
};

export default function AppModal({
  visible,
  message,
  modalType = "info",
  onClose,
}: AppModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-60)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  const getColor = () => {
    switch (modalType) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      default:
        return "#f5a623";
    }
  };

  useEffect(() => {
    if (visible) {
      // 🔄 Reseta os valores antes da animação
      opacity.setValue(0);
      translateY.setValue(-60);
      scale.setValue(0.95);

      // 🎬 Animação de entrada com bounce e vibração sutil
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.03,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // 🎞️ Animação de saída (fade + slide pra cima)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              borderColor: getColor(),
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <Text style={[styles.message, { color: getColor() }]}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getColor() }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    padding: 20,
    borderWidth: 2,
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.8)",
    elevation: 6,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
});
