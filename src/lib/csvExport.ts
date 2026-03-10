import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { DailyLog } from '../types';
import { CustomMetric } from '../types';

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportLogsAsCsv(
  logs: Record<string, DailyLog>,
  customMetrics: CustomMetric[]
) {
  const sortedLogs = Object.values(logs).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  if (sortedLogs.length === 0) {
    Alert.alert('No Data', 'There are no logs to export yet.');
    return;
  }

  // Build headers
  const baseHeaders = [
    'Date',
    'Building (min)',
    'Marketing (min)',
    'Leveling Up (min)',
    'Workout (min)',
    'Drinks',
    'TV (min)',
    'Mood (0-100)',
    'Reflection',
    'Vacation',
  ];

  // Add custom metric headers (non-system only, since system ones are already columns)
  const nonSystemMetrics = customMetrics.filter((m) => !m.isSystemMetric);
  const customHeaders = nonSystemMetrics.map((m) => escapeCsvValue(m.name));

  const headers = [...baseHeaders, ...customHeaders];

  // Build rows
  const rows = sortedLogs.map((log) => {
    const baseValues = [
      log.date,
      String(log.buildingMinutes),
      String(log.marketingMinutes),
      String(log.levelingUpMinutes),
      String(log.workoutMinutes),
      String(log.drinks),
      String(log.tvMinutes),
      String(log.moodScore),
      escapeCsvValue(log.reflection || ''),
      log.isVacation ? 'Yes' : 'No',
    ];

    const customValues = nonSystemMetrics.map((m) =>
      String(log.customMetrics?.[m.id] ?? 0)
    );

    return [...baseValues, ...customValues];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  );

  // Write and share
  const fileName = `golden-loopz-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const file = new File(Paths.cache, fileName);

  try {
    file.write(csvContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
  } catch (error) {
    Alert.alert(
      'Export Failed',
      'Something went wrong while exporting your data.'
    );
  }
}
