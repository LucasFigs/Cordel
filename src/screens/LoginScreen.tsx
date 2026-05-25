import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { makeInitials } from '../constants';
import { auth, db } from '../firebase/config';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

const PRIMARY      = '#2563EB';
const PRIMARY_LIGHT= '#EEF3FF';
const TEXT         = '#111827';
const TEXT_SUB     = '#6B7280';
const TEXT_MUTED   = '#A0AAB4';
const ERROR        = '#E11D48';
const BORDER       = '#E8ECF2';
const CARD         = '#FFFFFF';
const BG           = '#F7F8FA';

interface LoginScreenProps {
  onLogin:    (profile: UserProfile) => void;
  onRegister: () => void;
}

async function getOrCreateProfile(user: any, role: 'visitante' | 'admin' = 'visitante'): Promise<UserProfile> {
  const snap = await db.collection('users').doc(user.uid).get();
  if (snap.exists) return snap.data() as UserProfile;
  const displayName = user.displayName ?? '';
  const parts       = displayName.split(' ');
  const firstName   = parts[0] ?? 'Usuário';
  const lastName    = parts.slice(1).join(' ') || 'Cordel';
  const profile: UserProfile = {
    id: user.uid, firstName, lastName, email: user.email ?? '',
    role, initials: makeInitials(firstName, lastName),
    provider: 'email', bio: '', address: '', phone: '',
  };
  await db.collection('users').doc(user.uid).set(profile);
  return profile;
}

