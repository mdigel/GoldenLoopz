import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTooltip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Info size={18} color={isVisible ? colors.purple[500] : colors.text.muted} />
      </TouchableOpacity>
      {isVisible && (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
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
});
