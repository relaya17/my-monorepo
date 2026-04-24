import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { get, post } from '../../../services/api';
import { Colors, FontSize, Spacing, BorderRadius } from '../../../constants/theme';
import type { MaintenanceTicket } from 'shared';

const STATUS_COLOR: Record<string, string> = {
  open: Colors.warning,
  in_progress: Colors.primaryLight,
  resolved: Colors.accent,
  closed: Colors.textDisabled,
};

const STATUS_LABEL: Record<string, string> = {
  open: 'פתוחה',
  in_progress: 'בטיפול',
  resolved: 'נפתרה',
  closed: 'סגורה',
};

interface NewTicketForm {
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const INITIAL_FORM: NewTicketForm = {
  title: '',
  description: '',
  location: '',
  priority: 'medium',
};

export default function MaintenanceScreen() {
  const qc = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<NewTicketForm>(INITIAL_FORM);

  const { data: tickets, isLoading, refetch, isRefetching } = useQuery<MaintenanceTicket[]>({
    queryKey: ['maintenance'],
    queryFn: () => get<MaintenanceTicket[]>('/maintenance'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: NewTicketForm) => post('/maintenance', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      setModalVisible(false);
      setForm(INITIAL_FORM);
    },
    onError: () => {
      Alert.alert('שגיאה', 'לא ניתן היה לפתוח את הקריאה. נסה שנית.');
    },
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('שגיאה', 'יש למלא כותרת ותיאור');
      return;
    }
    createMutation.mutate(form);
  };

  const renderTicket = ({ item }: { item: MaintenanceTicket }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '33' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
            {STATUS_LABEL[item.status] ?? item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.cardDate}>
        {new Date(item.createdAt).toLocaleDateString('he-IL')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>קריאות תחזוקה</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="פתח קריאת תחזוקה חדשה"
        >
          <Text style={styles.addButtonText}>+ קריאה חדשה</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xxl }} color={Colors.primaryLight} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={renderTicket}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primaryLight}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>אין קריאות תחזוקה פתוחות</Text>
          }
        />
      )}

      {/* New ticket modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>ביטול</Text>
            </Pressable>
            <Text style={styles.modalTitle}>קריאה חדשה</Text>
            <Pressable onPress={handleSubmit} disabled={createMutation.isPending}>
              <Text style={[styles.modalSave, createMutation.isPending && { opacity: 0.5 }]}>שמור</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>כותרת *</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
              placeholder="תיאור קצר של הבעיה"
              placeholderTextColor={Colors.textDisabled}
            />

            <Text style={styles.label}>תיאור מפורט *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
              placeholder="תאר את הבעיה בפירוט"
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>מיקום</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(t) => setForm((f) => ({ ...f, location: t }))}
              placeholder="לדוגמה: חדר מדרגות קומה 2"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  addButtonText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right' },
  statusBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  cardDate: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 6, textAlign: 'right' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xxl, fontSize: FontSize.md },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  modalCancel: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalSave: { fontSize: FontSize.md, color: Colors.primaryLight, fontWeight: '600' },
  form: { padding: Spacing.lg, gap: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
});
