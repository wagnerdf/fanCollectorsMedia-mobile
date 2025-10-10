import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  flex?: number;
  margin?: "left" | "right";
}

const AppButton = ({ title, onPress, color = "#2563eb", flex = 1, margin }: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: color,
          flex,
          marginRight: margin === "right" ? 6 : 0,
          marginLeft: margin === "left" ? 6 : 0,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AppButton;
