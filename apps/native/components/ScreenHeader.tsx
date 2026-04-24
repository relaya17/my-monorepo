import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = false, right }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="חזור"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={styles.right}>{right ?? <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    minHeight: 52,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  backButton: { padding: 4, minWidth: 36, minHeight: 44, justifyContent: 'center' },
  right: { minWidth: 36 },
  placeholder: { width: 36 },
});
