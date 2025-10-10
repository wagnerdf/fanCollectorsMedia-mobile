import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import AppButton from "components/AppButton";

import {
  WELCOME_TITLE,
  WELCOME_SUBTITLE,
  LOGIN_BUTTON,
  SIGNUP_BUTTON,
  SIGNUP_ALERT,
} from "constants/strings";
import { WELCOME_IMAGE } from "constants/images";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={WELCOME_IMAGE} style={styles.image} resizeMode="contain" />

      <Text style={styles.title}>{WELCOME_TITLE}</Text>
      <Text style={styles.subtitle}>{WELCOME_SUBTITLE}</Text>

      <View style={styles.buttonContainer}>
        <AppButton
          title={LOGIN_BUTTON}
          onPress={() => router.push("/auth/Login")}
          color="#2563eb"
          flex={1}
          margin="right"
        />
        <AppButton
          title={SIGNUP_BUTTON}
          onPress={() => alert(SIGNUP_ALERT)}
          color="#16a34a"
          flex={1}
          margin="left"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  image: { width: 180, height: 180, marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 36,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
