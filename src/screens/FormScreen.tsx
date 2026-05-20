import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceData, OccurrenceType, Severity, Place } from '../types';
import { PLACES, OCCURRENCE_TYPES, SEVERITIES, getNowFormatted } from '../constants';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';
import { PlacePickerModal } from '../components/PlacePickerModal';

// Cores inline — sem import de C
const PRIMARY      = '#2563EB';
const PRIMARY_LIGHT= '#EEF3FF';
const TEXT         = '#111827';
const TEXT_SUB     = '#6B7280';
const TEXT_MUTED   = '#A0AAB4';
const SUCCESS      = '#059669';
const ERROR        = '#E11D48';
const BORDER       = '#E8ECF2';
const CARD         = '#FFFFFF';
const BG           = '#F7F8FA';
const WARNING_LIGHT= '#FEF3C7';

interface FormScreenProps {
  userId:   string;
  onSubmit: (data: OccurrenceData) => Promise<void>;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Muito ruim', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente',
};

export function FormScreen({ userId, onSubmit }: FormScreenProps) {
  const [place,       setPlace]       = useState<Place>(PLACES[0]);
  const [placeModal,  setPlaceModal]  = useState(false);
  const [occType,     setOccType]     = useState<OccurrenceType | null>(null);
  const [severity,    setSeverity]    = useState<Severity | null>(null);
  const [description, setDescription] = useState('');
  const [rating,      setRating]      = useState(0);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});
  const [loading,     setLoading]     = useState(false);
  const { toast, showLoading, showError, showSuccess, hide } = useToast();

  const CHAR_LIMIT = 300;
  const dateTime   = getNowFormatted();

  const errors: Record<string, string> = {};
  if (!occType)                       errors.type        = 'Selecione o tipo de ocorrência';
  if (description.trim().length < 10) errors.description = 'Descreva com pelo menos 10 caracteres';
  const isValid = Object.keys(errors).length === 0;

  function touch(f: string) { setTouched(p => ({ ...p, [f]: true })); }

  const handleSubmit = async () => {
    setTouched({ type: true, description: true });
    if (!isValid) return;

    const data: OccurrenceData = {
      place, dateTime, userId,
      type:        occType!,
      severity:    severity ?? 'baixa',
      description: description.trim(),
      rating:      rating > 0 ? rating : undefined,
    };

    setLoading(true);
    showLoading('Enviando ocorrência…');
    try {
      await onSubmit(data);
      hide();
      showSuccess('Ocorrência enviada com sucesso!');
      setOccType(null); setSeverity(null);
      setDescription(''); setRating(0); setTouched({});
    } catch (e: any) {
      showError(e?.message ?? 'Falha ao enviar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const typeError = touched.type        ? errors.type        : undefined;
  const descError = touched.description ? errors.description : undefined;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={f.root}>
        <Toast toast={toast} />

        {/* Header */}
        <View style={f.header}>
          <Text style={f.headerTitle}>Nova Ocorrência</Text>
          <View style={f.headerBadge}>
            <Text style={f.headerBadgeText}>Cordel</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Local */}
          <Text style={f.label}>Local <Text style={f.req}>*</Text></Text>
          <TouchableOpacity style={f.placeCard} onPress={() => setPlaceModal(true)} activeOpacity={0.8}>
            <View style={[f.placeIcon, { backgroundColor: place.color + '18' }]}>
              <MaterialCommunityIcons name={place.icon as any} size={26} color={place.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={f.placeName}>{place.name}</Text>
              <Text style={f.placeAddr}>{place.address}</Text>
              <Text style={[f.placeCount, { color: place.color }]}>{place.count} ocorrências</Text>
            </View>
            <View style={f.placeChevron}>
              <Ionicons name="chevron-down" size={18} color={PRIMARY} />
            </View>
          </TouchableOpacity>

          {/* Data */}
          <Text style={[f.label, { marginTop: 18 }]}>Data de registro <Text style={f.req}>*</Text></Text>
          <View style={f.dateBox}>
            <View style={f.dateIcon}>
              <Ionicons name="calendar" size={18} color={PRIMARY} />
            </View>
            <Text style={f.dateText}>{dateTime}</Text>
            <View style={f.autoBadge}>
              <Text style={f.autoBadgeText}>auto</Text>
            </View>
          </View>

          {/* Tipo */}
          <Text style={[f.label, { marginTop: 18 }]}>Tipo <Text style={f.req}>*</Text></Text>
          <View style={f.grid}>
            {OCCURRENCE_TYPES.map(cat => {
              const active = occType === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[f.catCard, active && { borderColor: cat.color, backgroundColor: cat.color + '10' }, !!typeError && !active && { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]}
                  onPress={() => { setOccType(cat.id); touch('type'); }}
                  activeOpacity={0.75}
                >
                  <View style={[f.catIcon, { backgroundColor: active ? cat.color : '#F3F4F6' }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={22} color={active ? '#fff' : TEXT_SUB} />
                  </View>
                  <Text style={[f.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                  {active && (
                    <View style={[f.catCheck, { backgroundColor: cat.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {!!typeError && (
            <View style={f.errorRow}>
              <Ionicons name="alert-circle" size={13} color={ERROR} />
              <Text style={f.errorText}>{typeError}</Text>
            </View>
          )}

          {/* Gravidade */}
          <Text style={[f.label, { marginTop: 18 }]}>
            Gravidade <Text style={f.optional}>(opcional)</Text>
          </Text>
          <View style={f.sevRow}>
            {SEVERITIES.map(sev => {
              const active = severity === sev.id;
              return (
                <TouchableOpacity key={sev.id} style={[f.sevPill, active && { borderColor: sev.color, backgroundColor: sev.color + '12' }]} onPress={() => setSeverity(sev.id)} activeOpacity={0.75}>
                  {active && <View style={[f.sevDot, { backgroundColor: sev.color }]} />}
                  <Text style={[f.sevLabel, active && { color: sev.color }]}>{sev.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Nota de avaliação (estrelas) */}
          <Text style={[f.label, { marginTop: 18 }]}>
            Nota <Text style={f.optional}>(opcional)</Text>
          </Text>
          <View style={f.starCard}>
            <View style={f.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={38} color={i <= rating ? '#F59E0B' : TEXT_MUTED} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[f.starLabel, { color: rating > 0 ? '#F59E0B' : TEXT_MUTED }]}>
              {rating > 0 ? STAR_LABELS[rating] : 'Toque para avaliar'}
            </Text>
          </View>

          {/* Descrição */}
          <Text style={[f.label, { marginTop: 18 }]}>Descrição <Text style={f.req}>*</Text></Text>
          <View style={[f.textAreaWrap, !!descError && { borderColor: ERROR }]}>
            <TextInput
              style={f.textArea}
              placeholder="Conte sua experiência neste lugar..."
              placeholderTextColor={TEXT_MUTED}
              multiline maxLength={CHAR_LIMIT}
              value={description}
              onChangeText={v => { setDescription(v); touch('description'); }}
              onBlur={() => touch('description')}
              textAlignVertical="top"
            />
            <View style={f.charRow}>
              <Text style={[
                f.charCount,
                description.trim().length > 0 && description.trim().length < 10 && { color: ERROR },
                description.trim().length >= 10 && { color: SUCCESS },
              ]}>
                {description.length}/{CHAR_LIMIT}
              </Text>
              {description.trim().length > 0 && description.trim().length < 10 && (
                <Text style={{ fontSize: 10, color: ERROR }}>Faltam {10 - description.trim().length} caractere(s)</Text>
              )}
            </View>
          </View>
          {!!descError && (
            <View style={f.errorRow}>
              <Ionicons name="alert-circle" size={13} color={ERROR} />
              <Text style={f.errorText}>{descError}</Text>
            </View>
          )}

          {/* Aviso geral */}
          {Object.values(touched).some(Boolean) && !isValid && (
            <View style={f.warnBanner}>
              <Ionicons name="warning-outline" size={16} color="#92400E" />
              <Text style={{ fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 }}>Preencha todos os campos obrigatórios.</Text>
            </View>
          )}

          {/* Botão */}
          <TouchableOpacity
            style={[f.submitBtn, (!isValid || loading) && f.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading ? (
              <ActivityIndicator size="small" color={isValid ? '#fff' : TEXT_MUTED} />
            ) : (
              <>
                <Ionicons name="send" size={16} color={isValid ? '#fff' : TEXT_MUTED} style={{ marginRight: 8 }} />
                <Text style={[f.submitText, !isValid && { color: TEXT_MUTED }]}>Registrar Ocorrência</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        <PlacePickerModal visible={placeModal} current={place} onSelect={setPlace} onClose={() => setPlaceModal(false)} />
      </View>
    </KeyboardAvoidingView>
  );
}

const f = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BG },
  header:        { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle:   { fontSize: 17, fontWeight: '700', color: TEXT },
  headerBadge:   { backgroundColor: PRIMARY_LIGHT, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText:{ fontSize: 11, fontWeight: '700', color: PRIMARY },
  label:         { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  req:           { color: ERROR, fontWeight: '700' },
  optional:      { color: TEXT_MUTED, fontWeight: '400', letterSpacing: 0, textTransform: 'none' },
  placeCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: BORDER, marginBottom: 4 },
  placeIcon:     { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  placeName:     { fontSize: 15, fontWeight: '700', color: TEXT },
  placeAddr:     { fontSize: 12, color: TEXT_SUB, marginTop: 2 },
  placeCount:    { fontSize: 11, fontWeight: '600', marginTop: 4 },
  placeChevron:  { width: 30, height: 30, borderRadius: 8, backgroundColor: PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center' },
  dateBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginBottom: 4 },
  dateIcon:      { width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center' },
  dateText:      { flex: 1, color: TEXT, fontSize: 14, fontWeight: '500' },
  autoBadge:     { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  autoBadgeText: { fontSize: 10, color: TEXT_MUTED, fontWeight: '600' },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  catCard:       { width: '47%', backgroundColor: CARD, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, padding: 14, alignItems: 'flex-start', position: 'relative' },
  catIcon:       { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  catLabel:      { fontSize: 13, fontWeight: '600', color: TEXT_SUB },
  catCheck:      { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sevRow:        { flexDirection: 'row', gap: 10, marginBottom: 4 },
  sevPill:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, backgroundColor: CARD },
  sevDot:        { width: 7, height: 7, borderRadius: 4 },
  sevLabel:      { fontSize: 13, fontWeight: '600', color: TEXT_SUB },
  starCard:      { backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', marginBottom: 4 },
  starsRow:      { flexDirection: 'row', gap: 4, marginBottom: 8 },
  starLabel:     { fontSize: 14, fontWeight: '600' },
  textAreaWrap:  { backgroundColor: CARD, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, padding: 14, marginBottom: 4 },
  textArea:      { color: TEXT, fontSize: 14, minHeight: 100, lineHeight: 22 },
  charRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  charCount:     { fontSize: 11, color: TEXT_MUTED },
  errorRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  errorText:     { fontSize: 12, color: ERROR, fontWeight: '500', flex: 1 },
  warnBanner:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: WARNING_LIGHT, borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  submitBtn:     { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: BORDER },
  submitText:    { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});
