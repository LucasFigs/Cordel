import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceType, Severity, Place, OccurrenceData } from '../types';
import { C, PLACES, OCCURRENCE_TYPES, SEVERITIES, getNowFormatted } from '../constants';
import PlacePickerModal from '../components/PlacePickerModal';

type Props = {
  onSubmit?: (data: OccurrenceData) => void;
};

type FormErrors = {
  type?: string;
  description?: string;
};

// ─── Confirmation Screen ───────────────────────────────────────────────
function ConfirmationScreen({
  data,
  onNewOccurrence,
}: {
  data: OccurrenceData;
  onNewOccurrence: () => void;
}) {
  const typeInfo     = OCCURRENCE_TYPES.find((t) => t.id === data.type);
  const severityInfo = SEVERITIES.find((sv) => sv.id === data.severity);
  const protocol     = React.useRef(Math.floor(100000 + Math.random() * 900000)).current;

  return (
    <View style={s.root}>
      {/* Decorative top band */}
      <View style={cs.topBand} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cs.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={cs.iconWrap}>
          <View style={cs.iconOuter}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
        </View>

        <Text style={cs.title}>Ocorrência Registrada!</Text>
        <Text style={cs.subtitle}>
          Sua ocorrência foi enviada com sucesso e será analisada em breve pela equipe responsável.
        </Text>

        <View style={cs.protocolBadge}>
          <Ionicons name="document-text-outline" size={13} color={C.primary} />
          <Text style={cs.protocolText}>Protocolo #{protocol}</Text>
        </View>

        {/* Summary card */}
        <View style={cs.card}>
          <Text style={cs.cardTitle}>RESUMO DA OCORRÊNCIA</Text>

          <View style={cs.row}>
            <View style={cs.rowIcon}>
              <Ionicons name="location-outline" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cs.rowLabel}>Local</Text>
              <Text style={cs.rowValue}>{data.place.name}</Text>
              <Text style={cs.rowSub}>{data.place.address}</Text>
            </View>
          </View>

          <View style={cs.divider} />

          <View style={cs.row}>
            <View style={cs.rowIcon}>
              <Ionicons name="calendar-outline" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cs.rowLabel}>Data e hora</Text>
              <Text style={cs.rowValue}>{data.dateTime}</Text>
            </View>
          </View>

          <View style={cs.divider} />

          <View style={cs.row}>
            <View style={[cs.rowIcon, { backgroundColor: (typeInfo?.color ?? C.primary) + '18' }]}>
              <MaterialCommunityIcons
                name={typeInfo?.icon as any}
                size={16}
                color={typeInfo?.color ?? C.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cs.rowLabel}>Tipo</Text>
              <Text style={[cs.rowValue, { color: typeInfo?.color }]}>{typeInfo?.label}</Text>
            </View>
            {severityInfo && (
              <View style={[cs.sevTag, { backgroundColor: severityInfo.color + '18', borderColor: severityInfo.color + '40' }]}>
                <View style={[cs.sevDot, { backgroundColor: severityInfo.color }]} />
                <Text style={[cs.sevTagText, { color: severityInfo.color }]}>{severityInfo.label}</Text>
              </View>
            )}
          </View>

          <View style={cs.divider} />

          <View>
            <Text style={cs.rowLabel}>Descrição</Text>
            <Text style={cs.descText}>{data.description}</Text>
          </View>
        </View>

        {/* Status tracker */}
        <View style={cs.card}>
          <Text style={cs.cardTitle}>ACOMPANHAMENTO</Text>
          {[
            { label: 'Enviado',       done: true,  icon: 'checkmark-circle' as const },
            { label: 'Em análise',    done: false, icon: 'time-outline' as const },
            { label: 'Em andamento',  done: false, icon: 'construct-outline' as const },
            { label: 'Resolvido',     done: false, icon: 'ribbon-outline' as const },
          ].map((step, i) => (
            <View key={step.label} style={cs.stepRow}>
              <View style={[cs.stepDot, step.done && cs.stepDotDone]}>
                <Ionicons name={step.icon} size={13} color={step.done ? '#fff' : C.textMuted} />
              </View>
              {i < 3 && <View style={[cs.stepLine, step.done && cs.stepLineDone]} />}
              <Text style={[cs.stepLabel, step.done && { color: C.success, fontWeight: '700' }]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <TouchableOpacity style={cs.primaryBtn} onPress={onNewOccurrence} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={cs.primaryBtnText}>Registrar Nova Ocorrência</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cs.secondaryBtn} activeOpacity={0.7}>
          <Ionicons name="list-outline" size={18} color={C.primary} style={{ marginRight: 8 }} />
          <Text style={cs.secondaryBtnText}>Ver Minhas Ocorrências</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav />
    </View>
  );
}

// ─── Bottom Nav (shared) ───────────────────────────────────────────────
function BottomNav() {
  return (
    <View style={s.bottomNav}>
      {(
        [
          { icon: 'home-outline',         label: 'Início',    active: false },
          { icon: 'list-outline',          label: 'Histórico', active: false },
          { icon: 'alert-circle-outline',  label: 'Registrar', active: true  },
          { icon: 'notifications-outline', label: 'Alertas',   active: false },
          { icon: 'person-outline',        label: 'Perfil',    active: false },
        ] as const
      ).map((item) => (
        <TouchableOpacity key={item.label} style={s.navItem} activeOpacity={0.7}>
          <Ionicons name={item.icon} size={24} color={item.active ? C.primary : C.textMuted} />
          <Text style={[s.navLabel, item.active && { color: C.primary }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Error Message ─────────────────────────────────────────────────────
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <View style={s.errorRow}>
      <Ionicons name="alert-circle" size={13} color="#E11D48" />
      <Text style={s.errorText}>{msg}</Text>
    </View>
  );
}

// ─── Main Form Screen ──────────────────────────────────────────────────
export default function OccurrenceFormScreen({ onSubmit }: Props) {
  const [place,       setPlace]       = useState<Place>(PLACES[0]);
  const [placeModal,  setPlaceModal]  = useState(false);
  const [dateTime]                    = useState(getNowFormatted());
  const [occType,     setOccType]     = useState<OccurrenceType | null>(null);
  const [severity,    setSeverity]    = useState<Severity | null>(null);
  const [description, setDescription] = useState('');
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});
  const [submitted,   setSubmitted]   = useState<OccurrenceData | null>(null);

  const CHAR_LIMIT = 300;

  // ── Validation ─────────────────────────────────────────────────────
  function computeErrors(): FormErrors {
    const e: FormErrors = {};
    if (!occType) {
      e.type = 'Selecione o tipo de ocorrência';
    }
    if (description.trim().length < 10) {
      e.description = 'Descreva o ocorrido com pelo menos 10 caracteres';
    }
    return e;
  }

  const errors  = computeErrors();
  const isValid = Object.keys(errors).length === 0;

  function touch(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setTouched({ type: true, description: true });
    if (!isValid) return;

    const data: OccurrenceData = {
      place,
      dateTime,
      type: occType!,
      severity: severity ?? 'baixa',
      description,
    };
    onSubmit?.(data);
    setSubmitted(data);
  };

  // ── Reset ──────────────────────────────────────────────────────────
  const handleNewOccurrence = () => {
    setPlace(PLACES[0]);
    setOccType(null);
    setSeverity(null);
    setDescription('');
    setTouched({});
    setSubmitted(null);
  };

  // ── Confirmation screen ────────────────────────────────────────────
  if (submitted) {
    return <ConfirmationScreen data={submitted} onNewOccurrence={handleNewOccurrence} />;
  }

  const typeError = touched.type        ? errors.type        : undefined;
  const descError = touched.description ? errors.description : undefined;

  return (
    <View style={s.root}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBack}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nova Ocorrência</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>Formulário</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Local ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Local <Text style={s.req}>*</Text>
          </Text>
          <TouchableOpacity
            style={s.placeCard}
            onPress={() => setPlaceModal(true)}
            activeOpacity={0.8}
          >
            <View style={[s.placeIconWrap, { backgroundColor: place.color + '18' }]}>
              <MaterialCommunityIcons name={place.icon as any} size={26} color={place.color} />
            </View>
            <View style={s.placeInfo}>
              <Text style={s.placeName}>{place.name}</Text>
              <Text style={s.placeAddress}>{place.address}</Text>
              <Text style={[s.placeCount, { color: place.color }]}>{place.count} ocorrências</Text>
            </View>
            <View style={s.placeChevron}>
              <Ionicons name="chevron-down" size={18} color={C.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Data ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Data de registro</Text>
          <View style={s.dateBox}>
            <View style={s.dateIconWrap}>
              <Ionicons name="calendar" size={18} color={C.primary} />
            </View>
            <Text style={s.dateText}>{dateTime}</Text>
            <View style={s.autoBadge}>
              <Text style={s.autoBadgeText}>auto</Text>
            </View>
          </View>
          <Text style={s.helper}>Registrada automaticamente — não pode ser futura.</Text>
        </View>

        {/* ── Tipo ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Tipo de ocorrência <Text style={s.req}>*</Text>
          </Text>
          <View style={s.categoriesGrid}>
            {OCCURRENCE_TYPES.map((cat) => {
              const active = occType === cat.id;
              const hasErr = !!typeError && !active;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    s.categoryCard,
                    active  && { borderColor: cat.color, backgroundColor: cat.color + '10' },
                    hasErr  && s.cardErr,
                  ]}
                  onPress={() => { setOccType(cat.id); touch('type'); }}
                  activeOpacity={0.75}
                >
                  <View style={[s.categoryIconCircle, { backgroundColor: active ? cat.color : '#F3F4F6' }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={22} color={active ? '#fff' : C.textSub} />
                  </View>
                  <Text style={[s.categoryLabel, active && { color: cat.color }]}>{cat.label}</Text>
                  {active && (
                    <View style={[s.categoryCheck, { backgroundColor: cat.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {!!typeError && <ErrorMsg msg={typeError} />}
        </View>

        {/* ── Gravidade ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Gravidade <Text style={s.optional}>(opcional)</Text>
          </Text>
          <View style={s.severityRow}>
            {SEVERITIES.map((sev) => {
              const active = severity === sev.id;
              return (
                <TouchableOpacity
                  key={sev.id}
                  style={[s.severityPill, active && { borderColor: sev.color, backgroundColor: sev.color + '12' }]}
                  onPress={() => setSeverity(sev.id)}
                  activeOpacity={0.75}
                >
                  {active && <View style={[s.severityDot, { backgroundColor: sev.color }]} />}
                  <Text style={[s.severityLabel, active && { color: sev.color }]}>{sev.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Descrição ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Descrição <Text style={s.req}>*</Text>
          </Text>
          <View style={[s.textAreaWrap, !!descError && s.inputErr]}>
            <TextInput
              style={s.textArea}
              placeholder="Descreva o ocorrido com pelo menos 10 caracteres..."
              placeholderTextColor={C.textMuted}
              multiline
              maxLength={CHAR_LIMIT}
              value={description}
              onChangeText={(v) => { setDescription(v); touch('description'); }}
              onBlur={() => touch('description')}
              textAlignVertical="top"
            />
            <View style={s.charRow}>
              <Text style={[
                s.charCount,
                description.trim().length > 0 && description.trim().length < 10 && { color: '#E11D48' },
                description.trim().length >= 10 && { color: C.success },
              ]}>
                {description.length}/{CHAR_LIMIT}
              </Text>
              {description.trim().length > 0 && description.trim().length < 10 && (
                <Text style={s.charHint}>
                  Faltam {10 - description.trim().length} caractere(s)
                </Text>
              )}
            </View>
          </View>
          {!!descError && <ErrorMsg msg={descError} />}
        </View>

        {/* ── Aviso geral ao tentar enviar com erros ── */}
        {Object.values(touched).some(Boolean) && !isValid && (
          <View style={s.warnBanner}>
            <Ionicons name="warning-outline" size={16} color="#92400E" />
            <Text style={s.warnText}>
              Preencha todos os campos obrigatórios antes de enviar.
            </Text>
          </View>
        )}

        {/* ── Enviar ── */}
        <TouchableOpacity
          style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.82}
        >
          <Ionicons
            name="send"
            size={16}
            color={isValid ? '#fff' : C.textMuted}
            style={{ marginRight: 8 }}
          />
          <Text style={[s.submitText, !isValid && { color: C.textMuted }]}>
            Registrar Ocorrência
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNav />

      <PlacePickerModal
        visible={placeModal}
        current={place}
        onSelect={setPlace}
        onClose={() => setPlaceModal(false)}
      />
    </View>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: Platform.OS === 'android' ? 42 : 56,
    paddingBottom: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  headerTitle:     { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: 0.2 },
  headerBadge:     { backgroundColor: C.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: C.primary },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },

  section:      { marginBottom: 22 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  req:          { color: '#E11D48', fontWeight: '700' },
  optional:     { color: C.textMuted, fontWeight: '400', letterSpacing: 0, textTransform: 'none', fontSize: 11 },
  helper:       { fontSize: 11, color: C.textMuted, marginTop: 6 },

  // Error states
  inputErr:  { borderColor: '#E11D48 ', borderWidth: 1.5 },
  cardErr:   { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },

  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  errorText: { fontSize: 12, color: '#E11D48', fontWeight: '500', flex: 1 },

  warnBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  warnText: { fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 },

  placeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  placeIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  placeInfo:     { flex: 1 },
  placeName:     { fontSize: 15, fontWeight: '700', color: C.text },
  placeAddress:  { fontSize: 12, color: C.textSub, marginTop: 2 },
  placeCount:    { fontSize: 11, fontWeight: '600', marginTop: 4 },
  placeChevron:  { width: 30, height: 30, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },

  dateBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  dateIconWrap:  { width: 32, height: 32, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  dateText:      { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  autoBadge:     { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  autoBadgeText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '47%', backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    padding: 14, alignItems: 'flex-start', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  categoryIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryLabel:      { fontSize: 13, fontWeight: '600', color: C.textSub },
  categoryCheck:      { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  severityRow:  { flexDirection: 'row', gap: 10 },
  severityPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  severityDot:  { width: 7, height: 7, borderRadius: 4 },
  severityLabel:{ fontSize: 13, fontWeight: '600', color: C.textSub },

  textAreaWrap: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 14 },
  textArea:     { color: C.text, fontSize: 14, minHeight: 100, lineHeight: 22 },
  charRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  charCount:    { fontSize: 11, color: C.textMuted },
  charHint:     { fontSize: 10, color: '#E11D48' },

  submitBtn: {
    backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: C.border },
  submitText:        { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  bottomNav: {
    flexDirection: 'row', backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10, paddingTop: 10,
  },
  navItem:  { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
});

// ─── Confirmation Screen Styles ────────────────────────────────────────
const cs = StyleSheet.create({
  topBand: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 180,
    backgroundColor: C.primary, opacity: 0.05,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 72,
    alignItems: 'center',
  },

  iconWrap: { marginBottom: 20 },
  iconOuter: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.success,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.success, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    borderWidth: 6, borderColor: C.successLight,
  },

  title:    { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.3, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 16, paddingHorizontal: 10 },

  protocolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primaryLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, marginBottom: 24,
    borderWidth: 1, borderColor: C.primary + '30',
  },
  protocolText: { fontSize: 12, fontWeight: '700', color: C.primary },

  card: {
    width: '100%', backgroundColor: C.card, borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 },

  row:      { flexDirection: 'row', alignItems: 'flex-start' },
  rowIcon:  { width: 32, height: 32, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 },
  rowLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  rowValue: { fontSize: 14, fontWeight: '700', color: C.text },
  rowSub:   { fontSize: 12, color: C.textSub, marginTop: 2 },
  divider:  { height: 1, backgroundColor: C.border, marginVertical: 12 },
  descText: { fontSize: 14, color: C.textSub, lineHeight: 20, marginTop: 4 },

  sevTag:     { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, marginLeft: 8 },
  sevDot:     { width: 7, height: 7, borderRadius: 4 },
  sevTagText: { fontSize: 12, fontWeight: '700' },

  stepRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10, position: 'relative' },
  stepDot:     { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginRight: 12, zIndex: 1 },
  stepDotDone: { backgroundColor: C.success, borderColor: C.success },
  stepLine:    { position: 'absolute', left: 13, top: 28, width: 2, height: 10, backgroundColor: C.border },
  stepLineDone:{ backgroundColor: C.success },
  stepLabel:   { fontSize: 13, fontWeight: '600', color: C.textSub },

  primaryBtn: {
    width: '100%', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  secondaryBtn: {
    width: '100%', backgroundColor: C.card, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.primary + '50',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: C.primary, letterSpacing: 0.2 },
});
