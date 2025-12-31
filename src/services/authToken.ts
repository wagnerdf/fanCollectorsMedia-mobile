let memoryToken: string | null = null;

export function setAuthToken(token: string) {
  memoryToken = token;
}

export function clearAuthToken() {
  memoryToken = null;
}

export async function getAuthToken() {
  if (memoryToken) return memoryToken;

  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync("userToken");
}
