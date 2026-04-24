import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../../constants/theme';

interface MenuItemProps {
  label: string;
  emoji: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ label, emoji, onPress, danger = false }: MenuItemProps) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'יציאה',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התנתק', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, Shadow.card]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? '—'}</Text>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          {user?.apartmentNumber && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>דירה {user.apartmentNumber}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הגדרות</Text>
          <View style={styles.menu}>
            <MenuItem emoji="🔔" label="העדפות התראות" onPress={() => {}} />
            <MenuItem emoji="🔒" label="שינוי סיסמה" onPress={() => {}} />
            <MenuItem emoji="🌐" label="שפה" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מידע</Text>
          <View style={styles.menu}>
            <MenuItem emoji="📄" label="תנאי שימוש" onPress={() => {}} />
            <MenuItem emoji="🔏" label="מדיניות פרטיות" onPress={() => {}} />
            <MenuItem emoji="📞" label="צור קשר עם הועד" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menu}>
            <MenuItem emoji="🚪" label="התנתק" onPress={handleSignOut} danger />
          </View>
        </View>

        <Text style={styles.version}>גרסה 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  badge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary + '33',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: FontSize.sm, color: Colors.primaryLight, fontWeight: '600' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'right',
    paddingHorizontal: Spacing.sm,
  },
  menu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 52,
  },
  menuEmoji: { fontSize: 20, marginLeft: Spacing.sm },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  menuArrow: { fontSize: 20, color: Colors.textDisabled },
  version: {
    textAlign: 'center',
    color: Colors.textDisabled,
    fontSize: FontSize.xs,
    marginTop: Spacing.xl,
  },
});
