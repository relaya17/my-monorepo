import { ScrollView, View, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../services/api';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import type { BuildingMetrics } from 'shared';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardStats {
  openTickets: number;
  pendingPayments: number;
  unreadNotifications: number;
  nextMeeting: string | null;
  buildingMetrics: BuildingMetrics | null;
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={[styles.statCard, Shadow.card]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => get<DashboardStats>('/dashboard'),
    staleTime: 60_000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'בוקר טוב';
    if (h < 18) return 'צהריים טובים';
    return 'ערב טוב';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primaryLight}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.name ?? 'דייר'}</Text>
        </View>

        {/* Quick stats */}
        {isLoading ? (
          <Text style={styles.loadingText}>טוען נתונים…</Text>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              label="תקלות פתוחות"
              value={data?.openTickets ?? 0}
              color={data?.openTickets ? Colors.warning : Colors.accent}
            />
            <StatCard
              label="תשלומים ממתינים"
              value={data?.pendingPayments ?? 0}
              color={data?.pendingPayments ? Colors.danger : Colors.accent}
            />
            <StatCard
              label="התראות חדשות"
              value={data?.unreadNotifications ?? 0}
              color={data?.unreadNotifications ? Colors.primaryLight : Colors.accent}
            />
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>פעולות מהירות</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/maintenance/index')}
            accessibilityRole="button"
          >
            <Text style={styles.actionEmoji}>🔧</Text>
            <Text style={styles.actionLabel}>דווח על תקלה</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/payments/index')}
            accessibilityRole="button"
          >
            <Text style={styles.actionEmoji}>💳</Text>
            <Text style={styles.actionLabel}>שלם דמי ועד</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/notifications/index')}
            accessibilityRole="button"
          >
            <Text style={styles.actionEmoji}>🔔</Text>
            <Text style={styles.actionLabel}>התראות</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/profile/index')}
            accessibilityRole="button"
          >
            <Text style={styles.actionEmoji}>👤</Text>
            <Text style={styles.actionLabel}>הפרופיל שלי</Text>
          </Pressable>
        </View>

        {/* Next meeting */}
        {data?.nextMeeting && (
          <View style={styles.meetingCard}>
            <Text style={styles.meetingTitle}>האסיפה הקרובה</Text>
            <Text style={styles.meetingDate}>{data.nextMeeting}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.xl },
  greeting: { fontSize: FontSize.lg, color: Colors.textSecondary },
  userName: { fontSize: FontSize.display, fontWeight: '700', color: Colors.textPrimary },
  loadingText: { color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.xl },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionEmoji: { fontSize: 28, marginBottom: Spacing.sm },
  actionLabel: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500', textAlign: 'center' },
  meetingCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  meetingTitle: { fontSize: FontSize.sm, color: Colors.white, opacity: 0.8 },
  meetingDate: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white, marginTop: 4 },
});
