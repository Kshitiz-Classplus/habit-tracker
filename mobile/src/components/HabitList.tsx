import { FlatList, RefreshControl } from 'react-native';
import { Habit } from '../types';
import HabitCard from './HabitCard';
import EmptyState from './EmptyState';

interface HabitListProps {
  habits: Habit[];
  refreshing: boolean;
  onRefresh: () => void;
  onUpdate: (habit: Habit) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitList({
  habits,
  refreshing,
  onRefresh,
  onUpdate,
  onArchive,
  onDelete,
}: HabitListProps) {
  if (habits.length === 0 && !refreshing) {
    return (
      <EmptyState
        title="No habits yet"
        message="Tap the + button to add your first habit and start building streaks!"
        icon="checkmark-circle-outline"
      />
    );
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          onUpdate={onUpdate}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
