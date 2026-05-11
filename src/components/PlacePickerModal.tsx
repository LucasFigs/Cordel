import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Place } from '../types';
import { PLACES, C } from '../constants';

interface PlacePickerModalProps {
  visible: boolean; current: Place;
  onSelect: (p: Place) => void; onClose: () => void;
}

export function PlacePickerModal({ visible, current, onSelect, onClose }: PlacePickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={p.overlay}>
        <View style={p.sheet}>
          <View style={p.header}>
            <Text style={p.title}>Escolha o Local</Text>
            <TouchableOpacity onPress={onClose} style={p.closeBtn}>
              <Ionicons name="close" size={20} color={C.textSub} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {PLACES.map(place => {
              const active = current.id === place.id;
              return (
                <TouchableOpacity
                  key={place.id}
                  style={[p.item, active && { backgroundColor: place.color + '10', borderColor: place.color }]}
                  onPress={() => { onSelect(place); onClose(); }}
                  activeOpacity={0.8}
                >
                  <View style={[p.iconWrap, { backgroundColor: place.color + '18' }]}>
                    <MaterialCommunityIcons name={place.icon as any} size={22} color={place.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[p.itemName, active && { color: place.color }]}>{place.name}</Text>
                    <Text style={p.itemAddr}>{place.address}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={place.color} />}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const p = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, maxHeight: '80%', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:    { fontSize: 17, fontWeight: '800', color: C.text },
  closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  item:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, marginBottom: 10, backgroundColor: C.card },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: C.text },
  itemAddr: { fontSize: 12, color: C.textSub, marginTop: 2 },
});
