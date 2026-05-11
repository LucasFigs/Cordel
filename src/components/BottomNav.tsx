import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTab } from '../types';
import { C } from '../constants';

interface BottomNavProps { active: MainTab; onPress: (tab: MainTab) => void; }

const TABS: { id: MainTab; label: string; icon: any; iconActive: any }[] = [
  { id: 'registrar', label: 'Registrar', icon: 'add-circle-outline', iconActive: 'add-circle' },
  { id: 'historico', label: 'Histórico', icon: 'list-outline',       iconActive: 'list'       },
  { id: 'perfil',    label: 'Perfil',    icon: 'person-outline',     iconActive: 'person'     },
];

export function BottomNav({ active, onPress }: BottomNavProps) {
  return (
    <View style={n.bar}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        const isCenter = tab.id === 'registrar';
        return (
          <TouchableOpacity key={tab.id} style={n.item} onPress={() => onPress(tab.id)} activeOpacity={0.7}>
            {isCenter ? (
              <View style={[n.centerBtn, isActive && n.centerBtnActive]}>
                <Ionicons name={tab.iconActive} size={28} color="#fff" />
              </View>
            ) : (
              <>
                {isActive && <View style={n.indicator} />}
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={24}
                  color={isActive ? C.primary : C.textMuted}
                />
              </>
            )}
            <Text style={[n.label, isActive && !isCenter && { color: C.primary, fontWeight: '700' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const n = StyleSheet.create({
  bar:           { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 24 : 10, paddingTop: 8, alignItems: 'flex-end' },
  item:          { flex: 1, alignItems: 'center', gap: 3 },
  label:         { fontSize: 10, color: C.textMuted, fontWeight: '600' },
  indicator:     { position: 'absolute', top: -8, width: 28, height: 3, backgroundColor: C.primary, borderRadius: 2 },
  centerBtn:     { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  centerBtnActive: { backgroundColor: C.primaryDark },
});
