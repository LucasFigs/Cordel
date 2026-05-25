import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OccurrenceRecord } from '../types';
import { STATUS_CONFIG } from '../constants';
import { OccurrenceCard }      from '../components/OccurrenceCard';
import { EditOccurrenceModal } from '../components/EditOccurrenceModal';
import { useToast }            from '../hooks/useToast';
import { Toast }               from '../components/Toast';

interface HistoryScreenProps {
  userId:             string;
  occurrences:        OccurrenceRecord[];
  loading:            boolean;
  onNewOccurrence:    () => void;
  onDeleteOccurrence: (id: string) => Promise<void>;
  onEditOccurrence:   (updated: OccurrenceRecord) => Promise<void>;
  onRefresh:          () => Promise<void>;
}

export function HistoryScreen({ userId, occurrences, loading, onNewOccurrence, onDeleteOccurrence, onEditOccurrence, onRefresh }: HistoryScreenProps) {
  const [refreshing,   setRefreshing]   = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OccurrenceRecord['status'] | 'Todos'>('Todos');
  const [editTarget,   setEditTarget]   = useState<OccurrenceRecord | null>(null);
  const { toast, showSuccess, showError } = useToast();

  const allStatuses: (OccurrenceRecord['status'] | 'Todos')[] = ['Todos', 'Pendente', 'Em análise', 'Em andamento', 'Resolvido'];
  const mine     = occurrences.filter(o => o.userId === userId);
  const sorted   = [...mine].sort((a, b) => b.id.localeCompare(a.id));
  const filtered = filterStatus === 'Todos' ? sorted : sorted.filter(o => o.status === filterStatus);
  const pendingCount = mine.filter(o => o.status === 'Pendente').length;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(false);
    try { await onRefresh(); }
    catch { setRefreshError(true); }
    finally { setRefreshing(false); }
  }, [onRefresh]);

  const handleDelete = async (id: string) => {
    try { await onDeleteOccurrence(id); showSuccess('Ocorrência excluída com sucesso!'); }
    catch { showError('Falha ao excluir. Tente novamente.'); throw new Error('delete failed'); }
  };

  const handleEdit = async (updated: OccurrenceRecord) => {
    await onEditOccurrence(updated);
    showSuccess('Ocorrência atualizada com sucesso!');
  };

  return (
    <View style={hx.root}>
      <Toast toast={toast} />
      <View style={hx.header}>
        <View style={{ flex: 1 }}>
          <Text style={hx.headerTitle}>Minhas Ocorrências</Text>
          <Text style={hx.headerSub}>{mine.length} registro(s)</Text>
        </View>
        {pendingCount > 0 && (
          <View style={hx.pendingBadge}><Text style={hx.pendingBadgeText}>{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</Text></View>
        )}
      </View>

      {mine.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={hx.filterRow} style={hx.filterScroll}>
          {allStatuses.map(st => {
            const active = filterStatus === st;
            const cfg    = st !== 'Todos' ? STATUS_CONFIG[st] : null;
            return (
              <TouchableOpacity key={st} style={[hx.filterTab, active && { backgroundColor: cfg?.bg ?? '#EEF3FF', borderColor: cfg?.color ?? '#2563EB' }]} onPress={() => setFilterStatus(st)} activeOpacity={0.75}>
                {st !== 'Todos' && cfg && <View style={[hx.filterDot, { backgroundColor: cfg.color }]} />}
                <Text style={[hx.filterText, active && { color: cfg?.color ?? '#2563EB', fontWeight: '700' }]}>{st}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {mine.length > 0 && (
        <View style={hx.infoBanner}>
          <Ionicons name="information-circle-outline" size={14} color="#2563EB" />
          <Text style={hx.infoText}>Apenas ocorrências <Text style={{ fontWeight: '700' }}>Pendentes</Text> podem ser editadas ou excluídas.</Text>
        </View>
      )}

      {refreshError && (
        <View style={hx.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color="#E11D48" />
          <Text style={hx.errorBannerText}>Falha ao atualizar. Dados podem estar desatualizados.</Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ fontSize: 14, color: '#A0AAB4' }}>Carregando ocorrências…</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={hx.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563EB']} tintColor="#2563EB" title="Atualizando…" titleColor="#A0AAB4" />}
        >
          {filtered.length === 0 ? (
            mine.length === 0 ? (
              <View style={hx.emptyWrap}>
                <View style={hx.emptyIcon}><Ionicons name="clipboard-outline" size={38} color="#A0AAB4" /></View>
                <Text style={hx.emptyTitle}>Nenhum registro encontrado</Text>
                <Text style={hx.emptySub}>Você ainda não registrou nenhuma ocorrência.{'\n'}Puxe para baixo para atualizar.</Text>
                <TouchableOpacity style={hx.emptyBtn} onPress={onNewOccurrence} activeOpacity={0.85}>
                  <Ionicons name="add-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={hx.emptyBtnText}>Registrar Ocorrência</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={hx.emptyFilter}>
                <Ionicons name="filter-outline" size={32} color="#A0AAB4" />
                <Text style={hx.emptyFilterText}>Nenhuma ocorrência com status "{filterStatus}"</Text>
              </View>
            )
          ) : (
            filtered.map(item => (
              <OccurrenceCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onEdit={item.status === 'Pendente' ? setEditTarget : undefined}
              />
            ))
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {!loading && (
        <TouchableOpacity style={hx.fab} onPress={onNewOccurrence} activeOpacity={0.85}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      <EditOccurrenceModal
        visible={!!editTarget}
        occurrence={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={async (updated) => { await handleEdit(updated); setEditTarget(null); }}
      />
    </View>
  );
}

const hx = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#F7F8FA' },
  header:           { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2', gap: 12 },
  headerTitle:      { fontSize: 17, fontWeight: '800', color: '#111827' },
  headerSub:        { fontSize: 12, color: '#A0AAB4', marginTop: 1 },
  pendingBadge:     { backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FDE68A' },
  pendingBadgeText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  filterScroll:     { flexGrow: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2' },
  filterRow:        { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterTab:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#E8ECF2', backgroundColor: '#fff' },
  filterDot:        { width: 7, height: 7, borderRadius: 4 },
  filterText:       { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  infoBanner:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF3FF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#BFDBFE' },
  infoText:         { fontSize: 12, color: '#2563EB', flex: 1 },
  errorBanner:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF1F2', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FECDD3' },
  errorBannerText:  { fontSize: 12, color: '#E11D48', flex: 1 },
  listContent:      { paddingHorizontal: 16, paddingTop: 16 },
  emptyWrap:        { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyIcon:        { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8ECF2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:       { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptySub:         { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 13 },
  emptyBtnText:     { fontSize: 14, fontWeight: '700', color: '#fff' },
  emptyFilter:      { alignItems: 'center', paddingTop: 50, gap: 12 },
  emptyFilterText:  { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  fab:              { position: 'absolute', right: 18, bottom: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 12, elevation: 8 },
});
