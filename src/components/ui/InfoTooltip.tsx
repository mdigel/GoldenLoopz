import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface InfoTooltipProps {
  text: string;
  /** Show as a centered modal with dimmed background instead of inline popover */
  modal?: boolean;
  /** Icon color override (defaults to muted) */
  iconColor?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, modal, iconColor }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  const defaultColor = iconColor || colors.text.muted;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTooltip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Info size={18} color={isVisible ? colors.purple[500] : defaultColor} />
      </TouchableOpacity>
      {isVisible && !modal && (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      )}
      {modal && (
        <Modal
          visible={isVisible}
          transparent
          animationType="fade"
          onRequestClose={toggleTooltip}
        >
          <Pressable style={styles.modalOverlay} onPress={toggleTooltip}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{text}</Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 6,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 24,
    left: -8,
    backgroundColor: colors.slate[800],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: 260,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'center',
  },
});
