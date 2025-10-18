import React, { useEffect } from "react";
import { Slot } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

export default function App() {
  useEffect(() => {
    // 🔒 Trava a orientação em modo retrato (apenas vertical)
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

return (
   <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content" // texto da barra em escuro
        translucent={false}     // evita sobreposição
        backgroundColor="#fff"  // cor da barra de status
      />
      <Slot />
    </SafeAreaProvider>
  );
}