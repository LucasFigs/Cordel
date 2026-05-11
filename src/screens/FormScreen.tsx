import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceData, OccurrenceType, Severity, Place } from '../types';
import { PLACES, OCCURRENCE_TYPES, SEVERITIES, getNowFormatted, C } from '../constants';
import { fs } from '../styles';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';
import { PlacePickerModal } from '../components/PlacePickerModal';

interface FormScreenProps {
  userId:   string;
  onSubmit: (data: OccurrenceData) => Promise<void>;
}

async function fakeSubmit(data: OccurrenceData): Promise<void> {
  await new Promise(r => setTimeout(r, 1200));
  // Simula erro de rede (10%)
  if (Math.random() < 0.1) throw new Error('Falha ao enviar. Verifique sua conexão.');
}

export function FormScreen({ userId, onSubmit }: FormScreenProps) {
  const [place,       setPlace]       = useState<Place>(PLACES[0]);
  const [placeModal,  setPlaceModal]  = useState(false);
  const [occType,     setOccType]     = useState<OccurrenceType | null>(null);
  const [severity,    setSeverity]    = useState<Severity | null>(null);
  const [description, setDescription] = useState('');
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
    };

    setLoading(true);
    showLoading('Enviando ocorrência…');

    try {
      await onSubmit(data);
      hide();
      showSuccess('Ocorrência enviada com sucesso!');
      // Limpa formulário
      setOccType(null);
      setSeverity(null);
      setDescription('');
      setTouched({});
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
      <View style={fs.root}>
        <Toast toast={toast} />

        {/* Header */}
        <View style={fs.header}>
          <Text style={fs.headerTitle}>Nova Ocorrência</Text>
          <View style={fs.headerBadge}>
            <Text style={fs.headerBadgeText}>Cordel</Text>
          </View>
        </View>

        <ScrollView
          style={fs.scroll}
          contentContainerStyle={fs.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Local (obrigatório) ──────────────────────────────── */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Local <Text style={fs.req}>*</Text></Text>
            <TouchableOpacity style={fs.placeCard} onPress={() => setPlaceModal(true)} activeOpacity={0.8}>
              <View style={[fs.placeIconWrap, { backgroundColor: place.color + '18' }]}>
                <MaterialCommunityIcons name={place.icon as any} size={26} color={place.color} />
              </View>
              <View style={fs.placeInfo}>
                <Text style={fs.placeName}>{place.name}</Text>
                <Text style={fs.placeAddress}>{place.address}</Text>
                <Text style={[fs.placeCount, { color: place.color }]}>{place.count} ocorrências</Text>
              </View>
              <View style={fs.placeChevron}>
                <Ionicons name="chevron-down" size={18} color={C.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Data (obrigatório, pré-preenchida) ──────────────── */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Data de registro <Text style={fs.req}>*</Text></Text>
            <View style={fs.dateBox}>
              <View style={fs.dateIconWrap}>
                <Ionicons name="calendar" size={18} color={C.primary} />
              </View>
              <Text style={fs.dateText}>{dateTime}</Text>
              <View style={fs.autoBadge}>
                <Text style={fs.autoBadgeText}>auto</Text>
              </View>
            </View>
            <Text style={fs.helper}>Data atual pré-preenchida automaticamente.</Text>
          </View>

          {/* ── Tipo (obrigatório, inclui "Outro") ──────────────── */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Tipo <Text style={fs.req}>*</Text></Text>
            <View style={fs.categoriesGrid}>
              {OCCURRENCE_TYPES.map(cat => {
                const active = occType === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      fs.categoryCard,
                      active && { borderColor: cat.color, backgroundColor: cat.color + '10' },
                      !!typeError && !active && fs.cardErr,
                    ]}
                    onPress={() => { setOccType(cat.id); touch('type'); }}
                    activeOpacity={0.75}
                  >
                    <View style={[fs.categoryIconCircle, { backgroundColor: active ? cat.color : '#F3F4F6' }]}>
                      <MaterialCommunityIcons name={cat.icon as any} size={22} color={active ? '#fff' : C.textSub} />
                    </View>
                    <Text style={[fs.categoryLabel, active && { color: cat.color }]}>{cat.label}</Text>
                    {active && (
                      <View style={[fs.categoryCheck, { backgroundColor: cat.color }]}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!typeError && (
              <View style={fs.errorRow}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={fs.errorText}>{typeError}</Text>
              </View>
            )}
          </View>

          {/* ── Gravidade (opcional) ─────────────────────────────── */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>
              Gravidade <Text style={fs.optional}>(opcional)</Text>
            </Text>
            <View style={fs.severityRow}>
              {SEVERITIES.map(sev => {
                const active = severity === sev.id;
                return (
                  <TouchableOpacity
                    key={sev.id}
                    style={[fs.severityPill, active && { borderColor: sev.color, backgroundColor: sev.color + '12' }]}
                    onPress={() => setSeverity(sev.id)}
                    activeOpacity={0.75}
                  >
                    {active && <View style={[fs.severityDot, { backgroundColor: sev.color }]} />}
                    <Text style={[fs.severityLabel, active && { color: sev.color }]}>{sev.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Descrição (obrigatório, min 10 chars) ────────────── */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Descrição <Text style={fs.req}>*</Text></Text>
            <View style={[fs.textAreaWrap, !!descError && fs.inputErr]}>
              <TextInput
                style={fs.textArea}
                placeholder="Descreva o ocorrido com pelo menos 10 caracteres..."
                placeholderTextColor={C.textMuted}
                multiline maxLength={CHAR_LIMIT}
                value={description}
                onChangeText={v => { setDescription(v); touch('description'); }}
                onBlur={() => touch('description')}
                textAlignVertical="top"
              />
              <View style={fs.charRow}>
                <Text style={[
                  fs.charCount,
                  description.trim().length > 0 && description.trim().length < 10 && { color: C.error },
                  description.trim().length >= 10 && { color: C.success },
                ]}>
                  {description.length}/{CHAR_LIMIT}
                </Text>
                {description.trim().length > 0 && description.trim().length < 10 && (
                  <Text style={fs.charHint}>Faltam {10 - description.trim().length} caractere(s)</Text>
                )}
              </View>
            </View>
            {!!descError && (
              <View style={fs.errorRow}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={fs.errorText}>{descError}</Text>
              </View>
            )}
          </View>

          {/* Aviso geral */}
          {Object.values(touched).some(Boolean) && !isValid && (
            <View style={fs.warnBanner}>
              <Ionicons name="warning-outline" size={16} color="#92400E" />
              <Text style={fs.warnText}>Preencha todos os campos obrigatórios.</Text>
            </View>
          )}

          {/* Botão — desabilitado durante loading */}
          <TouchableOpacity
            style={[fs.submitBtn, (!isValid || loading) && fs.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading ? (
              <ActivityIndicator size="small" color={isValid ? '#fff' : C.textMuted} />
            ) : (
              <>
                <Ionicons name="send" size={16} color={isValid ? '#fff' : C.textMuted} style={{ marginRight: 8 }} />
                <Text style={[fs.submitText, !isValid && { color: C.textMuted }]}>Registrar Ocorrência</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        <PlacePickerModal
          visible={placeModal}
          current={place}
          onSelect={setPlace}
          onClose={() => setPlaceModal(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
