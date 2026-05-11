import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, AuthProvider } from '../types';
import { C, makeInitials } from '../constants';
import { auth } from '../styles';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface RegisterScreenProps {
  onRegister: (profile: UserProfile) => void;
  onBack:     () => void;
}

async function fakeOAuthRegister(provider: AuthProvider): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, 1400));
  if (provider === 'google') {
    return {
      id: `google-${Date.now()}`, firstName: 'Usuário', lastName: 'Google',
      email: 'usuario@gmail.com', role: 'visitante',
      initials: 'UG', provider: 'google',
    };
  }
  return {
    id: `fb-${Date.now()}`, firstName: 'Usuário', lastName: 'Facebook',
    email: 'usuario@facebook.com', role: 'visitante',
    initials: 'UF', provider: 'facebook',
  };
}

async function fakeEmailRegister(
  firstName: string, lastName: string, email: string, _password: string,
): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, 1200));
  if (Math.random() < 0.05) throw new Error('Falha ao criar conta. Tente novamente.');
  return {
    id: `user-${Date.now()}`, firstName, lastName, email,
    role: 'visitante', initials: makeInitials(firstName, lastName), provider: 'email',
    bio: '', address: '', phone: '',
  };
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
  const { toast, showLoading, showError, showSuccess, hide } = useToast();

  function touch(f: string) { setTouched(p => ({ ...p, [f]: true })); }

  const firstNameOk = firstName.trim().length >= 2;
  const lastNameOk  = lastName.trim().length >= 2;
  const emailOk     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordOk  = password.length >= 6;
  const confirmOk   = confirm === password && confirm.length > 0;
  const isValid     = firstNameOk && lastNameOk && emailOk && passwordOk && confirmOk;

  const handleEmailRegister = async () => {
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    setLoading(true);
    showLoading('Criando conta…');
    try {
      const profile = await fakeEmailRegister(firstName.trim(), lastName.trim(), email.trim(), password);
      hide();
      setDone(true);
      setTimeout(() => onRegister(profile), 1200);
    } catch (e: any) {
      showError(e?.message ?? 'Falha ao criar conta. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: AuthProvider) => {
    setLoading(true);
    showLoading(provider === 'google' ? 'Conectando com Google…' : 'Conectando com Facebook…');
    try {
      const profile = await fakeOAuthRegister(provider);
      hide();
      onRegister(profile);
    } catch {
      showError('Falha ao conectar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ───────────────────────────────────────────────────
  if (done) {
    return (
      <View style={auth.successRoot}>
        <Toast toast={toast} />
        <View style={auth.successIcon}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
        <Text style={auth.successTitle}>Conta criada!</Text>
        <Text style={auth.successSub}>
          Bem-vindo(a) ao Cordel,{'\n'}{firstName}! Redirecionando…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={auth.root}>
        <View style={auth.topBand} />
        <Toast toast={toast} />

        <View style={auth.header}>
          <TouchableOpacity style={auth.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={auth.headerTitle}>Criar conta</Text>
          </View>
          <View style={auth.headerBadge}>
            <Text style={auth.headerBadgeText}>Gratuito</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={auth.miniLogo}>
            <View style={auth.miniLogoCircle}>
              <Ionicons name="book-outline" size={22} color="#fff" />
            </View>
            <Text style={auth.miniLogoText}>Cordel</Text>
            <Text style={auth.miniLogoSlug}>Registre sua história</Text>
          </View>

          <View style={auth.card}>
            <Text style={auth.cardTitle}>Seus dados</Text>
            <Text style={auth.cardSub}>Crie sua conta gratuitamente.</Text>

            {/* Botões sociais */}
            <View style={auth.socialRow}>
              <TouchableOpacity
                style={auth.socialBtn}
                onPress={() => handleSocialRegister('google')}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color={C.google} />
                <Text style={auth.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={auth.socialBtn}
                onPress={() => handleSocialRegister('facebook')}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={20} color={C.facebook} />
                <Text style={auth.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={auth.dividerRow}>
              <View style={auth.dividerLine} />
              <Text style={auth.dividerText}>ou use e-mail</Text>
              <View style={auth.dividerLine} />
            </View>

            {/* Nome + Sobrenome */}
            <View style={auth.row2}>
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

            {password.length > 0 && <StrengthMeter password={password} />}

            <Field label="Confirmar senha" req icon="lock-closed-outline" placeholder="Repita a senha"
              value={confirm} secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowConfirm(p => !p)}
              onChangeText={v => { setConfirm(v); touch('confirm'); }}
              error={touched.confirm && !confirmOk ? 'As senhas não coincidem' : undefined} />

            {Object.keys(touched).length > 0 && !isValid && (
              <View style={auth.warnBanner}>
                <Ionicons name="warning-outline" size={16} color="#92400E" />
                <Text style={auth.warnText}>Preencha todos os campos corretamente.</Text>
              </View>
            )}

            <TouchableOpacity
              style={[auth.submitBtn, (!isValid || loading) && auth.submitBtnDisabled]}
              onPress={handleEmailRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={isValid ? '#fff' : C.textMuted} />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color={isValid ? '#fff' : C.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[auth.submitText, !isValid && { color: C.textMuted }]}>Criar Conta</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={auth.bottomRow}>
            <Text style={auth.bottomText}>Já tem conta? </Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={auth.bottomLink}>Fazer login</Text>
            </TouchableOpacity>
          </View>
          <Text style={auth.version}>Cordel · v1.0.0</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────
function Field({ label, req, icon, placeholder, value, onChangeText, error,
  secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightIcon }: {
  label: string; req?: boolean; icon: any; placeholder: string; value: string;
  onChangeText: (v: string) => void; error?: string; secureTextEntry?: boolean;
  keyboardType?: any; autoCapitalize?: any; rightIcon?: any; onRightIcon?: () => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={auth.label}>{label}{req && <Text style={auth.req}> *</Text>}</Text>
      <View style={[auth.inputWrap, !!error && auth.inputErr]}>
        <Ionicons name={icon} size={18} color={C.textMuted} style={auth.inputIcon} />
        <TextInput
          style={auth.input} placeholder={placeholder} placeholderTextColor={C.textMuted}
          value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry}
          keyboardType={keyboardType} autoCapitalize={autoCapitalize ?? 'words'} autoCorrect={false}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIcon} style={auth.eyeBtn}>
            <Ionicons name={rightIcon} size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={auth.errorRow}>
          <Ionicons name="alert-circle" size={13} color={C.error} />
          <Text style={auth.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 6 caracteres', ok: password.length >= 6 },
    { label: 'Letra maiúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Número',               ok: /\d/.test(password) },
    { label: 'Caractere especial',   ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score  = checks.filter(c => c.ok).length;
  const colors = ['#E11D48','#E11D48','#F59E0B','#F59E0B', C.success];
  const labels = ['','Fraca','Fraca','Média','Forte'];
  return (
    <View style={auth.strengthWrap}>
      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[auth.strengthBar, { backgroundColor: i < score ? colors[score] : C.border }]} />
        ))}
        <Text style={[auth.strengthLabel, { color: colors[score] }]}>{labels[score]}</Text>
      </View>
      <View style={{ gap: 4 }}>
        {checks.map(c => (
          <View key={c.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={c.ok ? 'checkmark-circle' : 'ellipse-outline'} size={13} color={c.ok ? C.success : C.textMuted} />
            <Text style={{ fontSize: 12, color: c.ok ? C.success : C.textMuted }}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
