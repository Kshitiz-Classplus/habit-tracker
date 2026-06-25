import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TodayScreen from '../screens/TodayScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ArchiveScreen from '../screens/ArchiveScreen';

export type BottomTabParamList = {
  Today: undefined;
  Analytics: undefined;
  Archive: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f3f4f6',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle';
          if (route.name === 'Analytics') iconName = 'bar-chart';
          else if (route.name === 'Archive') iconName = 'archive';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Archive" component={ArchiveScreen} />
    </Tab.Navigator>
  );
}
