import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { getArchivedHabits, toggleArchive, deleteHabit } from '../api/habits';
import EmptyState from '../components/EmptyState';

export default function ArchiveScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArchived = useCallback(async () => {
    try {
      const data = await getArchivedHabits();
      setHabits(data);
    } catch {
      Alert.alert('Error', 'Failed to load archived habits');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchArchived().finally(() => setLoading(false));
  }, [fetchArchived]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArchived();
    setRefreshing(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await toggleArchive(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch {
      Alert.alert('Error', 'Failed to restore habit');
    }
  };

  const handleDelete = (habit: Habit) => {
    Alert.alert('Delete Habit', `Delete "${habit.title}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(habit._id);
            setHabits((prev) => prev.filter((h) => h._id !== habit._id));
          } catch {
            Alert.alert('Error', 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Archive</Text>
        <Text className="text-sm text-gray-500 mt-1">Restored habits return to Today</Text>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          title="No archived habits"
          message="Habits you archive will appear here"
          icon="archive-outline"
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl shadow-md p-4 mb-3 flex-row items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {item.entries.filter((e) => e.completed).length} completions
                </Text>
              </View>

              <Pressable
                onPress={() => handleRestore(item._id)}
                className="bg-indigo-100 px-3 py-2 rounded-xl mr-2 flex-row items-center"
              >
                <Ionicons name="arrow-undo-outline" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 font-semibold text-sm ml-1">Restore</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDelete(item)}
                className="bg-red-100 p-2 rounded-xl"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
