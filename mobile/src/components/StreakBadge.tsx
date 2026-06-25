import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak <= 0) return null;

  return (
    <View className="flex-row items-center mt-1">
      <Text className="text-sm text-green-600 font-medium">🔥 {streak} day streak</Text>
    </View>
  );
}

export function StreakBadgeInline({ streak }: StreakBadgeProps) {
  if (streak <= 0) return null;
  return (
    <View className="flex-row items-center">
      <Ionicons name="flame" size={14} color="#22c55e" />
      <Text className="text-xs text-green-600 font-medium ml-1">{streak} days</Text>
    </View>
  );
}
