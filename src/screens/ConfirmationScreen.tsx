import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceData } from '../types';
import { OCCURRENCE_TYPES, SEVERITIES, C } from '../constants';
import { cf } from '../styles';

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
