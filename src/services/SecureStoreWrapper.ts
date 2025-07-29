import * as SecureStore from 'expo-secure-store';
import {Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ISecureStoreWrapper from "src/types/ISecureStoreWrapper";
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

class SecureStoreWrapper implements ISecureStoreWrapper {
  
  async getItemAsync(key: SecureStoreEntry): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItemAsync(key: SecureStoreEntry, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch(error) {
      console.error(`Èrror setting item ${key}: `, error)
    }
  }

  async deleteItemAsync(key: SecureStoreEntry): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch(error) {
      console.error(`Èrror deleting item ${key}: `, error)
    }
  }
}

export default SecureStoreWrapper;
