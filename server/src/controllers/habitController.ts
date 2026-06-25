import { Response, NextFunction } from 'express';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/authMiddleware';

const getTodayString = (): string => new Date().toISOString().split('T')[0];

const getDateDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const calculateStreaks = (
  entries: { date: string; completed: boolean }[]
): { currentStreak: number; longestStreak: number } => {
  const entryMap = new Map(entries.map((e) => [e.date, e.completed]));

  let currentStreak = 0;
  const today = getTodayString();
  let checkDate = today;

  while (true) {
    const completed = entryMap.get(checkDate);
    if (completed === true) {
      currentStreak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (completed === false) {
      break;
    } else {
      // No entry for this date — only continue if we're checking today
      // (user might not have logged yet today)
      if (checkDate === today) {
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }

  const sortedDates = [...entryMap.keys()].sort();
  let longestStreak = 0;
  let tempStreak = 0;

  for (const date of sortedDates) {
    if (entryMap.get(date)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
};

export const getHabits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.userId, isArchived: false }).sort({
      createdAt: -1,
    });
    res.json(habits);
  } catch (err) {
    next(err);
  }
};

export const getArchivedHabits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.userId, isArchived: true }).sort({
      createdAt: -1,
    });
    res.json(habits);
  } catch (err) {
    next(err);
  }
};

export const createHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const habit = await Habit.create({
      userId: req.userId,
      title: title.trim(),
    });
    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
};

export const deleteHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleArchive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }
    habit.isArchived = !habit.isArchived;
    await habit.save();
    res.json(habit);
  } catch (err) {
    next(err);
  }
};

export const upsertEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, completed, comment } = req.body;
    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }

    const existingIndex = habit.entries.findIndex((e) => e.date === date);

    if (existingIndex >= 0) {
      const existing = habit.entries[existingIndex];
      habit.entries[existingIndex].completed =
        completed !== undefined ? completed : existing.completed;
      habit.entries[existingIndex].comment =
        comment !== undefined ? comment : existing.comment;
    } else {
      habit.entries.push({ date, completed: completed ?? false, comment: comment ?? '' });
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) {
      res.status(404).json({ message: 'Habit not found' });
      return;
    }

    const totalDays = 30;
    const last30Days: { date: string; completed: boolean }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = getDateDaysAgo(i);
      const entry = habit.entries.find((e) => e.date === date);
      last30Days.push({ date, completed: entry?.completed ?? false });
    }

    const completedDays = last30Days.filter((d) => d.completed).length;
    const completionRate = Math.round((completedDays / totalDays) * 1000) / 10;
    const { currentStreak, longestStreak } = calculateStreaks(habit.entries);

    res.json({
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
      longestStreak,
      last30Days,
    });
  } catch (err) {
    next(err);
  }
};
