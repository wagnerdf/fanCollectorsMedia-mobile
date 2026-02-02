import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { clearLoggedUser } from "../services/userStorage";

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
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("tokenExpiration");
  } else {
    localStorage.removeItem("userToken");
    localStorage.removeItem("tokenExpiration");
  }

  await clearLoggedUser();
  clearAuthToken();
}

