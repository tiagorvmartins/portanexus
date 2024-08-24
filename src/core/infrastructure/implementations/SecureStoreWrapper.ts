import { injectable } from "inversify-sugar";
import * as SecureStore from 'expo-secure-store';
import ISecureStoreWrapper from "../../domain/specifications/ISecureStoreWrapper";
import SecureStoreEntry from "src/core/domain/enums/SecureStoreEntry";

@injectable()
class SecureStoreWrapper implements ISecureStoreWrapper {
  
  async getItemAsync(key: SecureStoreEntry): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItemAsync(key: SecureStoreEntry, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch(error) {
      console.error(`Èrror setting item ${key}: `, error)
    }
  }

  async deleteItemAsync(key: SecureStoreEntry): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch(error) {
      console.error(`Èrror deleting item ${key}: `, error)
    }
  }
}

export default SecureStoreWrapper;
