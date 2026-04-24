import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { get, post } from '../../../services/api';
import { Colors, FontSize, Spacing, BorderRadius } from '../../../constants/theme';
import type { Transaction } from 'shared';

export default function PaymentsScreen() {
  const qc = useQueryClient();

  const { data: transactions, isLoading, refetch, isRefetching } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => get<Transaction[]>('/transactions'),
  });

  const payMutation = useMutation({
    mutationFn: (transactionId: string) => post(`/transactions/${transactionId}/pay`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert('תשלום בוצע', 'התשלום התקבל בהצלחה');
    },
    onError: () => {
      Alert.alert('שגיאה', 'התשלום נכשל. אנא נסה שנית.');
    },
  });

  const handlePay = (id: string) => {
    Alert.alert(
      'אישור תשלום',
      'האם לבצע את התשלום?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'שלם', onPress: () => payMutation.mutate(id) },
      ],
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.amount}>₪{item.amount.toLocaleString('he-IL')}</Text>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('he-IL')}</Text>
        </View>
        {item.status === 'pending' && (
          <Pressable
            style={styles.payButton}
            onPress={() => handlePay(item._id)}
            disabled={payMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel={`שלם ${item.amount} שקל`}
          >
            <Text style={styles.payButtonText}>שלם</Text>
          </Pressable>
        )}
        {item.status === 'paid' && (
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>שולם ✓</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>תשלומים</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xxl }} color={Colors.primaryLight} />
      ) : (
        <FlatList
          data={transactions}
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
            <Text style={styles.empty}>אין תשלומים פעילים</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  amount: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  type: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  date: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 2 },
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  payButtonText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  paidBadge: {
    backgroundColor: Colors.accent + '22',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  paidText: { color: Colors.accent, fontWeight: '600', fontSize: FontSize.sm },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xxl, fontSize: FontSize.md },
});
