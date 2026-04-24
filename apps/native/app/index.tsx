import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/theme';

/** Entry point — redirect based on auth state. */
export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
}
