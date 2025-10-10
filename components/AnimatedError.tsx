import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

interface Props { 
  message: string; 
}

const AnimatedError = ({ message }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    }
  }, [message]);

  return message ? (
    <Animated.Text
      style={{
        color: "#f87171",
        opacity: fadeAnim,
        textAlign: "center",
        marginBottom: 16,
        fontWeight: "600",
      }}
    >
      {message}
    </Animated.Text>
  ) : null;
};

export default AnimatedError;
