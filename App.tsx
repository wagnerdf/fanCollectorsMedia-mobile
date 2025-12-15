import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";

export default function App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );

    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#00BFA6");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#00BFA6"
      />
      <Slot />
    </SafeAreaProvider>
  );
}
