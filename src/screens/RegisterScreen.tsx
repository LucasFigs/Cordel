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

interface RegisterScreenProps {
  onRegister: (profile: UserProfile) => void;
  onBack:     () => void;
}

export function RegisterScreen({ onRegister, onBack }: RegisterScreenProps) {
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const { toast, showLoading, showError, hide } = useToast();

  function touch(f: string) { setTouched(p => ({ ...p, [f]: true })); }

  const firstNameOk = firstName.trim().length >= 2;
  const lastNameOk  = lastName.trim().length >= 2;
  const emailOk     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordOk  = password.length >= 6;
  const confirmOk   = confirm === password && confirm.length > 0;
  const isValid     = firstNameOk && lastNameOk && emailOk && passwordOk && confirmOk;

  const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    setLoading(true);
    showLoading('Criando conta…');
    try {
      const { user } = await auth.createUserWithEmailAndPassword(email.trim(), password);
      await user!.updateProfile({ displayName: `${firstName.trim()} ${lastName.trim()}` });

      const profile: UserProfile = {
        id:        user!.uid,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        role:      'visitante',
        initials:  makeInitials(firstName.trim(), lastName.trim()),
        provider:  'email',
        bio: '', address: '', phone: '',
      };

      await db.collection('users').doc(user!.uid).set(profile);
      hide();
      setDone(true);
      setTimeout(() => onRegister(profile), 1200);
    } catch (e: any) {
      const msg =
        e?.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : e?.code === 'auth/network-request-failed'
          ? 'Falha de conexão. Verifique sua internet.'
          : 'Falha ao criar conta. Tente novamente.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={s.successRoot}>
        <Toast toast={toast} />
        <View style={s.successIcon}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
        <Text style={s.successTitle}>Conta criada!</Text>
        <Text style={s.successSub}>Bem-vindo(a) ao Cordel,{'\n'}{firstName}!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        <View style={s.topBand} />
        <Toast toast={toast} />

        {/* Header com voltar */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.headerTitle}>Criar conta</Text>
          </View>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeText}>Gratuito</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mini logo */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={s.miniLogoCircle}>
              <Ionicons name="book-outline" size={22} color="#fff" />
            </View>
            <Text style={s.miniLogoText}>Cordel</Text>
            <Text style={s.miniLogoSlug}>Registre sua história</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Seus dados</Text>
            <Text style={s.cardSub}>Crie sua conta gratuitamente.</Text>

            {/* Nome + Sobrenome */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="Nome" req icon="person-outline" placeholder="Seu nome"
                  value={firstName} onChangeText={v => { setFirstName(v); touch('name'); }}
                  error={touched.name && !firstNameOk ? 'Mínimo 2 caracteres' : undefined} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Sobrenome" req icon="person-outline" placeholder="Sobrenome"
                  value={lastName} onChangeText={v => { setLastName(v); touch('name'); }}
                  error={touched.name && !lastNameOk ? 'Mínimo 2 caracteres' : undefined} />
              </View>
            </View>

            <Field label="E-mail" req icon="mail-outline" placeholder="seu@email.com"
              value={email} keyboardType="email-address" autoCapitalize="none"
              onChangeText={v => { setEmail(v); touch('email'); }}
              error={touched.email && !emailOk ? 'Informe um e-mail válido' : undefined} />

            <Field label="Senha" req icon="lock-closed-outline" placeholder="Mínimo 6 caracteres"
              value={password} secureTextEntry={!showPass}
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowPass(p => !p)}
              onChangeText={v => { setPassword(v); touch('password'); }}
              error={touched.password && !passwordOk ? 'Mínimo 6 caracteres' : undefined} />

            <Field label="Confirmar senha" req icon="lock-closed-outline" placeholder="Repita a senha"
              value={confirm} secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowConfirm(p => !p)}
              onChangeText={v => { setConfirm(v); touch('confirm'); }}
              error={touched.confirm && !confirmOk ? 'As senhas não coincidem' : undefined} />

            {Object.keys(touched).length > 0 && !isValid && (
              <View style={s.warnBanner}>
                <Ionicons name="warning-outline" size={16} color="#92400E" />
                <Text style={s.warnText}>Preencha todos os campos corretamente.</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.submitBtn, (!isValid || loading) && s.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator size="small" color={isValid ? '#fff' : '#A0AAB4'} />
                : <>
                    <Ionicons name="person-add-outline" size={18} color={isValid ? '#fff' : '#A0AAB4'} style={{ marginRight: 8 }} />
                    <Text style={[s.submitText, !isValid && { color: '#A0AAB4' }]}>Criar Conta</Text>
                  </>
              }
            </TouchableOpacity>
          </View>

          <View style={s.bottomRow}>
            <Text style={s.bottomText}>Já tem conta? </Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={s.bottomLink}>Fazer login</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.version}>Cordel · v1.0.0</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, req, icon, placeholder, value, onChangeText, error,
  secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightIcon }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}{req && <Text style={s.req}> *</Text>}</Text>
      <View style={[s.inputWrap, !!error && s.inputErr]}>
        <Ionicons name={icon} size={18} color="#A0AAB4" style={s.inputIcon} />
        <TextInput
          style={s.input} placeholder={placeholder} placeholderTextColor="#A0AAB4"
          value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry}
          keyboardType={keyboardType} autoCapitalize={autoCapitalize ?? 'words'} autoCorrect={false}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIcon} style={s.eyeBtn}>
            <Ionicons name={rightIcon} size={18} color="#A0AAB4" />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={s.errorRow}>
          <Ionicons name="alert-circle" size={13} color="#E11D48" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#F7F8FA' },
  topBand:      { position: 'absolute', top: 0, left: 0, right: 0, height: 280, backgroundColor: '#2563EB', borderBottomLeftRadius: 48, borderBottomRightRadius: 48, opacity: 0.07 },
  header:       { paddingTop: Platform.OS === 'android' ? 44 : 58, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  backBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8ECF2' },
  headerTitle:  { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerBadge:  { backgroundColor: '#EEF3FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  miniLogoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniLogoText:   { fontSize: 20, fontWeight: '800', color: '#111827' },
  miniLogoSlug:   { fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginTop: 2 },
  card:         { backgroundColor: '#fff', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#E8ECF2', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, marginBottom: 20 },
  cardTitle:    { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardSub:      { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  label:        { fontSize: 11, fontWeight: '700', color: '#A0AAB4', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  req:          { color: '#E11D48' },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 10 },
  inputErr:     { borderColor: '#E11D48' },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, fontSize: 14, color: '#111827', padding: 0 },
  eyeBtn:       { padding: 4 },
  errorRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  errorText:    { fontSize: 12, color: '#E11D48', fontWeight: '500' },
  warnBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  warnText:     { fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 },
  submitBtn:    { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  submitBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: '#E8ECF2' },
  submitText:   { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  bottomRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bottomText:   { fontSize: 14, color: '#6B7280' },
  bottomLink:   { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  version:      { textAlign: 'center', fontSize: 11, color: '#A0AAB4' },
  successRoot:  { flex: 1, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon:  { width: 92, height: 92, borderRadius: 46, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 6, borderColor: '#ECFDF5', shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
  successSub:   { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 23 },
});
