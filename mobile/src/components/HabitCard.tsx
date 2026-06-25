import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { upsertEntry, toggleArchive, deleteHabit } from '../api/habits';
import StreakBadge from './StreakBadge';

interface HabitCardProps {
  habit: Habit;
  onUpdate: (habit: Habit) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function calculateStreak(entries: Habit['entries']): number {
  const entryMap = new Map(entries.map((e) => [e.date, e.completed]));
  let streak = 0;
  let checkDate = getTodayString();

  while (true) {
    const completed = entryMap.get(checkDate);
    if (completed === true) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (completed === false) {
      break;
    } else {
      if (checkDate === getTodayString()) {
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }
  return streak;
}

export default function HabitCard({ habit, onUpdate, onArchive, onDelete }: HabitCardProps) {
  const today = getTodayString();
  const todayEntry = habit.entries.find((e) => e.date === today);
  const [completed, setCompleted] = useState(todayEntry?.completed ?? false);
  const [comment, setComment] = useState(todayEntry?.comment ?? '');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const expandHeight = useSharedValue(0);
  const streak = calculateStreak(habit.entries);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value,
    opacity: expandHeight.value > 0 ? 1 : 0,
    overflow: 'hidden' as const,
  }));

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    expandHeight.value = withTiming(next ? 200 : 0, { duration: 250 });
  };

  const handleToggleComplete = useCallback(async () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    try {
      const updated = await upsertEntry(habit._id, {
        date: today,
        completed: newCompleted,
        comment,
      });
      onUpdate(updated);
    } catch {
      setCompleted(!newCompleted);
      Alert.alert('Error', 'Failed to update habit');
    }
  }, [completed, comment, habit._id, onUpdate, today]);

  const handleCommentBlur = async () => {
    try {
      const updated = await upsertEntry(habit._id, {
        date: today,
        completed,
        comment,
      });
      onUpdate(updated);
    } catch {
      Alert.alert('Error', 'Failed to save comment');
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      await toggleArchive(habit._id);
      onArchive(habit._id);
    } catch {
      Alert.alert('Error', 'Failed to archive habit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Delete "${habit.title}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteHabit(habit._id);
            onDelete(habit._id);
          } catch {
            Alert.alert('Error', 'Failed to delete habit');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="bg-white rounded-2xl shadow-md mb-3 mx-4 overflow-hidden">
      <View className="p-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={handleToggleComplete}
            hitSlop={8}
            className={`w-7 h-7 rounded-lg border-2 items-center justify-center mr-3 ${
              completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
            }`}
          >
            {completed && <Ionicons name="checkmark" size={18} color="#fff" />}
          </Pressable>

          <Pressable onPress={toggleExpand} className="flex-1 flex-row items-center">
            <View className="flex-1">
              <Text
                className={`text-base font-semibold text-gray-800 ${
                  completed ? 'line-through text-gray-400' : ''
                }`}
              >
                {habit.title}
              </Text>
              <StreakBadge streak={streak} />
            </View>

            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9ca3af"
            />
          </Pressable>
        </View>
      </View>

      <Animated.View style={animatedStyle}>
        <View className="bg-gray-50 px-4 pb-4 pt-2 border-t border-gray-100">
          <Text className="text-sm text-gray-500 mb-1">Today's note</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 mb-3"
            placeholder="Add a comment..."
            placeholderTextColor="#9ca3af"
            value={comment}
            onChangeText={setComment}
            onBlur={handleCommentBlur}
            onSubmitEditing={handleCommentBlur}
            multiline
          />

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleArchive}
              disabled={loading}
              className="flex-1 flex-row items-center justify-center bg-amber-100 py-2.5 rounded-xl"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#f59e0b" />
              ) : (
                <>
                  <Ionicons name="archive-outline" size={18} color="#f59e0b" />
                  <Text className="text-amber-600 font-semibold ml-1.5">Archive</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={loading}
              className="flex-1 flex-row items-center justify-center bg-red-100 py-2.5 rounded-xl"
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text className="text-red-500 font-semibold ml-1.5">Delete</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
