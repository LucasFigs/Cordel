import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceData } from '../types';
import { OCCURRENCE_TYPES, SEVERITIES, C } from '../constants';

const cf = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  topBand:      { height: 4, backgroundColor: C.primary },
  scroll:       { flex: 1 },
  content:      { padding: 20, paddingTop: 32, alignItems: 'center' },
  iconOuter:    { width: 80, height: 80, borderRadius: 40, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:        { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  subtitle:     { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  protocolBadge:{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 24 },
  protocolText: { fontSize: 13, fontWeight: '700', color: C.primary },
  card:         { width: '100%', backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  cardTitle:    { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  row:          { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowIcon:      { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowLabel:     { fontSize: 11, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  rowValue:     { fontSize: 14, fontWeight: '700', color: C.text },
  rowSub:       { fontSize: 12, color: C.textSub, marginTop: 1 },
  divider:      { height: 1, backgroundColor: C.border, marginVertical: 12 },
  descText:     { fontSize: 13, color: C.textSub, lineHeight: 20, marginTop: 4 },
  sevTag:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  sevDot:       { width: 6, height: 6, borderRadius: 3 },
  sevTagText:   { fontSize: 11, fontWeight: '700' },
  stepRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  stepDot:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  stepDotDone:  { backgroundColor: C.success, borderColor: C.success },
  stepLine:     { position: 'absolute', left: 11, top: 30, width: 2, height: 20, backgroundColor: C.border },
  stepLineDone: { backgroundColor: C.success },
  stepLabel:    { fontSize: 14, fontWeight: '500', color: C.textSub },
  primaryBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, marginBottom: 10 },
  primaryBtnText:  { fontSize: 15, fontWeight: '700', color: '#fff' },
  secondaryBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: C.primary },
  secondaryBtnText:{ fontSize: 15, fontWeight: '700', color: C.primary },
});

interface ConfirmationScreenProps {
  data:              OccurrenceData;
  protocol:          number;
  onNovaOcorrencia:  () => void;
  onVerHistorico:    () => void;
}

export function ConfirmationScreen({
  data, protocol, onNovaOcorrencia, onVerHistorico,
}: ConfirmationScreenProps) {
  const typeInfo     = OCCURRENCE_TYPES.find(t => t.id === data.type);
  const severityInfo = SEVERITIES.find(sv => sv.id === data.severity);

  const steps = [
    { label: 'Enviado',      done: true  },
    { label: 'Em análise',   done: false },
    { label: 'Em andamento', done: false },
    { label: 'Resolvido',    done: false },
  ];

  return (
    <View style={cf.root}>
      <View style={cf.topBand} />

      <ScrollView
        style={cf.scroll}
        contentContainerStyle={cf.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícone de sucesso */}
        <View style={cf.iconOuter}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>

        <Text style={cf.title}>Ocorrência Registrada!</Text>
        <Text style={cf.subtitle}>
          Sua ocorrência foi enviada com sucesso e será analisada em breve pela equipe responsável.
        </Text>

        {/* Badge de protocolo */}
        <View style={cf.protocolBadge}>
          <Ionicons name="document-text-outline" size={13} color={C.primary} />
          <Text style={cf.protocolText}>Protocolo #{protocol}</Text>
        </View>

        {/* Resumo */}
        <View style={cf.card}>
          <Text style={cf.cardTitle}>RESUMO DA OCORRÊNCIA</Text>

          <View style={cf.row}>
            <View style={cf.rowIcon}>
              <Ionicons name="location-outline" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cf.rowLabel}>Local</Text>
              <Text style={cf.rowValue}>{data.place.name}</Text>
              <Text style={cf.rowSub}>{data.place.address}</Text>
            </View>
          </View>

          <View style={cf.divider} />

          <View style={cf.row}>
            <View style={cf.rowIcon}>
              <Ionicons name="calendar-outline" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cf.rowLabel}>Data e hora</Text>
              <Text style={cf.rowValue}>{data.dateTime}</Text>
            </View>
          </View>

          <View style={cf.divider} />

          <View style={cf.row}>
            <View style={[cf.rowIcon, { backgroundColor: (typeInfo?.color ?? C.primary) + '18' }]}>
              <MaterialCommunityIcons
                name={typeInfo?.icon as any}
                size={16}
                color={typeInfo?.color ?? C.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cf.rowLabel}>Tipo</Text>
              <Text style={[cf.rowValue, { color: typeInfo?.color }]}>{typeInfo?.label}</Text>
            </View>
            {severityInfo && (
              <View style={[cf.sevTag, { backgroundColor: severityInfo.color + '18', borderColor: severityInfo.color + '40' }]}>
                <View style={[cf.sevDot, { backgroundColor: severityInfo.color }]} />
                <Text style={[cf.sevTagText, { color: severityInfo.color }]}>{severityInfo.label}</Text>
              </View>
            )}
          </View>

          <View style={cf.divider} />

          <Text style={cf.rowLabel}>Descrição</Text>
          <Text style={cf.descText}>{data.description}</Text>
        </View>

        {/* Acompanhamento */}
        <View style={cf.card}>
          <Text style={cf.cardTitle}>ACOMPANHAMENTO</Text>
          {steps.map((step, i) => (
            <View key={step.label} style={{ position: 'relative' }}>
              <View style={cf.stepRow}>
                <View style={[cf.stepDot, step.done && cf.stepDotDone]}>
                  <Ionicons
                    name={step.done ? 'checkmark' : 'ellipse-outline'}
                    size={12}
                    color={step.done ? '#fff' : C.textMuted}
                  />
                </View>
                {i < steps.length - 1 && (
                  <View style={[cf.stepLine, step.done && cf.stepLineDone]} />
                )}
                <Text style={[cf.stepLabel, step.done && { color: C.success, fontWeight: '700' }]}>
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ações */}
        <TouchableOpacity style={cf.primaryBtn} onPress={onNovaOcorrencia} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={cf.primaryBtnText}>Registrar Nova Ocorrência</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cf.secondaryBtn} onPress={onVerHistorico} activeOpacity={0.7}>
          <Ionicons name="list-outline" size={18} color={C.primary} style={{ marginRight: 8 }} />
          <Text style={cf.secondaryBtnText}>Ver Minhas Ocorrências</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
