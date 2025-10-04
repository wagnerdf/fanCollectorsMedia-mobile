import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./app/auth/AuthStack";

export default function App() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
