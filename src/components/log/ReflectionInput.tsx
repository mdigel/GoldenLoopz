import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface ReflectionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReflectionInput({ value, onChange }: ReflectionInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Daily Reflection</Text>
      <Text style={styles.prompt}>How did today feel, and why?</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="A few sentences about your day..."
        placeholderTextColor={colors.slate[400]}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.text.primary,
  },
  prompt: {
    fontSize: 13,
    marginBottom: 12,
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 100,
  },
});