type UserType = 'visitante' | 'admin';

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [userType, setUserType] = useState<UserType>('visitante');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState<Record<string, boolean>>({});
  const [loading,  setLoading]  = useState(false);
  const { toast, showLoading, showError, hide } = useToast();

  const emailOk    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordOk = password.length >= 6;
  const isValid    = emailOk && passwordOk;

  function touch(f: string) { setTouched(p => ({ ...p, [f]: true })); }

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setLoading(true);
    showLoading('Entrando…');
    try {
      const { user } = await auth.signInWithEmailAndPassword(email.trim(), password);
      // Pega o perfil salvo mas respeita o tipo selecionado
      const snap = await db.collection('users').doc(user.uid).get();
      let profile: UserProfile;
      if (snap.exists) {
        profile = { ...snap.data() as UserProfile, role: userType };
        // Atualiza role no Firestore
        await db.collection('users').doc(user.uid).set({ role: userType }, { merge: true });
      } else {
        profile = await getOrCreateProfile(user, userType);
      }
      hide();
      onLogin(profile);
    } catch (e: any) {
      const msg =
        e?.code === 'auth/user-not-found' || e?.code === 'auth/wrong-password'
          ? 'E-mail ou senha incorretos.'
          : e?.code === 'auth/network-request-failed'
          ? 'Falha de conexão. Verifique sua internet.'
          : 'Falha ao entrar. Tente novamente.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        <View style={s.topBand} />
        <Toast toast={toast} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Branding */}
          <View style={s.brandWrap}>
            <View style={s.logoCircle}>
              <Ionicons name="book-outline" size={38} color="#fff" />
            </View>
            <Text style={s.appName}>Cordel</Text>
            <Text style={s.appSlug}>Registre sua história</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Entrar na conta</Text>
            <Text style={s.cardSub}>Selecione seu perfil e faça login</Text>

            {/* Seletor Usuário | Admin */}
            <View style={s.toggleRow}>
              <TouchableOpacity
                style={[s.toggleBtn, userType === 'visitante' && s.toggleBtnActive]}
                onPress={() => setUserType('visitante')}
                activeOpacity={0.8}
              >
                <Ionicons name="person-outline" size={16} color={userType === 'visitante' ? '#fff' : TEXT_MUTED} />
                <Text style={[s.toggleText, userType === 'visitante' && s.toggleTextActive]}>Usuário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.toggleBtn, userType === 'admin' && s.toggleBtnActiveAdmin]}
                onPress={() => setUserType('admin')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={userType === 'admin' ? '#fff' : TEXT_MUTED} />
                <Text style={[s.toggleText, userType === 'admin' && s.toggleTextActive]}>Admin</Text>
              </TouchableOpacity>
            </View>

            {/* Badge de perfil selecionado */}
            <View style={[s.profileBadge, userType === 'admin' && { backgroundColor: '#F3F0FF', borderColor: '#C4B5FD' }]}>
              <Ionicons
                name={userType === 'admin' ? 'shield-checkmark-outline' : 'person-circle-outline'}
                size={14}
                color={userType === 'admin' ? '#7C3AED' : PRIMARY}
              />
              <Text style={[s.profileBadgeText, userType === 'admin' && { color: '#7C3AED' }]}>
                {userType === 'admin' ? 'Entrando como Administrador' : 'Entrando como Visitante'}
              </Text>
            </View>

            {/* E-mail */}
            <Text style={s.label}>E-mail <Text style={s.req}>*</Text></Text>
            <View style={[s.inputWrap, touched.email && !emailOk && s.inputErr]}>
              <Ionicons name="mail-outline" size={18} color={TEXT_MUTED} style={s.inputIcon} />
              <TextInput
                style={s.input} placeholder="seu@email.com" placeholderTextColor={TEXT_MUTED}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                value={email} onChangeText={v => { setEmail(v); touch('email'); }}
              />
            </View>
            {touched.email && !emailOk && (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle" size={13} color={ERROR} />
                <Text style={s.errorText}>Informe um e-mail válido</Text>
              </View>
            )}

            {/* Senha */}
            <Text style={[s.label, { marginTop: 14 }]}>Senha <Text style={s.req}>*</Text></Text>
            <View style={[s.inputWrap, touched.password && !passwordOk && s.inputErr]}>
              <Ionicons name="lock-closed-outline" size={18} color={TEXT_MUTED} style={s.inputIcon} />
              <TextInput
                style={s.input} placeholder="Mínimo 6 caracteres" placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPass} value={password}
                onChangeText={v => { setPassword(v); touch('password'); }}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={s.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
            {touched.password && !passwordOk && (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle" size={13} color={ERROR} />
                <Text style={s.errorText}>Mínimo 6 caracteres</Text>
              </View>
            )}

            <TouchableOpacity style={s.forgotBtn} activeOpacity={0.7}>
              <Text style={s.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.submitBtn, userType === 'admin' && s.submitBtnAdmin, (!isValid || loading) && s.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator size="small" color={isValid ? '#fff' : TEXT_MUTED} />
                : <>
                    <Ionicons
                      name={userType === 'admin' ? 'shield-checkmark-outline' : 'log-in-outline'}
                      size={18} color={isValid ? '#fff' : TEXT_MUTED} style={{ marginRight: 8 }}
                    />
                    <Text style={[s.submitText, !isValid && { color: TEXT_MUTED }]}>
                      Entrar como {userType === 'admin' ? 'Admin' : 'Usuário'}
                    </Text>
                  </>
              }
            </TouchableOpacity>
          </View>

          <View style={s.bottomRow}>
            <Text style={s.bottomText}>Não tem conta? </Text>
            <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
              <Text style={s.bottomLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.version}>Cordel · v1.0.0</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  topBand:     { position: 'absolute', top: 0, left: 0, right: 0, height: 280, backgroundColor: PRIMARY, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, opacity: 0.07 },
  scroll:      { flexGrow: 1, paddingTop: Platform.OS === 'android' ? 60 : 76, paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  brandWrap:   { alignItems: 'center', marginBottom: 32 },
  logoCircle:  { width: 86, height: 86, borderRadius: 43, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  appName:     { fontSize: 34, fontWeight: '800', color: TEXT, letterSpacing: -0.5 },
  appSlug:     { fontSize: 14, color: TEXT_SUB, marginTop: 5, fontStyle: 'italic' },
  card:        { width: '100%', backgroundColor: CARD, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4, marginBottom: 24 },
  cardTitle:   { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 4 },
  cardSub:     { fontSize: 13, color: TEXT_SUB, marginBottom: 20 },
  toggleRow:   { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4, marginBottom: 14, gap: 4 },
  toggleBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  toggleBtnActive:      { backgroundColor: PRIMARY, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  toggleBtnActiveAdmin: { backgroundColor: '#7C3AED', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  toggleText:      { fontSize: 14, fontWeight: '600', color: TEXT_MUTED },
  toggleTextActive:{ color: '#fff', fontWeight: '700' },
  profileBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY_LIGHT, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  profileBadgeText:{ fontSize: 12, color: PRIMARY, fontWeight: '600' },
  label:       { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  req:         { color: ERROR },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 11 },
  inputErr:    { borderColor: ERROR },
  inputIcon:   { marginRight: 10 },
  input:       { flex: 1, fontSize: 14, color: TEXT, padding: 0 },
  eyeBtn:      { padding: 4 },
  errorRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  errorText:   { fontSize: 12, color: ERROR, fontWeight: '500' },
  forgotBtn:   { alignSelf: 'flex-end', marginTop: 12, marginBottom: 22 },
  forgotText:  { fontSize: 13, fontWeight: '600', color: PRIMARY },
  submitBtn:   { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  submitBtnAdmin: { backgroundColor: '#7C3AED', shadowColor: '#7C3AED' },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: BORDER },
  submitText:  { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  bottomRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bottomText:  { fontSize: 14, color: TEXT_SUB },
  bottomLink:  { fontSize: 14, fontWeight: '700', color: PRIMARY },
  version:     { fontSize: 11, color: TEXT_MUTED },
});
