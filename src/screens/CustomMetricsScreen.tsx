import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Trash2, ChevronDown, Pencil } from 'lucide-react-native';
import { useCustomMetricsStore, getUnitLabel, getUnitDisplayLabel } from '../state/customMetricsStore';
import { colors } from '../constants/colors';
import Button from '../components/ui/Button';
import { CustomMetric, MetricUnitType, SYSTEM_METRIC_IDS } from '../types';

function CustomMetricItem({ metric, onEdit, onDelete }: { metric: CustomMetric; onEdit: () => void; onDelete: () => void }) {
  const iconSource =
    metric.id === SYSTEM_METRIC_IDS.EXERCISE
      ? require('../../assets/dumbell.png')
      : metric.id === SYSTEM_METRIC_IDS.DRINKS
      ? require('../../assets/wine.png')
      : metric.id === SYSTEM_METRIC_IDS.STREAMING
      ? require('../../assets/tv.png')
      : null;

  return (
    <TouchableOpacity style={styles.customMetricItem} onPress={onEdit} activeOpacity={0.7}>
      <View style={styles.customMetricInfo}>
        <View style={styles.customMetricNameRow}>
          {iconSource && (
            <Image source={iconSource} style={styles.customMetricIcon} resizeMode="contain" />
          )}
          <Text style={styles.customMetricName}>
            {metric.icon && `${metric.icon} `}{metric.name}
          </Text>
        </View>
        <Text style={styles.customMetricGoal}>
          {metric.category === 'negative' ? 'Limit' : 'Goal'}: {metric.weeklyGoal} {getUnitLabel(metric.unitType)}
        </Text>
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Pencil size={16} color={colors.text.muted} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Trash2 size={16} color={colors.text.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function UnitTypeSelector({ value, onChange }: { value: MetricUnitType; onChange: (v: MetricUnitType) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const options: MetricUnitType[] = ['minutes', 'hours', 'count', 'boolean'];

  return (
    <View style={styles.unitSelector}>
      <Text style={styles.label}>Unit Type</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.dropdownButtonText}>{getUnitDisplayLabel(value)}</Text>
        <ChevronDown size={18} color={colors.text.secondary} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.dropdownOption, value === option && styles.dropdownOptionSelected]}
              onPress={() => { onChange(option); setIsOpen(false); }}
            >
              <Text style={[styles.dropdownOptionText, value === option && styles.dropdownOptionTextSelected]}>
                {getUnitDisplayLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function MetricModal({ visible, onClose, onSave, editingMetric }: {
  visible: boolean;
  onClose: () => void;
  onSave: (metric: Omit<CustomMetric, 'id' | 'createdAt' | 'isActive'>) => void;
  editingMetric?: CustomMetric | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitType, setUnitType] = useState<MetricUnitType>('count');
  const [category, setCategory] = useState<'positive' | 'negative'>('positive');
  const [weeklyGoal, setWeeklyGoal] = useState('');

  const isEditing = !!editingMetric;
  const isSystemMetric = editingMetric?.isSystemMetric ?? false;

  useEffect(() => {
    if (editingMetric) {
      setName(editingMetric.name);
      setDescription(editingMetric.description || '');
      setUnitType(editingMetric.unitType);
      setCategory(editingMetric.category);
      setWeeklyGoal(editingMetric.weeklyGoal.toString());
    } else {
      setName('');
      setDescription('');
      setUnitType('count');
      setCategory('positive');
      setWeeklyGoal('');
    }
  }, [editingMetric, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a metric name');
      return;
    }
    const goalNum = parseFloat(weeklyGoal);
    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weekly goal');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      unitType,
      category,
      weeklyGoal: goalNum,
      color: editingMetric?.color || '',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Metric' : 'Add Custom Metric'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Reading, Meditation"
              style={[styles.textInput, isSystemMetric && styles.disabledInput]}
              placeholderTextColor={colors.text.muted}
              editable={!isSystemMetric}
            />
            {isSystemMetric && <Text style={styles.systemMetricHint}>System metrics cannot be renamed</Text>}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What does this metric track?"
              style={styles.textInput}
              placeholderTextColor={colors.text.muted}
            />
          </View>
          <View style={styles.formGroup}>
            <UnitTypeSelector value={unitType} onChange={setUnitType} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryToggle}>
              <TouchableOpacity
                style={[styles.categoryButton, category === 'positive' && styles.categoryButtonActive]}
                onPress={() => setCategory('positive')}
              >
                <Text style={[styles.categoryButtonText, category === 'positive' && styles.categoryButtonTextActive]}>Positive</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, category === 'negative' && styles.categoryButtonActiveNegative]}
                onPress={() => setCategory('negative')}
              >
                <Text style={[styles.categoryButtonText, category === 'negative' && styles.categoryButtonTextActive]}>Negative</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.categoryHint}>
              {category === 'positive' ? 'Track progress toward a goal' : 'Track usage against a limit'}
            </Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Weekly {category === 'negative' ? 'Limit' : 'Goal'} *</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={weeklyGoal}
                onChangeText={setWeeklyGoal}
                keyboardType="decimal-pad"
                placeholder="0"
                style={styles.textInput}
                placeholderTextColor={colors.text.muted}
              />
              <Text style={styles.suffix}>{getUnitLabel(unitType)}</Text>
            </View>
          </View>
          <Button title={isEditing ? 'Save Changes' : 'Add Metric'} onPress={handleSave} style={styles.saveMetricButton} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function CustomMetricsScreen() {
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const addMetric = useCustomMetricsStore((state) => state.addMetric);
  const updateMetric = useCustomMetricsStore((state) => state.updateMetric);
  const deleteMetric = useCustomMetricsStore((state) => state.deleteMetric);

  const [showMetricModal, setShowMetricModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<CustomMetric | null>(null);

  const handleSaveMetric = (metricData: Omit<CustomMetric, 'id' | 'createdAt' | 'isActive'>) => {
    if (editingMetric) {
      updateMetric(editingMetric.id, metricData);
      Alert.alert('Success', `"${metricData.name}" has been updated!`);
    } else {
      addMetric(metricData);
      Alert.alert('Success', `"${metricData.name}" has been added to your metrics!`);
    }
  };

  const handleDeleteMetric = (metric: CustomMetric) => {
    Alert.alert(
      'Delete Metric',
      `Are you sure you want to delete "${metric.name}"? This will not delete any logged data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMetric(metric.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Custom Metrics</Text>
          <Text style={styles.sectionSubtitle}>Additional metrics to track your wellbeing and habits</Text>

          {customMetrics.filter(m => m.isActive).map((metric) => (
            <CustomMetricItem
              key={metric.id}
              metric={metric}
              onEdit={() => { setEditingMetric(metric); setShowMetricModal(true); }}
              onDelete={() => handleDeleteMetric(metric)}
            />
          ))}

          <TouchableOpacity
            style={styles.addMetricButton}
            onPress={() => { setEditingMetric(null); setShowMetricModal(true); }}
          >
            <Plus size={20} color={colors.purple[500]} />
            <Text style={styles.addMetricButtonText}>Add Custom Metric</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MetricModal
        visible={showMetricModal}
        onClose={() => { setShowMetricModal(false); setEditingMetric(null); }}
        onSave={handleSaveMetric}
        editingMetric={editingMetric}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: colors.text.secondary, marginBottom: 16 },
  customMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  customMetricInfo: { flex: 1 },
  customMetricNameRow: { flexDirection: 'row', alignItems: 'center' },
  customMetricIcon: { width: 18, height: 18, marginRight: 6 },
  customMetricName: { fontSize: 15, fontWeight: '500', color: colors.text.primary },
  customMetricGoal: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  editButton: { padding: 8 },
  deleteButton: { padding: 8 },
  addMetricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.purple[200],
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addMetricButtonText: { fontSize: 15, fontWeight: '600', color: colors.purple[500], marginLeft: 8 },
  // Modal & form styles
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: colors.text.primary },
  closeButton: { padding: 4 },
  modalContent: { flex: 1, padding: 16 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  textInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    color: colors.text.primary,
  },
  disabledInput: { backgroundColor: colors.slate[100], color: colors.text.muted },
  systemMetricHint: { fontSize: 12, color: colors.text.muted, marginTop: 4, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  suffix: { marginLeft: 8, fontSize: 14, color: colors.text.secondary },
  unitSelector: { position: 'relative', zIndex: 10 },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  dropdownButtonText: { fontSize: 16, color: colors.text.primary },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  dropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  dropdownOptionSelected: { backgroundColor: colors.purple[50] },
  dropdownOptionText: { fontSize: 15, color: colors.text.primary },
  dropdownOptionTextSelected: { color: colors.purple[600], fontWeight: '600' },
  categoryToggle: { flexDirection: 'row', gap: 12, marginTop: 8 },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
    alignItems: 'center',
  },
  categoryButtonActive: { backgroundColor: colors.purple[50], borderColor: colors.purple[500] },
  categoryButtonActiveNegative: { backgroundColor: colors.gold[50], borderColor: colors.gold[500] },
  categoryButtonText: { fontSize: 15, color: colors.text.secondary, fontWeight: '500' },
  categoryButtonTextActive: { color: colors.text.primary, fontWeight: '600' },
  categoryHint: { fontSize: 13, color: colors.text.muted, marginTop: 8, textAlign: 'center' },
  saveMetricButton: { marginTop: 8 },
});
