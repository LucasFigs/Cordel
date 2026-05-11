import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  ScrollView, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTime } from '../types';
import { C, MONTHS, HOURS, MINUTES, pad, getDaysInMonth, getNow } from '../constants';

type Props = {
  visible: boolean;
  value: DateTime;
  onChange: (dt: DateTime) => void;
  onClose: () => void;
};

export default function DateTimePickerModal({ visible, value, onChange, onClose }: Props) {
  const [draft, setDraft] = useState<DateTime>(value);
  const today = getNow();

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible]);

  const daysInMonth = getDaysInMonth(draft.month, draft.year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () =>
    setDraft((d) => {
      let m = d.month - 1, y = d.year;
      if (m < 1) { m = 12; y--; }
      return { ...d, month: m, year: y, day: Math.min(d.day, getDaysInMonth(m, y)) };
    });

  const nextMonth = () =>
    setDraft((d) => {
      let m = d.month + 1, y = d.year;
      if (m > 12) { m = 1; y++; }
      return { ...d, month: m, year: y, day: Math.min(d.day, getDaysInMonth(m, y)) };
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.cancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={s.title}>Data e hora</Text>
            <TouchableOpacity onPress={() => { onChange(draft); onClose(); }}>
              <Text style={s.confirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Month nav */}
          <View style={s.monthNav}>
            <TouchableOpacity style={s.navArrow} onPress={prevMonth}>
              <Ionicons name="chevron-back" size={18} color={C.primary} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[draft.month - 1]} {draft.year}</Text>
            <TouchableOpacity style={s.navArrow} onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>

          {/* Day grid */}
          <View style={s.dayGrid}>
            {days.map((d) => {
              const isToday = d === today.day && draft.month === today.month && draft.year === today.year;
              const sel = d === draft.day;
              return (
                <TouchableOpacity
                  key={d}
                  style={[s.dayCell, sel && s.dayCellSel, isToday && !sel && s.dayCellToday]}
                  onPress={() => setDraft((v) => ({ ...v, day: d }))}
                >
                  <Text style={[s.dayText, sel && s.dayTextSel, isToday && !sel && { color: C.primary }]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.divider} />

          {/* Time pickers */}
          <View style={s.timeRow}>
            <View style={s.timeCol}>
              <Text style={s.timeLabel}>Hora</Text>
              <ScrollView style={s.timeScroll} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[s.timeItem, draft.hour === h && s.timeItemSel]}
                    onPress={() => setDraft((v) => ({ ...v, hour: h }))}
                  >
                    <Text style={[s.timeItemText, draft.hour === h && s.timeItemTextSel]}>
                      {pad(h)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={s.timeSep}>:</Text>
            <View style={s.timeCol}>
              <Text style={s.timeLabel}>Min</Text>
              <ScrollView style={s.timeScroll} showsVerticalScrollIndicator={false}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[s.timeItem, draft.minute === m && s.timeItemSel]}
                    onPress={() => setDraft((v) => ({ ...v, minute: m }))}
                  >
                    <Text style={[s.timeItemText, draft.minute === m && s.timeItemTextSel]}>
                      {pad(m)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000050', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  cancel: { fontSize: 15, color: C.textSub },
  confirm: { fontSize: 15, fontWeight: '700', color: C.primary },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  navArrow: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { fontSize: 15, fontWeight: '700', color: C.text },

  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 12 },
  dayCell: {
    width: '13%', margin: '0.4%', aspectRatio: 1,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  dayCellSel: { backgroundColor: C.primary },
  dayCellToday: { borderWidth: 1.5, borderColor: C.primary },
  dayText: { fontSize: 13, color: C.text, fontWeight: '500' },
  dayTextSel: { color: '#fff', fontWeight: '700' },

  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 20, marginBottom: 12 },

  timeRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 30, paddingTop: 4 },
  timeCol: { flex: 1 },
  timeLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
    textAlign: 'center', marginBottom: 6,
  },
  timeScroll: { height: 130 },
  timeItem: { paddingVertical: 7, marginBottom: 4, borderRadius: 10, alignItems: 'center' },
  timeItemSel: { backgroundColor: C.primary },
  timeItemText: { fontSize: 16, color: C.text, fontWeight: '500' },
  timeItemTextSel: { color: '#fff', fontWeight: '700' },
  timeSep: {
    fontSize: 22, fontWeight: '700', color: C.textMuted,
    marginTop: 44, marginHorizontal: 12,
  },
});
