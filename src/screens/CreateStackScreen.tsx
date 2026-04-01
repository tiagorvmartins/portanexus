import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useStacks } from 'src/store/useStacks';
import { useEndpoints } from 'src/store/useEndpoints';
import { showErrorToast, showSuccessToast } from 'src/utils/toast';

const PLACEHOLDER_COMPOSE = `services:
  app:
    image: nginx:latest
    ports:
      - "80:80"
    restart: unless-stopped
`;

const CreateStackScreen = ({ navigation }: any) => {
  const { theme } = useAuth();
  const styles = createStyles(theme);
  const { createStack } = useStacks();
  const { selectedEndpointId, selectedSwarmId } = useEndpoints();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Stack name is required.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Validation', 'Stack file content cannot be empty.');
      return;
    }
    setSaving(true);
    const result: any = await createStack({
      name: name.trim(),
      stackFileContent: content,
      endpointId: selectedEndpointId,
      swarmId: selectedSwarmId,
    });
    setSaving(false);
    if (result?.meta?.requestStatus === 'fulfilled') {
      showSuccessToast('Stack created successfully!', theme);
      navigation.goBack();
    } else {
      showErrorToast('Failed to create stack. Check the compose file syntax.', theme);
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
        <Text style={styles.title}>New Stack</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.createButtonText}>Create</Text>
          }
        </TouchableOpacity>
      </View>
      <View style={styles.nameRow}>
        <Text style={styles.label}>Stack Name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="my-stack"
          placeholderTextColor={theme === 'light' ? 'rgba(51,51,51,0.4)' : 'rgba(224,224,224,0.4)'}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <Text style={styles.label}>Compose File</Text>
      <ScrollView style={styles.editorContainer} contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.editor}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder={PLACEHOLDER_COMPOSE}
          placeholderTextColor={theme === 'light' ? 'rgba(51,51,51,0.3)' : 'rgba(224,224,224,0.3)'}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
        />
      </ScrollView>
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
  },
  createButton: {
    backgroundColor: '#05E6F2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nameRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme === 'light' ? '#555555' : '#aaaaaa',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
    borderRadius: 8,
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: theme === 'light' ? '#222222' : '#e0e0e0',
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

export default CreateStackScreen;
