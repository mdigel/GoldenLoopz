import { DailyLog } from '../types';
import { subDays, format } from 'date-fns';

// Generate dummy data for the last 2 months
export function generateDummyLogs(): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate 60 days of data (roughly 2 months) INCLUDING today (i=0)
  for (let i = 0; i <= 60; i++) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Simulate realistic patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isVacationDay = i >= 25 && i <= 31; // One week vacation about a month ago

    // Random variations
    const productivity = Math.random();
    const hadGoodDay = productivity > 0.3;
    const hadGreatDay = productivity > 0.7;

    // Building minutes: 0-180 on weekdays, less on weekends
    let buildingMinutes = 0;
    if (!isVacationDay) {
      if (isWeekend) {
        buildingMinutes = hadGoodDay ? randomInRange(0, 90) : 0;
      } else {
        buildingMinutes = hadGreatDay
          ? randomInRange(90, 180)
          : hadGoodDay
          ? randomInRange(30, 90)
          : randomInRange(0, 30);
      }
    }

    // Marketing minutes: usually less than building
    let marketingMinutes = 0;
    if (!isVacationDay && hadGoodDay) {
      marketingMinutes = randomInRange(0, 60);
    }

    // Leveling up: reading, courses, learning
    let levelingUpMinutes = 0;
    if (!isVacationDay) {
      levelingUpMinutes = hadGoodDay ? randomInRange(0, 45) : 0;
    }

    // Workout: 3-5 times per week typically
    let workoutMinutes = 0;
    const worksOutToday = Math.random() > 0.4; // ~60% chance
    if (worksOutToday && !isVacationDay) {
      workoutMinutes = randomChoice([30, 45, 60, 75, 90]);
    }

    // Drinks: more on weekends, occasionally on weekdays
    let drinks = 0;
    if (isWeekend) {
      drinks = randomChoice([0, 0, 1, 2, 2, 3, 4]);
    } else {
      drinks = randomChoice([0, 0, 0, 0, 1, 1, 2]);
    }
    if (isVacationDay) {
      drinks = randomChoice([0, 1, 2, 3, 3, 4]);
    }

    // TV/Streaming: more on weekends and evenings
    let tvMinutes = 0;
    if (isWeekend) {
      tvMinutes = randomChoice([0, 30, 60, 90, 120, 150, 180]);
    } else {
      tvMinutes = randomChoice([0, 0, 30, 30, 60, 60, 90]);
    }
    if (isVacationDay) {
      tvMinutes = randomChoice([60, 90, 120, 150, 180, 240]);
    }

    // Mood: correlates somewhat with productivity
    let moodScore: number;
    if (isVacationDay) {
      moodScore = randomInRange(70, 95);
    } else if (hadGreatDay) {
      moodScore = randomInRange(65, 90);
    } else if (hadGoodDay) {
      moodScore = randomInRange(45, 70);
    } else {
      moodScore = randomInRange(25, 50);
    }

    // Reflections for some days
    const reflections = [
      'Shipped a new feature today. Feeling good about the progress.',
      'Struggled with a bug for hours but finally fixed it.',
      'Great workout this morning, set a new PR!',
      'Took it easy today, needed the rest.',
      'Productive morning, meetings in the afternoon.',
      'Finally finished that side project milestone.',
      'Read some great articles on system design.',
      'Caught up on emails and planning.',
      'Deep work session, got a lot done.',
      'Bit distracted today, but still made progress.',
      'Recorded a new video for the channel.',
      'Met with potential customers, got good feedback.',
      'Refactored some old code, feels cleaner now.',
      'Learning new framework, steep learning curve.',
      '',
      '',
      '', // Empty reflections are common
    ];

    const reflection = isVacationDay
      ? randomChoice(['Enjoying the vacation!', 'Beach day!', 'Exploring the city.', 'Rest and relaxation.', ''])
      : randomChoice(reflections);

    const now = new Date().toISOString();

    logs[dateString] = {
      id: `${dateString}_${Math.random().toString(36).substring(2, 9)}`,
      date: dateString,
      buildingMinutes: roundToIncrement(buildingMinutes, 15),
      marketingMinutes: roundToIncrement(marketingMinutes, 15),
      levelingUpMinutes: roundToIncrement(levelingUpMinutes, 15),
      workoutMinutes: roundToIncrement(workoutMinutes, 15),
      drinks,
      tvMinutes: roundToIncrement(tvMinutes, 30),
      moodScore: Math.round(moodScore),
      reflection,
      isVacation: isVacationDay,
      createdAt: now,
      updatedAt: now,
    };
  }

  return logs;
}

// Helper functions
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
