import SecureStoreEntry from "../enums/SecureStoreEntry";

export const ISecureStoreWrapperToken = Symbol("ISecureStoreWrapper");

export default interface ISecureStoreWrapper {
  getItemAsync(
    key: SecureStoreEntry
  ): Promise<string | null>;

  setItemAsync(
    key: SecureStoreEntry,
    value: string
  ): Promise<void>;

  deleteItemAsync(
    key: SecureStoreEntry
  ): Promise<void>;
}
