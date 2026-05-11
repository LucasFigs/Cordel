import React from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Place } from '../types';
import { C, PLACES } from '../constants';

type Props = {
  visible:  boolean;
  current:  Place;
  onSelect: (place: Place) => void;
  onClose:  () => void;
};

export default function PlacePickerModal({ visible, current, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.balloon}>
          <View style={s.arrow} />
          <Text style={s.title}>Selecionar local</Text>
          <FlatList
            data={PLACES}
            keyExtractor={(p) => p.id}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => {
              const active = current?.id === item.id;
              return (
                <TouchableOpacity
                  style={[s.row, active && { backgroundColor: C.primaryLight }]}
                  onPress={() => { onSelect(item); onClose(); }}
                  activeOpacity={0.7}
                >
                  <View style={[s.rowIcon, { backgroundColor: item.color + '18' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowName, active && { color: C.primary }]}>{item.name}</Text>
                    <Text style={s.rowAddr}>{item.address}</Text>
                  </View>
                  <Text style={s.rowCount}>{item.count}</Text>
                  {active && (
                    <Ionicons name="checkmark-circle" size={18} color={C.primary} style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 130 : 150,
    paddingHorizontal: 18,
  },
  balloon: {
    backgroundColor: C.card,
    borderRadius: 18,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  arrow: {
    position: 'absolute',
    top: -8,
    left: 36,
    width: 16,
    height: 16,
    backgroundColor: C.card,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 2,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowName:  { fontSize: 14, fontWeight: '600', color: C.text },
  rowAddr:  { fontSize: 11, color: C.textSub,  marginTop: 1 },
  rowCount: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
});
