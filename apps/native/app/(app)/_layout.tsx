import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, focused }: { name: IoniconName; color: string; focused: boolean }) {
  return <Ionicons name={focused ? name : (`${name}-outline` as IoniconName)} size={24} color={color} />;
}

export default function AppLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'בית',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="maintenance/index"
        options={{
          title: 'תקלות',
          tabBarIcon: ({ color, focused }) => <TabIcon name="construct" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="payments/index"
        options={{
          title: 'תשלומים',
          tabBarIcon: ({ color, focused }) => <TabIcon name="card" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'התראות',
          tabBarIcon: ({ color, focused }) => <TabIcon name="notifications" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'פרופיל',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
