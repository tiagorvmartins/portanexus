import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useStacks } from 'src/store/useStacks';
import { useEndpoints } from 'src/store/useEndpoints';
import { showErrorToast, showSuccessToast } from 'src/utils/toast';

const EditStackScreen = ({ route, navigation }: any) => {
  const { stackId, stackName } = route.params;
  const { theme } = useAuth();
  const styles = createStyles(theme);
  const { getStackFile, updateStack } = useStacks();
  const { selectedEndpointId } = useEndpoints();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getStackFile(stackId);
        const fileContent = (result as any).payload as string;
        setContent(fileContent ?? '');
      } catch {
        showErrorToast('Failed to load stack file', theme);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stackId]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Stack file content cannot be empty.');
      return;
    }
    setSaving(true);
    const result: any = await updateStack({ stackId, endpointId: selectedEndpointId, stackFileContent: content });
    setSaving(false);
    if (result?.meta?.requestStatus === 'fulfilled') {
      showSuccessToast('Stack updated successfully!', theme);
      navigation.goBack();
    } else {
      showErrorToast('Failed to update stack. Check the compose file syntax.', theme);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <AppHeader navigation={navigation} />
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>Edit: {stackName}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || loading}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveButtonText}>Save</Text>
          }
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#05E6F2" />
        </View>
      ) : (
        <ScrollView style={styles.editorContainer} contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.editor}
            multiline
            value={content}
            onChangeText={setContent}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textAlignVertical="top"
          />
        </ScrollView>
      )}
      <Footer navigation={navigation} activeTab="Stacks" />
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'light' ? '#333333' : '#e0e0e0',
    flex: 1,
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#05E6F2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
    borderRadius: 8,
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
  },
  editorContent: {
    flexGrow: 1,
  },
  editor: {
    flex: 1,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    color: theme === 'light' ? '#222222' : '#e0e0e0',
  },
});

export default EditStackScreen;
