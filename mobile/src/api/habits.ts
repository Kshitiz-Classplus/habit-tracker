import axiosClient from './axiosClient';
import { Habit, HabitAnalytics } from '../types';

export const getHabits = async (): Promise<Habit[]> => {
  const { data } = await axiosClient.get<Habit[]>('/habits');
  return data;
};

export const getArchivedHabits = async (): Promise<Habit[]> => {
  const { data } = await axiosClient.get<Habit[]>('/habits/archived');
  return data;
};

export const createHabit = async (title: string): Promise<Habit> => {
  const { data } = await axiosClient.post<Habit>('/habits', { title });
  return data;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await axiosClient.delete(`/habits/${id}`);
};

export const toggleArchive = async (id: string): Promise<Habit> => {
  const { data } = await axiosClient.patch<Habit>(`/habits/${id}/archive`);
  return data;
};

export const upsertEntry = async (
  id: string,
  entry: { date: string; completed?: boolean; comment?: string }
): Promise<Habit> => {
  const { data } = await axiosClient.patch<Habit>(`/habits/${id}/entry`, entry);
  return data;
};

export const getHabitAnalytics = async (id: string): Promise<HabitAnalytics> => {
  const { data } = await axiosClient.get<HabitAnalytics>(`/habits/${id}/analytics`);
  return data;
};
