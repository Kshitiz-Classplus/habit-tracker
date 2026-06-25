import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { getHabits, createHabit } from '../api/habits';
import { formatDate, getTodayString } from '../utils/dateUtils';
import HabitList from '../components/HabitList';

export default function TodayScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch {
      Alert.alert('Error', 'Failed to load habits');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHabits().finally(() => setLoading(false));
  }, [fetchHabits]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  };

  const today = getTodayString();
  const completedToday = habits.filter((h) =>
    h.entries.find((e) => e.date === today && e.completed)
  ).length;
  const progress = habits.length > 0 ? completedToday / habits.length : 0;

  const handleUpdate = (updated: Habit) => {
    setHabits((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
  };

  const handleArchive = (id: string) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
  };

  const handleDelete = (id: string) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
  };

  const handleAddHabit = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const habit = await createHabit(newTitle.trim());
      setHabits((prev) => [habit, ...prev]);
      setNewTitle('');
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to create habit');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Today</Text>
        <Text className="text-sm text-gray-500 mt-1">{formatDate()}</Text>

        {habits.length > 0 && (
          <View className="mt-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-sm text-gray-500">Daily progress</Text>
              <Text className="text-sm font-semibold text-indigo-600">
                {completedToday}/{habits.length}
              </Text>
            </View>
            <View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <HabitList
          habits={habits}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      <Pressable
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">New Habit</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-4"
              placeholder="e.g. Drink 8 glasses of water"
              placeholderTextColor="#9ca3af"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <Pressable
              onPress={handleAddHabit}
              disabled={creating || !newTitle.trim()}
              className={`rounded-xl py-4 items-center ${
                newTitle.trim() ? 'bg-indigo-600' : 'bg-indigo-300'
              }`}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Add Habit</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
