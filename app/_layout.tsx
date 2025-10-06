import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}

