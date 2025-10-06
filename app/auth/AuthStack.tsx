import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabsLayout from "../(tabs)/_layout"; // redireciona para o conteúdo principal após login
import LoginScreen from "./LoginScreen";
import RecoverScreen from "./recover";
import WelcomeScreen from "./Welcome";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Recover"
        component={RecoverScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={TabsLayout}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
