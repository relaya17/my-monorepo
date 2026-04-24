import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { get, put } from '../../../services/api';
import { Colors, FontSize, Spacing, BorderRadius } from '../../../constants/theme';
import type { Notification } from 'shared';

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => get<Notification[]>('/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => put('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = data?.filter((n) => !n.read).length ?? 0;

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => !item.read && markReadMutation.mutate(item._id)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {!item.read && <View style={styles.unreadDot} />}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('he-IL')}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          התראות {unreadCount > 0 && <Text style={styles.badge}>({unreadCount})</Text>}
        </Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            accessibilityRole="button"
          >
            <Text style={styles.markAll}>סמן הכל כנקרא</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xxl }} color={Colors.primaryLight} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primaryLight}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>אין התראות חדשות</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  badge: { color: Colors.primaryLight },
  markAll: { fontSize: FontSize.sm, color: Colors.primaryLight },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  cardUnread: { borderColor: Colors.primaryLight + '66', backgroundColor: Colors.primary + '11' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
    marginTop: 6,
    marginLeft: 8,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right' },
  cardBody: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  cardDate: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 6, textAlign: 'right' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xxl, fontSize: FontSize.md },
});
