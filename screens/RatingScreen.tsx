
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, TextInput, Image,
  Platform, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ReviewData, EvalType } from '../types';
import { C, PLACES, EVAL_TYPES, getNow, formatDate } from '../constants';
import PlacePickerModal from '../components/PlacePickerModal';
import DateTimePickerModal from '../components/DateTimePickerModal';

type Props = {
  onSubmit: (data: ReviewData) => void;
  initialData?: Partial<ReviewData>;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7} style={s.starBtn}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={36}
            color={star <= value ? C.accent : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PhotoSlot({
  photo, onAdd, onRemove,
}: { photo: string | null; onAdd: () => void; onRemove: () => void }) {
  return (
    <TouchableOpacity
      style={[s.photoSlot, !!photo && s.photoSlotFilled]}
      onPress={photo ? onRemove : onAdd}
      activeOpacity={0.75}
    >
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={s.photoThumb} />
          <View style={s.photoRemoveBtn}>
            <Ionicons name="close-circle" size={20} color="#fff" />
          </View>
        </>
      ) : (
        <View style={s.photoPlaceholder}>
          <Ionicons name="add" size={26} color={C.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FormScreen({ onSubmit, initialData }: Props) {
  const [place, setPlace]              = useState(initialData?.place ?? PLACES[0]);
  const [placeModal, setPlaceModal]    = useState(false);
  const [dateModal, setDateModal]      = useState(false);
  const [dateTime, setDateTime]        = useState(initialData?.dateTime ?? getNow());
  const [evalType, setEvalType]        = useState<EvalType | null>(initialData?.evalType ?? null);
  const [stars, setStars]              = useState(initialData?.stars ?? 0);
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [photos, setPhotos]            = useState<(string | null)[]>([null, null, null]);

  const charLimit = 300;
  const isValid = !!evalType && stars > 0 && description.trim().length > 0;

  const handleAddPhoto = (i: number) => {
    Alert.alert('Adicionar foto', 'Selecione uma fonte:', [
      { text: 'Câmera',   onPress: () => {} },
      { text: 'Galeria',  onPress: () => {} },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (i: number) => {
    const updated = [...photos];
    updated[i] = null;
    setPhotos(updated);
  };

  const handleSubmit = () => {
    if (!evalType) { Alert.alert('Atenção', 'Selecione o tipo de avaliação.'); return; }
    if (stars === 0) { Alert.alert('Atenção', 'Dê uma nota com as estrelas.'); return; }
    if (!description.trim()) { Alert.alert('Atenção', 'Escreva algo sobre o lugar.'); return; }
    onSubmit({ place, dateTime, evalType, stars, description });
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBack}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nova Avaliação</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Local */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Local</Text>
          <TouchableOpacity style={s.placeCard} onPress={() => setPlaceModal(true)} activeOpacity={0.8}>
            <View style={[s.placeIconWrap, { backgroundColor: place.color + '18' }]}>
              <MaterialCommunityIcons name={place.icon as any} size={26} color={place.color} />
            </View>
            <View style={s.placeInfo}>
              <Text style={s.placeName}>{place.name}</Text>
              <Text style={s.placeAddress}>{place.address}</Text>
              <Text style={[s.placeVisits, { color: place.color }]}>{place.visits} avaliações</Text>
            </View>
            <View style={s.placeChevron}>
              <Ionicons name="chevron-down" size={18} color={C.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Data */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Data da visita</Text>
          <TouchableOpacity style={s.dateBox} onPress={() => setDateModal(true)} activeOpacity={0.8}>
            <View style={s.dateIconWrap}>
              <Ionicons name="calendar" size={18} color={C.primary} />
            </View>
            <Text style={s.dateText}>{formatDate(dateTime)}</Text>
            <Ionicons name="chevron-down" size={16} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Descrição */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Descrição</Text>
          <View style={s.textAreaWrap}>
            <TextInput
              style={s.textArea}
              placeholder="Conte sua experiência neste lugar..."
              placeholderTextColor={C.textMuted}
              multiline
              maxLength={charLimit}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Text style={s.charCount}>{description.length}/{charLimit}</Text>
          </View>
        </View>

        {/* Nota */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Sua nota</Text>
          <View style={s.ratingBox}>
            <StarRating value={stars} onChange={setStars} />
            <Text style={s.ratingHint}>
              {stars === 0 ? 'Toque para avaliar' : ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'][stars]}
            </Text>
          </View>
        </View>

        

        {/* Fotos */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Fotos do local</Text>
          <Text style={s.sectionSub}>Adicione até 3 fotos</Text>
          <View style={s.photosRow}>
            {photos.map((p, i) => (
              <PhotoSlot
                key={i}
                photo={p}
                onAdd={() => handleAddPhoto(i)}
                onRemove={() => handleRemovePhoto(i)}
              />
            ))}
          </View>
        </View>

        {/* Enviar */}
        <TouchableOpacity
          style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.82}
          disabled={!isValid}
        >
          <Text style={[s.submitText, !isValid && { color: C.textMuted }]}>Enviar Avaliação</Text>
          <Ionicons
            name="send"
            size={16}
            color={isValid ? '#fff' : C.textMuted}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {(
          [
            { icon: 'search-outline',  label: 'Explorar',  active: false },
            { icon: 'heart-outline',   label: 'Favoritos', active: false },
            { icon: 'star-outline',    label: 'Avaliar',   active: true  },
            { icon: 'person-outline',  label: 'Perfil',    active: false },
          ] as const
        ).map((item) => (
          <TouchableOpacity key={item.label} style={s.navItem} activeOpacity={0.7}>
            <Ionicons name={item.icon} size={24} color={item.active ? C.primary : C.textMuted} />
            <Text style={[s.navLabel, item.active && { color: C.primary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <PlacePickerModal
        visible={placeModal}
        current={place}
        onSelect={setPlace}
        onClose={() => setPlaceModal(false)}
      />
      <DateTimePickerModal
        visible={dateModal}
        value={dateTime}
        onChange={setDateTime}
        onClose={() => setDateModal(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: Platform.OS === 'android' ? 42 : 56,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: 0.2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },
  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  sectionSub: { fontSize: 12, color: C.textMuted, marginTop: -6, marginBottom: 10 },

  placeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  placeIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 15, fontWeight: '700', color: C.text },
  placeAddress: { fontSize: 12, color: C.textSub, marginTop: 2 },
  placeVisits: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  placeChevron: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },

  dateBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  dateIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  dateText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '47%', backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border, padding: 14,
    alignItems: 'flex-start', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  categoryIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: C.textSub },
  categoryCheck: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  ratingBox: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingVertical: 20, paddingHorizontal: 14, alignItems: 'center',
  },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  starBtn: { padding: 4 },
  ratingHint: { fontSize: 13, color: C.textSub, fontWeight: '500' },

  textAreaWrap: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 14 },
  textArea: { color: C.text, fontSize: 14, minHeight: 100, lineHeight: 22 },
  charCount: { textAlign: 'right', fontSize: 11, color: C.textMuted, marginTop: 6 },

  photosRow: { flexDirection: 'row', gap: 10 },
  photoSlot: {
    flex: 1, aspectRatio: 1, backgroundColor: C.card,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', overflow: 'hidden',
  },
  photoSlotFilled: { borderStyle: 'solid' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoRemoveBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: '#0006', borderRadius: 12 },

  submitBtn: {
    backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: C.border },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  bottomNav: {
    flexDirection: 'row', backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10, paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
});
