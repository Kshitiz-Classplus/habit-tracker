import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Habit, HabitWithAnalytics } from '../types';
import { getHabits, getHabitAnalytics } from '../api/habits';
import { getTodayString, getLast7Days, getLast35Days, formatShortDay } from '../utils/dateUtils';
import { StreakBadgeInline } from '../components/StreakBadge';

const screenWidth = Dimensions.get('window').width;

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white rounded-2xl shadow-md p-4 mr-3 min-w-[140px]">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    </View>
  );
}

function HeatmapGrid({ entries }: { entries: Habit['entries'] }) {
  const days35 = getLast35Days();
  const today = getTodayString();
  const entryMap = new Map(entries.map((e) => [e.date, e.completed]));

  return (
    <View className="mt-2">
      <View className="flex-row flex-wrap" style={{ gap: 4 }}>
        {days35.map((date) => {
          const isFuture = date > today;
          const completed = entryMap.get(date);
          let bg = '#e5e7eb';
          if (!isFuture) {
            bg = completed ? '#22c55e' : completed === false ? '#d1d5db' : '#f3f4f6';
          }
          return (
            <View
              key={date}
              style={{
                width: (screenWidth - 64) / 7 - 4,
                height: (screenWidth - 64) / 7 - 4,
                backgroundColor: bg,
                borderRadius: 4,
              }}
            />
          );
        })}
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-gray-400">5 weeks ago</Text>
        <Text className="text-xs text-gray-400">Today</Text>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [habits, setHabits] = useState<HabitWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const habitList = await getHabits();
      const withAnalytics = await Promise.all(
        habitList.map(async (habit) => {
          const analytics = await getHabitAnalytics(habit._id);
          return { ...habit, analytics };
        })
      );
      setHabits(withAnalytics);
    } catch {
      Alert.alert('Error', 'Failed to load analytics');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const today = getTodayString();
  const totalHabits = habits.length;
  const avgCompletion =
    habits.length > 0
      ? Math.round(
          (habits.reduce((sum, h) => {
            const todayDone = h.entries.find((e) => e.date === today)?.completed ? 1 : 0;
            return sum + todayDone;
          }, 0) /
            habits.length) *
            100
        )
      : 0;
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.analytics?.longestStreak ?? 0),
    0
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900">Analytics</Text>
          <Text className="text-sm text-gray-500 mt-1">Track your progress over time</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 px-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <SummaryCard label="Total Habits" value={String(totalHabits)} />
          <SummaryCard label="Today Complete" value={`${avgCompletion}%`} />
          <SummaryCard label="Best Streak" value={`${bestStreak}d`} />
        </ScrollView>

        {habits.length === 0 ? (
          <View className="items-center py-16 px-8">
            <Text className="text-gray-500 text-center">
              Add habits on the Today tab to see analytics here.
            </Text>
          </View>
        ) : (
          <View className="px-4 mt-4">
            {habits.map((habit) => {
              const analytics = habit.analytics;
              const last7 = getLast7Days();
              const barData = last7.map((date) => {
                const entry = habit.entries.find((e) => e.date === date);
                return {
                  value: entry?.completed ? 1 : 0,
                  label: formatShortDay(date),
                  frontColor: entry?.completed ? '#22c55e' : '#e5e7eb',
                };
              });

              return (
                <View key={habit._id} className="bg-white rounded-2xl shadow-md p-4 mb-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-base font-semibold text-gray-800 flex-1 mr-2">
                      {habit.title}
                    </Text>
                    <StreakBadgeInline streak={analytics?.currentStreak ?? 0} />
                  </View>

                  <Text className="text-sm text-gray-500 mb-3">
                    {analytics?.completionRate ?? 0}% completion this month
                  </Text>

                  <Text className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    Last 7 days
                  </Text>
                  <BarChart
                    data={barData}
                    barWidth={28}
                    spacing={12}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    noOfSections={1}
                    maxValue={1}
                    height={80}
                    width={screenWidth - 80}
                  />

                  <Text className="text-xs text-gray-400 mt-4 mb-2 uppercase tracking-wide">
                    5-week heatmap
                  </Text>
                  <HeatmapGrid entries={habit.entries} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
