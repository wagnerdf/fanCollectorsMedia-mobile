import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "fanCollection.user";


export type LoggedUser = {
  email: string;
  username: string;
  loggedAt: string;
};

export async function setLoggedUser(user: LoggedUser) {
  const data = JSON.stringify(user);

  if (Platform.OS === "web") {
    localStorage.setItem(STORAGE_KEY, data);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, data);
  }
}

export async function getLoggedUser(): Promise<LoggedUser | null> {
  let data: string | null = null;

  if (Platform.OS === "web") {
    data = localStorage.getItem(STORAGE_KEY);
  } else {
    data = await SecureStore.getItemAsync(STORAGE_KEY);
  }

  return data ? JSON.parse(data) : null;
}

export async function clearLoggedUser() {
  if (Platform.OS === "web") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}
