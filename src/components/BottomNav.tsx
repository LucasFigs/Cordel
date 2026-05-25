import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTab } from '../types';

const PRIMARY    = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const TEXT_MUTED = '#A0AAB4';
const CARD       = '#FFFFFF';
const BORDER     = '#E8ECF2';

interface BottomNavProps {
  active: MainTab;
  unreadCount?: number;
  onPress: (tab: MainTab) => void;
}

const TABS: { id: MainTab; label: string; icon: any; iconActive: any }[] = [
  { id: 'registrar', label: 'Registrar', icon: 'add-circle-outline',   iconActive: 'add-circle'    },
  { id: 'historico', label: 'Histórico', icon: 'list-outline',          iconActive: 'list'          },
  { id: 'avaliar',   label: 'Avaliar',   icon: 'star-outline',          iconActive: 'star'          },
  { id: 'alertas',   label: 'Alertas',   icon: 'notifications-outline', iconActive: 'notifications' },
  { id: 'perfil',    label: 'Perfil',    icon: 'person-outline',        iconActive: 'person'        },
];

export function BottomNav({ active, unreadCount = 0, onPress }: BottomNavProps) {
  return (
    <View style={n.bar}>
      {TABS.map(tab => {
        const isActive  = active === tab.id;
        const isCenter  = tab.id === 'registrar';
        const showBadge = tab.id === 'alertas' && unreadCount > 0;
        return (
          <TouchableOpacity key={tab.id} style={n.item} onPress={() => onPress(tab.id)} activeOpacity={0.7}>
            {isCenter ? (
              <View style={[n.centerBtn, isActive && n.centerBtnActive]}>
                <Ionicons name={tab.iconActive} size={26} color="#fff" />
              </View>
            ) : (
              <>
                {isActive && <View style={n.indicator} />}
                <View>
                  <Ionicons name={isActive ? tab.iconActive : tab.icon} size={24} color={isActive ? PRIMARY : TEXT_MUTED} />
                  {showBadge && (
                    <View style={n.badge}>
                      <Text style={n.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            <Text style={[n.label, isActive && !isCenter && n.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const n = StyleSheet.create({
  bar:             { flexDirection: 'row', backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER, paddingBottom: Platform.OS === 'ios' ? 24 : 10, paddingTop: 8, alignItems: 'flex-end' },
  item:            { flex: 1, alignItems: 'center', gap: 3 },
  label:           { fontSize: 10, color: TEXT_MUTED, fontWeight: '600' },
  labelActive:     { color: PRIMARY, fontWeight: '700' },
  indicator:       { position: 'absolute', top: -8, width: 28, height: 3, backgroundColor: PRIMARY, borderRadius: 2 },
  centerBtn:       { width: 50, height: 50, borderRadius: 25, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 2, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  centerBtnActive: { backgroundColor: PRIMARY_DARK },
  badge:           { position: 'absolute', top: -4, right: -6, backgroundColor: '#E11D48', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:       { fontSize: 9, fontWeight: '800', color: '#fff' },
});
