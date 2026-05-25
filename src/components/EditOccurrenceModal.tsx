import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceRecord, Severity } from '../types';
import { OCCURRENCE_TYPES, SEVERITIES } from '../constants';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';

interface EditOccurrenceModalProps {
  visible:    boolean;
  occurrence: OccurrenceRecord | null;
  onClose:    () => void;
  onSave:     (updated: OccurrenceRecord) => Promise<void>;
}

export function EditOccurrenceModal({ visible, occurrence, onClose, onSave }: EditOccurrenceModalProps) {
  const [description, setDescription] = useState('');
  const [severity,    setSeverity]    = useState<Severity>('baixa');
  const [loading,     setLoading]     = useState(false);
  const { toast, showLoading, showError, hide } = useToast();

  useEffect(() => {
    if (occurrence) { setDescription(occurrence.description); setSeverity(occurrence.severity); }
  }, [occurrence]);

  if (!occurrence) return null;
  const typeInfo = OCCURRENCE_TYPES.find(t => t.id === occurrence.type);

  const handleSave = async () => {
    if (description.trim().length < 10) { Alert.alert('Atenção', 'A descrição deve ter pelo menos 10 caracteres.'); return; }
    setLoading(true);
    showLoading('Salvando…');
    try {
      await onSave({ ...occurrence, description: description.trim(), severity });
      hide();
      onClose();
    } catch {
      showError('Falha ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={e.overlay}>
        <Toast toast={toast} />
        <View style={e.sheet}>
          <View style={e.header}>
            <Text style={e.title}>Editar Ocorrência</Text>
            <TouchableOpacity onPress={onClose} style={e.closeBtn} disabled={loading}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={e.infoBadge}>
            <MaterialCommunityIcons name={typeInfo?.icon as any} size={14} color={typeInfo?.color} />
            <Text style={[e.infoBadgeType, { color: typeInfo?.color }]}>{typeInfo?.label}</Text>
            <Text style={e.infoBadgeSep}>·</Text>
            <Text style={e.infoBadgeSub}>Protocolo #{occurrence.protocol}</Text>
          </View>
          <Text style={e.label}>Gravidade</Text>
          <View style={e.severityRow}>
            {SEVERITIES.map(sev => {
              const active = severity === sev.id;
              return (
                <TouchableOpacity key={sev.id} style={[e.severityPill, active && { borderColor: sev.color, backgroundColor: sev.color + '14' }]} onPress={() => setSeverity(sev.id)} activeOpacity={0.75} disabled={loading}>
                  {active && <View style={[e.severityDot, { backgroundColor: sev.color }]} />}
                  <Text style={[e.severityLabel, active && { color: sev.color, fontWeight: '700' }]}>{sev.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={e.label}>Descrição</Text>
          <View style={e.textAreaWrap}>
            <TextInput style={e.textArea} value={description} onChangeText={setDescription} multiline maxLength={300} textAlignVertical="top" placeholder="Descreva o ocorrido…" placeholderTextColor="#A0AAB4" editable={!loading} />
            <Text style={e.charCount}>{description.length}/300</Text>
          </View>
          <View style={e.actions}>
            <TouchableOpacity style={e.cancelBtn} onPress={onClose} disabled={loading} activeOpacity={0.75}>
              <Text style={e.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={e.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} /><Text style={e.saveText}>Salvar</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const e = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title:         { fontSize: 17, fontWeight: '800', color: '#111827' },
  closeBtn:      { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center' },
  infoBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F7F8FA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 18 },
  infoBadgeType: { fontSize: 12, fontWeight: '700' },
  infoBadgeSep:  { color: '#A0AAB4', marginHorizontal: 2 },
  infoBadgeSub:  { fontSize: 12, color: '#A0AAB4' },
  label:         { fontSize: 11, fontWeight: '700', color: '#A0AAB4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  severityRow:   { flexDirection: 'row', gap: 8, marginBottom: 18 },
  severityPill:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E8ECF2' },
  severityDot:   { width: 7, height: 7, borderRadius: 4 },
  severityLabel: { fontSize: 13, color: '#6B7280' },
  textAreaWrap:  { backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', padding: 12, marginBottom: 20 },
  textArea:      { fontSize: 14, color: '#111827', minHeight: 90, lineHeight: 21 },
  charCount:     { fontSize: 11, color: '#A0AAB4', textAlign: 'right', marginTop: 4 },
  actions:       { flexDirection: 'row', gap: 10 },
  cancelBtn:     { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', alignItems: 'center' },
  cancelText:    { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  saveBtn:       { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  saveText:      { fontSize: 14, fontWeight: '700', color: '#fff' },
});
