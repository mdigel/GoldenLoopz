import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Info, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface InfoModalProps {
  title: string;
  children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.iconButton}
      >
        <Info size={20} color={colors.text.muted} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// Helper components for formatted content
export const InfoText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.text}>{children}</Text>
);

export const InfoBold: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.bold}>{children}</Text>
);

export const InfoBullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

export const InfoSubBullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.subBulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  iconButton: {
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  subBulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 20,
  },
  bullet: {
    fontSize: 15,
    color: colors.text.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    flex: 1,
  },
});
