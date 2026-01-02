import * as SecureStore from "expo-secure-store";

let memoryToken: string | null = null;
let tokenExpiration: number | null = null;

export function setAuthToken(token: string, expiresAt: Date) {
  memoryToken = token;
  tokenExpiration = expiresAt.getTime();
}

export function clearAuthToken() {
  memoryToken = null;
  tokenExpiration = null;
}

export function isTokenExpired() {
  if (!tokenExpiration) return true;
  return Date.now() > tokenExpiration;
}

export async function getAuthToken(): Promise<string | null> {
  if (!memoryToken || isTokenExpired()) {
    clearAuthToken();
    return null;
  }
  return memoryToken;
}

export async function logout() {
  await SecureStore.deleteItemAsync("userToken");
  await SecureStore.deleteItemAsync("tokenExpiration");
  clearAuthToken();
}

