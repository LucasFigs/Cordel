import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceRecord } from '../types';
import { OCCURRENCE_TYPES, SEVERITIES, STATUS_CONFIG, truncate, C } from '../constants';

interface OccurrenceCardProps {
  item:         OccurrenceRecord;
  onDelete:     (id: string) => Promise<void>;
  onPress?:     (item: OccurrenceRecord) => void;
}

export function OccurrenceCard({ item, onDelete, onPress }: OccurrenceCardProps) {
  const [modalVisible,  setModalVisible]  = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const typeInfo     = OCCURRENCE_TYPES.find(t => t.id === item.type);
  const severityInfo = SEVERITIES.find(sv => sv.id === item.severity);
  const statusCfg    = STATUS_CONFIG[item.status];
  const canDelete    = item.status === 'Pendente';

  // ── Formatação da data ────────────────────────────────────────────────
  const datePart = item.dateTime.split('·')[0]?.trim() ?? item.dateTime;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
      setModalVisible(false);
    } catch {
      // erro tratado no pai via toast
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={oc.card}
        activeOpacity={onPress ? 0.8 : 1}
        onPress={() => onPress?.(item)}
      >
        {/* Topo: ícone + local + status */}
        <View style={oc.cardTop}>
          <View style={[oc.typeIconWrap, { backgroundColor: (typeInfo?.color ?? C.primary) + '15' }]}>
            <MaterialCommunityIcons
              name={typeInfo?.icon as any}
              size={18}
              color={typeInfo?.color ?? C.primary}
            />
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

        {/* Meta: data + protocolo + gravidade */}
        <View style={oc.metaRow}>
          <View style={oc.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={C.textMuted} />
            <Text style={oc.metaText}>{datePart}</Text>
          </View>
          <View style={oc.metaItem}>
            <Ionicons name="document-text-outline" size={12} color={C.textMuted} />
            <Text style={oc.metaText}>#{item.protocol}</Text>
          </View>
          {severityInfo && (
            <View style={[oc.sevBadge, { backgroundColor: severityInfo.color + '15' }]}>
              <View style={[oc.sevDot, { backgroundColor: severityInfo.color }]} />
              <Text style={[oc.sevText, { color: severityInfo.color }]}>{severityInfo.label}</Text>
            </View>
          )}
        </View>

        {/* Botão excluir — só aparece para Pendente */}
        {canDelete ? (
          <TouchableOpacity
            style={oc.deleteBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={14} color={C.error} />
            <Text style={oc.deleteText}>Excluir</Text>
          </TouchableOpacity>
        ) : (
          <View style={oc.lockedRow}>
            <Ionicons name="lock-closed-outline" size={12} color={C.textMuted} />
            <Text style={oc.lockedText}>
              Não pode ser excluída — já está {item.status.toLowerCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Modal de confirmação de exclusão ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setModalVisible(false)}
      >
        <View style={oc.modalOverlay}>
          <View style={oc.modalBox}>
            <View style={oc.modalIconWrap}>
              <Ionicons name="trash-outline" size={28} color={C.error} />
            </View>
            <Text style={oc.modalTitle}>Excluir ocorrência?</Text>
            <Text style={oc.modalSub}>
              Tem certeza que deseja excluir esta ocorrência?{'\n'}
              <Text style={{ fontWeight: '700' }}>Esta ação não pode ser desfeita.</Text>
            </Text>
            <View style={oc.modalActions}>
              <TouchableOpacity
                style={oc.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={deleting}
                activeOpacity={0.8}
              >
                <Text style={oc.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[oc.confirmBtn, deleting && { opacity: 0.7 }]}
                onPress={handleConfirmDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={15} color="#fff" />
                    <Text style={oc.confirmText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const oc = StyleSheet.create({
  card:         { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  cardTop:      { flexDirection: 'row', alignItems: 'center' },
  typeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel:    { fontSize: 11, fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  placeName:    { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 1 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  divider:      { height: 1, backgroundColor: C.border, marginVertical: 12 },
  description:  { fontSize: 13, color: C.textSub, lineHeight: 19, marginBottom: 10 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  metaItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:     { fontSize: 11, color: C.textMuted, fontWeight: '500' },
  sevBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  sevDot:       { width: 6, height: 6, borderRadius: 3 },
  sevText:      { fontSize: 11, fontWeight: '700' },
  deleteBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  deleteText:   { fontSize: 13, fontWeight: '700', color: C.error },
  lockedRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lockedText:   { fontSize: 11, color: C.textMuted, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox:     { backgroundColor: C.card, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalIconWrap:{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 8, textAlign: 'center' },
  modalSub:     { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn:    { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '600', color: C.textSub },
  confirmBtn:   { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: C.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  confirmText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});
