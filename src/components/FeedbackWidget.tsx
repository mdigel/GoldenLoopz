import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/colors';

const APP_NAME = 'GoldenLoopz';

export default function FeedbackWidget() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    setStatus('sending');

    if (!supabase) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const { error } = await supabase
      .from('feedback')
      .insert({ message: trimmed, app_name: APP_NAME });

    if (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setMessage('');
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Send Feedback</Text>
      <Text style={styles.subtitle}>
        Bugs, feature requests, or just say hi!
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Your feedback..."
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          multiline
          maxLength={1000}
          editable={status !== 'sending'}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || status === 'sending') && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!message.trim() || status === 'sending'}
          activeOpacity={0.7}
        >
          {status === 'sending' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {status === 'sent' && (
        <Text style={styles.successText}>Thanks for your feedback!</Text>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>Failed to send. Please try again.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    color: colors.text.primary,
    minHeight: 44,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: colors.purple[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  successText: {
    fontSize: 13,
    color: colors.success,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 10,
    textAlign: 'center',
  },
});
