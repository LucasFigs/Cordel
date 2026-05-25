import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceRecord, OccurrenceStatus, Notification } from '../types';
import { OCCURRENCE_TYPES, STATUS_CONFIG, getNowFormatted } from '../constants';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface AdminScreenProps {
  occurrences:    OccurrenceRecord[];
  onUpdateStatus: (id: string, status: OccurrenceStatus, targetUserId: string) => Promise<void>;
}

const ALL_STATUSES: OccurrenceStatus[] = ['Pendente', 'Em análise', 'Em andamento', 'Resolvido'];

export function AdminScreen({ occurrences, onUpdateStatus }: AdminScreenProps) {
  const [tab,          setTab]          = useState<'dashboard' | 'lista'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<OccurrenceStatus | 'Todos'>('Todos');
  const [filterPlace,  setFilterPlace]  = useState('');
  const [searchText,   setSearchText]   = useState('');
  const [statusModal,  setStatusModal]  = useState<{ id: string; current: OccurrenceStatus; userId: string } | null>(null);
  const [updating,     setUpdating]     = useState(false);
  const { toast, showLoading, showSuccess, showError, hide } = useToast();

  const total     = occurrences.length;
  const pending   = occurrences.filter(o => o.status === 'Pendente').length;
  const resolved  = occurrences.filter(o => o.status === 'Resolvido').length;
  const ratings   = occurrences.filter(o => o.rating != null).map(o => o.rating as number);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';

  const typeCount: Record<string, number> = {};
  occurrences.forEach(o => { typeCount[o.type] = (typeCount[o.type] ?? 0) + 1; });
  const maxCount = Math.max(...Object.values(typeCount), 1);

  // RF05 + RF12
  const filtered = occurrences
    .filter(o => filterStatus === 'Todos' || o.status === filterStatus)
    .filter(o => !filterPlace  || o.place.name.toLowerCase().includes(filterPlace.toLowerCase()))
    .filter(o => !searchText   || o.description.toLowerCase().includes(searchText.toLowerCase()) || String(o.protocol).includes(searchText));

  // RF09
  const handleChangeStatus = async (newStatus: OccurrenceStatus) => {
    if (!statusModal) return;
    setUpdating(true);
    showLoading('Atualizando status…');
    try {
      await onUpdateStatus(statusModal.id, newStatus, statusModal.userId);
      hide();
      showSuccess(`Status atualizado para "${newStatus}"!`);
      setStatusModal(null);
    } catch { showError('Falha ao atualizar. Tente novamente.'); }
    finally { setUpdating(false); }
  };

  return (
    <View style={ad.root}>
      <Toast toast={toast} />
      <View style={ad.header}>
        <View>
          <Text style={ad.headerTitle}>Painel Admin</Text>
          <Text style={ad.headerSub}>Gestão de Ocorrências</Text>
        </View>
        <View style={ad.adminBadge}>
          <Ionicons name="shield-checkmark-outline" size={13} color="#7C3AED" />
          <Text style={ad.adminBadgeText}>Admin</Text>
        </View>
      </View>

      <View style={ad.tabRow}>
        {(['dashboard', 'lista'] as const).map(t => (
          <TouchableOpacity key={t} style={[ad.tabBtn, tab === t && ad.tabBtnActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[ad.tabBtnText, tab === t && ad.tabBtnTextActive]}>
              {t === 'dashboard' ? '📊 Dashboard' : '📋 Ocorrências'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RF06 — Dashboard */}
      {tab === 'dashboard' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={ad.kpiRow}>
            {[
              { label: 'Total',    value: String(total),   color: '#111827' },
              { label: 'Pendente', value: String(pending), color: '#F59E0B' },
              { label: 'Resolvido',value: String(resolved),color: '#059669' },
              { label: 'Avg ⭐',   value: avgRating,       color: '#F59E0B' },
            ].map(k => (
              <View key={k.label} style={ad.kpiCard}>
                <Text style={[ad.kpiNum, { color: k.color }]}>{k.value}</Text>
                <Text style={ad.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>

          <Text style={ad.sectionTitle}>Tipos de Problema</Text>
          <View style={ad.chartCard}>
            {OCCURRENCE_TYPES.map(type => {
              const count = typeCount[type.id] ?? 0;
              const pct   = count / maxCount;
              return (
                <View key={type.id} style={ad.barRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: 110 }}>
                    <MaterialCommunityIcons name={type.icon as any} size={14} color={type.color} />
                    <Text style={ad.barLabel} numberOfLines={1}>{type.label}</Text>
                  </View>
                  <View style={ad.barTrack}>
                    <View style={[ad.barFill, { width: `${pct * 100}%`, backgroundColor: type.color }]} />
                  </View>
                  <Text style={ad.barCount}>{count}</Text>
                </View>
              );
            })}
            {total === 0 && <Text style={{ fontSize: 13, color: '#A0AAB4', textAlign: 'center', paddingVertical: 8 }}>Nenhuma ocorrência ainda.</Text>}
          </View>

          <Text style={ad.sectionTitle}>Avaliação dos Visitantes</Text>
          <View style={ad.chartCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <Text style={ad.avgNum}>{avgRating}</Text>
              <View>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Ionicons key={i} name={i <= Math.round(Number(avgRating)) ? 'star' : 'star-outline'} size={18} color="#F59E0B" />)}
                </View>
                <Text style={{ fontSize: 12, color: '#A0AAB4', marginTop: 3 }}>{ratings.length > 0 ? `${ratings.length} avaliação(ões)` : 'Sem avaliações'}</Text>
              </View>
            </View>
            {ratings.length > 0 && (
              <View style={{ marginTop: 16, gap: 6 }}>
                {[5,4,3,2,1].map(star => {
                  const cnt = ratings.filter(r => r === star).length;
                  const pct = cnt / ratings.length;
                  return (
                    <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ width: 10, fontSize: 12, color: '#6B7280' }}>{star}</Text>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: '#F59E0B', borderRadius: 4 }} />
                      </View>
                      <Text style={{ width: 20, fontSize: 11, color: '#A0AAB4', textAlign: 'right' }}>{cnt}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <Text style={ad.sectionTitle}>Por Status</Text>
          <View style={[ad.chartCard, { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }]}>
            {ALL_STATUSES.map(st => {
              const cfg = STATUS_CONFIG[st];
              const cnt = occurrences.filter(o => o.status === st).length;
              return (
                <View key={st} style={{ flex: 1, minWidth: '40%', backgroundColor: cfg.bg, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: cfg.color, marginTop: 4 }}>{cnt}</Text>
                  <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '600', textAlign: 'center' }}>{st}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* RF04 + RF05 + RF12 — Lista */}
      {tab === 'lista' && (
        <View style={{ flex: 1 }}>
          <View style={ad.filterWrap}>
            {/* RF12 — busca por palavra-chave */}
            <View style={ad.searchRow}>
              <Ionicons name="search-outline" size={16} color="#A0AAB4" style={{ marginRight: 6 }} />
              <TextInput style={ad.searchInput} placeholder="Buscar descrição ou protocolo…" placeholderTextColor="#A0AAB4" value={searchText} onChangeText={setSearchText} />
              {searchText.length > 0 && <TouchableOpacity onPress={() => setSearchText('')}><Ionicons name="close-circle" size={16} color="#A0AAB4" /></TouchableOpacity>}
            </View>
            {/* RF05 — filtro por espaço */}
            <View style={ad.searchRow}>
              <Ionicons name="location-outline" size={16} color="#A0AAB4" style={{ marginRight: 6 }} />
              <TextInput style={ad.searchInput} placeholder="Filtrar por espaço cultural…" placeholderTextColor="#A0AAB4" value={filterPlace} onChangeText={setFilterPlace} />
              {filterPlace.length > 0 && <TouchableOpacity onPress={() => setFilterPlace('')}><Ionicons name="close-circle" size={16} color="#A0AAB4" /></TouchableOpacity>}
            </View>
            {/* RF05 — filtro por status */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['Todos', ...ALL_STATUSES] as const).map(st => {
                const active = filterStatus === st;
                const cfg    = st !== 'Todos' ? STATUS_CONFIG[st] : null;
                return (
                  <TouchableOpacity key={st} style={[ad.filterPill, active && { backgroundColor: cfg?.bg ?? '#EEF3FF', borderColor: cfg?.color ?? '#2563EB' }]} onPress={() => setFilterStatus(st as any)} activeOpacity={0.8}>
                    {cfg && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.color, marginRight: 4 }} />}
                    <Text style={[ad.filterPillText, active && { color: cfg?.color ?? '#2563EB', fontWeight: '700' }]}>{st}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <Text style={ad.resultCount}>{filtered.length} resultado(s)</Text>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 48, gap: 12 }}>
                <Ionicons name="filter-outline" size={36} color="#A0AAB4" />
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Nenhuma ocorrência encontrada.</Text>
              </View>
            ) : (
              filtered.map(item => {
                const typeInfo  = OCCURRENCE_TYPES.find(t => t.id === item.type);
                const statusCfg = STATUS_CONFIG[item.status];
                return (
                  <View key={item.id} style={ad.occCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[ad.typeIcon, { backgroundColor: (typeInfo?.color ?? '#2563EB') + '15' }]}>
                        <MaterialCommunityIcons name={typeInfo?.icon as any} size={18} color={typeInfo?.color ?? '#2563EB'} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={ad.typeLabel}>{typeInfo?.label}</Text>
                        <Text style={ad.occPlace} numberOfLines={1}>{item.place.name}</Text>
                      </View>
                      <View style={[ad.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Ionicons name={statusCfg.icon} size={11} color={statusCfg.color} />
                        <Text style={[ad.statusText, { color: statusCfg.color }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={ad.divider} />
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar-outline" size={12} color="#A0AAB4" />
                        <Text style={ad.metaText}>{item.dateTime}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="document-text-outline" size={12} color="#A0AAB4" />
                        <Text style={ad.metaText}>#{item.protocol}</Text>
                      </View>
                      {item.rating != null && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={ad.metaText}>{item.rating}/5</Text>
                        </View>
                      )}
                    </View>
                    <Text style={ad.occDesc} numberOfLines={2}>{item.description}</Text>
                    {/* RF09 — alterar status */}
                    <TouchableOpacity style={ad.changeBtn} onPress={() => setStatusModal({ id: item.id, current: item.status, userId: item.userId })} activeOpacity={0.8}>
                      <Ionicons name="swap-horizontal-outline" size={14} color="#2563EB" />
                      <Text style={ad.changeBtnText}>Alterar Status</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Modal RF09 */}
      <Modal visible={!!statusModal} transparent animationType="slide" onRequestClose={() => !updating && setStatusModal(null)}>
        <View style={ad.modalOverlay}>
          <View style={ad.modalSheet}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={ad.modalTitle}>Alterar Status</Text>
              <TouchableOpacity style={ad.modalClose} onPress={() => setStatusModal(null)} disabled={updating}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {statusModal && (
              <View style={ad.currentBadge}>
                <Ionicons name="document-text-outline" size={14} color="#2563EB" />
                <Text style={ad.currentBadgeText}>Status atual: <Text style={{ fontWeight: '700' }}>{statusModal.current}</Text></Text>
              </View>
            )}
            {ALL_STATUSES.map(st => {
              const cfg    = STATUS_CONFIG[st];
              const active = statusModal?.current === st;
              return (
                <TouchableOpacity key={st} style={[ad.statusOption, active && { backgroundColor: cfg.bg, borderColor: cfg.color }]} onPress={() => handleChangeStatus(st)} disabled={updating || active} activeOpacity={0.8}>
                  <View style={[ad.statusOptionIcon, { backgroundColor: cfg.bg }]}>
                    {updating && statusModal?.current !== st ? <ActivityIndicator size="small" color={cfg.color} /> : <Ionicons name={cfg.icon} size={18} color={cfg.color} />}
                  </View>
                  <Text style={[ad.statusOptionText, active && { color: cfg.color, fontWeight: '700' }]}>{st}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={cfg.color} />}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: Platform.OS === 'ios' ? 16 : 4 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ad = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#F7F8FA' },
  header:         { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2' },
  headerTitle:    { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSub:      { fontSize: 12, color: '#A0AAB4', marginTop: 2 },
  adminBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F3F0FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  tabRow:         { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2' },
  tabBtn:         { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#E8ECF2' },
  tabBtnActive:   { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tabBtnText:     { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive:{ color: '#fff', fontWeight: '700' },
  kpiRow:         { flexDirection: 'row', padding: 16, gap: 10 },
  kpiCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E8ECF2' },
  kpiNum:         { fontSize: 22, fontWeight: '800' },
  kpiLabel:       { fontSize: 10, color: '#A0AAB4', fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  sectionTitle:   { fontSize: 12, fontWeight: '800', color: '#111827', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10, paddingHorizontal: 16, marginTop: 4 },
  chartCard:      { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8ECF2', marginBottom: 16 },
  barRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barLabel:       { fontSize: 12, color: '#6B7280' },
  barTrack:       { flex: 1, height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  barFill:        { height: 10, borderRadius: 5 },
  barCount:       { fontSize: 12, fontWeight: '700', color: '#111827', width: 24, textAlign: 'right' },
  avgNum:         { fontSize: 36, fontWeight: '800', color: '#111827' },
  filterWrap:     { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2', padding: 12, gap: 8 },
  searchRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 10, borderWidth: 1, borderColor: '#E8ECF2', paddingHorizontal: 10, paddingVertical: 8 },
  searchInput:    { flex: 1, fontSize: 13, color: '#111827', padding: 0 },
  filterPill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#E8ECF2', backgroundColor: '#fff' },
  filterPillText: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  resultCount:    { fontSize: 11, color: '#A0AAB4', fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8 },
  occCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8ECF2' },
  typeIcon:       { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel:      { fontSize: 11, fontWeight: '600', color: '#A0AAB4', textTransform: 'uppercase', letterSpacing: 0.6 },
  occPlace:       { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 1 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  statusText:     { fontSize: 11, fontWeight: '700' },
  divider:        { height: 1, backgroundColor: '#E8ECF2', marginVertical: 12 },
  metaText:       { fontSize: 11, color: '#A0AAB4', fontWeight: '500' },
  occDesc:        { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 12 },
  changeBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#BFDBFE', backgroundColor: '#EEF3FF' },
  changeBtnText:  { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalTitle:     { fontSize: 17, fontWeight: '800', color: '#111827' },
  modalClose:     { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center' },
  currentBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF3FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  currentBadgeText:{ fontSize: 12, color: '#2563EB' },
  statusOption:   { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', marginBottom: 8, gap: 12 },
  statusOptionIcon:{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statusOptionText:{ flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
});
