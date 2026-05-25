import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceRecord } from '../types';
import { OCCURRENCE_TYPES, SEVERITIES, STATUS_CONFIG, truncate } from '../constants';

interface OccurrenceCardProps {
  item:     OccurrenceRecord;
  onDelete: (id: string) => Promise<void>;
  onEdit?:  (item: OccurrenceRecord) => void;
  onPress?: (item: OccurrenceRecord) => void;
}

export function OccurrenceCard({ item, onDelete, onEdit, onPress }: OccurrenceCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const typeInfo     = OCCURRENCE_TYPES.find(t => t.id === item.type);
  const severityInfo = SEVERITIES.find(sv => sv.id === item.severity);
  const statusCfg    = STATUS_CONFIG[item.status];
  const isPendente   = item.status === 'Pendente';
  const datePart     = item.dateTime.split('·')[0]?.trim() ?? item.dateTime;

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(item.id); setConfirmDelete(false); }
    catch { /* pai trata erro */ }
    finally { setDeleting(false); }
  };

  return (
    <>
      <TouchableOpacity style={oc.card} activeOpacity={onPress ? 0.8 : 1} onPress={() => onPress?.(item)}>
        {/* Topo */}
        <View style={oc.cardTop}>
          <View style={[oc.typeIconWrap, { backgroundColor: (typeInfo?.color ?? '#2563EB') + '15' }]}>
            <MaterialCommunityIcons name={typeInfo?.icon as any} size={18} color={typeInfo?.color ?? '#2563EB'} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={oc.typeLabel}>{typeInfo?.label}</Text>
            <Text style={oc.placeName} numberOfLines={1}>{item.place.name}</Text>
          </View>
          <View style={[oc.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Ionicons name={statusCfg.icon} size={11} color={statusCfg.color} />
            <Text style={[oc.statusText, { color: statusCfg.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={oc.divider} />

        {/* Descrição resumida (máx 60 chars) */}
        <Text style={oc.description}>{truncate(item.description, 60)}</Text>

        {/* Meta: data · protocolo · severidade */}
        <View style={oc.metaRow}>
          <View style={oc.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#A0AAB4" />
            <Text style={oc.metaText}>{datePart}</Text>
          </View>
          <View style={oc.metaItem}>
            <Ionicons name="document-text-outline" size={12} color="#A0AAB4" />
            <Text style={oc.metaText}>#{item.protocol}</Text>
          </View>
          {severityInfo && (
            <View style={[oc.sevBadge, { backgroundColor: severityInfo.color + '15' }]}>
              <View style={[oc.sevDot, { backgroundColor: severityInfo.color }]} />
              <Text style={[oc.sevText, { color: severityInfo.color }]}>{severityInfo.label}</Text>
            </View>
          )}
          {item.rating != null && (
            <View style={oc.metaItem}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={oc.metaText}>{item.rating}/5</Text>
            </View>
          )}
        </View>

        {/* Ações — apenas Pendente */}
        {isPendente ? (
          <View style={oc.actions}>
            {onEdit && (
              <TouchableOpacity style={oc.editBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
                <Ionicons name="create-outline" size={14} color="#2563EB" />
                <Text style={oc.editText}>Editar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={oc.deleteBtn} onPress={() => setConfirmDelete(true)} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={14} color="#E11D48" />
              <Text style={oc.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={oc.lockedRow}>
            <Ionicons name="lock-closed-outline" size={12} color="#A0AAB4" />
            <Text style={oc.lockedText}>Não pode ser excluída — já está {item.status.toLowerCase()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal confirmação exclusão (#24) */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => !deleting && setConfirmDelete(false)}>
        <View style={oc.modalOverlay}>
          <View style={oc.modalBox}>
            <View style={oc.modalIconWrap}>
              <Ionicons name="trash-outline" size={28} color="#E11D48" />
            </View>
            <Text style={oc.modalTitle}>Excluir ocorrência?</Text>
            <Text style={oc.modalSub}>
              Tem certeza que deseja excluir esta ocorrência?{'\n'}
              <Text style={{ fontWeight: '700' }}>Esta ação não pode ser desfeita.</Text>
            </Text>
            <View style={oc.modalActions}>
              <TouchableOpacity style={oc.cancelBtn} onPress={() => setConfirmDelete(false)} disabled={deleting} activeOpacity={0.8}>
                <Text style={oc.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[oc.confirmBtn, deleting && { opacity: 0.7 }]} onPress={handleDelete} disabled={deleting} activeOpacity={0.8}>
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <><Ionicons name="trash-outline" size={15} color="#fff" /><Text style={oc.confirmText}>Confirmar</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const oc = StyleSheet.create({
  card:         { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8ECF2' },
  cardTop:      { flexDirection: 'row', alignItems: 'center' },
  typeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel:    { fontSize: 11, fontWeight: '600', color: '#A0AAB4', textTransform: 'uppercase', letterSpacing: 0.6 },
  placeName:    { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 1 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  divider:      { height: 1, backgroundColor: '#E8ECF2', marginVertical: 12 },
  description:  { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 10 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  metaItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:     { fontSize: 11, color: '#A0AAB4', fontWeight: '500' },
  sevBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  sevDot:       { width: 6, height: 6, borderRadius: 3 },
  sevText:      { fontSize: 11, fontWeight: '700' },
  actions:      { flexDirection: 'row', gap: 10 },
  editBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#BFDBFE', backgroundColor: '#EEF3FF' },
  editText:     { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  deleteBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  deleteText:   { fontSize: 13, fontWeight: '700', color: '#E11D48' },
  lockedRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lockedText:   { fontSize: 11, color: '#A0AAB4', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox:     { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalIconWrap:{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  modalSub:     { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn:    { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  confirmBtn:   { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#E11D48', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  confirmText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});
