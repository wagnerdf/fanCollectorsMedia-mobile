import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import AuthStack from "./app/auth/AuthStack";

export default function App() {
   useEffect(() => {
    // 🔒 Trava a orientação em modo retrato
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }, []);
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}

