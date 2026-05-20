import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OccurrenceData, Place } from '../types';
import { PLACES, getNowFormatted } from '../constants';
import { PlacePickerModal } from '../components/PlacePickerModal';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface RatingScreenProps {
  userId:   string;
  onSubmit: (data: OccurrenceData) => Promise<void>;
}

const STAR_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Muito ruim 😞',  color: '#E11D48' },
  2: { label: 'Ruim 😕',        color: '#F97316' },
  3: { label: 'Regular 😐',     color: '#F59E0B' },
  4: { label: 'Bom 😊',         color: '#84CC16' },
  5: { label: 'Excelente 🤩',   color: '#059669' },
};

export function RatingScreen({ userId, onSubmit }: RatingScreenProps) {
  const [place,     setPlace]     = useState<Place>(PLACES[0]);
  const [modal,     setModal]     = useState(false);
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast, showLoading, showError, showSuccess, hide } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) { showError('Selecione uma nota de 1 a 5 estrelas.'); return; }
    setLoading(true);
    showLoading('Enviando avaliação…');
    try {
      const desc = comment.trim() || `Avaliação: ${rating} estrela(s) — ${STAR_LABELS[rating].label}`;
      await onSubmit({
        place, dateTime: getNowFormatted(), userId,
        type: 'atendimento',
        severity: rating >= 4 ? 'baixa' : rating === 3 ? 'media' : 'alta',
        description: desc, rating,
      });
      hide();
      setSubmitted(true);
    } catch { showError('Falha ao enviar. Verifique sua conexão.'); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <View style={r.successRoot}>
        <Toast toast={toast} />
        <View style={r.successIcon}><Ionicons name="star" size={44} color="#fff" /></View>
        <Text style={r.successTitle}>Avaliação Enviada!</Text>
        <Text style={r.successSub}>Obrigado pelo seu feedback!{'\n'}Ele nos ajuda a melhorar os espaços culturais.</Text>
        <TouchableOpacity style={r.newBtn} onPress={() => { setRating(0); setComment(''); setSubmitted(false); }} activeOpacity={0.85}>
          <Text style={r.newBtnText}>Nova Avaliação</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const starInfo = rating > 0 ? STAR_LABELS[rating] : null;

  return (
    <View style={r.root}>
      <Toast toast={toast} />
      <View style={r.header}>
        <View>
          <Text style={r.headerTitle}>Avaliar Visita</Text>
          <Text style={r.headerSub}>Compartilhe sua experiência</Text>
        </View>
        <View style={r.badge}><Text style={r.badgeText}>RF02</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Local */}
        <Text style={r.label}>Local visitado <Text style={r.req}>*</Text></Text>
        <TouchableOpacity style={r.placeCard} onPress={() => setModal(true)} activeOpacity={0.8}>
          <View style={[r.placeIcon, { backgroundColor: place.color + '18' }]}>
            <MaterialCommunityIcons name={place.icon as any} size={26} color={place.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={r.placeName}>{place.name}</Text>
            <Text style={r.placeAddr}>{place.address}</Text>
          </View>
          <View style={r.placeChevron}><Ionicons name="chevron-down" size={18} color="#2563EB" /></View>
        </TouchableOpacity>

        {/* Estrelas */}
        <Text style={[r.label, { marginTop: 20 }]}>Sua nota <Text style={r.req}>*</Text></Text>
        <View style={r.starCard}>
          <View style={r.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7} style={{ padding: 6 }}>
                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={46} color={i <= rating ? '#F59E0B' : '#A0AAB4'} />
              </TouchableOpacity>
            ))}
          </View>
          {starInfo
            ? <Text style={[r.starLabel, { color: starInfo.color }]}>{starInfo.label}</Text>
            : <Text style={[r.starLabel, { color: '#A0AAB4' }]}>Toque nas estrelas para avaliar</Text>
          }
          {rating > 0 && (
            <View style={r.progressRow}>
              {[1,2,3,4,5].map(i => (
                <View key={i} style={[r.progressBar, { backgroundColor: i <= rating ? (starInfo?.color ?? '#F59E0B') : '#E8ECF2' }]} />
              ))}
            </View>
          )}
        </View>

        {/* Comentário */}
        <Text style={[r.label, { marginTop: 20 }]}>Comentário <Text style={r.optional}>(opcional)</Text></Text>
        <View style={r.commentWrap}>
          <TextInput style={r.commentInput} placeholder="Conte mais sobre sua experiência..." placeholderTextColor="#A0AAB4" multiline maxLength={300} value={comment} onChangeText={setComment} textAlignVertical="top" />
          <Text style={r.charCount}>{comment.length}/300</Text>
        </View>

        <TouchableOpacity style={[r.submitBtn, (rating === 0 || loading) && r.submitBtnDisabled]} onPress={handleSubmit} disabled={rating === 0 || loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator size="small" color={rating > 0 ? '#fff' : '#A0AAB4'} />
            : <><Ionicons name="star" size={17} color={rating > 0 ? '#fff' : '#A0AAB4'} style={{ marginRight: 8 }} /><Text style={[r.submitText, rating === 0 && { color: '#A0AAB4' }]}>Enviar Avaliação</Text></>
          }
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      <PlacePickerModal visible={modal} current={place} onSelect={setPlace} onClose={() => setModal(false)} />
    </View>
  );
}

const r = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#F7F8FA' },
  header:     { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF2' },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSub:  { fontSize: 12, color: '#A0AAB4', marginTop: 2 },
  badge:      { backgroundColor: '#EEF3FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  label:      { fontSize: 11, fontWeight: '700', color: '#A0AAB4', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  req:        { color: '#E11D48' },
  optional:   { color: '#A0AAB4', fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  placeCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: '#E8ECF2', marginBottom: 4 },
  placeIcon:  { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  placeName:  { fontSize: 15, fontWeight: '700', color: '#111827' },
  placeAddr:  { fontSize: 12, color: '#6B7280', marginTop: 2 },
  placeChevron: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center' },
  starCard:   { backgroundColor: '#fff', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E8ECF2', alignItems: 'center' },
  starsRow:   { flexDirection: 'row', gap: 4, marginBottom: 10 },
  starLabel:  { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  progressRow:{ flexDirection: 'row', gap: 6, width: '100%' },
  progressBar:{ flex: 1, height: 5, borderRadius: 3 },
  commentWrap:{ backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E8ECF2', padding: 14 },
  commentInput:{ fontSize: 14, color: '#111827', minHeight: 80, lineHeight: 21 },
  charCount:  { fontSize: 11, color: '#A0AAB4', textAlign: 'right', marginTop: 6 },
  submitBtn:  { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: '#E8ECF2' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  successRoot:{ flex: 1, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon:{ width: 92, height: 92, borderRadius: 46, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 6, borderColor: '#FEF3C7', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  successTitle:{ fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  successSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  newBtn:     { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  newBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
