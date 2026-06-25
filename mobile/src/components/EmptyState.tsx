import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function EmptyState({
  title,
  message,
  icon = 'leaf-outline',
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-indigo-50 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#4f46e5" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</Text>
      <Text className="text-base text-gray-500 text-center">{message}</Text>
    </View>
  );
}
