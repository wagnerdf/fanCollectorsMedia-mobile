import React, { useEffect } from "react";
import { Slot } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Platform } from "react-native";

import changeNavigationBarColor from "react-native-navigation-bar-color";

export default function App() {
  useEffect(() => {
    // 🔒 Trava a orientação em modo retrato (apenas vertical)
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

      // 🎨 Configura a barra inferior (Android apenas)
    if (Platform.OS === "android") {
      changeNavigationBarColor("#ffffff", true); // cor da barra + ícones escuros
    }
  }, []);

return (
   <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content" // texto da barra em escuro
        translucent={false}     // evita sobreposição
        backgroundColor="#00BFA6"  // cor da barra de status
      />
      <Slot />
    </SafeAreaProvider>
  );
}