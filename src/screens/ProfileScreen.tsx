import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Switch,
  Image,
  Linking,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Trash2, ChevronDown, Pencil, RotateCcw } from 'lucide-react-native';
import { useGoalsStore } from '../state/goalsStore';
import { useOnboardingStore } from '../state/onboardingStore';
import { useCustomMetricsStore, getUnitLabel, getUnitDisplayLabel } from '../state/customMetricsStore';
import { useAnalytics, ANALYTICS_EVENTS } from '../lib/analytics';
import { colors } from '../constants/colors';
import Button from '../components/ui/Button';
import { CustomMetric, MetricUnitType, SYSTEM_METRIC_IDS } from '../types';

interface GoalInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  description?: string;
  iconSource?: number;
}

function GoalInput({ label, value, onChange, suffix, description, iconSource }: GoalInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (text: string) => {
    setInputValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  };

  return (
    <View style={styles.goalInput}>
      <View style={styles.goalLabelRow}>
        {iconSource && (
          <Image source={iconSource} style={styles.goalLabelIcon} resizeMode="contain" />
        )}
        <Text style={styles.goalLabel}>{label}</Text>
      </View>
      {description && <Text style={styles.goalDescription}>{description}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          value={inputValue}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          style={styles.textInput}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

// Custom metric item in the list
interface CustomMetricItemProps {
  metric: CustomMetric;
  onEdit: () => void;
  onDelete: () => void;
}

function CustomMetricItem({ metric, onEdit, onDelete }: CustomMetricItemProps) {
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

// Unit type selector dropdown
interface UnitTypeSelectorProps {
  value: MetricUnitType;
  onChange: (value: MetricUnitType) => void;
}

function UnitTypeSelector({ value, onChange }: UnitTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options: MetricUnitType[] = ['minutes', 'hours', 'count', 'boolean'];

  return (
    <View style={styles.unitSelector}>
      <Text style={styles.goalLabel}>Unit Type</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>{getUnitDisplayLabel(value)}</Text>
        <ChevronDown size={18} color={colors.text.secondary} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option && styles.dropdownOptionTextSelected,
                ]}
              >
                {getUnitDisplayLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Add/Edit metric modal
interface MetricModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (metric: Omit<CustomMetric, 'id' | 'createdAt' | 'isActive'>) => void;
  editingMetric?: CustomMetric | null;
}

function MetricModal({ visible, onClose, onSave, editingMetric }: MetricModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitType, setUnitType] = useState<MetricUnitType>('count');
  const [category, setCategory] = useState<'positive' | 'negative'>('positive');
  const [weeklyGoal, setWeeklyGoal] = useState('');

  const isEditing = !!editingMetric;
  const isSystemMetric = editingMetric?.isSystemMetric ?? false;

  // Populate form when editing
  useEffect(() => {
    if (editingMetric) {
      setName(editingMetric.name);
      setDescription(editingMetric.description || '');
      setUnitType(editingMetric.unitType);
      setCategory(editingMetric.category);
      setWeeklyGoal(editingMetric.weeklyGoal.toString());
    } else {
      // Reset form for new metric
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
      color: editingMetric?.color || '', // Keep existing color or auto-assign
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Metric' : 'Add Custom Metric'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.goalLabel}>Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Reading, Meditation"
              style={[styles.textInput, isSystemMetric && styles.disabledInput]}
              placeholderTextColor={colors.text.muted}
              editable={!isSystemMetric}
            />
            {isSystemMetric && (
              <Text style={styles.systemMetricHint}>System metrics cannot be renamed</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.goalLabel}>Description</Text>
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
            <Text style={styles.goalLabel}>Category</Text>
            <View style={styles.categoryToggle}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  category === 'positive' && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory('positive')}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === 'positive' && styles.categoryButtonTextActive,
                  ]}
                >
                  Positive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  category === 'negative' && styles.categoryButtonActiveNegative,
                ]}
                onPress={() => setCategory('negative')}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === 'negative' && styles.categoryButtonTextActive,
                  ]}
                >
                  Negative
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.categoryHint}>
              {category === 'positive'
                ? 'Track progress toward a goal'
                : 'Track usage against a limit'}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.goalLabel}>
              Weekly {category === 'negative' ? 'Limit' : 'Goal'} *
            </Text>
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

          <Button
            title={isEditing ? 'Save Changes' : 'Add Metric'}
            onPress={handleSave}
            style={styles.saveMetricButton}
          />

          <View style={styles.modalBottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { trackScreen, trackEvent } = useAnalytics();
  const goals = useGoalsStore((state) => state.goals);
  const updateGoals = useGoalsStore((state) => state.updateGoals);
  const vacationMode = useGoalsStore((state) => state.vacationMode);
  const toggleVacationMode = useGoalsStore((state) => state.toggleVacationMode);

  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const addMetric = useCustomMetricsStore((state) => state.addMetric);
  const updateMetric = useCustomMetricsStore((state) => state.updateMetric);
  const deleteMetric = useCustomMetricsStore((state) => state.deleteMetric);

  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);

  const [localGoals, setLocalGoals] = useState(goals);
  const [hasChanges, setHasChanges] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<CustomMetric | null>(null);
  const [isMidasOpen, setIsMidasOpen] = useState(false);
  const youtubeVideoUrl =
    'https://www.youtube.com/watch?v=RH7REzcVjMI&list=TLGGAo6pkrodJE0xNDAxMjAyNg';

  useEffect(() => {
    trackScreen(ANALYTICS_EVENTS.SCREEN_PROFILE);
  }, []);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const handleGoalChange = (key: keyof typeof goals, value: number) => {
    setLocalGoals((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateGoals(localGoals);
    trackEvent(ANALYTICS_EVENTS.GOAL_UPDATED, {
      building_hours: localGoals.buildingHours,
      marketing_hours: localGoals.marketingHours,
      leveling_up_hours: localGoals.levelingUpHours,
      workout_count: localGoals.workoutCount,
    });
    setHasChanges(false);
    Alert.alert('Success', 'Goals saved successfully!');
  };

  const handleVacationToggle = () => {
    toggleVacationMode();
  };

  const handleOpenAddModal = () => {
    setEditingMetric(null);
    setShowMetricModal(true);
  };

  const handleOpenEditModal = (metric: CustomMetric) => {
    setEditingMetric(metric);
    setShowMetricModal(true);
  };

  const handleCloseModal = () => {
    setShowMetricModal(false);
    setEditingMetric(null);
  };

  const handleSaveMetric = (metricData: Omit<CustomMetric, 'id' | 'createdAt' | 'isActive'>) => {
    if (editingMetric) {
      // Update existing metric
      updateMetric(editingMetric.id, metricData);
      Alert.alert('Success', `"${metricData.name}" has been updated!`);
    } else {
      // Add new metric
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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMetric(metric.id),
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again. Your data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: resetOnboarding,
        },
      ]
    );
  };

  const handleOpenYoutubeVideo = async () => {
    const canOpen = await Linking.canOpenURL(youtubeVideoUrl);
    if (!canOpen) {
      Alert.alert('Unable to open link', 'Please try again later.');
      return;
    }
    await Linking.openURL(youtubeVideoUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('../../assets/tab_title.png')}
            style={styles.headerTitleImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Meet Midas Accordion */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setIsMidasOpen((prev) => !prev)}
            activeOpacity={1}
          >
            <View style={styles.accordionTitleRow}>
              <Image
                source={require('../../Logo_Ourofox.png')}
                style={styles.accordionIcon}
                resizeMode="contain"
              />
              <Text style={styles.accordionTitle}>Meet Midas, the Ourofox</Text>
            </View>
            <ChevronDown
              size={20}
              color={colors.text.secondary}
              style={[styles.accordionChevron, isMidasOpen && styles.accordionChevronOpen]}
            />
          </TouchableOpacity>
          {isMidasOpen && (
            <Text style={styles.accordionText}>
              As part fox, Midas is clever, resourceful, and entrepreneurial — just like the solopreneurs he guides.
              {'\n\n'}
              As part ouroboros, he embodies the endless loop of habits and systems that compound into success.
              {'\n\n'}
              Midas' name reminds you that everything you touch with a few consistent looping habits can turn to gold.
            </Text>
          )}
        </View>

        {/* Vacation Mode */}
        <View style={styles.card}>
          <View style={styles.vacationRow}>
            <View style={styles.vacationInfo}>
              <View style={styles.vacationTitleRow}>
                <Image
                  source={require('../../assets/palm-tree.png')}
                  style={styles.palmIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>Vacation Mode</Text>
              </View>
              <Text style={styles.vacationDescription}>
                Pause streak tracking while you're away. Your progress won't be lost.
              </Text>
            </View>
            <Switch
              value={vacationMode.isActive}
              onValueChange={handleVacationToggle}
              trackColor={{ false: colors.slate[200], true: colors.purple[300] }}
              thumbColor={vacationMode.isActive ? colors.purple[500] : colors.slate[400]}
            />
          </View>
          {vacationMode.isActive && (
            <View style={styles.vacationActiveIndicator}>
              <Text style={styles.vacationActiveText}>
                Vacation mode is active - streaks are paused
              </Text>
            </View>
          )}
        </View>

        {/* Golden Hours Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/Gold_Bar.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <Text style={styles.sectionTitle}>Goals: Golden Hours</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Your core productivity metrics for building, marketing, and learning
          </Text>

          <GoalInput
            label="Building"
            value={localGoals.buildingHours}
            onChange={(v) => handleGoalChange('buildingHours', v)}
            suffix="hours/week"
            description="Creating products, writing code, designing"
            iconSource={require('../../assets/pickaxe.png')}
          />

          <GoalInput
            label="Marketing"
            value={localGoals.marketingHours}
            onChange={(v) => handleGoalChange('marketingHours', v)}
            suffix="hours/week"
            description="Distribution, writing, outreach, audience growth"
            iconSource={require('../../assets/megaphone.png')}
          />

          <GoalInput
            label="Learning"
            value={localGoals.levelingUpHours}
            onChange={(v) => handleGoalChange('levelingUpHours', v)}
            suffix="hours/week"
            description="Learning, reading, courses, tutorials"
            iconSource={require('../../assets/goldenyoutube.png')}
          />
        </View>

        {/* Custom Metrics Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goals: Custom Metrics</Text>
          <Text style={styles.sectionSubtitle}>
            Additional metrics to track your wellbeing and habits
          </Text>

          {/* Custom Metrics List */}
          {customMetrics.filter(m => m.isActive).map((metric) => (
            <CustomMetricItem
              key={metric.id}
              metric={metric}
              onEdit={() => handleOpenEditModal(metric)}
              onDelete={() => handleDeleteMetric(metric)}
            />
          ))}

          {/* Add Custom Metric Button */}
          <TouchableOpacity
            style={styles.addMetricButton}
            onPress={handleOpenAddModal}
          >
            <Plus size={20} color={colors.purple[500]} />
            <Text style={styles.addMetricButtonText}>Add Custom Metric</Text>
          </TouchableOpacity>
        </View>

        {/* Reset Onboarding */}
        <TouchableOpacity
          style={styles.resetOnboardingButton}
          onPress={handleResetOnboarding}
          activeOpacity={0.7}
        >
          <RotateCcw size={18} color={colors.text.muted} />
          <Text style={styles.resetOnboardingText}>Reset Onboarding</Text>
        </TouchableOpacity>

        {/* YouTube Video */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Watch the video that inspired this app.</Text>
          <TouchableOpacity
            style={styles.videoCard}
            onPress={handleOpenYoutubeVideo}
            activeOpacity={0.8}
            accessibilityRole="link"
            accessibilityLabel="Open YouTube video: How to Build a Business Part-Time"
          >
            <Image
              source={require('../../assets/YouTubeVideo.png')}
              style={styles.videoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Golden Loopz v1.0.0</Text>
        </View>

        <View style={[styles.bottomSpacer, hasChanges && styles.bottomSpacerWithSave]} />
      </ScrollView>

      {/* Sticky Save Button */}
      {hasChanges && (
        <View style={styles.stickySaveContainer}>
          <Button title="Save Goals" onPress={handleSave} style={styles.stickySaveButton} />
        </View>
      )}

      {/* Add/Edit Metric Modal */}
      <MetricModal
        visible={showMetricModal}
        onClose={handleCloseModal}
        onSave={handleSaveMetric}
        editingMetric={editingMetric}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLogo: {
    width: 56,
    height: 56,
    marginRight: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitleImage: {
    width: 200,
    height: 48,
    maxWidth: '70%',
    alignSelf: 'flex-start',
  },
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
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  accordionIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
    alignSelf: 'center',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 0,
    lineHeight: 24,
  },
  accordionChevron: {
    transform: [{ rotate: '0deg' }],
  },
  accordionChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  accordionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 12,
  },
  otherMetricsCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.purple[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 0,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    marginTop: -8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    marginTop: -8,
  },
  vacationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vacationInfo: {
    flex: 1,
    marginRight: 16,
  },
  vacationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  palmIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  vacationDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  vacationActiveIndicator: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.purple[50],
    borderRadius: 8,
  },
  vacationActiveText: {
    fontSize: 14,
    color: colors.purple[600],
    textAlign: 'center',
  },
  goalInput: {
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  goalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLabelIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  goalDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  iconInput: {
    flex: 0,
    width: 80,
    textAlign: 'center',
  },
  suffix: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
  },
  stickySaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stickySaveButton: {
    marginBottom: 0,
  },
  limitsDivider: {
    height: 1,
    backgroundColor: colors.slate[200],
    marginVertical: 16,
  },
  limitsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  customMetricInfo: {
    flex: 1,
  },
  customMetricName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  customMetricNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customMetricIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  customMetricGoal: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  disabledInput: {
    backgroundColor: colors.slate[100],
    color: colors.text.muted,
  },
  systemMetricHint: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
    fontStyle: 'italic',
  },
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
  addMetricButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.purple[500],
    marginLeft: 8,
  },
  resetOnboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  resetOnboardingText: {
    fontSize: 14,
    color: colors.text.muted,
    marginLeft: 8,
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  videoImage: {
    width: '100%',
    height: 240,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  bottomSpacer: {
    height: 32,
  },
  bottomSpacerWithSave: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  unitSelector: {
    position: 'relative',
    zIndex: 10,
  },
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
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
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
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  dropdownOptionSelected: {
    backgroundColor: colors.purple[50],
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  dropdownOptionTextSelected: {
    color: colors.purple[600],
    fontWeight: '600',
  },
  categoryToggle: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.purple[50],
    borderColor: colors.purple[500],
  },
  categoryButtonActiveNegative: {
    backgroundColor: colors.gold[50],
    borderColor: colors.gold[500],
  },
  categoryButtonText: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  categoryHint: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  saveMetricButton: {
    marginTop: 8,
  },
  modalBottomSpacer: {
    height: 40,
  },
});
