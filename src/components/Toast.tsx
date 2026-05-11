import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToastState } from '../types';
import { C } from '../constants';

interface ToastProps {
  toast: ToastState;
}

const CONFIG = {
  success: { bg: C.success,  icon: 'checkmark-circle' as const, label: 'Sucesso'    },
  error:   { bg: C.error,    icon: 'alert-circle'     as const, label: 'Erro'        },
  loading: { bg: C.primary,  icon: null,                         label: 'Carregando' },
};

export function Toast({ toast }: ToastProps) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.spring(opacity,    { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast.visible]);

  if (!toast.visible && opacity.__getValue() === 0) return null;

  const cfg = CONFIG[toast.type];

  return (
    <Animated.View
      style={[t.wrap, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={[t.toast, { backgroundColor: cfg.bg }]}>
        {toast.type === 'loading' ? (
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
        ) : (
          <Ionicons name={cfg.icon!} size={20} color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text style={t.msg} numberOfLines={2}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const t = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 56 : 70,
    left: 20, right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: '100%',
  },
  msg: { fontSize: 14, fontWeight: '600', color: '#fff', flex: 1, lineHeight: 18 },
});
