import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OccurrenceRecord } from '../types';
import { STATUS_CONFIG, C } from '../constants';
import { hx } from '../styles';
import { OccurrenceCard } from '../components/OccurrenceCard';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface HistoryScreenProps {
  userId:             string;
  occurrences:        OccurrenceRecord[];
  loading:            boolean;
  onNewOccurrence:    () => void;
  onDeleteOccurrence: (id: string) => Promise<void>;
  onRefresh:          () => Promise<void>;
  onPressItem?:       (item: OccurrenceRecord) => void;
}

export function HistoryScreen({
  userId, occurrences, loading,
  onNewOccurrence, onDeleteOccurrence, onRefresh, onPressItem,
}: HistoryScreenProps) {
  const [refreshing,   setRefreshing]   = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OccurrenceRecord['status'] | 'Todos'>('Todos');
  const { toast, showSuccess, showError } = useToast();

  const allStatuses: (OccurrenceRecord['status'] | 'Todos')[] = [
    'Todos', 'Pendente', 'Em análise', 'Em andamento', 'Resolvido',
  ];

  // Apenas ocorrências do usuário logado, ordenadas por data desc
  const mine   = occurrences.filter(o => o.userId === userId);
  const sorted = [...mine].sort((a, b) => b.id.localeCompare(a.id)); // id = timestamp
  const filtered = filterStatus === 'Todos'
    ? sorted
    : sorted.filter(o => o.status === filterStatus);

  const pendingCount = mine.filter(o => o.status === 'Pendente').length;

  // ── Pull to refresh ─────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(false);
    try {
      await onRefresh();
    } catch {
      setRefreshError(true);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // ── Excluir ocorrência pendente ─────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await onDeleteOccurrence(id);
      showSuccess('Ocorrência excluída com sucesso!');
    } catch {
      showError('Falha ao excluir. Tente novamente.');
      throw new Error('delete failed'); // propaga para o modal fechar corretamente
    }
  };

  return (
    <View style={hx.root}>
      <Toast toast={toast} />

      {/* Header */}
      <View style={hx.header}>
        <View style={{ flex: 1 }}>
          <Text style={hx.headerTitle}>Minhas Ocorrências</Text>
          <Text style={hx.headerSub}>{mine.length} registro(s)</Text>
        </View>
        {pendingCount > 0 && (
          <View style={hx.pendingBadge}>
            <Text style={hx.pendingBadgeText}>
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Filtros por status */}
      {mine.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={hx.filterRow}
          style={hx.filterScroll}
        >
          {allStatuses.map(st => {
            const active = filterStatus === st;
            const cfg    = st !== 'Todos' ? STATUS_CONFIG[st] : null;
            return (
              <TouchableOpacity
                key={st}
                style={[hx.filterTab, active && { backgroundColor: cfg?.bg ?? C.primaryLight, borderColor: cfg?.color ?? C.primary }]}
                onPress={() => setFilterStatus(st)}
                activeOpacity={0.75}
              >
                {st !== 'Todos' && cfg && <View style={[hx.filterDot, { backgroundColor: cfg.color }]} />}
                <Text style={[hx.filterText, active && { color: cfg?.color ?? C.primary, fontWeight: '700' }]}>{st}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Banner info */}
      {mine.length > 0 && (
        <View style={hx.infoBanner}>
          <Ionicons name="information-circle-outline" size={14} color={C.primary} />
          <Text style={hx.infoText}>
            Apenas ocorrências <Text style={{ fontWeight: '700' }}>Pendentes</Text> podem ser excluídas.
          </Text>
        </View>
      )}

      {/* Banner de erro de refresh */}
      {refreshError && (
        <View style={hx.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color={C.error} />
          <Text style={hx.errorBannerText}>
            Falha ao atualizar. Os dados exibidos podem estar desatualizados.
          </Text>
        </View>
      )}

      {/* Loading inicial */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={{ fontSize: 14, color: C.textMuted }}>Carregando ocorrências…</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={hx.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[C.primary]}
              tintColor={C.primary}
              title="Atualizando…"
              titleColor={C.textMuted}
            />
          }
        >
          {filtered.length === 0 ? (
            mine.length === 0 ? (
              /* Estado vazio */
              <View style={hx.emptyWrap}>
                <View style={hx.emptyIcon}>
                  <Ionicons name="clipboard-outline" size={38} color={C.textMuted} />
                </View>
                <Text style={hx.emptyTitle}>Nenhum registro encontrado</Text>
                <Text style={hx.emptySub}>
                  Você ainda não registrou nenhuma ocorrência.{'\n'}
                  Puxe para baixo para atualizar.
                </Text>
                <TouchableOpacity style={hx.emptyBtn} onPress={onNewOccurrence} activeOpacity={0.85}>
                  <Ionicons name="add-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={hx.emptyBtnText}>Registrar Ocorrência</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Filtro sem resultado */
              <View style={hx.emptyFilter}>
                <Ionicons name="filter-outline" size={32} color={C.textMuted} />
                <Text style={hx.emptyFilterText}>
                  Nenhuma ocorrência com status "{filterStatus}"
                </Text>
              </View>
            )
          ) : (
            filtered.map(item => (
              <OccurrenceCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onPress={onPressItem}
              />
            ))
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* FAB */}
      {!loading && (
        <TouchableOpacity style={hx.fab} onPress={onNewOccurrence} activeOpacity={0.85}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
