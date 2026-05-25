import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, OccurrenceStatus } from '../types';

interface AlertsScreenProps {
  notifications: Notification[];
  onMarkRead:    (id: string) => void;
  onMarkAllRead: () => void;
}

const STATUS_COLOR: Record<OccurrenceStatus, { color: string; bg: string; icon: any }> = {
  'Pendente':     { color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  'Em análise':   { color: '#2563EB', bg: '#EEF3FF', icon: 'search-outline' },
  'Em andamento': { color: '#7C3AED', bg: '#F3F0FF', icon: 'construct-outline' },
  'Resolvido':    { color: '#059669', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
};

export function AlertsScreen({ notifications, onMarkRead, onMarkAllRead }: AlertsScreenProps) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <View style={al.root}>
      <View style={al.header}>
        <View>
          <Text style={al.headerTitle}>Alertas</Text>
          <Text style={al.headerSub}>{unread > 0 ? `${unread} não lida(s)` : 'Tudo em dia ✓'}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity style={al.markAllBtn} onPress={onMarkAllRead} activeOpacity={0.8}>
            <Ionicons name="checkmark-done-outline" size={14} color="#2563EB" />
            <Text style={al.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={al.empty}>
          <View style={al.emptyIcon}><Ionicons name="notifications-off-outline" size={40} color="#A0AAB4" /></View>
          <Text style={al.emptyTitle}>Sem notificações</Text>
          <Text style={al.emptySub}>Você será avisado(a) quando o status de uma ocorrência for atualizado.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          {notifications.map(notif => {
            const cfg = STATUS_COLOR[notif.newStatus];
            return (
              <TouchableOpacity key={notif.id} style={[al.card, !notif.read && al.cardUnread]} onPress={() => onMarkRead(notif.id)} activeOpacity={0.8}>
                <View style={[al.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={al.notifTitle}>Protocolo #{notif.protocol}</Text>
                  <Text style={al.notifMsg}>{notif.message}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View style={[al.statusPill, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                      <Text style={[al.statusText, { color: cfg.color }]}>{notif.newStatus}</Text>
                    </View>
                    <Text style={al.time}>{notif.dateTime}</Text>
                  </View>
                </View>
                {!notif.read && <View style={al.dot} />}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const al = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F7F8FA' },
  header:      { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSub:   { fontSize: 12, color: '#A0AAB4', marginTop: 2 },
  markAllBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF3FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  markAllText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  card:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E8ECF2' },
  cardUnread:  { borderLeftWidth: 3, borderLeftColor: '#2563EB' },
  iconWrap:    { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTitle:  { fontSize: 13, fontWeight: '700', color: '#111827' },
  notifMsg:    { fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 2 },
  statusPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:  { fontSize: 11, fontWeight: '700' },
  time:        { fontSize: 11, color: '#A0AAB4' },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginTop: 4 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:   { width: 84, height: 84, borderRadius: 42, backgroundColor: '#E8ECF2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptySub:    { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
