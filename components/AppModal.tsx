import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
} from "react-native";

type AppModalProps = {
  visible: boolean;
  message: string;
  modalType?: "success" | "error" | "info"; // aqui incluímos "info"
  onClose: () => void;
};

export default function AppModal({
  visible,
  message,
  modalType = "info",
  onClose,
}: AppModalProps) {
  // Define cores dinâmicas baseadas no tipo de modal
  const getColor = () => {
    switch (modalType) {
      case "success":
        return "#4CAF50"; // verde
      case "error":
        return "#F44336"; // vermelho
      default:
        return "#f5a623"; // amarelo padrão
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <RNAnimated.View style={[styles.modalContainer, { borderColor: getColor() }]}>
          {/* Mensagem do modal */}
          <Text style={[styles.message, { color: getColor() }]}>{message}</Text>

          {/* Botão de fechar */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: getColor() }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // fundo semitransparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
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
